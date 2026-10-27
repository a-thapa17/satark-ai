import { getRegistrableDomain } from "./domain.ts";
import { getDemoUrlReport } from "./demo.ts";
import { BlockedUrlError } from "./errors.ts";
import {
  collectUrlWarnings,
  hasHighConfidenceWarning,
  scoreWarnings,
} from "./heuristics.ts";
import { isIpLiteral } from "./ip.ts";
import { lookupRdapDomain } from "./rdap.ts";
import {
  getHopTimeout,
  getRedirectLimit,
  getTotalTimeout,
  traceRedirects,
  type HopRequester,
  type TraceResult,
} from "./safe-request.ts";
import { checkGoogleSafeBrowsing, checkUrlhaus } from "./threats.ts";
import type {
  RdapDomainInfo,
  ThreatCheckResult,
  UrlAnalysisReport,
  UrlVerdict,
  UrlWarning,
} from "./types.ts";
import {
  normalizeUrlInput,
  type LookupFn,
  type NormalizedUrl,
} from "./validation.ts";

export interface UrlAnalysisDependencies {
  lookup?: LookupFn;
  request?: HopRequester;
  safeBrowsing?: (urls: string[]) => Promise<ThreatCheckResult>;
  urlhaus?: (url: string) => Promise<ThreatCheckResult>;
  rdap?: (domain: string) => Promise<RdapDomainInfo>;
  now?: () => Date;
  maxRedirects?: number;
  hopTimeoutMs?: number;
  totalTimeoutMs?: number;
  demoMode?: boolean;
}

function envInt(name: string): number | undefined {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) ? value : undefined;
}

function traceWarning(trace: TraceResult): UrlWarning | undefined {
  if (!trace.error || trace.error.code === "REDIRECT_ERROR") return undefined;

  if (trace.error.code === "DNS_LOOKUP_FAILED") {
    return {
      id: "DNS_LOOKUP_FAILED",
      severity: "MEDIUM",
      label: "Hostname could not be resolved",
      explanation:
        "DNS resolution failed, so the live redirect and response could not be checked. The domain may be new, mistyped, blocked, or temporarily unavailable.",
    };
  }
  if (trace.error.code === "REQUEST_TIMEOUT") {
    return {
      id: "REQUEST_TIMEOUT",
      severity: "MEDIUM",
      label: "Website did not respond before the timeout",
      explanation:
        "The server did not respond within the configured time budget. The available threat-service results may not describe the final destination.",
    };
  }
  return {
    id: "NETWORK_UNAVAILABLE",
    severity: "MEDIUM",
    label: "Website could not be reached",
    explanation:
      "A network error prevented the redirect chain from being completed. Treat an unreachable destination as unverified rather than safe.",
  };
}

async function safeRunThreatCheck(
  service: "Google Safe Browsing" | "URLhaus",
  urls: string[],
  operation: () => Promise<ThreatCheckResult>
): Promise<ThreatCheckResult> {
  try {
    return await operation();
  } catch {
    return {
      service,
      status: "error",
      message: `${service} could not complete the check. No threat conclusion is available from this service.`,
      matches: [],
      checkedUrls: urls,
    };
  }
}

async function safeRunRdap(
  domain: string,
  operation: () => Promise<RdapDomainInfo>
): Promise<RdapDomainInfo> {
  try {
    return await operation();
  } catch {
    return {
      status: "error",
      domain,
      registryStatuses: [],
      message: "RDAP registration data could not be retrieved.",
    };
  }
}

function collectCheckedUrls(initial: NormalizedUrl, trace: TraceResult): string[] {
  const urls = [
    initial.normalizedUrl,
    ...trace.hops
      .filter((hop) => hop.status !== null && /^https?:\/\//i.test(hop.url))
      .map((hop) => hop.url),
    trace.finalUrl,
  ].filter((url) => /^https?:\/\//i.test(url));

  return Array.from(new Set(urls)).slice(0, 10);
}

function getVerdict(
  trace: TraceResult,
  warnings: UrlWarning[],
  safeBrowsing: ThreatCheckResult,
  urlhaus: ThreatCheckResult
): UrlVerdict {
  if (safeBrowsing.status === "threat" || urlhaus.status === "threat") {
    return "MALICIOUS";
  }
  if (
    trace.blocked ||
    trace.truncated ||
    trace.error?.code === "REDIRECT_ERROR" ||
    hasHighConfidenceWarning(warnings)
  ) {
    return "SUSPICIOUS";
  }
  if (trace.error) {
    return "INCONCLUSIVE";
  }

  const usableChecks = [safeBrowsing, urlhaus].filter(
    (check) => check.status === "clean"
  );
  return usableChecks.length > 0 ? "NO_KNOWN_THREAT" : "INCONCLUSIVE";
}

function buildSummary(
  verdict: UrlVerdict,
  trace: TraceResult,
  safeBrowsing: ThreatCheckResult,
  urlhaus: ThreatCheckResult
): string {
  if (verdict === "MALICIOUS") {
    return "At least one threat-intelligence service returned a confirmed match for this URL. Do not open it or enter any information.";
  }
  if (verdict === "SUSPICIOUS") {
    return "Suspicious URL or redirect indicators were found. This is not proof of malicious activity, but it is not safe to treat the destination as trusted.";
  }
  if (verdict === "NO_KNOWN_THREAT") {
    const checked = [safeBrowsing, urlhaus]
      .filter((check) => check.status === "clean")
      .map((check) => check.service)
      .join(" and ");
    return `No known threat was reported by ${checked || "the available checks"}. This is point-in-time information, not a guarantee that the site is safe.`;
  }
  if (trace.blocked) {
    return "Analysis was stopped because a redirect targeted an internal or reserved network address. The destination is untrusted.";
  }
  if (trace.truncated) {
    return "The redirect chain exceeded the configured limit, so the final destination could not be verified.";
  }
  return "The available checks were unavailable, incomplete, or the site could not be reached. No reliable safety conclusion can be made.";
}

function buildNextSteps(
  verdict: UrlVerdict,
  trace: TraceResult,
  warnings: UrlWarning[],
  safeBrowsing: ThreatCheckResult,
  urlhaus: ThreatCheckResult
): string[] {
  const steps: string[] = [];

  if (verdict === "MALICIOUS") {
    steps.push("Do not open the URL, download files, or enter credentials or payment details.");
    steps.push("If you already opened it, run a security scan and change any credentials that may have been exposed.");
    steps.push("Report the URL at cybercrime.gov.in. If money was transferred, call 1930 immediately.");
  } else if (verdict === "SUSPICIOUS") {
    steps.push("Do not enter passwords, OTPs, card details, or UPI PINs on this destination.");
    steps.push("Type the organization's official domain yourself or use its verified mobile app instead of following this link.");
    steps.push("If a redirect was blocked or the chain was truncated, do not try to bypass the protection.");
    steps.push("If you already shared financial information, call 1930 and contact your bank.");
  } else if (verdict === "NO_KNOWN_THREAT") {
    steps.push("A no-match result is not a guarantee. Verify the domain through an official app or phone number.");
    steps.push("Do not share OTPs, PINs, passwords, or card details because a website asks you to.");
    steps.push("Be cautious with unsolicited links even when a threat service reports no match.");
  } else {
    steps.push("Treat this destination as unverified. Do not enter credentials or payment details.");
    steps.push("Retry later or verify the address through the organization's official app or published helpline.");
    steps.push("Use a trusted, independently typed domain instead of the submitted link.");
  }

  if (trace.blocked) {
    steps.push("The private/internal redirect was blocked by SSRF protection; never attempt to access it through another tool.");
  }
  if (warnings.some((item) => item.id === "BRAND_LOOKALIKE")) {
    steps.push("The domain imitates a financial brand. Confirm the official address before taking any action.");
  }
  if (warnings.some((item) => item.id === "DOMAIN_VERY_NEW" || item.id === "DOMAIN_RECENT")) {
    steps.push("The domain is recently registered. Be especially cautious with new domains asking for money or credentials.");
  }
  if (safeBrowsing.status === "unavailable" || safeBrowsing.status === "not_configured") {
    steps.push("Google Safe Browsing was not available for this scan; absence of a match is not a clean result.");
  }
  if (urlhaus.status === "unavailable" || urlhaus.status === "not_configured") {
    steps.push("URLhaus was not available for this scan; absence of a record is not a clean result.");
  }

  return Array.from(new Set(steps)).slice(0, 7);
}

function finalDomainForRdap(trace: TraceResult, initial: NormalizedUrl): string {
  try {
    const final = new URL(trace.finalUrl);
    const hostname = final.hostname.replace(/^\[/, "").replace(/\]$/, "").replace(/\.$/, "");
    return isIpLiteral(hostname) ? "" : getRegistrableDomain(hostname);
  } catch {
    return initial.registrableDomain;
  }
}

export async function analyzeUrl(
  input: string,
  dependencies: UrlAnalysisDependencies = {}
): Promise<UrlAnalysisReport> {
  const initial = normalizeUrlInput(input);
  const now = dependencies.now?.() ?? new Date();
  const demoEnabled =
    dependencies.demoMode ?? process.env.PHASE2_DEMO_MODE?.toLowerCase() === "true";

  if (demoEnabled) {
    const demo = getDemoUrlReport(initial.normalizedUrl);
    if (demo) {
      return { ...demo, analyzedAt: now.toISOString() };
    }
  }

  const trace = await traceRedirects(initial, {
    maxRedirects:
      dependencies.maxRedirects ??
      getRedirectLimit(envInt("URL_ANALYSIS_MAX_REDIRECTS")),
    hopTimeoutMs:
      dependencies.hopTimeoutMs ??
      getHopTimeout(envInt("URL_ANALYSIS_HOP_TIMEOUT_MS")),
    totalTimeoutMs:
      dependencies.totalTimeoutMs ??
      getTotalTimeout(envInt("URL_ANALYSIS_TOTAL_TIMEOUT_MS")),
    lookup: dependencies.lookup,
    request: dependencies.request,
  });

  // A direct request to a private/internal destination is rejected at the API
  // boundary. A blocked destination discovered later in a redirect chain is
  // returned as part of the report so the user can see where it was stopped.
  if (trace.blocked && trace.redirectCount === 0 && trace.hops.length === 1) {
    throw new BlockedUrlError(trace.blocked.reason);
  }

  const checkedUrls = collectCheckedUrls(initial, trace);
  const safeBrowsingOperation = dependencies.safeBrowsing ?? checkGoogleSafeBrowsing;
  const urlhausOperation = dependencies.urlhaus ?? checkUrlhaus;
  const finalDomain = finalDomainForRdap(trace, initial);
  const rdapOperation =
    dependencies.rdap ??
    ((domain: string) => lookupRdapDomain(domain, { lookup: dependencies.lookup, now }));

  const [safeBrowsing, urlhaus, domain] = await Promise.all([
    safeRunThreatCheck("Google Safe Browsing", checkedUrls, () =>
      safeBrowsingOperation(checkedUrls)
    ),
    safeRunThreatCheck("URLhaus", [trace.finalUrl], () =>
      urlhausOperation(trace.finalUrl)
    ),
    finalDomain
      ? safeRunRdap(finalDomain, () => rdapOperation(finalDomain))
      : Promise.resolve<RdapDomainInfo>({
          status: "unavailable",
          domain: finalDomain || undefined,
          registryStatuses: [],
          message: "RDAP registration data is not available for IP-address destinations.",
        }),
  ]);

  const warnings = collectUrlWarnings(initial, trace, domain);
  const extraTraceWarning = traceWarning(trace);
  if (extraTraceWarning && !warnings.some((item) => item.id === extraTraceWarning.id)) {
    warnings.push(extraTraceWarning);
  }
  const score = scoreWarnings(warnings);
  const verdict = getVerdict(trace, warnings, safeBrowsing, urlhaus);

  return {
    verdict,
    score:
      verdict === "MALICIOUS"
        ? 100
        : verdict === "SUSPICIOUS"
          ? Math.max(30, score)
          : score,
    summary: buildSummary(verdict, trace, safeBrowsing, urlhaus),
    submittedUrl: input.trim(),
    normalizedUrl: initial.normalizedUrl,
    hostname: initial.hostname,
    registrableDomain: initial.registrableDomain,
    finalUrl: trace.finalUrl,
    redirects: trace.hops,
    redirectCount: trace.redirectCount,
    redirectLimit: trace.redirectLimit,
    redirectChainTruncated: trace.truncated,
    threats: { safeBrowsing, urlhaus },
    domain,
    warnings,
    nextSteps: buildNextSteps(verdict, trace, warnings, safeBrowsing, urlhaus),
    limitations:
      "This is a point-in-time URL check. Page content, scripts, downloads, and QR payloads are not executed. Threat-service matches are not proof of current behavior; a no-match result is not a guarantee of safety. Domain registration, redirect, and reputation data may be incomplete or unavailable.",
    analyzedAt: now.toISOString(),
    ...(trace.blocked ? { blocked: trace.blocked } : {}),
  };
}

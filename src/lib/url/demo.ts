import { getRegistrableDomain } from "./domain.ts";
import type { RdapDomainInfo, ThreatCheckResult, UrlAnalysisReport } from "./types.ts";

function demoRdap(domain: string, ageDays: number, registrar = "Demo Registrar (simulated)"): RdapDomainInfo {
  return {
    status: "ok",
    domain,
    registrar,
    createdAt: new Date(Date.now() - ageDays * 86_400_000).toISOString(),
    ageDays,
    registryStatuses: [],
    message: `Demo data: simulated domain registration age is ${ageDays} day(s).`,
  };
}

function demoThreat(
  service: "Google Safe Browsing" | "URLhaus",
  status: "clean" | "threat" | "unavailable",
  urls: string[],
  message: string,
  threatType?: string
): ThreatCheckResult {
  return {
    service,
    status,
    message: `Demo data: ${message}`,
    matches:
      status === "threat"
        ? [{ url: urls[0], threatType: threatType ?? "DEMO_THREAT" }]
        : [],
    checkedUrls: urls,
  };
}

function makeDemoReport(
  normalizedUrl: string,
  verdict: UrlAnalysisReport["verdict"],
  score: number,
  summary: string,
  warnings: UrlAnalysisReport["warnings"],
  safeBrowsingStatus: "clean" | "threat",
  urlhausStatus: "clean" | "threat",
  rdap: RdapDomainInfo,
  nextSteps: string[]
): UrlAnalysisReport {
  const hostname = new URL(normalizedUrl).hostname;
  return {
    verdict,
    score,
    summary,
    submittedUrl: normalizedUrl,
    normalizedUrl,
    hostname,
    registrableDomain: getRegistrableDomain(hostname),
    finalUrl: normalizedUrl,
    redirects: [{ url: normalizedUrl, status: 200, kind: "final", note: "Simulated response." }],
    redirectCount: 0,
    redirectLimit: 5,
    redirectChainTruncated: false,
    threats: {
      safeBrowsing: demoThreat(
        "Google Safe Browsing",
        safeBrowsingStatus,
        [normalizedUrl],
        safeBrowsingStatus === "threat"
          ? "simulated confirmed threat match."
          : "simulated no-match result.",
        safeBrowsingStatus === "threat" ? "SOCIAL_ENGINEERING" : undefined
      ),
      urlhaus: demoThreat(
        "URLhaus",
        urlhausStatus,
        [normalizedUrl],
        urlhausStatus === "threat"
          ? "simulated URLhaus record."
          : "simulated no-record result.",
        urlhausStatus === "threat" ? "malware_download" : undefined
      ),
    },
    domain: rdap,
    warnings,
    nextSteps,
    limitations:
      "DEMO MODE: these are simulated results, not live verification. Disable PHASE2_DEMO_MODE for real network and threat-service checks.",
    analyzedAt: new Date().toISOString(),
    demo: true,
  };
}

const DEMO_REPORTS: Record<string, UrlAnalysisReport> = {
  "https://example.com/": makeDemoReport(
    "https://example.com/",
    "NO_KNOWN_THREAT",
    0,
    "Demo result: no known threat was reported by the simulated checks.",
    [],
    "clean",
    "clean",
    demoRdap("example.com", 11_000),
    [
      "A clean result is point-in-time information, not a guarantee that a site is safe.",
      "Type the official domain yourself instead of relying on links in unexpected messages.",
      "Never enter an OTP, PIN, or password because a website or message asks you to.",
    ]
  ),
  "https://onlinesbi-kyc-portal.secure-banking-support.in/login": makeDemoReport(
    "https://onlinesbi-kyc-portal.secure-banking-support.in/login",
    "SUSPICIOUS",
    75,
    "Demo result: the hostname imitates a bank and the simulated registration age is very recent.",
    [
      {
        id: "BRAND_LOOKALIKE",
        severity: "HIGH",
        label: "Possible impersonation of a trusted financial brand",
        explanation:
          "Demo warning: the hostname contains “sbi”, but the registrable domain is not an official State Bank of India domain.",
      },
      {
        id: "DOMAIN_VERY_NEW",
        severity: "HIGH",
        label: "Domain was registered very recently",
        explanation: "Demo warning: simulated RDAP data says this domain was created 2 days ago.",
      },
      {
        id: "SENSITIVE_PATH_KEYWORDS",
        severity: "LOW",
        label: "Login or verification related URL path",
        explanation: "Demo warning: the path ends in /login.",
      },
    ],
    "clean",
    "clean",
    demoRdap("secure-banking-support.in", 2, "Demo Registrar (simulated)"),
    [
      "Do not enter banking credentials, OTPs, or card details on this site.",
      "Open your bank app or type the official bank address directly.",
      "Report suspected phishing to cybercrime.gov.in and, if money was lost, call 1930.",
    ]
  ),
  "https://malware-demo.satark.example/download": makeDemoReport(
    "https://malware-demo.satark.example/download",
    "MALICIOUS",
    100,
    "Demo result: a simulated threat service returned a confirmed malicious match.",
    [],
    "threat",
    "threat",
    demoRdap("satark.example", 1),
    [
      "Do not open or download anything from this URL.",
      "If you already opened it, disconnect from untrusted networks and run a reputable security scan.",
      "Report the URL through cybercrime.gov.in. Call 1930 if money or credentials were shared.",
    ]
  ),
};

export function getDemoUrlReport(normalizedUrl: string): UrlAnalysisReport | undefined {
  const report = DEMO_REPORTS[normalizedUrl];
  return report ? structuredClone(report) : undefined;
}

export const DEMO_MODE_NOTE =
  "Demo mode returns labelled simulated results only for the built-in sample URLs.";

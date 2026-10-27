import { countSubdomains, getRegistrableDomain } from "./domain.ts";
import { isIpLiteral } from "./ip.ts";
import type { NormalizedUrl } from "./validation.ts";
import type { TraceResult } from "./safe-request.ts";
import type { RdapDomainInfo, UrlWarning, WarningSeverity } from "./types.ts";

const SUSPICIOUS_TLDS = new Set([
  "top",
  "xyz",
  "buzz",
  "club",
  "online",
  "site",
  "cc",
  "work",
  "tk",
  "ga",
  "ml",
  "cf",
  "gq",
  "icu",
  "vip",
  "win",
  "loan",
  "click",
  "rest",
  "sbs",
  "cfd",
  "monster",
  "quest",
  "cyou",
  "shop",
]);

const URL_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "is.gd",
  "cutt.ly",
  "t.co",
  "rb.gy",
  "shorturl.at",
  "ow.ly",
  "tiny.cc",
  "rebrand.ly",
  "s.id",
  "t.ly",
  "shorturl.gg",
]);

interface BrandRule {
  token: string;
  officialDomains: string[];
}

const BANK_AND_PAYMENT_BRANDS: BrandRule[] = [
  { token: "sbi", officialDomains: ["sbi.co.in", "onlinesbi.sbi", "sbicard.com", "sbiyono.sbi"] },
  { token: "onlinesbi", officialDomains: ["onlinesbi.sbi", "sbi.co.in"] },
  { token: "hdfc", officialDomains: ["hdfcbank.com", "hdfc.com", "hdfclife.com", "hdfcsec.com", "hdfcbank.net"] },
  { token: "icici", officialDomains: ["icicibank.com", "icicibank.co.in", "icicidirect.com", "icicilombard.com"] },
  { token: "axis", officialDomains: ["axisbank.com", "axisbank.co.in", "axismaxlife.com"] },
  { token: "pnb", officialDomains: ["pnbindia.in", "pnb.co.in"] },
  { token: "kotak", officialDomains: ["kotak.com", "kotakbank.com"] },
  { token: "idfc", officialDomains: ["idfcfirstbank.com", "idfcbank.com"] },
  { token: "bankofbaroda", officialDomains: ["bankofbaroda.in", "bankofbaroda.com"] },
  { token: "canara", officialDomains: ["canarabank.com", "canarabank.in"] },
  { token: "unionbank", officialDomains: ["unionbankofindia.co.in", "unionbankofindia.com"] },
  { token: "paytm", officialDomains: ["paytm.com", "paytmbank.com"] },
  { token: "phonepe", officialDomains: ["phonepe.com"] },
  { token: "rbi", officialDomains: ["rbi.org.in"] },
  { token: "npci", officialDomains: ["npci.org.in"] },
  { token: "uidai", officialDomains: ["uidai.gov.in"] },
  { token: "aadhaar", officialDomains: ["uidai.gov.in"] },
  { token: "irctc", officialDomains: ["irctc.co.in", "irctc.com"] },
  { token: "incometax", officialDomains: ["incometax.gov.in"] },
  { token: "cbic", officialDomains: ["cbic.gov.in"] },
  { token: "amazon", officialDomains: ["amazon.in", "amazon.com"] },
  { token: "flipkart", officialDomains: ["flipkart.com"] },
  { token: "whatsapp", officialDomains: ["whatsapp.com"] },
  { token: "telegram", officialDomains: ["telegram.org", "t.me"] },
];

const HOST_KEYWORD_PATTERN = /\b(?:kyc|verify|verification|secure|login|signin|account|update|support|wallet|refund|banking|netbanking|otp)\b/i;
const PATH_KEYWORD_PATTERN = /(?:login|signin|verify|kyc|otp|update|secure|account|payment|refund|unlock|confirm)/i;

const SEVERITY_WEIGHT: Record<WarningSeverity, number> = {
  CRITICAL: 55,
  HIGH: 30,
  MEDIUM: 15,
  LOW: 5,
};

function warning(
  id: string,
  severity: WarningSeverity,
  label: string,
  explanation: string
): UrlWarning {
  return { id, severity, label, explanation };
}

function getTld(hostname: string): string {
  return hostname.split(".").filter(Boolean).at(-1)?.toLowerCase() ?? "";
}

const AMBIGUOUS_SHORT_BRAND_SUFFIXES = new Set(["axis", "rbi", "sbi", "pnb"]);

function hostnameMatchesBrandToken(hostname: string, token: string): boolean {
  // Match whole hyphen/domain labels, or a label that starts with the brand
  // ("sbi-kyc", "sbiyono", "axishelp"). Longer brand tokens may also appear as
  // a suffix ("fakeamazon", "fakehdfc"). Very short or common tokens are not
  // matched inside unrelated words like "arbitrary" (rbi) or "praxis" (axis).
  return hostname
    .toLowerCase()
    .split(".")
    .flatMap((label) => label.split("-"))
    .some(
      (label) =>
        label === token ||
        label.startsWith(token) ||
        (token.length >= 4 &&
          !AMBIGUOUS_SHORT_BRAND_SUFFIXES.has(token) &&
          label.endsWith(token))
    );
}

function findBrandImpersonation(hostname: string, registrableDomain: string): BrandRule | undefined {
  const lowerHost = hostname.toLowerCase();
  return BANK_AND_PAYMENT_BRANDS.find(
    (brand) =>
      hostnameMatchesBrandToken(lowerHost, brand.token) &&
      !brand.officialDomains.some(
        (official) =>
          registrableDomain === official ||
          registrableDomain.endsWith(`.${official}`) ||
          lowerHost === official ||
          lowerHost.endsWith(`.${official}`)
      )
  );
}

function isHttps(url: string): boolean {
  return url.toLowerCase().startsWith("https://");
}

export function collectUrlWarnings(
  initial: NormalizedUrl,
  trace: TraceResult,
  rdap: RdapDomainInfo
): UrlWarning[] {
  const warnings: UrlWarning[] = [];
  const hostname = initial.hostname;
  const tld = getTld(hostname);
  const registrableDomain = initial.registrableDomain;
  const shortenerHostname = hostname.replace(/^www\./, "");

  if (URL_SHORTENERS.has(shortenerHostname)) {
    warnings.push(
      warning(
        "URL_SHORTENER",
        "HIGH",
        "URL shortener hides the real destination",
        "This hostname is a link shortener. The final destination is only visible after the redirect chain is followed."
      )
    );
  }

  if (SUSPICIOUS_TLDS.has(tld)) {
    warnings.push(
      warning(
        "SUSPICIOUS_TLD",
        "MEDIUM",
        "Low-reputation top-level domain",
        `.${tld} is frequently used for throwaway phishing and scam sites. This alone is not proof of malicious activity.`
      )
    );
  }

  if (isIpLiteral(hostname)) {
    warnings.push(
      warning(
        "IP_LITERAL_HOST",
        "HIGH",
        "Raw IP address instead of a domain name",
        "Legitimate consumer banking and payment services normally use a branded domain name, not a bare IP address."
      )
    );
  }

  if (hostname.split(".").some((label) => label.startsWith("xn--"))) {
    warnings.push(
      warning(
        "PUNYCODE_HOST",
        "HIGH",
        "Internationalized lookalike domain encoding",
        "The hostname uses punycode. Some homograph attacks use visually similar international characters to imitate a trusted brand."
      )
    );
  }

  const brand = findBrandImpersonation(hostname, registrableDomain);
  if (brand) {
    warnings.push(
      warning(
        "BRAND_LOOKALIKE",
        "HIGH",
        "Possible impersonation of a trusted financial brand",
        `The hostname contains “${brand.token}”, but the registrable domain (${registrableDomain}) is not one of the known official domains for that brand. Verify by typing the official address yourself.`
      )
    );
  }

  if (
    HOST_KEYWORD_PATTERN.test(hostname) &&
    (brand || SUSPICIOUS_TLDS.has(tld) || URL_SHORTENERS.has(shortenerHostname))
  ) {
    warnings.push(
      warning(
        "CREDENTIAL_KEYWORDS_IN_HOST",
        "MEDIUM",
        "Login or verification words combined with an untrusted host",
        "Words such as login, verify, KYC, or secure in the hostname are often used to make phishing pages look official."
      )
    );
  }

  if (countSubdomains(hostname) >= 4) {
    warnings.push(
      warning(
        "EXCESSIVE_SUBDOMAINS",
        "LOW",
        "Deeply nested subdomains",
        "Long subdomain chains can make a fraudulent hostname look like it belongs to a trusted domain when read quickly."
      )
    );
  }

  if (PATH_KEYWORD_PATTERN.test(`${initial.url.pathname}${initial.url.search}`)) {
    warnings.push(
      warning(
        "SENSITIVE_PATH_KEYWORDS",
        "LOW",
        "Login, payment, or verification related URL path",
        "The path or query mentions account access or payment activity. Treat credential prompts opened from unexpected links with caution."
      )
    );
  }

  if (initial.url.protocol === "http:") {
    warnings.push(
      warning(
        "NO_HTTPS",
        "LOW",
        "Connection is not HTTPS",
        "The submitted URL uses plain HTTP. Credentials or payment details entered on an HTTP page can be intercepted."
      )
    );
  }

  if (trace.redirectCount >= 4) {
    warnings.push(
      warning(
        "LONG_REDIRECT_CHAIN",
        "MEDIUM",
        "Long redirect chain",
        `${trace.redirectCount} redirects were followed. Long chains are sometimes used to hide the final destination or evade blocklists.`
      )
    );
  }

  if (trace.truncated) {
    warnings.push(
      warning(
        "REDIRECT_LIMIT_REACHED",
        "HIGH",
        "Redirect limit reached before the final destination",
        `The chain exceeded the configured limit of ${trace.redirectLimit} redirects. The final destination could not be confirmed.`
      )
    );
  }

  if (trace.error?.code === "REDIRECT_ERROR") {
    warnings.push(
      warning(
        "REDIRECT_LOOP",
        "HIGH",
        "Redirect loop detected",
        "The URL repeatedly redirected to an address already visited. This can indicate an evasive or broken redirect trap."
      )
    );
  }

  if (trace.blocked) {
    warnings.push(
      warning(
        "BLOCKED_REDIRECT",
        "CRITICAL",
        "Redirect was blocked by SSRF protection",
        "A redirect pointed to a localhost, private, link-local, or reserved network address. The request was stopped before contacting that destination."
      )
    );
  }

  for (let index = 1; index < trace.hops.length; index += 1) {
    const previous = trace.hops[index - 1];
    const current = trace.hops[index];
    if (isHttps(previous.url) && current.url.toLowerCase().startsWith("http://")) {
      warnings.push(
        warning(
          "HTTPS_DOWNGRADE",
          "HIGH",
          "Redirect downgrades HTTPS to HTTP",
          "The chain moves from an encrypted HTTPS connection to plain HTTP, which exposes any data sent on the final page."
        )
      );
      break;
    }
  }

  const finalHop = trace.hops.at(-1);
  if (finalHop) {
    try {
      const finalHost = new URL(finalHop.url).hostname.replace(/^\[/, "").replace(/\]$/, "");
      if (isIpLiteral(finalHost)) {
        warnings.push(
          warning(
            "REDIRECT_TO_IP",
            "MEDIUM",
            "Redirect chain ends at a bare IP address",
            "The final destination uses an IP address rather than a named domain, which is unusual for legitimate consumer services."
          )
        );
      }
    } catch {
      // A malformed location is already represented by the trace/blocked hop.
    }
  }

  const finalUrl = trace.finalUrl;
  try {
    const final = new URL(finalUrl);
    const finalHostname = final.hostname
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .replace(/\.$/, "")
      .toLowerCase();
    const finalRegistrableDomain = getRegistrableDomain(finalHostname);
    const finalTld = getTld(finalHostname);

    // The submitted host can be harmless while the redirect chain lands on an
    // impersonation page. Apply the same host/path checks to the destination,
    // not only to the URL the user typed.
    if (finalHostname !== hostname) {
      if (SUSPICIOUS_TLDS.has(finalTld)) {
        warnings.push(
          warning(
            "SUSPICIOUS_TLD",
            "MEDIUM",
            "Low-reputation top-level domain",
            `The redirect chain ends at .${finalTld}, which is frequently used for throwaway phishing and scam sites. This alone is not proof of malicious activity.`
          )
        );
      }

      if (finalHostname.split(".").some((label) => label.startsWith("xn--"))) {
        warnings.push(
          warning(
            "PUNYCODE_HOST",
            "HIGH",
            "Internationalized lookalike domain encoding",
            "The final destination uses punycode. Some homograph attacks use visually similar international characters to imitate a trusted brand."
          )
        );
      }

      const finalBrand = findBrandImpersonation(finalHostname, finalRegistrableDomain);
      if (finalBrand) {
        warnings.push(
          warning(
            "BRAND_LOOKALIKE",
            "HIGH",
            "Possible impersonation of a trusted financial brand",
            `The redirect chain ends at a hostname containing “${finalBrand.token}”, but its registrable domain (${finalRegistrableDomain}) is not a known official domain. Verify by typing the official address yourself.`
          )
        );
      }

      if (
        HOST_KEYWORD_PATTERN.test(finalHostname) &&
        (finalBrand ||
          SUSPICIOUS_TLDS.has(finalTld) ||
          URL_SHORTENERS.has(finalHostname.replace(/^www\./, "")))
      ) {
        warnings.push(
          warning(
            "CREDENTIAL_KEYWORDS_IN_HOST",
            "MEDIUM",
            "Login or verification words combined with an untrusted host",
            "The final destination hostname includes words such as login, verify, KYC, or secure. These are often used to make phishing pages look official."
          )
        );
      }

      if (countSubdomains(finalHostname) >= 4) {
        warnings.push(
          warning(
            "EXCESSIVE_SUBDOMAINS",
            "LOW",
            "Deeply nested subdomains",
            "The final destination uses a long subdomain chain that can make a fraudulent hostname look like it belongs to a trusted domain when read quickly."
          )
        );
      }
    }

    if (
      PATH_KEYWORD_PATTERN.test(`${final.pathname}${final.search}`) &&
      (final.pathname !== initial.url.pathname || final.search !== initial.url.search)
    ) {
      warnings.push(
        warning(
          "SENSITIVE_PATH_KEYWORDS",
          "LOW",
          "Login, payment, or verification related URL path",
          "The final path or query mentions account access or payment activity. Treat credential prompts opened from unexpected links with caution."
        )
      );
    }

    if (finalRegistrableDomain !== registrableDomain && trace.redirectCount > 0) {
      warnings.push(
        warning(
          "CROSS_DOMAIN_REDIRECT",
          "LOW",
          "Redirect crosses to a different registrable domain",
          `The chain starts at ${registrableDomain} and ends at ${finalRegistrableDomain}. Cross-domain redirects are common but should be reviewed.`
        )
      );
    }
  } catch {
    // A malformed final URL is already represented by the trace error.
  }

  if (rdap.status === "ok" && typeof rdap.ageDays === "number") {
    if (rdap.ageDays <= 7) {
      warnings.push(
        warning(
          "DOMAIN_VERY_NEW",
          "HIGH",
          "Domain was registered very recently",
          `RDAP reports this domain was created ${rdap.ageDays} day(s) ago. Newly registered domains under 30 days are disproportionately used for short-lived scam campaigns.`
        )
      );
    } else if (rdap.ageDays <= 30) {
      warnings.push(
        warning(
          "DOMAIN_RECENT",
          "HIGH",
          "Domain is less than 30 days old",
          `RDAP reports this domain was created ${rdap.ageDays} day(s) ago. Domains registered within the last 30 days are flagged as high risk.`
        )
      );
    }
  }

  const riskyStatus = rdap.registryStatuses.find((status) =>
    /client hold|server hold|pending delete|redemption period/i.test(status)
  );
  if (riskyStatus) {
    warnings.push(
      warning(
        "REGISTRY_HOLD",
        "HIGH",
        "Domain has a restrictive registry status",
        `RDAP reports the registry status “${riskyStatus}”. Domains in this state may be suspended or pending deletion.`
      )
    );
  }

  const deduped = new Map<string, UrlWarning>();
  for (const item of warnings) {
    if (!deduped.has(item.id)) deduped.set(item.id, item);
  }
  return Array.from(deduped.values()).sort(
    (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]
  );
}

export function scoreWarnings(warnings: UrlWarning[]): number {
  return Math.min(
    100,
    warnings.reduce((total, item) => total + SEVERITY_WEIGHT[item.severity], 0)
  );
}

export function hasHighConfidenceWarning(warnings: UrlWarning[]): boolean {
  return warnings.some((item) => item.severity === "CRITICAL" || item.severity === "HIGH");
}

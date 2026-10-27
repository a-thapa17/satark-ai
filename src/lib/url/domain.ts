import { isIpLiteral } from "./ip.ts";

const MULTI_PART_SUFFIXES = new Set([
  "ac.in",
  "co.in",
  "edu.in",
  "gov.in",
  "net.in",
  "nic.in",
  "org.in",
  "res.in",
  "ac.uk",
  "co.uk",
  "gov.uk",
  "ltd.uk",
  "me.uk",
  "net.uk",
  "org.uk",
  "com.au",
  "edu.au",
  "gov.au",
  "net.au",
  "org.au",
  "co.jp",
  "co.nz",
  "co.za",
  "co.kr",
  "co.il",
  "com.br",
  "com.cn",
  "com.hk",
  "com.mx",
  "com.pk",
  "com.sg",
  "com.tr",
  "com.bd",
  "com.np",
  "com.lk",
]);

/** Approximate registrable domain; no PSL dependency is required. */
export function getRegistrableDomain(hostname: string): string {
  const host = hostname.trim().toLowerCase().replace(/^\[/, "").replace(/\]$/, "").replace(/\.$/, "");
  if (!host || isIpLiteral(host)) return host;

  const labels = host.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");

  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_PART_SUFFIXES.has(lastTwo)) {
    return labels.slice(-3).join(".");
  }
  return lastTwo;
}

export function isSameSite(a: string, b: string): boolean {
  return getRegistrableDomain(a) === getRegistrableDomain(b);
}

export function countSubdomains(hostname: string): number {
  const host = hostname.replace(/^\[/, "").replace(/\]$/, "").replace(/\.$/, "");
  if (isIpLiteral(host)) return 0;
  const labels = host.split(".").filter(Boolean);
  return Math.max(0, labels.length - 2);
}

export function getHostname(url: URL): string {
  return url.hostname.replace(/^\[/, "").replace(/\]$/, "").replace(/\.$/, "").toLowerCase();
}

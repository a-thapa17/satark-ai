import { lookup as dnsLookup } from "node:dns/promises";
import { BlockedUrlError, DnsLookupError, UrlValidationError } from "./errors.ts";
import { getHostname, getRegistrableDomain } from "./domain.ts";
import { isBlockedHostname, isIpLiteral, isPublicIp } from "./ip.ts";

export interface LookupAddress {
  address: string;
  family: number;
}

export type LookupFn = (hostname: string) => Promise<LookupAddress[]>;

export const defaultLookup: LookupFn = async (hostname) => {
  const addresses = await dnsLookup(hostname, { all: true, verbatim: true });
  return addresses.map((entry) => ({ address: entry.address, family: entry.family }));
};

export interface NormalizedUrl {
  url: URL;
  normalizedUrl: string;
  hostname: string;
  registrableDomain: string;
  isIp: boolean;
}

const MAX_URL_LENGTH = 2048;
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const SPECIAL_SCHEME_PATTERN = /^(?:mailto|javascript|data|file|ftp|tel|blob):/i;
function validateHostnameSyntax(hostname: string): void {
  if (!hostname) {
    throw new UrlValidationError("INVALID_URL", "The URL does not contain a hostname.");
  }
  if (hostname.includes("%")) {
    throw new UrlValidationError("BLOCKED_URL", "Hostnames containing zone identifiers are not supported.");
  }
  if (isIpLiteral(hostname)) return;
  if (hostname === "localhost" || isBlockedHostname(hostname)) {
    throw new BlockedUrlError("Local and internal hostnames are not allowed.");
  }
  if (hostname.startsWith(".") || hostname.endsWith(".") || hostname.includes("..")) {
    throw new UrlValidationError("INVALID_URL", "The hostname is malformed.");
  }
  const labels = hostname.split(".");
  if (labels.some((label) => !label || label.length > 63)) {
    throw new UrlValidationError("INVALID_URL", "The hostname contains an invalid label.");
  }
  if (labels.length < 2) {
    throw new BlockedUrlError("Single-label hostnames are treated as internal and are not allowed.");
  }
}

function applyStaticValidation(url: URL): NormalizedUrl {
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new UrlValidationError(
      "UNSUPPORTED_SCHEME",
      "Only http:// and https:// URLs can be analyzed."
    );
  }
  if (url.username || url.password) {
    throw new UrlValidationError(
      "URL_CREDENTIALS_NOT_ALLOWED",
      "URLs containing embedded usernames or passwords are not allowed."
    );
  }
  if (url.port) {
    const allowed =
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443");
    if (!allowed) {
      throw new UrlValidationError(
        "UNSUPPORTED_PORT",
        "Only standard HTTP (80) and HTTPS (443) ports are allowed."
      );
    }
  }

  url.hash = "";
  const hostname = getHostname(url);
  validateHostnameSyntax(hostname);
  if (url.hostname.endsWith(".")) {
    url.hostname = url.hostname.slice(0, -1);
  }

  if (url.href.length > MAX_URL_LENGTH) {
    throw new UrlValidationError("URL_TOO_LONG", `URLs must be ${MAX_URL_LENGTH} characters or fewer.`);
  }

  return {
    url,
    normalizedUrl: url.href,
    hostname,
    registrableDomain: getRegistrableDomain(hostname),
    isIp: isIpLiteral(hostname),
  };
}

export function normalizeUrlInput(input: string): NormalizedUrl {
  if (typeof input !== "string") {
    throw new UrlValidationError("INVALID_URL", "A URL string is required.");
  }

  const trimmed = input.trim();
  if (!trimmed) {
    throw new UrlValidationError("INVALID_URL", "Please enter a URL to analyze.");
  }
  if (trimmed.length > MAX_URL_LENGTH) {
    throw new UrlValidationError("URL_TOO_LONG", `URLs must be ${MAX_URL_LENGTH} characters or fewer.`);
  }
  if (/[\u0000-\u0020\u007f]/.test(trimmed)) {
    throw new UrlValidationError("INVALID_URL", "The URL contains whitespace or control characters.");
  }

  let candidate = trimmed;
  if (candidate.startsWith("//")) {
    candidate = `https:${candidate}`;
  } else if (
    !/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate) &&
    !SPECIAL_SCHEME_PATTERN.test(candidate)
  ) {
    candidate = `https://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new UrlValidationError("INVALID_URL", "The URL could not be parsed. Check its format and try again.");
  }

  return applyStaticValidation(parsed);
}

export function normalizeRedirectTarget(location: string, base: URL): NormalizedUrl {
  let parsed: URL;
  try {
    parsed = new URL(location, base);
  } catch {
    throw new UrlValidationError("REDIRECT_ERROR", "A redirect returned an invalid destination URL.");
  }
  return applyStaticValidation(parsed);
}

/**
 * Resolves a hostname and rejects the URL if any returned address is not
 * globally routable. Rejecting mixed public/private answers prevents a DNS
 * response from smuggling an internal address into the redirect chain.
 */
export async function resolvePublicAddresses(
  url: URL,
  lookup: LookupFn = defaultLookup
): Promise<LookupAddress[]> {
  const hostname = getHostname(url);
  validateHostnameSyntax(hostname);

  if (isIpLiteral(hostname)) {
    if (!isPublicIp(hostname)) {
      throw new BlockedUrlError("The URL points to a private, loopback, link-local, or reserved IP address.");
    }
    return [{ address: hostname, family: hostname.includes(":") ? 6 : 4 }];
  }

  let addresses: LookupAddress[];
  try {
    addresses = await lookup(hostname);
  } catch {
    throw new DnsLookupError(`DNS lookup failed for ${hostname}.`);
  }

  if (!addresses.length) {
    throw new DnsLookupError(`No DNS records were returned for ${hostname}.`);
  }
  if (addresses.some((entry) => !isPublicIp(entry.address))) {
    throw new BlockedUrlError("The hostname resolves to a private or reserved network address.");
  }
  return addresses;
}

export const URL_LIMITS = {
  maxUrlLength: MAX_URL_LENGTH,
  allowedPorts: [80, 443] as const,
};

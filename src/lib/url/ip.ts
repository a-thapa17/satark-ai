import ipaddr from "ipaddr.js";

const BLOCKED_HOST_SUFFIXES = [
  ".localhost",
  ".local",
  ".localdomain",
  ".internal",
  ".intranet",
  ".lan",
  ".home",
  ".corp",
  ".home.arpa",
];

const BLOCKED_HOST_EXACT = new Set([
  "localhost",
  "metadata",
  "metadata.google.internal",
  "metadata.google",
  "instance-data",
  "instance-data.ec2.internal",
]);

/**
 * Only globally routable unicast addresses are accepted.
 * ipaddr.js classifies loopback, private, link-local, CGNAT, multicast,
 * documentation, benchmarking, and other reserved ranges separately.
 */
export function isPublicIp(input: string): boolean {
  const value = input.trim().replace(/^\[/, "").replace(/\]$/, "").split("%")[0];
  if (!value || !ipaddr.isValid(value)) return false;

  try {
    const address = ipaddr.parse(value);
    if (address.kind() === "ipv6") {
      const ipv6 = address as ipaddr.IPv6;
      if (ipv6.isIPv4MappedAddress()) {
        return ipv6.toIPv4Address().range() === "unicast";
      }
    }
    return address.range() === "unicast";
  } catch {
    return false;
  }
}

export function isIpLiteral(input: string): boolean {
  const value = input.trim().replace(/^\[/, "").replace(/\]$/, "").split("%")[0];
  return ipaddr.isValid(value);
}

export function normalizeIp(input: string): string {
  const value = input.trim().replace(/^\[/, "").replace(/\]$/, "").split("%")[0];
  const address = ipaddr.parse(value);
  if (address.kind() === "ipv6") {
    const ipv6 = address as ipaddr.IPv6;
    if (ipv6.isIPv4MappedAddress()) {
      return ipv6.toIPv4Address().toString();
    }
  }
  return address.toString();
}

export function isBlockedHostname(input: string): boolean {
  const host = input.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (host.includes("%")) return true;
  if (BLOCKED_HOST_EXACT.has(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  // Single-label names are normally internal DNS names.
  if (!host.includes(".") && !isIpLiteral(host)) return true;
  return false;
}

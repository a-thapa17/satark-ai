/**
 * Resolve the rate-limit bucket for an incoming request.
 *
 * Forwarded headers are client-controlled unless a reverse proxy overwrites or
 * appends them. Trusting them by default lets a caller evade rate limits by
 * rotating `X-Forwarded-For`. The safe default is therefore a shared direct
 * bucket. Deployments behind a proxy they control can opt in and declare the
 * number of trusted proxy hops.
 */
export const TRUST_PROXY_HEADERS_ENV = "TRUST_PROXY_HEADERS";
export const TRUST_PROXY_HOPS_ENV = "TRUST_PROXY_HOPS";
export const DIRECT_CLIENT_BUCKET = "direct";
const DEFAULT_TRUSTED_PROXY_HOPS = 1;
const MAX_TRUSTED_PROXY_HOPS = 10;

function headerValue(request: Request, name: string): string {
  return request.headers.get(name)?.trim() ?? "";
}

function trustedProxyHops(): number {
  const configured = Number.parseInt(
    process.env[TRUST_PROXY_HOPS_ENV] ?? "",
    10
  );
  if (!Number.isFinite(configured)) return DEFAULT_TRUSTED_PROXY_HOPS;
  return Math.min(MAX_TRUSTED_PROXY_HOPS, Math.max(1, configured));
}

/**
 * When proxy trust is enabled, use the nearest hop controlled by the declared
 * trusted-proxy count. Example: with one trusted proxy, a client-supplied
 * `spoof, real-client` chain resolves to `real-client`, not `spoof`.
 */
export function getClientIp(request: Request): string {
  if (process.env[TRUST_PROXY_HEADERS_ENV]?.trim().toLowerCase() !== "true") {
    return DIRECT_CLIENT_BUCKET;
  }

  const forwardedFor = headerValue(request, "x-forwarded-for");
  if (forwardedFor) {
    const hops = forwardedFor
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) {
      const index = Math.max(0, hops.length - trustedProxyHops());
      return hops[index] ?? "unknown";
    }
  }

  return headerValue(request, "x-real-ip") || "unknown";
}

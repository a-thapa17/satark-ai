import http from "node:http";
import https from "node:https";
import type { LookupFunction } from "node:net";
import {
  BlockedUrlError,
  DnsLookupError,
  UrlValidationError,
} from "./errors.ts";
import { isIpLiteral, isPublicIp } from "./ip.ts";
import {
  defaultLookup,
  normalizeRedirectTarget,
  resolvePublicAddresses,
  type LookupFn,
  type NormalizedUrl,
} from "./validation.ts";
import type { RedirectHop } from "./types.ts";

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);
const DEFAULT_MAX_REDIRECTS = 5;
const MAX_ALLOWED_REDIRECTS = 10;
const DEFAULT_HOP_TIMEOUT_MS = 6000;
const DEFAULT_TOTAL_TIMEOUT_MS = 15000;
const MAX_JSON_BODY_BYTES = 1_000_000;

export interface SafeHttpResponse {
  status: number;
  location?: string;
  contentType?: string;
  body?: string;
}

export type HopRequester = (
  url: URL,
  timeoutMs: number
) => Promise<{ status: number; location?: string }>;

export interface SafeRequestOptions {
  timeoutMs?: number;
  readBody?: boolean;
  maxBytes?: number;
  accept?: string;
  lookup?: LookupFn;
}

export class SafeRequestError extends Error {
  public readonly code: "REQUEST_TIMEOUT" | "NETWORK_ERROR" | "RESPONSE_TOO_LARGE";

  constructor(code: "REQUEST_TIMEOUT" | "NETWORK_ERROR" | "RESPONSE_TOO_LARGE", message: string) {
    super(message);
    this.name = "SafeRequestError";
    this.code = code;
  }
}

/**
 * DNS lookup used at connection time. It rejects private/reserved answers and
 * pins the connection to the address that was just validated, closing the
 * validation-to-connection DNS rebinding window.
 */
export function createPinnedLookup(lookup: LookupFn = defaultLookup): LookupFunction {
  const pinned = (
    hostname: string,
    options: { family?: number; all?: boolean },
    callback: (...args: unknown[]) => void
  ) => {
    void lookup(hostname)
      .then((addresses) => {
        if (!addresses.length) {
          callback(new DnsLookupError("No DNS records were returned."));
          return;
        }
        if (addresses.some((entry) => !isPublicIp(entry.address))) {
          callback(new BlockedUrlError("The hostname resolves to a non-public address."));
          return;
        }
        const selected =
          (options.family ? addresses.find((entry) => entry.family === options.family) : undefined) ??
          addresses[0];
        if (!selected) {
          callback(new DnsLookupError("No address matched the requested IP family."));
          return;
        }
        if (options.all) {
          callback(null, addresses);
        } else {
          callback(null, selected.address, selected.family);
        }
      })
      .catch((error: unknown) => callback(error));
  };
  return pinned as unknown as LookupFunction;
}

export function requestOnce(url: URL, options: SafeRequestOptions = {}): Promise<SafeHttpResponse> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_HOP_TIMEOUT_MS;
  const readBody = options.readBody === true;
  const maxBytes = options.maxBytes ?? MAX_JSON_BODY_BYTES;
  const hostname = url.hostname.replace(/^\[/, "").replace(/\]$/, "");
  const isTls = url.protocol === "https:";
  const transport = isTls ? https : http;
  const lookup = createPinnedLookup(options.lookup);

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error: Error | null, response?: SafeHttpResponse) => {
      if (settled) return;
      settled = true;
      if (error) reject(error);
      else if (response) resolve(response);
    };

    const requestOptions: https.RequestOptions = {
      protocol: url.protocol,
      hostname,
      port: url.port || undefined,
      path: `${url.pathname}${url.search}`,
      method: "GET",
      headers: {
        "user-agent": "SatarkAI-URLSafety/2.0",
        accept: options.accept ?? "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "accept-encoding": "identity",
      },
      lookup,
      agent: false,
      timeout: timeoutMs,
      servername: isTls && !isIpLiteral(hostname) ? hostname : undefined,
    };

    let request: http.ClientRequest;
    try {
      request = transport.request(requestOptions, (response) => {
        const status = response.statusCode ?? 0;
        const location =
          typeof response.headers.location === "string" ? response.headers.location : undefined;
        const contentType =
          typeof response.headers["content-type"] === "string"
            ? response.headers["content-type"]
            : undefined;

        if (!readBody) {
          response.on("error", () => undefined);
          response.destroy();
          finish(null, { status, location, contentType });
          return;
        }

        const chunks: Buffer[] = [];
        let totalBytes = 0;
        response.on("data", (chunk: Buffer) => {
          totalBytes += chunk.length;
          if (totalBytes > maxBytes) {
            response.destroy();
            finish(
              new SafeRequestError(
                "RESPONSE_TOO_LARGE",
                "The remote response exceeded the allowed size."
              )
            );
            return;
          }
          chunks.push(chunk);
        });
        response.on("end", () => {
          finish(null, {
            status,
            location,
            contentType,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
        response.on("error", (error) => finish(error));
      });
    } catch {
      finish(new SafeRequestError("NETWORK_ERROR", "The request could not be created."));
      return;
    }

    request.on("timeout", () => {
      request.destroy();
      finish(new SafeRequestError("REQUEST_TIMEOUT", "The network request timed out."));
    });
    request.on("error", (error) => {
      if (error instanceof BlockedUrlError || error instanceof DnsLookupError) {
        finish(error);
        return;
      }
      finish(new SafeRequestError("NETWORK_ERROR", error.message || "Network request failed."));
    });
    request.end();
  });
}

const requestHop: HopRequester = async (url, timeoutMs) => {
  const response = await requestOnce(url, { timeoutMs });
  return { status: response.status, location: response.location };
};

export interface TraceOptions {
  maxRedirects?: number;
  hopTimeoutMs?: number;
  totalTimeoutMs?: number;
  lookup?: LookupFn;
  request?: HopRequester;
}

export interface TraceResult {
  hops: RedirectHop[];
  finalUrl: string;
  redirectCount: number;
  redirectLimit: number;
  truncated: boolean;
  blocked?: { url: string; reason: string };
  error?: { code: string; message: string };
}

function clampNumber(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

export function getRedirectLimit(value?: number): number {
  return clampNumber(value, DEFAULT_MAX_REDIRECTS, 0, MAX_ALLOWED_REDIRECTS);
}

export function getHopTimeout(value?: number): number {
  return clampNumber(value, DEFAULT_HOP_TIMEOUT_MS, 1000, 15000);
}

export function getTotalTimeout(value?: number): number {
  return clampNumber(value, DEFAULT_TOTAL_TIMEOUT_MS, 3000, 30000);
}

/**
 * Follows redirects manually. Every destination is statically validated,
 * resolved, and checked against private/reserved address space before the
 * next request is made. Response bodies are never downloaded here.
 */
export async function traceRedirects(
  start: NormalizedUrl,
  options: TraceOptions = {}
): Promise<TraceResult> {
  const maxRedirects = getRedirectLimit(options.maxRedirects);
  const hopTimeoutMs = getHopTimeout(options.hopTimeoutMs);
  const totalTimeoutMs = getTotalTimeout(options.totalTimeoutMs);
  const lookup = options.lookup ?? defaultLookup;
  const request = options.request ?? requestHop;
  const deadline = Date.now() + totalTimeoutMs;
  const seen = new Set<string>();

  const hops: RedirectHop[] = [];
  let current = start;
  let redirectCount = 0;

  for (;;) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      hops.push({
        url: current.normalizedUrl,
        status: null,
        kind: "error",
        note: "The URL analysis time budget was exhausted.",
      });
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: false,
        error: { code: "REQUEST_TIMEOUT", message: "URL analysis timed out." },
      };
    }

    if (seen.has(current.normalizedUrl)) {
      hops.push({
        url: current.normalizedUrl,
        status: null,
        kind: "error",
        note: "A redirect loop was detected.",
      });
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: false,
        error: { code: "REDIRECT_ERROR", message: "A redirect loop was detected." },
      };
    }
    seen.add(current.normalizedUrl);

    try {
      await resolvePublicAddresses(current.url, lookup);
    } catch (error) {
      const isBlocked = error instanceof BlockedUrlError;
      const message =
        error instanceof Error ? error.message : "The destination could not be validated.";
      hops.push({
        url: current.normalizedUrl,
        status: null,
        kind: isBlocked ? "blocked" : "error",
        note: message,
      });
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: false,
        ...(isBlocked ? { blocked: { url: current.normalizedUrl, reason: message } } : {}),
        ...(!isBlocked
          ? {
              error: {
                code: error instanceof UrlValidationError ? error.code : "NETWORK_ERROR",
                message,
              },
            }
          : {}),
      };
    }

    let response: { status: number; location?: string };
    try {
      response = await request(current.url, Math.min(hopTimeoutMs, remaining));
    } catch (error) {
      if (error instanceof BlockedUrlError) {
        hops.push({
          url: current.normalizedUrl,
          status: null,
          kind: "blocked",
          note: error.message,
        });
        return {
          hops,
          finalUrl: current.normalizedUrl,
          redirectCount,
          redirectLimit: maxRedirects,
          truncated: false,
          blocked: { url: current.normalizedUrl, reason: error.message },
        };
      }
      if (error instanceof DnsLookupError) {
        hops.push({
          url: current.normalizedUrl,
          status: null,
          kind: "error",
          note: error.message,
        });
        return {
          hops,
          finalUrl: current.normalizedUrl,
          redirectCount,
          redirectLimit: maxRedirects,
          truncated: false,
          error: { code: "DNS_LOOKUP_FAILED", message: error.message },
        };
      }
      const message = error instanceof Error ? error.message : "The URL could not be reached.";
      const code =
        error instanceof SafeRequestError && error.code === "REQUEST_TIMEOUT"
          ? "REQUEST_TIMEOUT"
          : "NETWORK_ERROR";
      hops.push({
        url: current.normalizedUrl,
        status: null,
        kind: "error",
        note: message,
      });
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: false,
        error: { code, message },
      };
    }

    const hop: RedirectHop = {
      url: current.normalizedUrl,
      status: response.status,
      kind: hops.length === 0 ? "start" : "final",
      location: response.location,
    };
    hops.push(hop);

    if (!REDIRECT_STATUSES.has(response.status) || !response.location) {
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: false,
      };
    }

    hop.kind = hops.length === 1 ? "start" : "redirect";

    let next: NormalizedUrl;
    try {
      next = normalizeRedirectTarget(response.location, current.url);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid redirect destination.";
      hops.push({
        url: response.location,
        status: null,
        kind: "blocked",
        note: message,
      });
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: false,
        blocked: { url: response.location, reason: message },
      };
    }

    if (redirectCount >= maxRedirects) {
      hops.push({
        url: next.normalizedUrl,
        status: null,
        kind: "blocked",
        note: `Redirect limit of ${maxRedirects} reached; the chain was not followed further.`,
      });
      return {
        hops,
        finalUrl: current.normalizedUrl,
        redirectCount,
        redirectLimit: maxRedirects,
        truncated: true,
      };
    }

    redirectCount += 1;
    current = next;
  }
}

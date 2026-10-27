import { analyzeUrl } from "../../../lib/url/analyze.ts";
import { UrlValidationError } from "../../../lib/url/errors.ts";
import { getClientIp } from "../../../lib/http/client-ip.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const MAX_BODY_BYTES = 8_192;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const current = rateLimitMap.get(ip);
  if (!current || now > current.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

const cleanup = setInterval(() => {
  const now = Date.now();
  rateLimitMap.forEach((entry, ip) => {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  });
}, 5 * 60_000);
cleanup.unref();

function errorResponse(code: string, message: string, status: number): Response {
  return Response.json(
    { success: false, code, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: Request): Promise<Response> {
  const ip = getClientIp(request);
  if (!checkRateLimit(ip)) {
    return errorResponse(
      "RATE_LIMITED",
      "Too many URL scans. Please wait a minute before trying again.",
      429
    );
  }

  const contentLength = Number.parseInt(request.headers.get("content-length") ?? "", 10);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return errorResponse("PAYLOAD_TOO_LARGE", "The request body is too large.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse("INVALID_JSON", "The request body must be valid JSON.", 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return errorResponse("PAYLOAD_TOO_LARGE", "The request body is too large.", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse("INVALID_JSON", "The request body must be valid JSON.", 400);
  }

  if (!body || typeof body !== "object") {
    return errorResponse("INVALID_PAYLOAD", "A JSON object containing a url field is required.", 400);
  }
  const { url } = body as { url?: unknown };
  if (typeof url !== "string" || !url.trim()) {
    return errorResponse("INVALID_URL", "Please provide a URL string to analyze.", 400);
  }

  try {
    const report = await analyzeUrl(url);
    return Response.json(
      { success: true, report },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof UrlValidationError) {
      return errorResponse(error.code, error.message, 400);
    }
    return errorResponse(
      "ANALYSIS_FAILED",
      "URL analysis failed unexpectedly. Please try again later.",
      500
    );
  }
}

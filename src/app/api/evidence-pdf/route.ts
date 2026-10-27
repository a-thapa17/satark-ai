import {
  buildEvidenceReport,
  evidenceFilename,
  EvidenceValidationError,
  MAX_EVIDENCE_BODY_BYTES,
  parseEvidenceRequest,
} from "../../../lib/help/evidence.ts";
import { renderEvidencePdf } from "../../../lib/help/pdf.ts";
import { getClientIp } from "../../../lib/http/client-ip.ts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;
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
  if (!checkRateLimit(getClientIp(request))) {
    return errorResponse(
      "RATE_LIMITED",
      "Too many evidence PDF requests. Please wait a minute before trying again.",
      429
    );
  }

  const declaredLength = Number.parseInt(
    request.headers.get("content-length") ?? "",
    10
  );
  if (Number.isFinite(declaredLength) && declaredLength > MAX_EVIDENCE_BODY_BYTES) {
    return errorResponse(
      "PAYLOAD_TOO_LARGE",
      "The evidence details are too large. Shorten the description and try again.",
      413
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return errorResponse(
      "UNREADABLE_BODY",
      "The request body could not be read.",
      400
    );
  }

  if (new TextEncoder().encode(rawBody).byteLength > MAX_EVIDENCE_BODY_BYTES) {
    return errorResponse(
      "PAYLOAD_TOO_LARGE",
      "The evidence details are too large. Shorten the description and try again.",
      413
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "The request body must be valid JSON.",
      400
    );
  }

  try {
    const parsed = parseEvidenceRequest(body);
    const report = buildEvidenceReport(parsed);
    const pdf = await renderEvidencePdf(report);
    const filename = evidenceFilename(new Date(report.generatedAt));
    const pdfBuffer = new Uint8Array(pdf).slice().buffer;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof EvidenceValidationError) {
      return errorResponse(error.code, error.message, error.status);
    }
    return errorResponse(
      "PDF_GENERATION_FAILED",
      "The evidence PDF could not be generated. Your details were not submitted as a report. Please try again.",
      500
    );
  }
}

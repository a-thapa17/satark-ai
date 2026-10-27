import { parseUpiUri, type UpiPaymentDetails } from "./upi.ts";

export const MAX_DECODED_CONTENT_LENGTH = 4096;

export type QrContent =
  | { kind: "url"; url: string; note?: string }
  | { kind: "upi"; payment: UpiPaymentDetails }
  | { kind: "text"; text: string; note?: string };

const BARE_DOMAIN_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?::\d{1,5})?(?:[/?#][^\s]*)?$/i;

function normalizeUrlCandidate(value: string): string | undefined {
  let candidate = value.trim();
  if (!candidate) return undefined;
  if (/^www\./i.test(candidate)) candidate = `https://${candidate}`;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(candidate)) {
    if (!BARE_DOMAIN_PATTERN.test(candidate)) return undefined;
    candidate = `https://${candidate}`;
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    if (!parsed.hostname) return undefined;
    return parsed.href;
  } catch {
    return undefined;
  }
}

/**
 * Classifies decoded QR text. It never opens or fetches a URL. The caller
 * decides whether to submit the extracted URL to the server-side analyzer.
 */
export function classifyQrContent(input: string): QrContent {
  const content = input.trim();
  if (!content) return { kind: "text", text: "", note: "The QR code is empty." };
  if (content.length > MAX_DECODED_CONTENT_LENGTH) {
    return {
      kind: "text",
      text: content.slice(0, 500),
      note: `The QR content is too long (${content.length} characters) to analyze safely.`,
    };
  }

  if (/^upi:/i.test(content)) {
    const parsed = parseUpiUri(content);
    if (parsed.kind === "payment") {
      return { kind: "upi", payment: parsed.payment };
    }
    return {
      kind: "text",
      text: content,
      note: parsed.kind === "invalid" ? parsed.reason : "Unsupported UPI content.",
    };
  }

  const normalizedUrl = normalizeUrlCandidate(content);
  if (normalizedUrl) {
    return { kind: "url", url: normalizedUrl };
  }

  return { kind: "text", text: content, note: "The QR code does not contain a URL or UPI payment request." };
}

export interface UpiPaymentDetails {
  uri: string;
  upiId: string;
  payeeName?: string;
  amount?: string;
  amountValue?: number;
  currency: string;
  transactionNote?: string;
  merchantCode?: string;
  transactionRef?: string;
  warnings: string[];
  isSuspiciousVpa?: boolean;
  suspiciousReasons?: string[];
}

export type UpiParseOutcome =
  | { kind: "payment"; payment: UpiPaymentDetails }
  | { kind: "invalid"; reason: string }
  | { kind: "not_upi" };

const UPI_ID_PATTERN = /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9.-]{1,64}$/;
const AMOUNT_PATTERN = /^\d{1,9}(?:\.\d{1,2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

// Known high-risk phishing / brand impersonation handles used in Indian cyber scams
const SUSPICIOUS_VPA_PATTERNS = [
  { pattern: /^(?:support|help|customercare|care|service|refund|kyc|verify|officer|nodal)[\w.-]*@/i, reason: "Impersonates customer care or official support desk" },
  { pattern: /[\w.-]*(?:sbi|hdfc|icici|axis|pnb|paytm|phonepe|gpay|bhim|airtel)[\w.-]*(?:support|care|help|refund|kyc|update)[\w.-]*@/i, reason: "Lookalike bank or wallet brand support VPA" },
  { pattern: /[\w.-]*(?:electricity|bijli|bses|tneb|mseb|dhbvn|uppcl)[\w.-]*@/i, reason: "Impersonates electricity department or power utility" },
  { pattern: /[\w.-]*(?:police|cbi|cybercell|customs|court|rbi|trai)[\w.-]*@/i, reason: "Impersonates law enforcement or government authority" },
  { pattern: /[\w.-]*(?:lottery|kbc|prize|reward|cashback|win)[\w.-]*@/i, reason: "Lottery, prize, or reward claim lure" },
  { pattern: /[\w.-]*(?:parttime|task|telegram|job|earn)[\w.-]*@/i, reason: "Task scam or prepaid job lure VPA" },
];

/**
 * Parses a UPI payment URI. This function only describes the request encoded
 * in the QR/URI; it never contacts a payment provider or initiates a payment.
 */
export function parseUpiUri(input: string): UpiParseOutcome {
  const raw = input.trim();
  if (!/^upi:/i.test(raw)) return { kind: "not_upi" };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { kind: "invalid", reason: "The UPI URI could not be parsed." };
  }

  if (parsed.protocol.toLowerCase() !== "upi:") {
    return { kind: "not_upi" };
  }
  if (parsed.hostname.toLowerCase() !== "pay") {
    return {
      kind: "invalid",
      reason: "Only UPI payment URIs (upi://pay) are supported. This URI describes a different UPI operation.",
    };
  }

  const params = parsed.searchParams;
  const upiId = (params.get("pa") ?? "").trim();
  if (!upiId) {
    return { kind: "invalid", reason: "The UPI URI does not include a payee address (pa)." };
  }

  const warnings: string[] = [];
  const suspiciousReasons: string[] = [];

  if (!UPI_ID_PATTERN.test(upiId)) {
    warnings.push("The UPI ID format is unusual. Verify it in your payment app before paying.");
  }
  if (upiId.length > 256) {
    warnings.push("The UPI ID is unusually long.");
  }

  // Check for suspicious VPA patterns
  for (const { pattern, reason } of SUSPICIOUS_VPA_PATTERNS) {
    if (pattern.test(upiId)) {
      suspiciousReasons.push(reason);
      warnings.push(`Suspicious VPA Pattern: ${reason}`);
    }
  }

  const isSuspiciousVpa = suspiciousReasons.length > 0;

  const rawName = (params.get("pn") ?? "").trim();
  const payeeName = rawName ? rawName.slice(0, 120) : undefined;
  if (rawName.length > 120) warnings.push("The payee name was truncated for display.");

  const rawAmount = (params.get("am") ?? "").trim();
  let amount: string | undefined;
  let amountValue: number | undefined;
  if (rawAmount) {
    if (AMOUNT_PATTERN.test(rawAmount)) {
      const value = Number.parseFloat(rawAmount);
      if (Number.isFinite(value) && value > 0) {
        amount = rawAmount;
        amountValue = value;
      } else {
        warnings.push("The amount is zero or invalid and was not displayed.");
      }
    } else {
      warnings.push("The amount could not be parsed and was not displayed.");
    }
  }

  const rawCurrency = (params.get("cu") ?? "").trim().toUpperCase();
  let currency = "INR";
  if (rawCurrency) {
    if (CURRENCY_PATTERN.test(rawCurrency)) {
      currency = rawCurrency;
    } else {
      warnings.push("The currency code is malformed; INR is shown as the UPI default.");
    }
  }

  const rawNote = (params.get("tn") ?? "").trim();
  const transactionNote = rawNote ? rawNote.slice(0, 200) : undefined;
  if (rawNote.length > 200) warnings.push("The transaction note was truncated for display.");

  const merchantCode = (params.get("mc") ?? "").trim() || undefined;
  const transactionRef = (params.get("tr") ?? "").trim() || undefined;

  return {
    kind: "payment",
    payment: {
      uri: raw,
      upiId,
      payeeName,
      amount,
      amountValue,
      currency,
      transactionNote,
      merchantCode,
      transactionRef,
      warnings,
      isSuspiciousVpa,
      suspiciousReasons,
    },
  };
}

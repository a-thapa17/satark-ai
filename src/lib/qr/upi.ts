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
}

export type UpiParseOutcome =
  | { kind: "payment"; payment: UpiPaymentDetails }
  | { kind: "invalid"; reason: string }
  | { kind: "not_upi" };

const UPI_ID_PATTERN = /^[A-Za-z0-9._-]{2,256}@[A-Za-z][A-Za-z0-9.-]{1,64}$/;
const AMOUNT_PATTERN = /^\d{1,9}(?:\.\d{1,2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

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
  if (!UPI_ID_PATTERN.test(upiId)) {
    warnings.push("The UPI ID format is unusual. Verify it in your payment app before paying.");
  }
  if (upiId.length > 256) {
    warnings.push("The UPI ID is unusually long.");
  }

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
    },
  };
}

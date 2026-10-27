/**
 * Client-Side PII Masking Utility
 * Redacts sensitive Indian identifiers in-memory before analysis diagnostics
 * so secrets are never displayed or stored in logs.
 */

export interface MaskResult {
  maskedText: string;
  maskedItemsCount: number;
  itemTypesFound: string[];
}

export function maskSensitiveData(text: string): MaskResult {
  if (!text || typeof text !== "string") {
    return { maskedText: "", maskedItemsCount: 0, itemTypesFound: [] };
  }

  let masked = text;
  let count = 0;
  const types = new Set<string>();

  // 1. Credit / Debit Card Numbers (16 digits, with optional spaces or hyphens)
  // Example: 4532 1234 5678 9012 or 4532-1234-5678-9012
  const cardRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  masked = masked.replace(cardRegex, (match) => {
    // Only mask if it's 16 digits
    const digits = match.replace(/\D/g, "");
    if (digits.length === 16) {
      count++;
      types.add("Payment Card");
      return "[MASKED_CARD_NUMBER]";
    }
    return match;
  });

  // 2. Aadhaar Numbers (12 digits, standard Indian formatting xxxx xxxx xxxx
  // or 12 continuous digits). Matching unformatted 12-digit values too avoids
  // sending a real Aadhaar number to the AI layer simply because separators
  // were omitted.
  // Matches 12-digit Aadhaar with any combination of spaces, hyphens, or no separator
  const aadhaarRegex = /\b\d{4}[\s-]*\d{4}[\s-]*\d{4}\b/g;
  masked = masked.replace(aadhaarRegex, () => {
    count++;
    types.add("Aadhaar Number");
    return "[MASKED_AADHAAR]";
  });

  // 3. Indian PAN Card Numbers: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
  // Matches 10-character Indian PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F) with optional internal spaces
  const panRegex = /\b[A-Za-z]{5}[\s-]?[0-9]{4}[\s-]?[A-Za-z]{1}\b/gi;
  masked = masked.replace(panRegex, () => {
    count++;
    types.add("PAN ID");
    return "[MASKED_PAN]";
  });

  // 4. OTP / Verification codes (4-6 digits near keywords like OTP, code, pin)
  const otpContextRegex =
    /(?:otp|code|one[ -]time[ -](?:password|code)|pin|verification(?: code)?|security code)\s*(?:is|:|-|=)?\s*([0-9]{4,6})\b/gi;
  masked = masked.replace(otpContextRegex, (fullMatch, code) => {
    count++;
    types.add("OTP / Secret Code");
    return fullMatch.replace(code, "[MASKED_OTP]");
  });

  // Some legitimate and fraudulent messages put the code before the label:
  // "492019 is your OTP". The keyword-first rule above cannot see that.
  const otpBeforeLabelRegex =
    /\b(\d{4,6})\b(?=\s*(?:is|as|:|-)?\s*(?:your|the)?\s*(?:login|verification|security|one[ -]time)?\s*(?:otp|one[ -]time[ -](?:password|code)|verification code|security code|pin)\b)/gi;

  // Standalone 6-digit verification code regex near words or explicit 6-digit code patterns
  const explicitSixDigitOtp = /\b(?:code|otp|pin|token)[\s:]+(\d{6})\b/gi;
  masked = masked.replace(explicitSixDigitOtp, (fullMatch, code) => {
    count++;
    types.add("OTP / Secret Code");
    return fullMatch.replace(code, "[MASKED_OTP]");
  });
  masked = masked.replace(otpBeforeLabelRegex, () => {
    count++;
    types.add("OTP / Secret Code");
    return "[MASKED_OTP]";
  });

  // 5. CVV values are short and often appear as "CVV: 123" or "123 is the CVV".
  const cvvContextRegex = /(?:cvv|cvc)\s*(?:is|:|-|=)?\s*(\d{3,4})\b/gi;
  masked = masked.replace(cvvContextRegex, (fullMatch, code) => {
    count++;
    types.add("Card CVV");
    return fullMatch.replace(code, "[MASKED_CVV]");
  });
  const cvvBeforeLabelRegex =
    /\b(\d{3,4})\b(?=\s*(?:is|as|:|-)?\s*(?:your|the)?\s*(?:card\s*)?(?:cvv|cvc)\b)/gi;
  masked = masked.replace(cvvBeforeLabelRegex, () => {
    count++;
    types.add("Card CVV");
    return "[MASKED_CVV]";
  });

  // 6. Long Bank Account Numbers (9 to 18 digits preceded by a/c, ac, account)
  const accRegex =
    /(?:a\/c|ac|account|acc(?:\s*no)?)\s*(?:is|:|-|=)?\s*(\d{9,18})\b/gi;
  masked = masked.replace(accRegex, (fullMatch, acc) => {
    count++;
    types.add("Bank Account");
    return fullMatch.replace(acc, "[MASKED_ACCOUNT]");
  });

  // 7. Email Addresses (e.g. support@fake-sbi.com, victim@gmail.com)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  masked = masked.replace(emailRegex, () => {
    count++;
    types.add("Email Address");
    return "[MASKED_EMAIL]";
  });

  // 8. Indian Mobile Phone Numbers (+91 / 0 prefix optional, 10 digits starting with 6, 7, 8, 9)
  // Example: +91 98765 43210, +91-9876543210, 9876543210, 98765 43210
  const phoneRegex = /(?:\+91[\s-]?)?(?:\b0)?[6-9]\d{4}[\s-]?\d{5}\b/g;
  masked = masked.replace(phoneRegex, () => {
    count++;
    types.add("Phone Number");
    return "[MASKED_PHONE]";
  });

  return {
    maskedText: masked,
    maskedItemsCount: count,
    itemTypesFound: Array.from(types),
  };
}

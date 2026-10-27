import type { DetectedSignal, SignalCategory, SignalSeverity } from "./types.ts";

export interface RuleDefinition {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  label: string;
  weight: number;
  explanation: string;
  test: (text: string, lower: string) => boolean | RegExpMatchArray | null;
}

/** Generic http(s)/www URL — presence only; not a standalone scam indicator. */
export function hasGenericHttpUrl(text: string): boolean {
  // Accept a bare protocol too: malformed/truncated links are still a reason
  // to show the "link destination was not checked" limitation.
  return /(?:https?:\/\/|www\.)[^\s<>"']*/i.test(text);
}

const CLAUSE_BOUNDARY = /[.!?;\n]/;

/**
 * Returns the sentence/clause around a match. Context rules must not scan the
 * whole message for a negation: a scam can append "never share OTP" after an
 * active request and otherwise suppress the credential rule.
 */
function clauseBounds(text: string, index: number): { start: number; end: number } {
  let start = 0;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (CLAUSE_BOUNDARY.test(text[cursor] ?? "")) {
      start = cursor + 1;
      break;
    }
  }
  const butIndex = text.lastIndexOf(" but ", index);
  if (butIndex >= start) start = butIndex + 5;

  let end = text.length;
  for (let cursor = index; cursor < text.length; cursor += 1) {
    if (CLAUSE_BOUNDARY.test(text[cursor] ?? "")) {
      end = cursor;
      break;
    }
  }
  return { start, end };
}

/**
 * A match is warning context when the same clause frames it as advice, a
 * scam-awareness warning, or a direct negation of the matched action.
 */
function isWarningContext(text: string, index: number, matchedText: string): boolean {
  const { start, end } = clauseBounds(text, index);
  const prefix = text.slice(start, index);
  const suffix = text.slice(index + matchedText.length, end);

  const genericWarning =
    /\b(?:beware|warning|caution|advisory|scam(?:mers?)?|fraud(?:sters?|ulent)?|phishing|fake|impersonat\w*|under (?:no|any) circumstances|legitimate (?:banks?|companies|organizations?)|report (?:it|them|this|such)|(?:never|do not|don'?t)\s+trust)\b/i.test(
      prefix
    ) ||
    /\bif (?:someone|anyone|a caller|the caller|a stranger)\b[^.!?;\n]{0,60}\b(?:asks?|tells?|claims?|says?)\b/i.test(
      prefix
    ) ||
    /\b(?:banks?|companies|organizations?|we)\s+(?:never|do not|don'?t)\s+(?:ask|request|need)\b/i.test(
      prefix
    );
  if (genericWarning) return true;
  if (
    /\b(?:is|are|was|were)\s+(?:a\s+)?(?:scam|fraud|fraudulent|phishing)\b/i.test(
      suffix
    )
  ) {
    return true;
  }

  const action = (matchedText.match(/[a-z]+/i)?.[0] ?? "").toLowerCase();
  if (!action) return false;

  const window = text.slice(start, Math.min(end, index + matchedText.length + 24));
  const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const directNegation = new RegExp(
    `\\b(?:never|do not|don'?t|avoid|refuse to)\\s*,?\\s*(?:ever\\s+)?${escapedAction}\\b`,
    "i"
  ).test(window);
  if (directNegation) return true;

  const needNot = new RegExp(
    `\\b(?:never|do not|don'?t|no need to)\\s+(?:ever\\s+)?(?:need|have)\\s+to\\s+(?:ever\\s+)?${escapedAction}\\b`,
    "i"
  ).test(window);
  if (needNot) return true;

  // A negated action list such as "Never scan a QR code or enter your PIN"
  // makes every action in that clause advisory, including actions after "or".
  // Keep the negator adjacent to the first warning action so active wording
  // like "Do not forget to scan …" is not accidentally suppressed.
  return /\b(?:never|do not|don'?t|no need to)\b\s+(?:ever\s+)?(?:need\s+to\s+)?(?:scan|enter|share|send|click|pay|use|install|download|open|reply|provide|submit|disclose|trust|invest|believe)\b[^.!?;\n]{0,40}\b(?:or|and)\s*$/i.test(
    prefix
  );
}

function hasActiveMatch(text: string, pattern: RegExp): boolean {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const global = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  while ((match = global.exec(text)) !== null) {
    if (!isWarningContext(text, match.index, match[0])) return true;
    if (match[0].length === 0) global.lastIndex += 1;
  }
  return false;
}

/** Unsolicited valuable prize / free-gift lure (must be combined with another risk factor). */
export function hasUnsolicitedValuablePrize(lower: string): boolean {
  return /\b(?:claim\s+(?:ur|your|the)\s+(?:free\s+)?(?:iphone|ipad|smartphone|laptop|gift(?:\s*card)?|prize|reward)|free\s+(?:iphone|ipad|smartphone|laptop|gift(?:\s*card)?|prize|reward)|(?:you(?:['’]?ve|\s+have)?\s+won|congratulations.{0,50}won)|unclaimed\s+(?:prize|reward|gift)|lucky\s+winner|claim\s+your\s+prize)\b/i.test(
    lower
  );
}

export function hasUpfrontFeeAsk(lower: string): boolean {
  return /\b(?:(?:upfront|registration|joining|processing|activation|clearance|release|verification|handling)\s+(?:fee|charge|deposit|payment)|advance\s+(?:fee|payment|deposit)|deposit\s+rs\.?\s*\d+|pay\s+(?:rs\.?|inr)?\s*\d+\s+(?:(?:as\s+)?(?:fee|deposit|registration)|to\s+(?:unlock|activate|start|join|access|release))|fee\s+to\s+(?:claim|release|receive)|registration fee to claim)\b/i.test(
    lower
  );
}

export function hasHighJobEarningsLure(lower: string): boolean {
  return /\b(?:work from home|part[- ]time job|earn\s+(?:rs\.?|inr|₹)?\s*\d+|guaranteed\s+(?:income|salary|earnings)|₹\s*\d+\s*(?:\/|per)\s*(?:day|month)|prepaid task)\b/i.test(
    lower
  );
}

export function hasAccountSuspensionThreat(lower: string): boolean {
  return /\b(?:will be (?:blocked|suspended|deactivated|terminated|closed|frozen)|account (?:has been|is|will be) (?:blocked|suspended|frozen|restricted)|urgent(?:ly)?\s+(?:account\s+)?(?:suspension|block))\b/i.test(
    lower
  );
}

/** Active request to disclose a verification secret — not a warning about doing so. */
export function hasCredentialOrOtpAsk(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:share|send|forward|tell|provide|disclose|reply with)\s+(?:\w+\s+){0,4}(?:otp|pin|mpin|cvv|password|passcode|6[ -]?digit)\b/gi
  );
}

/** Active demand to verify login credentials through a link/message. */
export function hasActiveCredentialVerificationDemand(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:verify|validate|update|submit)\s+(?:your\s+)?(?:netbanking|internet banking|credit card|debit card|atm pin|login password)\b/gi
  );
}

/** A request for identity documents, excluding advice such as "do not send Aadhaar". */
export function hasIdentityDocumentAsk(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:send|share|upload|provide|submit|reply with)\b[^.!?;\n]{0,70}\b(?:aadhaar|aadhar|pan card|cancelled cheque|passbook)\b/gi
  );
}

/** A request for bank, card, or UPI identifiers. Used only with another lure. */
export function hasBankDetailAsk(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:send|share|provide|submit|reply with|upload)\b[^.!?;\n]{0,80}\b(?:bank\s+(?:account|a\/c)|account number|ifsc|cvv|card\s+(?:number|details)|upi id)\b/gi
  );
}

/**
 * Official Aadhaar/UIDAI contact channels. A bare "KYC is pending" notice is
 * common legitimate onboarding copy; it should not be treated like a phishing
 * demand when it points people to UIDAI, mAadhaar, 1947, or a bank branch.
 * The domain check requires a real hostname boundary so an attacker cannot
 * borrow trust with a hostname such as uidai.gov.in.evil.example.
 */
function hasOfficialAadhaarContext(lower: string): boolean {
  return (
    /(?:^|[/\s])(?:https?:\/\/)?(?:www\.)?uidai\.gov\.in(?=$|[/\s?#])/i.test(
      lower
    ) ||
    /\b(?:maadhaar|aadhaar seva kendra|uidai (?:centre|center)|1947)\b/i.test(
      lower
    ) ||
    /\bauthori[sz]ed (?:aadhaar|uidai)(?:\s+(?:centre|center|portal))?\b/i.test(
      lower
    ) ||
    /\b(?:nearest|your|the)\s+bank\s+branch\b/i.test(lower)
  );
}

/**
 * Fake-KYC lure rather than a routine Aadhaar onboarding reminder.
 * A KYC mention needs pressure, an unofficial contact route, or an active
 * request for secrets/documents. Official UIDAI/bank-branch guidance without
 * those risk factors is treated as legitimate onboarding copy.
 */
export function hasFakeKycLure(text: string, lower: string): boolean {
  if (
    !hasActiveMatch(
      lower,
      /\b(?:kyc (?:(?:is|was|has been|will be)\s+)?(?:expired|suspended|pending|mandatory|incomplete|verification)|update (?:your )?kyc|re-?kyc)\b/gi
    )
  ) {
    return false;
  }

  const officialContext = hasOfficialAadhaarContext(lower);
  const credentialOrDocumentAsk =
    hasCredentialOrOtpAsk(lower) || hasIdentityDocumentAsk(lower);
  const suspiciousLink = hasSuspiciousUrlSignal(text);
  const anyLink = hasGenericHttpUrl(text);
  const mobileNumber = DIALABLE_MOBILE.test(text);
  const clickOrCall = /\b(?:click|link|visit|download|install|call)\b/i.test(lower);
  const pressure =
    /\b(?:immediate(?:ly)?|urgent(?:ly)?|within\s+\d+|today|tonight|last\s+(?:date|day|chance)|final\s+(?:warning|notice)|expire[ds]?|expiry|suspend(?:ed|ing)?|block(?:ed|ing)?|deactivat(?:e|ed|ion)|frozen|penalt(?:y|ies)|mandatory)\b/i.test(
      lower
    );

  // "Update your KYC only at uidai.gov.in" is a warning, not a lure.
  if (officialContext && !suspiciousLink && !credentialOrDocumentAsk) {
    return false;
  }

  if (credentialOrDocumentAsk || suspiciousLink) return true;
  if (anyLink || mobileNumber) return true;
  if (clickOrCall) return true;
  return pressure;
}

/**
 * UPI receive-money trap in either word order. A genuine UPI receipt never
 * needs the recipient to scan a QR code or enter a PIN.
 */
export function hasUpiPinReceiveLure(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:(?:scan|use)\s+(?:this\s+|the\s+)?(?:qr|code)\b[^.!?;\n]{0,80}\b(?:to\s+)?(?:receive|get|accept|collect)\s+(?:the\s+)?(?:money|payment|cashback|refund|amount|reward|cash|funds|rs\.?\s*[\d,.]+)\b|(?:enter|submit|type)\s+(?:your\s+)?(?:upi\s+)?(?:pin|mpin)\b[^.!?;\n]{0,60}\b(?:to\s+)?(?:receive|get|accept|collect)\s+(?:the\s+)?(?:money|payment|cashback|refund|amount|reward|cash|funds|rs\.?\s*[\d,.]+)\b|(?:receive|get|accept|collect)\s+(?:the\s+)?(?:money|payment|cashback|refund|amount|reward|cash|funds|rs\.?\s*[\d,.]+)\b[^.!?;\n]{0,80}\b(?:scan|enter|submit|type)\b[^.!?;\n]{0,60}\b(?:qr|pin|mpin)\b|receive\s+(?:cashback|refund|money)\s+by\s+entering|claim\s+refund\s+enter\s+pin)\b/gi
  );
}

/** Loan approval used to demand an upfront processing or activation fee. */
export function hasLoanApprovalFeeScam(lower: string): boolean {
  const approval =
    /\b(?:personal|home|car|business|instant|pre[- ]approved)?\s*loan\b[^.!?;\n]{0,80}\b(?:approved|pre[- ]approved|sanctioned|disburs(?:ed|al)|eligible)\b|\b(?:approved|pre[- ]approved|sanctioned)\b[^.!?;\n]{0,60}\b(?:loan|credit line)\b/i.test(
      lower
    );
  if (!approval) return false;

  const explicitPayment =
    /\b(?:pay|paid|transfer|deposit|send|remit)\b[^.!?;\n]{0,70}\b(?:processing|activation|verification|insurance|file|documentation|handling|service|advance)\s+(?:fee|charge|payment|deposit)\b/i.test(
      lower
    );
  const noFee =
    /\b(?:no|without|zero|waived)\s+(?:any\s+)?(?:processing|activation|verification|insurance|documentation|handling)\s+(?:fee|charge|payment|deposit)\b/i.test(
      lower
    );
  if (noFee && !explicitPayment) return false;

  return hasActiveMatch(
    lower,
    /\b(?:pay|paid|transfer|deposit|send|remit)\b[^.!?;\n]{0,70}\b(?:processing|activation|verification|insurance|file|documentation|handling|service|advance)\s+(?:fee|charge|payment|deposit)\b|\b(?:processing|activation|verification|insurance|file|documentation|handling|advance)\s+(?:fee|charge|payment|deposit)\b[^.!?;\n]{0,60}\b(?:before|to\s+(?:get|receive|release|process|disburse)|must\s+be\s+paid|has\s+to\s+be\s+paid|needs?\s+to\s+be\s+paid)\b/gi
  );
}

/** Guaranteed high-frequency or multiplication returns, a classic investment fraud lure. */
export function hasGuaranteedHighReturnLure(lower: string): boolean {
  const promise = /\b(?:guarantee[ds]?|assured|risk[- ]free)\b/i.test(lower);
  if (!promise) return false;

  return hasActiveMatch(
    lower,
    /\b(?:\d{1,3}\s*%\s*(?:daily|weekly|monthly|per\s+(?:day|week|month)|(?:a|every|each)\s+(?:day|week|month))|(?:daily|weekly|monthly)\s+(?:returns?|profits?|income|gains?)|(?:double|triple)\s+(?:your\s+)?(?:money|investment)|(?:rs\.?|inr|₹)\s*[\d,.]+\s*(?:lakh|crore)?\s*(?:daily|weekly|monthly|per\s+(?:day|week|month)))\b/gi
  );
}

/** Refund/rebate context; "refund policy" alone is not enough. */
export function hasRefundLure(lower: string): boolean {
  return (
    /\b(?:refund|tax rebate|reimbursement|money[- ]back)\b/i.test(lower) &&
    /\b(?:pending|approved|eligible|claim|release|process(?:ing)?|credited|transfer|receive|failed|on hold)\b/i.test(
      lower
    )
  );
}

export function hasRefundWithFee(lower: string): boolean {
  return hasRefundLure(lower) && hasUpfrontFeeAsk(lower);
}

/** A delivery/courier problem paired with a payment or address-change demand. */
export function hasDeliveryPaymentLure(text: string, lower: string): boolean {
  const delivery = /\b(?:parcel|package|shipment|courier|consignment|delivery)\b/i.test(lower);
  const problem =
    /\b(?:pending|held|stuck|failed|awaiting|address (?:update|issue)|update (?:the |your )?address|redelivery|reschedule|customs|clearance|release|returned)\b/i.test(
      lower
    );
  const payment = /\b(?:pay|payment|fee|charge|customs duty|clearance|deposit)\b/i.test(lower);
  const addressChange = /\b(?:address (?:update|issue)|update (?:the |your )?address|redelivery|reschedule)\b/i.test(
    lower
  );
  if (!delivery || !problem || !hasGenericHttpUrl(text)) return false;
  // Payment lures are risky with any link. Address-only messages are only
  // flagged without a fee when the link itself is obfuscated or lookalike.
  return payment || (addressChange && hasSuspiciousUrlSignal(text));
}

/** Remote-access app solicitation, excluding fraud-awareness warnings. */
export function hasRemoteAccessSolicitation(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:install|download|open|run|use|get|share|send|give)\b[^.!?;\n]{0,60}\b(?:anydesk|teamviewer|rustdesk|quicksupport|screen[ -]?sharing?)\b/gi
  );
}

/** APK install request, excluding advice such as "do not install APK files". */
export function hasApkInstallSolicitation(lower: string): boolean {
  return hasActiveMatch(
    lower,
    /\b(?:download|install|open|run|sideload|update)\b[^.!?;\n]{0,50}\b(?:apk|\.apk)\b/gi
  );
}

const DIALABLE_MOBILE = /(?:\+91[\s-]?)?\b[6-9]\d{4}[\s-]?\d{5}\b/;

/** Utility disconnection scams almost always point to an unofficial mobile or link. */
export function hasUtilityScamContact(text: string): boolean {
  return (
    DIALABLE_MOBILE.test(text) ||
    hasSuspiciousUrlSignal(text) ||
    /(?:https?:\/\/)?(?:[a-z0-9-]+\.)*(?:electricity|bijli|discom|power)[a-z0-9-]*\.(?:top|xyz|buzz|club|online|site|cc|tk|ml|cf|icu|vip|click)\b/i.test(
      text
    )
  );
}

/** A shortener, brand lookalike, or raw-IP URL. */
export function hasSuspiciousUrlSignal(text: string): boolean {
  return (
    /(?:https?:\/\/)?(?:www\.)?(?:bit\.ly|tinyurl\.com|is\.gd|cutt\.ly|t\.co|rb\.gy|shorturl\.at|ow\.ly|tiny\.cc)\/[a-zA-Z0-9_\-]+/i.test(
      text
    ) ||
    hasBrandLookalikeDomain(text) ||
    /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/i.test(text)
  );
}

interface BrandDomainRule {
  tokens: string[];
  officialDomains: string[];
}

const BRAND_DOMAINS: BrandDomainRule[] = [
  {
    tokens: ["sbi", "onlinesbi", "yono"],
    officialDomains: ["sbi.co.in", "onlinesbi.sbi", "sbicard.com", "sbiyono.sbi"],
  },
  {
    tokens: ["hdfc"],
    officialDomains: ["hdfcbank.com", "hdfc.com", "hdfclife.com", "hdfcsec.com", "hdfcbank.net"],
  },
  {
    tokens: ["icici"],
    officialDomains: ["icicibank.com", "icicibank.co.in", "icicidirect.com", "icicilombard.com"],
  },
  {
    tokens: ["axis"],
    officialDomains: ["axisbank.com", "axisbank.co.in", "axismaxlife.com"],
  },
  { tokens: ["pnb"], officialDomains: ["pnbindia.in", "pnb.co.in"] },
  { tokens: ["kotak"], officialDomains: ["kotak.com", "kotakbank.com"] },
  { tokens: ["idfc"], officialDomains: ["idfcfirstbank.com", "idfcbank.com"] },
  { tokens: ["bankofbaroda"], officialDomains: ["bankofbaroda.in", "bankofbaroda.com"] },
  { tokens: ["canara"], officialDomains: ["canarabank.com", "canarabank.in"] },
  {
    tokens: ["unionbank"],
    officialDomains: ["unionbankofindia.co.in", "unionbankofindia.com"],
  },
  { tokens: ["paytm"], officialDomains: ["paytm.com", "paytmbank.com"] },
  { tokens: ["phonepe"], officialDomains: ["phonepe.com"] },
  { tokens: ["gpay", "googlepay"], officialDomains: ["pay.google.com", "google.com"] },
  { tokens: ["bhim"], officialDomains: ["bhimupi.org.in"] },
  { tokens: ["rbi"], officialDomains: ["rbi.org.in"] },
  { tokens: ["npci"], officialDomains: ["npci.org.in"] },
  { tokens: ["uidai", "aadhaar", "aadhar"], officialDomains: ["uidai.gov.in"] },
  { tokens: ["irctc"], officialDomains: ["irctc.co.in", "irctc.com"] },
  { tokens: ["incometax", "gst"], officialDomains: ["incometax.gov.in", "gst.gov.in"] },
  { tokens: ["epfo"], officialDomains: ["epfindia.gov.in"] },
  { tokens: ["cbic"], officialDomains: ["cbic.gov.in"] },
  {
    tokens: ["amazon"],
    officialDomains: [
      "amazon.in",
      "amazon.com",
      "amazon.co.uk",
      "amazon.de",
      "amazon.fr",
      "amazon.ca",
      "amazon.com.au",
      "amazon.co.jp",
    ],
  },
  { tokens: ["flipkart"], officialDomains: ["flipkart.com"] },
  { tokens: ["myntra"], officialDomains: ["myntra.com"] },
  { tokens: ["meesho"], officialDomains: ["meesho.com"] },
  { tokens: ["snapdeal"], officialDomains: ["snapdeal.com"] },
  { tokens: ["indiapost"], officialDomains: ["indiapost.gov.in", "indiapost.com"] },
  { tokens: ["delhivery"], officialDomains: ["delhivery.com"] },
  { tokens: ["bluedart"], officialDomains: ["bluedart.com"] },
  { tokens: ["dtdc"], officialDomains: ["dtdc.in", "dtdc.com"] },
  { tokens: ["fedex"], officialDomains: ["fedex.com"] },
  { tokens: ["dhl"], officialDomains: ["dhl.com", "dhl.co.in"] },
  { tokens: ["ekart"], officialDomains: ["ekartlogistics.com"] },
  { tokens: ["xpressbees"], officialDomains: ["xpressbees.com"] },
  { tokens: ["whatsapp"], officialDomains: ["whatsapp.com"] },
  { tokens: ["telegram"], officialDomains: ["telegram.org", "t.me"] },
];

/**
 * Detects a trusted brand token inside an unofficial domain. Labels are
 * tokenised on dots and hyphens, so amazonaws.com and notsbi.com do not match
 * while amazon-delivery-help.top and sbi.kyc-verify.xyz do.
 */
export function hasBrandLookalikeDomain(text: string): boolean {
  const domains = text.match(/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi) ?? [];
  for (const candidate of domains) {
    const host = candidate.toLowerCase().replace(/\.$/, "");
    if (!host) continue;

    for (const brand of BRAND_DOMAINS) {
      const labels = host.split(".").flatMap((label) => label.split("-"));
      if (!brand.tokens.some((token) => labels.includes(token))) continue;

      const official = brand.officialDomains.some(
        (domain) => host === domain || host.endsWith(`.${domain}`)
      );
      if (!official) return true;
    }
  }
  return false;
}

/**
 * Defensive indicators commonly found in genuine bank/security advisories.
 * When present, they offset generic keyword matches and prevent false alarms.
 */
export const DEFENSIVE_PATTERNS: RuleDefinition[] = [
  {
    id: "DEF_DO_NOT_SHARE",
    category: "DEFENSIVE_SIGNAL",
    severity: "DEFENSIVE",
    label: "Legitimate Security Warning Included",
    weight: -25,
    explanation:
      "The message contains a standard security warning advising the recipient NEVER to share their OTP, PIN, or password with anyone, which is standard practice for legitimate banks and institutions.",
    test: (_, lower) =>
      /\b(?:do not share|never share|don'?t share|do not disclose|never disclose|bank never asks?|do not reply|never call back on this)\b/i.test(
        lower
      ),
  },
  {
    id: "DEF_STANDARD_BANK_UPDATE",
    category: "DEFENSIVE_SIGNAL",
    severity: "DEFENSIVE",
    label: "Standard Transaction Notification Format",
    weight: -20,
    explanation:
      "The message follows standard Indian banking notification formats (debit/credit amount, remaining balance, merchant reference) without soliciting any action from the recipient.",
    test: (_, lower) =>
      /\b(?:debited (?:by|with|for)|credited (?:with|to)|avail(?:able)? bal(?:ance)?|txn of rs\.?|inr \d+)\b/i.test(
        lower
      ) &&
      !/\b(?:click|update|verify|call urgently|blocked|suspended|disconnect)\b/i.test(
        lower
      ),
  },
];

/**
 * Threat indicators for malicious patterns.
 */
export const THREAT_RULES: RuleDefinition[] = [
  // -------------------------------------------------------------
  // 1. CREDENTIAL SOLICITATION (Active requests to give up secrets)
  // -------------------------------------------------------------
  {
    id: "CRED_SOLICIT_ACTIVE",
    category: "CREDENTIAL_SOLICITATION",
    severity: "CRITICAL",
    label: "Request to Share OTP, PIN or Passwords",
    weight: 45,
    explanation:
      "Legitimate banks, government bodies, and service providers NEVER ask you to disclose, forward, or reply with your OTP, PIN, CVV, or passwords. Any message demanding you 'share' or 'send' a verification code is almost certainly fraudulent.",
    test: (_, lower) => hasCredentialOrOtpAsk(lower),
  },
  {
    id: "CRED_VERIFY_CREDENTIALS",
    category: "CREDENTIAL_SOLICITATION",
    severity: "HIGH",
    label: "Demand to Verify Banking Credentials via Link",
    weight: 35,
    explanation:
      "Demands to 'verify netbanking', 'confirm card details', or 'submit CVV/expiry' to keep accounts operational are typical phishing lures used to harvest login data.",
    test: (_, lower) => hasActiveCredentialVerificationDemand(lower),
  },

  // -------------------------------------------------------------
  // 2. URGENCY & COERCION (Pressure tactics to bypass logic)
  // -------------------------------------------------------------
  {
    id: "URG_TIME_LIMIT",
    category: "URGENCY_COERCION",
    severity: "HIGH",
    label: "Artificial Countdown or Immediate Deadline",
    weight: 15,
    explanation:
      "Scammers manufacture false urgency (e.g. 'within 10 minutes', 'within 24 hours', 'immediate action required') to panic victims into acting impulsively before they have time to verify.",
    test: (_, lower) => {
      const deadline =
        /\b(?:within|in) (?:10|15|20|30|60) (?:mins?|minutes?)\b|\bwithin 24 hours?\b/i.test(
          lower
        );
      const urgent = /\b(?:urgently|immediately|last notice|final warning)\b/i.test(lower);
      const riskContext =
        /\b(?:account|bank|kyc|otp|pin|payment|pay|refund|claim|prize|block|suspend|deactivate|verify|link|click|update|action|respond|delivery|parcel|electricity|bill|service)\b/i.test(
          lower
        );
      return deadline || (urgent && riskContext);
    },
  },
  {
    id: "URG_SERVICE_BLOCK",
    category: "URGENCY_COERCION",
    severity: "HIGH",
    label: "Threat of Account Suspension or Block",
    weight: 30,
    explanation:
      "Threatening that your bank account, SIM card, or PAN card will be 'blocked', 'deactivated', or 'suspended' is a classic fear tactic to force quick compliance.",
    test: (_, lower) =>
      /\b(?:will be (?:blocked|suspended|deactivated|terminated|closed|frozen)|account (?:has been|is) (?:blocked|suspended|frozen|restricted))\b/i.test(
        lower
      ),
  },
  {
    id: "URG_UTILITY_DISCONNECTION",
    category: "URGENCY_COERCION",
    severity: "CRITICAL",
    label: "Electricity / Power Disconnection Scam (Bijli Scam)",
    weight: 40,
    explanation:
      "A widespread scam in India claims your electricity bill was not updated and the power will be disconnected tonight at 9:30 PM, instructing you to call an unofficial mobile number.",
    test: (text, lower) =>
      /\b(?:electricity|power supply|bijli)\b/i.test(lower) &&
      /\b(?:disconnect(?:ed)?|cut (?:off)?)\b/i.test(lower) &&
      /\b(?:tonight|today|at (?:9|9:30|10)\s*pm|unpaid|bill update)\b/i.test(lower) &&
      hasUtilityScamContact(text),
  },
  {
    id: "URG_LEGAL_ARREST_EXTORTION",
    category: "URGENCY_COERCION",
    severity: "CRITICAL",
    label: "Digital Arrest / Law Enforcement Coercion",
    weight: 45,
    explanation:
      "Fake police, CBI, customs, or court summons threatening immediate arrest, narcotics in courier parcels, or money laundering cases via video calls ('Digital Arrest'). Real law enforcement agencies NEVER issue arrest warrants over WhatsApp, Skype, or SMS.",
    test: (_, lower) =>
      /\b(?:digital arrest|narcotics|customs department|cbi(?:\s+(?:officer|notice|department))?|mumbai police|delhi police|arrest warrant|money laundering case|case (?:has been|is) filed|illegal parcel)\b/i.test(
        lower
      ) &&
      /\b(?:stay on (?:video\s*)?call|transfer money|reserve account|safe account|immediate arrest|arrested|court order)\b/i.test(
        lower
      ),
  },

  // -------------------------------------------------------------
  // 3. FAKE KYC & IMPERSONATION
  // -------------------------------------------------------------
  {
    id: "IMP_FAKE_KYC",
    category: "ENTITY_IMPERSONATION",
    severity: "HIGH",
    label: "Unsolicited KYC Expiry / Update Lure",
    weight: 35,
    explanation:
      "Banks never ask you to update KYC documents via links sent in SMS or WhatsApp. Legitimate KYC updates are conducted strictly through official bank branches or within the official authenticated mobile application.",
    test: (text, lower) => hasFakeKycLure(text, lower),
  },
  {
    id: "IMP_MAJOR_INDIAN_BANK",
    category: "ENTITY_IMPERSONATION",
    severity: "MEDIUM",
    label: "Impersonation of Major Financial Institution",
    weight: 20,
    explanation:
      "Scammers frequently impersonate prominent Indian institutions (SBI, HDFC, ICICI, Axis, PNB, RBI) to borrow authority and trust.",
    test: (_, lower) => {
      // Must be accompanied by an actionable request (click link, update, verify)
      const hasBank =
        /\b(?:sbi|state bank|hdfc|icici|axis bank|pnb|punjab national|yono|paytm|airtel payments)\b/i.test(
          lower
        );
      const hasAction =
        /\b(?:click|update|verify|call|link|login|resolve|apk|helpline)\b/i.test(
          lower
        );
      const standardBankUpdate =
        /\b(?:debited|credited|avail(?:able)? bal|a\/c xx)\b/i.test(lower);
      return hasBank && hasAction && !standardBankUpdate;
    },
  },

  // -------------------------------------------------------------
  // 4. SUSPICIOUS LINKS & OBFUSCATION
  // -------------------------------------------------------------
  {
    id: "LINK_SHORTENER",
    category: "SUSPICIOUS_LINK",
    severity: "HIGH",
    label: "Obfuscated / Shortened URL (URL Shortener)",
    weight: 30,
    explanation:
      "URL shorteners (bit.ly, tinyurl, is.gd, cutt.ly, etc.) conceal the actual destination domain, masking fraudulent landing pages from security scanners and users.",
    test: (text) =>
      /(?:https?:\/\/)?(?:www\.)?(?:bit\.ly|tinyurl\.com|is\.gd|cutt\.ly|t\.co|rb\.gy|shorturl\.at|ow\.ly|tiny\.cc)\/[a-zA-Z0-9_\-]+/i.test(
        text
      ),
  },
  {
    id: "LINK_LOOKALIKE_DOMAIN",
    category: "SUSPICIOUS_LINK",
    severity: "CRITICAL",
    label: "Suspicious Lookalike Brand / Banking Domain",
    weight: 40,
    explanation:
      "Unofficial domains that include trusted brand names (for example 'sbi-kyc', 'hdfc-support', 'amazon-delivery-help', or 'yono-verify') or mix them with suspicious TLDs (.top, .xyz, .cc, .buzz) are commonly used for phishing.",
    test: (text) =>
      hasBrandLookalikeDomain(text) ||
      /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)*(?:sbi[a-z0-9-]*|yono[a-z0-9-]*|hdfc[a-z0-9-]*|icici[a-z0-9-]*|kyc[a-z0-9-]*|gov[a-z0-9-]*)\.(?:top|xyz|buzz|club|online|site|app|cc|work|tk|ga|ml|cf)\b/i.test(
        text
      ),
  },
  {
    id: "LINK_RAW_IP_ADDRESS",
    category: "SUSPICIOUS_LINK",
    severity: "CRITICAL",
    label: "Direct IP Address in Link",
    weight: 40,
    explanation:
      "Legitimate consumer services never use raw IP addresses (e.g. http://192.168.x.x:8080) for user logins or customer portals.",
    test: (text) =>
      /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/i.test(text),
  },

  // -------------------------------------------------------------
  // 5. PAYMENT & UPI REVERSAL TRAPS
  // -------------------------------------------------------------
  {
    id: "PAY_RECEIVE_REQUIRES_PIN",
    category: "PAYMENT_UPI_LURE",
    severity: "CRITICAL",
    label: "UPI 'Receive Money' Scam (PIN / Scan to Receive)",
    weight: 45,
    explanation:
      "FUNDAMENTAL UPI RULE: You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money. Entering your PIN always debits funds from your account.",
    test: (_, lower) => hasUpiPinReceiveLure(lower),
  },
  {
    id: "PAY_LOAN_APPROVAL_FEE",
    category: "PAYMENT_UPI_LURE",
    severity: "CRITICAL",
    label: "Loan Approval Advance-Fee Scam",
    weight: 45,
    explanation:
      "A loan that is already approved should be disbursed directly by a regulated lender. Demanding a processing, activation, insurance, or documentation fee before disbursal is a common advance-fee scam.",
    test: (_, lower) => hasLoanApprovalFeeScam(lower),
  },
  {
    id: "PAY_ADVANCE_FEE_REFUND",
    category: "PAYMENT_UPI_LURE",
    severity: "HIGH",
    label: "Advance Processing Fee / Refund Lure",
    weight: 35,
    explanation:
      "Promises of pending refunds, tax rebates, or prize claims requiring an upfront 'processing charge' or 'clearance deposit'. A genuine refund never requires a fee paid by message.",
    test: (_, lower) =>
      hasUpfrontFeeAsk(lower) &&
      (hasRefundLure(lower) ||
        hasUnsolicitedValuablePrize(lower) ||
        /\b(?:claim|prize|lottery|kbc|reward)\b/i.test(lower)),
  },
  {
    id: "CTX_REFUND_WITH_FEE",
    category: "PAYMENT_UPI_LURE",
    severity: "CRITICAL",
    label: "Refund or Rebate Combined With an Upfront Fee",
    weight: 40,
    explanation:
      "A refund, rebate, or reimbursement that can only be released after paying a processing, clearance, or verification fee is a strong advance-fee scam pattern.",
    test: (_, lower) => hasRefundWithFee(lower),
  },

  // -------------------------------------------------------------
  // 6. TASK, JOB & LOTTERY LURES
  // -------------------------------------------------------------
  {
    id: "JOB_TASK_TELEGRAM",
    category: "JOB_PRIZE_SCAM",
    severity: "HIGH",
    label: "Part-Time Task Scam (YouTube Like / Telegram Tasks)",
    weight: 35,
    explanation:
      "Offers to earn ₹2,000–₹8,000 daily for minimal effort (e.g. liking YouTube videos, reviewing hotels on Google Maps) leading to Telegram groups that demand prepaid investment deposits.",
    test: (_, lower) => {
      const taskPattern =
        /\b(?:like (?:and|&) subscribe|lik(?:e|ing) (?:youtube )?videos?|youtube (?:likes?|videos?)|telegram|prepaid task|hotel review|google maps review|complete tasks?)\b/i.test(
          lower
        );
      if (taskPattern) {
        return (
          hasHighJobEarningsLure(lower) ||
          /\b(?:earn|income|salary|payment|commission|task|part[- ]time)\b/i.test(lower)
        );
      }
      return hasHighJobEarningsLure(lower) && hasUpfrontFeeAsk(lower);
    },
  },
  {
    id: "JOB_LOTTERY_KBC_PRIZE",
    category: "JOB_PRIZE_SCAM",
    severity: "HIGH",
    label: "Lottery / Lucky Draw / KBC Prize Claim",
    weight: 35,
    explanation:
      "Bogus claims that you have won a lottery or lucky draw (e.g. Kaun Banega Crorepati / WhatsApp Lucky Draw) that you never entered.",
    test: (_, lower) =>
      /\b(?:kbc|kaun banega crorepati|lucky draw|won (?:rs\.?|inr|cash)|lottery prize|claim your prize)\b/i.test(
        lower
      ),
  },

  // -------------------------------------------------------------
  // 7. INVESTMENT / TRADING LURES
  // -------------------------------------------------------------
  {
    id: "INVEST_GUARANTEED_HIGH_RETURN",
    category: "INVESTMENT_SCAM",
    severity: "CRITICAL",
    label: "Guaranteed High-Return Investment Lure",
    weight: 50,
    explanation:
      "Promises of guaranteed daily, weekly, or monthly returns, or of doubling your money, are hallmarks of investment fraud. Regulated market investments never guarantee fixed high returns.",
    test: (_, lower) => hasGuaranteedHighReturnLure(lower),
  },

  // -------------------------------------------------------------
  // 8. MALICIOUS APKS & REMOTE ACCESS TOOLS
  // -------------------------------------------------------------
  {
    id: "APP_MALICIOUS_APK",
    category: "MALICIOUS_APP_ACCESS",
    severity: "CRITICAL",
    label: "Direct APK File Download Lure",
    weight: 45,
    explanation:
      "Requests to download and install .apk packages outside official app stores (Google Play Store). Sideloaded APKs frequently contain keyloggers and SMS interceptors that steal bank OTPs.",
    test: (_, lower) => hasApkInstallSolicitation(lower),
  },
  {
    id: "APP_REMOTE_ACCESS_SOFTWARE",
    category: "MALICIOUS_APP_ACCESS",
    severity: "CRITICAL",
    label: "Remote Screen-Share Tool Solicitation",
    weight: 45,
    explanation:
      "Instruction to install screen-sharing applications (AnyDesk, TeamViewer, RustDesk, QuickSupport) under the pretext of 'customer care support' gives scammers complete remote control of your phone and banking apps.",
    test: (_, lower) => hasRemoteAccessSolicitation(lower),
  },

  // -------------------------------------------------------------
  // 8. IDENTITY THEFT (Unsolicited ID Documents)
  // -------------------------------------------------------------
  {
    id: "ID_DOCUMENT_REQUEST",
    category: "IDENTITY_THEFT",
    severity: "HIGH",
    label: "Solicitation of Identity Document Photos",
    weight: 30,
    explanation:
      "Requests to send photos of Aadhaar card, PAN card, or cancelled cheques over WhatsApp, Telegram, or unverified email addresses.",
    test: (_, lower) => hasIdentityDocumentAsk(lower),
  },

  // -------------------------------------------------------------
  // 9. DELIVERY, PARCEL AND COURIER LURES
  // -------------------------------------------------------------
  {
    id: "IMP_DELIVERY_PAYMENT_LURE",
    category: "ENTITY_IMPERSONATION",
    severity: "HIGH",
    label: "Delivery / Courier Fee or Address-Update Lure",
    weight: 35,
    explanation:
      "A message claiming a parcel is pending, held, or returned and demanding a fee or address update through a link is a common delivery-phishing pattern. Track parcels only in the courier's official app or website.",
    test: (text, lower) => hasDeliveryPaymentLure(text, lower),
  },

  // -------------------------------------------------------------
  // 10. CONTEXTUAL COMBINATIONS (not standalone URL or "free" mentions)
  // -------------------------------------------------------------
  {
    id: "CTX_PRIZE_LURE_WITH_LINK",
    category: "JOB_PRIZE_SCAM",
    severity: "HIGH",
    label: "Unsolicited Prize or Free Gift Combined With a Link",
    weight: 35,
    explanation:
      "An unsolicited offer of a valuable free item together with a click-through link is a common reward/phishing lure. The link’s reputation and destination were not checked; this is not confirmation that the domain is malicious.",
    test: (text, lower) => hasUnsolicitedValuablePrize(lower) && hasGenericHttpUrl(text),
  },
  {
    id: "CTX_PRIZE_WITH_FEE_OR_SECRETS",
    category: "JOB_PRIZE_SCAM",
    severity: "CRITICAL",
    label: "Prize Claim Combined With a Fee or Credential Request",
    weight: 40,
    explanation:
      "Asking for money, a processing fee, or secrets (OTP, PIN, password) to collect a prize is a strong scam pattern. Legitimate awards do not require those steps via message.",
    test: (_, lower) =>
      hasUnsolicitedValuablePrize(lower) &&
      (hasUpfrontFeeAsk(lower) || hasCredentialOrOtpAsk(lower)),
  },
  {
    id: "CTX_PRIZE_WITH_BANK_DETAILS",
    category: "JOB_PRIZE_SCAM",
    severity: "CRITICAL",
    label: "Prize or Reward Claim Asking for Bank / ID Details",
    weight: 40,
    explanation:
      "A prize, lottery, or reward claim that asks for a bank account number, IFSC, card details, Aadhaar, PAN, or a cancelled cheque is collecting sensitive identity and payment data. Genuine prizes do not require those details in a message.",
    test: (_, lower) =>
      (hasUnsolicitedValuablePrize(lower) ||
        /\b(?:kbc|kaun banega crorepati|lottery|lucky draw|reward claim)\b/i.test(lower)) &&
      (hasBankDetailAsk(lower) || hasIdentityDocumentAsk(lower)),
  },
  {
    id: "CTX_JOB_EARNINGS_WITH_UPFRONT_FEE",
    category: "JOB_PRIZE_SCAM",
    severity: "CRITICAL",
    label: "High Job Earnings Combined With an Upfront Fee",
    weight: 40,
    explanation:
      "Promises of high pay for easy work that require an upfront registration, joining, or processing fee are a typical job-scam pattern.",
    test: (_, lower) => hasHighJobEarningsLure(lower) && hasUpfrontFeeAsk(lower),
  },
  {
    id: "CTX_SUSPENSION_WITH_LINK_OR_CREDS",
    category: "URGENCY_COERCION",
    severity: "CRITICAL",
    label: "Account Suspension Threat Combined With a Link or Credential Request",
    weight: 40,
    explanation:
      "Fear of an urgent account block together with a click-through link or a request for OTP/PIN/password is a common phishing combination. Any link’s reputation was not independently verified.",
    test: (text, lower) =>
      hasAccountSuspensionThreat(lower) &&
      (hasGenericHttpUrl(text) || hasCredentialOrOtpAsk(lower)),
  },
];

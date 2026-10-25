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
  return /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/i.test(text);
}

/** Unsolicited valuable prize / free-gift lure (must be combined with another risk factor). */
export function hasUnsolicitedValuablePrize(lower: string): boolean {
  return /\b(?:claim\s+(?:ur|your|the)\s+(?:free\s+)?(?:iphone|ipad|smartphone|laptop|gift(?:\s*card)?|prize|reward)|free\s+(?:iphone|ipad|smartphone|laptop|gift(?:\s*card)?|prize|reward)|(?:you(?:['’]?ve|\s+have)?\s+won|congratulations.{0,50}won)|unclaimed\s+(?:prize|reward|gift)|lucky\s+winner|claim\s+your\s+prize)\b/i.test(
    lower
  );
}

export function hasUpfrontFeeAsk(lower: string): boolean {
  return /\b(?:(?:upfront|registration|joining|processing|activation|clearance)\s+(?:fee|charge|deposit|payment)|advance\s+(?:fee|payment|deposit)|deposit\s+rs\.?\s*\d+|pay\s+(?:rs\.?|inr)?\s*\d+\s+(?:as\s+)?(?:fee|deposit|registration)|fee\s+to\s+claim|registration fee to claim)\b/i.test(
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

export function hasCredentialOrOtpAsk(lower: string): boolean {
  return /\b(?:share|send|forward|tell|provide|disclose|reply with|enter)\s+(?:\w+\s+){0,4}(?:otp|pin|mpin|cvv|password|passcode|6[ -]?digit)\b/i.test(
    lower
  );
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
    test: (_, lower) => {
      // Must be an ACTIVE imperative ask — not a warning/negation like "Do not share your OTP"
      // Negative lookahead equivalent: check that a negation phrase does NOT precede the verb within the same clause
      const negationPresent = /\b(?:do not|never|don'?t)\s+(?:\w+\s+){0,3}(?:share|send|forward|disclose)\b/i.test(lower);
      // Active demand: verb + optional filler words (up to 4) + the sensitive credential term
      const activeAsk = /\b(?:share|send|forward|tell|provide|disclose|reply with|enter)\s+(?:\w+\s+){0,4}(?:otp|pin|mpin|cvv|password|passcode|6[ -]?digit)\b/i.test(lower);
      return activeAsk && !negationPresent;
    },
  },
  {
    id: "CRED_VERIFY_CREDENTIALS",
    category: "CREDENTIAL_SOLICITATION",
    severity: "HIGH",
    label: "Demand to Verify Banking Credentials via Link",
    weight: 35,
    explanation:
      "Demands to 'verify netbanking', 'confirm card details', or 'submit CVV/expiry' to keep accounts operational are typical phishing lures used to harvest login data.",
    test: (_, lower) =>
      /\b(?:verify|validate|update|submit)\s+(?:your\s+)?(?:netbanking|internet banking|credit card|debit card|atm pin|login password)\b/i.test(
        lower
      ),
  },

  // -------------------------------------------------------------
  // 2. URGENCY & COERCION (Pressure tactics to bypass logic)
  // -------------------------------------------------------------
  {
    id: "URG_TIME_LIMIT",
    category: "URGENCY_COERCION",
    severity: "HIGH",
    label: "Artificial Countdown or Immediate Deadline",
    weight: 30,
    explanation:
      "Scammers manufacture false urgency (e.g. 'within 10 minutes', 'within 24 hours', 'immediate action required') to panic victims into acting impulsively before they have time to verify.",
    test: (_, lower) =>
      /\b(?:within (?:10|15|20|30|60) (?:mins?|minutes?)|in (?:10|15|20|30|60) (?:mins?|minutes?)|within 24 hours?|urgently|immediately|last notice|final warning)\b/i.test(
        lower
      ),
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
    test: (_, lower) =>
      /\b(?:electricity (?:power|line|bill)|bijli|power supply)\b/i.test(lower) &&
      /\b(?:disconnect(?:ed)?|cut (?:off)?)\b/i.test(lower) &&
      /\b(?:tonight|today|at (?:9|9:30|10)\s*pm|unpaid|bill update)\b/i.test(lower),
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
      /\b(?:digital arrest|narcotics|customs department|cbi officer|mumbai police|delhi police|arrest warrant|money laundering case|illegal parcel)\b/i.test(
        lower
      ) &&
      /\b(?:stay on (?:video\s*)?call|transfer money|reserve account|immediate arrest|court order)\b/i.test(
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
    test: (_, lower) =>
      /\b(?:kyc (?:expired|suspended|pending|mandatory|incomplete|verification)|update (?:your )?kyc|re-?kyc)\b/i.test(
        lower
      ),
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
      return hasBank && hasAction;
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
    label: "Suspicious Lookalike Banking / Government Domain",
    weight: 40,
    explanation:
      "Unofficial domains featuring words like 'sbi-kyc', 'hdfc-support', 'yono-verify', or suspicious TLDs (.top, .xyz, .cc, .buzz) designed to mimic legitimate portals.",
    test: (text) =>
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
    test: (_, lower) =>
      /\b(?:enter (?:upi )?pin to receive|scan (?:qr )?to receive|receive (?:cashback|refund|money) by entering|claim refund enter pin)\b/i.test(
        lower
      ),
  },
  {
    id: "PAY_ADVANCE_FEE_REFUND",
    category: "PAYMENT_UPI_LURE",
    severity: "HIGH",
    label: "Advance Processing Fee / Refund Lure",
    weight: 30,
    explanation:
      "Promises of pending refunds, tax rebates, or prize claims requiring an upfront 'processing charge' or 'clearance deposit'.",
    test: (_, lower) =>
      /\b(?:refund of rs|tax rebate|processing fee|clearance (?:fee|deposit|charge)|advance (?:fee|payment|deposit)|deposit rs\.?\s*\d+|registration fee to claim|claim your prize.*fee|fee to claim)\b/i.test(
        lower
      ),
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
    test: (_, lower) =>
      /\b(?:earn (?:rs\.?|inr)\s*\d+[-–]\d+\s*(?:daily|per day)|like (?:and|&) subscribe|part[- ]time job|work from home|telegram (?:group|task|channel)|prepaid task)\b/i.test(
        lower
      ),
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
  // 7. MALICIOUS APKS & REMOTE ACCESS TOOLS
  // -------------------------------------------------------------
  {
    id: "APP_MALICIOUS_APK",
    category: "MALICIOUS_APP_ACCESS",
    severity: "CRITICAL",
    label: "Direct APK File Download Lure",
    weight: 45,
    explanation:
      "Requests to download and install .apk packages outside official app stores (Google Play Store). Sideloaded APKs frequently contain keyloggers and SMS interceptors that steal bank OTPs.",
    test: (text, lower) =>
      /\b\.apk\b/i.test(text) ||
      /\b(?:download (?:and install )?(?:this |the )?apk|install apk|update app via apk)\b/i.test(
        lower
      ),
  },
  {
    id: "APP_REMOTE_ACCESS_SOFTWARE",
    category: "MALICIOUS_APP_ACCESS",
    severity: "CRITICAL",
    label: "Remote Screen-Share Tool Solicitation",
    weight: 45,
    explanation:
      "Instruction to install screen-sharing applications (AnyDesk, TeamViewer, RustDesk, QuickSupport) under the pretext of 'customer care support' gives scammers complete remote control of your phone and banking apps.",
    test: (_, lower) =>
      /\b(?:anydesk|teamviewer|rustdesk|quicksupport|screen share app)\b/i.test(
        lower
      ),
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
    test: (_, lower) =>
      /\b(?:send|share|upload)\s+(?:photos? of\s+)?(?:your\s+)?(?:aadhaar|pan card|cancelled cheque|passbook)\b/i.test(
        lower
      ),
  },

  // -------------------------------------------------------------
  // 9. CONTEXTUAL COMBINATIONS (not standalone URL or "free" mentions)
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

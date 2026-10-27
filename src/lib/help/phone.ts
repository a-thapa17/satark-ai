import {
  parsePhoneNumberFromString,
  type PhoneNumber,
  type PhoneNumberType,
} from "libphonenumber-js";
import { getOfficialResources } from "./resources.ts";
import type { OfficialResource, OfficialResourceId } from "./types.ts";

export type PhoneFormatStatus = "valid" | "invalid" | "not_provided";

export interface PhoneFormatResult {
  status: PhoneFormatStatus;
  input: string;
  e164?: string;
  international?: string;
  national?: string;
  country?: string;
  countryCallingCode?: string;
  lineType?: string;
  explanation: string;
  identityVerified: false;
  reputationChecked: false;
}

export interface CallSignal {
  id: string;
  label: string;
  detail: string;
  severity: "high" | "medium";
}

export interface CallCheckResult {
  number: PhoneFormatResult;
  signals: CallSignal[];
  descriptionWasProvided: boolean;
  nextSteps: string[];
  resources: OfficialResource[];
  notes: string[];
}

export const MAX_PHONE_INPUT_LENGTH = 40;
export const MAX_CALL_DESCRIPTION_LENGTH = 1_500;

const LINE_TYPE_LABELS: Record<string, string> = {
  MOBILE: "mobile",
  FIXED_LINE: "fixed line",
  FIXED_LINE_OR_MOBILE: "fixed line or mobile",
  TOLL_FREE: "toll-free",
  PREMIUM_RATE: "premium rate",
  SHARED_COST: "shared cost",
  VOIP: "VoIP",
  PERSONAL_NUMBER: "personal number",
  PAGER: "pager",
  UAN: "UAN",
  VOICEMAIL: "voicemail",
  UNKNOWN: "unknown",
};

interface DescriptionPattern {
  id: string;
  label: string;
  detail: string;
  severity: "high" | "medium";
  regex: RegExp;
}

const DESCRIPTION_PATTERNS: DescriptionPattern[] = [
  {
    id: "authority_impersonation",
    label: "Claimed authority",
    detail:
      "Claims of police, CBI, customs, a court, TRAI, RBI, or another authority are a common impersonation tactic. Verify independently, and do not pay or stay on a coercive video call.",
    severity: "high",
    regex:
      /\b(cbi|police|customs|enforcement directorate|income tax|trai|rbi|reserve bank|digital arrest|court|warrant|government officer)\b/i,
  },
  {
    id: "credential_request",
    label: "Asked for a secret or device access",
    detail:
      "No genuine bank, police officer, or support agent needs your OTP, PIN, CVV, password, Aadhaar OTP, screen sharing, or remote-control access.",
    severity: "high",
    regex:
      /\b(otp|one[ -]time password|upi pin|card pin|cvv|password|aadhaar otp|screen[ -]?shar(?:e|ing)|remote access|anydesk|teamviewer|quick ?support)\b/i,
  },
  {
    id: "payment_demand",
    label: "Demand for money",
    detail:
      "A demand to transfer money, buy gift cards/crypto, pay a fine, or move funds to a 'safe account' is a warning sign. Stop and verify through official channels.",
    severity: "high",
    regex:
      /\b(transfer money|send money|make (?:a )?payment|upi payment|gift card|bitcoin|crypto|pay (?:a )?fine|fine of|security deposit|safe account|clearance fee|processing fee)\b/i,
  },
  {
    id: "urgency_secrecy",
    label: "Urgency or secrecy",
    detail:
      "Pressure to act immediately, stay on the call, or keep the conversation secret is designed to prevent you from checking with your bank or family.",
    severity: "medium",
    regex:
      /\b(urgent|immediately|within \d+ minutes|last warning|don't tell|do not tell|stay on (?:the )?call|keep (?:this|it) secret|do not disconnect)\b/i,
  },
  {
    id: "threat_or_extortion",
    label: "Threat or blackmail",
    detail:
      "Threats of arrest, legal action, exposure of private images, or harm are not a reason to pay. If you feel unsafe, call 112.",
    severity: "high",
    regex:
      /\b(arrest|jail|legal action|case (?:will be|has been) filed|threaten(?:ed|ing|s)?|blackmail|sextortion|leak(?:ed|ing)?|expose|share\s+(?:\w+\s+){0,3}(?:photos?|images?|videos?)|hurt\s+(?:you|me|them)|harm\s+(?:you|me|them))\b/i,
  },
  {
    id: "prize_job_lure",
    label: "Unexpected prize, job, or refund",
    detail:
      "Unexpected winnings, easy task income, or a refund that requires an upfront fee or bank details is a common lure. Do not pay or share credentials.",
    severity: "medium",
    regex:
      /\b(lottery|prize|winner|part[ -]?time job|work from home|task (?:job|scam)|refund|compensation|gift)\b/i,
  },
];

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, maxLength);
}

function invalidFormat(input: string, explanation: string): PhoneFormatResult {
  return {
    status: "invalid",
    input,
    explanation,
    identityVerified: false,
    reputationChecked: false,
  };
}

export function checkPhoneFormat(value: unknown): PhoneFormatResult {
  const input = cleanText(value, MAX_PHONE_INPUT_LENGTH);
  if (!input) {
    return {
      status: "not_provided",
      input: "",
      explanation:
        "No phone number was entered. You can still describe the call and review warning signs.",
      identityVerified: false,
      reputationChecked: false,
    };
  }

  if (!/^[+0-9()\s.-]+$/.test(input)) {
    return invalidFormat(
      input,
      "Use only digits, spaces, brackets, hyphens, and an optional leading + country code. Letters and other characters are not valid phone-number formatting."
    );
  }

  let candidate = input;
  const digits = input.replace(/\D/g, "");
  if (!input.startsWith("+")) {
    if (digits.length === 12 && digits.startsWith("91")) {
      candidate = `+${digits}`;
    } else if (digits.length === 11 && digits.startsWith("0")) {
      candidate = `+91${digits.slice(1)}`;
    } else {
      candidate = digits;
    }
  }

  let parsed: PhoneNumber | undefined;
  try {
    parsed = parsePhoneNumberFromString(
      candidate,
      candidate.startsWith("+") ? undefined : "IN"
    );
  } catch {
    return invalidFormat(
      input,
      "This does not look like a phone number that can be parsed. Check the number and the country code."
    );
  }

  if (!parsed || !parsed.isValid()) {
    return invalidFormat(
      input,
      "The number does not match a valid numbering-plan format. This does not tell you whether a caller is honest or fraudulent; it only means the format could not be validated."
    );
  }

  const lineType = parsed.getType() as PhoneNumberType | undefined;

  return {
    status: "valid",
    input,
    e164: parsed.format("E.164"),
    international: parsed.formatInternational(),
    national: parsed.formatNational(),
    country: parsed.country,
    countryCallingCode: parsed.countryCallingCode,
    lineType: lineType ? LINE_TYPE_LABELS[lineType] ?? String(lineType) : "unknown",
    explanation:
      "The number format is valid. Format validation is not identity verification: it does not prove who called, that the number is currently assigned, or that it has a good or bad reputation.",
    identityVerified: false,
    reputationChecked: false,
  };
}

function matchedSignals(description: string): CallSignal[] {
  const signals: CallSignal[] = [];
  for (const pattern of DESCRIPTION_PATTERNS) {
    if (pattern.regex.test(description)) {
      signals.push({
        id: pattern.id,
        label: pattern.label,
        detail: pattern.detail,
        severity: pattern.severity,
      });
    }
  }
  return signals;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function resourceIdsForSignals(signals: CallSignal[]): OfficialResourceId[] {
  const ids: OfficialResourceId[] = [];
  const has = (id: string) => signals.some((signal) => signal.id === id);

  if (has("threat_or_extortion")) ids.push("emergency112");
  if (
    has("credential_request") ||
    has("payment_demand") ||
    has("authority_impersonation")
  ) {
    ids.push("helpline1930", "cybercrimePortal");
  }
  if (has("threat_or_extortion") || has("authority_impersonation")) {
    ids.push("cybercrimePortal");
  }
  // Always offer the official channel for reporting a suspected fraud call or
  // message; a valid number format must never be treated as a safe verdict.
  ids.push("sancharSaathi");
  return unique(ids) as OfficialResourceId[];
}

export function analyzeSuspiciousCall(input: {
  phoneNumber?: unknown;
  description?: unknown;
}): CallCheckResult {
  const phoneNumber = cleanText(input.phoneNumber, MAX_PHONE_INPUT_LENGTH);
  const description = cleanText(
    input.description,
    MAX_CALL_DESCRIPTION_LENGTH
  );
  const number = checkPhoneFormat(phoneNumber);
  const signals = matchedSignals(description);
  const hasSignal = (id: string) => signals.some((signal) => signal.id === id);

  const nextSteps: string[] = [
    "Hang up or end the chat. Verify the organisation independently using a number from its official website, app, or the back of your card. Do not use a number supplied by the caller.",
    "Never share OTPs, PINs, CVVs, passwords, Aadhaar OTPs, or install a remote-access/screen-sharing app because a caller asks you to.",
  ];

  if (hasSignal("authority_impersonation")) {
    nextSteps.push(
      "Do not stay on a video call with someone claiming to be police, CBI, customs, or a court. Real agencies do not demand money over a call or ask you to transfer funds to a 'safe account'."
    );
  }
  if (hasSignal("credential_request")) {
    nextSteps.push(
      "If you already shared a code or password, change the password from a clean device, enable two-step verification, revoke sessions, and contact your bank."
    );
  }
  if (hasSignal("payment_demand") || hasSignal("credential_request")) {
    nextSteps.push(
      "If money was taken or your bank/card details were exposed, contact your bank immediately and call 1930. Recovery is not guaranteed."
    );
  }
  if (hasSignal("threat_or_extortion")) {
    nextSteps.push(
      "If you feel unsafe or someone is threatening you, call 112. Do not pay or send more images; preserve the messages before restricting the account."
    );
  }
  if (hasSignal("urgency_secrecy")) {
    nextSteps.push(
      "Slow down and talk to a trusted person. Urgency and secrecy are tactics, not proof that the caller is genuine."
    );
  }

  nextSteps.push(
    "Save the caller's number, call time, message screenshots, and any payment reference. Report the suspected call/message on Sanchar Saathi. If money was lost, use 1930 and cybercrime.gov.in."
  );

  const resourceIds = resourceIdsForSignals(signals);
  const resources = getOfficialResources(resourceIds);

  return {
    number,
    signals,
    descriptionWasProvided: description.length > 0,
    nextSteps: unique(nextSteps),
    resources,
    notes: [
      "Satark AI does not check caller identity, ownership, spam databases, or reputation.",
      "A valid phone-number format is not a trust score. Scammers can use ordinary, valid, or spoofed numbers.",
      "The warning signs above come only from the words you entered. They are guidance, not proof that this caller committed a crime.",
    ],
  };
}

export const CALL_EXAMPLES = [
  {
    id: "digital_arrest",
    label: "Digital arrest script",
    description:
      "The caller claimed to be CBI police, said a parcel with illegal items was found, told me to stay on a video call and not tell anyone, and demanded I transfer money to a safe account to avoid arrest.",
  },
  {
    id: "kyc_otp",
    label: "Bank KYC / OTP call",
    description:
      "Someone claiming to be from my bank said my account would be blocked today and asked me to share the OTP and install a screen-sharing app for KYC verification.",
  },
  {
    id: "ordinary_call",
    label: "No warning words",
    description:
      "The caller said they were calling about a delivery and asked me to confirm my address.",
  },
] as const;

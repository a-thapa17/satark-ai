import {
  getEmergencyScenario,
  isEmergencyScenarioId,
} from "./scenarios.ts";
import {
  getPlaybookOrThrow,
  isPlaybookId,
} from "./playbooks.ts";
import { getOfficialResources } from "./resources.ts";
import type {
  EvidenceReport,
  EvidenceRequestInput,
  EmergencyScenarioId,
  OfficialResourceId,
  PlaybookId,
  PlaybookReportingOption,
} from "./types.ts";

export const MAX_EVIDENCE_BODY_BYTES = 24_576;
export const MAX_DESCRIPTION_LENGTH = 3_000;
export const MAX_SCANNER_FINDINGS_LENGTH = 2_500;
export const MAX_URLS = 5;
export const MAX_URL_LENGTH = 2_048;

const INCIDENT_LABELS: Record<EmergencyScenarioId | "other", string> = {
  financial_fraud: "Financial fraud",
  online_scam: "Online scam",
  account_compromise: "Account compromise",
  identity_theft: "Identity theft",
  threats_extortion: "Threats, extortion, or sextortion",
  other: "Other incident",
};

const DEFAULT_PLAYBOOKS: Record<EmergencyScenarioId | "other", PlaybookId> = {
  financial_fraud: "upi_payment_fraud",
  online_scam: "phishing_links",
  account_compromise: "account_compromise",
  identity_theft: "identity_theft",
  threats_extortion: "threats_extortion",
  other: "phishing_links",
};

export class EvidenceValidationError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "EvidenceValidationError";
    this.code = code;
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

function optionalText(
  value: unknown,
  field: string,
  maxLength: number
): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") {
    throw new EvidenceValidationError(
      "INVALID_FIELD",
      `${field} must be a string.`
    );
  }
  const cleaned = cleanText(value);
  if (!cleaned) return undefined;
  if (cleaned.length > maxLength) {
    throw new EvidenceValidationError(
      "FIELD_TOO_LONG",
      `${field} must be ${maxLength} characters or fewer.`
    );
  }
  return cleaned;
}

function normalizeEvidenceUrl(value: string): string {
  const cleaned = cleanText(value);
  if (!cleaned) {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "Suspicious URLs cannot be blank."
    );
  }
  if (cleaned.length > MAX_URL_LENGTH) {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "Each suspicious URL must be 2,048 characters or fewer."
    );
  }
  if (/[\u0000-\u001F\u007F]/.test(cleaned)) {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "Suspicious URLs cannot contain control characters."
    );
  }

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(cleaned)
    ? cleaned
    : `https://${cleaned}`;

  let parsed: URL;
  try {
    parsed = new URL(withScheme);
  } catch {
    throw new EvidenceValidationError(
      "INVALID_URL",
      `"${cleaned.slice(0, 80)}" is not a valid URL.`
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "Only http:// and https:// URLs can be included in the evidence summary."
    );
  }
  if (parsed.username || parsed.password) {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "URLs containing embedded usernames or passwords are not accepted."
    );
  }
  if (!parsed.hostname || parsed.hostname.length > 253) {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "The suspicious URL must contain a valid hostname."
    );
  }
  if (parsed.href.length > MAX_URL_LENGTH) {
    throw new EvidenceValidationError(
      "INVALID_URL",
      "Each suspicious URL must be 2,048 characters or fewer after normalization."
    );
  }
  return parsed.href;
}

function parseUrls(value: unknown): string[] {
  if (value === undefined || value === null || value === "") return [];
  let values: unknown[];
  if (typeof value === "string") {
    values = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  } else if (Array.isArray(value)) {
    values = value;
  } else {
    throw new EvidenceValidationError(
      "INVALID_URLS",
      "suspiciousUrls must be an array of strings or a newline-separated string."
    );
  }

  const nonEmpty = values.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0
  );
  if (values.some((entry) => typeof entry !== "string")) {
    throw new EvidenceValidationError(
      "INVALID_URLS",
      "Each suspicious URL entry must be a string."
    );
  }
  if (nonEmpty.length > MAX_URLS) {
    throw new EvidenceValidationError(
      "TOO_MANY_URLS",
      `Include at most ${MAX_URLS} suspicious URLs.`
    );
  }

  return nonEmpty.map((entry) => {
    return normalizeEvidenceUrl(entry);
  });
}

function parseIncidentAt(value: unknown): string | undefined {
  const cleaned = optionalText(value, "Incident date and time", 40);
  if (!cleaned) return undefined;
  const timestamp = Date.parse(cleaned);
  if (Number.isNaN(timestamp)) {
    throw new EvidenceValidationError(
      "INVALID_INCIDENT_TIME",
      "Incident date and time must be a valid date/time value."
    );
  }
  return cleaned;
}

function parsePlaybookId(
  value: unknown,
  incidentType: EmergencyScenarioId | "other"
): PlaybookId {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_PLAYBOOKS[incidentType];
  }
  if (!isPlaybookId(value)) {
    throw new EvidenceValidationError(
      "INVALID_PLAYBOOK",
      "The selected safety playbook is not recognised."
    );
  }
  return value;
}

/**
 * Validate and normalise an evidence request. This only describes an incident;
 * it never fetches a URL, contacts a service, or submits a report.
 */
export function parseEvidenceRequest(body: unknown): EvidenceRequestInput {
  if (!isRecord(body)) {
    throw new EvidenceValidationError(
      "INVALID_PAYLOAD",
      "A JSON object containing incident details is required."
    );
  }

  const incidentTypeValue = body.incidentType;
  if (
    incidentTypeValue !== "other" &&
    !isEmergencyScenarioId(incidentTypeValue)
  ) {
    throw new EvidenceValidationError(
      "INVALID_INCIDENT_TYPE",
      "Choose a recognised incident type."
    );
  }
  const incidentType = incidentTypeValue as EmergencyScenarioId | "other";

  const description = optionalText(
    body.description,
    "Incident description",
    MAX_DESCRIPTION_LENGTH
  );
  if (!description) {
    throw new EvidenceValidationError(
      "DESCRIPTION_REQUIRED",
      "Describe what happened so the evidence summary has incident details."
    );
  }

  return {
    incidentType,
    playbookId: parsePlaybookId(body.playbookId, incidentType),
    description,
    incidentAt: parseIncidentAt(body.incidentAt),
    name: optionalText(body.name, "Name", 80),
    contact: optionalText(body.contact, "Contact", 120),
    amount: optionalText(body.amount, "Amount", 40),
    transactionRef: optionalText(body.transactionRef, "Transaction reference", 128),
    suspiciousUrls: parseUrls(body.suspiciousUrls),
    scannerFindings: optionalText(
      body.scannerFindings,
      "Scanner findings",
      MAX_SCANNER_FINDINGS_LENGTH
    ),
  };
}

interface RedactionResult {
  text: string;
  count: number;
  types: string[];
}

function luhnLooksLikeCard(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

/**
 * Remove common secrets and identifiers from free text before it is rendered
 * into the PDF. This is best-effort: the UI also warns users not to paste
 * secrets, and the PDF tells recipients to review the document before sharing.
 */
export function redactEvidenceText(value: string): RedactionResult {
  let text = cleanText(value);
  let count = 0;
  const types = new Set<string>();

  const replace = (
    regex: RegExp,
    type: string,
    replacement: (...args: string[]) => string
  ): void => {
    text = text.replace(regex, (...args: string[]) => {
      count += 1;
      types.add(type);
      return replacement(...args);
    });
  };

  replace(
    /\b(authorization\s*:\s*)[^\n]+/gi,
    "Authorization header",
    (_match, prefix) => `${prefix}[REDACTED]`
  );

  replace(
    /\b(password|passwd|pwd|passcode)\b\s*(?:is|:|=|-)\s*(?:"[^"\n]*"|'[^'\n]*'|[^\n,;]{2,})/gi,
    "Password",
    (_match, label) => `${label}: [REDACTED]`
  );

  replace(
    /\b(otp|one[ -]time password|verification code|login code)\b\s*(?:is|:|=|-)?\s*["']?(\d{4,8})["']?/gi,
    "OTP",
    (_match, label) => `${label}: [REDACTED]`
  );

  replace(
    /\b(\d{4,8})\b(?=\s*(?:is|as|:|-)?\s*(?:your|the)?\s*(?:otp|one[ -]time password|verification code|login code)\b)/gi,
    "OTP",
    () => "[REDACTED OTP]"
  );

  replace(
    /\b(upi pin|atm pin|card pin|pin)\b\s*(?:is|:|=|-)?\s*["']?(\d{4,6})["']?/gi,
    "PIN",
    (_match, label) => `${label}: [REDACTED]`
  );

  replace(
    /\b(\d{4,6})\b(?=\s*(?:is|as|:|-)?\s*(?:your|the)?\s*(?:upi|atm|card)?\s*pin\b)/gi,
    "PIN",
    () => "[REDACTED PIN]"
  );

  replace(
    /\b(cvv|cvc)\b\s*(?:is|:|=|-)?\s*["']?(\d{3,4})["']?/gi,
    "CVV",
    (_match, label) => `${label}: [REDACTED]`
  );

  replace(
    /\b(\d{3,4})\b(?=\s*(?:is|as|:|-)?\s*(?:your|the)?\s*(?:card\s*)?(?:cvv|cvc)\b)/gi,
    "CVV",
    () => "[REDACTED CVV]"
  );

  replace(
    /\b(token|access[_ -]?token|auth[_ -]?token|refresh[_ -]?token|api[_ -]?key|secret[_ -]?key|session[_ -]?(?:id|token)|bearer)\b\s*(?:is|:|=|-)\s*["']?([A-Za-z0-9._~+/=-]{6,})["']?/gi,
    "Authentication token",
    (_match, label) => `${label}: [REDACTED]`
  );

  // Redact card numbers before Aadhaar-like sequences, otherwise the first
  // 12 digits of a spaced 16-digit card can be mistaken for an Aadhaar number.
  // Only sequences that pass a Luhn check are masked, so ordinary transaction
  // references are not silently removed.
  text = text.replace(/\b(?:\d[ -]?){12,18}\d\b/g, (match) => {
    if (!luhnLooksLikeCard(match)) return match;
    count += 1;
    types.add("Payment card");
    return "[REDACTED CARD]";
  });

  replace(
    /\b(aadhaar|aadhar)\b\s*(?:number|no|id)?\s*(?:is|:|=|-)?\s*["']?(\d{4}[\s-]?\d{4}[\s-]?\d{4})["']?/gi,
    "Aadhaar number",
    (_match, label) => `${label}: [REDACTED]`
  );
  replace(
    /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b(?![\s-]?\d)/g,
    "Aadhaar number",
    () => "[REDACTED AADHAAR]"
  );
  replace(
    /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g,
    "PAN",
    () => "[REDACTED PAN]"
  );
  replace(
    /\b(?:a\/c|account|acc(?:\s*no)?|bank account)\s*(?:number|no)?\s*(?:is|:|=|-)?\s*(\d{9,18})\b/gi,
    "Bank account",
    () => "Bank account: [REDACTED]"
  );

  replace(
    /([?&#](?:token|otp|password|passwd|pin|auth|apikey|api_key|secret|session|code|key|access_token|refresh_token|auth_token|id_token|client_secret)=)[^&#\s]+/gi,
    "URL secret parameter",
    (_match, prefix) => `${prefix}[REDACTED]`
  );

  return {
    text,
    count,
    types: Array.from(types),
  };
}

function redactUrlForEvidence(value: string): RedactionResult {
  const parsed = new URL(value);
  let redactedCount = 0;
  const sensitiveKeys = new Set([
    "token",
    "otp",
    "password",
    "passwd",
    "pin",
    "auth",
    "apikey",
    "api_key",
    "secret",
    "session",
    "code",
    "access_token",
    "refresh_token",
    "auth_token",
    "id_token",
    "client_secret",
    "key",
  ]);
  for (const key of Array.from(parsed.searchParams.keys())) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      parsed.searchParams.set(key, "REDACTED");
      redactedCount += 1;
    }
  }
  return {
    text: parsed.href,
    count: redactedCount,
    types: redactedCount > 0 ? ["URL secret parameter"] : [],
  };
}

function mergeRedactions(results: RedactionResult[]): RedactionResult {
  return {
    text: results.map((result) => result.text).filter(Boolean).join("\n"),
    count: results.reduce((total, result) => total + result.count, 0),
    types: Array.from(new Set(results.flatMap((result) => result.types))),
  };
}

function valueOrNotProvided(value: string | undefined): string {
  return value && value.trim() ? value : "Not provided";
}

function formatGeneratedAt(iso: string): string {
  return iso.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");
}

function reportingResourceIds(
  options: PlaybookReportingOption[]
): OfficialResourceId[] {
  const ids: OfficialResourceId[] = [];
  for (const option of options) {
    for (const id of option.resourceIds) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

function contentSection(title: string, lines: string[]): string {
  return [`SECTION ${title}`, ...lines].join("\n");
}

/**
 * Build a redacted, human-readable evidence report. The returned content is
 * used for automated tests and for the PDF renderer. No external service is
 * called.
 */
export function buildEvidenceReport(
  input: EvidenceRequestInput,
  now: Date = new Date()
): EvidenceReport {
  const playbook = getPlaybookOrThrow(input.playbookId ?? DEFAULT_PLAYBOOKS[input.incidentType]);
  const incidents = getEmergencyScenario(
    input.incidentType as EmergencyScenarioId
  );
  const incidentTypeLabel =
    input.incidentType === "other"
      ? INCIDENT_LABELS.other
      : incidents?.title ?? INCIDENT_LABELS[input.incidentType];

  const description = redactEvidenceText(input.description);
  const scanner = input.scannerFindings
    ? redactEvidenceText(input.scannerFindings)
    : undefined;
  const name = input.name ? redactEvidenceText(input.name) : undefined;
  const contact = input.contact ? redactEvidenceText(input.contact) : undefined;
  const amount = input.amount ? redactEvidenceText(input.amount) : undefined;
  const transactionRef = input.transactionRef
    ? redactEvidenceText(input.transactionRef)
    : undefined;
  const urlRedactions = input.suspiciousUrls?.map(redactUrlForEvidence) ?? [];
  const allRedactions = mergeRedactions([
    description,
    ...(scanner ? [scanner] : []),
    ...(name ? [name] : []),
    ...(contact ? [contact] : []),
    ...(amount ? [amount] : []),
    ...(transactionRef ? [transactionRef] : []),
    ...urlRedactions,
  ]);

  const resources = getOfficialResources(
    reportingResourceIds(playbook.reportingOptions)
  );
  const generatedAt = now.toISOString();

  const userProvidedLines = [
    `Incident type: ${incidentTypeLabel}`,
    `Incident date/time (as provided): ${valueOrNotProvided(
      input.incidentAt?.replace("T", " ")
    )}`,
    `Name (optional): ${valueOrNotProvided(name?.text)}`,
    `Contact (optional): ${valueOrNotProvided(contact?.text)}`,
    `Amount involved (as provided): ${valueOrNotProvided(amount?.text)}`,
    `Transaction / UTR reference: ${valueOrNotProvided(transactionRef?.text)}`,
    `Suspicious URL(s): ${
      urlRedactions.length > 0
        ? urlRedactions.map((entry) => entry.text).join(" | ")
        : "Not provided"
    }`,
    "",
    "What the user reported:",
    description.text || "Not provided",
  ];

  const analysisLines = [
    "Source: Satark AI scanner output recorded by the user. This PDF generator does not re-run the scan or independently verify the findings.",
    `Scanner findings: ${scanner?.text ?? "Not provided"}`,
    "",
    "This section is separate from the user's account. Treat automated analysis as an indicator, not proof.",
  ];

  const nextStepLines = playbook.immediateActions.map(
    (action, index) => `${index + 1}. ${action}`
  );
  const evidenceLines = playbook.evidenceToPreserve.map(
    (item, index) => `${index + 1}. ${item}`
  );
  const reportingLines = playbook.reportingOptions.map(
    (option, index) =>
      `${index + 1}. ${option.title}: ${option.description}${
        option.resourceIds.length
          ? ` Official channel(s): ${option.resourceIds
              .map((id) => resources.find((resource) => resource.id === id)?.name)
              .filter(Boolean)
              .join(", ")}.`
          : ""
      }`
  );
  const officialContactLines = resources.map(
    (resource) =>
      `${resource.name}:${resource.phone ? ` call ${resource.phone};` : ""} ${resource.url}`
  );
  const reportingSectionLines = [
    ...reportingLines,
    "",
    "Official contact details (verify these on the official website before acting):",
    ...officialContactLines,
  ];

  const content = [
    "SATARK AI - INCIDENT EVIDENCE SUMMARY",
    `Generated: ${formatGeneratedAt(generatedAt)}`,
    "",
    "IMPORTANT: No report has been submitted by Satark AI. This is a user-created evidence summary, not a complaint acknowledgement, legal affidavit, or proof that money can be recovered.",
    "Automated threat assessments are not definitive proof. They may be incomplete, out of date, or wrong. Review every detail before sharing this document.",
    "",
    contentSection("A - USER-PROVIDED INCIDENT DETAILS", userProvidedLines),
    "",
    contentSection("B - AUTOMATED ANALYSIS (USER-RECORDED, NOT RE-VERIFIED)", analysisLines),
    "",
    contentSection("C - RECOMMENDED NEXT STEPS (GENERAL GUIDANCE)", nextStepLines),
    "",
    contentSection("D - EVIDENCE TO PRESERVE", evidenceLines),
    "",
    contentSection("E - REPORTING OPTIONS (VERIFY BEFORE USE)", reportingSectionLines),
    "",
    contentSection("F - IMPORTANT LIMITATIONS", [
      "Satark AI does not contact a bank, police station, platform, or authority. You must decide whether and where to report.",
      "The official contact details and links in this document are provided for convenience. Verify them on the official website before acting.",
      "Recovery of money is not guaranteed. Reporting quickly can help a bank or platform act, but it cannot guarantee a refund, freeze, or investigation outcome.",
      "Do not send OTPs, passwords, PINs, CVVs, authentication tokens, or unnecessary identity documents to anyone. This generator attempts to redact common secrets, but no redaction is perfect.",
      `Automatic redaction: ${allRedactions.count} item(s)${
        allRedactions.types.length
          ? ` (${allRedactions.types.join(", ")})`
          : ""
      }. Check the document before sharing it.`,
      `Reporting playbook: ${playbook.title}.`,
    ]),
  ].join("\n");

  return {
    generatedAt,
    incidentTypeLabel,
    playbook,
    description: description.text,
    incidentAt: input.incidentAt,
    name: name?.text,
    contact: contact?.text,
    amount: amount?.text,
    transactionRef: transactionRef?.text,
    suspiciousUrls: urlRedactions.map((entry) => entry.text),
    scannerFindings: scanner?.text,
    redactionCount: allRedactions.count,
    redactionTypes: allRedactions.types,
    nextSteps: playbook.immediateActions,
    evidenceToPreserve: playbook.evidenceToPreserve,
    reportingOptions: playbook.reportingOptions,
    resources,
    content,
  };
}

export function evidenceFilename(now: Date = new Date()): string {
  const stamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z")
    .replace("T", "-");
  return `satark-evidence-${stamp}.pdf`;
}

export function incidentTypeLabel(
  value: EmergencyScenarioId | "other"
): string {
  return value === "other"
    ? INCIDENT_LABELS.other
    : getEmergencyScenario(value)?.title ?? INCIDENT_LABELS[value];
}

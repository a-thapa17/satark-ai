import { getOfficialResources } from "./resources.ts";
import type {
  EmergencyPlan,
  EmergencyPlanInput,
  EmergencyPlanStep,
  EmergencyScenario,
  EmergencyScenarioId,
  OfficialResourceId,
} from "./types.ts";

export const EMERGENCY_SCENARIOS: EmergencyScenario[] = [
  {
    id: "financial_fraud",
    title: "Money or financial details were taken",
    shortTitle: "Financial fraud",
    overview:
      "A payment, UPI transfer, card charge, or bank debit was unauthorised, or someone obtained your financial details.",
    playbookIds: ["upi_payment_fraud"],
    immediateActions: [
      "Stop all payments and do not approve another UPI collect request. Do not send a 'recovery fee' to anyone.",
      "Call your bank or UPI app's official customer care using the number on your card or in the official app. Ask it to block the card/account or UPI access and flag the transaction.",
      "If money has left your account or a card/bank account was misused, call 1930 and file a complaint at cybercrime.gov.in. Save every reference number.",
      "If you shared a PIN, OTP, password, or screen access, change your passwords from a clean device, sign out other sessions, and ask the bank for a new card or PIN.",
      "Keep the transaction reference, statement entry, payee details, and screenshots. Do not delete messages or call logs.",
    ],
    evidenceToPreserve: [
      "Transaction amount, date/time, UTR or reference, and bank statement entry.",
      "Payee UPI ID/name, QR image, payment screenshot, and caller number.",
      "Bank/UPI alerts, emails, chat screenshots, and complaint reference numbers.",
    ],
    reportingOptions: [
      {
        title: "Report financial cyber fraud",
        description:
          "Call 1930 as soon as possible and file a written complaint on the National Cyber Crime Reporting Portal. Keep the acknowledgement number.",
        resourceIds: ["helpline1930", "cybercrimePortal"],
      },
      {
        title: "Raise the bank dispute",
        description:
          "Contact your bank through its official channel. If the complaint remains unresolved, use the RBI Complaint Management System.",
        resourceIds: ["rbiCms"],
      },
      {
        title: "Report the suspected call or message",
        description:
          "If the fraud started with a call, SMS, or WhatsApp message, report that communication on Sanchar Saathi.",
        resourceIds: ["sancharSaathi"],
      },
    ],
    finalStep:
      "Keep your bank ticket and cybercrime acknowledgement numbers. Follow up with the bank; recovery is not guaranteed.",
  },
  {
    id: "online_scam",
    title: "I was targeted by an online scam",
    shortTitle: "Online scam",
    overview:
      "A link, job offer, investment, delivery message, shopping listing, or online contact tried to steal credentials or money.",
    playbookIds: ["phishing_links", "shopping_fraud"],
    immediateActions: [
      "Stop contact. Do not click the link again, download an app, share your screen, or send more money.",
      "Do not pay any 'release', 'customs', 'recovery', or 'verification' fee. Legitimate refunds do not require you to pay first.",
      "If you entered a password or OTP, change the password from a clean device, enable two-step verification, and sign out other sessions.",
      "If money was taken or card/bank details were exposed, contact your bank immediately and call 1930.",
      "Preserve the message, URL, profile, order, payment proof, and timestamps before blocking or reporting the sender.",
    ],
    evidenceToPreserve: [
      "Suspicious URL, sender/profile, message screenshots, and date/time.",
      "Order ID, seller/listing URL, payment reference, and delivery communication.",
      "Any scanner report or automatic analysis, kept separately from what you personally observed.",
    ],
    reportingOptions: [
      {
        title: "Report a cybercrime or financial loss",
        description:
          "File on the National Cyber Crime Reporting Portal. If money was lost, call 1930 and your bank as well.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Report a suspected fraud communication",
        description:
          "Use Sanchar Saathi for a fraud call, SMS, or WhatsApp message. It is not a financial-fraud complaint channel.",
        resourceIds: ["sancharSaathi"],
      },
      {
        title: "Report a shopping or consumer issue",
        description:
          "Use the platform's dispute process and the National Consumer Helpline for a paid order or service complaint.",
        resourceIds: ["consumerHelpline"],
      },
    ],
    finalStep:
      "Secure the affected account first, then report. Keep screenshots and any complaint reference; do not rely on a platform to recover money for you.",
  },
  {
    id: "account_compromise",
    title: "My account was hacked or taken over",
    shortTitle: "Account compromised",
    overview:
      "Someone else may have access to your email, social media, messaging, or financial account.",
    playbookIds: ["account_compromise", "phishing_links"],
    immediateActions: [
      "Use the platform's official account-recovery flow from a trusted device. Do not use a recovery link or number supplied by the attacker.",
      "If you can sign in, change the password, enable two-step verification, sign out all other sessions, and revoke unfamiliar apps.",
      "Check the recovery email/phone, forwarding rules, linked accounts, and recent login alerts. Correct anything you did not set.",
      "Tell trusted contacts to ignore money or code requests from your account until you confirm it is secure.",
      "Check bank and email accounts that shared the same password. If financial access or money was affected, contact the bank and call 1930.",
    ],
    evidenceToPreserve: [
      "Screenshots of unauthorised posts/messages, login alerts, profile changes, and connected apps.",
      "Attacker profile/handle, timestamps, and platform ticket or report reference.",
      "Email/SMS alerts showing password, recovery, or session changes.",
    ],
    reportingOptions: [
      {
        title: "Report to the platform",
        description:
          "Use the official hacked-account or impersonation report flow. Keep the ticket number.",
        resourceIds: [],
      },
      {
        title: "Report unauthorised access",
        description:
          "File on the National Cyber Crime Reporting Portal. If money was stolen, call 1930 and your bank.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Report an impersonation call or message",
        description:
          "Report suspected fraud communication on Sanchar Saathi if a caller or messaging account is impersonating you or a service.",
        resourceIds: ["sancharSaathi"],
      },
    ],
    finalStep:
      "Do not pay a recovery service. Keep the platform ticket and change the password/recovery details before reconnecting the account.",
  },
  {
    id: "identity_theft",
    title: "Someone is using my identity",
    shortTitle: "Identity theft",
    overview:
      "Your name, Aadhaar, PAN, phone number, email, or financial identity is being used without permission.",
    playbookIds: ["identity_theft"],
    immediateActions: [
      "Stop sharing identity documents and codes. Write down what was used, when you noticed it, and who contacted you.",
      "Contact each affected bank or lender using its official number. Ask it to flag unauthorised accounts or transactions.",
      "For Aadhaar misuse concerns, use UIDAI's official helpline 1947 or portal. Never share Aadhaar OTPs or biometrics.",
      "Change passwords and enable two-step verification on email, banking, social media, and the accounts linked to the exposed phone number.",
      "Report the identity theft at cybercrime.gov.in and call 1930 if money was taken. Keep acknowledgement numbers.",
    ],
    evidenceToPreserve: [
      "Timeline of the misuse and the identifiers/accounts involved.",
      "Unknown account or loan notices, caller numbers, emails, SMS, and screenshots.",
      "Bank statements, transaction references, complaint numbers, and lender correspondence.",
      "Do not post full identity documents in a public or unofficial channel.",
    ],
    reportingOptions: [
      {
        title: "Report Aadhaar identity misuse",
        description:
          "Use UIDAI's official 1947 helpline or portal. This does not replace a cybercrime complaint.",
        resourceIds: ["uidai"],
      },
      {
        title: "File a cybercrime complaint",
        description:
          "Use the National Cyber Crime Reporting Portal. If money was lost, call 1930 and the bank.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Escalate an unresolved bank issue",
        description:
          "Use the RBI Complaint Management System after contacting the bank and keeping the bank's complaint reference.",
        resourceIds: ["rbiCms"],
      },
    ],
    finalStep:
      "Keep a written timeline and every acknowledgement. Do not pay anyone to 'clear' a loan or account you did not open.",
  },
  {
    id: "threats_extortion",
    title: "I am being threatened or blackmailed",
    shortTitle: "Threats / extortion",
    overview:
      "Someone is threatening your safety, demanding money, or threatening to reveal private images or information.",
    playbookIds: ["threats_extortion"],
    immediateActions: [
      "If you are in immediate physical danger, call 112. Move to a safe place and tell a trusted person.",
      "Do not pay, send more images, or follow instructions. End the call and do not let anyone keep you on a video call.",
      "A real police, CBI, customs, or court official will not demand payment over a call or ask you to transfer money to a 'safe account'.",
      "Preserve screenshots, profile links, caller numbers, and payment records before restricting the account. Do not delete the originals.",
      "Report the account to the platform and the cybercrime at cybercrime.gov.in. If money was paid, call your bank and 1930.",
      "Tell a trusted person. You are not at fault. Do not share private images with anyone offering to remove them.",
    ],
    evidenceToPreserve: [
      "Screenshots of the threats, profile URL, caller number, and timestamps.",
      "Payment demands and transaction references; do not send more money.",
      "The claimed agency and details of the call, if you can record them safely.",
      "Do not redistribute intimate images. Provide them only through an official reporting process that requires them.",
    ],
    reportingOptions: [
      {
        title: "Get emergency help",
        description:
          "Call 112 if there is an immediate threat to life or safety. If you are safe, use the cybercrime channels below.",
        resourceIds: ["emergency112"],
      },
      {
        title: "Report extortion or sextortion",
        description:
          "File on the National Cyber Crime Reporting Portal. If money was paid, call 1930 and your bank. Recovery is not guaranteed.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Report the threatening communication",
        description:
          "Use Sanchar Saathi for a suspected fraud call or message and report the account to the platform.",
        resourceIds: ["sancharSaathi"],
      },
    ],
    finalStep:
      "Your safety and support matter more than the demand. Contact a trusted person and, if needed, a qualified mental-health professional. Do not pay.",
  },
];

const SCENARIO_BY_ID = new Map(
  EMERGENCY_SCENARIOS.map((scenario) => [scenario.id, scenario])
);

export function getEmergencyScenario(
  id: EmergencyScenarioId
): EmergencyScenario | undefined {
  return SCENARIO_BY_ID.get(id);
}

export function isEmergencyScenarioId(
  value: unknown
): value is EmergencyScenarioId {
  return typeof value === "string" && SCENARIO_BY_ID.has(value as EmergencyScenarioId);
}

function dedupeReportingOptions(
  options: EmergencyScenario["reportingOptions"]
): EmergencyScenario["reportingOptions"] {
  const seen = new Set<string>();
  return options.filter((option) => {
    if (seen.has(option.title)) return false;
    seen.add(option.title);
    return true;
  });
}

function resourceIdsFromOptions(
  options: EmergencyScenario["reportingOptions"]
): OfficialResourceId[] {
  const ids: OfficialResourceId[] = [];
  for (const option of options) {
    for (const id of option.resourceIds) {
      if (!ids.includes(id)) ids.push(id);
    }
  }
  return ids;
}

/**
 * Build a deterministic, time-ordered plan. This function never contacts a
 * service and never records that a report was submitted.
 */
export function buildEmergencyPlan(input: EmergencyPlanInput): EmergencyPlan {
  const scenario = getEmergencyScenario(input.scenario);
  if (!scenario) {
    throw new Error(`Unknown emergency scenario: ${input.scenario}`);
  }

  const steps: Omit<EmergencyPlanStep, "order">[] = [];

  if (input.immediateDanger) {
    steps.push({
      title: "Call 112 now if you are in immediate danger",
      detail:
        "Move to a safe place, contact a trusted person, and call 112 (or local emergency services) if there is a threat to life, a crime in progress, fire, or a medical emergency.",
    });
  }

  if (input.moneyLost) {
    steps.push({
      title: "Stop the loss and call your bank",
      detail:
        "Use the official number on your card or in your banking app. Ask the bank to block the card/account or UPI access and flag the unauthorised transaction. Do not use contact details supplied by the caller.",
    });
    steps.push({
      title: "Call 1930 and keep the reference",
      detail:
        "Call 1930 for financial cyber fraud in India and file a complaint at cybercrime.gov.in. Reporting quickly may help, but recovery is not guaranteed.",
    });
  }

  for (const action of scenario.immediateActions) {
    steps.push({
      title: action.split(".")[0]?.trim() || "Next action",
      detail: action,
    });
  }

  const seen = new Set<string>();
  const dedupedSteps = steps.filter((step) => {
    const key = step.detail.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const reportingOptions = dedupeReportingOptions(scenario.reportingOptions);
  const additionalIds: OfficialResourceId[] = [];
  if (input.immediateDanger) additionalIds.push("emergency112");
  if (input.moneyLost) additionalIds.push("helpline1930", "cybercrimePortal");
  const resources = getOfficialResources([
    ...additionalIds,
    ...resourceIdsFromOptions(reportingOptions),
  ]);

  const urgency: EmergencyPlan["urgency"] =
    input.immediateDanger ||
    input.moneyLost ||
    scenario.id === "threats_extortion" ||
    scenario.id === "financial_fraud"
      ? "immediate"
      : "urgent";

  const headline = input.immediateDanger
    ? "You are in immediate danger. Call 112 first, then follow these steps."
    : input.moneyLost
      ? "Money has moved. Act quickly, but no one can guarantee recovery."
      : "Follow these steps in order. Do not pay or share codes to make the problem go away.";

  return {
    scenario,
    urgency,
    headline,
    steps: dedupedSteps.map((step, index) => ({ ...step, order: index + 1 })),
    evidenceToPreserve: scenario.evidenceToPreserve,
    reportingOptions,
    resources,
    finalStep: input.moneyLost
      ? `${scenario.finalStep} Keep your bank and cybercrime acknowledgement numbers; recovery is not guaranteed.`
      : scenario.finalStep,
    noReportSubmitted:
      "Satark AI has not submitted a report or contacted any authority. You must contact the official channel yourself.",
    recoveryDisclaimer:
      "Reporting quickly may help your bank or the platform act. Recovery is not guaranteed; no one can guarantee that stolen money will be recovered.",
  };
}

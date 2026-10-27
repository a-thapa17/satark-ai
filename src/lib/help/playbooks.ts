import type { PlaybookId, SafetyPlaybook } from "./types.ts";

/**
 * Reusable, plain-language playbooks. They tell the user what to do first,
 * what evidence to keep, which accounts to secure, where they can report, and
 * which common "recovery" actions make things worse.
 *
 * These entries do not submit or schedule anything.
 */
export const SAFETY_PLAYBOOKS: SafetyPlaybook[] = [
  {
    id: "upi_payment_fraud",
    title: "UPI and payment fraud",
    shortTitle: "UPI / payment fraud",
    overview:
      "Money has moved, a collect request was approved, or card/UPI details were shared. Speed matters, but recovery is never guaranteed.",
    urgency: "immediate",
    immediateActions: [
      "Stop all payments. Do not approve another UPI collect request and do not send money to anyone who says they can recover the first payment.",
      "Call your bank or UPI app's official customer care using the number on your card or in the official app. Ask them to block the card, account, or UPI access and flag the unauthorised transaction.",
      "If money has left your account or your card/bank account was misused, call 1930 now and file a complaint at cybercrime.gov.in. Save the complaint or acknowledgement number.",
      "If you shared a UPI PIN, OTP, card number, CVV, or installed a screen-sharing/remote-access app, treat the account as exposed. Change passwords from a clean device, revoke active sessions, and ask the bank for a new card or PIN.",
      "Reporting quickly can help the bank act, but do not assume the money will be recovered. Recovery is not guaranteed.",
    ],
    evidenceToPreserve: [
      "Transaction amount, date, time, UTR or transaction reference, and the bank statement entry.",
      "Payee name, UPI ID, QR image or payment-request screenshot, and any message that came with it.",
      "The caller's phone number, call time, chat screenshots, and the app or website used.",
      "Bank/UPI alerts and emails, including the complaint or acknowledgement number after you report.",
    ],
    accountsToSecure: [
      "The affected bank account, debit/credit card, and UPI app.",
      "The email address and phone number linked to the bank and UPI account.",
      "Any remote-access, screen-sharing, or newly installed app that the caller asked you to use.",
    ],
    reportingOptions: [
      {
        title: "Call 1930, then file with the national portal",
        description:
          "1930 handles financial cyber fraud in India. Filing on the National Cyber Crime Reporting Portal creates a separate written complaint. Keep the reference number.",
        resourceIds: ["helpline1930", "cybercrimePortal"],
      },
      {
        title: "Raise a bank dispute and keep the reference",
        description:
          "Ask your bank to flag the transaction and explain its dispute/chargeback process. If the bank complaint remains unresolved, use the RBI Complaint Management System.",
        resourceIds: ["rbiCms"],
      },
      {
        title: "Report the suspected caller or message",
        description:
          "If the fraud began with a call, SMS, or WhatsApp message, report that communication on Sanchar Saathi. Do not use Chakshu as a substitute for the 1930 financial-fraud report.",
        resourceIds: ["sancharSaathi"],
      },
    ],
    mistakesToAvoid: [
      "Never enter a UPI PIN to receive money. A PIN or QR scan is not needed to receive a payment.",
      "Do not pay a 'recovery agent', 'cyber cell officer', or lawyer who contacts you first and asks for a fee.",
      "Do not share OTPs, PINs, CVVs, passwords, or screen access with anyone, even someone claiming to be from your bank or the police.",
      "Do not delete payment messages, call logs, or screenshots. They are evidence.",
      "Do not promise yourself or others that a complaint will produce a refund; recovery depends on the investigation and bank action.",
    ],
  },
  {
    id: "phishing_links",
    title: "Suspicious links and phishing",
    shortTitle: "Phishing links",
    overview:
      "A link, email, SMS, or QR code tried to collect credentials, payment details, or a malicious download. Do not use the same page again.",
    urgency: "urgent",
    immediateActions: [
      "Do not click the link again, re-enter data, or download the attachment/app. Close the page and leave the chat.",
      "If you entered a password, change it from a clean device. Use a unique password, enable two-step verification, and sign out other sessions.",
      "If you entered bank or card details, contact the bank using its official number and ask it to block the card or account. Call 1930 if money is taken.",
      "If you installed an app or granted accessibility, device-admin, or screen-sharing access, remove the app and review those permissions. Contact the bank if financial data may be exposed.",
      "Check the account's recovery email, recovery phone, forwarding rules, and connected apps. Attackers often change these to keep access.",
    ],
    evidenceToPreserve: [
      "The full suspicious URL (do not open it again) and a screenshot of the page in the state you saw it.",
      "Sender email address, phone number, message headers if available, and the date/time received.",
      "Screenshots of the message, login prompt, QR code, or app-install request.",
      "The Satark AI scan report or other scanner result, kept as a separate automated-analysis record.",
    ],
    accountsToSecure: [
      "The email, bank, payment, social-media, and shopping account whose credentials were entered.",
      "Password manager, recovery email/phone, and any account that shares the same password.",
      "The device on which the link was opened; check browser extensions and installed apps.",
    ],
    reportingOptions: [
      {
        title: "Report the message or link",
        description:
          "Use the platform's report flow for the email, SMS, or social-media message. Report suspected fraud calls/SMS/WhatsApp messages on Sanchar Saathi.",
        resourceIds: ["sancharSaathi"],
      },
      {
        title: "Report a cybercrime or money loss",
        description:
          "File on the National Cyber Crime Reporting Portal. If money was taken or bank/card details were misused, call 1930 as well.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
    ],
    mistakesToAvoid: [
      "Do not use a phone number or support link supplied inside the suspicious message; find the organisation's official contact independently.",
      "Do not reuse the exposed password on any other account.",
      "Do not send screenshots containing an OTP, password, or full card number to a chat or social-media contact.",
      "Do not install a remote-support app because someone on the phone asks you to.",
    ],
  },
  {
    id: "account_compromise",
    title: "Social media or messaging account compromise",
    shortTitle: "Account hacked",
    overview:
      "Someone else may have access to your email, social-media, or messaging account. Recover access through the platform's official flow and check for changes they made.",
    urgency: "urgent",
    immediateActions: [
      "Start the platform's official account-recovery flow from a trusted device. Do not use recovery links or phone numbers sent by the person who contacted you.",
      "If you can still sign in, change the password, enable two-step verification, sign out all other sessions, and revoke unfamiliar connected apps.",
      "Check and correct the recovery email, recovery phone number, display name, linked accounts, forwarding rules, and authorised sessions.",
      "Tell trusted contacts that the account may be impersonating you. Ask them not to send money or codes to the account until you confirm it is secure.",
      "Check bank, email, and other accounts that used the same password. If money was taken from a bank account, call the bank and 1930.",
    ],
    evidenceToPreserve: [
      "Screenshots of unauthorised posts, messages, profile changes, login alerts, and connected apps.",
      "The impersonating profile URL or account handle, plus the date/time of each event.",
      "Email/SMS notifications showing an unrecognised login, password change, or recovery setting change.",
      "Platform support ticket or report reference numbers.",
    ],
    accountsToSecure: [
      "The compromised social/messaging account and its linked email.",
      "Email account, password manager, and any account using the same password.",
      "Bank/payment accounts and the phone number used for recovery codes.",
      "Devices that were signed in; revoke sessions and check for malware or unfamiliar apps.",
    ],
    reportingOptions: [
      {
        title: "Report to the platform",
        description:
          "Use the platform's official hacked-account or impersonation report flow. Keep the ticket number.",
        resourceIds: [],
      },
      {
        title: "Report the cybercrime",
        description:
          "Use the National Cyber Crime Reporting Portal for unauthorised account access and related cybercrime. If money was taken, call 1930 as well.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Report an impersonation call or message",
        description:
          "If the attacker used a phone call or messaging account to impersonate you or a service, report that communication on Sanchar Saathi.",
        resourceIds: ["sancharSaathi"],
      },
    ],
    mistakesToAvoid: [
      "Do not pay a 'hacker' or 'recovery expert' who offers to get the account back.",
      "Do not create a new account and abandon the old one before saving evidence and using the platform's recovery process.",
      "Do not send identity documents to an unofficial social-media contact.",
      "Do not reuse the old password or keep the same recovery settings.",
    ],
  },
  {
    id: "identity_theft",
    title: "Identity theft",
    shortTitle: "Identity theft",
    overview:
      "Someone may be using your name, Aadhaar, PAN, phone number, or financial details. Document what happened, secure the identifiers and accounts, and use official reporting channels.",
    urgency: "urgent",
    immediateActions: [
      "Stop sharing identity documents or codes. Take screenshots and write a timeline of what was used and when.",
      "Contact each affected bank or financial institution through its official number. Ask it to flag unauthorised activity and explain its identity-theft process.",
      "For Aadhaar misuse concerns, contact UIDAI on 1947 or through uidai.gov.in. Never share an Aadhaar OTP, biometrics, or full Aadhaar image with a caller.",
      "Change passwords and enable two-step verification on email, banking, social media, and any account using the exposed phone number or email.",
      "Report the cybercrime at cybercrime.gov.in. If money was taken or an account was misused, call 1930. Keep every acknowledgement number.",
      "Review bank statements and any credit/loan notices you receive. Contact the lender and the bank immediately about accounts or loans you do not recognise.",
    ],
    evidenceToPreserve: [
      "Timeline of when you noticed the misuse and which identifiers were involved.",
      "Screenshots of unknown accounts, loan messages, KYC requests, emails, SMS, and caller numbers.",
      "Bank statements, transaction references, complaint numbers, and any correspondence with a lender.",
      "Do not upload full identity documents to a random chat. Share only what an official reporting channel requires.",
    ],
    accountsToSecure: [
      "Aadhaar-related access and the phone number/email registered with UIDAI.",
      "Bank accounts, cards, UPI, demat/loan accounts, and the mobile SIM.",
      "Email, social media, and any account that can reset another password.",
      "Credit/loan accounts opened in your name; ask the lender and bank to investigate.",
    ],
    reportingOptions: [
      {
        title: "Report identity misuse to UIDAI",
        description:
          "Use UIDAI's official helpline 1947 or portal for Aadhaar-related misuse concerns. This does not replace a cybercrime complaint.",
        resourceIds: ["uidai"],
      },
      {
        title: "File a cybercrime complaint",
        description:
          "Use the National Cyber Crime Reporting Portal for identity theft and related cybercrime. If money was taken, call 1930.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Escalate an unresolved bank issue",
        description:
          "After complaining to the bank, use the RBI Complaint Management System if the issue remains unresolved.",
        resourceIds: ["rbiCms"],
      },
    ],
    mistakesToAvoid: [
      "Do not share Aadhaar OTPs, biometrics, or full identity documents with someone who contacted you first.",
      "Do not pay a fee to 'clear' a loan or account you did not open.",
      "Do not ignore unfamiliar accounts, loan notices, or credit inquiries.",
      "Do not publish your Aadhaar, PAN, card, or full address on social media while asking for help.",
    ],
  },
  {
    id: "shopping_fraud",
    title: "Online shopping fraud",
    shortTitle: "Shopping fraud",
    overview:
      "An online seller, marketplace, or delivery contact took payment but did not deliver, sent a fake product, or asked for more money outside the platform.",
    urgency: "urgent",
    immediateActions: [
      "Stop paying. Do not accept a 'refund' link, QR code, or OTP request from the seller or a so-called delivery agent.",
      "Contact the marketplace or payment provider through its official in-app support and open a dispute. Save the ticket number.",
      "If a card, bank account, or UPI account was charged without authorisation, contact your bank immediately. Call 1930 if money was taken.",
      "Report the seller's listing and profile to the platform. Keep the listing URL and seller details before they disappear.",
      "For a consumer grievance about a paid order, use the National Consumer Helpline after preserving your order and payment records.",
    ],
    evidenceToPreserve: [
      "Order ID, product listing URL, seller name/profile, price, and delivery promise.",
      "Payment proof, transaction/UTR reference, bank statement entry, and invoices.",
      "Chat with the seller, delivery messages, tracking details, and screenshots of the product received.",
      "Marketplace complaint/ticket number and the date/time of each contact.",
    ],
    accountsToSecure: [
      "Marketplace account password and two-step verification.",
      "The card, UPI app, or bank account used for payment.",
      "Email and phone number used for order updates and refund messages.",
    ],
    reportingOptions: [
      {
        title: "Use the marketplace and payment dispute process",
        description:
          "Report the seller inside the platform and ask the payment provider/bank to review the charge. Keep both reference numbers.",
        resourceIds: ["rbiCms"],
      },
      {
        title: "Report financial cyber fraud",
        description:
          "If money was lost to a fraudulent seller, call 1930 and file on the National Cyber Crime Reporting Portal.",
        resourceIds: ["helpline1930", "cybercrimePortal"],
      },
      {
        title: "Raise a consumer grievance",
        description:
          "Use the National Consumer Helpline for a paid order or service complaint. It is not a substitute for a bank fraud report.",
        resourceIds: ["consumerHelpline"],
      },
    ],
    mistakesToAvoid: [
      "Do not pay 'customs', 'delivery', or 'refund processing' fees to a person who contacted you outside the platform.",
      "Do not share OTPs, UPI PINs, or card CVVs with a seller or delivery agent.",
      "Do not close a marketplace dispute before the refund or resolution is complete.",
      "Do not move the transaction to a personal UPI ID or messaging app just because the seller asks.",
    ],
  },
  {
    id: "threats_extortion",
    title: "Threats, extortion, and sextortion",
    shortTitle: "Threats / sextortion",
    overview:
      "Someone is threatening you, demanding money, or using private images or information to coerce you. Your safety comes first; do not pay or send more.",
    urgency: "immediate",
    immediateActions: [
      "If there is an immediate threat to your safety, call 112. Move to a safe place and tell a trusted person where you are.",
      "Do not pay, send more images, or follow instructions. A payment or another image usually leads to more demands, not closure.",
      "If a caller claims to be police, CBI, customs, or a court and demands money over a video call, end the call. Do not stay on the call and do not transfer money to a 'safe account'.",
      "Save messages, profile links, caller numbers, screenshots, and payment records before restricting or blocking the account. Do not delete the original evidence.",
      "Report the account to the platform. Report the cybercrime at cybercrime.gov.in; if money was paid, call your bank and 1930.",
      "Tell a trusted person and consider professional support. Being targeted is not your fault. Do not share intimate images with anyone offering to remove them.",
    ],
    evidenceToPreserve: [
      "Screenshots of the threat, username/profile URL, caller number, and the date/time of each message.",
      "Payment demands and any transaction reference; do not send more money to test the demand.",
      "A record of what was said on a call, including the claimed agency and the number shown.",
      "Do not re-share intimate images. Provide them only through an official reporting process that requires them.",
    ],
    accountsToSecure: [
      "The social/messaging account used by the attacker and your own privacy settings.",
      "Passwords, two-step verification, and recovery email/phone on your accounts.",
      "Bank/UPI accounts if payment details were exposed or money was sent.",
      "Any account containing private images or personal information; review who can see it.",
    ],
    reportingOptions: [
      {
        title: "Call 112 if you are in immediate danger",
        description:
          "Use the emergency service if there is a threat to life or safety. If you are safe, use the cybercrime channels below.",
        resourceIds: ["emergency112"],
      },
      {
        title: "Report the extortion or sextortion",
        description:
          "File on the National Cyber Crime Reporting Portal. If money was paid, call 1930 and your bank immediately. Recovery is not guaranteed.",
        resourceIds: ["cybercrimePortal", "helpline1930"],
      },
      {
        title: "Report the threatening call or message",
        description:
          "Report the suspected fraud communication on Sanchar Saathi. Keep the number and screenshots.",
        resourceIds: ["sancharSaathi"],
      },
    ],
    mistakesToAvoid: [
      "Do not pay, negotiate, or send another image to make the threats stop.",
      "Do not use a 'recovery hacker' or a private service that asks for payment or more private material.",
      "Do not delete the original messages or account before preserving evidence.",
      "Do not blame yourself or face it alone. Contact a trusted person and, if needed, a qualified mental-health professional.",
    ],
  },
];

const PLAYBOOK_BY_ID = new Map(
  SAFETY_PLAYBOOKS.map((playbook) => [playbook.id, playbook])
);

export function getPlaybook(id: PlaybookId): SafetyPlaybook | undefined {
  return PLAYBOOK_BY_ID.get(id);
}

export function getPlaybookOrThrow(id: PlaybookId): SafetyPlaybook {
  const playbook = PLAYBOOK_BY_ID.get(id);
  if (!playbook) {
    throw new Error(`Unknown playbook: ${id}`);
  }
  return playbook;
}

export function isPlaybookId(value: unknown): value is PlaybookId {
  return typeof value === "string" && PLAYBOOK_BY_ID.has(value as PlaybookId);
}

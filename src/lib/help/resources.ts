import type { OfficialResource, OfficialResourceId } from "./types.ts";

/**
 * Official Indian reporting channels used by the help layer.
 *
 * Contact details are intentionally limited to the verified scope of each
 * source. A helpline that handles financial fraud must not be presented as a
 * universal emergency number. No entry in this file submits anything.
 */
export const OFFICIAL_RESOURCES: OfficialResource[] = [
  {
    id: "emergency112",
    name: "Emergency Response Support System",
    operator: "Government of India",
    phone: "112",
    url: "https://112.gov.in/",
    description:
      "Call 112 only when there is immediate danger to life, a crime in progress, a fire, or a medical emergency. If you can leave safely, move away and contact a trusted person.",
    source: "Official ERSS portal, https://112.gov.in/",
    verifiedOn: "2026-10-26",
    importantLimit:
      "112 is an emergency service. Do not call it for a routine scam report when no one is in immediate danger.",
  },
  {
    id: "helpline1930",
    name: "National Cyber Fraud Helpline",
    operator: "Citizen Financial Cyber Fraud Reporting and Management System / I4C",
    phone: "1930",
    url: "https://cybercrime.gov.in/",
    description:
      "Call 1930 for financial cyber fraud in India, especially when money has left an account or a card, bank account, or UPI facility has been misused. Call as soon as possible, then file a complaint on the National Cyber Crime Reporting Portal.",
    source:
      "Sanchar Saathi (Department of Telecommunications) directs financial-fraud victims to 1930 and https://www.cybercrime.gov.in",
    verifiedOn: "2026-10-26",
    importantLimit:
      "Reporting quickly can help your bank act, but recovery of money is not guaranteed.",
  },
  {
    id: "cybercrimePortal",
    name: "National Cyber Crime Reporting Portal",
    operator: "Ministry of Home Affairs, Government of India",
    url: "https://cybercrime.gov.in/",
    description:
      "Use the official portal to file a cybercrime or financial-fraud complaint. Keep the acknowledgement or complaint reference number after submitting.",
    source: "Official NCRP, https://cybercrime.gov.in/",
    verifiedOn: "2026-10-26",
    importantLimit:
      "Satark AI does not submit a complaint or receive an acknowledgement on your behalf.",
  },
  {
    id: "sancharSaathi",
    name: "Sanchar Saathi (Chakshu)",
    operator: "Department of Telecommunications, Government of India",
    url: "https://sancharsaathi.gov.in/",
    description:
      "Use Sanchar Saathi to report suspected fraud calls, SMS, or WhatsApp messages and to report international calls that display an Indian number. Chakshu is for suspected fraud communication and spam, not for financial loss.",
    source:
      "Official Sanchar Saathi portal, https://sancharsaathi.gov.in/Home/index.jsp",
    verifiedOn: "2026-10-26",
    importantLimit:
      "Chakshu is not a financial-fraud or cybercrime complaint facility. If money was lost or a cybercrime occurred, use 1930 and https://cybercrime.gov.in.",
  },
  {
    id: "uidai",
    name: "UIDAI Aadhaar Helpline",
    operator: "Unique Identification Authority of India",
    phone: "1947",
    url: "https://uidai.gov.in/",
    description:
      "Use UIDAI's official helpline or portal for Aadhaar-related help, including concerns that someone is misusing your Aadhaar identity. Never share an Aadhaar OTP or biometrics with a caller.",
    source: "Official UIDAI portal, https://uidai.gov.in/",
    verifiedOn: "2026-10-26",
    importantLimit:
      "Satark AI does not verify the status of an Aadhaar complaint or identity-theft report.",
  },
  {
    id: "rbiCms",
    name: "RBI Complaint Management System",
    operator: "Reserve Bank of India",
    url: "https://cms.rbi.org.in/",
    description:
      "Use the RBI Complaint Management System for an unresolved complaint about a bank or regulated financial entity. First contact the bank through its official customer-care channel and keep the complaint reference.",
    source: "Official RBI CMS, https://cms.rbi.org.in/",
    verifiedOn: "2026-10-26",
    importantLimit:
      "This is not an emergency fraud line. Use 1930 and your bank immediately if money is being taken.",
  },
  {
    id: "consumerHelpline",
    name: "National Consumer Helpline",
    operator: "Department of Consumer Affairs, Government of India",
    phone: "1915",
    url: "https://consumerhelpline.gov.in/",
    description:
      "Use the National Consumer Helpline for a consumer grievance such as a paid-for order that was not delivered or a misleading online seller. Preserve the order, payment, and chat records.",
    source: "Official National Consumer Helpline, https://consumerhelpline.gov.in/",
    verifiedOn: "2026-10-26",
    importantLimit:
      "This is a consumer-grievance channel, not a police or cybercrime emergency service.",
  },
];

const RESOURCE_BY_ID = new Map(
  OFFICIAL_RESOURCES.map((resource) => [resource.id, resource])
);

export function getOfficialResource(
  id: OfficialResourceId
): OfficialResource | undefined {
  return RESOURCE_BY_ID.get(id);
}

export function getOfficialResources(
  ids: readonly OfficialResourceId[]
): OfficialResource[] {
  const seen = new Set<OfficialResourceId>();
  const resources: OfficialResource[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const resource = RESOURCE_BY_ID.get(id);
    if (resource) {
      seen.add(id);
      resources.push(resource);
    }
  }
  return resources;
}

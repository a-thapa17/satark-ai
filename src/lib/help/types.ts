export type OfficialResourceId =
  | "emergency112"
  | "helpline1930"
  | "cybercrimePortal"
  | "sancharSaathi"
  | "uidai"
  | "rbiCms"
  | "consumerHelpline";

export type PlaybookId =
  | "upi_payment_fraud"
  | "phishing_links"
  | "account_compromise"
  | "identity_theft"
  | "shopping_fraud"
  | "threats_extortion";

export type EmergencyScenarioId =
  | "financial_fraud"
  | "online_scam"
  | "account_compromise"
  | "identity_theft"
  | "threats_extortion";

export interface OfficialResource {
  id: OfficialResourceId;
  name: string;
  operator: string;
  description: string;
  url: string;
  phone?: string;
  /** The public source used to verify the contact details and scope. */
  source: string;
  verifiedOn: string;
  importantLimit?: string;
}

export interface PlaybookReportingOption {
  title: string;
  description: string;
  resourceIds: OfficialResourceId[];
}

export interface SafetyPlaybook {
  id: PlaybookId;
  title: string;
  shortTitle: string;
  overview: string;
  urgency: "immediate" | "urgent" | "standard";
  immediateActions: string[];
  evidenceToPreserve: string[];
  accountsToSecure: string[];
  reportingOptions: PlaybookReportingOption[];
  mistakesToAvoid: string[];
}

export interface EmergencyScenario {
  id: EmergencyScenarioId;
  title: string;
  shortTitle: string;
  overview: string;
  playbookIds: PlaybookId[];
  immediateActions: string[];
  evidenceToPreserve: string[];
  reportingOptions: PlaybookReportingOption[];
  finalStep: string;
}

export interface EmergencyPlanInput {
  scenario: EmergencyScenarioId;
  moneyLost?: boolean;
  immediateDanger?: boolean;
}

export interface EmergencyPlanStep {
  order: number;
  title: string;
  detail: string;
}

export interface EmergencyPlan {
  scenario: EmergencyScenario;
  urgency: "immediate" | "urgent" | "standard";
  headline: string;
  steps: EmergencyPlanStep[];
  evidenceToPreserve: string[];
  reportingOptions: PlaybookReportingOption[];
  resources: OfficialResource[];
  finalStep: string;
  noReportSubmitted: string;
  recoveryDisclaimer: string;
}

export interface EvidenceRequestInput {
  incidentType: EmergencyScenarioId | "other";
  playbookId?: PlaybookId;
  description: string;
  incidentAt?: string;
  name?: string;
  contact?: string;
  amount?: string;
  transactionRef?: string;
  suspiciousUrls?: string[];
  scannerFindings?: string;
}

export interface EvidenceReport {
  generatedAt: string;
  incidentTypeLabel: string;
  playbook: SafetyPlaybook;
  description: string;
  incidentAt?: string;
  name?: string;
  contact?: string;
  amount?: string;
  transactionRef?: string;
  suspiciousUrls: string[];
  scannerFindings?: string;
  redactionCount: number;
  redactionTypes: string[];
  nextSteps: string[];
  evidenceToPreserve: string[];
  reportingOptions: PlaybookReportingOption[];
  resources: OfficialResource[];
  content: string;
}

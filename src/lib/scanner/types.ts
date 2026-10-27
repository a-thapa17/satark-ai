export type RiskVerdict = "HIGH_RISK" | "SUSPICIOUS" | "NO_STRONG_WARNING";

export type SignalCategory =
  | "URGENCY_COERCION"
  | "CREDENTIAL_SOLICITATION"
  | "PAYMENT_UPI_LURE"
  | "ENTITY_IMPERSONATION"
  | "SUSPICIOUS_LINK"
  | "JOB_PRIZE_SCAM"
  | "INVESTMENT_SCAM"
  | "MALICIOUS_APP_ACCESS"
  | "IDENTITY_THEFT"
  | "DEFENSIVE_SIGNAL";

export type SignalSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "DEFENSIVE";

export interface DetectedSignal {
  id: string;
  category: SignalCategory;
  severity: SignalSeverity;
  label: string;
  explanation: string;
  matchedText?: string;
  weight: number;
}

export interface AiEvidenceItem {
  phrase: string;
  reason: string;
}

export type AiRiskAssessment = "high_risk" | "suspicious" | "no_strong_warning";

export interface AiAnalysisReport {
  category: string;
  riskAssessment: AiRiskAssessment;
  summary: string;
  evidence: AiEvidenceItem[];
  manipulationTactics: string[];
  recommendedActions: string[];
  uncertainties: string[];
  modelUsed?: string;
  disagreementWithRules?: boolean;
  disagreementExplanation?: string;
}

export interface ScanReport {
  verdict: RiskVerdict;
  score: number; // Heuristic 0–100 estimate, not a probability
  confidence: "High" | "Medium" | "Low";
  category: string;
  summary: string;
  /** Rule-engine verdict before any AI merge. */
  deterministicVerdict: RiskVerdict;
  /** Rule-engine heuristic score before any AI merge. */
  deterministicScore: number;
  signals: DetectedSignal[];
  defensiveSignals: DetectedSignal[];
  reasons: string[];
  safeNextSteps: string[];
  maskedInput: string;
  rawInputLength: number;
  maskedItemsCount: number;
  timestamp: string;
  limitationsDisclaimer: string;
  aiAnalysis?: AiAnalysisReport;
  aiError?: string;
  aiStatus?: "disabled" | "loading" | "success" | "fallback";
}

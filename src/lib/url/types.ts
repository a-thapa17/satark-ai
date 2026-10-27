export type UrlVerdict = "MALICIOUS" | "SUSPICIOUS" | "NO_KNOWN_THREAT" | "INCONCLUSIVE";

export type CheckStatus =
  | "clean"
  | "threat"
  | "unavailable"
  | "not_configured"
  | "error"
  | "skipped";

export type WarningSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface ThreatMatch {
  url?: string;
  threatType?: string;
  platformType?: string;
  tags?: string[];
  reference?: string;
}

export interface ThreatCheckResult {
  service: "Google Safe Browsing" | "URLhaus";
  status: CheckStatus;
  message: string;
  matches: ThreatMatch[];
  checkedUrls: string[];
}

export type RdapStatus = "ok" | "not_found" | "unavailable" | "error";

export interface RdapDomainInfo {
  status: RdapStatus;
  domain?: string;
  registrar?: string;
  createdAt?: string;
  ageDays?: number;
  registryStatuses: string[];
  message: string;
}

export type RedirectHopKind = "start" | "redirect" | "final" | "blocked" | "error";

export interface RedirectHop {
  url: string;
  status: number | null;
  kind: RedirectHopKind;
  location?: string;
  note?: string;
}

export interface UrlWarning {
  id: string;
  severity: WarningSeverity;
  label: string;
  explanation: string;
}

export interface UrlAnalysisReport {
  verdict: UrlVerdict;
  score: number;
  summary: string;
  submittedUrl: string;
  normalizedUrl: string;
  hostname: string;
  registrableDomain: string;
  finalUrl: string;
  redirects: RedirectHop[];
  redirectCount: number;
  redirectLimit: number;
  redirectChainTruncated: boolean;
  threats: {
    safeBrowsing: ThreatCheckResult;
    urlhaus: ThreatCheckResult;
  };
  domain: RdapDomainInfo;
  warnings: UrlWarning[];
  nextSteps: string[];
  limitations: string;
  analyzedAt: string;
  blocked?: {
    url: string;
    reason: string;
  };
  demo?: boolean;
}

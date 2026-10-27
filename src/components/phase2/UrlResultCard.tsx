import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe2,
  HelpCircle,
  Link2,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type {
  CheckStatus,
  RdapStatus,
  RedirectHop,
  ThreatCheckResult,
  UrlAnalysisReport,
  UrlVerdict,
  WarningSeverity,
} from "@/lib/url/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  URL_COPY,
  localizeRdapStatus,
  localizeRedirectKind,
  localizeSeverity,
  localizeThreatStatus,
  localizeUrlReport,
} from "@/lib/i18n/url";
import { formatTemplate } from "@/lib/i18n/language";

const VERDICT_STYLE: Record<
  UrlVerdict,
  {
    label: string;
    bg: string;
    border: string;
    badge: string;
    summary: string;
    icon: React.ReactNode;
    bar: string;
  }
> = {
  MALICIOUS: {
    label: "Malicious (confirmed)",
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-800 border-red-300",
    summary: "text-red-800",
    icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
    bar: "bg-red-500",
  },
  SUSPICIOUS: {
    label: "Suspicious",
    bg: "bg-amber-50",
    border: "border-amber-300",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
    summary: "text-amber-800",
    icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    bar: "bg-amber-500",
  },
  NO_KNOWN_THREAT: {
    label: "No known threat",
    bg: "bg-green-50",
    border: "border-green-300",
    badge: "bg-green-100 text-green-800 border-green-300",
    summary: "text-green-800",
    icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
    bar: "bg-green-500",
  },
  INCONCLUSIVE: {
    label: "Inconclusive",
    bg: "bg-slate-50",
    border: "border-slate-300",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    summary: "text-slate-700",
    icon: <HelpCircle className="w-5 h-5 text-slate-500" />,
    bar: "bg-slate-400",
  },
};

const CHECK_STYLE: Record<CheckStatus, { label: string; className: string }> = {
  clean: { label: "No match", className: "bg-green-100 text-green-800 border-green-300" },
  threat: { label: "Threat match", className: "bg-red-100 text-red-800 border-red-300" },
  unavailable: { label: "Unavailable", className: "bg-slate-100 text-slate-700 border-slate-300" },
  not_configured: { label: "Not configured", className: "bg-slate-100 text-slate-700 border-slate-300" },
  error: { label: "Error", className: "bg-amber-100 text-amber-800 border-amber-300" },
  skipped: { label: "Skipped", className: "bg-slate-100 text-slate-700 border-slate-300" },
};

const WARNING_STYLE: Record<WarningSeverity, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-300",
  HIGH: "bg-orange-100 text-orange-800 border-orange-300",
  MEDIUM: "bg-amber-100 text-amber-800 border-amber-300",
  LOW: "bg-slate-100 text-slate-700 border-slate-300",
};

function ScoreBar({
  score,
  verdict,
  label,
}: {
  score: number;
  verdict: UrlVerdict;
  label: string;
}) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-[#57534E]">
        <span>{label}</span>
        <span className="font-bold text-[#1C1917]">{score} / 100</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#E7E1D8]"
        role="img"
        aria-label={`${label}: ${score} / 100`}
      >
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${VERDICT_STYLE[verdict].bar}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CheckStatus }) {
  const { language } = useLanguage();
  const config = CHECK_STYLE[status];
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${config.className}`}>
      {localizeThreatStatus(status, language)}
    </span>
  );
}

function RedirectRow({ hop, index }: { hop: RedirectHop; index: number }) {
  const { language } = useLanguage();
  const statusClass =
    hop.kind === "blocked"
      ? "text-red-700 bg-red-50 border-red-200"
      : hop.kind === "error"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : hop.status && hop.status >= 400
          ? "text-amber-700 bg-amber-50 border-amber-200"
          : "text-[#44403C] bg-white border-[#E7E1D8]";
  return (
    <li className="flex items-start gap-2.5 text-xs">
      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EBE3D5] text-[10px] font-bold text-[#78350F]">
        {index + 1}
      </span>
      <div className={`min-w-0 flex-1 rounded-lg border px-2.5 py-2 ${statusClass}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono font-semibold">{hop.status ?? "—"}</span>
          <span className="font-semibold uppercase tracking-wide text-[10px] text-[#57534E]">
            {localizeRedirectKind(hop.kind, language)}
          </span>
        </div>
        <p className="mt-0.5 break-all font-mono leading-relaxed">{hop.url}</p>
        {hop.note && <p className="mt-1 text-[11px] text-[#57534E]">{hop.note}</p>}
      </div>
    </li>
  );
}

function ThreatCheckRow({
  check,
  localizedMessage,
}: {
  check: ThreatCheckResult;
  localizedMessage: string;
}) {
  const { language } = useLanguage();
  const copy = URL_COPY[language];
  return (
    <div className="rounded-xl border border-[#E7E1D8] bg-white p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
          <span className="text-xs font-bold text-[#1C1917]">{check.service}</span>
        </div>
        <StatusBadge status={check.status} />
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[#57534E]">
        {localizedMessage}
      </p>
      {check.matches.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {check.matches.map((match, index) => (
            <li key={`${check.service}-${index}`} className="break-words rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-800">
              <span className="font-bold">{match.threatType || copy.ui.threatFallback}</span>
              {match.url && <span className="block break-all font-mono text-red-700">{match.url}</span>}
              {match.tags && match.tags.length > 0 && (
                <span className="block text-[10px] text-red-700">
                  {copy.ui.tags} {match.tags.join(", ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-1.5 text-[10px] text-[#57534E]">
        {formatTemplate(copy.ui.checked, { count: check.checkedUrls.length })}
      </p>
    </div>
  );
}

export function UrlResultCard({ report }: { report: UrlAnalysisReport }) {
  const { language } = useLanguage();
  const copy = URL_COPY[language];
  const view = localizeUrlReport(report, language);
  const style = VERDICT_STYLE[report.verdict];
  const domain = report.domain;

  return (
    <div
      className={`mt-4 overflow-hidden rounded-2xl border-2 shadow-sm ${style.border}`}
      data-testid="url-result-card"
      role="region"
      aria-label={copy.ui.assessment}
    >
      <div className={`border-b p-5 ${style.bg} ${style.border}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {style.icon}
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                {copy.ui.assessment}
              </p>
              <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-0.5 text-sm font-extrabold uppercase tracking-wide ${style.badge}`}>
                <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                {view.verdictLabel}
              </span>
              <p className={`mt-1 text-xs font-medium ${style.summary}`}>{view.summary}</p>
            </div>
          </div>
          <div className="hidden text-right text-xs text-[#57534E] sm:block">
            <span className="text-base font-bold text-[#1C1917]">{report.score}</span>
            <span className="text-[#78716C]"> / 100</span>
            <p className="break-all font-medium">{report.registrableDomain}</p>
            <p>
              {formatTemplate(copy.ui.redirects, {
                count: report.redirectCount,
                truncated: "",
              })}
            </p>
          </div>
        </div>
        <ScoreBar score={report.score} verdict={report.verdict} label={copy.ui.scoreLabel} />
        <p className="mt-1.5 text-[11px] text-[#57534E]">{copy.ui.scoreNote}</p>
      </div>

      {report.demo && (
        <div className="flex items-start gap-2 border-b border-violet-200 bg-violet-50 px-5 py-3 text-xs text-violet-950">
          <Clock3 className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>{copy.ui.demoTitle}</strong> {copy.ui.demoBody}
          </span>
        </div>
      )}

      {report.blocked && (
        <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-5 py-3 text-xs text-red-900">
          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            <strong>{copy.ui.blockedTitle}</strong> {report.blocked.reason}{" "}
            {copy.ui.blockedBody}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 bg-white p-5 lg:grid-cols-2">
        <div className="space-y-5">
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              <Link2 className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
              {copy.ui.details}
            </h4>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="font-semibold text-[#57534E]">{copy.ui.submitted}</dt>
                <dd className="break-all font-mono text-[#1C1917]">{report.submittedUrl}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#57534E]">{copy.ui.normalized}</dt>
                <dd className="break-all font-mono text-[#1C1917]">{report.normalizedUrl}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#57534E]">{copy.ui.finalDestination}</dt>
                <dd className="break-all font-mono text-[#1C1917]">{report.finalUrl}</dd>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-[#57534E]">{copy.ui.hostname}</dt>
                  <dd className="break-all text-[#1C1917]">{report.hostname}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-[#57534E]">{copy.ui.registrableDomain}</dt>
                  <dd className="break-all text-[#1C1917]">{report.registrableDomain}</dd>
                </div>
              </div>
            </dl>
          </section>

          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              <Globe2 className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
              {formatTemplate(copy.ui.redirects, {
                count: report.redirectCount,
                truncated: report.redirectChainTruncated
                  ? copy.ui.redirectsTruncated
                  : "",
              })}
            </h4>
            <ul className="space-y-2">
              {report.redirects.map((hop, index) => (
                <RedirectRow key={`${hop.url}-${index}`} hop={hop} index={index} />
              ))}
            </ul>
            <p className="mt-2 text-[10px] text-[#57534E]">
              {formatTemplate(copy.ui.redirectLimitNote, { limit: report.redirectLimit })}
            </p>
          </section>

          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              <Clock3 className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
              {copy.ui.domainRegistration}
            </h4>
            <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-[#1C1917]">{domain.domain || report.registrableDomain}</span>
                <span className="rounded-md border border-[#DFD4C0] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#57534E]">
                  {localizeRdapStatus(domain.status, language)}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#57534E]">
                {view.domainMessage}
              </p>
              {domain.status === "ok" && (
                <dl className="mt-2 grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-[#57534E]">{copy.ui.registrar}</dt>
                    <dd className="break-words text-[#1C1917]">
                      {domain.registrar || copy.ui.notReported}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#57534E]">{copy.ui.created}</dt>
                    <dd className="text-[#1C1917]">
                      {domain.createdAt ? domain.createdAt.slice(0, 10) : copy.ui.notReported}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#57534E]">{copy.ui.age}</dt>
                    <dd className="text-[#1C1917]">
                      {typeof domain.ageDays === "number"
                        ? formatTemplate(copy.ui.ageDays, { count: domain.ageDays })
                        : copy.ui.unknown}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#57534E]">{copy.ui.registryStatus}</dt>
                    <dd className="break-words text-[#1C1917]">
                      {domain.registryStatuses.length
                        ? domain.registryStatuses.join(", ")
                        : copy.ui.noneReported}
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              <Search className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
              {copy.ui.threatChecks}
            </h4>
            <div className="space-y-2">
              <ThreatCheckRow
                check={report.threats.safeBrowsing}
                localizedMessage={view.threatMessages.safeBrowsing}
              />
              <ThreatCheckRow
                check={report.threats.urlhaus}
                localizedMessage={view.threatMessages.urlhaus}
              />
            </div>
            <p className="mt-2 text-[10px] text-[#57534E]">{copy.ui.threatNote}</p>
          </section>

          <section>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              <AlertTriangle className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
              {formatTemplate(copy.ui.warnings, { count: view.warnings.length })}
            </h4>
            {view.warnings.length === 0 ? (
              <p className="text-xs text-[#57534E]">{copy.ui.noWarnings}</p>
            ) : (
              <ul className="space-y-2">
                {view.warnings.map((warning) => (
                  <li key={warning.id} className="rounded-xl border border-[#E7E1D8] bg-white p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${WARNING_STYLE[warning.severity]}`}>
                        {localizeSeverity(warning.severity, language)}
                      </span>
                      <span className="text-xs font-bold text-[#1C1917]">{warning.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
                      {warning.explanation}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
              {copy.ui.safeSteps}
            </h4>
            <ul className="space-y-2 text-xs text-[#44403C]">
              {view.nextSteps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#15803D]" />
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="border-t border-[#E7E1D8] bg-[#F4EFE6] px-5 py-3 text-[11px] text-[#57534E]">
        {view.limitations}
      </div>
    </div>
  );
}

import React from "react";
import {
  AlertTriangle,
  AtSign,
  CheckCircle2,
  FileText,
  Hash,
  IndianRupee,
  Info,
  ShieldAlert,
  Store,
  User,
} from "lucide-react";
import type { UpiPaymentDetails } from "@/lib/qr/upi";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { UPI_COPY, localizeUpiWarning } from "@/lib/i18n/upi";
import type { Language } from "@/lib/i18n/language";

function formatAmount(payment: UpiPaymentDetails, language: Language): string {
  if (payment.amountValue === undefined) return UPI_COPY[language].notSpecified;
  try {
    return new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
      style: "currency",
      currency: payment.currency,
      maximumFractionDigits: 2,
    }).format(payment.amountValue);
  } catch {
    return `${payment.currency} ${payment.amount ?? payment.amountValue}`;
  }
}

function Detail({
  icon,
  label,
  value,
  mono = false,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-2.5 ${
        highlight
          ? "border-red-300 bg-red-50/80 ring-2 ring-red-400"
          : "border-[#E7E1D8] bg-white"
      }`}
    >
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#57534E]">
        {icon}
        {label}
      </dt>
      <dd
        className={`mt-1 break-words text-sm font-semibold ${
          highlight ? "text-red-900 font-bold" : "text-[#1C1917]"
        } ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

export function UpiResultCard({ payment }: { payment: UpiPaymentDetails }) {
  const { language } = useLanguage();
  const copy = UPI_COPY[language];

  return (
    <div
      className={`mt-4 overflow-hidden rounded-2xl border-2 ${
        payment.isSuspiciousVpa ? "border-red-500 shadow-lg" : "border-amber-300 shadow-sm"
      } bg-white`}
      data-testid="upi-result-card"
      role="region"
      aria-label={copy.decodedLabel}
    >
      <div
        className={`border-b ${
          payment.isSuspiciousVpa
            ? "border-red-400 bg-red-50"
            : "border-amber-300 bg-amber-50"
        } p-5`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${
              payment.isSuspiciousVpa
                ? "border-red-300 bg-red-600 text-white"
                : "border-amber-300 bg-white text-amber-800"
            }`}
          >
            <IndianRupee className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                {copy.decodedLabel}
              </p>
              {payment.isSuspiciousVpa && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Suspicious VPA Detected
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-[#1C1917]">{copy.heading}</h3>
            <p className="mt-1 text-xs leading-relaxed text-amber-950">{copy.intro}</p>
          </div>
        </div>
      </div>

      {payment.isSuspiciousVpa && (
        <div className="border-b border-red-300 bg-red-100/90 px-5 py-3 text-xs text-red-950">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-700" aria-hidden="true" />
            <div>
              <strong className="block text-red-900 font-bold">WARNING: High Risk VPA Pattern</strong>
              <p className="mt-0.5">
                This UPI ID matches known imposter patterns:{" "}
                <span className="font-semibold underline">
                  {payment.suspiciousReasons?.join(", ")}
                </span>
                . Scammers create VPAs like these to impersonate banks and official departments.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start gap-2 border-b border-red-200 bg-red-50 px-5 py-3 text-xs text-red-950">
        <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-700" aria-hidden="true" />
        <div>
          <strong>{copy.warningTitle}</strong> {copy.warningBody}
        </div>
      </div>

      <div className="p-5">
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Detail
            icon={<User className="h-3 w-3" aria-hidden="true" />}
            label={copy.payeeName}
            value={payment.payeeName || copy.notProvided}
          />
          <Detail
            icon={<AtSign className="h-3 w-3" aria-hidden="true" />}
            label={copy.upiId}
            value={payment.upiId}
            mono
            highlight={payment.isSuspiciousVpa}
          />
          <Detail
            icon={<IndianRupee className="h-3 w-3" aria-hidden="true" />}
            label={copy.amount}
            value={formatAmount(payment, language)}
          />
          <Detail
            icon={<Store className="h-3 w-3" aria-hidden="true" />}
            label={copy.currency}
            value={payment.currency}
          />
          <Detail
            icon={<FileText className="h-3 w-3" aria-hidden="true" />}
            label={copy.transactionNote}
            value={payment.transactionNote || copy.notProvided}
          />
          <Detail
            icon={<Hash className="h-3 w-3" aria-hidden="true" />}
            label={copy.merchantCode}
            value={payment.merchantCode || copy.notProvided}
            mono
          />
          <Detail
            icon={<Hash className="h-3 w-3" aria-hidden="true" />}
            label={copy.transactionRef}
            value={payment.transactionRef || copy.notProvided}
            mono
          />
        </dl>

        <div className="mt-4 rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#57534E]">
            {copy.decodedUri}
          </p>
          <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-[#44403C]">
            {payment.uri}
          </p>
        </div>

        {payment.warnings.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              {copy.parsingWarnings}
            </p>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-amber-950">
              {payment.warnings.map((warning, index) => (
                <li key={`${warning}-${index}`} className="flex items-start gap-1.5">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-700" />
                  {localizeUpiWarning(warning, language)}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-[#E7E1D8] bg-white p-4">
          <h4 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
            <CheckCircle2 className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
            {copy.safeSteps}
          </h4>
          <ul className="space-y-2 text-xs text-[#44403C]">
            {copy.steps.map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#15803D]" />
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#57534E]">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {copy.disclaimer}
        </p>
      </div>
    </div>
  );
}

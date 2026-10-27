"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  PhoneCall,
  Search,
  ShieldQuestion,
} from "lucide-react";
import {
  analyzeSuspiciousCall,
  CALL_EXAMPLES,
  type CallCheckResult,
} from "@/lib/help/phone";
import { OfficialResourceLinks } from "@/components/help/HelpPrimitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";
import {
  localizeCallExample,
  localizeCallResult,
} from "@/lib/i18n/help-content";

const NUMBER_STATUS_STYLE = {
  valid: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-700" aria-hidden="true" />,
    box: "border-green-200 bg-green-50",
    titleClass: "text-green-900",
  },
  invalid: {
    icon: <AlertCircle className="h-4 w-4 text-amber-700" aria-hidden="true" />,
    box: "border-amber-200 bg-amber-50",
    titleClass: "text-amber-950",
  },
  not_provided: {
    icon: <Info className="h-4 w-4 text-slate-600" aria-hidden="true" />,
    box: "border-slate-200 bg-slate-50",
    titleClass: "text-slate-800",
  },
} as const;

export default function PhoneCallChecker() {
  const { language } = useLanguage();
  const copy = HELP_COPY[language];
  const examples = CALL_EXAMPLES.map((example) =>
    localizeCallExample(example, language)
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<CallCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const viewResult = result ? localizeCallResult(result, language) : null;

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phoneNumber.trim() && !description.trim()) {
      setError(copy.phone.errorEmpty);
      setResult(null);
      return;
    }
    setError(null);
    setIsChecking(true);
    try {
      setResult(
        analyzeSuspiciousCall({
          phoneNumber,
          description,
        })
      );
    } finally {
      setIsChecking(false);
    }
  }

  function applyExample(exampleId: string) {
    const example = examples.find((item) => item.id === exampleId);
    if (!example) return;
    setDescription(example.description);
    setError(null);
    setResult(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-sm"
        noValidate
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
            <PhoneCall className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1C1917]">
              {copy.phone.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
              {copy.phone.intro}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="call-number"
            className="block text-xs font-bold text-[#1C1917]"
          >
            {copy.phone.numberLabel} <span className="font-normal">{copy.common.optional}</span>
          </label>
          <input
            id="call-number"
            name="phoneNumber"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            maxLength={40}
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder={copy.phone.numberPlaceholder}
            aria-describedby="call-number-help"
            className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
          />
          <p id="call-number-help" className="mt-1.5 text-[11px] text-[#78716C]">
            {copy.phone.numberHelp}
          </p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="call-description"
            className="block text-xs font-bold text-[#1C1917]"
          >
            {copy.phone.descriptionLabel}{" "}
            <span className="font-normal">{copy.common.optional}</span>
          </label>
          <textarea
            id="call-description"
            name="description"
            rows={5}
            maxLength={1500}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={copy.phone.descriptionPlaceholder}
            aria-describedby="call-description-help"
            className="mt-1.5 w-full resize-y rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm leading-relaxed text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
          />
          <p
            id="call-description-help"
            className="mt-1.5 text-[11px] text-[#78716C]"
          >
            {copy.phone.descriptionHelp}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              onClick={() => applyExample(example.id)}
              className="rounded-full border border-[#DFD4C0] bg-[#FAF7F2] px-2.5 py-1 text-[10px] font-semibold text-[#57534E] transition-colors hover:border-[#D97706] hover:text-[#1C1917]"
            >
              {example.label}
            </button>
          ))}
        </div>

        {error ? (
          <div
            id="call-check-error"
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
              aria-hidden="true"
            />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isChecking}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-offset-2"
        >
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
          )}
          {isChecking ? copy.phone.checking : copy.phone.submit}
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-[#78716C]">
          {copy.phone.privacy}
          {language === "hi" ? ` ${copy.phone.noticeEnglishDetection}` : ""}
        </p>
      </form>

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        aria-labelledby="call-result-heading"
        className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
      >
        {viewResult ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
                  {copy.phone.resultEyebrow}
                </span>
                <h3
                  id="call-result-heading"
                  className="mt-1 text-lg font-black text-[#1C1917]"
                >
                  {copy.phone.resultHeading}
                </h3>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                <ShieldQuestion className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.phone.noReputation}
              </span>
            </div>

            <div
              className={`mt-4 rounded-xl border p-4 ${
                NUMBER_STATUS_STYLE[viewResult.number.status].box
              }`}
            >
              <h4
                className={`flex items-center gap-2 text-sm font-bold ${
                  NUMBER_STATUS_STYLE[viewResult.number.status].titleClass
                }`}
              >
                {NUMBER_STATUS_STYLE[viewResult.number.status].icon}
                {copy.phone.status[viewResult.number.status]}
              </h4>
              {viewResult.number.status === "valid" ? (
                <div className="mt-2 space-y-1 text-xs text-[#44403C]">
                  <p>
                    <strong>{copy.phone.normalised}:</strong> {viewResult.number.e164}
                  </p>
                  <p>
                    <strong>{copy.phone.international}:</strong> {viewResult.number.international}
                  </p>
                  <p>
                    <strong>{copy.phone.country}:</strong>{" "}
                    {viewResult.number.country ?? copy.phone.unknown}{" "}
                    (+{viewResult.number.countryCallingCode ?? "?"})
                  </p>
                  {viewResult.number.lineType &&
                  viewResult.number.lineType !== copy.phone.unknown ? (
                    <p>
                      <strong>{copy.phone.lineType}:</strong>{" "}
                      {viewResult.number.lineType}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <p className="mt-2 text-[11px] leading-relaxed text-[#57534E]">
                {viewResult.number.explanation}
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3 text-[11px] leading-relaxed text-[#78350F]">
              {copy.phone.formatWarning}
            </div>

            <div className="mt-5">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                <AlertTriangle
                  className="h-4 w-4 text-[#D97706]"
                  aria-hidden="true"
                />
                {copy.phone.signalsHeading}
              </h4>
              {viewResult.signals.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {viewResult.signals.map((signal) => (
                    <li
                      key={signal.id}
                      className="rounded-lg border border-[#E7E1D8] p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            signal.severity === "high"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {copy.phone.severity[signal.severity]}
                        </span>
                        <span className="text-xs font-bold text-[#1C1917]">
                          {signal.label}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
                        {signal.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-700">
                  {viewResult.descriptionWasProvided
                    ? copy.phone.noSignalsDescription
                    : copy.phone.noSignalsEmpty}
                </p>
              )}
            </div>

            <div className="mt-5 rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                <CheckCircle2
                  className="h-4 w-4 text-[#15803D]"
                  aria-hidden="true"
                />
                {copy.phone.safeSteps}
              </h4>
              <ol className="mt-2 space-y-2 text-xs leading-relaxed text-[#44403C]">
                {viewResult.nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#78350F]">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {viewResult.resources.length > 0 ? (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                  {copy.phone.officialOptions}
                </h4>
                <OfficialResourceLinks
                  resourceIds={viewResult.resources.map((resource) => resource.id)}
                />
              </div>
            ) : null}

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                {copy.phone.limitations}
              </h4>
              <ul className="mt-1 space-y-1 text-[11px] leading-relaxed text-slate-600">
                {viewResult.notes.map((note) => (
                  <li key={note}>- {note}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#B45309]">
              <PhoneCall className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3
              id="call-result-heading"
              className="mt-4 text-base font-bold text-[#1C1917]"
            >
              {copy.phone.emptyTitle}
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#57534E]">
              {copy.phone.emptyBody}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

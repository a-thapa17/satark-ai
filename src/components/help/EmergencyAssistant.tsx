"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  HeartHandshake,
  MessageSquareWarning,
  ShieldAlert,
  UserRoundX,
} from "lucide-react";
import { buildEmergencyPlan } from "@/lib/help/scenarios";
import type {
  EmergencyPlan,
  EmergencyScenarioId,
} from "@/lib/help/types";
import { OfficialResourceLinks } from "@/components/help/HelpPrimitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";
import {
  getLocalizedScenarios,
  localizeEmergencyPlan,
} from "@/lib/i18n/help-content";

const SCENARIO_ICONS: Record<EmergencyScenarioId, React.ReactNode> = {
  financial_fraud: <CreditCard className="h-4 w-4" aria-hidden="true" />,
  online_scam: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
  account_compromise: <UserRoundX className="h-4 w-4" aria-hidden="true" />,
  identity_theft: <Fingerprint className="h-4 w-4" aria-hidden="true" />,
  threats_extortion: <HeartHandshake className="h-4 w-4" aria-hidden="true" />,
};

const URGENCY_STYLE = {
  immediate: {
    label: "Act now",
    className: "border-red-300 bg-red-50 text-red-800",
  },
  urgent: {
    label: "Act today",
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
  standard: {
    label: "Review now",
    className: "border-slate-300 bg-slate-50 text-slate-700",
  },
} as const;

export default function EmergencyAssistant() {
  const [scenario, setScenario] =
    useState<EmergencyScenarioId>("financial_fraud");
  const [moneyLost, setMoneyLost] = useState(false);
  const [immediateDanger, setImmediateDanger] = useState(false);
  const [plan, setPlan] = useState<EmergencyPlan | null>(null);
  const [planSelections, setPlanSelections] = useState({ immediateDanger: false, moneyLost: false });
  const { language } = useLanguage();
  const copy = HELP_COPY[language];
  const scenarios = getLocalizedScenarios(language);
  const viewPlan = plan
    ? localizeEmergencyPlan(plan, language, planSelections)
    : null;
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (plan) {
      resultRef.current?.focus();
    }
  }, [plan]);

  const selectedScenario = scenarios.find((item) => item.id === scenario);

  function generatePlan() {
    setPlan(
      buildEmergencyPlan({
        scenario,
        moneyLost,
        immediateDanger,
      })
    );
    setPlanSelections({ immediateDanger, moneyLost });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <div>
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
            aria-hidden="true"
          />
          <div>
            <h3 className="text-sm font-bold text-red-900">
              {copy.emergency.dangerTitle}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-red-800">
              {copy.emergency.dangerBody}
              <a
                href="tel:112"
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-red-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-800"
              >
                {copy.common.call112}
              </a>
            </p>
          </div>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-[#1C1917]">
            {copy.emergency.questionOne}
          </legend>
          <div className="space-y-2">
            {scenarios.map((item) => {
              const selected = item.id === scenario;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setScenario(item.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    selected
                      ? "border-[#D97706] bg-[#FEF3C7] shadow-sm"
                      : "border-[#E7E1D8] bg-white hover:border-[#D97706]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-[#D97706] text-white"
                        : "bg-[#FAF7F2] text-[#78350F]"
                    }`}
                  >
                    {SCENARIO_ICONS[item.id]}
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-[#1C1917]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-[#57534E]">
                      {item.overview}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5 rounded-xl border border-[#E7E1D8] bg-white p-4">
          <legend className="px-1 text-sm font-bold text-[#1C1917]">
            {copy.emergency.quickCheck}
          </legend>
          <div className="space-y-3 text-xs text-[#44403C]">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={immediateDanger}
                onChange={(event) => setImmediateDanger(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#A8A29E] text-[#D97706] focus:ring-[#D97706]"
              />
              <span>
                <strong className="block text-[#1C1917]">
                  {copy.emergency.immediateDangerLabel}
                </strong>
                {copy.emergency.immediateDangerBody}
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={moneyLost}
                onChange={(event) => setMoneyLost(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#A8A29E] text-[#D97706] focus:ring-[#D97706]"
              />
              <span>
                <strong className="block text-[#1C1917]">
                  {copy.emergency.moneyLostLabel}
                </strong>
                {copy.emergency.moneyLostBody}
              </span>
            </label>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={generatePlan}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#292524] focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-offset-2"
        >
          {copy.emergency.showPlan}
          <ArrowRight className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
        </button>

        {selectedScenario ? (
          <p className="mt-3 text-[11px] leading-relaxed text-[#78716C]">
            {copy.emergency.selected.replace("{scenario}", selectedScenario.title)}
          </p>
        ) : null}
      </div>

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        aria-labelledby="emergency-plan-heading"
        className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
      >
        {viewPlan ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#78716C]">
                  {copy.emergency.planEyebrow}
                </span>
                <h3
                  id="emergency-plan-heading"
                  className="mt-1 text-lg font-black text-[#1C1917]"
                >
                  {viewPlan.scenario.shortTitle}
                </h3>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  URGENCY_STYLE[viewPlan.urgency].className
                }`}
              >
                {copy.emergency.urgency[viewPlan.urgency]}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#1C1917]">
              {viewPlan.headline}
            </p>

            <div className="mt-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-xs text-[#78350F]">
              <strong>{copy.emergency.noReportBold}</strong>{" "}
              {viewPlan.noReportSubmitted}
            </div>

            <ol className="mt-5 space-y-3">
              {viewPlan.steps.map((step) => (
                <li key={step.order} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#1C1917] text-[11px] font-bold text-white">
                    {step.order}
                  </span>
                  <p className="text-xs leading-relaxed text-[#44403C]">
                    {step.detail}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                <CheckCircle2
                  className="h-4 w-4 text-[#15803D]"
                  aria-hidden="true"
                />
                {copy.emergency.evidenceHeading}
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#44403C]">
                {viewPlan.evidenceToPreserve.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D97706]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                <MessageSquareWarning
                  className="h-4 w-4 text-[#D97706]"
                  aria-hidden="true"
                />
                {copy.emergency.reportHeading}
              </h4>
              <div className="mt-2 space-y-3">
                {viewPlan.reportingOptions.map((option) => (
                  <div
                    key={option.title}
                    className="rounded-xl border border-[#E7E1D8] p-3"
                  >
                    <p className="text-xs font-bold text-[#1C1917]">
                      {option.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
                      {option.description}
                    </p>
                    <OfficialResourceLinks
                      resourceIds={option.resourceIds}
                      compact
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-[#D6D3D1] bg-white p-3 text-[11px] leading-relaxed text-[#57534E]">
              <p>
                <strong className="text-[#1C1917]">{copy.emergency.finalStepBold}</strong>{" "}
                {viewPlan.finalStep}
              </p>
              <p className="mt-2 text-[#78716C]">{viewPlan.recoveryDisclaimer}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#B45309]">
              <AlertTriangle className="h-7 w-7" aria-hidden="true" />
            </div>
            <h3
              id="emergency-plan-heading"
              className="mt-4 text-base font-bold text-[#1C1917]"
            >
              {copy.emergency.emptyTitle}
            </h3>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#57534E]">
              {copy.emergency.emptyBody}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

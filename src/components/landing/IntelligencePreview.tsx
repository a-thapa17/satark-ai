"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Globe,
  Lock,
  PhoneCall,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LANDING_COPY,
  SAMPLE_INPUTS,
  type LandingTab,
} from "@/lib/i18n/landing";

export default function IntelligencePreview() {
  const [activeTab, setActiveTab] = useState<LandingTab>("url");
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];
  const activeSample = {
    ...SAMPLE_INPUTS[activeTab],
    ...copy.samples.items[activeTab],
  };

  return (
    <section
      id="sample-intelligence"
      aria-labelledby="sample-heading"
      className="border-y border-[#E7E1D8] bg-[#F4EFE6] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#DFD4C0] bg-[#EBE3D5] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#78350F]">
              {copy.samples.eyebrow}
            </div>
            <h2 className="mb-1 text-xs font-black uppercase tracking-widest text-[#92400E]">
              {copy.samples.categoryLabel}
            </h2>
            <p
              id="sample-heading"
              className="text-3xl font-black tracking-tight text-[#1C1917]"
            >
              {copy.samples.heading}
            </p>
          </div>

          <div
            className="flex flex-wrap rounded-xl border border-[#DFD4C0] bg-white p-1.5 shadow-sm"
            role="group"
            aria-label={copy.samples.heading}
          >
            {(["url", "qr", "phone"] as const).map((tab) => {
              const selected = activeTab === tab;
              const Icon = tab === "url" ? Globe : tab === "qr" ? QrCode : PhoneCall;
              return (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="sample-example-panel"
                  onClick={() => setActiveTab(tab)}
                  className={`flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    selected
                      ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                      : "text-[#57534E] hover:text-[#1C1917]"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.samples.tabs[tab]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div
          id="sample-example-panel"
          className="overflow-hidden rounded-2xl border-2 border-[#E7E1D8] bg-white shadow-lg"
        >
          <div className="border-b border-[#E7E1D8] bg-[#FBF9F5] p-6 sm:p-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#57534E]">
                {copy.samples.sampleInput} ({activeSample.title})
              </span>
              <span className="rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-3 py-1 text-xs font-bold text-[#78350F]">
                {copy.samples.preMasked}
              </span>
            </div>
            <p className="break-all rounded-xl border border-[#E7E1D8] bg-white p-4 font-mono text-sm font-medium text-[#1C1917] shadow-inner">
              {activeSample.input}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 border-b border-[#E7E1D8] bg-white p-6 sm:grid-cols-3 sm:p-8">
            <div>
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#78716C]">
                {copy.samples.riskLevel}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-sm font-black uppercase tracking-wide ${activeSample.riskBadgeClass}`}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
                {activeSample.riskLevel}
              </span>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#78716C]">
                {copy.samples.category}
              </span>
              <span className="text-base font-black text-[#1C1917]">
                {activeSample.category}
              </span>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-black uppercase tracking-wider text-[#78716C]">
                {copy.samples.confidence}
              </span>
              <span className="text-sm font-semibold text-[#57534E]">
                {activeSample.confidence}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 bg-white p-6 md:grid-cols-2 sm:p-8">
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1C1917]">
                <AlertTriangle className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                {copy.samples.whyFlagged}
              </h3>
              <ul className="space-y-3 text-sm text-[#44403C]">
                {activeSample.reasons.map((reason) => (
                  <li key={reason} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#B45309]" />
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-6">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1C1917]">
                <ShieldCheck className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                {copy.samples.safeSteps}
              </h3>
              <ul className="space-y-3 text-sm text-[#44403C]">
                {activeSample.nextSteps.map((step) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#15803D]" />
                    <span className="font-semibold leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E7E1D8] bg-[#F4EFE6] px-6 py-4 text-xs font-medium text-[#78716C] sm:px-8">
            <span>{copy.samples.footerLeft}</span>
            <span className="font-bold text-[#78350F]">
              {copy.samples.footerRight}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  EyeOff,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  MessageSquareWarning,
  PhoneCall,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import CinematicIntro from "@/components/CinematicIntro";
import SiteHeader from "@/components/SiteHeader";
import MessageScanner from "@/components/MessageScanner";
import Phase2Scanner from "@/components/Phase2Scanner";
import HelpHub from "@/components/help/HelpHub";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LANDING_COPY,
  SAMPLE_INPUTS,
  type LandingTab,
} from "@/lib/i18n/landing";

export default function Home() {
  const [activeTab, setActiveTab] = useState<LandingTab>("url");
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];
  const activeSample = {
    ...SAMPLE_INPUTS[activeTab],
    ...copy.samples.items[activeTab],
  };

  const quickIcons = [
    <MessageSquareWarning key="message" className="h-5 w-5" aria-hidden="true" />,
    <QrCode key="qr" className="h-5 w-5" aria-hidden="true" />,
    <HelpCircle key="help" className="h-5 w-5" aria-hidden="true" />,
  ];

  const pillarIcons = [
    <MessageSquareWarning key="message" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
    <ShieldAlert key="shield-alert" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
    <AlertTriangle key="alert" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
    <ShieldCheck key="shield-check" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
  ];

  const trustIcons = [
    <EyeOff key="eye-off" className="h-4 w-4" aria-hidden="true" />,
    <ShieldCheck key="shield-check" className="h-4 w-4" aria-hidden="true" />,
    <FileText key="file-text" className="h-4 w-4" aria-hidden="true" />,
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20 text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#92400E] md:pb-0">
      <CinematicIntro />

      <div id="main-homepage-content" className="transition-opacity duration-600 ease-in-out">
        <a href="#main-content" className="skip-link">
          {copy.skip}
        </a>

        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          {/* Hero Section */}
          <section
            aria-labelledby="hero-heading"
            className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16"
          >
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DFD4C0] bg-[#EBE3D5]/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#78350F]">
                  <Sparkles className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
                  {copy.hero.eyebrow}
                </div>

                <h1
                  id="hero-heading"
                  className="mb-6 text-4xl font-black leading-[1.1] tracking-tight text-[#1C1917] sm:text-5xl lg:text-6xl"
                >
                  {copy.hero.titleStart}{" "}
                  <span className="text-[#92400E] underline decoration-[#B45309]/30 underline-offset-8">
                    {copy.hero.titleHighlight}
                  </span>
                </h1>

                <p className="mb-5 text-base leading-relaxed text-[#57534E] sm:text-lg lg:text-xl">
                  {copy.hero.intro}
                </p>
                <p className="mb-8 max-w-2xl text-xs leading-relaxed text-[#78716C] sm:text-sm">
                  {copy.hero.disclaimer}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 sm:gap-4">
                  <a
                    href="#scanner"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1C1917] px-5 py-3 text-sm font-semibold text-[#FAF7F2] shadow-md transition-all hover:bg-[#292524] sm:px-6 sm:py-3.5"
                  >
                    <span>{copy.hero.primaryCta}</span>
                    <ChevronRight className="h-4 w-4 text-[#FCD34D]" aria-hidden="true" />
                  </a>

                  <a
                    href="tel:1930"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#DFD4C0] bg-white px-5 py-3 text-sm font-semibold text-[#1C1917] shadow-sm transition-all hover:border-[#B45309] hover:shadow sm:px-6 sm:py-3.5"
                  >
                    <PhoneCall className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                    <span>{copy.hero.helplineCta}</span>
                  </a>

                  <a
                    href="#emergency-help"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-950 shadow-sm transition-all hover:border-red-400 hover:shadow sm:px-6 sm:py-3.5"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
                    <span>{copy.hero.emergencyCta}</span>
                  </a>
                </div>

                <ul className="mt-10 grid grid-cols-1 gap-4 border-t border-[#E7E1D8] pt-7 text-xs text-[#57534E] sm:grid-cols-3 sm:gap-6">
                  {copy.hero.trust.map((item, index) => (
                    <li key={item.title} className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#EBE3D5] text-[#78350F]">
                        {trustIcons[index]}
                      </span>
                      <span>
                        <strong className="block text-[#1C1917]">{item.title}</strong>
                        {item.body}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Quick paths into the three main tools */}
          <section
            aria-labelledby="quick-start-heading"
            className="border-y border-[#E7E1D8] bg-[#F4EFE6] px-4 py-12 sm:px-6 sm:py-16"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 max-w-2xl">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#92400E]">
                  {copy.quick.eyebrow}
                </p>
                <h2
                  id="quick-start-heading"
                  className="text-2xl font-black tracking-tight text-[#1C1917] sm:text-3xl"
                >
                  {copy.quick.heading}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                  {copy.quick.intro}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {copy.quick.cards.map((card, index) => (
                  <a
                    key={card.href}
                    href={card.href}
                    className="group flex flex-col justify-between rounded-2xl border border-[#DFD4C0] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#B45309] hover:shadow-md motion-reduce:transform-none"
                  >
                    <div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#92400E]">
                        {quickIcons[index]}
                      </span>
                      <h3 className="mt-4 text-lg font-extrabold text-[#1C1917]">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
                        {card.description}
                      </p>
                    </div>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#92400E] group-hover:text-[#1C1917]">
                      {card.cta}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* 4 Core Pillars */}
          <section
            id="how-it-works"
            aria-labelledby="how-it-works-heading"
            className="scroll-mt-24 border-b border-[#E7E1D8] bg-[#FAF7F2] px-4 py-16 sm:px-6"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#92400E]">
                  {copy.pillars.eyebrow}
                </h2>
                <p
                  id="how-it-works-heading"
                  className="text-3xl font-extrabold tracking-tight text-[#1C1917]"
                >
                  {copy.pillars.heading}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {copy.pillars.items.map((item, index) => (
                  <div
                    key={item.title}
                    className="flex flex-col justify-between rounded-2xl border border-[#DFD4C0] bg-white p-6 shadow-sm"
                  >
                    <div>
                      <span className="mb-2 block text-3xl font-black text-[#B45309]/30">
                        0{index + 1}
                      </span>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7E1D8] bg-[#FAF7F2]">
                        {pillarIcons[index]}
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-[#1C1917]">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-[#57534E]">{item.body}</p>
                    </div>
                    <div className="mt-4 border-t border-[#F4EFE6] pt-4 text-xs font-semibold text-[#78350F]">
                      {item.footer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Phase 3 Emergency Help Hub */}
          <HelpHub />

          {/* Live Message Scanner (Phase 1) */}
          <section
            id="scanner"
            aria-labelledby="message-scanner-heading"
            className="scroll-mt-24 bg-[#FAF7F2] px-4 py-20 sm:px-6"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DFD4C0] bg-[#EBE3D5] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#92400E]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.scanners.messageEyebrow}
                </div>
                <h2
                  id="message-scanner-heading"
                  className="mb-3 text-3xl font-black tracking-tight text-[#1C1917] sm:text-4xl"
                >
                  {copy.scanners.messageTitle}
                </h2>
                <p className="text-sm leading-relaxed text-[#57534E] sm:text-base">
                  {copy.scanners.messageIntro}
                </p>
              </div>

              <MessageScanner />
            </div>
          </section>

          {/* Live URL & QR Scanner (Phase 2) */}
          <section
            id="url-qr-scanner"
            aria-labelledby="url-qr-heading"
            className="scroll-mt-24 border-y border-[#E7E1D8] bg-[#F4EFE6] px-4 py-20 sm:px-6"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DFD4C0] bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#92400E]">
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.scanners.urlEyebrow}
                </div>
                <h2
                  id="url-qr-heading"
                  className="mb-3 text-3xl font-black tracking-tight text-[#1C1917] sm:text-4xl"
                >
                  {copy.scanners.urlTitle}
                </h2>
                <p className="text-sm leading-relaxed text-[#57534E] sm:text-base">
                  {copy.scanners.urlIntro}
                </p>
              </div>

              <Phase2Scanner />
            </div>
          </section>

          {/* Illustrative Threat Modality Examples */}
          <section
            id="sample-intelligence"
            aria-labelledby="sample-heading"
            className="border-y border-[#E7E1D8] bg-[#F4EFE6] px-4 py-16 sm:px-6"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#DFD4C0] bg-[#EBE3D5] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#78350F]">
                    {copy.samples.eyebrow}
                  </div>
                  <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[#92400E]">
                    {copy.samples.categoryLabel}
                  </h2>
                  <p
                    id="sample-heading"
                    className="text-2xl font-black tracking-tight text-[#1C1917]"
                  >
                    {copy.samples.heading}
                  </p>
                </div>

                <div
                  className="flex flex-wrap rounded-xl border border-[#DFD4C0] bg-white p-1"
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
                        className={`flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                          selected
                            ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                            : "text-[#57534E] hover:text-[#1C1917]"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{copy.samples.tabs[tab]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                id="sample-example-panel"
                className="overflow-hidden rounded-2xl border-2 border-[#E7E1D8] bg-white shadow-card"
              >
                <div className="border-b border-[#E7E1D8] bg-[#FBF9F5] p-5 sm:p-6">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                      {copy.samples.sampleInput} ({activeSample.title})
                    </span>
                    <span className="rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-2.5 py-0.5 text-[11px] font-semibold text-[#78350F]">
                      {copy.samples.preMasked}
                    </span>
                  </div>
                  <p className="break-all rounded-xl border border-[#E7E1D8] bg-white p-3.5 font-mono text-sm text-[#1C1917]">
                    {activeSample.input}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 border-b border-[#E7E1D8] bg-white p-5 sm:grid-cols-3 sm:p-6">
                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                      {copy.samples.riskLevel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-sm font-extrabold uppercase tracking-wide ${activeSample.riskBadgeClass}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
                      {activeSample.riskLevel}
                    </span>
                  </div>

                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                      {copy.samples.category}
                    </span>
                    <span className="text-sm font-bold text-[#1C1917]">
                      {activeSample.category}
                    </span>
                  </div>

                  <div>
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#78716C]">
                      {copy.samples.confidence}
                    </span>
                    <span className="text-sm font-medium text-[#57534E]">
                      {activeSample.confidence}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 bg-white p-5 md:grid-cols-2 sm:p-6">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                      <AlertTriangle className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                      {copy.samples.whyFlagged}
                    </h3>
                    <ul className="space-y-2.5 text-sm text-[#44403C]">
                      {activeSample.reasons.map((reason) => (
                        <li key={reason} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B45309]" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-5">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                      <ShieldCheck className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                      {copy.samples.safeSteps}
                    </h3>
                    <ul className="space-y-2.5 text-sm text-[#44403C]">
                      {activeSample.nextSteps.map((step) => (
                        <li key={step} className="flex items-start gap-2.5">
                          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#15803D]" />
                          <span className="font-medium">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E7E1D8] bg-[#F4EFE6] px-5 py-3 text-xs text-[#78716C] sm:px-6">
                  <span>{copy.samples.footerLeft}</span>
                  <span className="font-semibold text-[#78350F]">
                    {copy.samples.footerRight}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy Guarantee Section */}
          <section
            id="privacy"
            aria-labelledby="privacy-heading"
            className="scroll-mt-24 bg-[#1C1917] px-4 py-16 text-[#FAF7F2] sm:px-6"
          >
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#44403C] bg-[#292524] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FCD34D]">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    {copy.privacy.eyebrow}
                  </div>
                  <h2
                    id="privacy-heading"
                    className="mb-4 text-3xl font-black tracking-tight text-[#FAF7F2] sm:text-4xl"
                  >
                    {copy.privacy.heading}
                  </h2>
                  <p className="mb-6 text-sm leading-relaxed text-[#D6D3D1] sm:text-base">
                    {copy.privacy.intro}
                  </p>

                  <div className="space-y-4 text-xs sm:text-sm">
                    {copy.privacy.bullets.map((bullet) => (
                      <div key={bullet.title} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D97706]/20 font-bold text-[#FCD34D]">
                          ✓
                        </div>
                        <span>
                          <strong>{bullet.title}</strong> {bullet.body}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#44403C] bg-[#292524] p-5 font-mono text-xs text-[#D6D3D1] sm:p-6">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#44403C] pb-3 text-xs font-semibold text-[#FAF7F2]">
                    <span>{copy.privacy.previewTitle}</span>
                    <span className="text-[#FCD34D]">{copy.privacy.previewStatus}</span>
                  </div>
                  <p className="mb-2 text-[#D6D3D1]">{copy.privacy.previewRaw}</p>
                  <div className="mb-4 break-words rounded-lg border border-[#44403C] bg-[#1C1917] p-3 text-red-300">
                    {copy.privacy.previewRawText}
                  </div>
                  <p className="mb-2 text-[#D6D3D1]">{copy.privacy.previewRedacted}</p>
                  <div className="break-words rounded-lg border border-[#44403C] bg-[#1C1917] p-3 text-green-300">
                    {copy.privacy.previewRedactedText}
                  </div>
                  <div className="mt-3 text-[11px] text-[#A8A29E]">
                    {copy.privacy.previewNote}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Official Emergency Resources */}
          <section
            id="resources"
            aria-labelledby="resources-heading"
            className="scroll-mt-24 px-4 py-16 sm:px-6"
          >
            <div className="mx-auto max-w-6xl">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-[#92400E]">
                  {copy.resources.eyebrow}
                </h2>
                <p
                  id="resources-heading"
                  className="text-3xl font-black tracking-tight text-[#1C1917]"
                >
                  {copy.resources.heading}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {copy.resources.cards.map((card, index) => {
                  const hrefs = [
                    "tel:1930",
                    "https://cybercrime.gov.in",
                    "https://sancharsaathi.gov.in",
                    "https://cybercrime.gov.in/webform/cyber_suspect.aspx",
                  ];
                  const external = index > 0;
                  return (
                    <div
                      key={card.title}
                      className="rounded-2xl border border-[#DFD4C0] bg-white p-6 shadow-sm transition-all hover:border-[#B45309]"
                    >
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#92400E]">
                        {card.meta}
                      </span>
                      <h3 className="mb-2 text-xl font-black text-[#1C1917]">{card.title}</h3>
                      <p className="mb-4 text-xs leading-relaxed text-[#57534E]">
                        {card.body}
                      </p>
                      <a
                        href={hrefs[index]}
                        {...(external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#1C1917] hover:text-[#92400E]"
                      >
                        {card.link}
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#E7E1D8] bg-[#FAF7F2] px-4 py-12 text-xs text-[#57534E] sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B45309] text-white">
                <Shield className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1C1917]">SATARK AI</p>
                <p className="text-[11px] text-[#78716C]">{copy.footer.tagline}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <a
                href="https://github.com/a-thapa17/satark-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#1C1917]"
              >
                {copy.footer.github}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <span className="text-[#D6D3D1]" aria-hidden="true">
                •
              </span>
              <span className="text-[#78716C]">{copy.footer.license}</span>
              <span className="text-[#D6D3D1]" aria-hidden="true">
                •
              </span>
              <span className="font-semibold text-[#92400E]">{copy.footer.phase}</span>
            </div>
          </div>
        </footer>

        {/* Always-visible emergency actions on phones and small tablets. */}
        <nav
          aria-label={copy.emergencyBar.label}
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 gap-1 border-t border-[#44403C] bg-[#1C1917]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden"
        >
          <a
            href="tel:112"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-red-700 px-2 py-2 text-center text-[11px] font-bold text-white hover:bg-red-800"
          >
            <PhoneCall className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {copy.emergencyBar.emergency}
          </a>
          <a
            href="tel:1930"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#D97706] bg-[#292524] px-2 py-2 text-center text-[11px] font-bold text-[#FCD34D] hover:bg-[#44403C]"
          >
            <PhoneCall className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {copy.emergencyBar.helpline}
          </a>
          <a
            href="#emergency-help"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#57534E] bg-transparent px-2 py-2 text-center text-[11px] font-bold text-[#FAF7F2] hover:bg-[#292524]"
          >
            <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            {copy.emergencyBar.help}
          </a>
        </nav>
      </div>
    </div>
  );
}

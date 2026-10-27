"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Globe,
  Lock,
  MessageSquareWarning,
  PhoneCall,
  QrCode,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileText,
  EyeOff,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  LANDING_COPY,
  SAMPLE_INPUTS,
  type LandingTab,
} from "@/lib/i18n/landing";

export default function HeroSection() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  const trustIcons = [
    <EyeOff key="eye-off" className="h-4 w-4" aria-hidden="true" />,
    <ShieldCheck key="shield-check" className="h-4 w-4" aria-hidden="true" />,
    <FileText key="file-text" className="h-4 w-4" aria-hidden="true" />,
  ];

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#DFD4C0] bg-[#EBE3D5]/80 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#78350F] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
            {copy.hero.eyebrow}
          </div>

          <h1
            id="hero-heading"
            className="mb-6 text-4xl font-black leading-[1.08] tracking-tight text-[#1C1917] sm:text-6xl lg:text-7xl"
          >
            {copy.hero.titleStart}{" "}
            <span className="text-[#92400E] underline decoration-[#B45309]/30 underline-offset-8">
              {copy.hero.titleHighlight}
            </span>
          </h1>

          <p className="mb-5 text-lg leading-relaxed text-[#57534E] sm:text-xl">
            {copy.hero.intro}
          </p>
          <p className="mb-8 max-w-2xl text-xs leading-relaxed text-[#78716C] sm:text-sm">
            {copy.hero.disclaimer}
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/message-scanner"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#1C1917] px-6 py-3.5 text-sm font-bold text-[#FAF7F2] shadow-md transition-all hover:bg-[#292524] hover:shadow-lg"
            >
              <span>{copy.hero.primaryCta}</span>
              <ChevronRight className="h-4 w-4 text-[#FCD34D]" aria-hidden="true" />
            </Link>

            <Link
              href="/qr-scanner"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#DFD4C0] bg-white px-6 py-3.5 text-sm font-bold text-[#1C1917] shadow-sm transition-all hover:border-[#B45309] hover:shadow-md"
            >
              <QrCode className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
              <span>Verify Link or QR</span>
            </Link>

            <Link
              href="/help-hub"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-6 py-3.5 text-sm font-bold text-red-950 shadow-sm transition-all hover:border-red-400 hover:shadow-md"
            >
              <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span>{copy.hero.emergencyCta}</span>
            </Link>
          </div>

          <ul className="mt-12 grid grid-cols-1 gap-4 border-t border-[#E7E1D8] pt-8 text-xs text-[#57534E] sm:grid-cols-3 sm:gap-6">
            {copy.hero.trust.map((item, index) => (
              <li key={item.title} className="flex items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#EBE3D5] text-[#78350F] shadow-xs">
                  {trustIcons[index]}
                </span>
                <span>
                  <strong className="block text-sm font-bold text-[#1C1917]">{item.title}</strong>
                  <span className="text-[#78716C]">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

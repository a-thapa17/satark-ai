"use client";

import React from "react";
import SiteHeader from "@/components/SiteHeader";
import Phase2Scanner from "@/components/Phase2Scanner";
import SiteFooter from "@/components/SiteFooter";
import MobileEmergencyBar from "@/components/MobileEmergencyBar";
import { QrCode, Globe, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";

export default function QrScannerPage() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20 text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#92400E] md:pb-0">
      <SiteHeader />

      <main className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Breadcrumb / Return */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#1C1917]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Back to Overview</span>
            </Link>
          </div>

          {/* Page Heading */}
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#DFD4C0] bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#92400E] shadow-xs">
              <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.scanners.urlEyebrow}
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-[#1C1917] sm:text-5xl">
              {copy.scanners.urlTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
              {copy.scanners.urlIntro}
            </p>
          </div>

          {/* Core Interactive Scanner */}
          <div className="rounded-2xl border-2 border-[#DFD4C0] bg-white p-6 shadow-xl sm:p-8">
            <Phase2Scanner />
          </div>

          {/* Safety Notice Callout */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-[#DFD4C0] bg-white p-4 shadow-xs">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#EBE3D5] text-[#78350F]">
                <Globe className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-xs">
                <strong className="block font-bold text-[#1C1917]">Heuristic Domain & RDAP Audit</strong>
                <span className="text-[#57534E]">Scrutinizes brand typosquatting, raw IP addresses, free subdomains, and suspicious TLDs.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[#DFD4C0] bg-white p-4 shadow-xs">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#EBE3D5] text-[#78350F]">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-xs">
                <strong className="block font-bold text-[#1C1917]">UPI Reverse Trap Guard</strong>
                <span className="text-[#57534E]">Validates static & dynamic UPI merchant QR codes against reverse authorization traps.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileEmergencyBar />
    </div>
  );
}

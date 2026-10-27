"use client";

import React from "react";
import SiteHeader from "@/components/SiteHeader";
import HelpHub from "@/components/help/HelpHub";
import SiteFooter from "@/components/SiteFooter";
import MobileEmergencyBar from "@/components/MobileEmergencyBar";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";

export default function HelpHubPage() {
  const { language } = useLanguage();
  const copy = HELP_COPY[language];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20 text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#92400E] md:pb-0">
      <SiteHeader />

      <main className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
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

          {/* Section Header */}
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-red-900 shadow-xs">
              <LifeBuoy className="h-3.5 w-3.5 text-red-600" aria-hidden="true" />
              {copy.hub.phase}
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-[#1C1917] sm:text-5xl">
              {copy.hub.heading}
            </h1>
            <p className="text-base leading-relaxed text-[#57534E] sm:text-lg">
              {copy.hub.intro}
            </p>
          </div>

          {/* Core Emergency Help Hub Interactive System */}
          <div className="rounded-2xl border-2 border-[#DFD4C0] bg-white p-6 shadow-xl sm:p-8">
            <HelpHub />
          </div>
        </div>
      </main>

      <SiteFooter />
      <MobileEmergencyBar />
    </div>
  );
}

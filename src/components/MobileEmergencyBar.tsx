"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle, PhoneCall } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";

export default function MobileEmergencyBar() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  return (
    <nav
      aria-label={copy.emergencyBar.label}
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 gap-1.5 border-t border-[#44403C] bg-[#1C1917]/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden shadow-2xl"
    >
      <a
        href="tel:112"
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-red-700 px-2 py-2 text-center text-[11px] font-bold text-white hover:bg-red-800 shadow-sm"
      >
        <PhoneCall className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {copy.emergencyBar.emergency}
      </a>
      <a
        href="tel:1930"
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#D97706] bg-[#292524] px-2 py-2 text-center text-[11px] font-bold text-[#FCD34D] hover:bg-[#44403C] shadow-sm"
      >
        <PhoneCall className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {copy.emergencyBar.helpline}
      </a>
      <Link
        href="/help-hub"
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#57534E] bg-transparent px-2 py-2 text-center text-[11px] font-bold text-[#FAF7F2] hover:bg-[#292524]"
      >
        <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {copy.emergencyBar.help}
      </Link>
    </nav>
  );
}

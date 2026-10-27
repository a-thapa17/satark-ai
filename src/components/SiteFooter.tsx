"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Shield } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";

export default function SiteFooter() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  return (
    <footer className="border-t border-[#E7E1D8] bg-[#FAF7F2] px-4 py-12 text-xs text-[#57534E] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#B45309] text-white shadow-sm">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-black tracking-tight text-[#1C1917]">SATARK AI</p>
            <p className="text-[11px] text-[#78716C]">{copy.footer.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium sm:gap-6">
          <Link href="/message-scanner" className="hover:text-[#1C1917]">
            Message Scanner
          </Link>
          <Link href="/qr-scanner" className="hover:text-[#1C1917]">
            URL & QR Safety
          </Link>
          <Link href="/help-hub" className="hover:text-[#1C1917]">
            Help Hub
          </Link>
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
          <span className="font-bold text-[#92400E]">{copy.footer.phase}</span>
        </div>
      </div>
    </footer>
  );
}

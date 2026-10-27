"use client";

import React from "react";
import { ArrowRight, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";

export default function TrustAndResources() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  return (
    <>
      {/* Privacy Guarantee Section */}
      <section
        id="privacy"
        aria-labelledby="privacy-heading"
        className="scroll-mt-24 bg-[#1C1917] px-4 py-20 text-[#FAF7F2] sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#44403C] bg-[#292524] px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[#FCD34D]">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.privacy.eyebrow}
              </div>
              <h2
                id="privacy-heading"
                className="mb-5 text-3xl font-black tracking-tight text-[#FAF7F2] sm:text-5xl"
              >
                {copy.privacy.heading}
              </h2>
              <p className="mb-8 text-base leading-relaxed text-[#D6D3D1] sm:text-lg">
                {copy.privacy.intro}
              </p>

              <div className="space-y-4 text-sm sm:text-base">
                {copy.privacy.bullets.map((bullet) => (
                  <div key={bullet.title} className="flex items-start gap-3.5">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D97706]/25 font-bold text-[#FCD34D]">
                      ✓
                    </div>
                    <span>
                      <strong className="text-white">{bullet.title}</strong>{" "}
                      <span className="text-[#A8A29E]">{bullet.body}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-2 border-[#44403C] bg-[#292524] p-6 font-mono text-xs text-[#D6D3D1] sm:p-8 shadow-2xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#44403C] pb-4 text-xs font-bold text-[#FAF7F2]">
                <span>{copy.privacy.previewTitle}</span>
                <span className="rounded bg-[#1C1917] px-2 py-0.5 text-[#FCD34D]">
                  {copy.privacy.previewStatus}
                </span>
              </div>
              <p className="mb-2 font-semibold text-[#D6D3D1]">{copy.privacy.previewRaw}</p>
              <div className="mb-5 break-words rounded-xl border border-red-900/50 bg-[#1C1917] p-4 text-red-300">
                {copy.privacy.previewRawText}
              </div>
              <p className="mb-2 font-semibold text-[#D6D3D1]">{copy.privacy.previewRedacted}</p>
              <div className="break-words rounded-xl border border-green-900/50 bg-[#1C1917] p-4 text-green-300">
                {copy.privacy.previewRedactedText}
              </div>
              <div className="mt-4 text-[11px] leading-relaxed text-[#78716C]">
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
        className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-[#92400E]">
              {copy.resources.eyebrow}
            </h2>
            <p
              id="resources-heading"
              className="text-3xl font-black tracking-tight text-[#1C1917] sm:text-4xl"
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
                  className="flex flex-col justify-between rounded-2xl border-2 border-[#DFD4C0] bg-white p-6 shadow-sm transition-all hover:border-[#B45309] hover:shadow-lg"
                >
                  <div>
                    <span className="mb-1 block text-xs font-black uppercase tracking-wider text-[#92400E]">
                      {card.meta}
                    </span>
                    <h3 className="mb-2 text-xl font-black text-[#1C1917]">{card.title}</h3>
                    <p className="mb-6 text-xs leading-relaxed text-[#57534E]">
                      {card.body}
                    </p>
                  </div>
                  <a
                    href={hrefs[index]}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1C1917] hover:text-[#92400E]"
                  >
                    <span>{card.link}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

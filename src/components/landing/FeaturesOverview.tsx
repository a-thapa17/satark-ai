"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  HelpCircle,
  MessageSquareWarning,
  QrCode,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";

export default function FeaturesOverview() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  const quickIcons = [
    <MessageSquareWarning key="message" className="h-6 w-6" aria-hidden="true" />,
    <QrCode key="qr" className="h-6 w-6" aria-hidden="true" />,
    <HelpCircle key="help" className="h-6 w-6" aria-hidden="true" />,
  ];

  const routeHrefs = [
    "/message-scanner",
    "/qr-scanner",
    "/help-hub",
  ];

  const pillarIcons = [
    <MessageSquareWarning key="message" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
    <ShieldAlert key="shield-alert" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
    <AlertTriangle key="alert" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
    <ShieldCheck key="shield-check" className="h-5 w-5 text-[#B45309]" aria-hidden="true" />,
  ];

  return (
    <>
      {/* Quick Access Matrix */}
      <section
        aria-labelledby="quick-start-heading"
        className="border-y border-[#E7E1D8] bg-[#F4EFE6] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-[#92400E]">
              {copy.quick.eyebrow}
            </p>
            <h2
              id="quick-start-heading"
              className="text-3xl font-black tracking-tight text-[#1C1917] sm:text-4xl"
            >
              {copy.quick.heading}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-[#57534E]">
              {copy.quick.intro}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {copy.quick.cards.map((card, index) => (
              <Link
                key={card.title}
                href={routeHrefs[index]}
                className="group flex flex-col justify-between rounded-2xl border-2 border-[#DFD4C0] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#B45309] hover:shadow-xl"
              >
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FEF3C7] text-[#92400E] shadow-xs transition-colors group-hover:bg-[#B45309] group-hover:text-white">
                    {quickIcons[index]}
                  </span>
                  <h3 className="mt-5 text-xl font-black text-[#1C1917]">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#57534E]">
                    {card.description}
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#92400E] group-hover:text-[#1C1917]">
                  {card.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section
        id="how-it-works"
        aria-labelledby="how-it-works-heading"
        className="border-b border-[#E7E1D8] bg-[#FAF7F2] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="mb-2 text-xs font-black uppercase tracking-widest text-[#92400E]">
              {copy.pillars.eyebrow}
            </h2>
            <p
              id="how-it-works-heading"
              className="text-3xl font-black tracking-tight text-[#1C1917] sm:text-4xl"
            >
              {copy.pillars.heading}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {copy.pillars.items.map((item, index) => (
              <div
                key={item.title}
                className="flex flex-col justify-between rounded-2xl border border-[#DFD4C0] bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div>
                  <span className="mb-2 block text-4xl font-black text-[#B45309]/20">
                    0{index + 1}
                  </span>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E7E1D8] bg-[#FAF7F2]">
                    {pillarIcons[index]}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[#1C1917]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[#57534E]">{item.body}</p>
                </div>
                <div className="mt-6 border-t border-[#F4EFE6] pt-4 text-xs font-bold text-[#78350F]">
                  {item.footer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

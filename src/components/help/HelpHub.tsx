"use client";

import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  FileDown,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";
import EmergencyAssistant from "@/components/help/EmergencyAssistant";
import PlaybookLibrary from "@/components/help/PlaybookLibrary";
import PhoneCallChecker from "@/components/help/PhoneCallChecker";
import EvidencePdfBuilder from "@/components/help/EvidencePdfBuilder";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";
import { getTabTargetIndex } from "@/lib/a11y/tab-navigation";

type HelpTab = "emergency" | "playbooks" | "phone" | "evidence";

const TABS: Array<{
  id: HelpTab;
  icon: React.ReactNode;
}> = [
  {
    id: "emergency",
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "playbooks",
    icon: <BookOpen className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "phone",
    icon: <PhoneCall className="h-4 w-4" aria-hidden="true" />,
  },
  {
    id: "evidence",
    icon: <FileDown className="h-4 w-4" aria-hidden="true" />,
  },
];

const TAB_ORDER = TABS.map((tab) => tab.id);

export default function HelpHub() {
  const { language } = useLanguage();
  const copy = HELP_COPY[language];
  const [activeTab, setActiveTab] = useState<HelpTab>("emergency");
  const tabRefs = useRef<Record<HelpTab, HTMLButtonElement | null>>({
    emergency: null,
    playbooks: null,
    phone: null,
    evidence: null,
  });

  function handleTabKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    current: HelpTab
  ) {
    const index = TAB_ORDER.indexOf(current);
    const nextIndex = getTabTargetIndex(index, event.key, TAB_ORDER.length);
    if (nextIndex === null) return;
    event.preventDefault();
    const next = TAB_ORDER[nextIndex]!;
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section
      id="emergency-help"
      aria-labelledby="emergency-help-heading"
      className="scroll-mt-24 border-y border-[#E7E1D8] bg-[#FAF7F2] px-4 py-16 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#78350F]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D97706]" aria-hidden="true" />
              {copy.hub.phase}
            </div>
            <h2
              id="emergency-help-heading"
              className="text-3xl font-black tracking-tight text-[#1C1917] sm:text-4xl"
            >
              {copy.hub.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#57534E]">
              {copy.hub.intro}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-bold text-red-950">
                  {copy.hub.emergencyTitle}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-red-800">
                  {copy.hub.emergencyBody}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href="tel:112"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-800"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.common.call112}
              </a>
              <a
                href="tel:1930"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1C1917] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#292524]"
              >
                <PhoneCall className="h-3.5 w-3.5 text-[#FCD34D]" aria-hidden="true" />
                {copy.common.call1930}
              </a>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-900 transition-colors hover:border-red-500"
              >
                {copy.common.officialPortal}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div
          role="tablist"
          aria-label={copy.hub.tabListLabel}
          className="grid gap-2 rounded-2xl border border-[#E7E1D8] bg-white p-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            const tabCopy = copy.hub.tabs[tab.id];
            return (
              <button
                key={tab.id}
                id={`help-tab-${tab.id}`}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                type="button"
                role="tab"
                aria-selected={active}
                aria-controls={`help-panel-${tab.id}`}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  active
                    ? "border-[#D97706] bg-[#1C1917] text-white"
                    : "border-transparent text-[#57534E] hover:border-[#E7E1D8] hover:bg-[#FAF7F2]"
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      active ? "bg-[#D97706] text-white" : "bg-[#FEF3C7] text-[#78350F]"
                    }`}
                  >
                    {tab.icon}
                  </span>
                  {tabCopy.label}
                </span>
                <span
                  className={`mt-1.5 block text-[10px] leading-relaxed ${
                    active ? "text-[#D6D3D1]" : "text-[#78716C]"
                  }`}
                >
                  {tabCopy.description}
                </span>
              </button>
            );
          })}
        </div>

        {TABS.map((tab) => (
          <div
            key={tab.id}
            id={`help-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`help-tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            hidden={activeTab !== tab.id}
            className="mt-5 rounded-2xl border border-[#E7E1D8] bg-[#F4EFE6] p-4 focus:outline-none focus:ring-2 focus:ring-[#D97706] sm:p-5"
          >
            {tab.id === "emergency" ? <EmergencyAssistant /> : null}
            {tab.id === "playbooks" ? <PlaybookLibrary /> : null}
            {tab.id === "phone" ? <PhoneCallChecker /> : null}
            {tab.id === "evidence" ? <EvidencePdfBuilder /> : null}
          </div>
        ))}

        <p className="mt-4 text-center text-[10px] leading-relaxed text-[#78716C]">
          {copy.hub.footer}
        </p>
      </div>
    </section>
  );
}

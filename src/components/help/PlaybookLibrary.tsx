"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Fingerprint,
  Link2,
  LockKeyhole,
  PhoneCall,
  ShieldAlert,
  ShoppingBag,
  UserRoundX,
} from "lucide-react";
import type { PlaybookId } from "@/lib/help/types";
import { OfficialResourceLinks } from "@/components/help/HelpPrimitives";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";
import { getLocalizedPlaybooks } from "@/lib/i18n/help-content";

const PLAYBOOK_ICONS: Record<PlaybookId, React.ReactNode> = {
  upi_payment_fraud: <CreditCard className="h-4 w-4" aria-hidden="true" />,
  phishing_links: <Link2 className="h-4 w-4" aria-hidden="true" />,
  account_compromise: <UserRoundX className="h-4 w-4" aria-hidden="true" />,
  identity_theft: <Fingerprint className="h-4 w-4" aria-hidden="true" />,
  shopping_fraud: <ShoppingBag className="h-4 w-4" aria-hidden="true" />,
  threats_extortion: <ShieldAlert className="h-4 w-4" aria-hidden="true" />,
};

function Checklist({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "warning" | "success";
}) {
  const icon =
    tone === "warning" ? (
      <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
    ) : tone === "success" ? (
      <CheckCircle2 className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
    ) : (
      <LockKeyhole className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
    );

  return (
    <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-4">
      <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
        {icon}
        {title}
      </h4>
      <ul className="mt-2 space-y-2 text-xs leading-relaxed text-[#44403C]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D97706]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlaybookLibrary() {
  const { language } = useLanguage();
  const copy = HELP_COPY[language];
  const playbooks = getLocalizedPlaybooks(language);
  const [selectedId, setSelectedId] = useState<PlaybookId>("upi_payment_fraud");
  const selected =
    playbooks.find((playbook) => playbook.id === selectedId) ?? playbooks[0]!;
  const noticeParts = copy.playbooks.notice.split("112");

  return (
    <div>
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">
        <AlertTriangle
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
          aria-hidden="true"
        />
        <p>
          {noticeParts[0]}
          <a href="tel:112" className="font-bold underline">
            112
          </a>
          {noticeParts[1] ?? "."}
        </p>
      </div>

      <div
        role="group"
        aria-label={copy.playbooks.groupLabel}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {playbooks.map((playbook) => {
          const active = playbook.id === selected.id;
          return (
            <button
              key={playbook.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedId(playbook.id)}
              className={`flex min-h-[74px] items-start gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition-colors ${
                active
                  ? "border-[#D97706] bg-[#1C1917] text-white"
                  : "border-[#E7E1D8] bg-white text-[#44403C] hover:border-[#D97706]"
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
                  active
                    ? "bg-[#D97706] text-white"
                    : "bg-[#FAF7F2] text-[#78350F]"
                }`}
              >
                {PLAYBOOK_ICONS[playbook.id]}
              </span>
              <span>{playbook.shortTitle}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-[#E7E1D8] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#78350F]">
              {copy.playbooks.urgency[selected.urgency]}
            </span>
            <h3 className="mt-2 text-xl font-black text-[#1C1917]">
              {selected.title}
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#57534E]">
              {selected.overview}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
            {PLAYBOOK_ICONS[selected.id]}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Checklist title={copy.playbooks.immediateActions} items={selected.immediateActions} />
          <Checklist
            title={copy.playbooks.evidenceToPreserve}
            items={selected.evidenceToPreserve}
            tone="success"
          />
          <Checklist
            title={copy.playbooks.accountsToSecure}
            items={selected.accountsToSecure}
          />
          <Checklist
            title={copy.playbooks.mistakesToAvoid}
            items={selected.mistakesToAvoid}
            tone="warning"
          />
        </div>

        <div className="mt-4 rounded-xl border border-[#E7E1D8] p-4">
          <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
            <PhoneCall className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
            {copy.playbooks.reportingOptions}
          </h4>
          <div className="mt-2 space-y-3">
            {selected.reportingOptions.map((option) => (
              <div key={option.title}>
                <p className="text-xs font-bold text-[#1C1917]">
                  {option.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#57534E]">
                  {option.description}
                </p>
                <OfficialResourceLinks
                  resourceIds={option.resourceIds}
                  compact
                />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-[#78716C]">
          <ArrowRight
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#D97706]"
            aria-hidden="true"
          />
          {copy.playbooks.disclaimer}
        </p>
      </div>
    </div>
  );
}

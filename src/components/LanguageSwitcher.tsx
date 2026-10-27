"use client";

import React, { useState } from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANGUAGE_LABELS, type Language } from "@/lib/i18n/language";

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const [announcement, setAnnouncement] = useState("");

  function choose(next: Language) {
    if (next === language) return;
    setLanguage(next);
    setAnnouncement(
      next === "hi"
        ? "भाषा हिन्दी में बदल गई है।"
        : "Language changed to English."
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="sr-only" id="language-switcher-label">
        {language === "hi" ? "भाषा चुनें" : "Choose language"}
      </span>
      <Languages
        className="h-4 w-4 text-[#78716C]"
        aria-hidden="true"
        focusable="false"
      />
      <div
        role="group"
        aria-labelledby="language-switcher-label"
        className="flex items-center rounded-lg border border-[#DFD4C0] bg-white p-0.5"
      >
        {(["en", "hi"] as const).map((option) => {
          const active = language === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              aria-label={
                option === "hi"
                  ? "हिन्दी में देखें"
                  : "View the site in English"
              }
              title={LANGUAGE_LABELS[option].name}
              onClick={() => choose(option)}
              className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors ${
                compact ? "min-w-8" : "min-w-9"
              } ${
                active
                  ? "bg-[#1C1917] text-white shadow-sm"
                  : "text-[#57534E] hover:bg-[#FAF7F2] hover:text-[#1C1917]"
              }`}
            >
              {LANGUAGE_LABELS[option].short}
            </button>
          );
        })}
      </div>
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

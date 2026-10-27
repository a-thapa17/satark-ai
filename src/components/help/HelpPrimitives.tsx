"use client";

import React from "react";
import { ExternalLink, PhoneCall } from "lucide-react";
import type { OfficialResourceId } from "@/lib/help/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";
import { getLocalizedOfficialResources } from "@/lib/i18n/help-content";

export function OfficialResourceLinks({
  resourceIds,
  compact = false,
}: {
  resourceIds: readonly OfficialResourceId[];
  compact?: boolean;
}) {
  const { language } = useLanguage();
  const copy = HELP_COPY[language];
  const resources = getLocalizedOfficialResources(resourceIds, language);
  if (resources.length === 0) return null;

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "mt-3 space-y-2"}>
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-[#E7E1D8] bg-white/70 px-3 py-2 text-xs"
        >
          <span className="font-semibold text-[#1C1917]">{resource.name}</span>
          {resource.phone ? (
            <a
              href={`tel:${resource.phone}`}
              className="inline-flex items-center gap-1 font-bold text-[#B45309] hover:underline"
            >
              <PhoneCall className="h-3 w-3" aria-hidden="true" />
              {copy.common.call} {resource.phone}
            </a>
          ) : null}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-[#1C1917] hover:text-[#B45309] hover:underline"
          >
            {copy.common.officialSite}
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      ))}
    </div>
  );
}

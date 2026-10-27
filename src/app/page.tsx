"use client";

import React from "react";
import CinematicIntro from "@/components/CinematicIntro";
import SiteHeader from "@/components/SiteHeader";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesOverview from "@/components/landing/FeaturesOverview";
import IntelligencePreview from "@/components/landing/IntelligencePreview";
import TrustAndResources from "@/components/landing/TrustAndResources";
import SiteFooter from "@/components/SiteFooter";
import MobileEmergencyBar from "@/components/MobileEmergencyBar";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";

export default function Home() {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-20 text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#92400E] md:pb-0">
      <CinematicIntro />

      <div id="main-homepage-content" className="transition-opacity duration-600 ease-in-out">
        <a href="#main-content" className="skip-link">
          {copy.skip}
        </a>

        <SiteHeader />

        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          <HeroSection />
          <FeaturesOverview />
          <IntelligencePreview />
          <TrustAndResources />
        </main>

        <SiteFooter />
        <MobileEmergencyBar />
      </div>
    </div>
  );
}

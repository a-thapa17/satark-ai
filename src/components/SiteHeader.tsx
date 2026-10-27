"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Menu,
  PhoneCall,
  ShieldAlert,
  X,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { SITE_COPY } from "@/lib/i18n/site";

export default function SiteHeader() {
  const { language } = useLanguage();
  const copy = SITE_COPY[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (menuOpen) firstLinkRef.current?.focus();
  }, [menuOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const navLinks = [
    { href: "#how-it-works", label: copy.nav.howItWorks },
    { href: "#scanner", label: copy.nav.messageScanner },
    { href: "#url-qr-scanner", label: copy.nav.urlQrScanner },
    { href: "#emergency-help", label: copy.nav.helpHub },
    { href: "#privacy", label: copy.nav.privacy },
    { href: "#resources", label: copy.nav.channels },
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div id="top">
      <div className="border-b border-[#292524] bg-[#1C1917] px-4 py-2 text-[11px] text-[#FAF7F2] sm:text-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 font-medium">
            <span
              className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[#D97706] motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <span>{copy.topBanner.helpline}</span>
            <a
              href="tel:1930"
              className="whitespace-nowrap text-sm font-bold tracking-wide text-[#FCD34D] underline-offset-2 hover:underline"
            >
              {copy.topBanner.dial}
            </a>
            <span className="hidden text-[#A8A29E] md:inline">
              {copy.topBanner.available}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#A8A29E] sm:gap-4 sm:text-xs">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 transition-colors hover:text-[#FAF7F2]"
            >
              {copy.topBanner.portal}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <a
              href="#emergency-help"
              className="inline-flex items-center gap-1 font-semibold text-[#FCD34D] transition-colors hover:text-white"
            >
              {copy.topBanner.emergency}
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </a>
            <span className="hidden text-[#A8A29E] md:inline" aria-hidden="true">
              |
            </span>
            <span className="hidden font-semibold text-[#FCD34D] md:inline">
              {copy.topBanner.phase}
            </span>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#E7E1D8] bg-[#FAF7F2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between gap-2 px-3 sm:h-20 sm:px-6">
          <a
            href="#top"
            className="flex min-w-0 items-center gap-2 rounded-lg sm:gap-3"
            aria-label={copy.brand.home}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#D97706] text-white shadow-sm ring-4 ring-[#D97706]/10 sm:h-11 sm:w-11">
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-[#1C1917] sm:text-2xl">
                  SATARK <span className="text-[#B45309]">AI</span>
                </span>
                <span className="hidden rounded-full bg-[#EBE3D5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#57534E] sm:inline">
                  v4.0
                </span>
              </span>
              <span className="hidden text-xs font-medium tracking-wide text-[#57534E] sm:block">
                {copy.brand.tagline}
              </span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-4 text-[13px] font-medium text-[#57534E] xl:flex 2xl:gap-6 2xl:text-sm"
            aria-label={copy.nav.label}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-md py-1 transition-colors hover:text-[#1C1917] ${
                  link.href === "#emergency-help"
                    ? "font-semibold text-[#92400E] hover:text-[#1C1917]"
                    : ""
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <a
              href="#scanner"
              className="hidden items-center gap-2 rounded-lg bg-[#B45309] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#92400E] hover:shadow sm:inline-flex"
            >
              <span>{copy.actions.scanMessage}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? copy.actions.closeMenu : copy.actions.openMenu}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#DFD4C0] bg-white text-[#1C1917] transition-colors hover:border-[#B45309] xl:hidden"
            >
              {menuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          hidden={!menuOpen}
          className="border-t border-[#E7E1D8] bg-[#FAF7F2] px-3 pb-4 pt-3 sm:px-6 xl:hidden"
        >
          <nav aria-label={copy.nav.label} className="grid gap-1">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                  link.href === "#emergency-help"
                    ? "bg-red-50 text-red-900 hover:bg-red-100"
                    : "text-[#44403C] hover:bg-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
              {copy.mobile.emergencyTitle}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-red-800">
              {copy.mobile.emergencyBody}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                onClick={closeMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.mobile.call112}
              </a>
              <a
                href="tel:1930"
                onClick={closeMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-3 py-2 text-xs font-bold text-white hover:bg-[#292524]"
              >
                <PhoneCall className="h-3.5 w-3.5 text-[#FCD34D]" aria-hidden="true" />
                {copy.mobile.call1930}
              </a>
            </div>
          </div>

          <a
            href="#emergency-help"
            onClick={closeMenu}
            className="mt-3 flex items-center justify-between rounded-xl bg-[#1C1917] px-4 py-3 text-sm font-bold text-white"
          >
            <span>
              {copy.nav.helpHub}
              <span className="mt-0.5 block text-[11px] font-normal text-[#D6D3D1]">
                {copy.mobile.helpHubDescription}
              </span>
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#FCD34D]" aria-hidden="true" />
          </a>
        </div>
      </header>
    </div>
  );
}

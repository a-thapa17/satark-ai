"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
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
    { href: "/", label: copy.nav.howItWorks },
    { href: "/message-scanner", label: copy.nav.messageScanner },
    { href: "/qr-scanner", label: copy.nav.urlQrScanner },
    { href: "/help-hub", label: copy.nav.helpHub },
  ];

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div id="top" className="w-full">
      {/* Top Incident Response Hotline Bar */}
      <div className="border-b border-[#292524] bg-[#1C1917] px-4 py-2 text-[11px] text-[#FAF7F2] sm:text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-2 font-medium">
            <span
              className="inline-block h-2 w-2 flex-shrink-0 rounded-full bg-[#D97706] motion-safe:animate-pulse"
              aria-hidden="true"
            />
            <span className="text-[#A8A29E]">{copy.topBanner.helpline}</span>
            <a
              href="tel:1930"
              className="whitespace-nowrap font-bold tracking-wide text-[#FCD34D] hover:underline"
            >
              {copy.topBanner.dial}
            </a>
            <span className="hidden text-[#78716C] md:inline">
              ({copy.topBanner.available})
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
            <Link
              href="/help-hub"
              className="inline-flex items-center gap-1 font-semibold text-[#FCD34D] transition-colors hover:text-white"
            >
              {copy.topBanner.emergency}
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            <span className="hidden text-[#44403C] md:inline" aria-hidden="true">
              |
            </span>
            <span className="hidden rounded bg-[#292524] px-1.5 py-0.5 text-[10px] font-semibold text-[#FCD34D] md:inline">
              {copy.topBanner.phase}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#E7E1D8] bg-[#FAF7F2]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            aria-label={copy.brand.home}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#D97706] to-[#92400E] text-white shadow-md ring-4 ring-[#D97706]/15 sm:h-11 sm:w-11">
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xl font-black tracking-tight text-[#1C1917] sm:text-2xl">
                  SATARK <span className="text-[#B45309]">AI</span>
                </span>
                <span className="hidden rounded-full border border-[#DFD4C0] bg-[#EBE3D5] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#57534E] sm:inline">
                  Enterprise
                </span>
              </span>
              <span className="hidden text-xs font-medium tracking-wide text-[#78716C] sm:block">
                {copy.brand.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav
            className="hidden items-center gap-1 text-sm font-semibold text-[#57534E] xl:flex 2xl:gap-2"
            aria-label={copy.nav.label}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3.5 py-2 transition-all ${
                    isActive
                      ? "bg-[#1C1917] text-white shadow-sm"
                      : "text-[#57534E] hover:bg-[#EBE3D5]/60 hover:text-[#1C1917]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher compact />
            <Link
              href="/message-scanner"
              className="hidden items-center gap-2 rounded-xl bg-[#B45309] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#92400E] hover:shadow-md sm:inline-flex"
            >
              <span>{copy.actions.scanMessage}</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
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

        {/* Mobile Navigation Panel */}
        <div
          id="mobile-navigation"
          hidden={!menuOpen}
          className="border-t border-[#E7E1D8] bg-[#FAF7F2] px-4 pb-6 pt-4 xl:hidden shadow-lg"
        >
          <nav aria-label={copy.nav.label} className="grid gap-1.5">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  href={link.href}
                  onClick={closeMenu}
                  className={`rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                    isActive
                      ? "bg-[#1C1917] text-white"
                      : "text-[#44403C] hover:bg-[#EBE3D5]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-1.5 text-xs font-bold text-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" aria-hidden="true" />
              {copy.mobile.emergencyTitle}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-red-800">
              {copy.mobile.emergencyBody}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                onClick={closeMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-700 px-3 py-2.5 text-xs font-bold text-white hover:bg-red-800 shadow-sm"
              >
                <PhoneCall className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.mobile.call112}
              </a>
              <a
                href="tel:1930"
                onClick={closeMenu}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1C1917] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#292524] shadow-sm"
              >
                <PhoneCall className="h-3.5 w-3.5 text-[#FCD34D]" aria-hidden="true" />
                {copy.mobile.call1930}
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

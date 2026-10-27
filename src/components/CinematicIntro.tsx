"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LANDING_COPY } from "@/lib/i18n/landing";
import {
  getIntroSkipReason,
  hasSeenIntro,
  INTRO_FADE_MS,
  INTRO_SESSION_KEY,
} from "@/lib/intro";

interface CinematicIntroProps {
  onComplete?: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const { language } = useLanguage();
  const copy = LANDING_COPY[language].intro;
  // Render initially so the server overlay can be displayed by the
  // pre-hydration script, then hide immediately if this session has seen it.
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(callback, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    setShouldRender(false);
    onCompleteRef.current?.();
  }, []);

  const markIntroSeen = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    } catch {
      // Storage may be unavailable; the intro still closes safely.
    }
    document.documentElement.classList.remove("satark-intro-active");
  }, []);

  const dismissIntro = useCallback(() => {
    if (completedRef.current) return;
    markIntroSeen();
    setIsFadingOut(true);
    schedule(finish, INTRO_FADE_MS);
  }, [finish, markIntroSeen, schedule]);

  useEffect(() => {
    let reducedMotion = false;
    let seen = false;
    try {
      reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    } catch {
      reducedMotion = false;
    }
    try {
      seen = hasSeenIntro(sessionStorage.getItem(INTRO_SESSION_KEY));
    } catch {
      seen = false;
    }

    const reason = getIntroSkipReason({ reducedMotion, seen });
    if (reason) {
      if (reason === "reduced_motion") {
        markIntroSeen();
      } else {
        document.documentElement.classList.remove("satark-intro-active");
      }
      completedRef.current = true;
      setShouldRender(false);
      return;
    }

    try {
      document.documentElement.classList.add("satark-intro-active");
      skipButtonRef.current?.focus();
    } catch {
      // Focus and class changes are enhancements; the overlay still works.
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Timed sequence: circuit/proof lines, logo, tagline, then a short hold.
    // A visible skip control and the 112 link remain available throughout.
    schedule(() => {
      setIsFadingOut(true);
      markIntroSeen();
    }, 3400);

    schedule(finish, 4000);

    // Fail-safe watchdog: never leave the page hidden if timers are delayed.
    schedule(() => {
      document.documentElement.classList.remove("satark-intro-active");
      finish();
    }, 4600);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      for (const timer of timersRef.current) {
        window.clearTimeout(timer);
      }
      timersRef.current = [];
    };
  }, [dismissIntro, finish, markIntroSeen, schedule]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      id="satark-intro-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={copy.dialogLabel}
      aria-describedby="satark-intro-description"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#141211] select-none transition-opacity duration-500 ease-in-out ${
        isFadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <p id="satark-intro-description" className="sr-only">
        {copy.description}
      </p>

      <div className="absolute inset-x-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
        <a
          href="tel:112"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-red-300/60 bg-red-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FCD34D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141211]"
        >
          <span aria-hidden="true">☎</span>
          {copy.emergency}
        </a>
        <button
          ref={skipButtonRef}
          onClick={dismissIntro}
          type="button"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#44403C] bg-[#1C1917]/85 px-3.5 py-2 text-xs font-semibold tracking-wider text-[#E7E5E4] shadow-sm backdrop-blur transition-colors hover:border-[#D97706]/60 hover:bg-[#292524] hover:text-[#FAF7F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FCD34D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141211]"
          aria-label={copy.skipIntro}
        >
          <span>{copy.skipIntro}</span>
          <span aria-hidden="true" className="text-xs">✕</span>
        </button>
      </div>

      {/* Ambient Radial Backglow */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.18)_0%,rgba(180,83,9,0.06)_45%,transparent_70%)] animate-ambient-pulse" />
      </div>

      {/* Separate SVG Circuit Lines Layer behind logo */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 800"
          className="w-full h-full max-w-6xl max-h-[90vh] text-[#D97706]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="circuit-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Symmetrical Outward Circuit Traces (0.0s - 0.8s) */}
          <g filter="url(#circuit-glow)" className="stroke-[#D97706]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Top-Left Branch */}
            <path
              d="M 450 330 L 380 260 L 220 260 L 170 210"
              className="circuit-trace-1"
            />
            {/* Top-Right Branch */}
            <path
              d="M 550 330 L 620 260 L 780 260 L 830 210"
              className="circuit-trace-1"
            />
            {/* Mid-Left Horizontal Track */}
            <path
              d="M 420 400 L 280 400 L 230 450 L 120 450"
              className="circuit-trace-2"
            />
            {/* Mid-Right Horizontal Track */}
            <path
              d="M 580 400 L 720 400 L 770 450 L 880 450"
              className="circuit-trace-2"
            />
            {/* Bottom-Left Branch */}
            <path
              d="M 460 480 L 390 550 L 260 550 L 200 610"
              className="circuit-trace-3"
            />
            {/* Bottom-Right Branch */}
            <path
              d="M 540 480 L 610 550 L 740 550 L 800 610"
              className="circuit-trace-3"
            />
            {/* Top Vertical Spine */}
            <path
              d="M 500 310 L 500 190 L 530 160"
              className="circuit-trace-2"
            />
            {/* Bottom Vertical Spine */}
            <path
              d="M 500 500 L 500 630 L 470 660"
              className="circuit-trace-2"
            />
          </g>

          {/* Sequential Circuit Terminal Nodes (0.8s - 1.5s) */}
          <g fill="#D97706" className="circuit-nodes">
            {/* Tier 1 Nodes */}
            <circle cx="170" cy="210" r="3.5" className="circuit-node node-delay-1" />
            <circle cx="830" cy="210" r="3.5" className="circuit-node node-delay-1" />
            <circle cx="380" cy="260" r="2.5" className="circuit-node node-delay-1" opacity="0.85" />
            <circle cx="620" cy="260" r="2.5" className="circuit-node node-delay-1" opacity="0.85" />

            {/* Tier 2 Nodes */}
            <circle cx="120" cy="450" r="3.5" className="circuit-node node-delay-2" />
            <circle cx="880" cy="450" r="3.5" className="circuit-node node-delay-2" />
            <circle cx="530" cy="160" r="3" className="circuit-node node-delay-2" />
            <circle cx="280" cy="400" r="2.5" className="circuit-node node-delay-2" opacity="0.85" />
            <circle cx="720" cy="400" r="2.5" className="circuit-node node-delay-2" opacity="0.85" />

            {/* Tier 3 Nodes */}
            <circle cx="200" cy="610" r="3.5" className="circuit-node node-delay-3" />
            <circle cx="800" cy="610" r="3.5" className="circuit-node node-delay-3" />
            <circle cx="470" cy="660" r="3" className="circuit-node node-delay-3" />
          </g>
        </svg>
      </div>

      {/* Foreground Logo & Word-by-Word Tagline Presentation */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 max-w-lg w-full">
        {/* Actual Logo: Circuit Emblem + SATARK AI Wordmark (0.8s - 1.6s) */}
        <div className="relative w-64 sm:w-80 md:w-96 aspect-[656/382] animate-logo-reveal overflow-hidden">
          <div className="relative w-full h-[137%] [clip-path:inset(0_0_26%_0)]">
            <Image
              src="/images/satark-logo-transparent.png"
              alt="Satark AI"
              fill
              priority
              sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
              className="object-contain drop-shadow-[0_0_35px_rgba(217,119,6,0.28)]"
            />
          </div>
        </div>

        {/* Word-by-Word Tagline Reveal (1.6s - 2.5s) */}
        <div className="mt-3 sm:mt-4 text-center w-full">
          <div
            className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3.5 gap-y-1 font-extrabold tracking-[0.22em] sm:tracking-[0.28em] text-xs sm:text-sm md:text-[15px]"
            aria-label={copy.taglineAria}
          >
            {copy.taglineWords.map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={`tagline-word word-${index + 1} inline-block`}
                aria-hidden="true"
              >
                {word}
              </span>
            ))}
          </div>

          {/* Subtitle Line & Glowing Settle (2.45s) */}
          <div className="mt-3 animate-subtitle-settle">
            <div className="h-[1px] w-24 sm:w-28 mx-auto bg-gradient-to-r from-transparent via-[#D97706]/70 to-transparent mb-2" />
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A8A29E]">
              {copy.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

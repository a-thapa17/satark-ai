"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

interface CinematicIntroProps {
  onComplete?: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  // Start rendered so the overlay exists synchronously if satark-intro-active is present in HTML
  const [shouldRender, setShouldRender] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const dismissIntro = useCallback(() => {
    setIsFadingOut(true);
    try {
      sessionStorage.setItem("satark_intro_seen", "true");
      document.documentElement.classList.remove("satark-intro-active");
    } catch {
      // Graceful fallback if storage is restricted or unavailable
    }

    const timer = setTimeout(() => {
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    try {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        document.documentElement.classList.remove("satark-intro-active");
        setShouldRender(false);
        return;
      }
    } catch {
      // Ignore media query evaluation failures
    }

    // 2. Check sessionStorage for returning visits
    try {
      const hasSeen = sessionStorage.getItem("satark_intro_seen");
      if (hasSeen === "true") {
        document.documentElement.classList.remove("satark-intro-active");
        setShouldRender(false);
        return;
      }
    } catch {
      // Storage blocked; proceed safely without trapping
    }

    // Ensure html has class satark-intro-active for CSS locking
    try {
      document.documentElement.classList.add("satark-intro-active");
    } catch {
      // Fallback
    }

    // 3. Timed animation sequence (Total ~4.0 seconds):
    // - 0.0s – 0.8s: Circuit lines draw outward
    // - 0.8s – 1.6s: Circuit nodes illuminate & logo reveals
    // - 1.6s – 2.5s: Tagline words appear sequentially (STAY, ALERT., STAY, PROTECTED.)
    // - 2.5s – 3.4s: Full logo and tagline remain visible briefly (settled)
    // - 3.4s – 4.0s: Smooth fade transition (600ms) to homepage
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      try {
        sessionStorage.setItem("satark_intro_seen", "true");
        document.documentElement.classList.remove("satark-intro-active");
      } catch {
        // Fallback
      }
    }, 3400);

    const completeTimer = setTimeout(() => {
      setShouldRender(false);
      if (onComplete) onComplete();
    }, 4000);

    // Fail-safe watchdog timer: never trap visitors if browser gets throttled
    const safetyTimer = setTimeout(() => {
      try {
        document.documentElement.classList.remove("satark-intro-active");
      } catch {
        // Fallback
      }
      setShouldRender(false);
    }, 4600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
      clearTimeout(safetyTimer);
    };
  }, [onComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      id="satark-intro-overlay"
      role="dialog"
      aria-label="Satark AI Introduction"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#141211] overflow-hidden select-none transition-opacity duration-600 ease-in-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Skip Intro Button */}
      <button
        onClick={dismissIntro}
        type="button"
        className="absolute top-6 right-6 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-[#A8A29E] hover:text-[#FAF7F2] bg-[#1C1917]/85 hover:bg-[#292524] border border-[#44403C] hover:border-[#D97706]/60 shadow-sm backdrop-blur transition-all duration-200"
        aria-label="Skip Introduction"
      >
        <span>SKIP INTRO</span>
        <span aria-hidden="true" className="text-xs">✕</span>
      </button>

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
            aria-label="STAY ALERT. STAY PROTECTED."
          >
            <span className="tagline-word word-1 inline-block">STAY</span>
            <span className="tagline-word word-2 inline-block">ALERT.</span>
            <span className="tagline-word word-3 inline-block">STAY</span>
            <span className="tagline-word word-4 inline-block">PROTECTED.</span>
          </div>

          {/* Subtitle Line & Glowing Settle (2.45s) */}
          <div className="mt-3 animate-subtitle-settle">
            <div className="h-[1px] w-24 sm:w-28 mx-auto bg-gradient-to-r from-transparent via-[#D97706]/70 to-transparent mb-2" />
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A8A29E]">
              Digital Safety &amp; Scam Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import CinematicIntro from "@/components/CinematicIntro";
import MessageScanner from "@/components/MessageScanner";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  QrCode,
  Globe,
  MessageSquareWarning,
  Lock,
  EyeOff,
  FileText,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"url" | "qr" | "phone">("url");

  const sampleScans = {
    url: {
      title: "Lookalike Banking URL",
      input: "https://onlinesbi-kyc-portal.secure-banking-support.in/login",
      riskLevel: "High risk",
      riskBadgeClass: "bg-red-100 text-red-800 border-red-200",
      category: "Lookalike Domain Impersonation",
      confidence: "High (Domain registered 2 days ago)",
      reasons: [
        "Domain registered via RDAP only 48 hours ago in a high-risk offshore registrar.",
        "Deep subdomains mimick 'onlinesbi' to deceive mobile users.",
        "Not recognized by SBI's authorized host registry.",
      ],
      nextSteps: [
        "Close this tab immediately; do not enter credentials.",
        "Bookmark only the official bank portal: https://onlinesbi.sbi",
      ],
    },
    qr: {
      title: "UPI QR Payment Trap",
      input: "upi://pay?pa=refund-agent981@okaxis&pn=Electricity%20Refund&am=4500",
      riskLevel: "Suspicious",
      riskBadgeClass: "bg-amber-100 text-amber-800 border-amber-200",
      category: "UPI 'Receive Money' Scam",
      confidence: "High (Payload requires PIN to debit)",
      reasons: [
        "Payload attempts to debit ₹4,500 from your account under the guise of an 'Electricity Refund'.",
        "Rule: You NEVER need to enter a UPI PIN or scan a QR code to RECEIVE money.",
      ],
      nextSteps: [
        "Decline the collect request or do not approve the payment on your UPI app.",
        "Report the VPA to National Cyber Crime Reporting Portal (cybercrime.gov.in).",
      ],
    },
    phone: {
      title: "Suspect 'Digital Arrest' Call",
      input: "+91 98765 43210 (Claiming Mumbai Police / CBI / Customs)",
      riskLevel: "High risk",
      riskBadgeClass: "bg-red-100 text-red-800 border-red-200",
      category: "Coercive Impersonation (Digital Arrest)",
      confidence: "High (Classic extortion script)",
      reasons: [
        "Claims parcel seized with illegal contraband at customs or money laundering case.",
        "Threatens immediate arrest via video call; demands money transfer to 'reserve account'.",
        "Official police or law enforcement agencies NEVER conduct arrests over Skype/WhatsApp video.",
      ],
      nextSteps: [
        "Hang up immediately. You cannot be arrested digitally over video call.",
        "Report number on Sanchar Saathi (Chakshu) and I4C suspect database.",
      ],
    },
  };

  const activeSample = sampleScans[activeTab];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1917] selection:bg-[#FEF3C7] selection:text-[#92400E]">
      {/* Cinematic Intro Animation (plays once per session) */}
      <CinematicIntro />

      {/* Main Homepage Content */}
      <div id="main-homepage-content" className="transition-opacity duration-600 ease-in-out">
        {/* Top Banner: Emergency Helpline 1930 */}
      <div className="bg-[#1C1917] text-[#FAF7F2] text-xs sm:text-sm px-4 py-2 border-b border-[#292524]">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span>National Cyber Fraud Helpline (India):</span>
            <a
              href="tel:1930"
              className="text-[#D97706] font-bold hover:underline tracking-wide text-sm"
            >
              Dial 1930
            </a>
            <span className="text-[#A8A29E] hidden md:inline">
              (Available 24x7 for immediate financial fraud response)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#A8A29E]">
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#FAF7F2] inline-flex items-center gap-1 transition-colors"
            >
              cybercrime.gov.in
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="hidden sm:inline">|</span>
            <span className="text-[#D97706] font-semibold">Phase 1 Live</span>
          </div>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E7E1D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#D97706] flex items-center justify-center text-white shadow-sm ring-4 ring-[#D97706]/10">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#1C1917]">
                  SATARK <span className="text-[#D97706]">AI</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EBE3D5] text-[#57534E]">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-[#57534E] font-medium tracking-wide">
                Stay Alert. Stay Protected.
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#57534E]">
            <a href="#how-it-works" className="hover:text-[#1C1917] transition-colors">
              How It Works
            </a>
            <a href="#scanner" className="hover:text-[#1C1917] transition-colors">
              Message Scanner
            </a>
            <a href="#privacy" className="hover:text-[#1C1917] transition-colors">
              Privacy First
            </a>
            <a href="#resources" className="hover:text-[#1C1917] transition-colors">
              Emergency Channels
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-sm font-semibold shadow-sm transition-all hover:shadow"
            >
              <span>Scan Message</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBE3D5]/70 border border-[#DFD4C0] text-[#78350F] text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              Digital Safety & Scam Intelligence for India
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-[#1C1917] tracking-tight leading-[1.1] mb-6">
              In the first five minutes of a suspicious message,{" "}
              <span className="text-[#D97706] underline decoration-[#D97706]/30 underline-offset-8">
                clarity saves money.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#57534E] leading-relaxed mb-8 font-normal">
              Most tools return only a cryptic label. Satark AI delivers plain-language explainability:{" "}
              <strong className="text-[#1C1917]">is this a scam</strong>,{" "}
              <strong className="text-[#1C1917]">why it was flagged</strong>, and{" "}
              <strong className="text-[#1C1917]">what safe actions to take right now</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#scanner"
                className="px-6 py-3.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm font-semibold transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Scan a Message Now</span>
                <ChevronRight className="w-4 h-4 text-[#D97706]" />
              </a>

              <a
                href="tel:1930"
                className="px-6 py-3.5 rounded-xl bg-white border border-[#DFD4C0] hover:border-[#D97706] text-[#1C1917] text-sm font-semibold transition-all shadow-sm hover:shadow inline-flex items-center gap-2"
              >
                <PhoneCall className="w-4 h-4 text-[#D97706]" />
                <span>Call 1930 Helpline</span>
              </a>
            </div>

            {/* Micro trust indicators */}
            <div className="mt-12 pt-8 border-t border-[#E7E1D8] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#57534E]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EBE3D5] flex items-center justify-center text-[#78350F]">
                  <EyeOff className="w-4 h-4" />
                </div>
                <span>
                  <strong className="text-[#1C1917] block">In-Browser Masking</strong>
                  OTPs & Aadhaar never hit cloud
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EBE3D5] flex items-center justify-center text-[#78350F]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>
                  <strong className="text-[#1C1917] block">Deterministic Rules</strong>
                  Hard security checks always win
                </span>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-7 h-7 rounded-lg bg-[#EBE3D5] flex items-center justify-center text-[#78350F]">
                  <FileText className="w-4 h-4" />
                </div>
                <span>
                  <strong className="text-[#1C1917] block">Evidence Ready</strong>
                  Formats dossier for 1930 reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 bg-[#F4EFE6] border-y border-[#E7E1D8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2">
              Architecture & Approach
            </h2>
            <p className="text-3xl font-extrabold text-[#1C1917] tracking-tight">
              Four steps from suspicion to safety
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-[#D97706]/30 mb-2 block">01</span>
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E7E1D8] flex items-center justify-center text-[#1C1917] mb-4">
                  <MessageSquareWarning className="w-5 h-5 text-[#D97706]" />
                </div>
                <h3 className="font-bold text-lg text-[#1C1917] mb-2">1. SCAN</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Analyze messages, screenshots, suspicious links, QR codes, or phone numbers directly.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F4EFE6] text-xs font-semibold text-[#78350F]">
                On-device privacy parsing
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-[#D97706]/30 mb-2 block">02</span>
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E7E1D8] flex items-center justify-center text-[#1C1917] mb-4">
                  <ShieldAlert className="w-5 h-5 text-[#D97706]" />
                </div>
                <h3 className="font-bold text-lg text-[#1C1917] mb-2">2. ANALYSE</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Evaluate via deterministic rules, Indian brand edit-distance checks, RDAP age, and bounded AI.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F4EFE6] text-xs font-semibold text-[#78350F]">
                Threat lists + Hard rules
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-[#D97706]/30 mb-2 block">03</span>
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E7E1D8] flex items-center justify-center text-[#1C1917] mb-4">
                  <AlertTriangle className="w-5 h-5 text-[#D97706]" />
                </div>
                <h3 className="font-bold text-lg text-[#1C1917] mb-2">3. EXPLAIN</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Transparent 3-tier risk verdict with exact matched warning signs and checked data sources.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F4EFE6] text-xs font-semibold text-[#78350F]">
                Never deceptive 100% safe
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-3xl font-black text-[#D97706]/30 mb-2 block">04</span>
                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#E7E1D8] flex items-center justify-center text-[#1C1917] mb-4">
                  <ShieldCheck className="w-5 h-5 text-[#D97706]" />
                </div>
                <h3 className="font-bold text-lg text-[#1C1917] mb-2">4. PROTECT</h3>
                <p className="text-sm text-[#57534E] leading-relaxed">
                  Time-ordered safe steps: freeze accounts, preserve evidence, and direct links to 1930 reporting.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F4EFE6] text-xs font-semibold text-[#78350F]">
                Official reporting pathways
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Message Scanner (Phase 1) */}
      <section id="scanner" className="py-20 px-4 sm:px-6 bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBE3D5] text-[#D97706] text-xs font-bold uppercase tracking-wider mb-3 border border-[#DFD4C0]">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 1 Live Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#1C1917] tracking-tight mb-3">
              Suspicious Message Scanner
            </h2>
            <p className="text-sm sm:text-base text-[#57534E] leading-relaxed">
              Paste suspicious SMS, WhatsApp, or email text to receive an immediate, deterministic risk assessment with plain-language explanations and safe next steps.
            </p>
          </div>

          <MessageScanner />
        </div>
      </section>

      {/* Multimodal Detection Matrix Preview (Phase 2 Roadmap) */}
      <section id="sample-intelligence" className="py-16 px-4 sm:px-6 bg-[#F4EFE6] border-y border-[#E7E1D8]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBE3D5] text-[#78350F] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#DFD4C0]">
                Roadmap Preview • Phase 2
              </div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-1">
                Upcoming Threat Modalities
              </h2>
              <p className="text-2xl font-black text-[#1C1917] tracking-tight">
                Preview URL, QR & Phone Call Intelligence
              </p>
            </div>

            {/* Tab switchers */}
            <div className="flex flex-wrap p-1 bg-white rounded-xl border border-[#DFD4C0]">
              <button
                onClick={() => setActiveTab("url")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "url"
                    ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                    : "text-[#57534E] hover:text-[#1C1917]"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website URL</span>
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "qr"
                    ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                    : "text-[#57534E] hover:text-[#1C1917]"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI QR Code</span>
              </button>
              <button
                onClick={() => setActiveTab("phone")}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "phone"
                    ? "bg-[#1C1917] text-[#FAF7F2] shadow-sm"
                    : "text-[#57534E] hover:text-[#1C1917]"
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Checklist</span>
              </button>
            </div>
          </div>

          {/* Unified Result Card Showcase */}
          <div className="bg-white rounded-2xl border-2 border-[#E7E1D8] shadow-card overflow-hidden">
            {/* Input Header */}
            <div className="p-6 bg-[#FBF9F5] border-b border-[#E7E1D8]">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
                  Sample Input ({activeSample.title})
                </span>
                <span className="text-[11px] font-semibold text-[#D97706] bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-[#FDE68A]">
                  Pre-Masked for Privacy
                </span>
              </div>
              <p className="font-mono text-sm bg-white p-3.5 rounded-xl border border-[#E7E1D8] text-[#1C1917] break-all">
                {activeSample.input}
              </p>
            </div>

            {/* Verdict Bar */}
            <div className="p-6 border-b border-[#E7E1D8] grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                  Risk Level
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-extrabold uppercase tracking-wide border ${activeSample.riskBadgeClass}`}
                >
                  {activeSample.riskLevel}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                  Possible Category
                </span>
                <span className="text-sm font-bold text-[#1C1917]">
                  {activeSample.category}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#78716C] block mb-1">
                  Confidence & Signals
                </span>
                <span className="text-sm text-[#57534E] font-medium">
                  {activeSample.confidence}
                </span>
              </div>
            </div>

            {/* Breakdown & Safe Actions */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  Why it was flagged
                </h4>
                <ul className="space-y-2.5 text-sm text-[#44403C]">
                  {activeSample.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E7E1D8]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                  Safe Next Steps
                </h4>
                <ul className="space-y-2.5 text-sm text-[#44403C]">
                  {activeSample.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mt-2 flex-shrink-0" />
                      <span className="font-medium">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Footer: Attribution & Disclaimer */}
            <div className="px-6 py-3 bg-[#F4EFE6] border-t border-[#E7E1D8] flex flex-wrap items-center justify-between text-xs text-[#78716C]">
              <span>
                Deterministic rules run first • Bounded AI explanation • Sources: RDAP, RBI/I4C Advisories
              </span>
              <span className="font-semibold text-[#78350F]">
                An estimate, not proof. Always verify via official branch or helpline.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Guarantee Section */}
      <section id="privacy" className="py-16 px-4 sm:px-6 bg-[#1C1917] text-[#FAF7F2]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#292524] text-[#D97706] text-xs font-bold uppercase tracking-wider mb-4 border border-[#44403C]">
                <Lock className="w-3.5 h-3.5" />
                Zero-Leakage Privacy Architecture
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 text-[#FAF7F2]">
                Your confidential data stays on your machine.
              </h2>
              <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed mb-6">
                Scam messages frequently contain personal accounts, Aadhaar numbers, or OTPs. Satark AI uses an in-browser sanitization engine that redacts sensitive identifiers before any inspection packet touches external inference APIs.
              </p>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D97706]/20 text-[#D97706] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span><strong>On-Device OCR & QR:</strong> Tesseract.js and jsQR execute entirely in browser memory.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D97706]/20 text-[#D97706] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span><strong>Client-Side Regex Redaction:</strong> Masks 12-digit Aadhaar, PAN IDs, and OTP codes.</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#D97706]/20 text-[#D97706] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <span><strong>Zero Persistence by Default:</strong> No user scan histories or message texts are saved to disk.</span>
                </div>
              </div>
            </div>

            <div className="bg-[#292524] p-6 rounded-2xl border border-[#44403C] font-mono text-xs text-[#A8A29E]">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#44403C] text-xs font-semibold text-[#FAF7F2]">
                <span>Client-Side PII Sanitizer Preview</span>
                <span className="text-[#D97706]">Regex Guard Active</span>
              </div>
              <p className="text-[#D6D3D1] mb-2">// Raw User Screenshot Text:</p>
              <div className="bg-[#1C1917] p-3 rounded-lg border border-[#44403C] mb-4 text-red-300">
                &ldquo;Your Aadhaar 4920 1829 3847 linked to A/C 98127391823 has OTP 839102. Click to verify.&rdquo;
              </div>
              <p className="text-[#D6D3D1] mb-2">// Redacted Packet (Sent to Analyzer):</p>
              <div className="bg-[#1C1917] p-3 rounded-lg border border-[#44403C] text-green-300">
                &ldquo;Your Aadhaar [MASKED_AADHAAR] linked to A/C [MASKED_BANK_ACC] has OTP [MASKED_OTP]. Click to verify.&rdquo;
              </div>
              <div className="text-[11px] text-[#A8A29E] mt-3">
                * Links and brand names are preserved because threat detection requires them.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Emergency Resources */}
      <section id="resources" className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2">
              Official Indian Channels
            </h2>
            <p className="text-3xl font-black text-[#1C1917] tracking-tight">
              Actionable Helplines & Portals
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm hover:border-[#D97706] transition-all">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block mb-1">
                24x7 Immediate Response
              </span>
              <h3 className="text-xl font-black text-[#1C1917] mb-2">1930 Helpline</h3>
              <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
                National Cyber Fraud Helpline operated by Citizen Financial Cyber Fraud Reporting System. Call within 2 hours to freeze stolen money.
              </p>
              <a
                href="tel:1930"
                className="text-xs font-bold text-[#1C1917] hover:text-[#D97706] inline-flex items-center gap-1"
              >
                Call 1930 Directly →
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm hover:border-[#D97706] transition-all">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block mb-1">
                Formal Complaint Portal
              </span>
              <h3 className="text-xl font-black text-[#1C1917] mb-2">cybercrime.gov.in</h3>
              <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
                Official Ministry of Home Affairs portal to file FIRs, cybercrime reports, and track investigation acknowledgments.
              </p>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#1C1917] hover:text-[#D97706] inline-flex items-center gap-1"
              >
                Visit Portal →
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm hover:border-[#D97706] transition-all">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block mb-1">
                Telecom Fraud & Chakshu
              </span>
              <h3 className="text-xl font-black text-[#1C1917] mb-2">Sanchar Saathi</h3>
              <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
                Department of Telecommunications platform to report fraudulent callers, spam SMS, and block lost or stolen mobile handsets.
              </p>
              <a
                href="https://sancharsaathi.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#1C1917] hover:text-[#D97706] inline-flex items-center gap-1"
              >
                Report Number →
              </a>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#DFD4C0] shadow-sm hover:border-[#D97706] transition-all">
              <span className="text-xs font-bold text-[#D97706] uppercase tracking-wider block mb-1">
                Suspect Identifier Database
              </span>
              <h3 className="text-xl font-black text-[#1C1917] mb-2">I4C Suspect Registry</h3>
              <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
                Indian Cyber Crime Coordination Centre (I4C) portal to report suspect UPI VPAs, bank accounts, and phone numbers.
              </p>
              <a
                href="https://cybercrime.gov.in/webform/cyber_suspect.aspx"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#1C1917] hover:text-[#D97706] inline-flex items-center gap-1"
              >
                Submit Suspect Info →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#E7E1D8] py-12 px-4 sm:px-6 text-xs text-[#57534E]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D97706] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#1C1917]">SATARK AI</p>
              <p className="text-[11px] text-[#78716C]">Stay Alert. Stay Protected. • Digital Safety Platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="https://github.com/a-thapa17/satark-ai" target="_blank" rel="noreferrer" className="hover:text-[#1C1917] transition-colors">
              GitHub Repository
            </a>
            <span className="text-[#D6D3D1]">•</span>
            <span className="text-[#78716C]">MIT License</span>
            <span className="text-[#D6D3D1]">•</span>
            <span className="text-[#D97706] font-semibold">Phase 1 Live</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

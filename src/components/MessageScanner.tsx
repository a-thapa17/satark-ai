"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  AlertTriangle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  EyeOff,
  Clipboard,
  Sparkles,
  Info,
} from "lucide-react";
import { MessageScannerEngine } from "@/lib/scanner/engine";
import type { ScanReport } from "@/lib/scanner/types";

// ---------------------------------------------------------------------------
// Sample messages that exercise different rule categories
// ---------------------------------------------------------------------------
const SAMPLE_MESSAGES = [
  {
    label: "Fake SBI KYC SMS",
    emoji: "🏦",
    text: "Dear customer, your SBI account will be blocked in 10 minutes due to expired KYC. Update urgently: https://bit.ly/sbi-kyc-verify. Call 9876543210 for help.",
  },
  {
    label: "Electricity Disconnection Scam",
    emoji: "⚡",
    text: "Dear consumer, your electricity connection will be disconnected tonight at 9:30 PM due to non-payment. Please contact our electricity officer immediately on 9811234567 to avoid disconnection.",
  },
  {
    label: "Legitimate HDFC OTP",
    emoji: "✅",
    text: "492019 is your OTP for login to your HDFC Netbanking account. Valid for 10 mins. Bank never asks for your OTP. Do not share your OTP with anyone.",
  },
  {
    label: "Telegram Task Scam",
    emoji: "💸",
    text: "Work from home part-time job: Earn Rs 3000-5000 daily by simply like and subscribe YouTube videos. Join our Telegram group now for easy money. Limited slots.",
  },
] as const;

const MAX_CHARS = 2000;

function formatCategory(cat: string): string {
  const map: Record<string, string> = {
    bank_impersonation: "Bank Impersonation",
    otp_theft: "OTP & Credential Theft",
    upi_payment_fraud: "UPI / Payment Fraud",
    job_task_scam: "Job / Task Scam",
    fake_parcel_customs: "Fake Parcel / Customs Fee",
    fake_customer_support: "Fake Customer Support",
    lottery_investment_scam: "Lottery / Investment Scam",
    government_impersonation: "Government Impersonation",
    phishing_credential_theft: "Phishing / Credential Theft",
    digital_arrest_extortion: "Digital Arrest / Extortion",
    malicious_app_apk: "Malicious App / APK Lure",
    benign_communication: "Ordinary Communication",
    other: "Uncategorized Pattern",
    uncertain: "Ambiguous Pattern",
  };
  return map[cat] || cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Verdict styling helpers
// ---------------------------------------------------------------------------
function verdictConfig(verdict: ScanReport["verdict"]) {
  switch (verdict) {
    case "HIGH_RISK":
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        badge: "bg-red-100 text-red-800 border-red-300",
        icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
        label: "High Risk",
        dotColor: "bg-red-500",
        summaryColor: "text-red-800",
      };
    case "SUSPICIOUS":
      return {
        bg: "bg-amber-50",
        border: "border-amber-300",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        label: "Suspicious",
        dotColor: "bg-amber-500",
        summaryColor: "text-amber-800",
      };
    default:
      return {
        bg: "bg-green-50",
        border: "border-green-300",
        badge: "bg-green-100 text-green-800 border-green-300",
        icon: <ShieldCheck className="w-5 h-5 text-green-600" />,
        label: "No Strong Warning",
        dotColor: "bg-green-500",
        summaryColor: "text-green-800",
      };
  }
}

// ---------------------------------------------------------------------------
// Score bar
// ---------------------------------------------------------------------------
function ScoreBar({ score, verdict }: { score: number; verdict: ScanReport["verdict"] }) {
  const color =
    verdict === "HIGH_RISK"
      ? "bg-red-500"
      : verdict === "SUSPICIOUS"
      ? "bg-amber-500"
      : "bg-green-500";
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-[#78716C] mb-1">
        <span>Heuristic risk score</span>
        <span className="font-bold text-[#1C1917]">{score} / 100</span>
      </div>
      <div className="h-2 w-full bg-[#E7E1D8] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function MessageScanner() {
  const [inputText, setInputText] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"rules" | "ai">("rules");
  const [error, setError] = useState<string | null>(null);
  const [showAllSignals, setShowAllSignals] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // -------------------------------------------------------------------------
  // Analyse handler
  // -------------------------------------------------------------------------
  const handleScan = useCallback(
    async (text?: string) => {
      const messageToScan = (text ?? inputText).trim();

      if (!messageToScan) {
        setError("Please paste or type a message before scanning.");
        return;
      }
      if (messageToScan.length > MAX_CHARS) {
        setError(
          `Message is too long (${messageToScan.length} chars). Please keep it under ${MAX_CHARS} characters.`
        );
        return;
      }

      setIsLoading(true);
      setLoadingStage("rules");
      setError(null);
      setReport(null);
      setShowAllSignals(false);

      // 1. In-browser deterministic rules engine evaluation
      let ruleResult: ScanReport;
      try {
        ruleResult = MessageScannerEngine.analyze(messageToScan);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed.");
        setIsLoading(false);
        return;
      }

      // 2. If AI is not opted in, return local rules result immediately
      if (!useAi) {
        // Small delay (~250ms) for visual polish
        await new Promise((resolve) => setTimeout(resolve, 250));
        setReport({ ...ruleResult, aiStatus: "disabled" });
        setIsLoading(false);
        setTimeout(
          () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
          50
        );
        return;
      }

      // 3. AI analysis opted in: call server-side route with redacted text
      setLoadingStage("ai");
      try {
        const response = await fetch("/api/scan-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ruleResult.maskedInput, // Transmit only redacted text
            userConsent: true,
          }),
        });

        const data = await response.json();

        if (data.success && data.report) {
          // Merge deterministic findings with AI insights
          const combined = MessageScannerEngine.combineWithAi(ruleResult, data.report);
          setReport(combined);
        } else {
          // Fallback to rules-only scan with informative banner
          setReport({
            ...ruleResult,
            aiStatus: "fallback",
            aiError: data.message || "AI analysis was unavailable. Local deterministic findings are shown.",
          });
        }
      } catch (aiErr) {
        setReport({
          ...ruleResult,
          aiStatus: "fallback",
          aiError: "Network connection to AI service failed. Local deterministic findings are shown.",
        });
      } finally {
        setIsLoading(false);
        setTimeout(
          () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
          50
        );
      }
    },
    [inputText, useAi]
  );

  // -------------------------------------------------------------------------
  // Sample pill click
  // -------------------------------------------------------------------------
  const handleSampleClick = useCallback(
    (sampleText: string) => {
      setInputText(sampleText);
      setError(null);
      setReport(null);
      setShowAllSignals(false);
      handleScan(sampleText);
    },
    [handleScan]
  );

  // -------------------------------------------------------------------------
  // Clear
  // -------------------------------------------------------------------------
  const handleClear = useCallback(() => {
    setInputText("");
    setReport(null);
    setError(null);
    setShowAllSignals(false);
  }, []);

  const config = report ? verdictConfig(report.verdict) : null;
  const charsLeft = MAX_CHARS - inputText.length;
  const isOverLimit = inputText.length > MAX_CHARS;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* ------------------------------------------------------------------ */}
      {/* Input Panel                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border-2 border-[#E7E1D8] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E7E1D8] bg-[#FBF9F5] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
            Paste Suspicious Message
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-[#57534E] bg-[#EBE3D5] px-2.5 py-1 rounded-full border border-[#DFD4C0]">
            {useAi ? (
              <>
                <Sparkles className="w-3 h-3 text-[#D97706]" />
                Hybrid: Rules + Redacted AI Layer
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3" />
                Analyzed entirely in your browser
              </>
            )}
          </span>
        </div>

        {/* Textarea */}
        <div className="p-5">
          <textarea
            className={`w-full h-36 resize-none rounded-xl border p-4 text-sm font-mono text-[#1C1917] bg-[#FDFBF8] placeholder-[#A8A29E] focus:outline-none focus:ring-2 transition-all leading-relaxed ${
              isOverLimit
                ? "border-red-300 focus:ring-red-200"
                : "border-[#DFD4C0] focus:ring-[#D97706]/30 focus:border-[#D97706]"
            }`}
            placeholder="Paste an SMS, WhatsApp message, email, or any suspicious text here…&#10;&#10;Example: &quot;Your account will be blocked in 10 mins. Click here to verify KYC.&quot;"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(null);
            }}
            aria-label="Message input for scam analysis"
            maxLength={MAX_CHARS + 100}
          />

          {/* Char counter */}
          <div className="flex justify-end mt-1.5">
            <span
              className={`text-[11px] font-mono tabular-nums ${
                isOverLimit ? "text-red-500 font-bold" : charsLeft < 200 ? "text-amber-600" : "text-[#A8A29E]"
              }`}
            >
              {inputText.length} / {MAX_CHARS}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-2 flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Sample pills */}
        <div className="px-5 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2.5">
            Try a sample:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MESSAGES.map((sample) => (
              <button
                key={sample.label}
                onClick={() => handleSampleClick(sample.text)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#EBE3D5] hover:bg-[#DFD4C0] border border-[#DFD4C0] hover:border-[#C4B49A] text-[#44403C] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{sample.emoji}</span>
                <span>{sample.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Opt-in AI Analysis Toggle */}
        <div className="mx-5 mb-5 p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E7E1D8]">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 rounded border-[#DFD4C0] text-[#D97706] focus:ring-[#D97706] w-4 h-4 cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                Enhanced AI analysis — sends redacted message text to Google Gemini.
              </span>
              <p className="text-[11px] text-[#78716C] mt-1 leading-relaxed">
                Rules-only analysis remains default. When enabled, sensitive identifiers (Aadhaar, cards, OTPs,
                phones, emails) are masked in-browser before transmission. No text is stored or logged. Masking is
                heuristic and not guaranteed 100% complete.
              </p>
            </div>
          </label>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 flex items-center gap-3">
          <button
            onClick={() => handleScan()}
            disabled={isLoading || !inputText.trim() || isOverLimit}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-sm font-semibold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {loadingStage === "ai" ? "Consulting Gemini AI…" : "Evaluating Rules…"}
                </span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-[#D97706]" />
                <span>{useAi ? "Scan with AI Intelligence" : "Scan Message"}</span>
              </>
            )}
          </button>

          {(inputText || report) && (
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#DFD4C0] hover:border-[#C4B49A] text-sm font-semibold text-[#57534E] hover:text-[#1C1917] transition-all disabled:opacity-40"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading state                                                      */}
      {/* ------------------------------------------------------------------ */}
      {isLoading && (
        <div className="mt-4 bg-white rounded-2xl border-2 border-[#E7E1D8] p-8 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D97706]" />
          <p className="text-sm font-medium text-[#1C1917]">
            {loadingStage === "ai"
              ? "Consulting Google Gemini AI for contextual evidence…"
              : "Evaluating deterministic threat rules…"}
          </p>
          <p className="text-xs text-[#78716C]">
            {loadingStage === "ai"
              ? "Transmitting pre-masked text over encrypted server connection"
              : "Evaluating in-browser heuristic regex signatures"}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Result Card                                                         */}
      {/* ------------------------------------------------------------------ */}
      {report && !isLoading && config && (
        <div
          ref={resultRef}
          className={`mt-4 rounded-2xl border-2 overflow-hidden shadow-sm ${config.border}`}
        >
          {/* Verdict Header */}
          <div className={`p-5 ${config.bg} border-b ${config.border}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                {config.icon}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                    Overall risk assessment
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-lg text-sm font-extrabold uppercase tracking-wide border ${config.badge}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                    {config.label}
                  </span>
                  <p className={`text-xs mt-1 font-medium ${config.summaryColor}`}>
                    {report.summary}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs text-[#78716C] hidden sm:block">
                <span className="font-bold text-[#1C1917] text-base">{report.score}</span>
                <span className="text-[#A8A29E]"> / 100</span>
                <p className="font-medium">{report.category}</p>
                <p>Confidence: {report.confidence}</p>
              </div>
            </div>
            <ScoreBar score={report.score} verdict={report.verdict} />
            <p className="mt-1.5 text-[11px] text-[#78716C]">
              Heuristic 0–100 estimate from rules (and validated AI evidence if enabled), not a probability.
            </p>
            <div className="mt-2 text-xs text-[#78716C] sm:hidden">
              <span className="font-medium text-[#1C1917]">{report.category}</span> · Confidence:{" "}
              {report.confidence}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* AI Contextual Insights Section (When AI was executed)              */}
          {/* ------------------------------------------------------------------ */}
          {report.aiAnalysis && (
            <div className="bg-[#FAF7F2] border-b border-[#E7E1D8] p-5">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D97706]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    AI Contextual Security Analysis
                  </span>
                  <span className="text-[10px] bg-[#EBE3D5] text-[#78350F] px-2 py-0.5 rounded-full font-mono border border-[#DFD4C0]">
                    {report.aiAnalysis.modelUsed || "Google Gemini"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-white border border-[#DFD4C0] text-[#1C1917]">
                    {formatCategory(report.aiAnalysis.category)}
                  </span>
                </div>
              </div>

              {/* Disagreement Callout */}
              {report.aiAnalysis.disagreementWithRules && report.aiAnalysis.disagreementExplanation && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>{report.aiAnalysis.disagreementExplanation}</span>
                </div>
              )}

              {/* Personalized AI Summary */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E7E1D8] mb-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-1">
                  AI contextual interpretation
                </p>
                <p className="text-sm text-[#1C1917] leading-relaxed">
                  {report.aiAnalysis.summary}
                </p>
              </div>

              {/* Specific Evidence Cards */}
              {report.aiAnalysis.evidence.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716C] mb-2">
                    Message Evidence
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {report.aiAnalysis.evidence.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-[#E7E1D8] text-xs"
                      >
                        <span className="font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 block mb-1 break-words">
                          &ldquo;{item.phrase}&rdquo;
                        </span>
                        <p className="text-[#57534E] leading-relaxed">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manipulation Tactics */}
              {report.aiAnalysis.manipulationTactics.length > 0 && (
                <div className="mb-3 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#78716C]">
                    Manipulation Tactics:
                  </span>
                  {report.aiAnalysis.manipulationTactics.map((tactic, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium bg-[#EBE3D5] text-[#44403C] px-2 py-0.5 rounded-md border border-[#DFD4C0]"
                    >
                      {tactic}
                    </span>
                  ))}
                </div>
              )}

              {/* Uncertainties / Limitations */}
              {report.aiAnalysis.uncertainties.length > 0 && (
                <div className="text-[11px] text-[#78716C] mt-2 pt-2 border-t border-[#E7E1D8]">
                  <span className="font-semibold text-[#57534E]">Limitations: </span>
                  {report.aiAnalysis.uncertainties.join(" • ")}
                </div>
              )}
            </div>
          )}

          {/* AI Fallback Notice Banner */}
          {report.aiStatus === "fallback" && report.aiError && (
            <div className="bg-amber-50 border-b border-amber-200 px-5 py-3 flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Analysis Notice: </span>
                <span>{report.aiError}</span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Deterministic Rule-Based Findings Divider Header                   */}
          {/* ------------------------------------------------------------------ */}
          <div className="px-5 py-2.5 bg-[#FBF9F5] border-b border-[#E7E1D8] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#57534E] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
              Deterministic Rule-Based Findings
            </span>
            <span className="text-[10px] text-[#78716C]">Evaluated locally</span>
          </div>

          {/* Rule Findings Body */}
          <div className="bg-white p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Why flagged / reasons */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                {report.signals.length > 0 ? "Rule matches" : "Rule-based assessment"}
              </h4>
              {report.reasons.length > 0 ? (
                <ul className="space-y-2.5 text-sm text-[#44403C]">
                  {report.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-2 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#57534E]">
                  Rule-based analysis found no typical keyword or pattern indicators.
                </p>
              )}

              {/* Detected signals expandable */}
              {report.signals.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowAllSignals((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#D97706] hover:underline"
                  >
                    {showAllSignals ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                    {showAllSignals ? "Hide" : "Show"} all matched signals ({report.signals.length})
                  </button>

                  {showAllSignals && (
                    <div className="mt-3 space-y-2">
                      {report.signals.map((sig) => (
                        <div
                          key={sig.id}
                          className="text-xs bg-[#FEF3C7] border border-[#FDE68A] rounded-lg px-3 py-2"
                        >
                          <span className="font-bold text-[#92400E]">{sig.label}</span>
                          <span className="ml-2 text-[#78716C]">(+{sig.weight} pts)</span>
                          <p className="text-[#57534E] mt-1 leading-relaxed">{sig.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Defensive signals */}
              {report.defensiveSignals.length > 0 && (
                <div className="mt-4 space-y-2">
                  {report.defensiveSignals.map((sig) => (
                    <div
                      key={sig.id}
                      className="text-xs bg-green-50 border border-green-200 rounded-lg px-3 py-2"
                    >
                      <span className="font-bold text-green-800">✓ {sig.label}</span>
                      <p className="text-[#57534E] mt-0.5 leading-relaxed">{sig.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Safe next steps */}
            <div className="bg-[#FAF7F2] p-5 rounded-xl border border-[#E7E1D8]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                Safe Next Steps
              </h4>
              {report.safeNextSteps.length > 0 ? (
                <ul className="space-y-3 text-sm text-[#44403C]">
                  {report.safeNextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] mt-2 flex-shrink-0" />
                      <span className="font-medium leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#57534E]">
                  Stay vigilant and verify senders through official channels.
                </p>
              )}

              {/* 1930 CTA for high risk */}
              {report.verdict === "HIGH_RISK" && (
                <a
                  href="tel:1930"
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-[#FAF7F2] text-xs font-bold transition-all shadow-sm w-full justify-center"
                >
                  <PhoneCall className="w-4 h-4 text-[#D97706]" />
                  Call 1930 Cyber Fraud Helpline
                </a>
              )}
            </div>
          </div>

          {/* Masked input preview */}
          {report.maskedInput !== report.rawInputLength.toString() && (
            <div className="px-5 pb-4 bg-white border-t border-[#E7E1D8]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] mb-2 flex items-center gap-1.5">
                <EyeOff className="w-3 h-3" />
                Analyzed text (PII redacted in-browser)
              </p>
              <p className="font-mono text-xs bg-[#FBF9F5] border border-[#E7E1D8] rounded-lg p-3 text-[#1C1917] break-all leading-relaxed">
                {report.maskedInput}
              </p>
            </div>
          )}

          {/* Footer disclaimer */}
          <div className="px-5 py-3 bg-[#F4EFE6] border-t border-[#E7E1D8] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#78716C]">
            <span className="flex items-center gap-1.5">
              <Clipboard className="w-3 h-3" />
              {report.limitationsDisclaimer}
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Privacy note                                                       */}
      {/* ------------------------------------------------------------------ */}
      <p className="mt-4 text-center text-[11px] text-[#A8A29E]">
        {useAi
          ? "🔒 Enhanced AI mode: Redacted text (PII masked in-browser) is analyzed via Google Gemini. No message content is stored or logged."
          : "🔒 Analyzed entirely in your browser. Message content is never sent to any server, stored, or logged."}
      </p>
    </div>
  );
}

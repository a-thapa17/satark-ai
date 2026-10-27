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
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  SCANNER_COPY,
  formatAiCategory,
  formatCharacterError,
  localizeScanReport,
} from "@/lib/i18n/scanner";

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
        icon: <ShieldAlert className="w-5 h-5 text-red-600" aria-hidden="true" />,
        dotColor: "bg-red-500",
        summaryColor: "text-red-800",
      };
    case "SUSPICIOUS":
      return {
        bg: "bg-amber-50",
        border: "border-amber-300",
        badge: "bg-amber-100 text-amber-800 border-amber-300",
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />,
        dotColor: "bg-amber-500",
        summaryColor: "text-amber-800",
      };
    default:
      return {
        bg: "bg-green-50",
        border: "border-green-300",
        badge: "bg-green-100 text-green-800 border-green-300",
        icon: <ShieldCheck className="w-5 h-5 text-green-600" aria-hidden="true" />,
        dotColor: "bg-green-500",
        summaryColor: "text-green-800",
      };
  }
}

// ---------------------------------------------------------------------------
// Score bar
// ---------------------------------------------------------------------------
function ScoreBar({
  score,
  verdict,
  label,
}: {
  score: number;
  verdict: ScanReport["verdict"];
  label: string;
}) {
  const color =
    verdict === "HIGH_RISK"
      ? "bg-red-500"
      : verdict === "SUSPICIOUS"
      ? "bg-amber-500"
      : "bg-green-500";
  return (
    <div className="mt-3">
      <div className="mb-1 flex items-center justify-between text-xs text-[#78716C]">
        <span>{label}</span>
        <span className="font-bold text-[#1C1917]">{score} / 100</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#E7E1D8]"
        role="img"
        aria-label={`${label}: ${score} / 100`}
      >
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
type ScannerError =
  | { code: "empty" }
  | { code: "tooLong"; count: number }
  | { code: "analysis"; detail?: string };

export default function MessageScanner() {
  const { language } = useLanguage();
  const copy = SCANNER_COPY[language];
  const [inputText, setInputText] = useState("");
  const [useAi, setUseAi] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<"rules" | "ai">("rules");
  const [error, setError] = useState<ScannerError | null>(null);
  const [showAllSignals, setShowAllSignals] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);

  const errorMessage = error
    ? error.code === "analysis"
      ? (error.detail ?? copy.ui.errorAnalysis)
      : formatCharacterError(language, error.code, {
          count: error.code === "tooLong" ? error.count : "",
          max: MAX_CHARS,
        })
    : null;

  function revealResult() {
    setTimeout(() => {
      const node = resultRef.current;
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "nearest" });
      node.focus({ preventScroll: true });
    }, 50);
  }

  // -------------------------------------------------------------------------
  // Analyse handler
  // -------------------------------------------------------------------------
  const handleScan = useCallback(
    async (text?: string) => {
      const messageToScan = (text ?? inputText).trim();

      if (!messageToScan) {
        // Do not leave an earlier report visible for a different input.
        setReport(null);
        setShowAllSignals(false);
        setError({ code: "empty" });
        return;
      }
      if (messageToScan.length > MAX_CHARS) {
        setReport(null);
        setShowAllSignals(false);
        setError({ code: "tooLong", count: messageToScan.length });
        return;
      }

      // A synchronous guard prevents double-clicks and sample sends from
      // starting two analyses before React has rendered the disabled state.
      if (inFlightRef.current) return;
      inFlightRef.current = true;

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
        setError({
          code: "analysis",
          detail: err instanceof Error ? err.message : undefined,
        });
        setIsLoading(false);
        inFlightRef.current = false;
        return;
      }

      // 2. If AI is not opted in, return local rules result immediately
      if (!useAi) {
        // Small delay (~250ms) for visual polish
        await new Promise((resolve) => setTimeout(resolve, 250));
        setReport({ ...ruleResult, aiStatus: "disabled" });
        setIsLoading(false);
        inFlightRef.current = false;
        revealResult();
        return;
      }

      // 3. AI analysis opted in: call server-side route with redacted text
      setLoadingStage("ai");
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch("/api/scan-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ruleResult.maskedInput, // Transmit only redacted text
            userConsent: true,
          }),
          signal: controller.signal,
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
      } catch {
        setReport({
          ...ruleResult,
          aiStatus: "fallback",
          aiError:
            "The AI request timed out or the network connection failed. Local deterministic findings are shown.",
        });
      } finally {
        window.clearTimeout(timeoutId);
        inFlightRef.current = false;
        setIsLoading(false);
        revealResult();
      }
    },
    [inputText, useAi]
  );

  // -------------------------------------------------------------------------
  // Sample pill click
  // -------------------------------------------------------------------------
  const handleSampleClick = useCallback(
    (sampleText: string) => {
      if (inFlightRef.current) return;
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
    if (inFlightRef.current) return;
    setInputText("");
    setReport(null);
    setError(null);
    setShowAllSignals(false);
  }, []);

  const config = report ? verdictConfig(report.verdict) : null;
  const view = report ? localizeScanReport(report, language) : null;
  const charsLeft = MAX_CHARS - inputText.length;
  const isOverLimit = inputText.length > MAX_CHARS;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* ------------------------------------------------------------------ */}
      {/* Input Panel                                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#E7E1D8] bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7E1D8] bg-[#FBF9F5] px-5 py-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#57534E]">
            {copy.ui.panelLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[#DFD4C0] bg-[#EBE3D5] px-2.5 py-1 text-[11px] text-[#57534E]">
            {useAi ? (
              <>
                <Sparkles className="h-3 w-3 text-[#B45309]" aria-hidden="true" />
                {copy.ui.hybridMode}
              </>
            ) : (
              <>
                <EyeOff className="h-3 w-3" aria-hidden="true" />
                {copy.ui.analyzedLocally}
              </>
            )}
          </span>
        </div>

        {/* Textarea */}
        <div className="p-5">
          <label htmlFor="message-scanner-input" className="sr-only">
            {copy.ui.textareaLabel}
          </label>
          <textarea
            id="message-scanner-input"
            className={`h-36 w-full resize-none rounded-xl border bg-[#FDFBF8] p-4 font-mono text-sm leading-relaxed text-[#1C1917] transition-all placeholder:text-[#78716C] focus:outline-none focus:ring-2 ${
              isOverLimit
                ? "border-red-300 focus:ring-red-200"
                : "border-[#DFD4C0] focus:border-[#B45309] focus:ring-[#B45309]/30"
            }`}
            placeholder={copy.ui.placeholder}
            value={inputText}
            disabled={isLoading}
            onChange={(event) => {
              const value = event.target.value;
              setInputText(value);
              if (value.length > MAX_CHARS) {
                setError({ code: "tooLong", count: value.length });
              } else if (error) {
                setError(null);
              }
            }}
            aria-invalid={Boolean(error) || isOverLimit}
            aria-describedby={errorMessage ? "message-scanner-error" : undefined}
            aria-busy={isLoading}
            maxLength={MAX_CHARS + 100}
          />

          {/* Char counter */}
          <div className="mt-1.5 flex justify-end">
            <span
              className={`font-mono text-[11px] tabular-nums ${
                isOverLimit
                  ? "font-bold text-red-700"
                  : charsLeft < 200
                    ? "text-amber-700"
                    : "text-[#78716C]"
              }`}
            >
              {inputText.length} / {MAX_CHARS}
            </span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              id="message-scanner-error"
              role="alert"
              className="mt-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Sample pills */}
        <div className="px-5 pb-4">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
            {copy.ui.samplesHeading}
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_MESSAGES.map((sample, index) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleSampleClick(sample.text)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFD4C0] bg-[#EBE3D5] px-3 py-1.5 text-xs font-semibold text-[#44403C] transition-all hover:border-[#C4B49A] hover:bg-[#DFD4C0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span aria-hidden="true">{sample.emoji}</span>
                <span>{copy.ui.sampleLabels[index]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Privacy & Opt-in AI Analysis Toggle */}
        <div className="mx-5 mb-5 rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-3.5">
          <div className="flex items-start gap-3">
            <input
              id="scanner-use-ai"
              type="checkbox"
              checked={useAi}
              onChange={(event) => setUseAi(event.target.checked)}
              disabled={isLoading}
              aria-describedby="scanner-ai-help"
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[#DFD4C0] text-[#B45309] focus:ring-[#B45309]"
            />
            <div className="text-xs">
              <label
                htmlFor="scanner-use-ai"
                className="flex cursor-pointer select-none items-center gap-1.5 font-bold text-[#1C1917]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
                {copy.ui.aiToggleTitle}
              </label>
              <p id="scanner-ai-help" className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
                {copy.ui.aiToggleBody}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={() => handleScan()}
            disabled={isLoading}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-6 py-2.5 text-sm font-semibold text-[#FAF7F2] shadow-sm transition-all hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>
                  {loadingStage === "ai" ? copy.ui.scanningAi : copy.ui.scanningRules}
                </span>
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 text-[#FCD34D]" aria-hidden="true" />
                <span>{useAi ? copy.ui.scanWithAi : copy.ui.scan}</span>
              </>
            )}
          </button>

          {(inputText || report) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DFD4C0] px-4 py-2.5 text-sm font-semibold text-[#57534E] transition-all hover:border-[#C4B49A] hover:text-[#1C1917] disabled:opacity-40"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span>{copy.ui.clear}</span>
            </button>
          )}
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {isLoading ? copy.ui.resultRunning : report ? copy.ui.resultReady : ""}
      </p>

      {/* ------------------------------------------------------------------ */}
      {/* Loading state                                                      */}
      {/* ------------------------------------------------------------------ */}
      {isLoading && (
        <div className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-[#E7E1D8] bg-white p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B45309]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#1C1917]">
            {loadingStage === "ai" ? copy.ui.loadingAiTitle : copy.ui.loadingRulesTitle}
          </p>
          <p className="text-xs text-[#57534E]">
            {loadingStage === "ai" ? copy.ui.loadingAiBody : copy.ui.loadingRulesBody}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Result Card                                                         */}
      {/* ------------------------------------------------------------------ */}
      {report && !isLoading && config && view && (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="region"
          aria-label={copy.ui.assessmentLabel}
          className={`mt-4 overflow-hidden rounded-2xl border-2 shadow-sm ${config.border}`}
        >
          {/* Verdict Header */}
          <div className={`border-b p-5 ${config.bg} ${config.border}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                {config.icon}
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                    {copy.ui.assessmentLabel}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-0.5 text-sm font-extrabold uppercase tracking-wide ${config.badge}`}
                  >
                    <span className={`h-2 w-2 rounded-full ${config.dotColor}`} aria-hidden="true" />
                    {view.verdictLabel}
                  </span>
                  <p className={`mt-1 text-xs font-medium ${config.summaryColor}`}>
                    {view.summary}
                  </p>
                </div>
              </div>
              <div className="hidden text-right text-xs text-[#57534E] sm:block">
                <span className="text-base font-bold text-[#1C1917]">{report.score}</span>
                <span className="text-[#78716C]"> / 100</span>
                <p className="font-medium">{view.category}</p>
                <p>{copy.ui.confidenceLabel.replace("{value}", view.confidence)}</p>
              </div>
            </div>
            <ScoreBar score={report.score} verdict={report.verdict} label={copy.ui.scoreLabel} />
            <p className="mt-1.5 text-[11px] text-[#57534E]">{copy.ui.scoreNote}</p>
            <div className="mt-2 text-xs text-[#57534E] sm:hidden">
              <span className="font-medium text-[#1C1917]">{view.category}</span> ·{" "}
              {copy.ui.confidenceLabel.replace("{value}", view.confidence)}
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* AI Contextual Insights Section (When AI was executed)              */}
          {/* ------------------------------------------------------------------ */}
          {report.aiAnalysis && (
            <div className="border-b border-[#E7E1D8] bg-[#FAF7F2] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    {copy.ui.aiTitle}
                  </span>
                  <span className="rounded-full border border-[#DFD4C0] bg-[#EBE3D5] px-2 py-0.5 font-mono text-[10px] text-[#78350F]">
                    {report.aiAnalysis.modelUsed || "Google Gemini"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-[#DFD4C0] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#1C1917]">
                    {formatAiCategory(report.aiAnalysis.category, language)}
                  </span>
                </div>
              </div>

              {language === "hi" && (
                <p className="mb-3 rounded-lg border border-[#E7E1D8] bg-white px-3 py-2 text-[11px] leading-relaxed text-[#57534E]">
                  {copy.ui.aiInformational}
                </p>
              )}

              {/* Disagreement Callout */}
              {report.aiAnalysis.disagreementWithRules && report.aiAnalysis.disagreementExplanation && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" aria-hidden="true" />
                  <span>{report.aiAnalysis.disagreementExplanation}</span>
                </div>
              )}

              {/* Personalized AI Summary */}
              <div className="mb-4 rounded-xl border border-[#E7E1D8] bg-white p-3.5">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                  {copy.ui.aiInterpretation}
                </p>
                <p className="text-sm leading-relaxed text-[#1C1917]">
                  {report.aiAnalysis.summary}
                </p>
              </div>

              {/* Specific Evidence Cards */}
              {report.aiAnalysis.evidence.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                    {copy.ui.aiEvidence}
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {report.aiAnalysis.evidence.map((item, index) => (
                      <div
                        key={`${item.phrase}-${index}`}
                        className="rounded-xl border border-[#E7E1D8] bg-white p-3 text-xs"
                      >
                        <span className="mb-1 block break-words rounded border border-red-200 bg-red-50 px-1.5 py-0.5 font-mono text-red-800">
                          &ldquo;{item.phrase}&rdquo;
                        </span>
                        <p className="leading-relaxed text-[#57534E]">{item.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI-suggested actions, kept separate from deterministic steps */}
              {report.aiAnalysis.recommendedActions.length > 0 && (
                <div className="mb-4 rounded-xl border border-[#E7E1D8] bg-white p-3.5">
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                    {copy.ui.aiRecommendations}
                  </p>
                  <ul className="space-y-2 text-xs text-[#44403C]">
                    {report.aiAnalysis.recommendedActions.map((action, index) => (
                      <li key={`${action}-${index}`} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B45309]" />
                        <span className="leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Manipulation Tactics */}
              {report.aiAnalysis.manipulationTactics.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#57534E]">
                    {copy.ui.aiTactics}
                  </span>
                  {report.aiAnalysis.manipulationTactics.map((tactic, index) => (
                    <span
                      key={`${tactic}-${index}`}
                      className="rounded-md border border-[#DFD4C0] bg-[#EBE3D5] px-2 py-0.5 text-[11px] font-medium text-[#44403C]"
                    >
                      {tactic}
                    </span>
                  ))}
                </div>
              )}

              {/* Uncertainties / Limitations */}
              {report.aiAnalysis.uncertainties.length > 0 && (
                <div className="mt-2 border-t border-[#E7E1D8] pt-2 text-[11px] text-[#57534E]">
                  <span className="font-semibold text-[#44403C]">{copy.ui.aiLimitations} </span>
                  {report.aiAnalysis.uncertainties.join(" • ")}
                </div>
              )}
            </div>
          )}

          {/* AI Fallback Notice Banner */}
          {report.aiStatus === "fallback" && (
            <div className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs text-amber-900">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" aria-hidden="true" />
              <div>
                <span className="font-bold">{copy.ui.aiFallbackTitle} </span>
                <span>
                  {language === "hi"
                    ? copy.ui.aiFallback
                    : (report.aiError ?? copy.ui.aiFallback)}
                </span>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* Deterministic Rule-Based Findings Divider Header                   */}
          {/* ------------------------------------------------------------------ */}
          <div className="flex items-center justify-between border-b border-[#E7E1D8] bg-[#FBF9F5] px-5 py-2.5">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#57534E]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#B45309]" aria-hidden="true" />
              {copy.ui.findingsTitle}
            </span>
            <span className="text-[10px] text-[#57534E]">{copy.ui.evaluatedLocally}</span>
          </div>

          {/* Rule Findings Body */}
          <div className="grid grid-cols-1 gap-6 bg-white p-5 md:grid-cols-2">
            {/* Why flagged / reasons */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                <AlertTriangle className="h-4 w-4 text-[#B45309]" aria-hidden="true" />
                {report.signals.length > 0 ? copy.ui.ruleMatches : copy.ui.ruleAssessment}
              </h4>
              {view.reasons.length > 0 ? (
                <ul className="space-y-2.5 text-sm text-[#44403C]">
                  {view.reasons.map((reason, index) => (
                    <li key={`${reason}-${index}`} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B45309]" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#57534E]">{copy.ui.noReasons}</p>
              )}

              {/* Detected signals expandable */}
              {report.signals.length > 0 && (
                <div className="mt-4">
                  <button
                    type="button"
                    aria-expanded={showAllSignals}
                    onClick={() => setShowAllSignals((value) => !value)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#92400E] hover:underline"
                  >
                    {showAllSignals ? (
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {showAllSignals
                      ? copy.ui.hideSignals.replace("{count}", String(report.signals.length))
                      : copy.ui.showSignals.replace("{count}", String(report.signals.length))}
                  </button>

                  {showAllSignals && (
                    <div className="mt-3 space-y-2">
                      {report.signals.map((signal, index) => {
                        const translated = view.signals[index];
                        return (
                          <div
                            key={signal.id}
                            className="rounded-lg border border-[#FDE68A] bg-[#FEF3C7] px-3 py-2 text-xs"
                          >
                            <span className="font-bold text-[#92400E]">{translated.label}</span>
                            <span className="ml-2 text-[#57534E]">
                              {copy.ui.points.replace("{count}", String(signal.weight))}
                            </span>
                            <p className="mt-1 leading-relaxed text-[#57534E]">
                              {translated.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Defensive signals */}
              {report.defensiveSignals.length > 0 && (
                <div className="mt-4 space-y-2">
                  {report.defensiveSignals.map((signal, index) => {
                    const translated = view.defensiveSignals[index];
                    return (
                      <div
                        key={signal.id}
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs"
                      >
                        <span className="font-bold text-green-800">✓ {translated.label}</span>
                        <p className="mt-0.5 leading-relaxed text-[#57534E]">
                          {translated.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Safe next steps */}
            <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-5">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                <ShieldCheck className="h-4 w-4 text-[#15803D]" aria-hidden="true" />
                {copy.ui.safeSteps}
              </h4>
              {view.safeNextSteps.length > 0 ? (
                <ul className="space-y-3 text-sm text-[#44403C]">
                  {view.safeNextSteps.map((step, index) => (
                    <li key={`${step}-${index}`} className="flex items-start gap-2.5">
                      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#15803D]" />
                      <span className="font-medium leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#57534E]">{copy.ui.noSteps}</p>
              )}

              {/* 1930 CTA for high risk */}
              {report.verdict === "HIGH_RISK" && (
                <a
                  href="tel:1930"
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-bold text-[#FAF7F2] shadow-sm transition-all hover:bg-[#292524]"
                >
                  <PhoneCall className="h-4 w-4 text-[#FCD34D]" aria-hidden="true" />
                  {copy.ui.call1930}
                </a>
              )}
            </div>
          </div>

          {/* Masked input preview */}
          {report.maskedItemsCount > 0 && (
            <div className="border-t border-[#E7E1D8] bg-white px-5 pb-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#57534E]">
                <EyeOff className="h-3 w-3" aria-hidden="true" />
                {copy.ui.maskedPreview}
              </p>
              <p className="break-all rounded-lg border border-[#E7E1D8] bg-[#FBF9F5] p-3 font-mono text-xs leading-relaxed text-[#1C1917]">
                {report.maskedInput}
              </p>
            </div>
          )}

          {/* Footer disclaimer */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E7E1D8] bg-[#F4EFE6] px-5 py-3 text-[11px] text-[#57534E]">
            <span className="flex items-start gap-1.5">
              <Clipboard className="mt-0.5 h-3 w-3 flex-shrink-0" aria-hidden="true" />
              {view.limitations}
            </span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Privacy note                                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="mt-4 space-y-1.5 text-center text-[11px] text-[#57534E]">
        <p>{useAi ? copy.ui.privacyAi : copy.ui.privacyLocal}</p>
        {language === "hi" && <p className="mx-auto max-w-xl">{copy.ui.languageNote}</p>}
      </div>
    </div>
  );
}

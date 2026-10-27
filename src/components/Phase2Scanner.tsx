"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileImage,
  Info,
  Link2,
  Loader2,
  QrCode,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { classifyQrContent, type QrContent } from "@/lib/qr/classify";
import { URL_SAMPLES } from "@/lib/url/samples";
import type { UrlAnalysisReport } from "@/lib/url/types";
import { UrlResultCard } from "@/components/phase2/UrlResultCard";
import { UpiResultCard } from "@/components/phase2/UpiResultCard";
import LiveQrCamera from "@/components/phase2/LiveQrCamera";
import { Camera } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  PHASE2_COPY,
  formatUrlHttpError,
  qrErrorForCode,
  sampleNote,
} from "@/lib/i18n/phase2";
import { formatTemplate } from "@/lib/i18n/language";

type Mode = "url" | "qr";

interface QrFileInfo {
  name: string;
  width: number;
  height: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

class UrlRequestError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "UrlRequestError";
    this.code = code;
  }
}

async function requestUrlAnalysis(
  value: string,
  language: "en" | "hi"
): Promise<UrlAnalysisReport> {
  const errors = PHASE2_COPY[language].errors;
  let response: Response;
  try {
    response = await fetch("/api/analyze-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: value }),
    });
  } catch {
    throw new UrlRequestError(errors.unreachable, "UNREACHABLE");
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new UrlRequestError(errors.unreadable, "UNREADABLE");
  }

  if (!response.ok) {
    const code =
      isRecord(data) && typeof data.code === "string" ? data.code : undefined;
    const message =
      response.status === 429
        ? errors.rateLimited
        : response.status === 400
          ? errors.invalidUrl
          : response.status >= 500
            ? errors.analysisFailed
            : formatUrlHttpError(language, response.status);
    throw new UrlRequestError(message, code);
  }
  if (!isRecord(data) || data.success !== true || !isRecord(data.report)) {
    throw new UrlRequestError(errors.unexpected, "UNEXPECTED");
  }
  return data.report as unknown as UrlAnalysisReport;
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-[#57534E]">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B45309]" aria-hidden="true" />
      {label}
    </span>
  );
}

function ErrorBanner({ message, id }: { message: string; id?: string }) {
  return (
    <div
      id={id}
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-900"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-700" aria-hidden="true" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}

function QrContentCard({ content }: { content: QrContent }) {
  const { language } = useLanguage();
  const copy = PHASE2_COPY[language].content;
  if (content.kind === "url") {
    return (
      <div className="mt-4 rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-800">
            <Link2 className="h-3 w-3" aria-hidden="true" /> {copy.urlFound}
          </span>
          <span className="text-xs text-[#57534E]">{copy.urlSent}</span>
        </div>
        <div className="mt-2 rounded-lg border border-[#E7E1D8] bg-[#FAF7F2] px-3 py-2">
          <p className="break-all font-mono text-xs text-[#1C1917]">{content.url}</p>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[#57534E]">
          <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          {copy.inert}
        </p>
      </div>
    );
  }

  if (content.kind === "upi") {
    return <UpiResultCard payment={content.payment} />;
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#E7E1D8] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
          <FileImage className="h-3 w-3" aria-hidden="true" /> {copy.plainText}
        </span>
        <span className="text-xs text-[#57534E]">{copy.noUrlUpi}</span>
      </div>
      <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-[#E7E1D8] bg-[#FAF7F2] px-3 py-2">
        <pre className="whitespace-pre-wrap break-words font-mono text-xs text-[#1C1917]">{content.text}</pre>
      </div>
      {content.note && <p className="mt-2 text-[11px] leading-relaxed text-[#57534E]">{content.note}</p>}
      <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[#57534E]">
        <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        {copy.notExecuted}
      </p>
    </div>
  );
}

export default function Phase2Scanner() {
  const { language } = useLanguage();
  const copy = PHASE2_COPY[language];
  const [mode, setMode] = useState<Mode>("url");

  const [urlInput, setUrlInput] = useState("");
  const [urlReport, setUrlReport] = useState<UrlAnalysisReport | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrFileInfo, setQrFileInfo] = useState<QrFileInfo | null>(null);
  const [qrContent, setQrContent] = useState<QrContent | null>(null);
  const [qrReport, setQrReport] = useState<UrlAnalysisReport | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlTabRef = useRef<HTMLButtonElement>(null);
  const qrTabRef = useRef<HTMLButtonElement>(null);
  const urlRequestIdRef = useRef(0);
  const qrRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  useEffect(() => {
    return () => {
      // Ignore any response or decode that finishes after unmounting.
      urlRequestIdRef.current += 1;
      qrRequestIdRef.current += 1;
    };
  }, []);

  function selectTab(next: Mode) {
    setMode(next);
    requestAnimationFrame(() => {
      if (next === "url") urlTabRef.current?.focus();
      else qrTabRef.current?.focus();
    });
  }

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(mode === "url" ? "qr" : "url");
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab("url");
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab("qr");
    }
  }

  async function runUrlAnalysis(value: string): Promise<UrlAnalysisReport> {
    const report = await requestUrlAnalysis(value, language);
    return report;
  }

  async function analyzeUrlValue(
    value: string,
    target: "url" | "qr" = "url",
    requestId?: number
  ) {
    const activeId =
      requestId ??
      (target === "url"
        ? ++urlRequestIdRef.current
        : ++qrRequestIdRef.current);
    const isCurrent = () =>
      target === "url"
        ? activeId === urlRequestIdRef.current
        : activeId === qrRequestIdRef.current;
    if (!isCurrent()) return;

    if (target === "url") {
      setUrlInput(value);
      setUrlLoading(true);
      setUrlError(null);
      setUrlReport(null);
    } else {
      setQrLoading(true);
      setQrError(null);
      setQrReport(null);
    }

    try {
      const report = await runUrlAnalysis(value);
      if (!isCurrent()) return;
      if (target === "url") setUrlReport(report);
      else setQrReport(report);
    } catch (error) {
      if (!isCurrent()) return;
      const message =
        error instanceof Error ? error.message : copy.errors.analysisFailed;
      if (target === "url") setUrlError(message);
      else setQrError(message);
    } finally {
      if (isCurrent()) {
        if (target === "url") setUrlLoading(false);
        else setQrLoading(false);
      }
    }
  }

  async function handleUrlSubmit(event: React.FormEvent) {
    event.preventDefault();
    const value = urlInput.trim();
    if (!value) {
      // Cancel any in-flight request so its result cannot replace this error.
      urlRequestIdRef.current += 1;
      setUrlLoading(false);
      setUrlReport(null);
      setUrlError(copy.errors.urlRequired);
      return;
    }
    await analyzeUrlValue(value);
  }

  async function handleQrFile(file: File) {
    const requestId = ++qrRequestIdRef.current;
    const isCurrent = () => requestId === qrRequestIdRef.current;

    setQrError(null);
    setQrReport(null);
    setQrContent(null);
    setQrFileInfo(null);
    setQrLoading(true);

    const preview = URL.createObjectURL(file);
    setQrPreview(preview);

    try {
      const { decodeQrFromFile } = await import("@/lib/qr/decode");
      const decoded = await decodeQrFromFile(file);
      if (!isCurrent()) return;

      const content = classifyQrContent(decoded.text);
      setQrFileInfo({ name: file.name, width: decoded.width, height: decoded.height });
      setQrContent(content);

      if (content.kind === "url") {
        await analyzeUrlValue(content.url, "qr", requestId);
      }
    } catch (error) {
      if (!isCurrent()) return;
      const message =
        error instanceof Error ? error.message : copy.errors.decodeFailed;
      const code =
        isRecord(error) && typeof error.code === "string" ? error.code : undefined;
      setQrError(qrErrorForCode(language, code, message));
    } finally {
      if (isCurrent()) setQrLoading(false);
    }
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleQrFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleQrFile(file);
  }

  async function loadDemoQr(kind: "url" | "upi") {
    const requestId = ++qrRequestIdRef.current;
    setQrError(null);
    setQrLoading(true);
    try {
      const path = kind === "url" ? "/images/phase2-demo-url-qr.png" : "/images/phase2-demo-upi-qr.png";
      const response = await fetch(path);
      if (!response.ok) throw new Error(copy.errors.demoFailed);
      const blob = await response.blob();
      if (requestId !== qrRequestIdRef.current) return;
      const file = new File([blob], `satark-demo-${kind}-qr.png`, {
        type: blob.type || "image/png",
      });
      await handleQrFile(file);
    } catch (error) {
      if (requestId !== qrRequestIdRef.current) return;
      setQrError(error instanceof Error ? error.message : copy.errors.demoFailed);
      setQrLoading(false);
    }
  }

  async function handleLiveScan(decodedText: string) {
    setShowCamera(false);
    const requestId = ++qrRequestIdRef.current;
    const isCurrent = () => requestId === qrRequestIdRef.current;

    setQrError(null);
    setQrReport(null);
    setQrContent(null);
    setQrFileInfo(null);
    setQrPreview(null);

    try {
      const content = classifyQrContent(decodedText);
      setQrFileInfo({ name: "Live Camera Capture", width: 400, height: 400 });
      setQrContent(content);

      if (content.kind === "url") {
        await analyzeUrlValue(content.url, "qr", requestId);
      }
    } catch (error) {
      if (!isCurrent()) return;
      const message = error instanceof Error ? error.message : copy.errors.decodeFailed;
      setQrError(message);
    }
  }

  function clearQr() {
    qrRequestIdRef.current += 1;
    setQrPreview(null);
    setQrFileInfo(null);
    setQrContent(null);
    setQrReport(null);
    setQrError(null);
    setQrLoading(false);
  }

  return (
    <div className="overflow-hidden rounded-3xl border-2 border-[#E7E1D8] bg-[#FFFDF8] shadow-[0_20px_50px_rgba(68,64,60,0.08)]">
      <div className="border-b border-[#E7E1D8] bg-[#FBF7EF] px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#92400E]">
              {copy.header.phase}
            </p>
            <h3 className="mt-0.5 text-lg font-extrabold text-[#1C1917]">
              {copy.header.title}
            </h3>
            <p className="mt-0.5 text-xs text-[#57534E]">{copy.header.body}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#E7E1D8] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#57534E]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
            {copy.header.noAutoOpen}
          </div>
        </div>

        <div
          role="tablist"
          aria-label={copy.tabs.label}
          onKeyDown={handleTabKeyDown}
          className="mt-4 flex gap-1.5 rounded-xl bg-[#EBE3D5] p-1 sm:w-fit"
        >
          <button
            ref={urlTabRef}
            id="phase2-url-tab"
            type="button"
            role="tab"
            aria-selected={mode === "url"}
            aria-controls="phase2-url-panel"
            tabIndex={mode === "url" ? 0 : -1}
            onClick={() => setMode("url")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              mode === "url"
                ? "bg-white text-[#1C1917] shadow-sm"
                : "text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.tabs.url}
          </button>
          <button
            ref={qrTabRef}
            id="phase2-qr-tab"
            type="button"
            role="tab"
            aria-selected={mode === "qr"}
            aria-controls="phase2-qr-panel"
            tabIndex={mode === "qr" ? 0 : -1}
            onClick={() => setMode("qr")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold transition-colors ${
              mode === "qr"
                ? "bg-white text-[#1C1917] shadow-sm"
                : "text-[#57534E] hover:text-[#1C1917]"
            }`}
          >
            <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.tabs.qr}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <p className="sr-only" role="status" aria-live="polite">
          {mode === "url"
            ? urlLoading
              ? copy.url.running
              : urlReport
                ? copy.url.ready
                : ""
            : qrLoading
              ? copy.qr.running
              : qrContent
                ? copy.qr.ready
                : ""}
        </p>

        {mode === "url" ? (
          <div
            id="phase2-url-panel"
            role="tabpanel"
            aria-labelledby="phase2-url-tab"
            tabIndex={0}
            className="focus:outline-none"
          >
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Link2
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]"
                  aria-hidden="true"
                />
                <label htmlFor="phase2-url-input" className="sr-only">
                  {copy.url.inputLabel}
                </label>
                <input
                  id="phase2-url-input"
                  type="text"
                  inputMode="url"
                  value={urlInput}
                  onChange={(event) => {
                    setUrlInput(event.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  placeholder={copy.url.placeholder}
                  disabled={urlLoading}
                  aria-invalid={Boolean(urlError)}
                  aria-describedby={urlError ? "phase2-url-error" : "phase2-url-notice"}
                  className="w-full rounded-xl border border-[#D6CCBD] bg-white py-2.5 pl-9 pr-3 text-sm text-[#1C1917] placeholder:text-[#78716C] focus:border-[#B45309] focus:outline-none focus:ring-2 focus:ring-[#B45309]/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={urlLoading}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#44403C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {urlLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                {urlLoading ? copy.url.analyzing : copy.url.submit}
              </button>
            </form>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                {copy.url.samples}
              </span>
              {URL_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => void analyzeUrlValue(sample.url)}
                  disabled={urlLoading}
                  title={sampleNote(language, sample.id, sample.note)}
                  className="rounded-full border border-[#E7E1D8] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#57534E] transition-colors hover:border-[#B45309] hover:text-[#92400E] disabled:opacity-60"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <p
              id="phase2-url-notice"
              className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#57534E]"
            >
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
              {copy.url.notice}
            </p>

            {urlError && <ErrorBanner id="phase2-url-error" message={urlError} />}
            {urlLoading && (
              <div className="mt-3 rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] px-3 py-2.5">
                <Spinner label={copy.url.loading} />
              </div>
            )}
            {urlReport && <UrlResultCard report={urlReport} />}
          </div>
        ) : (
          <div
            id="phase2-qr-panel"
            role="tabpanel"
            aria-labelledby="phase2-qr-tab"
            tabIndex={0}
            className="focus:outline-none"
          >
            {showCamera ? (
              <div className="mb-4">
                <LiveQrCamera
                  onScanSuccess={handleLiveScan}
                  onClose={() => setShowCamera(false)}
                />
              </div>
            ) : (
              <div className="mb-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  disabled={qrLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D97706] to-[#B45309] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:from-[#B45309] hover:to-[#92400E] disabled:opacity-60"
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Scan with Device Camera
                </button>
              </div>
            )}
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
                dragging ? "border-[#B45309] bg-amber-50" : "border-[#D6CCBD] bg-[#FAF7F2]"
              }`}
            >
              <input
                ref={fileInputRef}
                id="phase2-qr-file"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={handleFileInput}
                className="sr-only"
                aria-label={copy.qr.inputLabel}
              />
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E1D8] bg-white">
                <Upload className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm font-bold text-[#1C1917]">
                {copy.qr.uploadTitle}
              </p>
              <p className="mt-1 text-[11px] text-[#57534E]">{copy.qr.uploadHint}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={qrLoading}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1C1917] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#44403C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FileImage className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.qr.choose}
              </button>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  {copy.qr.demo}
                </span>
                <button
                  type="button"
                  onClick={() => void loadDemoQr("url")}
                  disabled={qrLoading}
                  className="rounded-full border border-[#E7E1D8] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#57534E] hover:border-[#B45309] disabled:opacity-60"
                >
                  {copy.qr.urlSample}
                </button>
                <button
                  type="button"
                  onClick={() => void loadDemoQr("upi")}
                  disabled={qrLoading}
                  className="rounded-full border border-[#E7E1D8] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#57534E] hover:border-[#B45309] disabled:opacity-60"
                >
                  {copy.qr.upiSample}
                </button>
              </div>
            </div>

            <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-[#57534E]">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#B45309]" aria-hidden="true" />
              {copy.qr.privacy}
            </p>

            {qrLoading && (
              <div className="mt-3 rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] px-3 py-2.5">
                <Spinner label={copy.qr.loading} />
              </div>
            )}
            {qrError && <ErrorBanner message={qrError} />}

            {(qrPreview || qrFileInfo) && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#E7E1D8] bg-white p-3">
                {qrPreview && (
                  // Local object URL for the user's own uploaded image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrPreview}
                    alt={copy.qr.previewAlt}
                    className="h-16 w-16 rounded-lg border border-[#E7E1D8] bg-white object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-[#1C1917]">
                    {qrFileInfo?.name ?? copy.qr.fallbackFile}
                  </p>
                  {qrFileInfo && (
                    <p className="text-[11px] text-[#57534E]">
                      {formatTemplate(copy.qr.dimensions, {
                        width: qrFileInfo.width,
                        height: qrFileInfo.height,
                      })}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearQr}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E7E1D8] px-2 py-1 text-[10px] font-semibold text-[#57534E] hover:bg-[#FAF7F2]"
                >
                  <RotateCcw className="h-3 w-3" aria-hidden="true" />
                  {copy.qr.clear}
                </button>
              </div>
            )}

            {qrContent && <QrContentCard content={qrContent} />}
            {qrReport && <UrlResultCard report={qrReport} />}

            {qrContent?.kind === "url" && !qrLoading && !qrReport && !qrError && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#57534E]">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D]" aria-hidden="true" />
                {copy.qr.extracted}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

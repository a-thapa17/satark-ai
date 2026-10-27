"use client";

import React, { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";
import { EMERGENCY_SCENARIOS } from "@/lib/help/scenarios";
import { SAFETY_PLAYBOOKS } from "@/lib/help/playbooks";
import type {
  EmergencyScenarioId,
  EvidenceRequestInput,
  PlaybookId,
} from "@/lib/help/types";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { HELP_COPY } from "@/lib/i18n/help-ui";
import {
  getLocalizedPlaybooks,
  getLocalizedScenarios,
} from "@/lib/i18n/help-content";
import { formatTemplate } from "@/lib/i18n/language";

type IncidentType = EmergencyScenarioId | "other";

interface EvidenceFormState {
  incidentType: IncidentType;
  playbookId: PlaybookId;
  name: string;
  contact: string;
  incidentAt: string;
  amount: string;
  transactionRef: string;
  suspiciousUrls: string;
  description: string;
  scannerFindings: string;
}

const INITIAL_FORM: EvidenceFormState = {
  incidentType: "financial_fraud",
  playbookId: "upi_payment_fraud",
  name: "",
  contact: "",
  incidentAt: "",
  amount: "",
  transactionRef: "",
  suspiciousUrls: "",
  description: "",
  scannerFindings: "",
};

function filenameFromResponse(response: Response): string {
  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/i);
  return match?.[1] ?? "satark-evidence.pdf";
}

export default function EvidencePdfBuilder() {
  const [form, setForm] = useState<EvidenceFormState>(INITIAL_FORM);
  const [status, setStatus] = useState<
    "idle" | "working" | "success" | "error"
  >("idle");
  const [errorKind, setErrorKind] = useState<
    "http" | "empty" | "generic" | null
  >(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const copy = HELP_COPY[language];
  const scenarios = getLocalizedScenarios(language);
  const playbooks = getLocalizedPlaybooks(language);
  const httpMessage =
    errorStatus === 429
      ? copy.evidence.rateLimited
      : errorStatus === 413
        ? copy.evidence.tooLarge
        : errorStatus === 400
          ? copy.evidence.invalidDetails
          : formatTemplate(copy.evidence.httpError, {
              status: errorStatus ?? 0,
            });
  const baseMessage =
    status === "success"
      ? copy.evidence.success
      : status === "error"
        ? errorKind === "empty"
          ? copy.evidence.emptyFile
          : errorKind === "http"
            ? httpMessage
            : copy.evidence.genericError
        : "";
  // Server details are English technical strings; only append them for the
  // English UI. The localized status message remains complete on its own.
  const message =
    status === "error" && errorDetail && language === "en"
      ? `${baseMessage} ${errorDetail}`
      : baseMessage;

  function updateField<K extends keyof EvidenceFormState>(
    key: K,
    value: EvidenceFormState[K]
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateIncidentType(value: IncidentType) {
    const scenario = EMERGENCY_SCENARIOS.find((item) => item.id === value);
    const playbookId = scenario?.playbookIds[0] ?? "phishing_links";
    setForm((current) => ({
      ...current,
      incidentType: value,
      playbookId,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("working");
    setErrorKind(null);
    setErrorStatus(null);
    setErrorDetail(null);

    const payload: EvidenceRequestInput = {
      incidentType: form.incidentType,
      playbookId: form.playbookId,
      name: form.name.trim() || undefined,
      contact: form.contact.trim() || undefined,
      incidentAt: form.incidentAt.trim() || undefined,
      amount: form.amount.trim() || undefined,
      transactionRef: form.transactionRef.trim() || undefined,
      suspiciousUrls: form.suspiciousUrls
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
      description: form.description.trim(),
      scannerFindings: form.scannerFindings.trim() || undefined,
    };

    try {
      const response = await fetch("/api/evidence-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let detail = "";
        try {
          const errorBody = (await response.json()) as { message?: unknown };
          if (typeof errorBody.message === "string") {
            detail = errorBody.message.slice(0, 300);
          }
        } catch {
          // A non-JSON error body is still handled by the localized HTTP message.
        }
        setErrorKind("http");
        setErrorStatus(response.status);
        setErrorDetail(detail || null);
        setStatus("error");
        resultRef.current?.focus();
        return;
      }

      const blob = await response.blob();
      if (!blob.size) {
        setErrorKind("empty");
        setErrorDetail(null);
        setStatus("error");
        resultRef.current?.focus();
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filenameFromResponse(response);
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_500);

      setStatus("success");
      resultRef.current?.focus();
    } catch {
      setErrorKind("generic");
      setStatus("error");
      resultRef.current?.focus();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] text-[#B45309]">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-black text-[#1C1917]">
              {copy.evidence.title}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
              {copy.evidence.intro}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="evidence-incident-type"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.incidentType}
            </label>
            <select
              id="evidence-incident-type"
              value={form.incidentType}
              onChange={(event) =>
                updateIncidentType(event.target.value as IncidentType)
              }
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.shortTitle}
                </option>
              ))}
              <option value="other">{copy.evidence.otherIncident}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="evidence-playbook"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.guidance}
            </label>
            <select
              id="evidence-playbook"
              value={form.playbookId}
              onChange={(event) =>
                updateField("playbookId", event.target.value as PlaybookId)
              }
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            >
              {playbooks.map((playbook) => (
                <option key={playbook.id} value={playbook.id}>
                  {playbook.shortTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="evidence-name"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.name} <span className="font-normal">{copy.common.optional}</span>
            </label>
            <input
              id="evidence-name"
              type="text"
              maxLength={80}
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
          </div>

          <div>
            <label
              htmlFor="evidence-contact"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.contact} <span className="font-normal">{copy.common.optional}</span>
            </label>
            <input
              id="evidence-contact"
              type="text"
              maxLength={120}
              autoComplete="email"
              value={form.contact}
              onChange={(event) => updateField("contact", event.target.value)}
              placeholder={copy.evidence.contactPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
          </div>

          <div>
            <label
              htmlFor="evidence-time"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.incidentAt} <span className="font-normal">{copy.common.optional}</span>
            </label>
            <input
              id="evidence-time"
              type="datetime-local"
              value={form.incidentAt}
              onChange={(event) => updateField("incidentAt", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
          </div>

          <div>
            <label
              htmlFor="evidence-amount"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.amount} <span className="font-normal">{copy.common.optional}</span>
            </label>
            <input
              id="evidence-amount"
              type="text"
              maxLength={40}
              value={form.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              placeholder={copy.evidence.amountPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="evidence-reference"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.transactionRef}{" "}
              <span className="font-normal">{copy.common.optional}</span>
            </label>
            <input
              id="evidence-reference"
              type="text"
              maxLength={128}
              value={form.transactionRef}
              onChange={(event) =>
                updateField("transactionRef", event.target.value)
              }
              placeholder={copy.evidence.transactionRefPlaceholder}
              className="mt-1.5 w-full rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="evidence-urls"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.urls}{" "}
              <span className="font-normal">{copy.evidence.urlsHint}</span>
            </label>
            <textarea
              id="evidence-urls"
              rows={2}
              maxLength={2048 * 5 + 20}
              value={form.suspiciousUrls}
              onChange={(event) =>
                updateField("suspiciousUrls", event.target.value)
              }
              placeholder={copy.evidence.urlsPlaceholder}
              className="mt-1.5 w-full resize-y rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
            <p className="mt-1 text-[11px] text-[#78716C]">
              {copy.evidence.urlsNote}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="evidence-description"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.description} <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <textarea
              id="evidence-description"
              required
              rows={5}
              maxLength={3000}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder={copy.evidence.descriptionPlaceholder}
              className="mt-1.5 w-full resize-y rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm leading-relaxed text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="evidence-findings"
              className="block text-xs font-bold text-[#1C1917]"
            >
              {copy.evidence.findings}{" "}
              <span className="font-normal">{copy.common.optional}</span>
            </label>
            <textarea
              id="evidence-findings"
              rows={3}
              maxLength={2500}
              value={form.scannerFindings}
              onChange={(event) =>
                updateField("scannerFindings", event.target.value)
              }
              placeholder={copy.evidence.findingsPlaceholder}
              className="mt-1.5 w-full resize-y rounded-lg border border-[#D6D3D1] bg-[#FAF7F2] px-3 py-2.5 text-sm leading-relaxed text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#D97706] focus:outline-none focus:ring-2 focus:ring-[#D97706]/20"
            />
            <p className="mt-1 text-[11px] leading-relaxed text-[#78716C]">
              {copy.evidence.findingsNote}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11px] leading-relaxed text-red-900">
          <LockKeyhole
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
            aria-hidden="true"
          />
          <span>
            {copy.evidence.privacy}
          </span>
        </div>

        <button
          type="submit"
          disabled={status === "working"}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#292524] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-offset-2"
        >
          {status === "working" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="h-4 w-4 text-[#D97706]" aria-hidden="true" />
          )}
          {status === "working" ? copy.evidence.preparing : copy.evidence.download}
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-[#78716C]">
          {copy.evidence.routeNote}
        </p>
      </form>

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-live="polite"
        className="self-start rounded-2xl border border-[#E7E1D8] bg-white p-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]"
      >
        <h3 className="text-base font-black text-[#1C1917]">
          {copy.evidence.sideHeading}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
          {copy.evidence.sideIntro}
        </p>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-3">
            <h4 className="text-xs font-bold text-[#1C1917]">
              {copy.evidence.userProvided}
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
              {copy.evidence.userProvidedBody}
            </p>
          </div>
          <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-3">
            <h4 className="text-xs font-bold text-[#1C1917]">
              {copy.evidence.automated}
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
              {copy.evidence.automatedBody}
            </p>
          </div>
          <div className="rounded-xl border border-[#E7E1D8] bg-[#FAF7F2] p-3">
            <h4 className="text-xs font-bold text-[#1C1917]">
              {copy.evidence.nextSteps}
            </h4>
            <p className="mt-1 text-[11px] leading-relaxed text-[#57534E]">
              {copy.evidence.nextStepsBody}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3 text-[11px] leading-relaxed text-[#78350F]">
          <ShieldAlert
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <span>
            <strong>{copy.evidence.noReportBold}</strong>{" "}
            {copy.evidence.noReportBody}
          </span>
        </div>

        {status !== "idle" && message ? (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed ${
              status === "success"
                ? "border-green-200 bg-green-50 text-green-900"
                : status === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-700"
                aria-hidden="true"
              />
            ) : status === "error" ? (
              <AlertCircle
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600"
                aria-hidden="true"
              />
            ) : (
              <Loader2
                className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin"
                aria-hidden="true"
              />
            )}
            <span>{message}</span>
          </div>
        ) : null}

        <p className="mt-4 text-[10px] leading-relaxed text-[#A8A29E]">
          {copy.evidence.outputLanguage}
        </p>
      </div>
    </div>
  );
}

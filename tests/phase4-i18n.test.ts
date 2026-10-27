import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { LanguageProvider, persistLanguage, safeReadLanguage } from "../src/lib/i18n/LanguageProvider.tsx";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguage,
} from "../src/lib/i18n/language.ts";
import { LANDING_COPY } from "../src/lib/i18n/landing.ts";
import { SITE_COPY } from "../src/lib/i18n/site.ts";
import { HELP_COPY } from "../src/lib/i18n/help-ui.ts";
import { SCANNER_COPY } from "../src/lib/i18n/scanner.ts";
import { PHASE2_COPY } from "../src/lib/i18n/phase2.ts";
import { URL_COPY, localizeUrlReport } from "../src/lib/i18n/url.ts";
import {
  localizeCallResult,
  localizeEmergencyPlan,
  localizePlaybook,
} from "../src/lib/i18n/help-content.ts";
import { getDemoUrlReport } from "../src/lib/url/demo.ts";
import { buildEmergencyPlan } from "../src/lib/help/scenarios.ts";
import { SAFETY_PLAYBOOKS } from "../src/lib/help/playbooks.ts";
import { analyzeSuspiciousCall } from "../src/lib/help/phone.ts";
import type { UpiPaymentDetails } from "../src/lib/qr/upi.ts";
import LanguageSwitcher from "../src/components/LanguageSwitcher.tsx";
import SiteHeader from "../src/components/SiteHeader.tsx";
import MessageScanner from "../src/components/MessageScanner.tsx";
import Phase2Scanner from "../src/components/Phase2Scanner.tsx";
import HelpHub from "../src/components/help/HelpHub.tsx";
import EmergencyAssistant from "../src/components/help/EmergencyAssistant.tsx";
import PlaybookLibrary from "../src/components/help/PlaybookLibrary.tsx";
import PhoneCallChecker from "../src/components/help/PhoneCallChecker.tsx";
import EvidencePdfBuilder from "../src/components/help/EvidencePdfBuilder.tsx";
import { UrlResultCard } from "../src/components/phase2/UrlResultCard.tsx";
import { UpiResultCard } from "../src/components/phase2/UpiResultCard.tsx";

function renderWithLanguage(element: React.ReactElement, language: "en" | "hi"): string {
  return renderToStaticMarkup(
    React.createElement(LanguageProvider, { initialLanguage: language, children: element })
  );
}

const payment: UpiPaymentDetails = {
  uri: "upi://pay?pa=demo.merchant@upi&pn=Demo%20Merchant&am=499.00&cu=INR&tn=Demo%20order",
  upiId: "demo.merchant@upi",
  payeeName: "Demo Merchant",
  amount: "499.00",
  amountValue: 499,
  currency: "INR",
  transactionNote: "Demo order",
  warnings: ["The UPI ID format is unusual. Verify it in your payment app before paying."],
};

describe("Phase 4 Hindi interface coverage", () => {
  it("renders Hindi navigation, language controls, and emergency actions", () => {
    const html = renderWithLanguage(React.createElement(SiteHeader), "hi");
    assert.match(html, /मुख्य नेविगेशन/);
    assert.match(html, /संदेश स्कैनर/);
    assert.match(html, /URL और QR स्कैनर/);
    assert.match(html, /सहायता केंद्र/);
    assert.match(html, /नेविगेशन मेन्यू खोलें/);
    assert.match(html, /href="tel:112"/);
    assert.match(html, /href="tel:1930"/);
    assert.match(html, /aria-controls="mobile-navigation"/);
    assert.match(html, /aria-label="हिन्दी में देखें"/);
    assert.match(html, /aria-label="View the site in English"/);
    assert.match(html, /aria-pressed="true"[^>]*aria-label="हिन्दी में देखें"/);
    assert.match(html, /aria-pressed="false"[^>]*aria-label="View the site in English"/);
  });

  it("renders Hindi landing, scanner, and result copy without translating technical identifiers", () => {
    const report = getDemoUrlReport("https://example.com/");
    assert.ok(report);
    const urlHtml = renderWithLanguage(
      React.createElement(UrlResultCard, { report }),
      "hi"
    );
    assert.match(urlHtml, /URL जोखिम मूल्यांकन/);
    assert.match(urlHtml, /सुरक्षित अगले कदम/);
    assert.match(urlHtml, /https:\/\/example\.com\//);
    assert.match(urlHtml, /Google Safe Browsing/);
    assert.match(urlHtml, /URLhaus/);
    assert.match(urlHtml, /RDAP/);

    const upiHtml = renderWithLanguage(
      React.createElement(UpiResultCard, { payment }),
      "hi"
    );
    assert.match(upiHtml, /भुगतान विवरण मिले/);
    assert.match(upiHtml, /demo\.merchant@upi/);
    assert.match(upiHtml, /499\.00/);
    assert.match(upiHtml, /INR/);

    assert.match(LANDING_COPY.hi.hero.titleStart, /संदिग्ध/);
    assert.match(LANDING_COPY.hi.quick.cards[0]!.title, /संदेश/);
    assert.match(SITE_COPY.hi.nav.helpHub, /सहायता/);
    assert.match(SCANNER_COPY.hi.ui.scan, /स्कैन/);
    assert.match(PHASE2_COPY.hi.header.title, /QR/);
    assert.match(URL_COPY.hi.ui.safeSteps, /सुरक्षित/);
  });

  it("renders scanner shells and help tools in Hindi", () => {
    const scanner = renderWithLanguage(React.createElement(MessageScanner), "hi");
    assert.match(scanner, /संदिग्ध संदेश पेस्ट करें/);
    assert.match(scanner, /संदेश स्कैन करें/);
    assert.doesNotMatch(scanner, /Paste suspicious message/);

    const phase2 = renderWithLanguage(React.createElement(Phase2Scanner), "hi");
    assert.match(phase2, /URL और QR सुरक्षा स्कैनर/);
    assert.match(phase2, /URL जाँचें/);
    assert.match(phase2, /QR चित्र स्कैन करें/);

    const hub = renderWithLanguage(React.createElement(HelpHub), "hi");
    assert.match(hub, /आपातकालीन मार्गदर्शन/);
    assert.match(hub, /सुरक्षा प्लेबुक/);
    assert.match(hub, /फ़ोन जाँच/);
    assert.match(hub, /साक्ष्य PDF/);
    assert.match(hub, /112 पर कॉल करें/);
    assert.match(hub, /1930 पर कॉल करें/);
    assert.match(hub, /आधिकारिक पोर्टल/);

    const emergency = renderWithLanguage(
      React.createElement(EmergencyAssistant),
      "hi"
    );
    assert.match(emergency, /तत्काल खतरा सबसे पहले/);
    assert.match(emergency, /क्या हो रहा है\?/);
    assert.match(emergency, /वित्तीय जानकारी/);
    assert.match(emergency, /मेरी कार्य योजना दिखाएँ/);

    const playbooks = renderWithLanguage(
      React.createElement(PlaybookLibrary),
      "hi"
    );
    assert.match(playbooks, /UPI और भुगतान धोखाधड़ी/);
    assert.match(playbooks, /तत्काल कार्रवाई/);
    assert.match(playbooks, /सहेजने योग्य साक्ष्य/);

    const phone = renderWithLanguage(React.createElement(PhoneCallChecker), "hi");
    assert.match(phone, /संदिग्ध कॉल जाँचें/);
    assert.match(phone, /कॉलर प्रतिष्ठा डेटा उपलब्ध नहीं/);
    assert.match(phone, /इस कॉल को स्थानीय रूप से जाँचें/);

    const evidence = renderWithLanguage(
      React.createElement(EvidencePdfBuilder),
      "hi"
    );
    assert.match(evidence, /साक्ष्य सार बनाएँ/);
    assert.match(evidence, /साक्ष्य PDF डाउनलोड करें/);
    assert.match(evidence, /PDF अंग्रेज़ी में बनती है/);
    assert.match(evidence, /OTP, पासवर्ड, UPI PIN/);
  });

  it("localizes emergency plans and phone results while preserving official IDs", () => {
    const plan = buildEmergencyPlan({
      scenario: "financial_fraud",
      immediateDanger: false,
      moneyLost: true,
    });
    const localized = localizeEmergencyPlan(plan, "hi", {
      immediateDanger: false,
      moneyLost: true,
    });
    assert.match(localized.headline, /पैसे जा चुके हैं/);
    assert.match(localized.noReportSubmitted, /कोई शिकायत दर्ज नहीं/);
    assert.ok(localized.steps.every((step) => /[\u0900-\u097F]/.test(step.detail)));
    assert.ok(localized.steps.some((step) => step.detail.includes("1930")));
    assert.ok(localized.reportingOptions.some((option) => option.resourceIds.includes("helpline1930")));
    assert.match(localized.finalStep, /वसूली की गारंटी नहीं/);

    const call = analyzeSuspiciousCall({
      phoneNumber: "+91 98765 43210",
      description:
        "The caller claimed to be CBI police, demanded an urgent transfer, and told me to stay on a video call.",
    });
    const callHi = localizeCallResult(call, "hi");
    assert.match(callHi.number.explanation, /प्रारूप मान्य/);
    assert.ok(callHi.signals.every((signal) => /[\u0900-\u097F]/.test(signal.label)));
    assert.ok(callHi.nextSteps.every((step) => /[\u0900-\u097F]/.test(step)));
    assert.match(callHi.nextSteps.join(" "), /1930/);
    assert.match(callHi.nextSteps.join(" "), /Sanchar Saathi/);
    assert.match(callHi.notes.join(" "), /प्रतिष्ठा जाँच/);

    const threateningCall = localizeCallResult(
      analyzeSuspiciousCall({
        description:
          "He threatened to release private photos unless I paid immediately.",
      }),
      "hi"
    );
    assert.match(threateningCall.nextSteps.join(" "), /112/);

    const playbook = localizePlaybook(SAFETY_PLAYBOOKS[0]!, "hi");
    assert.match(playbook.title, /UPI/);
    assert.ok(playbook.immediateActions.every((item) => /[\u0900-\u097F]/.test(item)));
  });
});

describe("Phase 4 language persistence and state preservation", () => {
  it("normalizes, reads, and persists the Hindi language choice", () => {
    assert.equal(DEFAULT_LANGUAGE, "en");
    assert.equal(normalizeLanguage("hi"), "hi");
    assert.equal(normalizeLanguage("en"), "en");
    assert.equal(normalizeLanguage("fr"), "en");
    assert.equal(LANGUAGE_STORAGE_KEY, "satark_language");

    const original = Object.getOwnPropertyDescriptor(globalThis, "window");
    const store = new Map<string, string>();
    try {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {
          localStorage: {
            getItem: (key: string) => store.get(key) ?? null,
            setItem: (key: string, value: string) => store.set(key, value),
          },
        },
      });
      store.set(LANGUAGE_STORAGE_KEY, "hi");
      assert.equal(safeReadLanguage(), "hi");
      persistLanguage("en");
      assert.equal(store.get(LANGUAGE_STORAGE_KEY), "en");
      Object.defineProperty(globalThis.window, "localStorage", {
        configurable: true,
        value: {
          getItem: () => {
            throw new Error("blocked");
          },
          setItem: () => {
            throw new Error("blocked");
          },
        },
      });
      assert.equal(safeReadLanguage(), null);
      assert.doesNotThrow(() => persistLanguage("hi"));
    } finally {
      if (original) Object.defineProperty(globalThis, "window", original);
      else delete (globalThis as { window?: unknown }).window;
    }
  });

  it("keeps scanner result objects unchanged when rendering the other language", () => {
    const report = getDemoUrlReport("https://example.com/");
    assert.ok(report);
    const snapshot = JSON.stringify(report);
    const localized = localizeUrlReport(report, "hi");
    assert.equal(JSON.stringify(report), snapshot);
    assert.notEqual(localized.verdictLabel, report.verdict);
    assert.equal(report.submittedUrl, "https://example.com/");

    const enHtml = renderWithLanguage(
      React.createElement(UrlResultCard, { report }),
      "en"
    );
    const hiHtml = renderWithLanguage(
      React.createElement(UrlResultCard, { report }),
      "hi"
    );
    for (const html of [enHtml, hiHtml]) {
      assert.match(html, /https:\/\/example\.com\//);
      assert.match(html, /Google Safe Browsing/);
      assert.match(html, /URLhaus/);
    }
  });

  it("does not key or remount scanner trees on language changes", () => {
    const files = [
      "../src/components/MessageScanner.tsx",
      "../src/components/Phase2Scanner.tsx",
      "../src/components/help/HelpHub.tsx",
      "../src/components/help/EvidencePdfBuilder.tsx",
    ];
    for (const file of files) {
      const source = readFileSync(new URL(file, import.meta.url), "utf8");
      assert.doesNotMatch(source, /key=\{[^}]*language[^}]*\}/);
      assert.doesNotMatch(source, /window\.location\.reload/);
    }
  });
});

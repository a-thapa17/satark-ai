import { describe, it } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UrlResultCard } from "../src/components/phase2/UrlResultCard.tsx";
import { UpiResultCard } from "../src/components/phase2/UpiResultCard.tsx";
import { getDemoUrlReport } from "../src/lib/url/demo.ts";
import type { UpiPaymentDetails } from "../src/lib/qr/upi.ts";

function renderUrlReport(url: string): string {
  const report = getDemoUrlReport(url);
  assert.ok(report, `demo report for ${url} should exist`);
  return renderToStaticMarkup(React.createElement(UrlResultCard, { report }));
}

describe("Phase 2 URL result card rendering", () => {
  it("renders a confirmed malicious result with threat-check evidence", () => {
    const html = renderUrlReport("https://malware-demo.satark.example/download");
    assert.match(html, /Malicious \(confirmed\)/);
    assert.match(html, /Threat match/);
    assert.match(html, /Google Safe Browsing/);
    assert.match(html, /URLhaus/);
    assert.match(html, /SOCIAL_ENGINEERING/);
    assert.match(html, /Demo data/);
  });

  it("renders a clean result without claiming a guarantee", () => {
    const html = renderUrlReport("https://example.com/");
    assert.match(html, /No known threat/);
    assert.match(html, /not a guarantee/i);
    assert.match(html, /RDAP/);
    assert.match(html, /Registration data retrieved/);
  });

  it("renders suspicious warnings, redirect details, and safe next steps", () => {
    const html = renderUrlReport("https://onlinesbi-kyc-portal.secure-banking-support.in/login");
    assert.match(html, /Suspicious/);
    assert.match(html, /Possible impersonation of a trusted financial brand/);
    assert.match(html, /Domain was registered very recently/);
    assert.match(html, /Redirect chain/);
    assert.match(html, /Safe next steps/);
    assert.match(html, /1930/);
  });

  it("renders unavailable services as unavailable, not clean", () => {
    const report = getDemoUrlReport("https://example.com/");
    assert.ok(report);
    report.threats.safeBrowsing = {
      ...report.threats.safeBrowsing,
      status: "not_configured",
      message: "Google Safe Browsing is not configured.",
      matches: [],
    };
    report.threats.urlhaus = {
      ...report.threats.urlhaus,
      status: "unavailable",
      message: "URLhaus is unavailable.",
      matches: [],
    };
    const html = renderToStaticMarkup(React.createElement(UrlResultCard, { report }));
    assert.match(html, /Not configured/);
    assert.match(html, /Unavailable/);
    assert.match(html, /are not clean results/i);
  });

  it("renders a blocked redirect warning", () => {
    const report = getDemoUrlReport("https://example.com/");
    assert.ok(report);
    report.verdict = "SUSPICIOUS";
    report.blocked = {
      url: "http://169.254.169.254/latest/meta-data",
      reason: "The hostname resolves to a private or reserved network address.",
    };
    report.warnings = [
      {
        id: "BLOCKED_REDIRECT",
        severity: "CRITICAL",
        label: "Redirect was blocked by SSRF protection",
        explanation: "The private redirect was not requested.",
      },
    ];
    const html = renderToStaticMarkup(React.createElement(UrlResultCard, { report }));
    assert.match(html, /Blocked by SSRF protection/);
    assert.match(html, /No request was sent to the blocked destination/);
    assert.match(html, /CRITICAL/);
  });

  it("renders URLs as inert text rather than clickable links", () => {
    const html = renderUrlReport("https://malware-demo.satark.example/download");
    assert.doesNotMatch(html, /<a\b/);
    assert.match(html, /https:\/\/malware-demo\.satark\.example\/download/);
  });
});

describe("Phase 2 UPI result card rendering", () => {
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

  it("renders payee, UPI ID, amount, currency, and note", () => {
    const html = renderToStaticMarkup(React.createElement(UpiResultCard, { payment }));
    assert.match(html, /Demo Merchant/);
    assert.match(html, /demo\.merchant@upi/);
    assert.match(html, /499\.00/);
    assert.match(html, /INR/);
    assert.match(html, /Demo order/);
  });

  it("states that parsed data is not proof of trust and no payment is initiated", () => {
    const html = renderToStaticMarkup(React.createElement(UpiResultCard, { payment }));
    assert.match(html, /never initiates a payment/i);
    assert.match(html, /do not prove the payee is trustworthy/i);
    assert.match(html, /Parsing warnings/);
    assert.doesNotMatch(html, /<a\b/);
    assert.doesNotMatch(html, /<button\b/);
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  MessageScannerEngine,
} from "../src/lib/scanner/engine.ts";
import { maskSensitiveData } from "../src/lib/scanner/masking.ts";
import { buildEvidenceReport, parseEvidenceRequest } from "../src/lib/help/evidence.ts";
import { classifyQrContent } from "../src/lib/qr/classify.ts";
import { parseUpiUri } from "../src/lib/qr/upi.ts";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

describe("Phase 5 message-scanner safety validation", () => {
  it("handles benign, suspicious, scam-like, malformed, and empty messages", () => {
    const benign = MessageScannerEngine.analyze(
      "Hi Meera, I will bring the printed notes to college tomorrow at 4 PM."
    );
    assert.equal(benign.verdict, "NO_STRONG_WARNING");

    const suspicious = MessageScannerEngine.analyze(
      "Your parcel delivery is pending. Pay a small address update fee at http://tinyurl.com/deliv-update now."
    );
    assert.ok(
      suspicious.verdict === "SUSPICIOUS" || suspicious.verdict === "HIGH_RISK"
    );

    const scam = MessageScannerEngine.analyze(
      "Your SBI account will be blocked immediately. Share the 6-digit OTP sent to your mobile now."
    );
    assert.equal(scam.verdict, "HIGH_RISK");
    assert.ok(scam.signals.length > 0);

    assert.doesNotThrow(() =>
      MessageScannerEngine.analyze("!!! ... ??? \u0000 \uFFFD")
    );
    assert.throws(() => MessageScannerEngine.analyze("   "), /cannot be empty/i);
  });

  it("masks formatted and unformatted Aadhaar before AI transmission", () => {
    const raw =
      "Aadhaar 234567890123 and another 2345 6789 0123. Email me@example.com or call +91 98765 43210.";
    const masked = maskSensitiveData(raw);
    assert.ok(!masked.maskedText.includes("234567890123"));
    assert.ok(!masked.maskedText.includes("2345 6789 0123"));
    assert.ok(!masked.maskedText.includes("me@example.com"));
    assert.ok(!masked.maskedText.includes("+91 98765 43210"));
    assert.match(masked.maskedText, /\[MASKED_AADHAAR\]/);
    assert.match(masked.maskedText, /\[MASKED_EMAIL\]/);
    assert.match(masked.maskedText, /\[MASKED_PHONE\]/);
  });

  it("includes only the masked message in the scanner report sent to the AI route", () => {
    const report = MessageScannerEngine.analyze(
      "Your card 4111 1111 1111 1111 has an OTP 482913. Verify at fake-bank.example with PAN ABCDE1234F."
    );
    for (const secret of [
      "4111 1111 1111 1111",
      "482913",
      "ABCDE1234F",
    ]) {
      assert.ok(!report.maskedInput.includes(secret), `leaked: ${secret}`);
    }
    assert.match(report.maskedInput, /\[MASKED_CARD_NUMBER\]/);
    assert.match(report.maskedInput, /\[MASKED_OTP\]/);
    assert.match(report.maskedInput, /\[MASKED_PAN\]/);
  });
});

describe("Phase 5 QR and URL safety validation", () => {
  it("classifies URLs and UPI QR content as inert data, not actions", () => {
    const url = classifyQrContent("https://example.com/login");
    assert.equal(url.kind, "url");
    assert.equal(url.kind === "url" ? url.url : "", "https://example.com/login");

    const upi = parseUpiUri(
      "upi://pay?pa=demo.merchant@upi&pn=Demo%20Merchant&am=499.00&cu=INR"
    );
    assert.equal(upi.kind, "payment");
    assert.equal(
      upi.kind === "payment" ? upi.payment.upiId : "",
      "demo.merchant@upi"
    );
    assert.equal(
      upi.kind === "payment" ? upi.payment.amountValue : 0,
      499
    );

    const scanner = source("../src/components/Phase2Scanner.tsx");
    const urlCard = source("../src/components/phase2/UrlResultCard.tsx");
    for (const text of [scanner, urlCard]) {
      assert.doesNotMatch(text, /window\.open\s*\(/);
      assert.doesNotMatch(text, /location\.(?:assign|replace)\s*\(/);
    }
  });
});

describe("Phase 5 evidence-PDF secret handling", () => {
  it("redacts labelled unformatted Aadhaar and never includes pasted secrets", () => {
    const report = buildEvidenceReport(
      parseEvidenceRequest({
        incidentType: "financial_fraud",
        description:
          "Aadhaar 234567890123. The caller asked for OTP 482913, password: NeverShare1, " +
          "token: supersecrettoken123, card 4111 1111 1111 1111, and PAN ABCDE1234F.",
        transactionRef: "UTR-445566778899",
      }),
      new Date("2026-10-26T10:00:00.000Z")
    );
    for (const secret of [
      "234567890123",
      "482913",
      "NeverShare1",
      "supersecrettoken123",
      "4111 1111 1111 1111",
      "ABCDE1234F",
    ]) {
      assert.ok(!report.content.includes(secret), `PDF report leaked: ${secret}`);
    }
    assert.match(report.content, /\[REDACTED/);
    assert.match(report.content, /UTR-445566778899/);
    assert.match(report.content, /Recovery of money is not guaranteed/);
    assert.match(report.content, /does not contact a bank, police station, platform, or authority/);
  });
});

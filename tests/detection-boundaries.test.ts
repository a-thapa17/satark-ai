import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MessageScannerEngine } from "../src/lib/scanner/engine.ts";

const legitimateAadhaarMessages = [
  "UIDAI: Your Aadhaar has been successfully linked to your mobile number. For help, call 1947 or visit uidai.gov.in.",
  "Your Aadhaar e-KYC verification is pending. Complete it at your nearest bank branch or uidai.gov.in.",
  "Aadhaar KYC update is mandatory. Visit an authorised UIDAI centre or use the mAadhaar app. Do not share OTP with anyone.",
  "Update your Aadhaar KYC through the official UIDAI portal or an authorised Aadhaar centre. Never share your Aadhaar OTP with anyone.",
  "Complete your Aadhaar KYC at an authorised UIDAI centre. Keep your Aadhaar number and OTP private.",
  "UIDAI never asks for your Aadhaar OTP or PIN. Update your KYC only at uidai.gov.in or an authorised centre.",
  "KYC pending. Visit your bank branch.",
];

describe("Satark AI — Aadhaar onboarding and ambiguous-message boundaries", () => {
  legitimateAadhaarMessages.forEach((message, index) => {
    it(`does not flag legitimate Aadhaar onboarding message ${index + 1}`, () => {
      const report = MessageScannerEngine.analyze(message);
      assert.equal(report.verdict, "NO_STRONG_WARNING");
      assert.equal(report.confidence, "Low");
      assert.equal(report.signals.length, 0);
    });
  });

  it("keeps a bare KYC status without a channel or threat at low risk", () => {
    const report = MessageScannerEngine.analyze("Your KYC is pending. Update now.");
    assert.equal(report.verdict, "NO_STRONG_WARNING");
    assert.equal(report.signals.length, 0);
  });

  it("flags an ambiguous KYC notice that supplies only an unofficial mobile number", () => {
    const report = MessageScannerEngine.analyze(
      "KYC pending. Call 9876543210 to complete verification."
    );
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.ok(report.signals.some((signal) => signal.id === "IMP_FAKE_KYC"));
  });

  it("keeps a genuine KYC phishing link high risk", () => {
    const report = MessageScannerEngine.analyze(
      "Your KYC is suspended. Update immediately at http://bit.ly/kyc"
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((signal) => signal.id === "IMP_FAKE_KYC"));
    assert.ok(report.signals.some((signal) => signal.id === "LINK_SHORTENER"));
  });

  it("does not trust a UIDAI-looking lookalike hostname", () => {
    const report = MessageScannerEngine.analyze(
      "Your Aadhaar e-KYC is pending. Complete verification at https://uidai-kyc-verify.top/login"
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((signal) => signal.id === "IMP_FAKE_KYC"));
    assert.ok(report.signals.some((signal) => signal.id === "LINK_LOOKALIKE_DOMAIN"));
  });

  it("does not treat an official-domain lookalike as official onboarding", () => {
    const report = MessageScannerEngine.analyze(
      "Your Aadhaar KYC is pending. Update at https://uidai.gov.in.evil.example/login"
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((signal) => signal.id === "IMP_FAKE_KYC"));
    assert.ok(report.signals.some((signal) => signal.id === "LINK_LOOKALIKE_DOMAIN"));
  });
});

describe("Satark AI — core detection regressions after Aadhaar tuning", () => {
  it("still detects OTP theft", () => {
    const report = MessageScannerEngine.analyze(
      "Dear SBI customer, your account will be blocked in 10 minutes. Share the 6-digit OTP sent to your mobile to unblock it."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((signal) => signal.id === "CRED_SOLICIT_ACTIVE"));
  });

  it("still detects a fake refund with an upfront fee", () => {
    const report = MessageScannerEngine.analyze(
      "Congratulations! Your income tax refund of Rs 15,500 is pending. Pay a processing fee of Rs 499 at https://refund-help.top/claim to release it."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((signal) => signal.id === "CTX_REFUND_WITH_FEE"));
  });

  it("still detects a fraudulent job offer", () => {
    const report = MessageScannerEngine.analyze(
      "Earn Rs 5,000 per day liking YouTube videos. Pay Rs 499 to unlock your task account on Telegram."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((signal) => signal.category === "JOB_PRIZE_SCAM"));
  });

  it("still detects bank impersonation", () => {
    const report = MessageScannerEngine.analyze(
      "This is the HDFC fraud department. Your netbanking will be suspended unless you verify your login password immediately."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(
      report.signals.some(
        (signal) => signal.id === "IMP_BANK_IMPERSONATION" || signal.id === "CRED_VERIFY_CREDENTIALS"
      )
    );
  });

  it("still detects a government impersonation demand", () => {
    const report = MessageScannerEngine.analyze(
      "CBI notice: a case has been filed against you. Transfer money to a safe account now or you will be arrested."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(
      report.signals.some(
        (signal) =>
          signal.id === "CRED_SOLICIT_ACTIVE" ||
          signal.id === "URG_LEGAL_ARREST_EXTORTION" ||
          signal.category === "ENTITY_IMPERSONATION"
      )
    );
  });

  it("leaves an ordinary bank-branch reminder without an actionable risk low", () => {
    const report = MessageScannerEngine.analyze(
      "Please update your address with the bank branch when you visit next week."
    );
    assert.equal(report.verdict, "NO_STRONG_WARNING");
    assert.equal(report.signals.length, 0);
  });
});

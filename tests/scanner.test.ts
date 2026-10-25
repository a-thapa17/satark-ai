import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MessageScannerEngine } from "../src/lib/scanner/engine.ts";
import { maskSensitiveData } from "../src/lib/scanner/masking.ts";

describe("Satark AI — Phase 1 Deterministic Message Scanner Test Suite", () => {
  // Category 1: Clearly suspicious OTP or credential solicitation
  it("Category 1: Should flag explicit OTP solicitation with urgency as HIGH_RISK", () => {
    const message =
      "Dear customer, your bank services will be suspended immediately. Please share the 6-digit OTP sent to your mobile to verify.";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.score >= 80, "Score should be high for credential solicitation");
    assert.ok(
      report.signals.some((s) => s.category === "CREDENTIAL_SOLICITATION"),
      "Should detect credential solicitation"
    );
    assert.ok(
      report.safeNextSteps.some((step) => step.toLowerCase().includes("never share")),
      "Should advise never to share OTP"
    );
  });

  // Category 2: Urgent fake KYC or account-blocking message
  it("Category 2: Should flag fake KYC account blocking with shortened link as HIGH_RISK", () => {
    const message =
      "Dear SBI customer, your account will be blocked in 10 minutes due to expired KYC. Update urgently: https://bit.ly/sbi-kyc-verify";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(
      report.signals.some((s) => s.id === "IMP_FAKE_KYC" || s.category === "ENTITY_IMPERSONATION")
    );
    assert.ok(
      report.signals.some((s) => s.category === "URGENCY_COERCION"),
      "Should detect artificial urgency"
    );
    assert.ok(
      report.signals.some((s) => s.category === "SUSPICIOUS_LINK"),
      "Should detect bit.ly shortener"
    );
  });

  // Category 3: Suspicious payment or UPI request
  it("Category 3: Should flag UPI 'enter PIN to receive' trap as HIGH_RISK", () => {
    const message =
      "Congratulations! Electricity board refund approved. Scan QR code and enter UPI PIN to receive Rs 4500 into your account.";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(
      report.signals.some((s) => s.id === "PAY_RECEIVE_REQUIRES_PIN"),
      "Should flag UPI receive PIN rule"
    );
    assert.ok(
      report.safeNextSteps.some((s) => s.includes("transfers money OUT")),
      "Should explain UPI debit mechanism"
    );
  });

  // Category 4: Message containing a suspicious link
  it("Category 4: Should flag message with suspicious URL shortener as SUSPICIOUS or HIGH_RISK", () => {
    const message =
      "Your parcel delivery has a pending address update fee. Please check http://tinyurl.com/deliv-update to confirm.";
    const report = MessageScannerEngine.analyze(message);

    assert.ok(
      report.verdict === "SUSPICIOUS" || report.verdict === "HIGH_RISK",
      `Expected SUSPICIOUS or HIGH_RISK, got ${report.verdict}`
    );
    assert.ok(report.signals.some((s) => s.category === "SUSPICIOUS_LINK"));
  });

  // Category 5: Lottery or prize scam
  it("Category 5: Should flag KBC lucky draw lottery as HIGH_RISK", () => {
    const message =
      "Dear customer, you have won Rs 25,00,000 in Kaun Banega Crorepati KBC lucky draw! Deposit Rs 5000 processing fee to claim your prize.";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.signals.some((s) => s.category === "JOB_PRIZE_SCAM"));
  });

  // Category 6: Job or task scam
  it("Category 6: Should flag part-time YouTube like / Telegram task scam", () => {
    const message =
      "Work from home part-time job: Earn Rs 3000-5000 daily by simply like and subscribe YouTube videos. Join our Telegram group now.";
    const report = MessageScannerEngine.analyze(message);

    assert.ok(
      report.verdict === "HIGH_RISK" || report.verdict === "SUSPICIOUS",
      `Expected high or suspicious for task scam, got ${report.verdict}`
    );
    assert.ok(report.signals.some((s) => s.id === "JOB_TASK_TELEGRAM"));
  });

  // Category 7: Normal harmless message
  it("Category 7: Should classify normal personal communication as NO_STRONG_WARNING", () => {
    const message =
      "Hey Priya, are we still meeting for lunch at 1 PM today near the office cafeteria? Let me know!";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "NO_STRONG_WARNING");
    assert.equal(report.score, 0);
    assert.equal(report.signals.length, 0);
  });

  // Category 8: Ambiguous / Benign transaction or OTP delivery (False Positive Prevention)
  it("Category 8a: Should NOT falsely flag legitimate bank OTP delivery containing security warning", () => {
    const message =
      "492019 is your OTP for login to your HDFC Netbanking account. Valid for 10 mins. Bank never asks for your OTP. Do not share your OTP with anyone.";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(
      report.verdict,
      "NO_STRONG_WARNING",
      `Legitimate bank OTP delivery should be NO_STRONG_WARNING, got ${report.verdict}`
    );
    assert.ok(
      report.defensiveSignals.some((s) => s.id === "DEF_DO_NOT_SHARE"),
      "Should recognize defensive warning"
    );
  });

  it("Category 8b: Should NOT flag standard bank debit transactional SMS", () => {
    const message =
      "Rs 1,250.00 debited from A/c XX4819 on 22-OCT-26 at ATM-SBI. Avail Bal Rs 18,400.00. SMS BLOCK to 567676 if not done by you.";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(
      report.verdict,
      "NO_STRONG_WARNING",
      `Normal bank debit notice should be NO_STRONG_WARNING, got ${report.verdict}`
    );
    assert.ok(
      report.defensiveSignals.some((s) => s.id === "DEF_STANDARD_BANK_UPDATE"),
      "Should identify normal transaction format"
    );
  });

  // Category 9: Empty input validation
  it("Category 9: Should throw graceful validation error on empty or whitespace input", () => {
    assert.throws(() => MessageScannerEngine.analyze(""), /Input message cannot be empty/i);
    assert.throws(
      () => MessageScannerEngine.analyze("    \n\t   "),
      /Input message cannot be empty/i
    );
  });

  // Category 10: Long input boundary and malformed text handling
  it("Category 10a: Should reject messages exceeding 2,000 characters", () => {
    const oversized = "A".repeat(2001);
    assert.throws(() => MessageScannerEngine.analyze(oversized), /2000 character limit/i);
  });

  it("Category 10b: Should sanitize PII numbers without throwing errors on malformed text", () => {
    const raw =
      "Payment card 4111 2222 3333 4444 and Aadhaar 2345 6789 0123 with PAN ABCDE1234F. Contact customer care.";
    const masked = maskSensitiveData(raw);

    assert.ok(masked.maskedText.includes("[MASKED_CARD_NUMBER]"));
    assert.ok(masked.maskedText.includes("[MASKED_AADHAAR]"));
    assert.ok(masked.maskedText.includes("[MASKED_PAN]"));
    assert.equal(masked.maskedItemsCount, 3);
  });
});

function assertVerdictScoreAgree(report: { verdict: string; score: number }) {
  if (report.verdict === "NO_STRONG_WARNING") {
    assert.ok(report.score < 25, `NO_STRONG_WARNING must have score < 25, got ${report.score}`);
  } else if (report.verdict === "SUSPICIOUS") {
    assert.ok(report.score >= 25, `SUSPICIOUS must have score >= 25, got ${report.score}`);
  } else {
    assert.ok(report.score >= 60, `HIGH_RISK must have score >= 60, got ${report.score}`);
  }
}

describe("Satark AI — Contextual combination rules and scoring consistency", () => {
  it("Free iPhone prize+link example is SUSPICIOUS with a non-zero heuristic score", () => {
    const message = "Claim ur free Iphone X through the link http://freeiphone.com";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "SUSPICIOUS");
    assertVerdictScoreAgree(report);
    assert.ok(report.signals.some((s) => s.id === "CTX_PRIZE_LURE_WITH_LINK"));
    assert.ok(
      report.signals.some((s) => /not confirmation that the domain is malicious/i.test(s.explanation))
    );
    assert.ok(!/confirmed malicious/i.test(report.summary));
    assert.ok(report.reasons.length > 0);
    assert.ok(!report.reasons.some((r) => /no typical scam indicators were detected/i.test(r)));
    assert.match(report.limitationsDisclaimer, /reputation[\s\S]*not checked/i);
  });

  it("Overall verdict, score, and findings stay consistent", () => {
    const samples = [
      "Hey Priya, are we still meeting for lunch at 1 PM today near the office cafeteria?",
      "Claim ur free Iphone X through the link http://freeiphone.com",
      "Work from home! Earn Rs 80000 per month. Pay Rs 2500 registration fee to start.",
      "Dear customer, your bank services will be suspended immediately. Please share the 6-digit OTP sent to your mobile to verify.",
    ];
    for (const message of samples) {
      const report = MessageScannerEngine.analyze(message);
      assertVerdictScoreAgree(report);
      if (report.verdict === "NO_STRONG_WARNING") {
        assert.equal(report.signals.length, 0);
      } else {
        assert.ok(report.signals.length > 0);
        assert.ok(report.score === report.deterministicScore);
        assert.ok(report.verdict === report.deterministicVerdict);
      }
    }
  });

  it("Benign personal message remains NO_STRONG_WARNING", () => {
    const report = MessageScannerEngine.analyze(
      "Hey Priya, are we still meeting for lunch at 1 PM today near the office cafeteria? Let me know!"
    );
    assert.equal(report.verdict, "NO_STRONG_WARNING");
    assert.equal(report.score, 0);
    assert.equal(report.signals.length, 0);
    assert.match(report.reasons.join(" "), /Rule-based analysis found no typical keyword/i);
  });

  it("Ordinary personal message with a normal URL is not automatically a scam", () => {
    const report = MessageScannerEngine.analyze(
      "Hey, here is the restaurant menu we picked: https://example.com/lunch-menu. See you at 8."
    );
    assert.equal(report.verdict, "NO_STRONG_WARNING");
    assert.ok(report.score < 25);
    assert.equal(report.signals.length, 0);
    assert.match(report.limitationsDisclaimer, /not checked/i);
  });

  it("Reward offer combined with a link is flagged as a lure, not a confirmed malicious host", () => {
    const report = MessageScannerEngine.analyze(
      "Congratulations you have won a free gift card. Claim it here https://rewards.example.org/claim"
    );
    assert.equal(report.verdict, "SUSPICIOUS");
    assertVerdictScoreAgree(report);
    assert.ok(report.signals.some((s) => s.id === "CTX_PRIZE_LURE_WITH_LINK"));
    assert.ok(report.signals.every((s) => !/confirmed malicious/i.test(s.explanation)));
  });

  it("High promised job earnings plus an upfront fee is HIGH_RISK", () => {
    const report = MessageScannerEngine.analyze(
      "Work from home! Earn Rs 80000 per month. Pay Rs 2500 registration fee to start."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assertVerdictScoreAgree(report);
    assert.ok(report.signals.some((s) => s.id === "CTX_JOB_EARNINGS_WITH_UPFRONT_FEE"));
  });

  it("OTP plus account-suspension pressure remains HIGH_RISK", () => {
    const report = MessageScannerEngine.analyze(
      "Dear customer, your bank services will be suspended immediately. Please share the 6-digit OTP sent to your mobile to verify."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assertVerdictScoreAgree(report);
    assert.ok(report.signals.some((s) => s.category === "CREDENTIAL_SOLICITATION"));
  });

  it("A free offer alone or a URL alone does not prove a scam", () => {
    const freeOnly = MessageScannerEngine.analyze(
      "The cafe gave me a free coffee today, it was surprisingly good."
    );
    assert.equal(freeOnly.verdict, "NO_STRONG_WARNING");
    assert.equal(freeOnly.signals.length, 0);

    const urlOnly = MessageScannerEngine.analyze(
      "Docs are on https://docs.example.com/project if you want to read them later."
    );
    assert.equal(urlOnly.verdict, "NO_STRONG_WARNING");
    assert.equal(urlOnly.signals.length, 0);
  });
});

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { MessageScannerEngine } from "../src/lib/scanner/engine.ts";
import { maskSensitiveData } from "../src/lib/scanner/masking.ts";
import { POST } from "../src/app/api/scan-ai/route.ts";
import type { AiAnalysisReport, ScanReport } from "../src/lib/scanner/types.ts";

describe("Satark AI — Phase 1.5 Context-Aware AI Scam Analysis Test Suite", () => {
  const originalEnv = { ...process.env };
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  // Test 1: Rules-only analysis works when no Gemini key exists
  it("Test 1: Rules-only analysis completes successfully without GEMINI_API_KEY", () => {
    delete process.env.GEMINI_API_KEY;
    const message =
      "Dear SBI customer, your account will be blocked in 10 minutes due to expired KYC. Update urgently: https://bit.ly/sbi-kyc-verify";
    const report = MessageScannerEngine.analyze(message);

    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.score >= 80);
    assert.equal(report.aiAnalysis, undefined);
  });

  // Test 2: AI is never called when user has not opted in
  it("Test 2: Route handler strictly rejects requests without explicit user consent", async () => {
    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Please send OTP",
        userConsent: false, // Opt-in false
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 403);
    assert.equal(data.code, "CONSENT_REQUIRED");
  });

  // Test 3: The API receives only redacted message text
  it("Test 3: PII Masking utility thoroughly redacts phone numbers, emails, OTPs, cards, PAN, Aadhaar", () => {
    const raw =
      "Contact support@sbi-alert.com or call +91 98765 43210. Your OTP 849201 for card 4111 2222 3333 4444, Aadhaar 2345 6789 0123, PAN ABCDE1234F.";
    const result = maskSensitiveData(raw);

    assert.ok(!result.maskedText.includes("support@sbi-alert.com"), "Email should be masked");
    assert.ok(!result.maskedText.includes("98765 43210"), "Phone should be masked");
    assert.ok(!result.maskedText.includes("849201"), "OTP should be masked");
    assert.ok(!result.maskedText.includes("4111 2222 3333 4444"), "Card should be masked");
    assert.ok(!result.maskedText.includes("2345 6789 0123"), "Aadhaar should be masked");
    assert.ok(!result.maskedText.includes("ABCDE1234F"), "PAN should be masked");

    assert.ok(result.maskedText.includes("[MASKED_EMAIL]"));
    assert.ok(result.maskedText.includes("[MASKED_PHONE]"));
    assert.ok(result.maskedText.includes("[MASKED_OTP]"));
    assert.ok(result.maskedText.includes("[MASKED_CARD_NUMBER]"));
    assert.ok(result.maskedText.includes("[MASKED_AADHAAR]"));
    assert.ok(result.maskedText.includes("[MASKED_PAN]"));
  });

  // Test 4: AI explanation changes appropriately for different message contexts
  it("Test 4: Merged reports maintain context-specific AI summaries and categories", () => {
    const baseReport = MessageScannerEngine.analyze(
      "Work from home part-time job: Earn Rs 3000-5000 daily by simply liking YouTube videos."
    );

    const taskAiReport: AiAnalysisReport = {
      category: "job_task_scam",
      riskAssessment: "high_risk",
      summary: "This message lures the recipient with unrealistic pay for minimal social media tasks.",
      evidence: [
        {
          phrase: "Earn Rs 3000-5000 daily",
          reason: "Unrealistic earnings lure typical of prepaid task scams",
        },
      ],
      manipulationTactics: ["greed", "unrealistic_earnings"],
      recommendedActions: ["Never pay deposit fees to unlock tasks."],
      uncertainties: ["Telegram group link not directly inspected."],
    };

    const combined = MessageScannerEngine.combineWithAi(baseReport, taskAiReport);

    assert.equal(combined.aiAnalysis?.category, "job_task_scam");
    assert.ok(combined.aiAnalysis?.summary.includes("unrealistic pay"));
    assert.equal(combined.aiAnalysis?.evidence[0].phrase, "Earn Rs 3000-5000 daily");
  });

  // Test 5: Ordinary messages are not automatically classified as scams
  it("Test 5: Ordinary benign communication combined with benign AI assessment remains NO_STRONG_WARNING", () => {
    const raw = "Hi Rahul, I will bring the DBMS notes to college tomorrow afternoon.";
    const ruleReport = MessageScannerEngine.analyze(raw);

    const benignAiReport: AiAnalysisReport = {
      category: "benign_communication",
      riskAssessment: "no_strong_warning",
      summary: "The message is a routine personal note about college study materials with no coercive or financial demands.",
      evidence: [],
      manipulationTactics: [],
      recommendedActions: ["No immediate safety precautions needed."],
      uncertainties: ["Identity of sender cannot be independently verified from text."],
    };

    const combined = MessageScannerEngine.combineWithAi(ruleReport, benignAiReport);

    assert.equal(combined.verdict, "NO_STRONG_WARNING");
    assert.equal(combined.aiAnalysis?.disagreementWithRules, false);
    assert.equal(combined.aiAnalysis?.evidence.length, 0);
  });

  // Test 6: Strong deterministic warnings cannot be downgraded by the AI
  it("Test 6: AI low_risk assessment cannot downgrade a confirmed deterministic HIGH_RISK warning", () => {
    const ruleReport = MessageScannerEngine.analyze(
      "Dear customer, your SBI services will be suspended immediately. Share the 6-digit OTP sent to your mobile."
    );
    assert.equal(ruleReport.verdict, "HIGH_RISK");

    // Hypothetical faulty or adversarial AI output claiming safe
    const faultyAiReport: AiAnalysisReport = {
      category: "benign_communication",
      riskAssessment: "no_strong_warning",
      summary: "The AI incorrectly believed this was a routine notification.",
      evidence: [],
      manipulationTactics: [],
      recommendedActions: [],
      uncertainties: [],
    };

    const combined = MessageScannerEngine.combineWithAi(ruleReport, faultyAiReport);

    // Rule verdict MUST remain HIGH_RISK
    assert.equal(combined.verdict, "HIGH_RISK");
    assert.equal(combined.aiAnalysis?.disagreementWithRules, true);
    assert.ok(
      combined.aiAnalysis?.disagreementExplanation?.includes("higher deterministic warning is preserved")
    );
  });

  // Test 7: AI/rules disagreement is handled correctly and transparently
  it("Test 7: Disagreement flags and explanations are clearly populated", () => {
    const ruleReport = MessageScannerEngine.analyze(
      "492019 is your OTP for login to your HDFC account. Do not share your OTP with anyone."
    );
    assert.equal(ruleReport.verdict, "NO_STRONG_WARNING");

    // AI flags nuanced suspicion
    const suspiciousAiReport: AiAnalysisReport = {
      category: "otp_theft",
      riskAssessment: "high_risk",
      summary: "AI flagged potential credential harvesting risk.",
      evidence: [{ phrase: "OTP", reason: "Mentions OTP code" }],
      manipulationTactics: ["urgency"],
      recommendedActions: ["Do not disclose verification code."],
      uncertainties: [],
    };

    const combined = MessageScannerEngine.combineWithAi(ruleReport, suspiciousAiReport);

    assert.equal(combined.verdict, "SUSPICIOUS");
    assert.equal(combined.aiAnalysis?.disagreementWithRules, true);
    assert.ok(combined.aiAnalysis?.disagreementExplanation?.includes("AI security analysis identified"));
  });

  // Test 8: Malformed JSON or invalid AI fields are rejected gracefully by route
  it("Test 8: Route gracefully handles malformed candidate JSON from AI provider", async () => {
    process.env.GEMINI_API_KEY = "test_key_mock";

    // Mock fetch returning malformed unparseable text
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: "NOT_JSON_BODY {{" }] } }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Suspicious text",
        userConsent: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, false);
    assert.equal(data.code, "INVALID_JSON");
  });

  // Test 9: API timeouts fall back gracefully
  it("Test 9: Timeout in AI call returns TIMEOUT error code for client fallback", async () => {
    process.env.GEMINI_API_KEY = "test_key_mock";

    globalThis.fetch = async () => {
      const error = new Error("The operation was aborted due to timeout");
      error.name = "TimeoutError";
      throw error;
    };

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Please verify KYC",
        userConsent: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, false);
    assert.equal(data.code, "TIMEOUT");
  });

  // Test 10: Quota errors produce useful messages
  it("Test 10: Quota HTTP 429 response is translated to user-friendly QUOTA_EXHAUSTED code", async () => {
    process.env.GEMINI_API_KEY = "test_key_mock";

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: { message: "Resource has been exhausted" } }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Please verify KYC",
        userConsent: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, false);
    assert.equal(data.code, "QUOTA_EXHAUSTED");
    assert.ok(data.message.includes("quota"));
  });

  // Test 11: Missing environment variables do not break the application
  it("Test 11: Missing GEMINI_API_KEY returns KEY_NOT_CONFIGURED with fallback signal", async () => {
    delete process.env.GEMINI_API_KEY;

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Suspicious message to test",
        userConsent: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, false);
    assert.equal(data.code, "KEY_NOT_CONFIGURED");
  });

  // Test 12: Long or invalid input is rejected
  it("Test 12: Messages exceeding 2,000 characters are rejected with TEXT_TOO_LONG", async () => {
    const oversized = "X".repeat(2001);

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: oversized,
        userConsent: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 400);
    assert.equal(data.code, "TEXT_TOO_LONG");
  });

  // Test 13: AI-generated content is sanitized and hallucinations filtered
  it("Test 13: Route validates that evidence phrases genuinely appear in user input", async () => {
    process.env.GEMINI_API_KEY = "test_key_mock";

    const aiOutputWithHallucinatedQuote = {
      category: "bank_impersonation",
      riskAssessment: "high_risk",
      summary: "Fake bank phishing alert.",
      evidence: [
        { phrase: "account suspended immediately", reason: "Legitimate phrase from text" },
        { phrase: "totally made up quotation not in text", reason: "Hallucinated evidence" },
      ],
      manipulationTactics: ["urgency"],
      recommendedActions: ["Do not reply."],
      uncertainties: [],
    };

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          candidates: [
            { content: { parts: [{ text: JSON.stringify(aiOutputWithHallucinatedQuote) }] } },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Dear user, your account suspended immediately due to KYC.",
        userConsent: true,
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    // Verified: The hallucinated phrase was filtered out because it did not exist in the submitted text!
    assert.equal(data.report.evidence.length, 1);
    assert.equal(data.report.evidence[0].phrase, "account suspended immediately");
  });

  // Test 14: Existing Phase 1 scanner tests still pass
  it("Test 14: Phase 1 deterministic rules engine core functionality is preserved", () => {
    const report = MessageScannerEngine.analyze(
      "Dear customer, you have won Rs 25,00,000 in Kaun Banega Crorepati KBC lucky draw! Deposit Rs 5000 processing fee to claim your prize."
    );
    assert.equal(report.verdict, "HIGH_RISK");
    assert.ok(report.score >= 80);
    assert.ok(report.signals.some((s) => s.category === "JOB_PRIZE_SCAM"));
  });

  it("Test 15: Free iPhone hybrid scan is consistent across verdict, score, and findings", () => {
    const message = "Claim ur free Iphone X through the link http://freeiphone.com";
    const ruleReport = MessageScannerEngine.analyze(message);
    assert.equal(ruleReport.verdict, "SUSPICIOUS");
    assert.ok(ruleReport.score >= 25);

    const aiReport: AiAnalysisReport = {
      category: "lottery_investment_scam",
      riskAssessment: "high_risk",
      summary: "Potential phishing/reward scam using an unsolicited free iPhone claim and a click-through link.",
      evidence: [
        { phrase: "free Iphone", reason: "Unsolicited valuable prize lure" },
        { phrase: "http://freeiphone.com", reason: "Click-through link; reputation not verified" },
      ],
      manipulationTactics: ["reward_lure"],
      recommendedActions: ["Do not click the unsolicited link."],
      uncertainties: ["Link reputation and destination were not verified."],
    };

    const combined = MessageScannerEngine.combineWithAi(ruleReport, aiReport);
    assert.equal(combined.verdict, "SUSPICIOUS");
    assert.ok(combined.score >= 25);
    assert.ok(combined.signals.some((s) => s.id === "CTX_PRIZE_LURE_WITH_LINK"));
    assert.equal(combined.deterministicVerdict, "SUSPICIOUS");
    assert.ok(combined.aiAnalysis?.summary.includes("reward scam"));
    assert.ok(!/no typical scam indicators were detected/i.test(combined.reasons.join(" ")));
  });

  it("Test 16: AI cannot downgrade hard deterministic HIGH_RISK (OTP/suspension)", () => {
    const ruleReport = MessageScannerEngine.analyze(
      "Dear customer, your bank services will be suspended immediately. Please share the 6-digit OTP sent to your mobile to verify."
    );
    assert.equal(ruleReport.verdict, "HIGH_RISK");

    const faultyAi: AiAnalysisReport = {
      category: "benign_communication",
      riskAssessment: "no_strong_warning",
      summary: "Looks like a bank notice.",
      evidence: [{ phrase: "OTP", reason: "Mentions OTP" }],
      manipulationTactics: [],
      recommendedActions: [],
      uncertainties: [],
    };

    const combined = MessageScannerEngine.combineWithAi(ruleReport, faultyAi);
    assert.equal(combined.verdict, "HIGH_RISK");
    assert.ok(combined.score >= 60);
    assert.equal(combined.deterministicVerdict, "HIGH_RISK");
    assert.equal(combined.aiAnalysis?.disagreementWithRules, true);
  });

  it("Test 17: AI/rules disagreement upgrades score so SUSPICIOUS is never 0/100", () => {
    const ruleReport = MessageScannerEngine.analyze(
      "Hi Rahul, I will bring the DBMS notes to college tomorrow afternoon."
    );
    assert.equal(ruleReport.verdict, "NO_STRONG_WARNING");
    assert.equal(ruleReport.score, 0);

    const suspiciousAi: AiAnalysisReport = {
      category: "phishing_credential_theft",
      riskAssessment: "high_risk",
      summary: "AI flagged contextual manipulation.",
      evidence: [{ phrase: "DBMS notes", reason: "Cited phrase from the message" }],
      manipulationTactics: ["unspecified"],
      recommendedActions: ["Verify the sender."],
      uncertainties: [],
    };

    const combined = MessageScannerEngine.combineWithAi(ruleReport, suspiciousAi);
    assert.equal(combined.verdict, "SUSPICIOUS");
    assert.ok(combined.score >= 25, `Expected score >= 25 after AI upgrade, got ${combined.score}`);
    assert.equal(combined.deterministicVerdict, "NO_STRONG_WARNING");
    assert.equal(combined.deterministicScore, 0);
    assert.equal(combined.aiAnalysis?.disagreementWithRules, true);
    assert.match(combined.reasons.join(" "), /Rule-based analysis found no typical keyword/i);
  });

  it("Test 18: Hallucinated evidence is rejected and cannot drive an upgrade", async () => {
    process.env.GEMINI_API_KEY = "test_key_mock";
    const submitted = "Hi, see you at the library after class.";

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      category: "phishing_credential_theft",
                      riskAssessment: "high_risk",
                      summary: "Invented phishing claim.",
                      evidence: [
                        { phrase: "send your OTP immediately", reason: "Hallucinated" },
                      ],
                      manipulationTactics: ["urgency"],
                      recommendedActions: ["Do not reply."],
                      uncertainties: [],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );

    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: submitted, userConsent: true }),
    });
    const res = await POST(req);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.report.evidence.length, 0);

    const ruleReport = MessageScannerEngine.analyze(submitted);
    const combined = MessageScannerEngine.combineWithAi(ruleReport, data.report);
    assert.equal(combined.verdict, "NO_STRONG_WARNING");
    assert.equal(combined.score, 0);
  });

  it("Test 19: Rules-only operation without an API key still analyzes the iPhone example", () => {
    delete process.env.GEMINI_API_KEY;
    const report = MessageScannerEngine.analyze(
      "Claim ur free Iphone X through the link http://freeiphone.com"
    );
    assert.equal(report.aiAnalysis, undefined);
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.ok(report.score >= 25);
  });

  it("Test 20: Missing GEMINI_API_KEY route still returns KEY_NOT_CONFIGURED for hybrid opt-in", async () => {
    delete process.env.GEMINI_API_KEY;
    const req = new Request("http://localhost:3000/api/scan-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Claim ur free Iphone X through the link http://freeiphone.com",
        userConsent: true,
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, false);
    assert.equal(data.code, "KEY_NOT_CONFIGURED");
  });
});

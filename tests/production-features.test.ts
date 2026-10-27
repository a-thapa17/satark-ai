import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { maskSensitiveData } from "../src/lib/scanner/masking.ts";
import { isPublicIp, isBlockedHostname } from "../src/lib/url/ip.ts";
import { parseUpiUri } from "../src/lib/qr/upi.ts";
import { POST as scanUrlPost } from "../src/app/api/scan-url/route.ts";
import { POST as scanMessagePost } from "../src/app/api/scan-message/route.ts";

describe("Production Features Test Suite — Masker, SSRF Guard, UPI, and AI Fallback", () => {
  describe("1. Regex Masker Unit Tests (Aadhaar, PAN, OTP, Cards)", () => {
    it("masks unformatted and spaced 12-digit Aadhaar numbers without leakage", () => {
      const inputs = [
        "My Aadhaar is 123456789012 for verification",
        "Aadhaar: 1234 5678 9012",
        "UID: 1234-5678-9012",
        "Aadhaar card 9876  5432  1098 attached",
      ];
      for (const input of inputs) {
        const res = maskSensitiveData(input);
        assert.ok(!/\b\d{4}\s*\d{4}\s*\d{4}\b/.test(res.maskedText), `Leaked in: ${input}`);
        assert.ok(res.maskedText.includes("[MASKED_AADHAAR]"), `Did not mask in: ${input}`);
      }
    });

    it("masks Indian PAN card numbers regardless of casing or spacing", () => {
      const inputs = [
        "PAN is ABCDE1234F update KYC",
        "pan: abcde1234f",
        "My PAN is ABCDE 1234 F",
      ];
      for (const input of inputs) {
        const res = maskSensitiveData(input);
        assert.ok(!/[A-Za-z]{5}\s*\d{4}\s*[A-Za-z]/i.test(res.maskedText), `PAN leaked in: ${input}`);
        assert.ok(res.maskedText.includes("[MASKED_PAN]"), `PAN not masked in: ${input}`);
      }
    });

    it("masks 4 to 6-digit OTP codes in both label-first and label-last order", () => {
      const testCases = [
        { text: "Your login OTP is 492019 valid for 10 mins", expected: "[MASKED_OTP]" },
        { text: "492019 is your OTP for netbanking", expected: "[MASKED_OTP]" },
        { text: "Security PIN: 8492 to authorize", expected: "[MASKED_OTP]" },
        { text: "Do not share code 123456 with anyone", expected: "[MASKED_OTP]" },
      ];
      for (const tc of testCases) {
        const res = maskSensitiveData(tc.text);
        assert.ok(!res.maskedText.includes("492019") && !res.maskedText.includes("123456"), `OTP leaked: ${tc.text}`);
        assert.ok(res.maskedText.includes(tc.expected), `Expected ${tc.expected} in ${res.maskedText}`);
      }
    });
  });

  describe("2. Strict SSRF Blocking Tests (/api/scan-url & isPublicIp)", () => {
    it("strictly rejects loopback 127.0.0.1, localhost, and private IPv4/IPv6 ranges", () => {
      const privateIps = [
        "127.0.0.1",
        "127.0.1.1",
        "10.0.0.1",
        "10.254.0.1",
        "192.168.1.1",
        "192.168.0.254",
        "172.16.0.1",
        "172.31.255.255",
        "169.254.169.254", // Cloud metadata
        "100.64.0.1",     // CGNAT
        "::1",             // IPv6 loopback
        "fe80::1",         // IPv6 link-local
        "fc00::1",         // IPv6 unique local
        "::ffff:127.0.0.1" // IPv4-mapped loopback
      ];

      for (const ip of privateIps) {
        assert.equal(isPublicIp(ip), false, `Should reject private IP: ${ip}`);
      }
    });

    it("rejects internal and loopback hostnames", () => {
      const blockedHosts = [
        "localhost",
        "app.localhost",
        "internal.corp",
        "server.local",
        "metadata.google.internal",
        "instance-data",
        "intranet",
      ];
      for (const host of blockedHosts) {
        assert.equal(isBlockedHostname(host), true, `Should block hostname: ${host}`);
      }
    });

    it("endpoint /api/scan-url rejects private IP URLs immediately", async () => {
      const targets = [
        "http://127.0.0.1/admin",
        "http://localhost:3000",
        "http://169.254.169.254/latest/meta-data/",
        "http://192.168.1.1/router",
        "http://10.0.0.5/api",
      ];
      for (const target of targets) {
        const req = new Request("http://localhost:3000/api/scan-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const res = await scanUrlPost(req);
        const data = await res.json();
        assert.equal(res.status, 400);
        assert.equal(data.success, false);
      }
    });
  });

  describe("3. UPI URI Parsing & Suspicious VPA Detection", () => {
    it("parses payee name, VPA, and amount correctly", () => {
      const upiUri = "upi://pay?pa=merchant@icici&pn=SuperMarket&am=150.00&cu=INR&tn=Groceries";
      const outcome = parseUpiUri(upiUri);
      assert.equal(outcome.kind, "payment");
      if (outcome.kind === "payment") {
        assert.equal(outcome.payment.upiId, "merchant@icici");
        assert.equal(outcome.payment.payeeName, "SuperMarket");
        assert.equal(outcome.payment.amount, "150.00");
        assert.equal(outcome.payment.amountValue, 150);
        assert.equal(outcome.payment.currency, "INR");
        assert.equal(outcome.payment.isSuspiciousVpa, false);
      }
    });

    it("visually flags suspicious phishing & fake customer care VPAs", () => {
      const suspiciousUris = [
        "upi://pay?pa=sbi-customercare-refund@oksbi&pn=SBI+Support",
        "upi://pay?pa=electricity.officer.9811@paytm&pn=Bijli+Officer&am=500",
        "upi://pay?pa=kbc.lottery.claim@icici&pn=KBC+Prize",
        "upi://pay?pa=police.cybercell.fine@sbi&pn=Cyber+Police",
      ];

      for (const uri of suspiciousUris) {
        const outcome = parseUpiUri(uri);
        assert.equal(outcome.kind, "payment");
        if (outcome.kind === "payment") {
          assert.equal(outcome.payment.isSuspiciousVpa, true, `Should flag suspicious VPA in: ${uri}`);
          assert.ok(outcome.payment.suspiciousReasons!.length > 0);
        }
      }
    });
  });

  describe("4. /api/scan-message AI Engine & Silent Deterministic Fallback", () => {
    it("silently and gracefully falls back to deterministic rules if GEMINI_API_KEY is not configured", async () => {
      const oldKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;
      try {
        const req = new Request("http://localhost:3000/api/scan-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "Dear consumer, electricity connection disconnected tonight 9:30 PM. Call officer 9811234567.",
            userConsent: true,
          }),
        });

        const res = await scanMessagePost(req);
        const data = await res.json();

        assert.equal(res.status, 200);
        assert.equal(data.success, false);
        assert.equal(data.code, "KEY_NOT_CONFIGURED");
        assert.ok(data.deterministicReport, "Must provide deterministic fallback without crashing");
        assert.equal(data.deterministicReport.verdict, "HIGH_RISK");
      } finally {
        process.env.GEMINI_API_KEY = oldKey;
      }
    });
  });
});

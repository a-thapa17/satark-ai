import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeHeuristics,
  THREAT_CLUSTERS,
  MODIFIER_RULES,
  ENTITY_PENALTY_RULES,
  extractUrls,
} from "../src/utils/heuristics.ts";

describe("Satark AI — Multi-Layered Deterministic Heuristic Scoring Engine", () => {
  describe("1. Threat Clusters Multi-Condition Tests", () => {
    it("matches BANKING_REWARDS cluster (HDFC/SBI + reward points + claim)", () => {
      const msg = "Dear customer, your HDFC credit card reward points are expiring today. Claim cashback of Rs 7,500 now.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Banking & Reward Points Phishing"));
      assert.ok(res.score >= 85);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("does not false-positive on generic bank mentions without rewards/claim", () => {
      const msg = "Your HDFC credit card bill of Rs 4,500 was generated. Due date is 15th.";
      const res = analyzeHeuristics(msg);
      assert.ok(!res.matchedCategories.includes("Banking & Reward Points Phishing"));
      assert.ok(res.score < 50);
    });

    it("matches KYC_SUSPENSION cluster (SBI/PAN/KYC + blocked/suspended + update/verify)", () => {
      const msg = "Your SBI account will be blocked today due to pending PAN KYC. Update immediately to avoid suspension.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("KYC Expiration & Account Suspension"));
      assert.ok(res.score >= 90);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("matches UTILITY_DISCONNECT cluster (electricity/BSES + disconnect + officer/9:30 PM)", () => {
      const msg = "Dear consumer, electricity connection will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Utility Bill Disconnection Scam (Bijli Scam)"));
      assert.ok(res.score >= 95);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("matches WFH_TASK_SCAM cluster (part-time/WFH + YouTube like/review + Telegram/t.me)", () => {
      const msg = "Part-time work from home job: Earn Rs 3000 daily income by simply like and subscribe YouTube videos. Contact HR on Telegram @EarnFast.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Part-Time Task & WFH Prepaid Scam"));
      assert.ok(res.score >= 95);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("matches CUSTOMS_PARCEL cluster (India Post/FedEx + held/clearance + fee/pay)", () => {
      const msg = "India Post alert: Your parcel is held at customs clearance due to address missing. Pay Rs 49 re-delivery fee.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Delivery, Parcel & Customs Clearance Phishing"));
      assert.ok(res.score >= 90);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("matches LOTTERY_GIFT cluster (KBC/Jio + lottery/crore/iPhone + winner/claim)", () => {
      const msg = "Congratulations! You won KBC lottery of 25 Lakhs and free gift iPhone. Claim winner prize now.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Lottery, Lucky Draw & Expensive Gift Lure"));
      assert.ok(res.score >= 95);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("matches DIGITAL_ARREST_AUTHORITY cluster (CBI/Police + arrest/FIR/narcotics)", () => {
      const msg = "Notice from CBI Cyber Crime Branch: An arrest warrant has been issued in a narcotics money laundering case. Stay on Skype call immediately.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Digital Arrest & Law Enforcement Extortion"));
      assert.equal(res.score, 100);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("matches FAKE_CHALLAN cluster when not using official echallan.parivahan.gov.in", () => {
      const msg = "Traffic police notice: Pending E-challan violation fine of Rs 1000 on your vehicle. Pay at http://echallan-vahan.xyz";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Traffic E-Challan Impersonation"));
      assert.ok(res.score >= 85);
      assert.equal(res.riskLevel, "CRITICAL");
    });

    it("does NOT match FAKE_CHALLAN if legitimate echallan.parivahan.gov.in is present", () => {
      const msg = "Traffic advisory: Please check your pending E-challan fine on https://echallan.parivahan.gov.in official portal.";
      const res = analyzeHeuristics(msg);
      assert.ok(!res.matchedCategories.includes("Traffic E-Challan Impersonation"));
    });

    it("matches MALICIOUS_PAYLOAD cluster (download/install + .apk/AnyDesk/QuickSupport)", () => {
      const msg = "To verify your account, please download and install SBI_Security_Update.apk file now.";
      const res = analyzeHeuristics(msg);
      assert.ok(res.matchedCategories.includes("Malicious APK & Remote Access Solicitation"));
      assert.equal(res.score, 100);
      assert.equal(res.riskLevel, "CRITICAL");
    });
  });

  describe("2. Behavioral & Urgency Modifiers", () => {
    it("applies extreme urgency modifier (+10 points)", () => {
      const res = analyzeHeuristics("Please respond immediately within 24 hours.");
      assert.ok(res.indicators.some((i) => i.includes("Extreme Artificial Urgency")));
      assert.equal(res.score, 10);
      assert.equal(res.riskLevel, "LOW");
    });

    it("applies action coercion and financial pressure modifiers", () => {
      const res = analyzeHeuristics("Click the link below or face penalty and legal action.");
      assert.ok(res.indicators.some((i) => i.includes("Action Coercion")));
      assert.ok(res.indicators.some((i) => i.includes("Financial Pressure")));
      assert.equal(res.score, 25);
      assert.equal(res.riskLevel, "MEDIUM");
    });
  });

  describe("3. Entity Extraction & Penalties", () => {
    it("extracts URLs and applies IP address URL penalty (+25)", () => {
      const msg = "Access login portal at http://192.168.1.100/login";
      const urls = extractUrls(msg);
      assert.equal(urls.length, 1);
      const res = analyzeHeuristics(msg);
      assert.ok(res.indicators.some((i) => i.includes("Raw IP Address Link")));
      assert.equal(res.score, 25);
      assert.equal(res.riskLevel, "MEDIUM");
    });

    it("applies URL shortener penalty (+20)", () => {
      const msg = "Update your records here: https://bit.ly/update-now";
      const res = analyzeHeuristics(msg);
      assert.ok(res.indicators.some((i) => i.includes("Obfuscated URL Shortener")));
      assert.equal(res.score, 20);
      assert.equal(res.riskLevel, "LOW");
    });

    it("applies high-risk TLD penalty (+20) for .xyz/.top/.live", () => {
      const msg = "Check updates on https://sbi-verify.xyz/portal";
      const res = analyzeHeuristics(msg);
      assert.ok(res.indicators.some((i) => i.includes("High-Risk Top Level Domain")));
      assert.equal(res.score, 20);
    });

    it("applies free hosting/forms + financial keywords penalty (+15)", () => {
      const msg = "Submit your bank account and PAN details on https://forms.gle/xyz123";
      const res = analyzeHeuristics(msg);
      assert.ok(res.indicators.some((i) => i.includes("Free Cloud Form / Hosting")));
      assert.equal(res.score, 15);
      assert.equal(res.riskLevel, "LOW");
    });
  });

  describe("4. Multi-Layered Compound Scoring & Risk Level Bands", () => {
    it("combines Threat Cluster (85) + Urgency (+10) + Coercion (+10) + Shortener (+20) and caps at 100", () => {
      const msg = "Dear customer, your SBI credit card reward points will expire immediately. Click the link below to claim cashback: https://bit.ly/sbi-claim";
      const res = analyzeHeuristics(msg);
      assert.equal(res.score, 100);
      assert.equal(res.riskLevel, "CRITICAL");
      assert.ok(res.matchedCategories.includes("Banking & Reward Points Phishing"));
      assert.ok(res.indicators.length >= 4);
    });

    it("evaluates a completely benign greeting message as score 0 and LOW risk", () => {
      const msg = "Hey Rohan, are we still meeting for tea near Connaught Place?";
      const res = analyzeHeuristics(msg);
      assert.equal(res.score, 0);
      assert.equal(res.riskLevel, "LOW");
      assert.equal(res.matchedCategories.length, 0);
      assert.equal(res.indicators.length, 0);
    });

    it("correctly buckets MEDIUM (21-50) and HIGH (51-79) thresholds", () => {
      // Coercion (10) + Financial pressure (15) = 25 -> MEDIUM
      const mediumRes = analyzeHeuristics("Urgent action required: Click the link below or penalty will be charged.");
      assert.ok(mediumRes.score >= 21 && mediumRes.score <= 50);
      assert.equal(mediumRes.riskLevel, "MEDIUM");

      // Shortener (20) + High-risk TLD (20) + Financial pressure (15) = 55 -> HIGH
      const highRes = analyzeHeuristics("Pay your fine immediately to avoid penalty at http://cutt.ly/challan.xyz");
      assert.ok(highRes.score >= 51 && highRes.score <= 79);
      assert.equal(highRes.riskLevel, "HIGH");
    });
  });
});

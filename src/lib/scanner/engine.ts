import { maskSensitiveData } from "./masking.ts";
import {
  DEFENSIVE_PATTERNS,
  THREAT_RULES,
  hasGenericHttpUrl,
} from "./rules.ts";
import type { AiAnalysisReport, DetectedSignal, RiskVerdict, ScanReport } from "./types.ts";

const VERDICT_RANK: Record<RiskVerdict, number> = {
  NO_STRONG_WARNING: 0,
  SUSPICIOUS: 1,
  HIGH_RISK: 2,
};

function summaryForVerdict(verdict: RiskVerdict, aiSupportedUpgrade: boolean): string {
  if (verdict === "HIGH_RISK") {
    return "Strong evidence of a known digital scam pattern. Do not click, pay, or reply.";
  }
  if (verdict === "SUSPICIOUS") {
    return aiSupportedUpgrade
      ? "Overall assessment is suspicious: contextual AI findings supported risk that keyword rules did not fully match. This is a heuristic score, not a probability."
      : "Several warning indicators detected. Verify through official channels before taking action.";
  }
  return "No strong warning signs found. (Note: A low heuristic score does not guarantee absolute safety).";
}

function mapAiRiskToVerdict(risk: AiAnalysisReport["riskAssessment"]): RiskVerdict {
  if (risk === "high_risk") return "HIGH_RISK";
  if (risk === "suspicious") return "SUSPICIOUS";
  return "NO_STRONG_WARNING";
}

export interface ScanOptions {
  maxCharacters?: number;
}

export class MessageScannerEngine {
  private static readonly DEFAULT_MAX_CHARS = 2000;

  /**
   * Evaluates untrusted message text against deterministic heuristic rules.
   * Completely local in-browser execution with zero persistence or external calls.
   */
  public static analyze(text: string, options?: ScanOptions): ScanReport {
    const maxChars = options?.maxCharacters ?? this.DEFAULT_MAX_CHARS;

    if (!text || text.trim().length === 0) {
      throw new Error("Input message cannot be empty. Please paste or enter message text.");
    }

    if (text.length > maxChars) {
      throw new Error(
        `Message exceeds the ${maxChars} character limit (current: ${text.length} characters).`
      );
    }

    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. In-memory PII masking
    const maskResult = maskSensitiveData(trimmed);

    // 2. Evaluate defensive signals
    const defensiveSignals: DetectedSignal[] = [];
    for (const defRule of DEFENSIVE_PATTERNS) {
      if (defRule.test(trimmed, lower)) {
        defensiveSignals.push({
          id: defRule.id,
          category: defRule.category,
          severity: defRule.severity,
          label: defRule.label,
          explanation: defRule.explanation,
          weight: defRule.weight,
        });
      }
    }

    // 3. Evaluate threat rules
    const threatSignals: DetectedSignal[] = [];
    for (const rule of THREAT_RULES) {
      const match = rule.test(trimmed, lower);
      if (match) {
        threatSignals.push({
          id: rule.id,
          category: rule.category,
          severity: rule.severity,
          label: rule.label,
          explanation: rule.explanation,
          matchedText: typeof match === "object" && match !== null ? match[0] : undefined,
          weight: rule.weight,
        });
      }
    }

    // 4. Calculate weighted score with compound combinations
    let rawScore = threatSignals.reduce((sum, s) => sum + s.weight, 0);

    // Apply defensive offsets
    const defensiveOffset = defensiveSignals.reduce((sum, s) => sum + s.weight, 0);
    rawScore = Math.max(0, rawScore + defensiveOffset);

    // Contextual Compound Checks (Hard Rules)
    const hasCredAsk = threatSignals.some((s) => s.category === "CREDENTIAL_SOLICITATION");
    const hasUrgency = threatSignals.some((s) => s.category === "URGENCY_COERCION");
    const hasImpersonation = threatSignals.some((s) => s.category === "ENTITY_IMPERSONATION");
    const hasSuspiciousLink = threatSignals.some((s) => s.category === "SUSPICIOUS_LINK");
    const hasMaliciousApp = threatSignals.some((s) => s.category === "MALICIOUS_APP_ACCESS");
    const hasUpiTrap = threatSignals.some((s) => s.id === "PAY_RECEIVE_REQUIRES_PIN");
    const hasDigitalArrest = threatSignals.some((s) => s.id === "URG_LEGAL_ARREST_EXTORTION");
    const hasElectricityScam = threatSignals.some((s) => s.id === "URG_UTILITY_DISCONNECTION");
    const hasPrizeWithFee = threatSignals.some((s) => s.id === "CTX_PRIZE_WITH_FEE_OR_SECRETS");
    const hasJobUpfrontFee = threatSignals.some((s) => s.id === "CTX_JOB_EARNINGS_WITH_UPFRONT_FEE");
    const hasSuspensionCombo = threatSignals.some((s) => s.id === "CTX_SUSPENSION_WITH_LINK_OR_CREDS");
    const hasPrizeWithLink = threatSignals.some((s) => s.id === "CTX_PRIZE_LURE_WITH_LINK");
    const hasRefundFee = threatSignals.some((s) => s.id === "CTX_REFUND_WITH_FEE");
    const hasPrizeBankDetails = threatSignals.some(
      (s) => s.id === "CTX_PRIZE_WITH_BANK_DETAILS"
    );
    const hasDeliveryLure = threatSignals.some((s) => s.id === "IMP_DELIVERY_PAYMENT_LURE");
    const hasLoanFee = threatSignals.some((s) => s.id === "PAY_LOAN_APPROVAL_FEE");
    const hasInvestmentLure = threatSignals.some(
      (s) => s.id === "INVEST_GUARANTEED_HIGH_RETURN"
    );
    const hasUrl = hasGenericHttpUrl(trimmed);

    let isHardHighRisk = false;

    // Hard Rule 1: Credential demand + Urgency/Threat = Immediate High Risk
    if (hasCredAsk && hasUrgency) {
      rawScore = Math.max(rawScore, 85);
      isHardHighRisk = true;
    }

    // Hard Rule 2: Fake KYC / Bank Impersonation + Suspicious Link = Immediate High Risk
    if (hasImpersonation && hasSuspiciousLink) {
      rawScore = Math.max(rawScore, 80);
      isHardHighRisk = true;
    }

    // Hard Rule 3: UPI PIN required to receive money = High Risk
    if (hasUpiTrap) {
      rawScore = Math.max(rawScore, 90);
      isHardHighRisk = true;
    }

    // Hard Rule 4: Digital Arrest / Extortion = High Risk
    if (hasDigitalArrest) {
      rawScore = Math.max(rawScore, 95);
      isHardHighRisk = true;
    }

    // Hard Rule 5: APK download or remote access software = High Risk
    if (hasMaliciousApp) {
      rawScore = Math.max(rawScore, 85);
      isHardHighRisk = true;
    }

    // Hard Rule 6: Electricity bill disconnection threat = High Risk
    if (hasElectricityScam) {
      rawScore = Math.max(rawScore, 85);
      isHardHighRisk = true;
    }

    // Hard Rule 7: Lottery/Prize lure + Advance fee demand = Definitive High Risk
    const hasLotteryPrize = threatSignals.some((s) => s.id === "JOB_LOTTERY_KBC_PRIZE");
    const hasAdvanceFee = threatSignals.some((s) => s.id === "PAY_ADVANCE_FEE_REFUND");
    if ((hasLotteryPrize && hasAdvanceFee) || hasPrizeWithFee) {
      rawScore = Math.max(rawScore, 80);
      isHardHighRisk = true;
    }

    // Hard Rule 8: High job-earnings lure + upfront fee
    if (hasJobUpfrontFee) {
      rawScore = Math.max(rawScore, 80);
      isHardHighRisk = true;
    }

    // Hard Rule 9: Account suspension + link or credential request
    if (hasSuspensionCombo) {
      rawScore = Math.max(rawScore, 80);
      isHardHighRisk = true;
    }

    // Hard Rule 10: Refund/rebate released only after an upfront fee
    if (hasRefundFee || hasPrizeBankDetails) {
      rawScore = Math.max(rawScore, 80);
      isHardHighRisk = true;
    }

    // Hard Rule 11: Delivery lure combined with an obfuscated or lookalike link
    if (hasDeliveryLure && hasSuspiciousLink) {
      rawScore = Math.max(rawScore, 80);
      isHardHighRisk = true;
    }

    // Hard Rule 12: Advance fee demanded to release an approved loan
    if (hasLoanFee) {
      rawScore = Math.max(rawScore, 85);
      isHardHighRisk = true;
    }

    // Hard Rule 13: Guaranteed high-frequency investment returns
    if (hasInvestmentLure) {
      rawScore = Math.max(rawScore, 85);
      isHardHighRisk = true;
    }

    // Clamp score to 0..100
    const finalScore = Math.min(100, Math.max(0, rawScore));

    // Determine 3-tier verdict
    let verdict: RiskVerdict;
    if (isHardHighRisk || finalScore >= 60) {
      verdict = "HIGH_RISK";
    } else if (finalScore >= 25) {
      verdict = "SUSPICIOUS";
    } else {
      verdict = "NO_STRONG_WARNING";
    }

    // 5. Build explainable reasons & safe actions
    const reasons: string[] = [];
    const safeNextSteps: string[] = [];

    if (verdict === "NO_STRONG_WARNING") {
      if (defensiveSignals.length > 0) {
        reasons.push(
          "Message contains standard protective advisories (e.g., explicit instruction not to share OTPs/PINs)."
        );
      }
      reasons.push(
        "Rule-based analysis found no typical keyword or pattern indicators (credential requests, coercive deadlines, or known suspicious-link patterns)."
      );

      safeNextSteps.push(
        "Even without obvious red flags, always verify unexpected payment or KYC requests through official channels."
      );
      safeNextSteps.push(
        "Never share sensitive passwords, PINs, or OTPs, even if a sender appears genuine."
      );
    } else {
      // Collect specific reasons from triggered rules
      for (const signal of threatSignals) {
        reasons.push(`${signal.label}: ${signal.explanation}`);
      }

      // Generate action-oriented next steps. Put the finding-specific action
      // before generic link/impersonation advice so it survives list truncation.
      if (hasDigitalArrest) {
        safeNextSteps.push(
          "Hang up immediately. Police, CBI, and Customs NEVER conduct arrests or demand bail transfers via video call."
        );
      }
      if (hasMaliciousApp) {
        safeNextSteps.push(
          "Do NOT download APK files or install AnyDesk, TeamViewer, or QuickSupport on your device."
        );
      }
      if (hasCredAsk) {
        safeNextSteps.push(
          "Never share your OTP, PIN, password, or card CVV — do NOT reply to this message or provide these details under any circumstances."
        );
      }
      if (hasDeliveryLure) {
        safeNextSteps.push(
          "Track the parcel only in the courier's official app or website. Do not pay or update address details through the link in this message."
        );
      }
      if (hasRefundFee) {
        safeNextSteps.push(
          "Check refunds directly in the official bank, tax, or merchant portal. A genuine refund never requires an upfront fee or a link from the message."
        );
      }
      if (hasLoanFee) {
        safeNextSteps.push(
          "Do not pay any processing, activation, or insurance fee to release a loan. Verify the lender and its registration directly with your bank or the RBI."
        );
      }
      if (hasInvestmentLure) {
        safeNextSteps.push(
          "Do not transfer money to this investment or trading offer. Check SEBI registration and use only regulated intermediaries; guaranteed high returns are a fraud warning."
        );
      }
      if (hasPrizeBankDetails) {
        safeNextSteps.push(
          "Never share bank account details, IFSC, Aadhaar, PAN, or card details to claim a prize or reward."
        );
      }
      if (hasUpiTrap) {
        safeNextSteps.push(
          "Remember: Entering your UPI PIN or scanning a QR code ALWAYS transfers money OUT of your account."
        );
      }
      if (hasSuspiciousLink) {
        safeNextSteps.push(
          "Do NOT click the link or open attachments. Delete the message or report it as spam."
        );
      }
      if (hasImpersonation || hasUrgency) {
        safeNextSteps.push(
          "Contact the organization directly using the official toll-free number from their verified website or mobile app."
        );
      }
      if (hasPrizeWithLink || hasUrl) {
        safeNextSteps.push(
          "Do not click unsolicited prize or payment links. This scan does not check a URL’s reputation or destination."
        );
      }

      // Always include 1930 helpline for high risk
      if (verdict === "HIGH_RISK") {
        safeNextSteps.push(
          "If you have already sent money or shared credentials, call the National Cyber Fraud Helpline at 1930 immediately."
        );
      }
    }

    // Derive category
    let category = "General Communication";
    if (hasDigitalArrest) category = "Digital Arrest / Extortion";
    else if (hasElectricityScam) category = "Utility Disconnection (Bijli Scam)";
    else if (hasUpiTrap) category = "UPI / Payment Fraud";
    else if (hasCredAsk && hasImpersonation) category = "Bank Impersonation / Phishing";
    else if (hasCredAsk) category = "Credential Harvesting";
    else if (hasDeliveryLure) category = "Delivery / Courier Phishing";
    else if (hasInvestmentLure) category = "Investment / Trading Scam";
    else if (hasLoanFee || hasRefundFee) category = "Refund / Advance-Fee Scam";
    else if (hasPrizeBankDetails) category = "Prize / Bank-Details Lure";
    else if (threatSignals.some((s) => s.category === "JOB_PRIZE_SCAM")) category = "Job / Prize Lure";
    else if (threatSignals.some((s) => s.category === "MALICIOUS_APP_ACCESS")) category = "Malicious App / APK Lure";
    else if (hasSuspiciousLink) category = "Suspicious Link / Phishing";
    else if (threatSignals.length > 0) category = threatSignals[0].label;

    // Confidence reflects evidence strength, not the mere existence of a
    // keyword. A single ambiguity should not produce a high-confidence warning.
    let confidence: "High" | "Medium" | "Low" = "Low";
    if (verdict === "HIGH_RISK") {
      confidence =
        isHardHighRisk ||
        threatSignals.length >= 2 ||
        threatSignals.some((s) => s.severity === "CRITICAL")
          ? "High"
          : "Medium";
    } else if (verdict === "SUSPICIOUS") {
      confidence =
        threatSignals.length >= 2 ||
        threatSignals.some((s) => s.severity === "CRITICAL" || s.severity === "HIGH")
          ? "Medium"
          : "Low";
    }

    let limitationsDisclaimer =
      "Deterministic heuristic analysis provides an educational risk estimate (not a probability or proof). Scammers continually adapt tactics. Always independently verify senders via official directories.";
    if (hasUrl) {
      limitationsDisclaimer +=
        " A link was present; its reputation, destination, and actual behavior were not checked.";
    }

    return {
      verdict,
      score: finalScore,
      deterministicVerdict: verdict,
      deterministicScore: finalScore,
      confidence,
      category,
      summary: summaryForVerdict(verdict, false),
      signals: threatSignals,
      defensiveSignals,
      reasons: reasons.slice(0, 4), // Top 4 clear reasons
      safeNextSteps: safeNextSteps.slice(0, 6), // Top actionable steps
      maskedInput: maskResult.maskedText,
      rawInputLength: trimmed.length,
      maskedItemsCount: maskResult.maskedItemsCount,
      timestamp: new Date().toISOString(),
      limitationsDisclaimer,
    };
  }

  /**
   * Merges deterministic rule findings with Google Gemini AI contextual analysis.
   * Safety invariant: The deterministic rules engine is the trusted baseline.
   * AI is supporting evidence only: it cannot downgrade HIGH_RISK, cannot force HIGH_RISK
   * on its own, and cannot change the assessment without validated (in-text) evidence.
   */
  public static combineWithAi(
    ruleReport: ScanReport,
    aiReport: AiAnalysisReport
  ): ScanReport {
    const hasValidatedEvidence = aiReport.evidence.length > 0;
    const aiMapped = mapAiRiskToVerdict(aiReport.riskAssessment);
    const ruleVerdict = ruleReport.verdict;

    let finalVerdict = ruleVerdict;
    let finalScore = ruleReport.score;
    let disagreementWithRules = false;
    let disagreementExplanation: string | undefined;
    let aiSupportedUpgrade = false;

    // Never allow AI to downgrade a deterministic HIGH_RISK finding.
    if (ruleVerdict === "HIGH_RISK" && aiMapped !== "HIGH_RISK") {
      disagreementWithRules = true;
      disagreementExplanation = `Deterministic heuristic rules flagged this message as HIGH RISK due to verified threat indicators (${ruleReport.category}). The AI contextual model assessed it as ${aiReport.riskAssessment.toUpperCase()}. For your protection, the higher deterministic warning is preserved.`;
      finalVerdict = "HIGH_RISK";
    } else if (hasValidatedEvidence && VERDICT_RANK[aiMapped] > VERDICT_RANK[ruleVerdict]) {
      // AI may raise the overall call, but never past SUSPICIOUS by itself.
      const capped: RiskVerdict = aiMapped === "HIGH_RISK" ? "SUSPICIOUS" : aiMapped;
      if (VERDICT_RANK[capped] > VERDICT_RANK[ruleVerdict]) {
        disagreementWithRules = true;
        disagreementExplanation =
          "Heuristic keyword rules did not catch obvious static patterns, but the AI security analysis identified high-risk contextual manipulation.";
        finalVerdict = capped;
        aiSupportedUpgrade = true;
        if (finalVerdict === "SUSPICIOUS") {
          finalScore = Math.max(finalScore, 30);
        }
      }
    } else if (
      hasValidatedEvidence &&
      ruleVerdict !== "NO_STRONG_WARNING" &&
      aiMapped === "NO_STRONG_WARNING"
    ) {
      disagreementWithRules = true;
      disagreementExplanation = `Deterministic heuristic rules flagged this message as ${ruleVerdict.replace(/_/g, " ")}. The AI contextual model assessed it as NO_STRONG_WARNING. For your protection, the higher deterministic warning is preserved.`;
    }

    // Keep score/verdict consistent with existing thresholds (25 / 60).
    if (finalVerdict === "HIGH_RISK") {
      finalScore = Math.max(finalScore, ruleReport.score);
    } else if (finalVerdict === "SUSPICIOUS") {
      finalScore = Math.max(finalScore, 25);
    }

    // Keep AI recommendations in the clearly labelled AI panel. The
    // deterministic safe steps stay untouched so unverified model output can
    // never be mistaken for the trusted safety checklist.
    let confidence = ruleReport.confidence;
    if (aiSupportedUpgrade) {
      confidence = "Medium";
    }

    let category = ruleReport.category;
    if (aiSupportedUpgrade && category === "General Communication") {
      category = "Contextual risk (AI-supported)";
    }

    const updatedAiReport: AiAnalysisReport = {
      ...aiReport,
      disagreementWithRules,
      disagreementExplanation,
    };

    return {
      ...ruleReport,
      verdict: finalVerdict,
      score: Math.min(100, Math.max(0, finalScore)),
      confidence,
      category,
      summary: summaryForVerdict(finalVerdict, aiSupportedUpgrade),
      aiAnalysis: updatedAiReport,
      aiStatus: "success",
    };
  }
}

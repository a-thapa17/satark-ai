/**
 * Satark AI — Multi-Layered Deterministic Heuristic Threat Detection Engine
 * Evaluates Indian cyber threat clusters, urgency/coercion modifiers, and suspicious entity indicators.
 */

export interface ThreatSignature {
  id: string;
  category: string;
  baseScore: number;
  matchLogic: (text: string) => boolean;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface HeuristicResult {
  score: number;
  riskLevel: RiskLevel;
  matchedCategories: string[];
  indicators: string[];
}

export interface ModifierRule {
  id: string;
  points: number;
  label: string;
  test: (text: string, lower: string) => boolean;
}

export interface EntityPenaltyRule {
  id: string;
  points: number;
  label: string;
  test: (urls: string[], text: string, lower: string) => boolean;
}

// ---------------------------------------------------------------------------
// 1. THREAT CLUSTERS
// Multi-condition boolean tests with strict boundary matching
// ---------------------------------------------------------------------------

export const THREAT_CLUSTERS: ThreatSignature[] = [
  {
    id: "BANKING_REWARDS",
    category: "Banking & Reward Points Phishing",
    baseScore: 85,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Financial / Bank Entity
      const hasBank =
        /\b(?:credit\s*card|debit\s*card|hdfc(?:\s*bank)?|sbi|state\s*bank|icici(?:\s*bank)?|axis(?:\s*bank)?|pnb|kotak|rbi|bank)\b/i.test(
          lower
        );
      // Condition 2: Reward / Redeem points lure
      const hasPoints =
        /\b(?:reward\s*points?|bonus\s*points?|points?\s*worth|redeem(?:able)?|expir(?:e[ds]?|ing|y)|unclaimed\s*points?)\b/i.test(
          lower
        );
      // Condition 3: Action to claim / cashback
      const hasAction =
        /\b(?:claim|cashback|convert\s*to\s*cash|encash|withdraw|avail\s*now)\b/i.test(
          lower
        );

      return hasBank && hasPoints && hasAction;
    },
  },
  {
    id: "KYC_SUSPENSION",
    category: "KYC Expiration & Account Suspension",
    baseScore: 90,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Identity / Banking credentials
      const hasIdentity =
        /\b(?:kyc|pan(?:\s*card)?|aadhaar(?:\s*card)?|netbanking|account|sim(?:\s*card)?)\b/i.test(
          lower
        );
      // Condition 2: Coercive restriction / status threat
      const hasThreat =
        /\b(?:block(?:ed|ing)?|suspend(?:ed)?|hold|deactivat(?:ed?|ion)|restrict(?:ed)?|clos(?:ed?|ure)|freez(?:e|ed|ing))\b/i.test(
          lower
        );
      // Condition 3: Demand to update / verify / click
      const hasAction =
        /\b(?:update|verify|verification|click|link|submit|re-?kyc|validate)\b/i.test(
          lower
        );

      return hasIdentity && hasThreat && hasAction;
    },
  },
  {
    id: "UTILITY_DISCONNECT",
    category: "Utility Bill Disconnection Scam (Bijli Scam)",
    baseScore: 95,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Electricity or Power Utility providers
      const hasUtility =
        /\b(?:electricity(?:\s*bill|\s*power)?|power(?:\s*supply)?|bijli|bses|msedcl|tneb|dhbvn|uppcl|bescom|wbsedcl|discom)\b/i.test(
          lower
        );
      // Condition 2: Disconnection threat
      const hasDisconnect =
        /\b(?:disconnect(?:ed|ion)?|cut(?:\s*off)?|fail(?:ed|ure)?|stop(?:ped)?)\b/i.test(
          lower
        );
      // Condition 3: Fake officer or imminent deadline
      const hasOfficerOrTime =
        /\b(?:officer|helpline|update|tonight|today|at\s*(?:9|9:30|10)\s*(?:pm|hours?)|call\s*(?:on)?\s*\d{10})\b/i.test(
          lower
        );

      return hasUtility && hasDisconnect && hasOfficerOrTime;
    },
  },
  {
    id: "WFH_TASK_SCAM",
    category: "Part-Time Task & WFH Prepaid Scam",
    baseScore: 95,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Part-time / WFH earning claim
      const hasJobClaim =
        /\b(?:part[- ]time(?:\s*job)?|work\s*from\s*home|daily\s*income|earn\s*(?:rs\.?|inr|\d+)|daily\s*(?:rs\.?|inr|\d+)|flexible\s*hours?)\b/i.test(
          lower
        );
      // Condition 2: Micro-task / social engagement
      const hasTask =
        /\b(?:youtube|google\s*maps?|review|like(?:\s*and\s*subscribe)?|subscribe|hotel\s*review|merchant\s*rating|rating\s*task)\b/i.test(
          lower
        );
      // Condition 3: Telegram or HR routing
      const hasPlatform =
        /\b(?:telegram|t\.me|hr(?:\s*team|\s*manager)?|whatsapp(?:\s*group)?|join\s*(?:us|channel|group)|prepaid\s*task)\b/i.test(
          lower
        );

      return hasJobClaim && hasTask && hasPlatform;
    },
  },
  {
    id: "CUSTOMS_PARCEL",
    category: "Delivery, Parcel & Customs Clearance Phishing",
    baseScore: 90,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Courier / Postal Service
      const hasCourier =
        /\b(?:india\s*post|fedex|bluedart|delhivery|dhl|customs(?:\s*department)?|parcel|package|shipment|courier|consignment)\b/i.test(
          lower
        );
      // Condition 2: Problem status / held / address issue
      const hasProblem =
        /\b(?:held|seized|clearance|address\s*(?:missing|incomplete|wrong|update)|pending\s*delivery|failed\s*delivery|undelivered|awaiting\s*confirmation)\b/i.test(
          lower
        );
      // Condition 3: Payment or fee or link update demand
      const hasFeeOrUpdate =
        /\b(?:fee|charge|pay(?:ment)?|tax|penalty|update|confirm|schedule|redeliver)\b/i.test(
          lower
        );

      return hasCourier && hasProblem && hasFeeOrUpdate;
    },
  },
  {
    id: "LOTTERY_GIFT",
    category: "Lottery, Lucky Draw & Expensive Gift Lure",
    baseScore: 95,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Known Brand / Lure Context
      const hasEntity =
        /\b(?:kbc|kaun\s*banega\s*crorepati|jio|tata|amazon|flipkart|lucky\s*draw|congratulations|selected)\b/i.test(
          lower
        );
      // Condition 2: Prize / High Value Item
      const hasPrize =
        /\b(?:lottery|crore|lakh|free\s*gift|iphone|car|gold|cash\s*prize|won\s*(?:rs\.?|inr|\$|\d+))\b/i.test(
          lower
        );
      // Condition 3: Action to claim / pay tax
      const hasClaim =
        /\b(?:claim|winner|tax|processing\s*fee|registration\s*fee|clearance\s*charge|deposit)\b/i.test(
          lower
        );

      return hasEntity && hasPrize && hasClaim;
    },
  },
  {
    id: "DIGITAL_ARREST_AUTHORITY",
    category: "Digital Arrest & Law Enforcement Extortion",
    baseScore: 100,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Authority Impersonation
      const hasAuthority =
        /\b(?:cbi|police|customs|trai|supreme\s*court|high\s*court|cyber\s*crime(?:\s*branch|\s*cell)?|mumbai\s*police|delhi\s*police|interpol|rbi\s*security)\b/i.test(
          lower
        );
      // Condition 2: Coercive Legal Threat
      const hasLegalThreat =
        /\b(?:digital\s*arrest|arrest|fir|warrant|narcotics|skype|money\s*laundering|seized\s*passport|stay\s*on\s*call|video\s*call|court\s*summons)\b/i.test(
          lower
        );

      return hasAuthority && hasLegalThreat;
    },
  },
  {
    id: "FAKE_CHALLAN",
    category: "Traffic E-Challan Impersonation",
    baseScore: 85,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Must NOT contain legitimate government portal
      if (lower.includes("echallan.parivahan.gov.in")) {
        return false;
      }

      // Condition 1: Challan / Transport Authority Mention
      const hasChallan =
        /\b(?:e-?challan|traffic(?:\s*police)?|parivahan|rto(?:\s*notice)?|traffic\s*violation)\b/i.test(
          lower
        );
      // Condition 2: Fine / Pending Notice
      const hasFine =
        /\b(?:pending|fine|violation|challan\s*no|pay\s*now|court\s*settlement|vehicle\s*(?:no|impounded))\b/i.test(
          lower
        );

      return hasChallan && hasFine;
    },
  },
  {
    id: "MALICIOUS_PAYLOAD",
    category: "Malicious APK & Remote Access Solicitation",
    baseScore: 100,
    matchLogic: (text: string): boolean => {
      const lower = text.toLowerCase();
      // Condition 1: Download or Install solicitation
      const hasInstall =
        /\b(?:download|install|setup|sideload|open\s*file|click\s*to\s*install)\b/i.test(
          lower
        );
      // Condition 2: Suspicious extensions or RAT tools
      const hasPayload =
        /\b(?:\.apk|anydesk|teamviewer|rustdesk|quicksupport|screen\s*shar(?:e|ing)|airdroid)\b/i.test(
          lower
        ) || /\.apk\b/i.test(text);

      return hasInstall && hasPayload;
    },
  },
];

// ---------------------------------------------------------------------------
// 2. BEHAVIORAL & URGENCY MODIFIERS
// Additive weights reflecting psychological coercion tactics
// ---------------------------------------------------------------------------

export const MODIFIER_RULES: ModifierRule[] = [
  {
    id: "EXTREME_URGENCY",
    points: 10,
    label: "Extreme Artificial Urgency",
    test: (_, lower: string) =>
      /\b(?:immediately|within\s*24\s*hours?|urgent\s*action\s*required|before\s*midnight|within\s*(?:10|15|30)\s*mins?|last\s*chance|expires\s*today|final\s*notice)\b/i.test(
        lower
      ),
  },
  {
    id: "ACTION_COERCION",
    points: 10,
    label: "Action Coercion & Secrecy",
    test: (_, lower: string) =>
      /\b(?:click(?:\s*on)?\s*the\s*link(?:\s*below)?|forward\s*this\s*otp|share\s*(?:your\s*)?otp|do\s*not\s*share\s*this\s*code\s*with\s*others\s*but\s*send|call\s*immediately\s*on|send\s*sms\s*to)\b/i.test(
        lower
      ),
  },
  {
    id: "FINANCIAL_PRESSURE",
    points: 15,
    label: "Financial Pressure & Legal Consequences",
    test: (_, lower: string) =>
      /\b(?:penalty|fine|account\s*clos(?:ure|ed)|legal\s*action|police\s*complaint|court\s*proceedings?|assets?\s*frozen|cibil\s*score\s*impact)\b/i.test(
        lower
      ),
  },
];

// ---------------------------------------------------------------------------
// 3. ENTITY EXTRACTION & PENALTIES
// ---------------------------------------------------------------------------

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
const IP_URL_REGEX = /https?:\/\/(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/[^\s]*)?/i;
const SHORTENER_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:bit\.ly|tinyurl\.com|t\.co|cutt\.ly|is\.gd|rb\.gy|shorturl\.at|ow\.ly|tiny\.cc)\/[a-zA-Z0-9_\-]+/i;
const RISKY_TLDS_REGEX = /\.(?:xyz|top|live|cc|info|apk|buzz|club|online|site|work|tk|ga|ml|cf|vip|icu|quest|monster)(?::\d+)?(?:\/|\b|$)/i;
const FREE_HOSTING_REGEX = /(?:sites\.google\.com|forms\.gle|docs\.google\.com\/forms|typeform\.com|weebly\.com|wixsite\.com|firebaseapp\.com|web\.app)/i;

export const ENTITY_PENALTY_RULES: EntityPenaltyRule[] = [
  {
    id: "IP_ADDRESS_URL",
    points: 25,
    label: "Raw IP Address Link",
    test: (urls: string[]) => urls.some((url) => IP_URL_REGEX.test(url)),
  },
  {
    id: "URL_SHORTENER",
    points: 20,
    label: "Obfuscated URL Shortener",
    test: (urls: string[]) => urls.some((url) => SHORTENER_REGEX.test(url)),
  },
  {
    id: "HIGH_RISK_TLD",
    points: 20,
    label: "High-Risk Top Level Domain (TLD)",
    test: (urls: string[]) => urls.some((url) => RISKY_TLDS_REGEX.test(url)),
  },
  {
    id: "FREE_FORM_FINANCIAL_LURE",
    points: 15,
    label: "Free Cloud Form / Hosting Combined with Financial Request",
    test: (urls: string[], _, lower: string) => {
      const hasFreeHost = urls.some((url) => FREE_HOSTING_REGEX.test(url));
      const hasFinancialTerms =
        /\b(?:bank|account|pan|aadhaar|otp|pin|credit|debit|payment|refund|kyc|card)\b/i.test(
          lower
        );
      return hasFreeHost && hasFinancialTerms;
    },
  },
];

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX);
  return matches ? Array.from(new Set(matches)) : [];
}

// ---------------------------------------------------------------------------
// 4. MAIN MULTI-LAYERED HEURISTIC SCORING ENGINE
// ---------------------------------------------------------------------------

/**
 * Evaluates untrusted message text against the Multi-Layered Heuristic Scoring System.
 * 
 * Pipeline:
 * 1. Evaluate Threat Clusters -> Take the highest baseScore from matched clusters.
 * 2. Evaluate Behavioral & Urgency Modifiers -> Add points.
 * 3. Extract URLs & evaluate Entity Penalties -> Add points.
 * 4. Normalize & cap score at 100.
 * 5. Classify risk level:
 *    - 0-20: LOW
 *    - 21-50: MEDIUM
 *    - 51-79: HIGH
 *    - 80-100: CRITICAL
 */
export function analyzeHeuristics(text: string): HeuristicResult {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return {
      score: 0,
      riskLevel: "LOW",
      matchedCategories: [],
      indicators: [],
    };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const urls = extractUrls(trimmed);

  const matchedCategories: string[] = [];
  const indicators: string[] = [];
  let maxBaseScore = 0;

  // 1. Threat Clusters
  for (const cluster of THREAT_CLUSTERS) {
    if (cluster.matchLogic(trimmed)) {
      matchedCategories.push(cluster.category);
      indicators.push(`Matched Threat Cluster: ${cluster.category} (+${cluster.baseScore})`);
      if (cluster.baseScore > maxBaseScore) {
        maxBaseScore = cluster.baseScore;
      }
    }
  }

  // 2. Behavioral & Urgency Modifiers
  let modifierPoints = 0;
  for (const mod of MODIFIER_RULES) {
    if (mod.test(trimmed, lower)) {
      modifierPoints += mod.points;
      indicators.push(`Modifier Detected: ${mod.label} (+${mod.points})`);
    }
  }

  // 3. Entity Penalties (URLs, Hostnames, TLDs)
  let entityPoints = 0;
  for (const entityRule of ENTITY_PENALTY_RULES) {
    if (entityRule.test(urls, trimmed, lower)) {
      entityPoints += entityRule.points;
      indicators.push(`Suspicious Entity Indicator: ${entityRule.label} (+${entityRule.points})`);
    }
  }

  // If no threat clusters matched, but high-risk entities or coercive modifiers exist,
  // ensure they provide a baseline score to detect standalone anomalies.
  let rawScore = maxBaseScore;
  if (maxBaseScore === 0) {
    rawScore = modifierPoints + entityPoints;
  } else {
    rawScore = maxBaseScore + modifierPoints + entityPoints;
  }

  // Normalize / Cap at 100
  const finalScore = Math.min(100, Math.max(0, rawScore));

  // Determine Risk Level: 0-20 (LOW), 21-50 (MEDIUM), 51-79 (HIGH), 80-100 (CRITICAL)
  let riskLevel: RiskLevel = "LOW";
  if (finalScore >= 80) {
    riskLevel = "CRITICAL";
  } else if (finalScore >= 51) {
    riskLevel = "HIGH";
  } else if (finalScore >= 21) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  return {
    score: finalScore,
    riskLevel,
    matchedCategories,
    indicators,
  };
}

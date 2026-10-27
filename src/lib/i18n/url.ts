import type { Language, LocalizedShape } from "./language";
import type {
  CheckStatus,
  RdapStatus,
  RedirectHopKind,
  ThreatCheckResult,
  UrlAnalysisReport,
  UrlWarning,
  WarningSeverity,
} from "@/lib/url/types";

const en = {
  ui: {
    assessment: "URL risk assessment",
    scoreLabel: "Heuristic URL risk score",
    scoreNote:
      "Heuristic estimate. A threat match is a signal, not proof; a no-match result is not a guarantee.",
    redirects: "Redirect chain ({count} followed{truncated})",
    redirectsTruncated: ", truncated",
    redirectLimitNote:
      "Limit: {limit} redirects. Every destination was checked against private and reserved address space.",
    domainRegistration: "Domain registration (RDAP)",
    registrar: "Registrar",
    registryStatus: "Registry status",
    created: "Created",
    age: "Age",
    ageDays: "{count} day(s)",
    unknown: "Unknown",
    notReported: "Not reported",
    noneReported: "None reported",
    threatChecks: "Threat checks",
    threatNote:
      "“Unavailable” and “Not configured” are not clean results. They mean that service could not contribute evidence.",
    warnings: "Warnings ({count})",
    noWarnings: "No local URL or redirect anomalies were detected.",
    safeSteps: "Safe next steps",
    details: "URL details",
    submitted: "Submitted",
    normalized: "Normalized",
    finalDestination: "Final destination",
    hostname: "Hostname",
    registrableDomain: "Registrable domain",
    checked: "Checked {count} URL(s).",
    tags: "Tags:",
    threatFallback: "Threat",
    demoTitle: "Demo data:",
    demoBody:
      "these results are simulated for the built-in sample URL. They do not represent a live scan.",
    blockedTitle: "Blocked by SSRF protection:",
    blockedBody:
      "No request was sent to the blocked destination.",
    serviceDetail: "Service detail:",
    redirectKind: {
      start: "start",
      redirect: "redirect",
      final: "final",
      blocked: "blocked",
      error: "error",
    },
  },
  verdict: {
    MALICIOUS: {
      label: "Malicious (confirmed)",
      summary:
        "At least one threat-intelligence service returned a confirmed match for this URL. Do not open it or enter any information.",
    },
    SUSPICIOUS: {
      label: "Suspicious",
      summary:
        "Suspicious URL or redirect indicators were found. This is not proof of malicious activity, but the destination should not be treated as trusted.",
    },
    NO_KNOWN_THREAT: {
      label: "No known threat",
      summary:
        "No known threat was reported by the available checks. This is point-in-time information, not a guarantee that the site is safe.",
    },
    INCONCLUSIVE: {
      label: "Inconclusive",
      summary:
        "The available checks were unavailable, incomplete, or the site could not be reached. No reliable safety conclusion can be made.",
    },
  },
  checkStatus: {
    clean: "No match",
    threat: "Threat match",
    unavailable: "Unavailable",
    not_configured: "Not configured",
    error: "Error",
    skipped: "Skipped",
  },
  rdapStatus: {
    ok: "Registration data retrieved",
    not_found: "No registration record",
    unavailable: "Registration data unavailable",
    error: "Registration lookup error",
  },
  severity: {
    CRITICAL: "Critical",
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  },
  limitations:
    "This is a point-in-time URL check. Page content, scripts, downloads, and QR payloads are not executed. Threat-service matches are not proof of current behavior; a no-match result is not a guarantee of safety. Domain registration, redirect, and reputation data may be incomplete or unavailable.",
  demoLimitations:
    "Demo mode: these are simulated results, not live verification. Disable PHASE2_DEMO_MODE for real network and threat-service checks.",
  domainMessages: {
    ok: "RDAP registration data was retrieved.",
    not_found: "The RDAP service has no registration record for this domain.",
    unavailable: "RDAP registration data is not available for this hostname.",
    error: "RDAP registration data could not be retrieved.",
  },
  threatMessages: {
    clean: "This service reported no match for the checked URL(s). This is not a guarantee.",
    threat: "This service returned a confirmed threat match for the checked URL(s).",
    unavailable: "This service was unavailable. No threat conclusion can be drawn from it.",
    not_configured: "This service is not configured. No threat conclusion can be drawn from it.",
    error: "This service could not complete the check. No threat conclusion is available.",
    skipped: "This check was skipped. No threat conclusion is available.",
  },
} as const;

const hi: LocalizedShape<typeof en> = {
  ui: {
    assessment: "URL जोखिम मूल्यांकन",
    scoreLabel: "heuristic URL जोखिम स्कोर",
    scoreNote:
      "heuristic अनुमान। खतरा मिलान एक संकेत है, प्रमाण नहीं; कोई मिलान न मिलना भी सुरक्षा की गारंटी नहीं।",
    redirects: "रीडायरेक्ट श्रृंखला ({count} फॉलो किए{truncated})",
    redirectsTruncated: ", काटी गई",
    redirectLimitNote:
      "सीमा: {limit} रीडायरेक्ट। हर गंतव्य को निजी और आरक्षित पता-स्थान के विरुद्ध जाँचा गया।",
    domainRegistration: "डोमेन पंजीकरण (RDAP)",
    registrar: "रजिस्ट्रार",
    registryStatus: "रजिस्ट्री स्थिति",
    created: "बनाया गया",
    age: "आयु",
    ageDays: "{count} दिन",
    unknown: "अज्ञात",
    notReported: "नहीं बताया गया",
    noneReported: "कोई नहीं बताया गया",
    threatChecks: "खतरा जाँच",
    threatNote:
      "“उपलब्ध नहीं” और “कॉन्फ़िगर नहीं” साफ परिणाम नहीं हैं। इनका अर्थ है कि वह सेवा कोई साक्ष्य नहीं दे सकी।",
    warnings: "चेतावनियाँ ({count})",
    noWarnings: "URL या रीडायरेक्ट में कोई स्थानीय असामान्यता नहीं मिली।",
    safeSteps: "सुरक्षित अगले कदम",
    details: "URL विवरण",
    submitted: "सबमिट किया गया",
    normalized: "सामान्यीकृत",
    finalDestination: "अंतिम गंतव्य",
    hostname: "होस्टनाम",
    registrableDomain: "पंजीकरण योग्य डोमेन",
    checked: "{count} URL जाँचे गए।",
    tags: "टैग:",
    threatFallback: "खतरा",
    demoTitle: "डेमो डेटा:",
    demoBody:
      "ये परिणाम अंतर्निहित नमूना URL के लिए नकली हैं। ये लाइव स्कैन नहीं हैं।",
    blockedTitle: "SSRF सुरक्षा द्वारा रोका गया:",
    blockedBody: "रोके गए गंतव्य पर कोई अनुरोध नहीं भेजा गया।",
    serviceDetail: "सेवा विवरण:",
    redirectKind: {
      start: "शुरुआत",
      redirect: "रीडायरेक्ट",
      final: "अंतिम",
      blocked: "रोका गया",
      error: "त्रुटि",
    },
  },
  verdict: {
    MALICIOUS: {
      label: "दुर्भावनापूर्ण (पुष्ट)",
      summary:
        "कम से कम एक खतरा-सूचना सेवा ने इस URL के लिए पुष्ट मिलान बताया है। इसे न खोलें और कोई जानकारी दर्ज न करें।",
    },
    SUSPICIOUS: {
      label: "संदिग्ध",
      summary:
        "संदिग्ध URL या रीडायरेक्ट संकेत मिले हैं। यह दुर्भावना का प्रमाण नहीं, लेकिन इस गंतव्य को भरोसेमंद न मानें।",
    },
    NO_KNOWN_THREAT: {
      label: "कोई ज्ञात खतरा नहीं",
      summary:
        "उपलब्ध जाँचों ने कोई ज्ञात खतरा नहीं बताया। यह उस समय की जानकारी है, साइट के सुरक्षित होने की गारंटी नहीं।",
    },
    INCONCLUSIVE: {
      label: "अनिर्णीत",
      summary:
        "उपलब्ध जाँचें अनुपलब्ध या अपूर्ण थीं, या साइट तक नहीं पहुँचा जा सका। सुरक्षा का भरोसेमंद निष्कर्ष नहीं निकाला जा सकता।",
    },
  },
  checkStatus: {
    clean: "कोई मिलान नहीं",
    threat: "खतरा मिलान",
    unavailable: "उपलब्ध नहीं",
    not_configured: "कॉन्फ़िगर नहीं",
    error: "त्रुटि",
    skipped: "छोड़ा गया",
  },
  rdapStatus: {
    ok: "पंजीकरण डेटा प्राप्त",
    not_found: "कोई पंजीकरण रिकॉर्ड नहीं",
    unavailable: "पंजीकरण डेटा उपलब्ध नहीं",
    error: "पंजीकरण जाँच में त्रुटि",
  },
  severity: {
    CRITICAL: "गंभीर",
    HIGH: "उच्च",
    MEDIUM: "मध्यम",
    LOW: "कम",
  },
  limitations:
    "यह उस समय की URL जाँच है। पेज सामग्री, स्क्रिप्ट, डाउनलोड और QR पेलोड नहीं चलाए जाते। खतरा-सेवा मिलान मौजूदा व्यवहार का प्रमाण नहीं; कोई मिलान न मिलना सुरक्षा की गारंटी नहीं। डोमेन पंजीकरण, रीडायरेक्ट और प्रतिष्ठा डेटा अधूरा या अनुपलब्ध हो सकता है।",
  demoLimitations:
    "डेमो मोड: ये नकली परिणाम हैं, लाइव सत्यापन नहीं। असली नेटवर्क और खतरा-सेवा जाँच के लिए PHASE2_DEMO_MODE बंद करें।",
  domainMessages: {
    ok: "RDAP पंजीकरण डेटा प्राप्त हुआ।",
    not_found: "RDAP सेवा के पास इस डोमेन का कोई पंजीकरण रिकॉर्ड नहीं है।",
    unavailable: "इस होस्टनाम के लिए RDAP पंजीकरण डेटा उपलब्ध नहीं है।",
    error: "RDAP पंजीकरण डेटा प्राप्त नहीं हो सका।",
  },
  threatMessages: {
    clean: "इस सेवा ने जाँचे गए URL के लिए कोई मिलान नहीं बताया। यह गारंटी नहीं है।",
    threat: "इस सेवा ने जाँचे गए URL के लिए पुष्ट खतरा मिलान बताया।",
    unavailable: "यह सेवा उपलब्ध नहीं थी, इसलिए इससे कोई खतरा निष्कर्ष नहीं निकलता।",
    not_configured: "यह सेवा कॉन्फ़िगर नहीं है, इसलिए इससे कोई खतरा निष्कर्ष नहीं निकलता।",
    error: "यह सेवा जाँच पूरी नहीं कर सकी। कोई खतरा निष्कर्ष उपलब्ध नहीं।",
    skipped: "यह जाँच छोड़ी गई। कोई खतरा निष्कर्ष उपलब्ध नहीं।",
  },
};

export const URL_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

const NEXT_STEP_HI: Record<string, string> = {
  "Do not open the URL, download files, or enter credentials or payment details.":
    "URL न खोलें, फ़ाइलें डाउनलोड न करें और क्रेडेंशियल या भुगतान विवरण दर्ज न करें।",
  "If you already opened it, run a security scan and change any credentials that may have been exposed.":
    "अगर आपने इसे पहले ही खोल लिया है, तो सुरक्षा स्कैन चलाएँ और जो भी क्रेडेंशियल उजागर हुए हों उन्हें बदलें।",
  "Report the URL at cybercrime.gov.in. If money was transferred, call 1930 immediately.":
    "URL की रिपोर्ट cybercrime.gov.in पर करें। अगर पैसे भेजे गए हैं, तो तुरंत 1930 पर कॉल करें।",
  "Do not enter passwords, OTPs, card details, or UPI PINs on this destination.":
    "इस गंतव्य पर पासवर्ड, OTP, कार्ड विवरण या UPI PIN दर्ज न करें।",
  "Type the organization's official domain yourself or use its verified mobile app instead of following this link.":
    "इस लिंक पर जाने के बजाय संस्था का आधिकारिक डोमेन खुद टाइप करें या उसका सत्यापित मोबाइल ऐप उपयोग करें।",
  "If a redirect was blocked or the chain was truncated, do not try to bypass the protection.":
    "अगर कोई रीडायरेक्ट रोका गया या श्रृंखला काटी गई, तो सुरक्षा को बायपास करने की कोशिश न करें।",
  "If you already shared financial information, call 1930 and contact your bank.":
    "अगर आपने पहले ही वित्तीय जानकारी साझा कर दी है, तो 1930 पर कॉल करें और अपने बैंक से संपर्क करें।",
  "A no-match result is not a guarantee. Verify the domain through an official app or phone number.":
    "कोई मिलान न मिलना गारंटी नहीं है। डोमेन की पुष्टि आधिकारिक ऐप या फ़ोन नंबर से करें।",
  "Do not share OTPs, PINs, passwords, or card details because a website asks you to.":
    "वेबसाइट के कहने पर OTP, PIN, पासवर्ड या कार्ड विवरण साझा न करें।",
  "Be cautious with unsolicited links even when a threat service reports no match.":
    "खतरा सेवा कोई मिलान न बताए तब भी अनचाहे लिंक से सतर्क रहें।",
  "Treat this destination as unverified. Do not enter credentials or payment details.":
    "इस गंतव्य को असत्यापित मानें। क्रेडेंशियल या भुगतान विवरण दर्ज न करें।",
  "Retry later or verify the address through the organization's official app or published helpline.":
    "बाद में फिर कोशिश करें या संस्था के आधिकारिक ऐप या प्रकाशित हेल्पलाइन से पते की पुष्टि करें।",
  "Use a trusted, independently typed domain instead of the submitted link.":
    "सबमिट किए गए लिंक के बजाय भरोसेमंद, खुद टाइप किया गया डोमेन उपयोग करें।",
  "The private/internal redirect was blocked by SSRF protection; never attempt to access it through another tool.":
    "निजी/आंतरिक रीडायरेक्ट SSRF सुरक्षा ने रोका; किसी अन्य टूल से इसे खोलने की कोशिश कभी न करें।",
  "The domain imitates a financial brand. Confirm the official address before taking any action.":
    "यह डोमेन किसी वित्तीय ब्रांड की नकल करता है। कोई कार्रवाई करने से पहले आधिकारिक पते की पुष्टि करें।",
  "The domain is recently registered. Be especially cautious with new domains asking for money or credentials.":
    "डोमेन हाल ही में पंजीकृत है। पैसे या क्रेडेंशियल माँगने वाले नए डोमेन से विशेष सतर्क रहें।",
  "Google Safe Browsing was not available for this scan; absence of a match is not a clean result.":
    "इस स्कैन में Google Safe Browsing उपलब्ध नहीं था; मिलान न होना साफ परिणाम नहीं है।",
  "URLhaus was not available for this scan; absence of a record is not a clean result.":
    "इस स्कैन में URLhaus उपलब्ध नहीं था; रिकॉर्ड न होना साफ परिणाम नहीं है।",
  "A clean result is point-in-time information, not a guarantee that a site is safe.":
    "साफ परिणाम उस समय की जानकारी है, साइट के सुरक्षित होने की गारंटी नहीं।",
  "Type the official domain yourself instead of relying on links in unexpected messages.":
    "अचानक आए संदेशों के लिंक पर निर्भर रहने के बजाय आधिकारिक डोमेन खुद टाइप करें।",
  "Never enter an OTP, PIN, or password because a website or message asks you to.":
    "वेबसाइट या संदेश के कहने पर OTP, PIN या पासवर्ड कभी दर्ज न करें।",
  "Do not enter banking credentials, OTPs, or card details on this site.":
    "इस साइट पर बैंकिंग क्रेडेंशियल, OTP या कार्ड विवरण दर्ज न करें।",
  "Open your bank app or type the official bank address directly.":
    "अपना बैंक ऐप खोलें या आधिकारिक बैंक पता सीधे टाइप करें।",
  "Report suspected phishing to cybercrime.gov.in and, if money was lost, call 1930.":
    "संदिग्ध फ़िशिंग की रिपोर्ट cybercrime.gov.in पर करें और पैसे गए हों तो 1930 पर कॉल करें।",
  "Do not open or download anything from this URL.":
    "इस URL से कुछ भी न खोलें और न डाउनलोड करें।",
  "If you already opened it, disconnect from untrusted networks and run a reputable security scan.":
    "अगर आपने इसे खोल लिया है, तो असुरक्षित नेटवर्क से डिस्कनेक्ट करें और भरोसेमंद सुरक्षा स्कैन चलाएँ।",
  "Report the URL through cybercrime.gov.in. Call 1930 if money or credentials were shared.":
    "URL की रिपोर्ट cybercrime.gov.in पर करें। पैसे या क्रेडेंशियल साझा हुए हों तो 1930 पर कॉल करें।",
  "Do not open the URL in a browser or approve any download prompt.":
    "URL को ब्राउज़र में न खोलें और कोई डाउनलोड संकेत स्वीकार न करें।",
  "Screenshot the warning and report the URL to cybercrime.gov.in.":
    "चेतावनी का स्क्रीनशॉट लें और URL की रिपोर्ट cybercrime.gov.in पर करें।",
};

function localizeWarning(
  warning: UrlWarning,
  language: Language,
  report: UrlAnalysisReport
): UrlWarning {
  if (language === "en") return warning;
  const matchedTld =
    warning.explanation.match(/^\.([a-z0-9-]+) /i)?.[1] ??
    warning.explanation.match(/\.([a-z0-9-]+), which/i)?.[1];
  const brandToken = warning.explanation.match(/“([^”]+)”/)?.[1];
  const brandDomain = warning.explanation.match(
    /registrable domain \(([^)]+)\)/i
  )?.[1];
  const crossDomains = warning.explanation.match(/starts at (\S+) and ends at (\S+)\./i);
  const registryStatus = warning.explanation.match(/“([^”]+)”\./)?.[1];
  const age =
    typeof report.domain.ageDays === "number"
      ? String(report.domain.ageDays)
      : warning.explanation.match(/created (\d+) day/i)?.[1] ?? "";

  switch (warning.id) {
    case "URL_SHORTENER":
      return {
        ...warning,
        label: "URL शॉर्टनर असली गंतव्य छिपाता है",
        explanation:
          "यह होस्टनाम लिंक शॉर्टनर है। असली गंतव्य केवल रीडायरेक्ट श्रृंखला फॉलो करने के बाद दिखता है।",
      };
    case "SUSPICIOUS_TLD":
      return {
        ...warning,
        label: "कम प्रतिष्ठा वाला टॉप-लेवल डोमेन",
        explanation: `.${matchedTld ?? "यह TLD"} अक्सर अस्थायी फ़िशिंग और धोखाधड़ी साइटों के लिए उपयोग होता है। यह अकेले दुर्भावना का प्रमाण नहीं।`,
      };
    case "IP_LITERAL_HOST":
      return {
        ...warning,
        label: "डोमेन नाम के बजाय सीधा IP पता",
        explanation:
          "वैध उपभोक्ता बैंकिंग और भुगतान सेवाएँ सामान्यतः ब्रांडेड डोमेन नाम उपयोग करती हैं, केवल IP पता नहीं।",
      };
    case "PUNYCODE_HOST":
      return {
        ...warning,
        label: "अंतरराष्ट्रीय जैसा दिखने वाला एन्कोडेड डोमेन",
        explanation:
          "होस्टनाम में punycode है। कुछ homograph हमले भरोसेमंद ब्रांड की नकल के लिए मिलते-जुलते अंतरराष्ट्रीय अक्षर उपयोग करते हैं।",
      };
    case "BRAND_LOOKALIKE":
      return {
        ...warning,
        label: "भरोसेमंद वित्तीय ब्रांड की संभावित नकल",
        explanation: `होस्टनाम में “${brandToken ?? "ब्रांड"}” है, लेकिन पंजीकरण योग्य डोमेन (${brandDomain ?? report.registrableDomain}) उस ब्रांड के ज्ञात आधिकारिक डोमेन में नहीं है। आधिकारिक पता खुद टाइप करके पुष्टि करें।`,
      };
    case "CREDENTIAL_KEYWORDS_IN_HOST":
      return {
        ...warning,
        label: "अविश्वसनीय होस्ट के साथ लॉगिन या सत्यापन शब्द",
        explanation:
          "होस्टनाम में login, verify, KYC या secure जैसे शब्द फ़िशिंग पेज को आधिकारिक दिखाने के लिए अक्सर उपयोग होते हैं।",
      };
    case "EXCESSIVE_SUBDOMAINS":
      return {
        ...warning,
        label: "बहुत गहराई तक बने सबडोमेन",
        explanation:
          "लंबी सबडोमेन श्रृंखला जल्दी पढ़ने पर धोखाधड़ी वाले होस्टनाम को भरोसेमंद डोमेन का हिस्सा जैसा दिखा सकती है।",
      };
    case "SENSITIVE_PATH_KEYWORDS":
      return {
        ...warning,
        label: "लॉगिन, भुगतान या सत्यापन से जुड़ा URL पथ",
        explanation:
          "पथ या क्वेरी में खाता पहुँच या भुगतान गतिविधि का जिक्र है। अचानक मिले लिंक से खुलने वाले क्रेडेंशियल संकेतों से सतर्क रहें।",
      };
    case "NO_HTTPS":
      return {
        ...warning,
        label: "कनेक्शन HTTPS नहीं है",
        explanation:
          "सबमिट किया गया URL सामान्य HTTP उपयोग करता है। HTTP पेज पर दर्ज क्रेडेंशियल या भुगतान विवरण रोके जा सकते हैं।",
      };
    case "LONG_REDIRECT_CHAIN":
      return {
        ...warning,
        label: "लंबी रीडायरेक्ट श्रृंखला",
        explanation: `${report.redirectCount} रीडायरेक्ट फॉलो किए गए। लंबी श्रृंखलाएँ कभी अंतिम गंतव्य छिपाने या ब्लॉकसूचियों से बचने के लिए उपयोग होती हैं।`,
      };
    case "REDIRECT_LIMIT_REACHED":
      return {
        ...warning,
        label: "अंतिम गंतव्य से पहले रीडायरेक्ट सीमा पूरी",
        explanation: `श्रृंखला तय सीमा ${report.redirectLimit} रीडायरेक्ट से आगे बढ़ गई। अंतिम गंतव्य की पुष्टि नहीं हो सकी।`,
      };
    case "REDIRECT_LOOP":
      return {
        ...warning,
        label: "रीडायरेक्ट लूप मिला",
        explanation:
          "URL बार-बार पहले देखे गए पते पर लौट रहा था। यह बचने वाला या टूटा रीडायरेक्ट जाल हो सकता है।",
      };
    case "BLOCKED_REDIRECT":
      return {
        ...warning,
        label: "SSRF सुरक्षा ने रीडायरेक्ट रोका",
        explanation:
          "एक रीडायरेक्ट localhost, निजी, लिंक-लोकल या आरक्षित नेटवर्क पते पर जा रहा था। उस गंतव्य से संपर्क करने से पहले अनुरोध रोक दिया गया।",
      };
    case "HTTPS_DOWNGRADE":
      return {
        ...warning,
        label: "रीडायरेक्ट HTTPS को HTTP में बदलता है",
        explanation:
          "श्रृंखला एन्क्रिप्टेड HTTPS से सामान्य HTTP पर जाती है, जिससे अंतिम पेज पर भेजा गया डेटा उजागर हो सकता है।",
      };
    case "REDIRECT_TO_IP":
      return {
        ...warning,
        label: "रीडायरेक्ट श्रृंखला सीधे IP पते पर खत्म",
        explanation:
          "अंतिम गंतव्य नामित डोमेन के बजाय IP पता उपयोग करता है, जो वैध उपभोक्ता सेवाओं के लिए असामान्य है।",
      };
    case "CROSS_DOMAIN_REDIRECT":
      return {
        ...warning,
        label: "रीडायरेक्ट दूसरे पंजीकरण योग्य डोमेन पर जाता है",
        explanation: `श्रृंखला ${crossDomains?.[1] ?? report.registrableDomain} से शुरू होकर ${crossDomains?.[2] ?? "दूसरे डोमेन"} पर खत्म होती है। क्रॉस-डोमेन रीडायरेक्ट सामान्य हैं, फिर भी जाँचें।`,
      };
    case "DOMAIN_VERY_NEW":
      return {
        ...warning,
        label: "डोमेन बहुत हाल में पंजीकृत",
        explanation: `RDAP के अनुसार यह डोमेन ${age} दिन पहले बना। नए डोमेन छोटी अवधि के धोखाधड़ी अभियानों में अधिक उपयोग होते हैं।`,
      };
    case "DOMAIN_RECENT":
      return {
        ...warning,
        label: "डोमेन 30 दिन से कम पुराना",
        explanation: `RDAP के अनुसार यह डोमेन ${age} दिन पहले बना। भरोसा करने से पहले आधिकारिक माध्यम से डोमेन की पुष्टि करें।`,
      };
    case "REGISTRY_HOLD":
      return {
        ...warning,
        label: "डोमेन पर प्रतिबंधात्मक रजिस्ट्री स्थिति",
        explanation: `RDAP रजिस्ट्री स्थिति “${registryStatus ?? "प्रतिबंधित"}” बताती है। ऐसे डोमेन निलंबित या हटाए जाने की स्थिति में हो सकते हैं।`,
      };
    case "DNS_LOOKUP_FAILED":
      return {
        ...warning,
        label: "होस्टनाम हल नहीं हो सका",
        explanation:
          "DNS हल नहीं हुआ, इसलिए लाइव रीडायरेक्ट और उत्तर नहीं जाँचे जा सके। डोमेन नया, गलत टाइप, ब्लॉक या अस्थायी रूप से अनुपलब्ध हो सकता है।",
      };
    case "REQUEST_TIMEOUT":
      return {
        ...warning,
        label: "वेबसाइट समय-सीमा में उत्तर नहीं दिया",
        explanation:
          "सर्वर तय समय में उत्तर नहीं दिया। उपलब्ध खतरा-सेवा परिणाम अंतिम गंतव्य का वर्णन नहीं कर सकते।",
      };
    case "NETWORK_UNAVAILABLE":
      return {
        ...warning,
        label: "वेबसाइट तक नहीं पहुँचा जा सका",
        explanation:
          "नेटवर्क त्रुटि के कारण रीडायरेक्ट श्रृंखला पूरी नहीं हो सकी। पहुँच से बाहर गंतव्य को सुरक्षित नहीं, असत्यापित मानें।",
      };
    default:
      return warning;
  }
}

export function localizeUrlReport(report: UrlAnalysisReport, language: Language) {
  const copy = URL_COPY[language];
  if (language === "en") {
    return {
      verdictLabel: copy.verdict[report.verdict].label,
      summary: report.summary,
      warnings: report.warnings,
      nextSteps: report.nextSteps,
      limitations: report.limitations,
      domainMessage: report.domain.message,
      threatMessages: {
        safeBrowsing: report.threats.safeBrowsing.message,
        urlhaus: report.threats.urlhaus.message,
      },
    };
  }

  const summary =
    report.verdict === "INCONCLUSIVE" && report.blocked
      ? "विश्लेषण रोका गया क्योंकि एक रीडायरेक्ट आंतरिक या आरक्षित नेटवर्क पते पर जा रहा था। गंतव्य अविश्वसनीय है।"
      : report.verdict === "INCONCLUSIVE" && report.redirectChainTruncated
        ? "रीडायरेक्ट श्रृंखला तय सीमा से आगे बढ़ी, इसलिए अंतिम गंतव्य सत्यापित नहीं हो सका।"
        : copy.verdict[report.verdict].summary;

  return {
    verdictLabel: copy.verdict[report.verdict].label,
    summary,
    warnings: report.warnings.map((warning) =>
      localizeWarning(warning, language, report)
    ),
    nextSteps: report.nextSteps.map((step) => NEXT_STEP_HI[step] ?? step),
    limitations: report.demo ? copy.demoLimitations : copy.limitations,
    domainMessage: copy.domainMessages[report.domain.status],
    threatMessages: {
      safeBrowsing: copy.threatMessages[report.threats.safeBrowsing.status],
      urlhaus: copy.threatMessages[report.threats.urlhaus.status],
    },
  };
}

export function localizeThreatStatus(
  status: CheckStatus,
  language: Language
): string {
  return URL_COPY[language].checkStatus[status];
}

export function localizeRdapStatus(
  status: RdapStatus,
  language: Language
): string {
  return URL_COPY[language].rdapStatus[status];
}

export function localizeSeverity(
  severity: WarningSeverity,
  language: Language
): string {
  return language === "en" ? severity : URL_COPY[language].severity[severity];
}

export function localizeRedirectKind(
  kind: RedirectHopKind,
  language: Language
): string {
  return URL_COPY[language].ui.redirectKind[kind];
}

export function localizeThreatMessage(
  check: ThreatCheckResult,
  language: Language
): string {
  if (language === "en") return check.message;
  return URL_COPY[language].threatMessages[check.status];
}

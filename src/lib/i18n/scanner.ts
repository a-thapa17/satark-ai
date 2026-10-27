import type { Language, LocalizedShape } from "./language";
import { formatTemplate } from "./language";
import type { DetectedSignal, ScanReport } from "@/lib/scanner/types";

const en = {
  ui: {
    panelLabel: "Paste suspicious message",
    analyzedLocally: "Analyzed entirely in your browser",
    hybridMode: "Hybrid: rules + redacted AI layer",
    textareaLabel: "Message input for scam analysis",
    placeholder:
      "Paste an SMS, WhatsApp message, email, or any suspicious text here…\n\nExample: \"Your account will be blocked in 10 mins. Click here to verify KYC.\"",
    samplesHeading: "Try a sample:",
    sampleLabels: [
      "Fake SBI KYC SMS",
      "Electricity disconnection scam",
      "Legitimate HDFC OTP",
      "Telegram task scam",
    ],
    errorEmpty: "Please paste or type a message before scanning.",
    errorTooLong:
      "Message is too long ({count} characters). Please keep it under {max} characters.",
    errorAnalysis: "Analysis failed. Please try again.",
    clear: "Clear",
    scan: "Scan message",
    scanWithAi: "Scan with AI intelligence",
    scanningRules: "Evaluating rules…",
    scanningAi: "Consulting Gemini AI…",
    loadingRulesTitle: "Evaluating deterministic threat rules…",
    loadingRulesBody: "Evaluating in-browser heuristic regex signatures",
    loadingAiTitle: "Consulting Google Gemini AI for contextual evidence…",
    loadingAiBody: "Transmitting pre-masked text over an encrypted server connection",
    aiToggleTitle:
      "Enhanced AI analysis — sends redacted message text to Google Gemini.",
    aiToggleBody:
      "Rules-only analysis remains the default. When enabled, sensitive identifiers (Aadhaar, cards, OTPs, phones, emails) are masked in-browser before transmission. No text is stored or logged. Masking is heuristic and not guaranteed 100% complete.",
    scoreLabel: "Heuristic risk score",
    scoreNote:
      "Heuristic 0–100 estimate from rules (and validated AI evidence if enabled), not a probability.",
    assessmentLabel: "Overall risk assessment",
    confidenceLabel: "Confidence: {value}",
    resultReady: "Analysis complete. Results are now available below.",
    resultRunning: "Analysis in progress. Please wait.",
    aiTitle: "AI contextual security analysis",
    aiInformational:
      "AI-generated findings may appear in English. The deterministic rule result and the separate safe-steps checklist remain authoritative.",
    aiInterpretation: "AI contextual interpretation",
    aiEvidence: "Message evidence",
    aiRecommendations: "AI-suggested next steps (unverified)",
    aiTactics: "Manipulation tactics:",
    aiLimitations: "Limitations:",
    aiFallbackTitle: "AI analysis notice:",
    aiFallback:
      "Local deterministic findings are shown. The AI layer is unavailable right now; your message was not re-sent or stored.",
    findingsTitle: "Deterministic rule-based findings",
    evaluatedLocally: "Evaluated locally",
    ruleMatches: "Rule matches",
    ruleAssessment: "Rule-based assessment",
    noReasons: "Rule-based analysis found no typical keyword or pattern indicators.",
    showSignals: "Show all matched signals ({count})",
    hideSignals: "Hide all matched signals ({count})",
    points: "+{count} pts",
    safeSteps: "Safe next steps",
    noSteps: "Stay vigilant and verify senders through official channels.",
    call1930: "Call 1930 cyber fraud helpline",
    maskedPreview: "Analyzed text (PII redacted in browser)",
    privacyLocal:
      "Analyzed entirely in your browser. Message content is never sent to a server, stored, or logged.",
    privacyAi:
      "Enhanced AI mode: redacted text (PII masked in browser) is analyzed via Google Gemini. No message content is stored or logged.",
    languageNote:
      "Hindi interface selected. Message detection rules are currently tuned for English text; treat the rule result as a warning sign, not a guarantee.",
  },
  verdict: {
    HIGH_RISK: {
      label: "High risk",
      summary:
        "Strong evidence of a known digital scam pattern. Do not click, pay, or reply.",
    },
    SUSPICIOUS: {
      label: "Suspicious",
      summary:
        "Several warning indicators detected. Verify through official channels before taking action.",
    },
    NO_STRONG_WARNING: {
      label: "No strong warning",
      summary:
        "No strong warning signs found. A low heuristic score does not guarantee absolute safety.",
    },
  },
  confidence: {
    High: "High",
    Medium: "Medium",
    Low: "Low",
  },
  categories: {
    "General Communication": "General communication",
    "Digital Arrest / Extortion": "Digital arrest / extortion",
    "Utility Disconnection (Bijli Scam)": "Utility disconnection (Bijli scam)",
    "UPI / Payment Fraud": "UPI / payment fraud",
    "Bank Impersonation / Phishing": "Bank impersonation / phishing",
    "Credential Harvesting": "Credential harvesting",
    "Delivery / Courier Phishing": "Delivery / courier phishing",
    "Investment / Trading Scam": "Investment / trading scam",
    "Refund / Advance-Fee Scam": "Refund / advance-fee scam",
    "Prize / Bank-Details Lure": "Prize / bank-details lure",
    "Job / Prize Lure": "Job / prize lure",
    "Malicious App / APK Lure": "Malicious app / APK lure",
    "Suspicious Link / Phishing": "Suspicious link / phishing",
  },
  reasons: {
    defensive:
      "The message contains a standard protective advisory, such as an explicit instruction not to share OTPs or PINs.",
    noWarning:
      "Rule-based analysis found no typical keyword or pattern indicators such as credential requests, coercive deadlines, or known suspicious-link patterns.",
  },
  urlLimitation:
    "A link was present; its reputation, destination, and actual behavior were not checked.",
  limitations:
    "Deterministic heuristic analysis provides an educational risk estimate (not a probability or proof). Scammers continually adapt tactics. Always independently verify senders through official directories.",
  noStep:
    "Even without obvious red flags, always verify unexpected payment or KYC requests through official channels.",
} as const;

const hi: LocalizedShape<typeof en> = {
  ui: {
    panelLabel: "संदिग्ध संदेश पेस्ट करें",
    analyzedLocally: "पूरी जाँच आपके ब्राउज़र में",
    hybridMode: "हाइब्रिड: नियम + छिपाया गया AI",
    textareaLabel: "धोखाधड़ी जाँच के लिए संदेश इनपुट",
    placeholder:
      "SMS, WhatsApp संदेश, ईमेल या कोई संदिग्ध टेक्स्ट यहाँ पेस्ट करें…\n\nउदाहरण: \"आपका खाता 10 मिनट में बंद हो जाएगा। KYC सत्यापित करने के लिए यहाँ क्लिक करें।\"",
    samplesHeading: "नमूना आज़माएँ:",
    sampleLabels: [
      "फ़र्ज़ी SBI KYC SMS",
      "बिजली कटौती धोखाधड़ी",
      "असली जैसा HDFC OTP",
      "Telegram टास्क धोखाधड़ी",
    ],
    errorEmpty: "स्कैन करने से पहले संदेश पेस्ट या टाइप करें।",
    errorTooLong:
      "संदेश बहुत लंबा है ({count} अक्षर)। कृपया इसे {max} अक्षरों से कम रखें।",
    errorAnalysis: "विश्लेषण विफल रहा। कृपया फिर कोशिश करें।",
    clear: "साफ़ करें",
    scan: "संदेश स्कैन करें",
    scanWithAi: "AI जानकारी के साथ स्कैन करें",
    scanningRules: "नियम जाँच रहे हैं…",
    scanningAi: "Gemini AI से परामर्श…",
    loadingRulesTitle: "नियत खतरा नियमों की जाँच हो रही है…",
    loadingRulesBody: "ब्राउज़र में heuristic regex संकेतों का मूल्यांकन",
    loadingAiTitle: "संदर्भ साक्ष्य के लिए Google Gemini AI से परामर्श…",
    loadingAiBody: "पहले से छिपाया गया टेक्स्ट एन्क्रिप्टेड सर्वर कनेक्शन से भेजा जा रहा है",
    aiToggleTitle:
      "उन्नत AI विश्लेषण — छिपाया गया संदेश टेक्स्ट Google Gemini को भेजता है।",
    aiToggleBody:
      "डिफ़ॉल्ट रूप से केवल नियम-आधारित जाँच होती है। चालू करने पर Aadhaar, कार्ड, OTP, फ़ोन और ईमेल जैसी संवेदनशील जानकारी भेजने से पहले ब्राउज़र में छिपाई जाती है। कोई टेक्स्ट सहेजा या लॉग नहीं होता। मास्किंग heuristic है और 100% पूर्ण होने की गारंटी नहीं है।",
    scoreLabel: "heuristic जोखिम स्कोर",
    scoreNote:
      "नियमों (और चालू होने पर सत्यापित AI साक्ष्य) से 0–100 का अनुमान, किसी संभावना का माप नहीं।",
    assessmentLabel: "समग्र जोखिम मूल्यांकन",
    confidenceLabel: "विश्वास: {value}",
    resultReady: "विश्लेषण पूरा हुआ। परिणाम नीचे उपलब्ध हैं।",
    resultRunning: "विश्लेषण चल रहा है। कृपया प्रतीक्षा करें।",
    aiTitle: "AI संदर्भिक सुरक्षा विश्लेषण",
    aiInformational:
      "AI से बनी जानकारी अंग्रेज़ी में दिख सकती है। नियत नियम परिणाम और अलग सुरक्षित-कदम सूची ही मुख्य हैं।",
    aiInterpretation: "AI संदर्भिक व्याख्या",
    aiEvidence: "संदेश में साक्ष्य",
    aiRecommendations: "AI के सुझाए अगले कदम (असत्यापित)",
    aiTactics: "हेरफ़ेर के तरीके:",
    aiLimitations: "सीमाएँ:",
    aiFallbackTitle: "AI विश्लेषण सूचना:",
    aiFallback:
      "स्थानीय नियत निष्कर्ष दिखाए गए हैं। AI परत अभी उपलब्ध नहीं है; आपका संदेश दोबारा नहीं भेजा गया और न ही सहेजा गया।",
    findingsTitle: "नियत नियम-आधारित निष्कर्ष",
    evaluatedLocally: "स्थानीय रूप से जाँचा गया",
    ruleMatches: "नियम मेल",
    ruleAssessment: "नियम-आधारित मूल्यांकन",
    noReasons:
      "नियम-आधारित जाँच में सामान्य कीवर्ड या पैटर्न संकेत नहीं मिले।",
    showSignals: "सभी मिले संकेत दिखाएँ ({count})",
    hideSignals: "सभी मिले संकेत छिपाएँ ({count})",
    points: "+{count} अंक",
    safeSteps: "सुरक्षित अगले कदम",
    noSteps: "सतर्क रहें और प्रेषक की पुष्टि आधिकारिक माध्यमों से करें।",
    call1930: "1930 साइबर धोखाधड़ी हेल्पलाइन पर कॉल करें",
    maskedPreview: "जाँचा गया टेक्स्ट (ब्राउज़र में संवेदनशील जानकारी छिपी)",
    privacyLocal:
      "पूरी जाँच आपके ब्राउज़र में होती है। संदेश की सामग्री किसी सर्वर पर नहीं भेजी, सहेजी या लॉग की जाती।",
    privacyAi:
      "उन्नत AI मोड: छिपाया गया टेक्स्ट (ब्राउज़र में PII मास्क) Google Gemini से जाँचा जाता है। कोई संदेश सामग्री सहेजी या लॉग नहीं होती।",
    languageNote:
      "हिन्दी इंटरफ़ेस चुना गया है। संदेश पहचान नियम अभी मुख्य रूप से अंग्रेज़ी टेक्स्ट के लिए बने हैं; नियम परिणाम को चेतावनी संकेत मानें, गारंटी नहीं।",
  },
  verdict: {
    HIGH_RISK: {
      label: "उच्च जोखिम",
      summary:
        "किसी ज्ञात डिजिटल धोखाधड़ी पैटर्न के प्रबल संकेत मिले हैं। क्लिक, भुगतान या उत्तर न दें।",
    },
    SUSPICIOUS: {
      label: "संदिग्ध",
      summary:
        "कई चेतावनी संकेत मिले हैं। कार्रवाई से पहले आधिकारिक माध्यमों से पुष्टि करें।",
    },
    NO_STRONG_WARNING: {
      label: "कोई प्रबल चेतावनी नहीं",
      summary:
        "कोई प्रबल चेतावनी संकेत नहीं मिला। कम heuristic स्कोर पूर्ण सुरक्षा की गारंटी नहीं देता।",
    },
  },
  confidence: {
    High: "उच्च",
    Medium: "मध्यम",
    Low: "कम",
  },
  categories: {
    "General Communication": "सामान्य संचार",
    "Digital Arrest / Extortion": "डिजिटल अरेस्ट / जबरन वसूली",
    "Utility Disconnection (Bijli Scam)": "बिजली कटौती धोखाधड़ी",
    "UPI / Payment Fraud": "UPI / भुगतान धोखाधड़ी",
    "Bank Impersonation / Phishing": "बैंक प्रतिरूपण / फ़िशिंग",
    "Credential Harvesting": "क्रेडेंशियल चोरी",
    "Delivery / Courier Phishing": "डिलीवरी / कूरियर फ़िशिंग",
    "Investment / Trading Scam": "निवेश / ट्रेडिंग धोखाधड़ी",
    "Refund / Advance-Fee Scam": "रिफंड / अग्रिम शुल्क धोखाधड़ी",
    "Prize / Bank-Details Lure": "इनाम / बैंक विवरण का जाल",
    "Job / Prize Lure": "नौकरी / इनाम का जाल",
    "Malicious App / APK Lure": "दुर्भावनापूर्ण ऐप / APK जाल",
    "Suspicious Link / Phishing": "संदिग्ध लिंक / फ़िशिंग",
  },
  reasons: {
    defensive:
      "संदेश में सामान्य सुरक्षा सलाह है, जैसे OTP या PIN किसी से साझा न करने का स्पष्ट निर्देश।",
    noWarning:
      "नियम-आधारित जाँच में क्रेडेंशियल माँग, दबाव वाली समय-सीमा या ज्ञात संदिग्ध लिंक जैसे सामान्य संकेत नहीं मिले।",
  },
  urlLimitation:
    "संदेश में लिंक था; उसकी प्रतिष्ठा, गंतव्य और वास्तविक व्यवहार की जाँच नहीं की गई।",
  limitations:
    "नियत heuristic विश्लेषण केवल शैक्षिक जोखिम अनुमान देता है, संभावना या प्रमाण नहीं। ठग अपने तरीके बदलते रहते हैं। प्रेषक की पुष्टि हमेशा आधिकारिक निर्देशिका से करें।",
  noStep:
    "स्पष्ट खतरे के संकेत न होने पर भी अचानक आए भुगतान या KYC अनुरोध की पुष्टि आधिकारिक माध्यमों से करें।",
};

export const SCANNER_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

interface SignalTranslation {
  label: string;
  explanation: string;
}

const HI_SIGNALS: Record<string, SignalTranslation> = {
  DEF_DO_NOT_SHARE: {
    label: "वैध सुरक्षा सलाह शामिल",
    explanation:
      "संदेश में यह सामान्य सुरक्षा सलाह है कि प्राप्तकर्ता अपना OTP, PIN या पासवर्ड किसी से कभी साझा न करे। यह वैध बैंकों और संस्थानों का सामान्य तरीका है।",
  },
  DEF_STANDARD_BANK_UPDATE: {
    label: "मानक लेन-देन सूचना प्रारूप",
    explanation:
      "संदेश भारतीय बैंकिंग सूचना के सामान्य प्रारूप में है (डेबिट/क्रेडिट राशि, शेष राशि, व्यापारी संदर्भ) और प्राप्तकर्ता से कोई कार्रवाई नहीं माँगता।",
  },
  CRED_SOLICIT_ACTIVE: {
    label: "OTP, PIN या पासवर्ड साझा करने का अनुरोध",
    explanation:
      "वैध बैंक, सरकारी विभाग और सेवा प्रदाता कभी आपसे OTP, PIN, CVV या पासवर्ड बताने, आगे भेजने या उत्तर में देने को नहीं कहते। सत्यापन कोड माँगने वाला संदेश लगभग निश्चित रूप से धोखाधड़ी है।",
  },
  CRED_VERIFY_CREDENTIALS: {
    label: "लिंक से बैंकिंग क्रेडेंशियल सत्यापित करने की माँग",
    explanation:
      "खाता चालू रखने के बहाने 'नेटबैंकिंग सत्यापित करें', 'कार्ड विवरण पुष्टि करें' या 'CVV/एक्सपायरी जमा करें' कहना फ़िशिंग का सामान्य जाल है, जिससे लॉगिन जानकारी चुराई जाती है।",
  },
  URG_TIME_LIMIT: {
    label: "कृत्रिम उलटी गिनती या तुरंत समय-सीमा",
    explanation:
      "ठग '10 मिनट में', '24 घंटे में' या 'तुरंत कार्रवाई जरूरी' जैसी झूठी तात्कालिकता बनाते हैं ताकि व्यक्ति बिना पुष्टि किए जल्दी कदम उठा ले।",
  },
  URG_SERVICE_BLOCK: {
    label: "खाता बंद या ब्लॉक होने की धमकी",
    explanation:
      "आपका बैंक खाता, सिम या PAN कार्ड 'ब्लॉक', 'निष्क्रिय' या 'निलंबित' होने की धमकी डराने और जल्दी मानने पर मजबूर करने की पुरानी रणनीति है।",
  },
  URG_UTILITY_DISCONNECTION: {
    label: "बिजली कटौती धोखाधड़ी (बिजली स्कैम)",
    explanation:
      "भारत में फैली यह धोखाधड़ी कहती है कि बिजली बिल अपडेट नहीं हुआ और आज रात 9:30 बजे कनेक्शन काट दिया जाएगा, फिर अनधिकृत मोबाइल नंबर पर कॉल करने को कहती है।",
  },
  URG_LEGAL_ARREST_EXTORTION: {
    label: "डिजिटल अरेस्ट / कानून प्रवर्तन का दबाव",
    explanation:
      "फ़र्ज़ी पुलिस, CBI, सीमा शुल्क या अदालत वीडियो कॉल पर तुरंत गिरफ्तारी, कूरियर में नशीला सामान या मनी लॉन्ड्रिंग का डर दिखाती है ('डिजिटल अरेस्ट')। असली कानून प्रवर्तन एजेंसियाँ WhatsApp, Skype या SMS पर गिरफ्तारी वारंट जारी नहीं करतीं।",
  },
  IMP_FAKE_KYC: {
    label: "अचानक KYC समाप्ति / अपडेट का जाल",
    explanation:
      "बैंक कभी SMS या WhatsApp लिंक से KYC दस्तावेज अपडेट करने को नहीं कहते। वैध KYC अपडेट केवल आधिकारिक बैंक शाखा या प्रमाणित बैंक ऐप में होता है।",
  },
  IMP_MAJOR_INDIAN_BANK: {
    label: "बड़े वित्तीय संस्थान का प्रतिरूपण",
    explanation:
      "ठग अक्सर SBI, HDFC, ICICI, Axis, PNB या RBI जैसे प्रमुख भारतीय संस्थानों का नाम इस्तेमाल करके भरोसा जीतने की कोशिश करते हैं।",
  },
  LINK_SHORTENER: {
    label: "छिपा या छोटा किया गया URL (URL शॉर्टनर)",
    explanation:
      "bit.ly, tinyurl, is.gd, cutt.ly जैसे URL शॉर्टनर असली गंतव्य डोमेन छिपाते हैं, जिससे धोखाधड़ी वाले पेज सुरक्षा स्कैनर और उपयोगकर्ता दोनों से बच जाते हैं।",
  },
  LINK_LOOKALIKE_DOMAIN: {
    label: "संदिग्ध ब्रांड / बैंक जैसा दिखने वाला डोमेन",
    explanation:
      "अनधिकृत डोमेन जिनमें 'sbi-kyc', 'hdfc-support', 'amazon-delivery-help' या 'yono-verify' जैसे भरोसेमंद ब्रांड नाम या .top, .xyz, .cc, .buzz जैसे संदिग्ध TLD होते हैं, वैध पोर्टल जैसा दिखने के लिए बनाए जाते हैं।",
  },
  LINK_RAW_IP_ADDRESS: {
    label: "लिंक में सीधा IP पता",
    explanation:
      "वैध उपभोक्ता सेवाएँ उपयोगकर्ता लॉगिन या ग्राहक पोर्टल के लिए कच्चे IP पते (जैसे http://192.168.x.x:8080) का उपयोग नहीं करतीं।",
  },
  PAY_RECEIVE_REQUIRES_PIN: {
    label: "UPI 'पैसे प्राप्त करें' धोखाधड़ी (PIN / स्कैन से प्राप्ति)",
    explanation:
      "UPI का मूल नियम: पैसे प्राप्त करने के लिए आपको कभी UPI PIN दर्ज करने या QR स्कैन करने की जरूरत नहीं। PIN दर्ज करने पर हमेशा आपके खाते से पैसे कटते हैं।",
  },
  PAY_ADVANCE_FEE_REFUND: {
    label: "अग्रिम प्रोसेसिंग शुल्क / रिफंड का जाल",
    explanation:
      "लंबित रिफंड, कर वापसी या इनाम के बहाने पहले 'प्रोसेसिंग शुल्क' या 'क्लीयरेंस जमा' माँगना धोखाधड़ी है।",
  },
  PAY_LOAN_APPROVAL_FEE: {
    label: "लोन मंज़ूरी के नाम पर अग्रिम शुल्क धोखाधड़ी",
    explanation:
      "मंज़ूर लोन सीधे पंजीकृत ऋणदाता से मिलता है। वितरण से पहले प्रोसेसिंग, सक्रियण, बीमा या दस्तावेज़ शुल्क माँगना सामान्य अग्रिम-शुल्क धोखाधड़ी है।",
  },
  INVEST_GUARANTEED_HIGH_RETURN: {
    label: "गारंटीशुदा ऊँचे रिटर्न का निवेश जाल",
    explanation:
      "रोज़, हफ़्ते या महीने का गारंटीशुदा रिटर्न या पैसा दोगुना करने का वादा निवेश धोखाधड़ी का संकेत है। नियमित बाज़ार निवेश में तय ऊँचा रिटर्न कभी गारंटीशुदा नहीं होता।",
  },
  JOB_TASK_TELEGRAM: {
    label: "पार्ट-टाइम टास्क धोखाधड़ी (YouTube लाइक / Telegram टास्क)",
    explanation:
      "कम मेहनत में ₹2,000–₹8,000 रोज़ कमाने का वादा (जैसे YouTube वीडियो लाइक करना या Google Maps पर होटल समीक्षा) आगे Telegram ग्रुप में पहले पैसे जमा करने की माँग में बदल जाता है।",
  },
  JOB_LOTTERY_KBC_PRIZE: {
    label: "लॉटरी / लकी ड्रॉ / KBC इनाम का दावा",
    explanation:
      "झूठा दावा कि आपने कोई लॉटरी या लकी ड्रॉ जीता है (जैसे कौन बनेगा करोड़पति / WhatsApp लकी ड्रॉ), जिसमें आपने कभी भाग ही नहीं लिया।",
  },
  APP_MALICIOUS_APK: {
    label: "सीधे APK फ़ाइल डाउनलोड का जाल",
    explanation:
      "Google Play Store जैसे आधिकारिक ऐप स्टोर के बाहर से .apk फ़ाइल डाउनलोड और इंस्टॉल करने का अनुरोध। बाहरी APK में अक्सर keylogger और SMS चोर होते हैं जो बैंक OTP चुराते हैं।",
  },
  APP_REMOTE_ACCESS_SOFTWARE: {
    label: "रिमोट स्क्रीन-शेयर टूल का अनुरोध",
    explanation:
      "'कस्टमर केयर सहायता' के बहाने AnyDesk, TeamViewer, RustDesk या QuickSupport जैसे स्क्रीन-शेयरिंग ऐप इंस्टॉल करने को कहना ठग को आपके फ़ोन और बैंकिंग ऐप पर पूरा रिमोट नियंत्रण दे देता है।",
  },
  ID_DOCUMENT_REQUEST: {
    label: "पहचान दस्तावेज की फ़ोटो माँगना",
    explanation:
      "आधार कार्ड, PAN कार्ड या रद्द चेक की फ़ोटो WhatsApp, Telegram या असत्यापित ईमेल पर भेजने का अनुरोध।",
  },
  IMP_DELIVERY_PAYMENT_LURE: {
    label: "डिलीवरी / कूरियर शुल्क या पता अपडेट का जाल",
    explanation:
      "संदेश दावा करता है कि पार्सल लंबित, रोका गया या वापस हुआ है और लिंक से शुल्क या पता अपडेट माँगता है। यह डिलीवरी फ़िशिंग का सामान्य तरीका है। पार्सल केवल कूरियर के आधिकारिक ऐप या वेबसाइट पर ट्रैक करें।",
  },
  CTX_REFUND_WITH_FEE: {
    label: "रिफंड या कर वापसी के साथ पहले शुल्क की माँग",
    explanation:
      "रिफंड, रिबेट या प्रतिपूर्ति जारी करने के लिए प्रोसेसिंग, क्लीयरेंस या सत्यापन शुल्क माँगना प्रबल अग्रिम-शुल्क धोखाधड़ी है। असली रिफंड के लिए आपसे पहले पैसे नहीं माँगे जाते।",
  },
  CTX_PRIZE_WITH_BANK_DETAILS: {
    label: "इनाम के दावे में बैंक या पहचान विवरण की माँग",
    explanation:
      "इनाम, लॉटरी या रिवॉर्ड के नाम पर बैंक खाता संख्या, IFSC, कार्ड विवरण, आधार, PAN या रद्द चेक माँगना संवेदनशील पहचान और भुगतान डेटा इकट्ठा करने का जाल है। असली इनाम संदेश में ये विवरण नहीं माँगे जाते।",
  },
  CTX_PRIZE_LURE_WITH_LINK: {
    label: "अनचाहा इनाम या मुफ़्त उपहार और लिंक साथ में",
    explanation:
      "कीमती मुफ़्त चीज़ का अनचाहा प्रस्ताव और साथ में क्लिक लिंक इनाम/फ़िशिंग का सामान्य जाल है। लिंक की प्रतिष्ठा और गंतव्य की जाँच नहीं की गई; यह डोमेन के दुर्भावनापूर्ण होने का प्रमाण नहीं है।",
  },
  CTX_PRIZE_WITH_FEE_OR_SECRETS: {
    label: "इनाम के साथ शुल्क या गोपनीय जानकारी की माँग",
    explanation:
      "इनाम पाने के लिए पैसे, प्रोसेसिंग शुल्क या OTP/PIN/पासवर्ड जैसी गोपनीय जानकारी माँगना प्रबल धोखाधड़ी पैटर्न है। वैध इनाम संदेश से ऐसा नहीं माँगते।",
  },
  CTX_JOB_EARNINGS_WITH_UPFRONT_FEE: {
    label: "अधिक कमाई और पहले शुल्क की माँग",
    explanation:
      "आसान काम पर अधिक वेतन का वादा और पहले पंजीकरण, जॉइनिंग या प्रोसेसिंग शुल्क माँगना नौकरी धोखाधड़ी का सामान्य पैटर्न है।",
  },
  CTX_SUSPENSION_WITH_LINK_OR_CREDS: {
    label: "खाता बंद होने की धमकी और लिंक या क्रेडेंशियल माँग",
    explanation:
      "तुरंत खाता ब्लॉक होने का डर और साथ में क्लिक लिंक या OTP/PIN/पासवर्ड की माँग फ़िशिंग का सामान्य संयोजन है। लिंक की प्रतिष्ठा स्वतंत्र रूप से सत्यापित नहीं की गई।",
  },
};

const HI_CATEGORY_BY_SIGNAL_LABEL = new Map(
  Object.values(HI_SIGNALS).map((signal) => [signal.label, signal.label])
);

const SAFE_STEP_HI: Record<string, string> = {
  "Never share your OTP, PIN, password, or card CVV — do NOT reply to this message or provide these details under any circumstances.":
    "अपना OTP, PIN, पासवर्ड या कार्ड CVV कभी साझा न करें — इस संदेश का उत्तर न दें और किसी भी स्थिति में ये जानकारी न दें।",
  "Do NOT click the link or open attachments. Delete the message or report it as spam.":
    "लिंक पर क्लिक न करें और अटैचमेंट न खोलें। संदेश हटाएँ या स्पैम रिपोर्ट करें।",
  "Contact the organization directly using the official toll-free number from their verified website or mobile app.":
    "संस्था से उसकी सत्यापित वेबसाइट या मोबाइल ऐप पर दिए आधिकारिक टोल-फ़्री नंबर पर सीधे संपर्क करें।",
  "Remember: Entering your UPI PIN or scanning a QR code ALWAYS transfers money OUT of your account.":
    "याद रखें: UPI PIN दर्ज करने या QR स्कैन करने पर पैसे हमेशा आपके खाते से बाहर जाते हैं।",
  "Hang up immediately. Police, CBI, and Customs NEVER conduct arrests or demand bail transfers via video call.":
    "तुरंत कॉल काटें। पुलिस, CBI और सीमा शुल्क कभी वीडियो कॉल पर गिरफ्तारी या जमानत के पैसे की माँग नहीं करते।",
  "Do NOT download APK files or install AnyDesk, TeamViewer, or QuickSupport on your device.":
    "APK फ़ाइल डाउनलोड न करें और अपने डिवाइस पर AnyDesk, TeamViewer या QuickSupport इंस्टॉल न करें।",
  "Track the parcel only in the courier's official app or website. Do not pay or update address details through the link in this message.":
    "पार्सल को केवल कूरियर के आधिकारिक ऐप या वेबसाइट पर ट्रैक करें। इस संदेश के लिंक से भुगतान या पता विवरण अपडेट न करें।",
  "Check refunds directly in the official bank, tax, or merchant portal. A genuine refund never requires an upfront fee or a link from the message.":
    "रिफंड की जाँच सीधे आधिकारिक बैंक, कर या व्यापारी पोर्टल पर करें। असली रिफंड के लिए संदेश के लिंक या पहले शुल्क की जरूरत नहीं होती।",
  "Do not pay any processing, activation, or insurance fee to release a loan. Verify the lender and its registration directly with your bank or the RBI.":
    "लोन जारी कराने के लिए प्रोसेसिंग, सक्रियण या बीमा शुल्क न दें। ऋणदाता और उसके पंजीकरण की पुष्टि सीधे अपने बैंक या RBI से करें।",
  "Do not transfer money to this investment or trading offer. Check SEBI registration and use only regulated intermediaries; guaranteed high returns are a fraud warning.":
    "इस निवेश या ट्रेडिंग प्रस्ताव में पैसे न भेजें। SEBI पंजीकरण जाँचें और केवल नियमित मध्यस्थों का उपयोग करें; गारंटीशुदा ऊँचा रिटर्न धोखाधड़ी की चेतावनी है।",
  "Never share bank account details, IFSC, Aadhaar, PAN, or card details to claim a prize or reward.":
    "इनाम या रिवॉर्ड पाने के लिए बैंक खाता विवरण, IFSC, आधार, PAN या कार्ड विवरण कभी साझा न करें।",
  "Do not click unsolicited prize or payment links. This scan does not check a URL’s reputation or destination.":
    "अनचाहे इनाम या भुगतान लिंक पर क्लिक न करें। यह स्कैन URL की प्रतिष्ठा या गंतव्य की जाँच नहीं करता।",
  "If you have already sent money or shared credentials, call the National Cyber Fraud Helpline at 1930 immediately.":
    "अगर आप पैसे भेज चुके हैं या क्रेडेंशियल साझा कर चुके हैं, तो तुरंत राष्ट्रीय साइबर धोखाधड़ी हेल्पलाइन 1930 पर कॉल करें।",
  "Even without obvious red flags, always verify unexpected payment or KYC requests through official channels.":
    "स्पष्ट खतरे के संकेत न होने पर भी अचानक आए भुगतान या KYC अनुरोध की पुष्टि आधिकारिक माध्यमों से करें।",
  "Never share sensitive passwords, PINs, or OTPs, even if a sender appears genuine.":
    "प्रेषक असली जैसा लगे तब भी संवेदनशील पासवर्ड, PIN या OTP कभी साझा न करें।",
};

const AI_CATEGORY_HI: Record<string, string> = {
  bank_impersonation: "बैंक प्रतिरूपण",
  otp_theft: "OTP और क्रेडेंशियल चोरी",
  upi_payment_fraud: "UPI / भुगतान धोखाधड़ी",
  job_task_scam: "नौकरी / टास्क धोखाधड़ी",
  fake_parcel_customs: "फ़र्ज़ी पार्सल / सीमा शुल्क शुल्क",
  fake_customer_support: "फ़र्ज़ी ग्राहक सहायता",
  lottery_investment_scam: "लॉटरी / निवेश धोखाधड़ी",
  government_impersonation: "सरकारी प्रतिरूपण",
  phishing_credential_theft: "फ़िशिंग / क्रेडेंशियल चोरी",
  digital_arrest_extortion: "डिजिटल अरेस्ट / जबरन वसूली",
  malicious_app_apk: "दुर्भावनापूर्ण ऐप / APK जाल",
  benign_communication: "सामान्य संचार",
  other: "अवर्गीकृत पैटर्न",
  uncertain: "अस्पष्ट पैटर्न",
};

function localizeCategory(category: string, language: Language): string {
  if (language === "en") return category;
  const direct = SCANNER_COPY.hi.categories[category as keyof typeof SCANNER_COPY.hi.categories];
  if (direct) return direct;
  if (HI_CATEGORY_BY_SIGNAL_LABEL.has(category)) return category;
  return category;
}

function localizeSignal(signal: DetectedSignal, language: Language) {
  if (language === "en") {
    return { label: signal.label, explanation: signal.explanation };
  }
  return HI_SIGNALS[signal.id] ?? {
    label: signal.label,
    explanation: signal.explanation,
  };
}

export function formatAiCategory(category: string, language: Language): string {
  if (language === "en") {
    return category
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }
  return (
    AI_CATEGORY_HI[category] ??
    category.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
  );
}

export function localizeScanReport(report: ScanReport, language: Language) {
  const copy = SCANNER_COPY[language];
  if (language === "en") {
    return {
      verdictLabel: copy.verdict[report.verdict].label,
      summary: report.summary,
      category: report.category,
      confidence: copy.confidence[report.confidence],
      reasons: report.reasons,
      safeNextSteps: report.safeNextSteps,
      limitations: report.limitationsDisclaimer,
      signals: report.signals.map((signal) => localizeSignal(signal, language)),
      defensiveSignals: report.defensiveSignals.map((signal) =>
        localizeSignal(signal, language)
      ),
    };
  }

  const reasons =
    report.signals.length > 0
      ? report.signals.slice(0, 4).map((signal) => {
          const translated = localizeSignal(signal, language);
          return `${translated.label}: ${translated.explanation}`;
        })
      : report.defensiveSignals.length > 0
        ? [copy.reasons.defensive, copy.reasons.noWarning]
        : [copy.reasons.noWarning];

  let limitations = copy.limitations;
  if (report.limitationsDisclaimer.includes("A link was present")) {
    limitations = `${limitations} ${copy.urlLimitation}`;
  }

  return {
    verdictLabel: copy.verdict[report.verdict].label,
    summary: copy.verdict[report.verdict].summary,
    category: localizeCategory(report.category, language),
    confidence: copy.confidence[report.confidence],
    reasons,
    safeNextSteps: report.safeNextSteps.map((step) => SAFE_STEP_HI[step] ?? step),
    limitations,
    signals: report.signals.map((signal) => localizeSignal(signal, language)),
    defensiveSignals: report.defensiveSignals.map((signal) =>
      localizeSignal(signal, language)
    ),
  };
}

export function formatCharacterError(
  language: Language,
  code: "empty" | "tooLong",
  values: Record<string, string | number>
): string {
  const template =
    language === "hi"
      ? code === "empty"
        ? SCANNER_COPY.hi.ui.errorEmpty
        : SCANNER_COPY.hi.ui.errorTooLong
      : code === "empty"
        ? SCANNER_COPY.en.ui.errorEmpty
        : SCANNER_COPY.en.ui.errorTooLong;
  return formatTemplate(template, values);
}

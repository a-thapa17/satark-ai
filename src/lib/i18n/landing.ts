import type { Language, LocalizedShape } from "./language";

const en = {
  hero: {
    eyebrow: "Digital safety & scam intelligence for India",
    titleStart: "Check the suspicious message",
    titleHighlight: "before you act.",
    intro:
      "Satark AI is a free, privacy-first safety checker for SMS, WhatsApp, email, links, QR codes, and UPI requests. It explains what looks risky and what to do next — without opening links, taking payments, or filing a report for you.",
    primaryCta: "Scan a message now",
    helplineCta: "Call 1930 helpline",
    emergencyCta: "Get emergency help",
    disclaimer:
      "A risk rating is an estimate, not proof or a guarantee. Nothing is reported or submitted automatically.",
    trust: [
      {
        title: "In-browser masking",
        body: "OTPs, Aadhaar and cards are masked before AI",
      },
      {
        title: "Deterministic rules",
        body: "Hard safety checks always take priority",
      },
      {
        title: "Evidence export",
        body: "Builds a redacted PDF summary",
      },
    ],
  },
  quick: {
    eyebrow: "Start here",
    heading: "What do you need to check?",
    intro:
      "Choose the safest tool for the situation. All three routes are free and work without creating an account.",
    cards: [
      {
        title: "Message Scanner",
        description:
          "Paste an SMS, WhatsApp message, or email. Get a plain-language risk verdict and safe next steps.",
        cta: "Check a message",
        href: "#scanner",
      },
      {
        title: "URL & QR Scanner",
        description:
          "Inspect a suspicious link, decode a QR image locally, or read a UPI payment request without opening it.",
        cta: "Check a link or QR",
        href: "#url-qr-scanner",
      },
      {
        title: "Help Hub",
        description:
          "Get an ordered emergency plan, six safety playbooks, a phone-call check, or an evidence PDF.",
        cta: "Open the Help Hub",
        href: "#emergency-help",
      },
    ],
  },
  pillars: {
    eyebrow: "Architecture & approach",
    heading: "Four steps from suspicion to safety",
    items: [
      {
        title: "1. SCAN",
        body: "Analyze messages, screenshots, suspicious links, QR codes, or phone numbers directly.",
        footer: "On-device privacy parsing",
      },
      {
        title: "2. ANALYSE",
        body: "Evaluate via deterministic rules, Indian brand edit-distance checks, RDAP age, and bounded AI.",
        footer: "Threat lists + hard rules",
      },
      {
        title: "3. EXPLAIN",
        body: "Transparent three-tier risk verdict with the exact warning signs and checked data sources.",
        footer: "Never deceptive 100% safe",
      },
      {
        title: "4. PROTECT",
        body: "Time-ordered safe steps: freeze accounts, preserve evidence, and official 1930 reporting guidance.",
        footer: "Official reporting pathways",
      },
    ],
  },
  scanners: {
    messageEyebrow: "Phase 1 live intelligence",
    messageTitle: "Suspicious Message Scanner",
    messageIntro:
      "Paste suspicious SMS, WhatsApp, or email text to receive an immediate, deterministic risk assessment with plain-language explanations and safe next steps.",
    urlEyebrow: "Phase 2 live intelligence",
    urlTitle: "URL & QR Safety Scanner",
    urlIntro:
      "Check a suspicious link, decode a QR image locally, and inspect UPI payment requests without opening a URL or initiating a payment. SSRF protections validate every redirect before a request is made.",
  },
  samples: {
    eyebrow: "Illustrative examples • static",
    categoryLabel: "Threat modalities explained",
    heading: "See how URL, QR and phone risks are explained",
    tabs: {
      url: "Website URL",
      qr: "UPI QR code",
      phone: "Call checklist",
    },
    sampleInput: "Sample input",
    preMasked: "Pre-masked for privacy",
    riskLevel: "Risk level",
    category: "Possible category",
    confidence: "Confidence & signals",
    whyFlagged: "Why it was flagged",
    safeSteps: "Safe next steps",
    footerLeft: "Static teaching examples • live scanning is available above",
    footerRight: "An estimate, not proof. Always verify via the official app or helpline.",
    items: {
      url: {
        title: "Lookalike banking URL",
        riskLevel: "High risk",
        category: "Lookalike domain impersonation",
        confidence: "High (domain registered 2 days ago)",
        reasons: [
          "Domain was registered via RDAP only 48 hours ago using a high-risk offshore registrar.",
          "Deep subdomains mimic 'onlinesbi' to deceive mobile users.",
          "Not recognized by SBI's authorized host registry.",
        ],
        nextSteps: [
          "Close this tab immediately; do not enter credentials.",
          "Bookmark only the official bank portal: https://onlinesbi.sbi",
        ],
      },
      qr: {
        title: "UPI QR payment trap",
        riskLevel: "Suspicious",
        category: "UPI 'receive money' scam",
        confidence: "High (payload requires a PIN to debit)",
        reasons: [
          "The payload attempts to debit ₹4,500 from your account under the guise of an 'electricity refund'.",
          "Rule: You NEVER need to enter a UPI PIN or scan a QR code to RECEIVE money.",
        ],
        nextSteps: [
          "Decline the collect request or do not approve the payment in your UPI app.",
          "Report the VPA to the National Cyber Crime Reporting Portal (cybercrime.gov.in).",
        ],
      },
      phone: {
        title: "Suspicious 'digital arrest' call script",
        riskLevel: "High-risk script",
        category: "Coercive impersonation (digital arrest)",
        confidence: "Script-based, not a number reputation check",
        reasons: [
          "Claims a parcel with illegal contraband was seized at customs or a money-laundering case exists.",
          "Threatens immediate arrest over a video call and demands a transfer to a 'reserve account'.",
          "Official police and law-enforcement agencies NEVER conduct arrests over Skype or WhatsApp video.",
        ],
        nextSteps: [
          "Hang up immediately. You cannot be arrested digitally over a video call.",
          "Report the number on Sanchar Saathi (Chakshu) and the I4C suspect database.",
        ],
      },
    },
  },
  privacy: {
    eyebrow: "Zero-leakage privacy architecture",
    heading: "Sensitive data is minimised, redacted, and handled with clear limits.",
    intro:
      "Scam messages often contain personal accounts, Aadhaar numbers, or OTPs. Satark AI redacts sensitive identifiers before external AI analysis. QR images stay in your browser. URL checks and evidence PDFs send only the information needed for that feature to this app's server, and scan/evidence data is not saved in a database.",
    bullets: [
      {
        title: "On-device QR decoding:",
        body: "jsQR decodes QR images entirely in browser memory; the image is never uploaded.",
      },
      {
        title: "SSRF-safe URL checks:",
        body: "Only URLs leave your browser for server-side analysis. Localhost, private, link-local, and reserved destinations are blocked.",
      },
      {
        title: "Client-side regex redaction:",
        body: "Masks 12-digit Aadhaar, PAN IDs, and OTP codes.",
      },
      {
        title: "Zero persistence by default:",
        body: "No user scan histories or message texts are saved to disk.",
      },
      {
        title: "Evidence redaction:",
        body: "OTPs, passwords, PINs, CVVs, tokens, cards, Aadhaar, and PAN patterns are removed before PDF generation. Review every PDF before sharing.",
      },
    ],
    previewTitle: "Client-side PII sanitizer preview",
    previewStatus: "Regex guard active",
    previewRaw: "// Raw user screenshot text:",
    previewRawText:
      "“Your Aadhaar 4920 1829 3847 linked to A/C 98127391823 has OTP 839102. Click to verify.”",
    previewRedacted: "// Redacted packet (sent to analyzer):",
    previewRedactedText:
      "“Your Aadhaar [MASKED_AADHAAR] linked to A/C [MASKED_BANK_ACC] has OTP [MASKED_OTP]. Click to verify.”",
    previewNote: "* Links and brand names are preserved because threat detection requires them.",
  },
  resources: {
    eyebrow: "Official Indian channels",
    heading: "Actionable helplines & portals",
    cards: [
      {
        meta: "24x7 immediate response",
        title: "1930 Helpline",
        body: "National Cyber Fraud Helpline for suspected financial cyber fraud in India. Call as soon as possible and also file at cybercrime.gov.in. Reporting quickly may help, but recovery is not guaranteed.",
        link: "Call 1930 directly",
      },
      {
        meta: "Formal complaint portal",
        title: "cybercrime.gov.in",
        body: "Official Ministry of Home Affairs portal to file cybercrime reports and track acknowledgements. Keep the complaint reference number.",
        link: "Visit portal",
      },
      {
        meta: "Telecom fraud & Chakshu",
        title: "Sanchar Saathi",
        body: "Department of Telecommunications platform to report fraudulent callers, spam SMS, and block lost or stolen mobile handsets.",
        link: "Report a number",
      },
      {
        meta: "Suspect identifier database",
        title: "I4C Suspect Registry",
        body: "Indian Cyber Crime Coordination Centre (I4C) portal to report suspect UPI VPAs, bank accounts, and phone numbers.",
        link: "Submit suspect information",
      },
    ],
  },
  intro: {
    dialogLabel: "Satark AI introduction",
    skipIntro: "Skip intro",
    emergency: "Emergency? Call 112",
    taglineWords: ["STAY", "ALERT.", "STAY", "PROTECTED."],
    taglineAria: "Stay alert. Stay protected.",
    subtitle: "Digital Safety & Scam Intelligence",
    description:
      "A short safety introduction. It can be skipped and never blocks emergency access.",
  },
  footer: {
    tagline: "Stay Alert. Stay Protected. • Digital Safety Platform",
    github: "GitHub Repository",
    license: "MIT License",
    phase: "Phase 1–4 live",
  },
  emergencyBar: {
    label: "Emergency quick actions",
    emergency: "112 emergency",
    helpline: "1930 fraud",
    help: "Help Hub",
  },
  skip: "Skip to main content",
  languageChanged: "Language changed successfully.",
};

const hi: LocalizedShape<typeof en> = {
  hero: {
    eyebrow: "भारत के लिए डिजिटल सुरक्षा और धोखाधड़ी जानकारी",
    titleStart: "संदिग्ध संदेश की जाँच करें,",
    titleHighlight: "कुछ करने से पहले।",
    intro:
      "सतर्क AI SMS, WhatsApp, ईमेल, लिंक, QR कोड और UPI अनुरोधों के लिए मुफ़्त और गोपनीयता-प्रथम सुरक्षा जाँच है। यह बताता है कि क्या जोखिम भरा लगता है और आगे क्या सुरक्षित कदम उठाने हैं — बिना लिंक खोले, भुगतान किए या आपकी ओर से कोई रिपोर्ट दर्ज किए।",
    primaryCta: "अभी संदेश स्कैन करें",
    helplineCta: "1930 हेल्पलाइन पर कॉल करें",
    emergencyCta: "आपातकालीन सहायता लें",
    disclaimer:
      "जोखिम रेटिंग एक अनुमान है, प्रमाण या गारंटी नहीं। कोई भी जानकारी अपने आप रिपोर्ट या सबमिट नहीं होती।",
    trust: [
      {
        title: "ब्राउज़र में मास्किंग",
        body: "AI से पहले OTP, आधार और कार्ड छिपाए जाते हैं",
      },
      {
        title: "नियत नियम",
        body: "कठोर सुरक्षा जाँच को हमेशा प्राथमिकता मिलती है",
      },
      {
        title: "साक्ष्य निर्यात",
        body: "संवेदनशील जानकारी हटाकर PDF सारांश बनाता है",
      },
    ],
  },
  quick: {
    eyebrow: "यहाँ से शुरू करें",
    heading: "आपको क्या जाँचना है?",
    intro:
      "स्थिति के लिए सबसे सुरक्षित टूल चुनें। तीनों विकल्प मुफ़्त हैं और बिना खाता बनाए काम करते हैं।",
    cards: [
      {
        title: "संदेश स्कैनर",
        description:
          "SMS, WhatsApp संदेश या ईमेल पेस्ट करें। सरल भाषा में जोखिम का नतीजा और सुरक्षित अगले कदम पाएँ।",
        cta: "संदेश जाँचें",
        href: "#scanner",
      },
      {
        title: "URL और QR स्कैनर",
        description:
          "संदिग्ध लिंक जाँचें, QR चित्र को ब्राउज़र में डिकोड करें, या UPI भुगतान अनुरोध बिना खोले पढ़ें।",
        cta: "लिंक या QR जाँचें",
        href: "#url-qr-scanner",
      },
      {
        title: "सहायता केंद्र",
        description:
          "क्रमबद्ध आपातकालीन योजना, छह सुरक्षा प्लेबुक, फ़ोन कॉल जाँच या साक्ष्य PDF पाएँ।",
        cta: "सहायता केंद्र खोलें",
        href: "#emergency-help",
      },
    ],
  },
  pillars: {
    eyebrow: "संरचना और दृष्टिकोण",
    heading: "संदेह से सुरक्षा तक चार कदम",
    items: [
      {
        title: "1. स्कैन",
        body: "संदेश, स्क्रीनशॉट, संदिग्ध लिंक, QR कोड या फ़ोन नंबर सीधे जाँचें।",
        footer: "डिवाइस पर गोपनीयता-सुरक्षित प्रोसेसिंग",
      },
      {
        title: "2. विश्लेषण",
        body: "नियत नियम, भारतीय ब्रांड नाम की समानता जाँच, RDAP आयु और सीमित AI से मूल्यांकन।",
        footer: "खतरा सूचियाँ + कठोर नियम",
      },
      {
        title: "3. समझाएँ",
        body: "तीन-स्तरीय जोखिम नतीजा, सटीक चेतावनी संकेतों और जाँचे गए स्रोतों के साथ।",
        footer: "कभी भी भ्रामक '100% सुरक्षित' नहीं",
      },
      {
        title: "4. सुरक्षित करें",
        body: "समय के क्रम में सुरक्षित कदम: खाते रोकें, साक्ष्य सुरक्षित रखें और आधिकारिक 1930 मार्ग अपनाएँ।",
        footer: "आधिकारिक रिपोर्टिंग मार्ग",
      },
    ],
  },
  scanners: {
    messageEyebrow: "चरण 1 लाइव जानकारी",
    messageTitle: "संदिग्ध संदेश स्कैनर",
    messageIntro:
      "संदिग्ध SMS, WhatsApp या ईमेल टेक्स्ट पेस्ट करें और तुरंत नियत जोखिम मूल्यांकन, सरल भाषा में कारण और सुरक्षित अगले कदम पाएँ।",
    urlEyebrow: "चरण 2 लाइव जानकारी",
    urlTitle: "URL और QR सुरक्षा स्कैनर",
    urlIntro:
      "संदिग्ध लिंक जाँचें, QR चित्र ब्राउज़र में डिकोड करें और UPI भुगतान अनुरोध बिना URL खोले या भुगतान किए देखें। SSRF सुरक्षा हर रीडायरेक्ट को अनुरोध से पहले जाँचती है।",
  },
  samples: {
    eyebrow: "उदाहरण • स्थिर",
    categoryLabel: "खतरे के प्रकार समझाए गए",
    heading: "देखें कि URL, QR और फ़ोन जोखिम कैसे समझाए जाते हैं",
    tabs: {
      url: "वेबसाइट URL",
      qr: "UPI QR कोड",
      phone: "कॉल चेकलिस्ट",
    },
    sampleInput: "नमूना इनपुट",
    preMasked: "गोपनीयता के लिए पहले से छिपाया गया",
    riskLevel: "जोखिम स्तर",
    category: "संभावित श्रेणी",
    confidence: "विश्वास और संकेत",
    whyFlagged: "इसे जोखिम भरा क्यों बताया गया",
    safeSteps: "सुरक्षित अगले कदम",
    footerLeft: "स्थिर शिक्षण उदाहरण • लाइव स्कैन ऊपर उपलब्ध है",
    footerRight: "यह अनुमान है, प्रमाण नहीं। आधिकारिक ऐप या हेल्पलाइन से हमेशा पुष्टि करें।",
    items: {
      url: {
        title: "बैंक जैसा दिखने वाला URL",
        riskLevel: "उच्च जोखिम",
        category: "बैंक जैसे दिखने वाले डोमेन का प्रतिरूपण",
        confidence: "उच्च (डोमेन 2 दिन पहले पंजीकृत)",
        reasons: [
          "RDAP के अनुसार डोमेन केवल 48 घंटे पहले उच्च जोखिम वाले विदेशी रजिस्ट्रार से पंजीकृत हुआ।",
          "गहरे सबडोमेन मोबाइल उपयोगकर्ताओं को धोखा देने के लिए 'onlinesbi' जैसा दिखते हैं।",
          "SBI के अधिकृत होस्ट रजिस्ट्री में इसे मान्यता नहीं है।",
        ],
        nextSteps: [
          "यह टैब तुरंत बंद करें; क्रेडेंशियल दर्ज न करें।",
          "केवल आधिकारिक बैंक पोर्टल बुकमार्क करें: https://onlinesbi.sbi",
        ],
      },
      qr: {
        title: "UPI QR भुगतान जाल",
        riskLevel: "संदिग्ध",
        category: "UPI 'पैसे प्राप्त करें' धोखाधड़ी",
        confidence: "उच्च (भुगतान काटने के लिए PIN आवश्यक)",
        reasons: [
          "पेलोड 'बिजली रिफंड' के बहाने आपके खाते से ₹4,500 काटने का प्रयास करता है।",
          "नियम: पैसे प्राप्त करने के लिए आपको कभी UPI PIN दर्ज करने या QR स्कैन करने की जरूरत नहीं होती।",
        ],
        nextSteps: [
          "कलेक्ट अनुरोध अस्वीकार करें या UPI ऐप में भुगतान स्वीकृत न करें।",
          "VPA की रिपोर्ट राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (cybercrime.gov.in) पर करें।",
        ],
      },
      phone: {
        title: "संदिग्ध 'डिजिटल अरेस्ट' कॉल स्क्रिप्ट",
        riskLevel: "उच्च जोखिम वाली स्क्रिप्ट",
        category: "जबरन प्रतिरूपण (डिजिटल अरेस्ट)",
        confidence: "स्क्रिप्ट आधारित, नंबर की प्रतिष्ठा जाँच नहीं",
        reasons: [
          "कहते हैं कि सीमा शुल्क पर अवैध सामान वाला पार्सल पकड़ा गया या मनी लॉन्ड्रिंग का मामला है।",
          "वीडियो कॉल पर तुरंत गिरफ्तारी की धमकी देते हैं और 'रिजर्व खाते' में पैसे भेजने की माँग करते हैं।",
          "पुलिस और कानून प्रवर्तन एजेंसियाँ Skype या WhatsApp वीडियो पर कभी गिरफ्तारी नहीं करतीं।",
        ],
        nextSteps: [
          "तुरंत कॉल काटें। वीडियो कॉल पर डिजिटल गिरफ्तारी नहीं हो सकती।",
          "नंबर की रिपोर्ट संचार साथी (चक्षु) और I4C संदिग्ध डेटाबेस पर करें।",
        ],
      },
    },
  },
  privacy: {
    eyebrow: "शून्य-लीक गोपनीयता संरचना",
    heading: "संवेदनशील जानकारी कम रखी, छिपाई और स्पष्ट सीमाओं के साथ संभाली जाती है।",
    intro:
      "धोखाधड़ी वाले संदेशों में अक्सर व्यक्तिगत खाते, आधार नंबर या OTP होते हैं। सतर्क AI बाहरी AI विश्लेषण से पहले संवेदनशील पहचान छिपाता है। QR चित्र आपके ब्राउज़र में ही रहते हैं। URL जाँच और साक्ष्य PDF केवल उस सुविधा के लिए जरूरी जानकारी इस ऐप के सर्वर पर भेजते हैं, और स्कैन/साक्ष्य डेटा डेटाबेस में नहीं सहेजा जाता।",
    bullets: [
      {
        title: "डिवाइस पर QR डिकोडिंग:",
        body: "jsQR QR चित्र को पूरी तरह ब्राउज़र मेमोरी में डिकोड करता है; चित्र कभी अपलोड नहीं होता।",
      },
      {
        title: "SSRF-सुरक्षित URL जाँच:",
        body: "सर्वर-साइड विश्लेषण के लिए केवल URL आपका ब्राउज़र छोड़ते हैं। Localhost, निजी, लिंक-लोकल और आरक्षित पते रोके जाते हैं।",
      },
      {
        title: "क्लाइंट-साइड regex रिडैक्शन:",
        body: "12 अंकों वाला आधार, PAN आईडी और OTP कोड छिपाए जाते हैं।",
      },
      {
        title: "डिफ़ॉल्ट रूप से शून्य संग्रह:",
        body: "कोई उपयोगकर्ता स्कैन इतिहास या संदेश टेक्स्ट डिस्क पर नहीं सहेजा जाता।",
      },
      {
        title: "साक्ष्य रिडैक्शन:",
        body: "PDF बनाने से पहले OTP, पासवर्ड, PIN, CVV, टोकन, कार्ड, आधार और PAN पैटर्न हटाए जाते हैं। साझा करने से पहले हर PDF जाँचें।",
      },
    ],
    previewTitle: "क्लाइंट-साइड PII सैनिटाइज़र पूर्वावलोकन",
    previewStatus: "Regex सुरक्षा सक्रिय",
    previewRaw: "// कच्चा उपयोगकर्ता स्क्रीनशॉट टेक्स्ट:",
    previewRawText:
      "“आपका आधार 4920 1829 3847 खाता 98127391823 से जुड़ा है, OTP 839102 है। सत्यापित करने के लिए क्लिक करें।”",
    previewRedacted: "// छिपाया गया पैकेट (विश्लेषक को भेजा गया):",
    previewRedactedText:
      "“आपका आधार [MASKED_AADHAAR] खाता [MASKED_BANK_ACC] से जुड़ा है, OTP [MASKED_OTP] है। सत्यापित करने के लिए क्लिक करें।”",
    previewNote: "* लिंक और ब्रांड नाम रखे जाते हैं क्योंकि खतरा पहचान के लिए उनकी जरूरत होती है।",
  },
  resources: {
    eyebrow: "आधिकारिक भारतीय चैनल",
    heading: "उपयोगी हेल्पलाइन और पोर्टल",
    cards: [
      {
        meta: "24x7 तत्काल सहायता",
        title: "1930 हेल्पलाइन",
        body: "भारत में संदिग्ध वित्तीय साइबर धोखाधड़ी के लिए राष्ट्रीय साइबर धोखाधड़ी हेल्पलाइन। जल्द से जल्द कॉल करें और cybercrime.gov.in पर भी शिकायत दर्ज करें। तेज़ रिपोर्टिंग मदद कर सकती है, लेकिन पैसा वापस मिलने की गारंटी नहीं है।",
        link: "सीधे 1930 पर कॉल करें",
      },
      {
        meta: "औपचारिक शिकायत पोर्टल",
        title: "cybercrime.gov.in",
        body: "साइबर अपराध रिपोर्ट दर्ज करने और पावती देखने के लिए गृह मंत्रालय का आधिकारिक पोर्टल। शिकायत का संदर्भ नंबर सुरक्षित रखें।",
        link: "पोर्टल देखें",
      },
      {
        meta: "टेलीकॉम धोखाधड़ी और चक्षु",
        title: "संचार साथी",
        body: "धोखाधड़ी करने वाले कॉलर, स्पैम SMS की रिपोर्ट करने और खोए या चोरी हुए मोबाइल को ब्लॉक करने के लिए दूरसंचार विभाग का प्लेटफ़ॉर्म।",
        link: "नंबर रिपोर्ट करें",
      },
      {
        meta: "संदिग्ध पहचान डेटाबेस",
        title: "I4C संदिग्ध रजिस्ट्री",
        body: "संदिग्ध UPI VPA, बैंक खाते और फ़ोन नंबर रिपोर्ट करने के लिए भारतीय साइबर अपराध समन्वय केंद्र (I4C) का पोर्टल।",
        link: "संदिग्ध जानकारी भेजें",
      },
    ],
  },
  intro: {
    dialogLabel: "सतर्क AI परिचय",
    skipIntro: "परिचय छोड़ें",
    emergency: "आपातकाल? 112 पर कॉल करें",
    taglineWords: ["सतर्क", "रहें.", "सुरक्षित", "रहें."],
    taglineAria: "सतर्क रहें। सुरक्षित रहें।",
    subtitle: "डिजिटल सुरक्षा और धोखाधड़ी जानकारी",
    description:
      "एक छोटा सुरक्षा परिचय। इसे छोड़ा जा सकता है और यह आपातकालीन पहुँच को कभी नहीं रोकता।",
  },
  footer: {
    tagline: "सतर्क रहें. सुरक्षित रहें. • डिजिटल सुरक्षा प्लेटफ़ॉर्म",
    github: "GitHub रिपॉज़िटरी",
    license: "MIT लाइसेंस",
    phase: "चरण 1–4 लाइव",
  },
  emergencyBar: {
    label: "आपातकालीन त्वरित कार्रवाइयाँ",
    emergency: "112 आपातकाल",
    helpline: "1930 धोखाधड़ी",
    help: "सहायता केंद्र",
  },
  skip: "मुख्य सामग्री पर जाएँ",
  languageChanged: "भाषा सफलतापूर्वक बदल गई।",
};

export const LANDING_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

export const SAMPLE_INPUTS = {
  url: {
    input: "https://onlinesbi-kyc-portal.secure-banking-support.in/login",
    riskBadgeClass: "bg-red-100 text-red-800 border-red-200",
  },
  qr: {
    input: "upi://pay?pa=refund-agent981@okaxis&pn=Electricity%20Refund&am=4500",
    riskBadgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  phone: {
    input:
      "Caller script: claims Mumbai Police / CBI / Customs, says a parcel was seized, and demands a transfer while staying on a video call.",
    riskBadgeClass: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

export type LandingTab = keyof typeof SAMPLE_INPUTS;

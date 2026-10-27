import type { Language, LocalizedShape } from "./language";

const en = {
  common: {
    call: "Call",
    officialSite: "Official site",
    optional: "(optional)",
    call112: "Call 112",
    call1930: "Call 1930",
    officialPortal: "Official portal",
  },
  hub: {
    phase: "Phase 3 Help Layer",
    heading: "Help is a sequence of safe actions, not a promise.",
    intro:
      "Start with immediate safety, preserve evidence, secure the affected account, and then choose an official reporting route. Satark AI does not call, submit, or contact anyone for you.",
    emergencyTitle: "If someone is in immediate danger, call 112.",
    emergencyBody:
      "For suspected financial cyber fraud in India, call the official 1930 helpline and file at cybercrime.gov.in. Reporting quickly may help, but recovery of money is not guaranteed.",
    tabs: {
      emergency: {
        label: "Emergency guidance",
        description: "Get an ordered plan for what happened.",
      },
      playbooks: {
        label: "Safety playbooks",
        description: "Six reusable checklists for common fraud types.",
      },
      phone: {
        label: "Phone check",
        description: "Check number format and review script warning signs.",
      },
      evidence: {
        label: "Evidence PDF",
        description: "Create a shareable, redacted incident summary.",
      },
    },
    tabListLabel: "Emergency and safety help tools",
    footer:
      "Only official channels linked on this page are recommended. Do not use contact details supplied by a suspicious caller. Satark AI cannot verify that a report was accepted or that money will be recovered.",
  },
  emergency: {
    dangerTitle: "Immediate danger comes first",
    dangerBody:
      "If someone is in immediate physical danger, call 112 or local emergency services. Satark AI cannot contact anyone for you.",
    questionOne: "1. What is happening?",
    quickCheck: "2. Quick safety check",
    immediateDangerLabel: "Someone is in immediate danger",
    immediateDangerBody: "I need emergency-safety steps first.",
    moneyLostLabel: "Money has already left my account",
    moneyLostBody: "Include bank-freeze and 1930 steps.",
    showPlan: "Show my action plan",
    selected: "Selected: {scenario}. This tool gives general safety guidance, not legal advice or a criminal investigation.",
    planEyebrow: "Your action plan",
    noReportBold: "No report has been submitted.",
    evidenceHeading: "Evidence to keep now",
    reportHeading: "Where to report after securing accounts",
    finalStepBold: "Final next step:",
    emptyTitle: "Start with what happened",
    emptyBody:
      "Choose a situation and select the safety checks. You will get an ordered plan, evidence to keep, and official reporting options. Nothing is submitted automatically.",
    urgency: {
      immediate: "Act now",
      urgent: "Act today",
      standard: "Review now",
    },
    headlineDanger:
      "You are in immediate danger. Call 112 first, then follow these steps.",
    headlineMoney:
      "Money has moved. Act quickly, but no one can guarantee recovery.",
    headlineDefault:
      "Follow these steps in order. Do not pay or share codes to make the problem go away.",
    noReport:
      "Satark AI has not submitted a report or contacted any authority. You must contact the official channel yourself.",
    recovery:
      "Reporting quickly may help your bank or the platform act. Recovery is not guaranteed; no one can guarantee that stolen money will be recovered.",
    finalSuffix:
      "Keep your bank and cybercrime acknowledgement numbers; recovery is not guaranteed.",
  },
  playbooks: {
    notice:
      "These are general safety checklists, not a replacement for emergency services, your bank, or legal advice. If anyone is in immediate danger, call 112.",
    groupLabel: "Safety playbooks",
    urgency: {
      immediate: "Act immediately",
      urgent: "Act today",
      standard: "Use as a checklist",
    },
    immediateActions: "Immediate actions",
    evidenceToPreserve: "Evidence to preserve",
    accountsToSecure: "Accounts and services to secure",
    mistakesToAvoid: "Mistakes to avoid",
    reportingOptions: "Reporting options",
    disclaimer:
      "Satark AI only displays these options. It does not call, email, or submit a report on your behalf.",
    call112Short: "Call 112",
  },
  phone: {
    title: "Check a suspicious call",
    intro:
      "This checks number formatting and the warning words you describe. It does not look up the caller or contact any service.",
    numberLabel: "Phone number shown",
    descriptionLabel: "What did the caller say?",
    numberPlaceholder: "+91 98765 43210 or +1 202 555 0143",
    numberHelp:
      "An Indian 10-digit number is read as +91. Use + and the country code for other countries.",
    descriptionPlaceholder:
      "Describe the claims, requests, threats, or payment instructions. Do not paste OTPs, PINs, passwords, or full card numbers.",
    descriptionHelp:
      "Warning signs are based only on the words you enter. They are not a reputation lookup or proof of a crime.",
    examplesLabel: "Examples:",
    errorEmpty: "Enter a phone number, describe the call, or do both.",
    submit: "Check this call locally",
    checking: "Checking locally…",
    privacy:
      "No caller reputation data is available in this build. Satark AI will not label a number fraudulent from its format or country code.",
    resultEyebrow: "Local call check",
    resultHeading: "What this result can and cannot tell you",
    noReputation: "No reputation lookup",
    normalised: "Normalised",
    international: "International",
    country: "Country",
    unknown: "Unknown",
    lineType: "Numbering-plan type",
    formatWarning:
      "Format validation is not a trust score. A valid number can belong to anyone and can be spoofed. A number's country code does not make it safe or fraudulent. Satark AI does not know who called you.",
    signalsHeading: "Warning signs in your description",
    noSignalsDescription:
      "No warning words from this checker's list were found. That does not mean the call is safe. Scams can use ordinary language.",
    noSignalsEmpty:
      "No call description was entered, so there are no script signals to show.",
    safeSteps: "Safe next steps",
    officialOptions: "Official reporting options",
    limitations: "Limitations",
    emptyTitle: "A format check is not a background check",
    emptyBody:
      "Enter a number and describe the call. You will see format details and script warning signs, with a clear note that no caller identity or reputation lookup was performed.",
    severity: {
      high: "High",
      medium: "Medium",
    },
    status: {
      valid: "Format valid - not identity-verified",
      invalid: "Format not validated",
      not_provided: "No number entered",
    },
    lineTypes: {
      mobile: "mobile",
      "fixed line": "fixed line",
      "fixed line or mobile": "fixed line or mobile",
      "toll-free": "toll-free",
      "premium rate": "premium rate",
      "shared cost": "shared cost",
      VoIP: "VoIP",
      "personal number": "personal number",
      pager: "pager",
      UAN: "UAN",
      voicemail: "voicemail",
      unknown: "unknown",
    },
    exampleLabels: {
      digital_arrest: "Digital arrest script",
      kyc_otp: "Bank KYC / OTP call",
      ordinary_call: "No warning words",
    },
    noticeEnglishDetection:
      "Example descriptions include English warning terms because the local pattern list is currently tuned for English wording. Results and guidance are shown in Hindi.",
    numberExplanations: {
      not_provided:
        "कोई फ़ोन नंबर नहीं दर्ज किया गया। आप कॉल का विवरण देकर चेतावनी संकेत देख सकते हैं।",
      invalid:
        "नंबर का प्रारूप मान्य नहीं है। इससे यह नहीं पता चलता कि कॉलर ईमानदार है या धोखेबाज़; केवल प्रारूप सत्यापित नहीं हो सका।",
      valid:
        "नंबर का प्रारूप मान्य है। प्रारूप जाँच पहचान सत्यापन नहीं है: यह नहीं बताती कि किसने कॉल किया, नंबर अभी किसी के पास है, या उसकी प्रतिष्ठा अच्छी या खराब है।",
    },
  },
  evidence: {
    title: "Build an evidence summary",
    intro:
      "Fill in what you know. Optional fields can be left blank and will be marked “Not provided” in the PDF.",
    incidentType: "Incident type",
    otherIncident: "Other incident",
    guidance: "Guidance in the PDF",
    name: "Your name",
    contact: "Contact",
    contactPlaceholder: "Phone or email for the recipient",
    incidentAt: "Incident date/time",
    amount: "Amount",
    amountPlaceholder: "For example: INR 4,500",
    transactionRef: "Transaction / UTR reference",
    transactionRefPlaceholder: "Bank UTR, order ID, or payment reference",
    urls: "Suspicious URL(s)",
    urlsHint: "(optional, one per line, maximum 5)",
    urlsPlaceholder: "https://example.com/login\nsuspicious-site.example",
    urlsNote: "URLs are recorded as text and are not opened for this PDF.",
    description: "What happened?",
    descriptionPlaceholder:
      "Write what you personally saw or experienced, including what was said, paid, or requested. Do not paste OTPs, passwords, PINs, CVVs, or authentication tokens.",
    findings: "Satark AI scanner findings",
    findingsPlaceholder:
      "Paste the scan result summary here, for example: URL scanner - SUSPICIOUS - lookalike domain and new registration.",
    findingsNote:
      "These findings are labelled as automated analysis in the PDF and are not re-run or independently verified by the PDF service.",
    privacy:
      "Do not enter OTPs, passwords, UPI PINs, CVVs, authentication tokens, or unnecessary identity numbers. Common secrets and identifiers are redacted by the generator, but redaction is best-effort. Review the PDF before sharing it.",
    download: "Download evidence PDF",
    preparing: "Preparing PDF…",
    routeNote:
      "The details are sent to this app's PDF route only to construct the document. They are not saved in a database and are not sent to a bank, platform, or authority.",
    success:
      "Your evidence PDF was downloaded. No report was submitted and no authority was contacted.",
    emptyFile: "The PDF service returned an empty file.",
    genericError: "The evidence PDF could not be generated. Please try again.",
    httpError: "The PDF could not be generated (HTTP {status}).",
    rateLimited: "Too many PDF requests. Wait a minute and try again.",
    tooLarge:
      "The details are too large. Shorten the description and try again.",
    invalidDetails:
      "Some details were not accepted. Check the fields and try again.",
    sideHeading: "What the PDF will contain",
    sideIntro:
      "The document separates what you provided from scanner output, so a reader can see the difference.",
    userProvided: "User-provided details",
    userProvidedBody:
      "Incident type, date/time, description, amount, transaction reference, URLs, and optional contact details.",
    automated: "Automated analysis, clearly labelled",
    automatedBody:
      "Scanner findings you record are marked as not re-verified and not definitive proof.",
    nextSteps: "Next steps and reporting links",
    nextStepsBody:
      "General actions from the selected playbook, evidence-preservation reminders, and official reporting options.",
    noReportBold: "No report is submitted.",
    noReportBody:
      "The PDF is a shareable summary, not an acknowledgement from any authority and not proof that money will be recovered.",
    outputLanguage:
      "The downloaded PDF is generated in English and may not render Devanagari correctly. Keep the original evidence in its original language and review the PDF before sharing.",
  },
} as const;

const hi: LocalizedShape<typeof en> = {
  common: {
    call: "कॉल करें",
    officialSite: "आधिकारिक साइट",
    optional: "(वैकल्पिक)",
    call112: "112 पर कॉल करें",
    call1930: "1930 पर कॉल करें",
    officialPortal: "आधिकारिक पोर्टल",
  },
  hub: {
    phase: "चरण 3 सहायता परत",
    heading: "सहायता सुरक्षित कदमों का क्रम है, कोई वादा नहीं।",
    intro:
      "पहले तत्काल सुरक्षा, साक्ष्य सहेजें, प्रभावित खाता सुरक्षित करें और फिर आधिकारिक शिकायत मार्ग चुनें। सतर्क AI आपकी ओर से किसी को कॉल, सबमिट या संपर्क नहीं करता।",
    emergencyTitle: "किसी को तत्काल खतरा हो तो 112 पर कॉल करें।",
    emergencyBody:
      "भारत में संदिग्ध वित्तीय साइबर धोखाधड़ी के लिए आधिकारिक 1930 हेल्पलाइन पर कॉल करें और cybercrime.gov.in पर शिकायत दर्ज करें। जल्द रिपोर्ट करने से मदद मिल सकती है, लेकिन पैसे वापस मिलने की गारंटी नहीं है।",
    tabs: {
      emergency: {
        label: "आपातकालीन मार्गदर्शन",
        description: "जो हुआ उसके लिए क्रमबद्ध योजना पाएँ।",
      },
      playbooks: {
        label: "सुरक्षा प्लेबुक",
        description: "सामान्य धोखाधड़ी प्रकारों के छह चेकलिस्ट।",
      },
      phone: {
        label: "फ़ोन जाँच",
        description: "नंबर प्रारूप और स्क्रिप्ट चेतावनी संकेत जाँचें।",
      },
      evidence: {
        label: "साक्ष्य PDF",
        description: "साझा करने योग्य, छिपाया गया घटना सार बनाएँ।",
      },
    },
    tabListLabel: "आपातकालीन और सुरक्षा सहायता टूल",
    footer:
      "केवल इस पेज पर जुड़े आधिकारिक माध्यम सुझाए जाते हैं। संदिग्ध कॉलर दिए संपर्क विवरण उपयोग न करें। सतर्क AI यह सत्यापित नहीं कर सकता कि शिकायत स्वीकार हुई या पैसे वापस मिलेंगे।",
  },
  emergency: {
    dangerTitle: "तत्काल खतरा सबसे पहले",
    dangerBody:
      "किसी को तत्काल शारीरिक खतरा हो तो 112 या स्थानीय आपातकालीन सेवा पर कॉल करें। सतर्क AI आपकी ओर से किसी से संपर्क नहीं कर सकता।",
    questionOne: "1. क्या हो रहा है?",
    quickCheck: "2. त्वरित सुरक्षा जाँच",
    immediateDangerLabel: "किसी को तत्काल खतरा है",
    immediateDangerBody: "मुझे पहले आपातकालीन सुरक्षा कदम चाहिए।",
    moneyLostLabel: "मेरे खाते से पैसे जा चुके हैं",
    moneyLostBody: "बैंक फ्रीज़ और 1930 के कदम शामिल करें।",
    showPlan: "मेरी कार्य योजना दिखाएँ",
    selected:
      "चुना गया: {scenario}। यह टूल सामान्य सुरक्षा मार्गदर्शन देता है, कानूनी सलाह या आपराधिक जाँच नहीं।",
    planEyebrow: "आपकी कार्य योजना",
    noReportBold: "कोई शिकायत दर्ज नहीं हुई है।",
    evidenceHeading: "अभी सहेजने योग्य साक्ष्य",
    reportHeading: "खाते सुरक्षित करने के बाद कहाँ रिपोर्ट करें",
    finalStepBold: "अंतिम अगला कदम:",
    emptyTitle: "जो हुआ उससे शुरू करें",
    emptyBody:
      "स्थिति चुनें और सुरक्षा जाँच चुनें। आपको क्रमबद्ध योजना, सहेजने योग्य साक्ष्य और आधिकारिक रिपोर्टिंग विकल्प मिलेंगे। कुछ भी अपने आप सबमिट नहीं होता।",
    urgency: {
      immediate: "अभी कार्रवाई करें",
      urgent: "आज कार्रवाई करें",
      standard: "अब समीक्षा करें",
    },
    headlineDanger:
      "आप तत्काल खतरे में हैं। पहले 112 पर कॉल करें, फिर ये कदम उठाएँ।",
    headlineMoney:
      "पैसे जा चुके हैं। जल्दी कार्रवाई करें, लेकिन वसूली की गारंटी कोई नहीं दे सकता।",
    headlineDefault:
      "इन कदमों को क्रम से उठाएँ। समस्या टालने के लिए पैसे या कोड न दें।",
    noReport:
      "सतर्क AI ने कोई शिकायत दर्ज नहीं की और किसी आधिकारिक संस्था से संपर्क नहीं किया। आधिकारिक माध्यम से संपर्क आपको खुद करना होगा।",
    recovery:
      "जल्द रिपोर्ट करने से बैंक या प्लेटफ़ॉर्म को कार्रवाई में मदद मिल सकती है। वसूली की गारंटी नहीं; कोई यह गारंटी नहीं दे सकता कि चोरी हुए पैसे वापस मिलेंगे।",
    finalSuffix:
      "अपने बैंक और साइबर अपराध पावती नंबर सहेजें; वसूली की गारंटी नहीं है।",
  },
  playbooks: {
    notice:
      "ये सामान्य सुरक्षा चेकलिस्ट हैं, आपातकालीन सेवाओं, बैंक या कानूनी सलाह का विकल्प नहीं। किसी को तत्काल खतरा हो तो 112 पर कॉल करें।",
    groupLabel: "सुरक्षा प्लेबुक",
    urgency: {
      immediate: "तुरंत कार्रवाई करें",
      urgent: "आज कार्रवाई करें",
      standard: "चेकलिस्ट की तरह उपयोग करें",
    },
    immediateActions: "तत्काल कार्रवाई",
    evidenceToPreserve: "सहेजने योग्य साक्ष्य",
    accountsToSecure: "सुरक्षित करने योग्य खाते और सेवाएँ",
    mistakesToAvoid: "इन गलतियों से बचें",
    reportingOptions: "रिपोर्टिंग विकल्प",
    disclaimer:
      "सतर्क AI केवल ये विकल्प दिखाता है। यह आपकी ओर से कॉल, ईमेल या शिकायत सबमिट नहीं करता।",
    call112Short: "112 पर कॉल करें",
  },
  phone: {
    title: "संदिग्ध कॉल जाँचें",
    intro:
      "यह नंबर का प्रारूप और आपके बताए चेतावनी शब्दों की जाँच करता है। यह कॉलर की पहचान नहीं खोजता और किसी सेवा से संपर्क नहीं करता।",
    numberLabel: "दिखाया गया फ़ोन नंबर",
    descriptionLabel: "कॉलर ने क्या कहा?",
    numberPlaceholder: "+91 98765 43210 या +1 202 555 0143",
    numberHelp:
      "भारतीय 10 अंकों का नंबर +91 के रूप में पढ़ा जाता है। दूसरे देशों के लिए + और देश कोड उपयोग करें।",
    descriptionPlaceholder:
      "दावे, माँग, धमकियाँ या भुगतान निर्देश लिखें। OTP, PIN, पासवर्ड या पूरा कार्ड नंबर पेस्ट न करें।",
    descriptionHelp:
      "चेतावनी संकेत केवल आपके लिखे शब्दों पर आधारित हैं। ये प्रतिष्ठा जाँच या अपराध का प्रमाण नहीं हैं।",
    examplesLabel: "उदाहरण:",
    errorEmpty: "फ़ोन नंबर दर्ज करें, कॉल का विवरण दें, या दोनों करें।",
    submit: "इस कॉल को स्थानीय रूप से जाँचें",
    checking: "स्थानीय जाँच हो रही है…",
    privacy:
      "इस बिल्ड में कॉलर प्रतिष्ठा डेटा उपलब्ध नहीं है। सतर्क AI केवल प्रारूप या देश कोड से किसी नंबर को धोखाधड़ी नहीं कहता।",
    resultEyebrow: "स्थानीय कॉल जाँच",
    resultHeading: "यह परिणाम क्या बता सकता है और क्या नहीं",
    noReputation: "कोई प्रतिष्ठा जाँच नहीं",
    normalised: "सामान्यीकृत",
    international: "अंतरराष्ट्रीय",
    country: "देश",
    unknown: "अज्ञात",
    lineType: "नंबरिंग-प्लान प्रकार",
    formatWarning:
      "प्रारूप सत्यापन भरोसा स्कोर नहीं है। मान्य नंबर किसी का भी हो सकता है और नकली बनाया जा सकता है। देश कोड नंबर को सुरक्षित या धोखाधड़ी नहीं बनाता। सतर्क AI नहीं जानता कि आपको किसने कॉल किया।",
    signalsHeading: "आपके विवरण में चेतावनी संकेत",
    noSignalsDescription:
      "इस चेकर की सूची से कोई चेतावनी शब्द नहीं मिला। इसका अर्थ यह नहीं कि कॉल सुरक्षित है। धोखाधड़ी में सामान्य भाषा भी उपयोग हो सकती है।",
    noSignalsEmpty:
      "कोई कॉल विवरण दर्ज नहीं हुआ, इसलिए स्क्रिप्ट संकेत दिखाने के लिए कुछ नहीं है।",
    safeSteps: "सुरक्षित अगले कदम",
    officialOptions: "आधिकारिक रिपोर्टिंग विकल्प",
    limitations: "सीमाएँ",
    emptyTitle: "प्रारूप जाँच बैकग्राउंड जाँच नहीं है",
    emptyBody:
      "नंबर दर्ज करें और कॉल का विवरण दें। आपको प्रारूप विवरण और स्क्रिप्ट चेतावनी संकेत मिलेंगे, साथ में स्पष्ट सूचना कि कॉलर की पहचान या प्रतिष्ठा जाँच नहीं की गई।",
    severity: {
      high: "उच्च",
      medium: "मध्यम",
    },
    status: {
      valid: "प्रारूप मान्य - पहचान सत्यापित नहीं",
      invalid: "प्रारूप सत्यापित नहीं",
      not_provided: "कोई नंबर दर्ज नहीं",
    },
    lineTypes: {
      mobile: "मोबाइल",
      "fixed line": "लैंडलाइन",
      "fixed line or mobile": "लैंडलाइन या मोबाइल",
      "toll-free": "टोल-फ़्री",
      "premium rate": "प्रीमियम रेट",
      "shared cost": "साझा शुल्क",
      VoIP: "VoIP",
      "personal number": "व्यक्तिगत नंबर",
      pager: "पेजर",
      UAN: "UAN",
      voicemail: "वॉइसमेल",
      unknown: "अज्ञात",
    },
    exampleLabels: {
      digital_arrest: "डिजिटल अरेस्ट स्क्रिप्ट",
      kyc_otp: "बैंक KYC / OTP कॉल",
      ordinary_call: "चेतावनी शब्द नहीं",
    },
    noticeEnglishDetection:
      "नमूना विवरण में अंग्रेज़ी चेतावनी शब्द हैं क्योंकि स्थानीय पैटर्न सूची अभी अंग्रेज़ी शब्दावली के लिए बनी है। परिणाम और मार्गदर्शन हिन्दी में दिखते हैं।",
    numberExplanations: {
      not_provided:
        "कोई फ़ोन नंबर नहीं दर्ज किया गया। आप कॉल का विवरण देकर चेतावनी संकेत देख सकते हैं।",
      invalid:
        "नंबर का प्रारूप मान्य नहीं है। इससे यह नहीं पता चलता कि कॉलर ईमानदार है या धोखेबाज़; केवल प्रारूप सत्यापित नहीं हो सका।",
      valid:
        "नंबर का प्रारूप मान्य है। प्रारूप जाँच पहचान सत्यापन नहीं है: यह नहीं बताती कि किसने कॉल किया, नंबर अभी किसी के पास है, या उसकी प्रतिष्ठा अच्छी या खराब है।",
    },
  },
  evidence: {
    title: "साक्ष्य सार बनाएँ",
    intro:
      "जो जानते हैं वह भरें। वैकल्पिक फ़ील्ड खाली छोड़ सकते हैं; PDF में उन्हें “नहीं दिया गया” लिखा जाएगा।",
    incidentType: "घटना का प्रकार",
    otherIncident: "अन्य घटना",
    guidance: "PDF में मार्गदर्शन",
    name: "आपका नाम",
    contact: "संपर्क",
    contactPlaceholder: "प्राप्तकर्ता के लिए फ़ोन या ईमेल",
    incidentAt: "घटना की तारीख/समय",
    amount: "राशि",
    amountPlaceholder: "उदाहरण: INR 4,500",
    transactionRef: "लेन-देन / UTR संदर्भ",
    transactionRefPlaceholder: "बैंक UTR, ऑर्डर ID या भुगतान संदर्भ",
    urls: "संदिग्ध URL",
    urlsHint: "(वैकल्पिक, प्रति पंक्ति एक, अधिकतम 5)",
    urlsPlaceholder: "https://example.com/login\nsuspicious-site.example",
    urlsNote: "URL केवल टेक्स्ट के रूप में दर्ज होते हैं और इस PDF के लिए नहीं खोले जाते।",
    description: "क्या हुआ?",
    descriptionPlaceholder:
      "जो आपने खुद देखा या भुगता, वह लिखें—क्या कहा गया, भुगतान हुआ या माँगा गया। OTP, पासवर्ड, PIN, CVV या प्रमाणीकरण टोकन पेस्ट न करें।",
    findings: "सतर्क AI स्कैनर निष्कर्ष",
    findingsPlaceholder:
      "स्कैन परिणाम सार यहाँ पेस्ट करें, उदाहरण: URL स्कैनर - संदिग्ध - नकली डोमेन और नया पंजीकरण।",
    findingsNote:
      "PDF में इन निष्कर्षों को स्वचालित विश्लेषण कहा जाएगा; PDF सेवा इन्हें दोबारा नहीं चलाती या स्वतंत्र रूप से सत्यापित नहीं करती।",
    privacy:
      "OTP, पासवर्ड, UPI PIN, CVV, प्रमाणीकरण टोकन या अनावश्यक पहचान संख्या दर्ज न करें। सामान्य रहस्य और पहचानकर्ता जनरेटर द्वारा छिपाए जाते हैं, लेकिन यह best-effort है। साझा करने से पहले PDF जाँचें।",
    download: "साक्ष्य PDF डाउनलोड करें",
    preparing: "PDF तैयार हो रहा है…",
    routeNote:
      "विवरण केवल दस्तावेज़ बनाने के लिए इस ऐप के PDF रूट पर भेजे जाते हैं। वे डेटाबेस में सहेजे नहीं जाते और बैंक, प्लेटफ़ॉर्म या संस्था को नहीं भेजे जाते।",
    success:
      "आपकी साक्ष्य PDF डाउनलोड हो गई। कोई शिकायत दर्ज नहीं हुई और किसी संस्था से संपर्क नहीं किया गया।",
    emptyFile: "PDF सेवा ने खाली फ़ाइल लौटाई।",
    genericError: "साक्ष्य PDF नहीं बन सकी। कृपया फिर कोशिश करें।",
    httpError: "PDF नहीं बन सकी (HTTP {status})।",
    rateLimited: "बहुत अधिक PDF अनुरोध हुए। एक मिनट रुककर फिर कोशिश करें।",
    tooLarge: "विवरण बहुत बड़ा है। विवरण छोटा करके फिर कोशिश करें।",
    invalidDetails: "कुछ विवरण स्वीकार नहीं हुए। फ़ील्ड जाँचकर फिर कोशिश करें।",
    sideHeading: "PDF में क्या होगा",
    sideIntro:
      "दस्तावेज़ आपके दिए विवरण और स्कैनर आउटपुट को अलग दिखाता है, ताकि पाठक अंतर समझ सके।",
    userProvided: "उपयोगकर्ता द्वारा दिए विवरण",
    userProvidedBody:
      "घटना का प्रकार, तारीख/समय, विवरण, राशि, लेन-देन संदर्भ, URL और वैकल्पिक संपर्क विवरण।",
    automated: "स्वचालित विश्लेषण, स्पष्ट रूप से चिह्नित",
    automatedBody:
      "आपके दर्ज स्कैनर निष्कर्षों को दोबारा सत्यापित नहीं और निर्णायक प्रमाण नहीं बताया जाता।",
    nextSteps: "अगले कदम और रिपोर्टिंग लिंक",
    nextStepsBody:
      "चुनी गई प्लेबुक की सामान्य कार्रवाइयाँ, साक्ष्य सहेजने की याद और आधिकारिक रिपोर्टिंग विकल्प।",
    noReportBold: "कोई शिकायत दर्ज नहीं होती।",
    noReportBody:
      "PDF एक साझा करने योग्य सार है, किसी संस्था की पावती नहीं और पैसे वापस मिलने का प्रमाण नहीं।",
    outputLanguage:
      "डाउनलोड होने वाली PDF अंग्रेज़ी में बनती है और देवनागरी सही तरीके से नहीं दिख सकती। मूल साक्ष्य उसकी मूल भाषा में रखें और साझा करने से पहले PDF जाँचें।",
  },
};

export const HELP_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

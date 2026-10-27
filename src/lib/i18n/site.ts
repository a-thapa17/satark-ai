import type { Language, LocalizedShape } from "./language";

const en = {
  topBanner: {
    helpline: "National Cyber Fraud Helpline (India):",
    dial: "Dial 1930",
    available: "(Available 24x7 for immediate financial fraud response)",
    portal: "cybercrime.gov.in",
    emergency: "Emergency help",
    phase: "Phase 1–4 live",
  },
  nav: {
    label: "Primary navigation",
    howItWorks: "How it works",
    messageScanner: "Message Scanner",
    urlQrScanner: "URL & QR Scanner",
    helpHub: "Help Hub",
    privacy: "Privacy",
    channels: "Emergency channels",
  },
  brand: {
    home: "Satark AI home",
    tagline: "Stay Alert. Stay Protected.",
  },
  actions: {
    scanMessage: "Scan message",
    getHelp: "Get help",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    emergencyShort: "Emergency",
  },
  mobile: {
    heading: "Go straight to help",
    emergencyTitle: "In immediate danger?",
    emergencyBody: "Call 112. For financial cyber fraud, call 1930.",
    call112: "Call 112",
    call1930: "Call 1930",
    helpHubDescription: "Emergency plans, playbooks, phone checks and evidence PDF",
  },
};

const hi: LocalizedShape<typeof en> = {
  topBanner: {
    helpline: "राष्ट्रीय साइबर धोखाधड़ी हेल्पलाइन (भारत):",
    dial: "1930 पर कॉल करें",
    available: "(तत्काल वित्तीय धोखाधड़ी सहायता के लिए 24x7 उपलब्ध)",
    portal: "cybercrime.gov.in",
    emergency: "आपातकालीन सहायता",
    phase: "चरण 1–4 लाइव",
  },
  nav: {
    label: "मुख्य नेविगेशन",
    howItWorks: "यह कैसे काम करता है",
    messageScanner: "संदेश स्कैनर",
    urlQrScanner: "URL और QR स्कैनर",
    helpHub: "सहायता केंद्र",
    privacy: "गोपनीयता",
    channels: "आपातकालीन चैनल",
  },
  brand: {
    home: "सतर्क AI मुखपृष्ठ",
    tagline: "सतर्क रहें. सुरक्षित रहें.",
  },
  actions: {
    scanMessage: "संदेश स्कैन करें",
    getHelp: "सहायता लें",
    openMenu: "नेविगेशन मेन्यू खोलें",
    closeMenu: "नेविगेशन मेन्यू बंद करें",
    emergencyShort: "आपातकाल",
  },
  mobile: {
    heading: "सीधे सहायता पर जाएँ",
    emergencyTitle: "तत्काल खतरे में?",
    emergencyBody: "112 पर कॉल करें। वित्तीय साइबर धोखाधड़ी के लिए 1930 पर कॉल करें।",
    call112: "112 पर कॉल करें",
    call1930: "1930 पर कॉल करें",
    helpHubDescription: "आपातकालीन योजना, प्लेबुक, फ़ोन जाँच और साक्ष्य PDF",
  },
};

export const SITE_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

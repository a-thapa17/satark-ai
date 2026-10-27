import type { Language, LocalizedShape } from "./language";

const en = {
  header: {
    phase: "Phase 2 · Live",
    title: "URL & QR Safety Scanner",
    body: "URL analysis runs on the server. QR images are decoded locally in your browser and are never uploaded.",
    noAutoOpen: "No auto-open · No payments",
  },
  tabs: {
    label: "Phase 2 scanner type",
    url: "Analyze a URL",
    qr: "Scan a QR image",
  },
  url: {
    inputLabel: "URL to analyze",
    placeholder: "example.com or https://example.com/path",
    submit: "Analyze URL",
    analyzing: "Analyzing…",
    samples: "Try a sample",
    sampleNotes: {
      safe: "Reserved documentation domain; live checks should report no known threat.",
      lookalike: "Demonstrates brand-impersonation and new-domain warnings.",
      malicious: "Reserved demo domain for a simulated confirmed threat match.",
    },
    notice:
      "The URL is submitted to Google Safe Browsing and/or URLhaus when configured, and to public RDAP data. Do not submit confidential URLs. A result is not a guarantee of safety.",
    loading:
      "Validating the URL, following redirects safely, and querying reputation services…",
    ready: "URL analysis complete. Results are shown below.",
    running: "URL analysis is running.",
  },
  qr: {
    inputLabel: "Upload a QR code image",
    uploadTitle: "Upload or drop a QR image",
    uploadHint: "PNG or JPEG · maximum 5 MB · decoded in your browser",
    choose: "Choose image",
    demo: "Demo QR",
    urlSample: "URL sample",
    upiSample: "UPI sample",
    privacy:
      "QR images are checked for file type, size, and dimensions before decoding. Extracted URLs are never opened automatically; URL analysis only sends them to the server pipeline.",
    loading: "Decoding the QR image and checking extracted content safely…",
    previewAlt: "Uploaded QR preview",
    fallbackFile: "QR image",
    dimensions: "{width} × {height} pixels · decoded locally",
    clear: "Clear",
    ready: "QR analysis complete. Results are shown below.",
    running: "QR image decoding is running.",
    extracted: "URL extracted. It will be analyzed without being opened.",
  },
  content: {
    urlFound: "URL found",
    urlSent: "Sent to the server-side URL pipeline for analysis.",
    inert: "The URL is displayed as inert text and is never opened automatically.",
    plainText: "Plain text",
    noUrlUpi: "No URL or UPI payment request was detected.",
    notExecuted: "Plain-text QR payloads are not executed or opened.",
  },
  errors: {
    urlRequired: "Enter a URL to analyze.",
    unreachable:
      "Could not reach the URL analysis service. Check your connection and try again.",
    unreadable: "The URL analysis service returned an unreadable response.",
    unexpected: "The URL analysis service returned an unexpected response.",
    http: "URL analysis failed (HTTP {status}).",
    rateLimited: "Too many URL scans. Please wait a minute before trying again.",
    invalidUrl: "That URL could not be validated. Check the full address and try again.",
    analysisFailed: "URL analysis failed. Please try again later.",
    demoFailed: "The demo QR image could not be loaded.",
    decodeFailed: "The QR code could not be decoded.",
    qr: {
      INVALID_FILE_TYPE: "Only PNG and JPEG images are accepted.",
      FILE_TOO_LARGE: "The QR image must be 5 MB or smaller.",
      EMPTY_FILE: "The selected image is empty.",
      INVALID_IMAGE: "The file is not a valid PNG or JPEG image.",
      IMAGE_TOO_LARGE: "The image is too large. Use an image at most 4096 × 4096 pixels.",
      NO_QR_CODE: "No QR code was found. Try a sharper, well-lit image with the full code visible.",
      CONTENT_TOO_LONG: "The decoded QR content is too long.",
    },
    serviceDetail: "Service detail:",
  },
} as const;

const hi: LocalizedShape<typeof en> = {
  header: {
    phase: "चरण 2 · लाइव",
    title: "URL और QR सुरक्षा स्कैनर",
    body: "URL विश्लेषण सर्वर पर होता है। QR चित्र आपके ब्राउज़र में ही डिकोड होते हैं और कभी अपलोड नहीं होते।",
    noAutoOpen: "कोई ऑटो-ओपन नहीं · कोई भुगतान नहीं",
  },
  tabs: {
    label: "चरण 2 स्कैनर प्रकार",
    url: "URL जाँचें",
    qr: "QR चित्र स्कैन करें",
  },
  url: {
    inputLabel: "जाँचने के लिए URL",
    placeholder: "example.com या https://example.com/path",
    submit: "URL जाँचें",
    analyzing: "जाँच हो रही है…",
    samples: "नमूना आज़माएँ",
    sampleNotes: {
      safe: "आरक्षित दस्तावेज़ डोमेन; लाइव जाँच में कोई ज्ञात खतरा नहीं बताना चाहिए।",
      lookalike: "ब्रांड प्रतिरूपण और नए डोमेन की चेतावनी दिखाता है।",
      malicious: "पुष्ट खतरे के नकली मिलान के लिए आरक्षित डेमो डोमेन।",
    },
    notice:
      "कॉन्फ़िगर होने पर URL Google Safe Browsing और/या URLhaus तथा सार्वजनिक RDAP डेटा को भेजा जाता है। गोपनीय URL सबमिट न करें। परिणाम सुरक्षा की गारंटी नहीं है।",
    loading: "URL सत्यापित किया जा रहा है, रीडायरेक्ट सुरक्षित रूप से फॉलो हो रहे हैं और प्रतिष्ठा सेवाएँ जाँची जा रही हैं…",
    ready: "URL विश्लेषण पूरा हुआ। परिणाम नीचे दिख रहे हैं।",
    running: "URL विश्लेषण चल रहा है।",
  },
  qr: {
    inputLabel: "QR कोड चित्र अपलोड करें",
    uploadTitle: "QR चित्र अपलोड करें या यहाँ छोड़ें",
    uploadHint: "PNG या JPEG · अधिकतम 5 MB · आपके ब्राउज़र में डिकोड",
    choose: "चित्र चुनें",
    demo: "डेमो QR",
    urlSample: "URL नमूना",
    upiSample: "UPI नमूना",
    privacy:
      "डिकोडिंग से पहले QR चित्र की फ़ाइल प्रकार, आकार और आयाम जाँचे जाते हैं। निकाले गए URL अपने आप नहीं खुलते; URL विश्लेषण उन्हें केवल सर्वर पाइपलाइन पर भेजता है।",
    loading: "QR चित्र डिकोड हो रहा है और निकाली गई सामग्री सुरक्षित रूप से जाँची जा रही है…",
    previewAlt: "अपलोड किए गए QR का पूर्वावलोकन",
    fallbackFile: "QR चित्र",
    dimensions: "{width} × {height} पिक्सेल · स्थानीय रूप से डिकोड",
    clear: "साफ़ करें",
    ready: "QR विश्लेषण पूरा हुआ। परिणाम नीचे दिख रहे हैं।",
    running: "QR चित्र डिकोड हो रहा है।",
    extracted: "URL निकाला गया। इसे बिना खोले जाँचा जाएगा।",
  },
  content: {
    urlFound: "URL मिला",
    urlSent: "विश्लेषण के लिए सर्वर-साइड URL पाइपलाइन पर भेजा गया।",
    inert: "URL केवल निष्क्रिय टेक्स्ट के रूप में दिखाया गया है और अपने आप कभी नहीं खुलता।",
    plainText: "सामान्य टेक्स्ट",
    noUrlUpi: "कोई URL या UPI भुगतान अनुरोध नहीं मिला।",
    notExecuted: "सामान्य टेक्स्ट वाला QR पेलोड न चलाया जाता है, न खोला जाता है।",
  },
  errors: {
    urlRequired: "जाँचने के लिए URL दर्ज करें।",
    unreachable:
      "URL विश्लेषण सेवा तक नहीं पहुँच सके। कनेक्शन जाँचें और फिर कोशिश करें।",
    unreadable: "URL विश्लेषण सेवा ने अपठनीय उत्तर दिया।",
    unexpected: "URL विश्लेषण सेवा ने अप्रत्याशित उत्तर दिया।",
    http: "URL विश्लेषण विफल (HTTP {status})।",
    rateLimited: "बहुत ज़्यादा URL स्कैन हो गए। कृपया एक मिनट बाद फिर कोशिश करें।",
    invalidUrl: "यह URL सत्यापित नहीं हो सका। पूरा पता जाँचें और फिर कोशिश करें।",
    analysisFailed: "URL विश्लेषण विफल रहा। कृपया बाद में फिर कोशिश करें।",
    demoFailed: "डेमो QR चित्र लोड नहीं हो सका।",
    decodeFailed: "QR कोड डिकोड नहीं हो सका।",
    qr: {
      INVALID_FILE_TYPE: "केवल PNG और JPEG चित्र स्वीकार किए जाते हैं।",
      FILE_TOO_LARGE: "QR चित्र 5 MB या उससे छोटा होना चाहिए।",
      EMPTY_FILE: "चुना गया चित्र खाली है।",
      INVALID_IMAGE: "फ़ाइल मान्य PNG या JPEG चित्र नहीं है।",
      IMAGE_TOO_LARGE: "चित्र बहुत बड़ा है। अधिकतम 4096 × 4096 पिक्सेल का चित्र उपयोग करें।",
      NO_QR_CODE: "कोई QR कोड नहीं मिला। पूरा कोड दिखने वाला साफ़ और अच्छी रोशनी वाला चित्र आज़माएँ।",
      CONTENT_TOO_LONG: "डिकोड की गई QR सामग्री बहुत लंबी है।",
    },
    serviceDetail: "सेवा विवरण:",
  },
};

export const PHASE2_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

export function sampleNote(
  language: Language,
  id: string,
  fallback: string
): string {
  const notes = PHASE2_COPY[language].url.sampleNotes as Record<string, string>;
  return notes[id] ?? fallback;
}

export function formatUrlHttpError(
  language: Language,
  status: number
): string {
  return PHASE2_COPY[language].errors.http.replace("{status}", String(status));
}

export function qrErrorForCode(
  language: Language,
  code: string | undefined,
  fallbackMessage: string
): string {
  if (language === "en") return fallbackMessage;
  const messages = PHASE2_COPY.hi.errors.qr as Record<string, string>;
  return code && messages[code] ? messages[code] : PHASE2_COPY.hi.errors.decodeFailed;
}

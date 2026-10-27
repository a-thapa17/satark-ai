import type { Language, LocalizedShape } from "./language";

const en = {
  decodedLabel: "Decoded UPI payment request",
  heading: "Payment details found",
  intro:
    "These details are encoded inside the QR code or URI. They describe a request; they do not prove the payee is trustworthy.",
  warningTitle: "Do not send money based on this screen.",
  warningBody:
    "Satark AI never initiates a payment, never asks for a UPI PIN, and cannot verify that the payee owns this UPI ID. Confirm the recipient independently in your own UPI app before paying.",
  payeeName: "Payee name",
  upiId: "UPI ID",
  amount: "Amount",
  currency: "Currency",
  transactionNote: "Transaction note",
  merchantCode: "Merchant code",
  transactionRef: "Transaction reference",
  decodedUri: "Decoded URI",
  notProvided: "Not provided",
  notSpecified: "Not specified",
  parsingWarnings: "Parsing warnings",
  safeSteps: "Safe next steps",
  steps: [
    "Verify the payee name and UPI ID in your own payment app before confirming anything.",
    "Never enter your UPI PIN to receive money. A PIN is only used to authorize a payment you initiated.",
    "If this QR arrived unexpectedly, do not pay. Contact the organization through its official app or number.",
    "If money was lost, call 1930 and report the transaction to your bank immediately.",
  ],
  disclaimer:
    "UPI fields are supplied by whoever created the QR code and can be forged or changed. Satark AI does not contact NPCI, a bank, or a payment app to validate this request.",
  warnings: {
    "The UPI ID format is unusual. Verify it in your payment app before paying.":
      "UPI ID का प्रारूप असामान्य है। भुगतान से पहले अपने भुगतान ऐप में इसे सत्यापित करें।",
    "The UPI ID is unusually long.": "UPI ID असामान्य रूप से लंबा है।",
    "The payee name was truncated for display.":
      "प्राप्तकर्ता का नाम दिखाने के लिए छोटा किया गया।",
    "The amount is zero or invalid and was not displayed.":
      "राशि शून्य या अमान्य है, इसलिए नहीं दिखाई गई।",
    "The amount could not be parsed and was not displayed.":
      "राशि पढ़ी नहीं जा सकी, इसलिए नहीं दिखाई गई।",
    "The currency code is malformed; INR is shown as the UPI default.":
      "मुद्रा कोड गलत है; UPI डिफ़ॉल्ट के रूप में INR दिखाया गया है।",
    "The transaction note was truncated for display.":
      "लेन-देन नोट दिखाने के लिए छोटा किया गया।",
  },
} as const;

const hi: LocalizedShape<typeof en> = {
  decodedLabel: "डिकोड किया गया UPI भुगतान अनुरोध",
  heading: "भुगतान विवरण मिले",
  intro:
    "ये विवरण QR कोड या URI के अंदर एन्कोड हैं। ये केवल एक अनुरोध बताते हैं; प्राप्तकर्ता के भरोसेमंद होने का प्रमाण नहीं।",
  warningTitle: "इस स्क्रीन के आधार पर पैसे न भेजें।",
  warningBody:
    "सतर्क AI कभी भुगतान शुरू नहीं करता, UPI PIN नहीं माँगता और यह सत्यापित नहीं कर सकता कि यह UPI ID प्राप्तकर्ता की है। भुगतान से पहले अपने UPI ऐप में प्राप्तकर्ता की स्वतंत्र पुष्टि करें।",
  payeeName: "प्राप्तकर्ता का नाम",
  upiId: "UPI ID",
  amount: "राशि",
  currency: "मुद्रा",
  transactionNote: "लेन-देन नोट",
  merchantCode: "व्यापारी कोड",
  transactionRef: "लेन-देन संदर्भ",
  decodedUri: "डिकोड किया गया URI",
  notProvided: "नहीं दिया गया",
  notSpecified: "निर्दिष्ट नहीं",
  parsingWarnings: "पार्सिंग चेतावनियाँ",
  safeSteps: "सुरक्षित अगले कदम",
  steps: [
    "कुछ भी पुष्टि करने से पहले अपने भुगतान ऐप में प्राप्तकर्ता का नाम और UPI ID सत्यापित करें।",
    "पैसे प्राप्त करने के लिए कभी UPI PIN दर्ज न करें। PIN केवल आपके शुरू किए भुगतान को अधिकृत करने के लिए है।",
    "यह QR अचानक आया है तो भुगतान न करें। संस्था से उसके आधिकारिक ऐप या नंबर पर संपर्क करें।",
    "पैसे गए हों तो तुरंत 1930 पर कॉल करें और अपने बैंक को लेन-देन की रिपोर्ट करें।",
  ],
  disclaimer:
    "UPI फ़ील्ड QR बनाने वाले ने भेजे हैं और उन्हें बदला या नकली बनाया जा सकता है। सतर्क AI इस अनुरोध की पुष्टि के लिए NPCI, बैंक या भुगतान ऐप से संपर्क नहीं करता।",
  warnings: {
    "The UPI ID format is unusual. Verify it in your payment app before paying.":
      "UPI ID का प्रारूप असामान्य है। भुगतान से पहले अपने भुगतान ऐप में इसे सत्यापित करें।",
    "The UPI ID is unusually long.": "UPI ID असामान्य रूप से लंबा है।",
    "The payee name was truncated for display.":
      "प्राप्तकर्ता का नाम दिखाने के लिए छोटा किया गया।",
    "The amount is zero or invalid and was not displayed.":
      "राशि शून्य या अमान्य है, इसलिए नहीं दिखाई गई।",
    "The amount could not be parsed and was not displayed.":
      "राशि पढ़ी नहीं जा सकी, इसलिए नहीं दिखाई गई।",
    "The currency code is malformed; INR is shown as the UPI default.":
      "मुद्रा कोड गलत है; UPI डिफ़ॉल्ट के रूप में INR दिखाया गया है।",
    "The transaction note was truncated for display.":
      "लेन-देन नोट दिखाने के लिए छोटा किया गया।",
  },
};

export const UPI_COPY: Record<Language, LocalizedShape<typeof en>> = { en, hi };

export function localizeUpiWarning(warning: string, language: Language): string {
  if (language === "en") return warning;
  const map = UPI_COPY.hi.warnings as Record<string, string>;
  return map[warning] ?? warning;
}

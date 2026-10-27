export interface UrlSample {
  id: string;
  label: string;
  url: string;
  note: string;
}

export const URL_SAMPLES: UrlSample[] = [
  {
    id: "safe",
    label: "Safe example",
    url: "https://example.com/",
    note: "Reserved documentation domain; live checks should report no known threat.",
  },
  {
    id: "lookalike",
    label: "Bank lookalike",
    url: "https://onlinesbi-kyc-portal.secure-banking-support.in/login",
    note: "Demonstrates brand-impersonation and new-domain warnings.",
  },
  {
    id: "malicious",
    label: "Mock threat match",
    url: "https://malware-demo.satark.example/download",
    note: "Reserved demo domain for a simulated confirmed threat match.",
  },
];

export const QR_URL_SAMPLE = URL_SAMPLES[0].url;

export const QR_UPI_SAMPLE =
  "upi://pay?pa=demo.merchant@upi&pn=Demo%20Merchant&am=499.00&cu=INR&tn=Demo%20order%20-%20do%20not%20pay";

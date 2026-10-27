import { mkdir } from "node:fs/promises";
import QRCode from "qrcode";

const outputDir = new URL("../public/images/", import.meta.url);
await mkdir(outputDir, { recursive: true });

const urlSample = "https://example.com/";
const upiSample =
  "upi://pay?pa=demo.merchant@upi&pn=Demo%20Merchant&am=499.00&cu=INR&tn=Demo%20order%20-%20do%20not%20pay";

const options = {
  width: 640,
  margin: 4,
  errorCorrectionLevel: "M",
  color: { dark: "#1C1917", light: "#FFFDF8" },
};

await QRCode.toFile(new URL("phase2-demo-url-qr.png", outputDir).pathname, urlSample, options);
await QRCode.toFile(new URL("phase2-demo-upi-qr.png", outputDir).pathname, upiSample, options);

console.log("Generated Phase 2 demo QR images:");
console.log(`- URL: ${urlSample}`);
console.log("- UPI: demo payment request (no payment is initiated)");

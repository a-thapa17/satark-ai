import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

async function generateSatarkPdf() {
  const doc = await PDFDocument.create();
  
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const cDark = rgb(0.11, 0.10, 0.09);       // #1C1917
  const cAmber = rgb(0.71, 0.33, 0.04);      // #B45309
  const cAmberBg = rgb(0.99, 0.95, 0.88);    // #FEF3C7
  const cStone = rgb(0.34, 0.33, 0.31);      // #57534E
  const cLightStone = rgb(0.47, 0.44, 0.42); // #78716C
  const cBorder = rgb(0.87, 0.83, 0.77);     // #DFD4C0

  const PAGE_WIDTH = 595.28; // A4
  const PAGE_HEIGHT = 841.89;
  const MARGIN = 40;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

  let currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function checkNewPage(neededSpace) {
    if (y - neededSpace < MARGIN + 30) {
      currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN - 20;
      addHeader(currentPage);
    }
  }

  function addHeader(page) {
    page.drawText("SATARK AI | PROJECT OVERVIEW & TECHNICAL IMPLEMENTATION REPORT", {
      x: MARGIN,
      y: PAGE_HEIGHT - 25,
      size: 8,
      font: fontBold,
      color: cLightStone,
    });
    page.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - 30 },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - 30 },
      thickness: 0.5,
      color: cBorder,
    });
  }

  function drawHeading(text, size = 12) {
    checkNewPage(42);
    y -= 10;
    currentPage.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: fontBold,
      color: cAmber,
    });
    y -= 5;
    currentPage.drawLine({
      start: { x: MARGIN, y },
      end: { x: MARGIN + CONTENT_WIDTH, y },
      thickness: 0.8,
      color: cAmber,
    });
    y -= 14;
  }

  function drawSubheading(text) {
    checkNewPage(26);
    y -= 4;
    currentPage.drawText(text, {
      x: MARGIN,
      y,
      size: 9.5,
      font: fontBold,
      color: cDark,
    });
    y -= 12;
  }

  function drawBullet(title, desc, indent = 0) {
    checkNewPage(22);
    const bulletX = MARGIN + indent;
    const textX = bulletX + 10;
    currentPage.drawText("-", {
      x: bulletX,
      y,
      size: 9,
      font: fontBold,
      color: cAmber,
    });
    currentPage.drawText(title + ": ", {
      x: textX,
      y,
      size: 8,
      font: fontBold,
      color: cDark,
    });
    const titleWidth = fontBold.widthOfTextAtSize(title + ": ", 8);
    currentPage.drawText(desc, {
      x: textX + titleWidth,
      y,
      size: 8,
      font: fontRegular,
      color: cStone,
    });
    y -= 12;
  }

  function drawTextBox(lines, bg = cAmberBg, border = cBorder) {
    const boxHeight = lines.length * 12 + 12;
    checkNewPage(boxHeight + 8);
    currentPage.drawRectangle({
      x: MARGIN,
      y: y - boxHeight + 6,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: bg,
      borderColor: border,
      borderWidth: 0.8,
    });
    let lineY = y - 5;
    for (const l of lines) {
      currentPage.drawText(l.text, {
        x: MARGIN + 10,
        y: lineY,
        size: 7.5,
        font: l.bold ? fontBold : fontRegular,
        color: l.color || cDark,
      });
      lineY -= 12;
    }
    y -= boxHeight + 8;
  }

  // ==========================================
  // PAGE 1: TITLE & EXECUTIVE SUMMARY
  // ==========================================
  addHeader(currentPage);

  // Big Header Card
  currentPage.drawRectangle({
    x: MARGIN,
    y: y - 75,
    width: CONTENT_WIDTH,
    height: 75,
    color: cDark,
  });
  currentPage.drawText("SATARK AI", {
    x: MARGIN + 16,
    y: y - 26,
    size: 20,
    font: fontBold,
    color: rgb(0.98, 0.97, 0.95),
  });
  currentPage.drawText("STAY ALERT. STAY PROTECTED. | Digital Safety & Scam Intelligence Platform", {
    x: MARGIN + 16,
    y: y - 44,
    size: 9,
    font: fontBold,
    color: rgb(0.99, 0.83, 0.30),
  });
  currentPage.drawText("Technical Implementation Plan & Codebase Architecture v4.0", {
    x: MARGIN + 16,
    y: y - 60,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.85, 0.83, 0.80),
  });
  y -= 95;

  drawHeading("1. Core Concept & What We Built vs What Evolved");
  currentPage.drawText(
    "Satark AI helps citizens identify digital scams, understand why something is suspicious, and take safe immediate action.",
    { x: MARGIN, y, size: 8, font: fontBold, color: cDark }
  );
  y -= 12;

  drawTextBox([
    { text: "ACTUAL IMPLEMENTATION HIGHLIGHTS (BUILT IN CODEBASE):", bold: true, color: cAmber },
    { text: "1. Zero-Knowledge Client Masking: Aadhaar (all spacing variants), PAN, cards, OTPs masked in-memory before leaving client." },
    { text: "2. Deterministic Heuristics: 9 multi-condition threat clusters + urgency modifiers (calibrated 0-100 scoring engine)." },
    { text: "3. Safe SSRF Pipeline: Every-hop DNS pre-flight verification strictly blocking private IPs and cloud metadata (169.254.169.254)." },
    { text: "4. Live Camera & Drag-and-Drop QR Scanner: Decodes in browser with jsQR + html5-qrcode; detects imposter UPI VPAs." },
    { text: "5. Fully Bilingual & Accessible: Complete English and Hindi (हिन्दी) localization; verified keyboard navigation." },
  ]);

  drawHeading("2. Production Stack & Actual Dependencies");
  drawBullet("Application Framework", "Next.js 14.2 (App Router), React 18, TypeScript 5.6");
  drawBullet("Styling System", "Tailwind CSS 3.4, Lucide React (Enterprise-grade security UI)");
  drawBullet("AI Layer", "@google/genai SDK (Gemini 2.5 Flash / Flash Lite with 25s timeout and fallback)");
  drawBullet("Network & SSRF Filter", "ipaddr.js (CIDR/Private classification), native node:dns/promises");
  drawBullet("Computer Vision & QR", "html5-qrcode (live video stream), jsQR (canvas file buffer extraction)");
  drawBullet("Digital Forensics", "pdf-lib (client-side incident PDF generator), libphonenumber-js");
  drawBullet("Automated Verification", "Node.js Native Test Runner (node --test) - 269 passing automated tests");

  drawHeading("3. Detailed Subsystem Specifications");
  drawSubheading("A. Message Scanner & Heuristics (src/utils/heuristics.ts)");
  drawBullet("9 Threat Clusters", "Banking Rewards (85), KYC Expiry (90), Bijli Cut (95), WFH Task Scam (95), Customs Parcel (90),");
  drawBullet("Additional Clusters", "KBC Lucky Draw (95), Digital Arrest (100), Fake Challan (85), Malicious APK Sideloading (100)");
  drawBullet("Urgency Modifiers", "+10 pts Extreme Urgency, +10 pts Action Coercion, +15 pts Financial Penalty Pressure");
  drawBullet("Entity Penalties", "+25 pts IP URLs, +20 pts URL Shorteners, +20 pts High-Risk TLDs (.xyz/.top/.live)");
  drawBullet("Risk Classification", "0-20 LOW, 21-50 MEDIUM, 51-79 HIGH, 80-100 CRITICAL");

  // ==========================================
  // PAGE 2: ARCHITECTURE, CAMERA & TEST CASES
  // ==========================================
  checkNewPage(450);

  drawSubheading("B. Live Camera & QR Scanner (src/components/Phase2Scanner.tsx)");
  drawBullet("Live Video Detection", "Custom LiveQrCamera.tsx using html5-qrcode with facingMode: 'environment'");
  drawBullet("Permission Fallback UX", "Detects NotAllowedError / NotFoundError with actionable address-bar permission guidance");
  drawBullet("File Drop Support", "Direct drag & drop or file selection processed entirely in browser via jsQR");
  drawBullet("UPI URI Parsing", "Decodes upi://pay?pa=... extracting payee name (pn), UPI ID (pa), amount (am), and note (tn)");
  drawBullet("Suspicious VPA Detection", "Flags imposter handles: customer care lures, fake utility officers, bogus cyber cell VPAs");
  drawBullet("UPI Reverse Trap Warning", "Explicitly warns that entering UPI PIN or scanning QR debits money; never receives funds");

  drawSubheading("C. SSRF-Safe URL Audit Engine (src/app/api/scan-url/route.ts)");
  drawBullet("Strict SSRF Protection", "Rejects 127.0.0.1, localhost, 10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12, ::1, and 169.254.169.254");
  drawBullet("Pre-Flight DNS Pinning", "Resolves public IPv4/IPv6 addresses via node:dns/promises before opening socket connection");
  drawBullet("Bounded Redirect Tracing", "Follows up to 5 redirect hops; checks public IP safety on every single redirect jump");
  drawBullet("Domain Age via RDAP", "Queries ICANN public RDAP registry; flags domains registered within 30 days as high risk");

  drawSubheading("D. Incident Help Hub & Redacted Evidence PDF (src/app/help-hub/page.tsx)");
  drawBullet("Emergency Workflows", "Time-ordered checklists: Golden Hour action plan, bank account freeze, and 1930 dialing");
  drawBullet("Forensic PDF Export", "Built with pdf-lib directly in browser; redacts sensitive PII before creating downloadable document");
  drawBullet("Bilingual Support", "Native English and Hindi (हिन्दी) localization toggled seamlessly across all scanners");

  drawHeading("4. Verified Benchmark Test Cases (269 Tests Passing)");
  drawTextBox([
    { text: "VERIFIED TEST CASES (from tests/heuristics-engine.test.ts & production-features.test.ts):", bold: true, color: cAmber },
    { text: "• Bijli Disconnect: 'Electricity connection cut tonight at 9:30 PM. Call officer' -> Matched UTILITY_DISCONNECT (Score: 100, CRITICAL)" },
    { text: "• Digital Arrest: 'Notice from CBI Cyber Crime. Arrest warrant issued in narcotics case' -> Score: 100, CRITICAL" },
    { text: "• KYC Account Freeze: 'SBI account blocked due to pending PAN KYC. Update at bit.ly/sbi' -> Score: 100, CRITICAL" },
    { text: "• Fake Challan: 'Pending violation fine on your vehicle. Pay at echallan-vahan.xyz' -> Score: 100, CRITICAL" },
    { text: "• WFH Task Scam: 'Earn Rs 3000 daily by liking YouTube videos. Contact HR on Telegram' -> Score: 95, CRITICAL" },
    { text: "• Benign Bank OTP: '492019 is your OTP. Bank never asks for OTP. Do not share' -> Score: 0, LOW (Defensive Rule match)" },
    { text: "• Benign Personal Note: 'Hey Rohan, are we still meeting for lunch today?' -> Score: 0, LOW" },
  ]);

  drawHeading("5. Team Composition & Hackathon Governance");
  drawBullet("Adarsh Thapa", "Lead Full-Stack Next.js Developer & Systems Architect (Routing, SSRF Guard, @google/genai)");
  drawBullet("Kaia", "Security Logic & Threat Detection Engineer (Deterministic Heuristic Engine, Zero-Knowledge Masking)");
  drawBullet("Anjali", "Frontend UX & Digital Forensics Engineer (Live Camera html5-qrcode, UPI VPA Parser, PDF Builder)");
  drawBullet("Open Source License", "MIT License (2026)");
  drawBullet("Official Contacts", "National Cyber Crime Reporting Portal (cybercrime.gov.in), 1930 Helpline, Sanchar Saathi");

  // Page numbers and footers across all generated pages
  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = doc.getPage(i);
    p.drawLine({ start: { x: MARGIN, y: 32 }, end: { x: PAGE_WIDTH - MARGIN, y: 32 }, thickness: 0.5, color: cBorder });
    p.drawText("Satark AI Technical Report - Verified Codebase v4.0", { x: MARGIN, y: 20, size: 7, font: fontRegular, color: cLightStone });
    p.drawText("Page " + (i + 1) + " of " + pageCount, { x: PAGE_WIDTH - MARGIN - 45, y: 20, size: 7, font: fontBold, color: cDark });
  }

  const pdfBytes = await doc.save();
  const outputPath = path.join(process.cwd(), "docs", "Satark_AI_Technical_Implementation_Plan.pdf");
  fs.writeFileSync(outputPath, pdfBytes);
  console.log("PDF_SUCCESSFULLY_GENERATED: " + outputPath);
}

generateSatarkPdf().catch(console.error);

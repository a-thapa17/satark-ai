import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { EvidenceReport } from "./types.ts";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;
const MARGIN_TOP = 52;
const MARGIN_BOTTOM = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const REPLACEMENTS: Record<string, string> = {
  "\u20b9": "INR ",
  "\u2013": "-",
  "\u2014": "-",
  "\u2018": "'",
  "\u2019": "'",
  "\u201c": '"',
  "\u201d": '"',
  "\u2022": "-",
  "\u2026": "...",
  "\u00a0": " ",
};

/**
 * Standard PDF fonts only support WinAnsi/Latin text. The app is currently
 * English-first, so normalise common punctuation and replace unsupported
 * characters rather than letting pdf-lib throw. The PDF explicitly tells the
 * reader to review the original evidence and this document before sharing it.
 */
export function toPdfSafeText(value: string): string {
  let normalized = value.normalize("NFKD");
  normalized = normalized.replace(/[\u0300-\u036f]/g, "");
  let output = "";
  for (const character of normalized) {
    if (REPLACEMENTS[character] !== undefined) {
      output += REPLACEMENTS[character];
    } else {
      const code = character.codePointAt(0) ?? 0;
      output += code >= 32 && code <= 126 ? character : "?";
    }
  }
  return output;
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number
): string[] {
  if (!text) return [""];
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      continue;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      continue;
    }
    // A single long token (for example a URL or reference) still needs to
    // fit the page. Split it by characters rather than clipping it.
    let token = word;
    while (font.widthOfTextAtSize(token, size) > maxWidth) {
      let cutoff = token.length - 1;
      while (
        cutoff > 1 &&
        font.widthOfTextAtSize(token.slice(0, cutoff), size) > maxWidth
      ) {
        cutoff -= 1;
      }
      lines.push(token.slice(0, cutoff));
      token = token.slice(cutoff);
    }
    current = token;
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

interface PdfContext {
  doc: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  pages: PDFPage[];
  page: PDFPage;
  y: number;
}

function addPage(context: PdfContext): void {
  const page = context.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  context.pages.push(page);
  context.page = page;
  context.y = PAGE_HEIGHT - MARGIN_TOP;
}

function ensureSpace(context: PdfContext, height: number): void {
  if (context.y - height < MARGIN_BOTTOM) {
    addPage(context);
  }
}

function drawWrapped(
  context: PdfContext,
  text: string,
  options: {
    font: PDFFont;
    size: number;
    color: ReturnType<typeof rgb>;
    lineHeight: number;
    gapBefore?: number;
  }
): void {
  const safeText = toPdfSafeText(text);
  const lines = wrapText(safeText, options.font, options.size, CONTENT_WIDTH);
  if (options.gapBefore) {
    ensureSpace(context, options.gapBefore);
    context.y -= options.gapBefore;
  }
  for (const line of lines) {
    ensureSpace(context, options.lineHeight);
    if (line) {
      context.page.drawText(line, {
        x: MARGIN_X,
        y: context.y,
        size: options.size,
        font: options.font,
        color: options.color,
      });
    }
    context.y -= options.lineHeight;
  }
}

/**
 * Generate a simple, readable PDF from the already-redacted evidence report.
 * No input reaches this renderer without passing through parseEvidenceRequest()
 * and buildEvidenceReport().
 */
export async function renderEvidencePdf(
  report: EvidenceReport
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle("Satark AI - Incident Evidence Summary");
  doc.setAuthor("Satark AI");
  doc.setSubject("User-created incident evidence summary. No report was submitted.");
  doc.setCreator("Satark AI");
  doc.setProducer("Satark AI");
  const generatedDate = new Date(report.generatedAt);
  if (!Number.isNaN(generatedDate.getTime())) {
    doc.setCreationDate(generatedDate);
    doc.setModificationDate(generatedDate);
  }

  const context: PdfContext = {
    doc,
    regular,
    bold,
    pages: [],
    page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]),
    y: PAGE_HEIGHT - MARGIN_TOP,
  };
  context.pages.push(context.page);

  const lines = report.content.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? "";
    if (index === 0) {
      drawWrapped(context, line, {
        font: bold,
        size: 18,
        color: rgb(0.11, 0.1, 0.09),
        lineHeight: 22,
      });
      continue;
    }
    if (line.startsWith("SECTION ")) {
      drawWrapped(context, line, {
        font: bold,
        size: 11.5,
        color: rgb(0.85, 0.47, 0.02),
        lineHeight: 15,
        gapBefore: 10,
      });
      continue;
    }
    if (line.startsWith("IMPORTANT:")) {
      drawWrapped(context, line, {
        font: bold,
        size: 9.5,
        color: rgb(0.67, 0.13, 0.13),
        lineHeight: 13,
      });
      continue;
    }
    if (line.startsWith("Automated threat assessments")) {
      drawWrapped(context, line, {
        font: regular,
        size: 9.5,
        color: rgb(0.32, 0.3, 0.28),
        lineHeight: 13,
      });
      continue;
    }
    if (line.startsWith("Generated:")) {
      drawWrapped(context, line, {
        font: regular,
        size: 9,
        color: rgb(0.42, 0.4, 0.38),
        lineHeight: 13,
      });
      continue;
    }
    drawWrapped(context, line, {
      font: regular,
      size: 9.5,
      color: rgb(0.15, 0.14, 0.13),
      lineHeight: 13,
    });
  }

  const totalPages = context.pages.length;
  for (let index = 0; index < totalPages; index += 1) {
    const page = context.pages[index]!;
    page.drawText(
      `Satark AI evidence summary - Page ${index + 1} of ${totalPages}`,
      {
        x: MARGIN_X,
        y: 28,
        size: 8,
        font: regular,
        color: rgb(0.48, 0.46, 0.44),
      }
    );
    page.drawText(
      "Not proof of a crime or recovery. Review before sharing.",
      {
        x: MARGIN_X + 240,
        y: 28,
        size: 8,
        font: regular,
        color: rgb(0.48, 0.46, 0.44),
      }
    );
  }

  return doc.save();
}

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import QRCode from "qrcode";
import { classifyQrContent, MAX_DECODED_CONTENT_LENGTH } from "../src/lib/qr/classify.ts";
import {
  decodeQrImageData,
  detectImageType,
  MAX_IMAGE_DIMENSION,
  MAX_QR_FILE_BYTES,
  QrDecodeError,
  readImageDimensions,
  validateQrFileMeta,
  validateQrImageBytes,
} from "../src/lib/qr/decode.ts";
import { parseUpiUri } from "../src/lib/qr/upi.ts";

function makePngHeader(width: number, height: number): Uint8Array {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  bytes.set([0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52], 8);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return bytes;
}

function makeQrPixels(text: string): { data: Uint8ClampedArray; width: number; height: number } {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const size = qr.modules.size;
  const scale = 5;
  const margin = 4;
  const width = (size + margin * 2) * scale;
  const height = width;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!qr.modules.get(x, y)) continue;
      const startX = (x + margin) * scale;
      const startY = (y + margin) * scale;
      for (let py = startY; py < startY + scale; py += 1) {
        for (let px = startX; px < startX + scale; px += 1) {
          const index = (py * width + px) * 4;
          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
          data[index + 3] = 255;
        }
      }
    }
  }
  return { data, width, height };
}

describe("Phase 2 UPI parser", () => {
  it("parses a UPI payment URI without initiating a payment", () => {
    const outcome = parseUpiUri(
      "upi://pay?pa=demo.merchant@okhdfcbank&pn=Demo%20Store&am=499.00&cu=INR&tn=Order%20123"
    );
    assert.equal(outcome.kind, "payment");
    if (outcome.kind !== "payment") return;
    assert.equal(outcome.payment.upiId, "demo.merchant@okhdfcbank");
    assert.equal(outcome.payment.payeeName, "Demo Store");
    assert.equal(outcome.payment.amount, "499.00");
    assert.equal(outcome.payment.amountValue, 499);
    assert.equal(outcome.payment.currency, "INR");
    assert.equal(outcome.payment.transactionNote, "Order 123");
  });

  it("defaults the currency to INR when cu is absent", () => {
    const outcome = parseUpiUri("upi://pay?pa=demo@upi&pn=Demo&am=10");
    assert.equal(outcome.kind, "payment");
    if (outcome.kind === "payment") assert.equal(outcome.payment.currency, "INR");
  });

  it("rejects a UPI payment URI without a payee address", () => {
    const outcome = parseUpiUri("upi://pay?pn=Missing");
    assert.equal(outcome.kind, "invalid");
  });

  it("does not display a malformed amount but keeps the payment details", () => {
    const outcome = parseUpiUri("upi://pay?pa=demo@upi&am=not-a-number");
    assert.equal(outcome.kind, "payment");
    if (outcome.kind === "payment") {
      assert.equal(outcome.payment.amount, undefined);
      assert.ok(outcome.payment.warnings.some((warning) => /amount/i.test(warning)));
    }
  });

  it("rejects unsupported UPI operations", () => {
    const outcome = parseUpiUri("upi://mandate?pa=demo@upi");
    assert.equal(outcome.kind, "invalid");
  });

  it("returns not_upi for non-UPI content", () => {
    assert.equal(parseUpiUri("https://example.com/").kind, "not_upi");
  });
});

describe("Phase 2 QR content classification", () => {
  it("classifies ordinary HTTP/HTTPS URLs", () => {
    assert.equal(classifyQrContent("https://example.com/path").kind, "url");
    assert.equal(classifyQrContent("http://example.com/").kind, "url");
  });

  it("adds HTTPS to a bare domain or www URL", () => {
    const bare = classifyQrContent("example.com/path");
    assert.equal(bare.kind, "url");
    if (bare.kind === "url") assert.equal(bare.url, "https://example.com/path");

    const www = classifyQrContent("www.example.com");
    assert.equal(www.kind, "url");
    if (www.kind === "url") assert.equal(www.url, "https://www.example.com/");
  });

  it("classifies UPI payment QR content", () => {
    const result = classifyQrContent("upi://pay?pa=demo@upi&pn=Demo&am=1");
    assert.equal(result.kind, "upi");
  });

  it("keeps plain text as inert text", () => {
    const result = classifyQrContent("Hello from a QR code");
    assert.equal(result.kind, "text");
    if (result.kind === "text") assert.equal(result.text, "Hello from a QR code");
  });

  it("does not analyze overlong content", () => {
    const result = classifyQrContent("https://example.com/" + "a".repeat(MAX_DECODED_CONTENT_LENGTH));
    assert.equal(result.kind, "text");
    if (result.kind === "text") assert.match(result.note ?? "", /too long/i);
  });
});

describe("Phase 2 QR image validation and decoding", () => {
  it("detects PNG and JPEG magic bytes and rejects other types", () => {
    assert.equal(detectImageType(makePngHeader(100, 100)), "png");
    assert.equal(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "jpeg");
    assert.equal(detectImageType(new Uint8Array([0x47, 0x49, 0x46, 0x38])), null);
    assert.equal(detectImageType(new Uint8Array([0x3c, 0x73, 0x76, 0x67])), null);
  });

  it("reads PNG dimensions from the header", () => {
    const dimensions = readImageDimensions(makePngHeader(300, 200), "png");
    assert.deepEqual(dimensions, { width: 300, height: 200 });
  });

  it("rejects oversized files and disallowed image types", () => {
    assert.throws(
      () =>
        validateQrFileMeta({
          size: MAX_QR_FILE_BYTES + 1,
          type: "image/png",
          name: "qr.png",
        }),
      /5 MB or smaller/i
    );
    assert.throws(
      () => validateQrFileMeta({ size: 100, type: "image/svg+xml", name: "qr.svg" }),
      /Only PNG and JPEG/i
    );
    assert.throws(
      () => validateQrFileMeta({ size: 100, type: "image/png", name: "qr.webp" }),
      /Only .png, .jpg/i
    );
  });

  it("rejects an image with unsafe dimensions before decoding", () => {
    const bytes = makePngHeader(MAX_IMAGE_DIMENSION + 1, 100);
    assert.throws(() => validateQrImageBytes(bytes), QrDecodeError);
  });

  it("rejects non-image bytes", () => {
    assert.throws(() => validateQrImageBytes(new Uint8Array([1, 2, 3, 4])), /not a valid PNG or JPEG/i);
  });

  it("decodes a generated QR code from raw RGBA pixels", () => {
    const text = "https://example.com/phase-2-qr-test";
    const pixels = makeQrPixels(text);
    const decoded = decodeQrImageData(pixels.data, pixels.width, pixels.height);
    assert.equal(decoded, text);
  });

  it("returns null for a blank image", () => {
    const width = 160;
    const height = 160;
    const blank = new Uint8ClampedArray(width * height * 4).fill(255);
    assert.equal(decodeQrImageData(blank, width, height), null);
  });
});

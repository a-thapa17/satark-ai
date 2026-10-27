import jsQR from "jsqr";

export const MAX_QR_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_IMAGE_PIXELS = 16_000_000;
export const MAX_DECODED_QR_LENGTH = 4096;

export type ImageType = "png" | "jpeg";

export type QrDecodeErrorCode =
  | "INVALID_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "INVALID_IMAGE"
  | "IMAGE_TOO_LARGE"
  | "NO_QR_CODE"
  | "CONTENT_TOO_LONG";

export class QrDecodeError extends Error {
  public readonly code: QrDecodeErrorCode;

  constructor(code: QrDecodeErrorCode, message: string) {
    super(message);
    this.name = "QrDecodeError";
    this.code = code;
  }
}

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg", ""]);
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

export interface QrFileMeta {
  size: number;
  type?: string;
  name?: string;
}

export interface QrFileInfo {
  mime: ImageType;
  mimeType: string;
  width: number;
  height: number;
}

export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  return null;
}

function readUint32(bytes: Uint8Array, offset: number): number {
  if (offset + 4 > bytes.length) return 0;
  return (
    ((bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]) >>>
    0
  );
}

export function readImageDimensions(
  bytes: Uint8Array,
  type: ImageType
): { width: number; height: number } | null {
  if (type === "png") {
    if (bytes.length < 24) return null;
    const isIhdr =
      bytes[12] === 0x49 && bytes[13] === 0x48 && bytes[14] === 0x44 && bytes[15] === 0x52;
    if (!isIhdr) return null;
    return { width: readUint32(bytes, 16), height: readUint32(bytes, 20) };
  }

  if (bytes.length < 4) return null;
  let offset = 2;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2;
      continue;
    }
    if (marker === 0xda) break;
    if (offset + 4 > bytes.length) break;
    const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (segmentLength < 2) break;
    if (JPEG_SOF_MARKERS.has(marker)) {
      if (offset + 9 > bytes.length) return null;
      return {
        height: (bytes[offset + 5] << 8) | bytes[offset + 6],
        width: (bytes[offset + 7] << 8) | bytes[offset + 8],
      };
    }
    offset += 2 + segmentLength;
  }
  return null;
}

export function validateQrFileMeta(meta: QrFileMeta): void {
  if (!meta.size || meta.size <= 0) {
    throw new QrDecodeError("EMPTY_FILE", "The selected image is empty.");
  }
  if (meta.size > MAX_QR_FILE_BYTES) {
    throw new QrDecodeError(
      "FILE_TOO_LARGE",
      `QR images must be ${Math.floor(MAX_QR_FILE_BYTES / (1024 * 1024))} MB or smaller.`
    );
  }
  const type = (meta.type ?? "").toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(type)) {
    throw new QrDecodeError("INVALID_FILE_TYPE", "Only PNG and JPEG images are accepted.");
  }
  const name = (meta.name ?? "").toLowerCase();
  if (name) {
    const extension = name.slice(name.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new QrDecodeError("INVALID_FILE_TYPE", "Only .png, .jpg, and .jpeg files are accepted.");
    }
  }
}

function assertSafeDimensions(width: number, height: number): void {
  if (
    width <= 0 ||
    height <= 0 ||
    width > MAX_IMAGE_DIMENSION ||
    height > MAX_IMAGE_DIMENSION ||
    width * height > MAX_IMAGE_PIXELS
  ) {
    throw new QrDecodeError(
      "IMAGE_TOO_LARGE",
      `Images must be at most ${MAX_IMAGE_DIMENSION}×${MAX_IMAGE_DIMENSION} pixels and ${MAX_IMAGE_PIXELS.toLocaleString()} total pixels.`
    );
  }
}

export function validateQrImageBytes(bytes: Uint8Array): QrFileInfo {
  const type = detectImageType(bytes);
  if (!type) {
    throw new QrDecodeError("INVALID_IMAGE", "The file is not a valid PNG or JPEG image.");
  }
  const dimensions = readImageDimensions(bytes, type);
  if (!dimensions) {
    throw new QrDecodeError("INVALID_IMAGE", "The image dimensions could not be read safely.");
  }
  assertSafeDimensions(dimensions.width, dimensions.height);
  return {
    mime: type,
    mimeType: type === "png" ? "image/png" : "image/jpeg",
    width: dimensions.width,
    height: dimensions.height,
  };
}

export function decodeQrImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number
): string | null {
  if (width <= 0 || height <= 0 || data.length < width * height * 4) return null;
  const result = jsQR(data, width, height, { inversionAttempts: "attemptBoth" });
  const text = result?.data?.trim() ?? "";
  return text || null;
}

async function loadImageBitmap(blob: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob);
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Decodes a QR image entirely in the browser. The image is never uploaded.
 * File metadata and image headers are checked before decoding to limit
 * decompression and memory risks.
 */
export async function decodeQrFromFile(file: File): Promise<{
  text: string;
  width: number;
  height: number;
  mime: ImageType;
}> {
  validateQrFileMeta({ size: file.size, type: file.type, name: file.name });

  const buffer = new Uint8Array(await file.arrayBuffer());
  const info = validateQrImageBytes(buffer);
  const blob = new Blob([buffer], { type: info.mimeType });
  const image = await loadImageBitmap(blob);

  try {
    const width = "width" in image ? image.width : 0;
    const height = "height" in image ? image.height : 0;
    assertSafeDimensions(width, height);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new QrDecodeError("INVALID_IMAGE", "The browser could not create an image canvas.");
    }
    context.drawImage(image, 0, 0, width, height);
    const imageData = context.getImageData(0, 0, width, height);
    const text = decodeQrImageData(imageData.data, width, height);
    if (!text) {
      throw new QrDecodeError(
        "NO_QR_CODE",
        "No QR code was found. Try a sharper, well-lit image with the full code visible."
      );
    }
    if (text.length > MAX_DECODED_QR_LENGTH) {
      throw new QrDecodeError(
        "CONTENT_TOO_LONG",
        `The decoded QR content exceeds ${MAX_DECODED_QR_LENGTH} characters.`
      );
    }
    return { text, width, height, mime: info.mime };
  } finally {
    if ("close" in image && typeof image.close === "function") image.close();
  }
}

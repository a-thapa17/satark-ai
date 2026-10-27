export type UrlErrorCode =
  | "INVALID_URL"
  | "URL_TOO_LONG"
  | "UNSUPPORTED_SCHEME"
  | "URL_CREDENTIALS_NOT_ALLOWED"
  | "UNSUPPORTED_PORT"
  | "BLOCKED_URL"
  | "DNS_LOOKUP_FAILED"
  | "REQUEST_TIMEOUT"
  | "NETWORK_ERROR"
  | "REDIRECT_ERROR"
  | "RESPONSE_TOO_LARGE";

export class UrlValidationError extends Error {
  public readonly code: UrlErrorCode;

  constructor(code: UrlErrorCode, message: string) {
    super(message);
    this.name = "UrlValidationError";
    this.code = code;
  }
}

export class BlockedUrlError extends UrlValidationError {
  constructor(message: string) {
    super("BLOCKED_URL", message);
    this.name = "BlockedUrlError";
  }
}

export class DnsLookupError extends UrlValidationError {
  constructor(message: string) {
    super("DNS_LOOKUP_FAILED", message);
    this.name = "DnsLookupError";
  }
}

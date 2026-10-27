import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import {
  buildEvidenceReport,
  evidenceFilename,
  EvidenceValidationError,
  parseEvidenceRequest,
  redactEvidenceText,
} from "../src/lib/help/evidence.ts";
import {
  renderEvidencePdf,
  toPdfSafeText,
} from "../src/lib/help/pdf.ts";
import { POST } from "../src/app/api/evidence-pdf/route.ts";

const VALID_NOW = new Date("2026-10-26T10:00:00.000Z");
const originalTrustHeaders = process.env.TRUST_PROXY_HEADERS;
process.env.TRUST_PROXY_HEADERS = "true";

after(() => {
  if (originalTrustHeaders === undefined) delete process.env.TRUST_PROXY_HEADERS;
  else process.env.TRUST_PROXY_HEADERS = originalTrustHeaders;
});

function assertValidationError(
  callback: () => unknown,
  expectedCode: string
): void {
  assert.throws(callback, (error: unknown) => {
    assert.ok(error instanceof EvidenceValidationError);
    assert.equal(error.code, expectedCode);
    return true;
  });
}

function makeRequest(
  body: unknown,
  ip: string,
  rawBody?: string
): Request {
  return new Request("http://localhost/api/evidence-pdf", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: rawBody ?? JSON.stringify(body),
  });
}

describe("Phase 3 evidence redaction", () => {
  it("removes OTPs, passwords, tokens, PINs, cards, Aadhaar, PAN, and bank accounts", () => {
    const redacted = redactEvidenceText(
      "OTP 482913.\n" +
        "password: Nevershare1.\n" +
        "token: supersecrettoken123.\n" +
        "Authorization: Bearer aaa.bbb.ccc.\n" +
        "CVV 918. PIN 4321.\n" +
        "Card 4111 1111 1111 1111.\n" +
        "Aadhaar 1234 5678 9012.\n" +
        "PAN ABCDE1234F.\n" +
        "Account number 123456789012.\n" +
        "UTR UTR-998877."
    );
    const text = redacted.text;

    for (const secret of [
      "482913",
      "Nevershare1",
      "supersecrettoken123",
      "aaa.bbb.ccc",
      "4111 1111 1111 1111",
      "1234 5678 9012",
      "ABCDE1234F",
      "123456789012",
    ]) {
      assert.ok(!text.includes(secret), `secret leaked: ${secret}`);
    }
    assert.match(text, /\[REDACTED/);
    assert.match(text, /UTR-998877/);
    assert.ok(redacted.count >= 7);
    assert.ok(redacted.types.includes("OTP"));
    assert.ok(redacted.types.includes("Payment card"));
  });

  it("redacts sensitive URL query parameters while keeping the rest", () => {
    const report = buildEvidenceReport(
      parseEvidenceRequest({
        incidentType: "online_scam",
        description: "I received a link.",
        suspiciousUrls: [
          "https://example.com/login?token=secret-token&next=/home",
        ],
      }),
      VALID_NOW
    );
    assert.equal(report.suspiciousUrls.length, 1);
    assert.match(report.suspiciousUrls[0] ?? "", /token=REDACTED/);
    assert.match(report.suspiciousUrls[0] ?? "", /next=%2Fhome|next=\/home/);
    assert.ok(!report.content.includes("secret-token"));
  });
});

describe("Phase 3 evidence input validation", () => {
  it("rejects malformed payloads and missing details", () => {
    assertValidationError(
      () => parseEvidenceRequest(null),
      "INVALID_PAYLOAD"
    );
    assertValidationError(
      () => parseEvidenceRequest({ incidentType: "financial_fraud" }),
      "DESCRIPTION_REQUIRED"
    );
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "not-real",
          description: "Test",
        }),
      "INVALID_INCIDENT_TYPE"
    );
    assertValidationError(
      () => parseEvidenceRequest({ incidentType: "other", description: "   " }),
      "DESCRIPTION_REQUIRED"
    );
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "other",
          description: "Test",
          descriptionExtra: true,
          name: 42,
        }),
      "INVALID_FIELD"
    );
  });

  it("rejects invalid, unsafe, and excessive URLs", () => {
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "online_scam",
          description: "Test",
          suspiciousUrls: ["javascript:alert(1)"],
        }),
      "INVALID_URL"
    );
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "online_scam",
          description: "Test",
          suspiciousUrls: ["https://user:pass@example.com/"],
        }),
      "INVALID_URL"
    );
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "online_scam",
          description: "Test",
          suspiciousUrls: [42 as never],
        }),
      "INVALID_URLS"
    );
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "online_scam",
          description: "Test",
          suspiciousUrls: Array.from(
            { length: 6 },
            (_, index) => `https://example.com/${index}`
          ),
        }),
      "TOO_MANY_URLS"
    );
  });

  it("rejects invalid dates and overlong fields", () => {
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "other",
          description: "Test",
          incidentAt: "not-a-date",
        }),
      "INVALID_INCIDENT_TIME"
    );
    assertValidationError(
      () =>
        parseEvidenceRequest({
          incidentType: "other",
          description: "x".repeat(3_001),
        }),
      "FIELD_TOO_LONG"
    );
  });

  it("normalises bare URLs without fetching them", () => {
    const parsed = parseEvidenceRequest({
      incidentType: "online_scam",
      description: "I saw this link.",
      suspiciousUrls: ["example.com/path?token=abc"],
    });
    assert.deepEqual(parsed.suspiciousUrls, ["https://example.com/path?token=abc"]);
  });
});

describe("Phase 3 evidence report content", () => {
  it("separates user-provided details from recorded automated analysis", () => {
    const report = buildEvidenceReport(
      parseEvidenceRequest({
        incidentType: "financial_fraud",
        description: "I paid INR 4,500 to a fake seller.",
        incidentAt: "2026-10-25T19:45",
        transactionRef: "UTR-112233",
        scannerFindings: "URL scanner: SUSPICIOUS - lookalike domain.",
      }),
      VALID_NOW
    );

    assert.match(report.content, /SECTION A - USER-PROVIDED INCIDENT DETAILS/);
    assert.match(
      report.content,
      /SECTION B - AUTOMATED ANALYSIS \(USER-RECORDED, NOT RE-VERIFIED\)/
    );
    assert.ok(
      report.content.indexOf("SECTION A") < report.content.indexOf("SECTION B")
    );
    assert.match(report.content, /No report has been submitted by Satark AI/i);
    assert.match(report.content, /automated threat assessments are not definitive proof/i);
    assert.match(report.content, /UTR-112233/);
    assert.match(report.content, /2026-10-25 19:45/);
    assert.match(report.content, /https:\/\/cybercrime\.gov\.in/);
    assert.match(report.content, /call 1930/);
    assert.match(report.content, /Not provided/);
    assert.match(report.content, /NOT GUARANTEED|not guaranteed/i);
    assert.ok(report.nextSteps.length >= 3);
    assert.ok(report.reportingOptions.length >= 2);
  });

  it("does not include pasted secrets in the report content", () => {
    const report = buildEvidenceReport(
      parseEvidenceRequest({
        incidentType: "other",
        description:
          "OTP 482913, password=Nevershare1, token: supersecrettoken123.",
      }),
      VALID_NOW
    );
    assert.doesNotMatch(report.content, /482913|Nevershare1|supersecrettoken123/);
    assert.match(report.content, /\[REDACTED/);
  });

  it("renders a valid PDF and handles escaped punctuation and long URLs", async () => {
    const report = buildEvidenceReport(
      parseEvidenceRequest({
        incidentType: "online_scam",
        description:
          "Evidence (brackets) and \\ backslashes. <script>alert('x')</script> " +
          "A long URL follows: https://example.com/" + "a".repeat(300),
      }),
      VALID_NOW
    );
    const bytes = await renderEvidencePdf(report);
    assert.equal(Buffer.from(bytes).subarray(0, 5).toString("latin1"), "%PDF-");
    const loaded = await PDFDocument.load(bytes);
    assert.ok(loaded.getPageCount() >= 1);
    assert.equal(loaded.getTitle(), "Satark AI - Incident Evidence Summary");
    assert.equal(
      evidenceFilename(VALID_NOW),
      "satark-evidence-20261026-100000Z.pdf"
    );
  });

  it("normalises common punctuation and non-Latin characters for standard fonts", () => {
    assert.equal(toPdfSafeText("₹5,000 — “test”"), 'INR 5,000 - "test"');
    assert.match(toPdfSafeText("हिन्दी"), /\?/);
  });
});

describe("Phase 3 evidence PDF API", () => {
  it("returns a downloadable PDF for valid details", async () => {
    const response = await POST(
      makeRequest(
        {
          incidentType: "financial_fraud",
          description: "I lost money to a fake UPI request.",
          amount: "INR 2,500",
          transactionRef: "UTR-445566",
          scannerFindings: "Recorded scanner result: suspicious payee.",
        },
        "198.51.100.10"
      )
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/pdf");
    assert.match(
      response.headers.get("content-disposition") ?? "",
      /^attachment; filename="satark-evidence-/
    );
    assert.equal(response.headers.get("cache-control"), "no-store");

    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.equal(Buffer.from(bytes).subarray(0, 5).toString("latin1"), "%PDF-");
    const loaded = await PDFDocument.load(bytes);
    assert.ok(loaded.getPageCount() >= 1);
  });

  it("rejects malformed JSON and missing information with safe errors", async () => {
    const malformed = await POST(
      makeRequest(undefined, "198.51.100.11", "{")
    );
    assert.equal(malformed.status, 400);
    const malformedBody = (await malformed.json()) as {
      success: boolean;
      code: string;
    };
    assert.equal(malformedBody.success, false);
    assert.equal(malformedBody.code, "INVALID_JSON");

    const missing = await POST(
      makeRequest({ incidentType: "financial_fraud" }, "198.51.100.12")
    );
    assert.equal(missing.status, 400);
    const missingBody = (await missing.json()) as { code: string };
    assert.equal(missingBody.code, "DESCRIPTION_REQUIRED");
  });

  it("rejects unsafe URLs and oversized requests", async () => {
    const badUrl = await POST(
      makeRequest(
        {
          incidentType: "online_scam",
          description: "Test",
          suspiciousUrls: ["javascript:alert(1)"],
        },
        "198.51.100.13"
      )
    );
    assert.equal(badUrl.status, 400);
    assert.equal(((await badUrl.json()) as { code: string }).code, "INVALID_URL");

    const oversized = await POST(
      makeRequest(undefined, "198.51.100.14", JSON.stringify({ data: "x".repeat(25_000) }))
    );
    assert.equal(oversized.status, 413);
    assert.equal(
      ((await oversized.json()) as { code: string }).code,
      "PAYLOAD_TOO_LARGE"
    );

    const declaredOversized = new Request(
      "http://localhost/api/evidence-pdf",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "content-length": "25000",
          "x-forwarded-for": "198.51.100.16",
        },
        body: "{}",
      }
    );
    const declaredResponse = await POST(declaredOversized);
    assert.equal(declaredResponse.status, 413);
    assert.equal(
      ((await declaredResponse.json()) as { code: string }).code,
      "PAYLOAD_TOO_LARGE"
    );
  });

  it("rate-limits repeated PDF requests with a JSON error", async () => {
    for (let index = 0; index < 8; index += 1) {
      const response = await POST(
        makeRequest(
          { incidentType: "other", description: "Request " + index },
          "198.51.100.15"
        )
      );
      assert.notEqual(response.status, 429);
    }
    const limited = await POST(
      makeRequest(
        { incidentType: "other", description: "One too many" },
        "198.51.100.15"
      )
    );
    assert.equal(limited.status, 429);
    assert.equal(((await limited.json()) as { code: string }).code, "RATE_LIMITED");
  });
});

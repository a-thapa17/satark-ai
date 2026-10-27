import { after, afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/analyze-url/route.ts";

const originalDemoMode = process.env.PHASE2_DEMO_MODE;
const originalTrustHeaders = process.env.TRUST_PROXY_HEADERS;
process.env.TRUST_PROXY_HEADERS = "true";

after(() => {
  if (originalTrustHeaders === undefined) delete process.env.TRUST_PROXY_HEADERS;
  else process.env.TRUST_PROXY_HEADERS = originalTrustHeaders;
});

afterEach(() => {
  if (originalDemoMode === undefined) delete process.env.PHASE2_DEMO_MODE;
  else process.env.PHASE2_DEMO_MODE = originalDemoMode;
});

function makeRequest(body: unknown, ip: string, rawBody?: string): Request {
  return new Request("http://localhost/api/analyze-url", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: rawBody ?? JSON.stringify(body),
  });
}

describe("Phase 2 URL analysis API route", () => {
  it("rejects malformed JSON", async () => {
    const response = await POST(makeRequest(undefined, "198.51.100.1", "{"));
    assert.equal(response.status, 400);
    const data = (await response.json()) as { success: boolean; code: string };
    assert.equal(data.success, false);
    assert.equal(data.code, "INVALID_JSON");
  });

  it("rejects a missing URL field", async () => {
    const response = await POST(makeRequest({}, "198.51.100.2"));
    assert.equal(response.status, 400);
    const data = (await response.json()) as { code: string };
    assert.equal(data.code, "INVALID_URL");
  });

  it("rejects unsupported schemes before analysis", async () => {
    const response = await POST(makeRequest({ url: "ftp://example.com/file" }, "198.51.100.3"));
    assert.equal(response.status, 400);
    const data = (await response.json()) as { code: string };
    assert.equal(data.code, "UNSUPPORTED_SCHEME");
  });

  it("blocks direct localhost/private IP requests", async () => {
    const response = await POST(makeRequest({ url: "http://127.0.0.1/admin" }, "198.51.100.4"));
    assert.equal(response.status, 400);
    const data = (await response.json()) as { code: string };
    assert.equal(data.code, "BLOCKED_URL");
  });

  it("rejects oversized request bodies by content-length", async () => {
    const request = new Request("http://localhost/api/analyze-url", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "9000",
        "x-forwarded-for": "198.51.100.5",
      },
      body: "{}",
    });
    const response = await POST(request);
    assert.equal(response.status, 413);
  });

  it("rejects an oversized body when content-length is absent", async () => {
    const response = await POST(
      makeRequest(
        { url: "https://example.com/", padding: "x".repeat(9_000) },
        "198.51.100.8"
      )
    );
    assert.equal(response.status, 413);
    const data = (await response.json()) as { code: string };
    assert.equal(data.code, "PAYLOAD_TOO_LARGE");
  });

  it("returns a clearly labelled demo report for the built-in sample", async () => {
    process.env.PHASE2_DEMO_MODE = "true";
    const response = await POST(makeRequest({ url: "https://example.com/" }, "198.51.100.6"));
    assert.equal(response.status, 200);
    const data = (await response.json()) as {
      success: boolean;
      report: { demo: boolean; verdict: string };
    };
    assert.equal(data.success, true);
    assert.equal(data.report.demo, true);
    assert.equal(data.report.verdict, "NO_KNOWN_THREAT");
  });

  it("rate-limits repeated scans per client IP", async () => {
    const ip = "198.51.100.7";
    for (let index = 0; index < 10; index += 1) {
      const response = await POST(makeRequest({ url: "ftp://example.com/" }, ip));
      assert.equal(response.status, 400);
    }
    const limited = await POST(makeRequest({ url: "ftp://example.com/" }, ip));
    assert.equal(limited.status, 429);
    const data = (await limited.json()) as { code: string };
    assert.equal(data.code, "RATE_LIMITED");
  });
});

import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  DIRECT_CLIENT_BUCKET,
  getClientIp,
  TRUST_PROXY_HEADERS_ENV,
  TRUST_PROXY_HOPS_ENV,
} from "../src/lib/http/client-ip.ts";

const originalTrustHeaders = process.env[TRUST_PROXY_HEADERS_ENV];
const originalTrustHops = process.env[TRUST_PROXY_HOPS_ENV];

function requestWith(headers: Record<string, string>): Request {
  return new Request("http://localhost/api/test", { headers });
}

beforeEach(() => {
  delete process.env[TRUST_PROXY_HEADERS_ENV];
  delete process.env[TRUST_PROXY_HOPS_ENV];
});

afterEach(() => {
  if (originalTrustHeaders === undefined) delete process.env[TRUST_PROXY_HEADERS_ENV];
  else process.env[TRUST_PROXY_HEADERS_ENV] = originalTrustHeaders;
  if (originalTrustHops === undefined) delete process.env[TRUST_PROXY_HOPS_ENV];
  else process.env[TRUST_PROXY_HOPS_ENV] = originalTrustHops;
});

describe("Satark AI — client IP trust model", () => {
  it("ignores spoofed forwarded headers by default", () => {
    const first = getClientIp(
      requestWith({ "x-forwarded-for": "198.51.100.1", "x-real-ip": "198.51.100.2" })
    );
    const second = getClientIp(
      requestWith({ "x-forwarded-for": "198.51.100.99", "x-real-ip": "198.51.100.98" })
    );
    assert.equal(first, DIRECT_CLIENT_BUCKET);
    assert.equal(second, DIRECT_CLIENT_BUCKET);
    assert.equal(first, second);
  });

  it("uses the rightmost client hop when one trusted proxy is configured", () => {
    process.env[TRUST_PROXY_HEADERS_ENV] = "true";
    const ip = getClientIp(
      requestWith({ "x-forwarded-for": "spoofed-value, 203.0.113.10" })
    );
    assert.equal(ip, "203.0.113.10");
  });

  it("uses the declared number of trusted hops", () => {
    process.env[TRUST_PROXY_HEADERS_ENV] = "true";
    process.env[TRUST_PROXY_HOPS_ENV] = "2";
    const ip = getClientIp(
      requestWith({
        "x-forwarded-for": "spoofed-value, 203.0.113.10, 10.0.0.5",
      })
    );
    assert.equal(ip, "203.0.113.10");
  });

  it("falls back to the first hop when the chain is shorter than the hop count", () => {
    process.env[TRUST_PROXY_HEADERS_ENV] = "true";
    process.env[TRUST_PROXY_HOPS_ENV] = "5";
    const ip = getClientIp(requestWith({ "x-forwarded-for": "203.0.113.10" }));
    assert.equal(ip, "203.0.113.10");
  });

  it("supports x-real-ip only when proxy trust is enabled", () => {
    process.env[TRUST_PROXY_HEADERS_ENV] = "true";
    const ip = getClientIp(requestWith({ "x-real-ip": "203.0.113.20" }));
    assert.equal(ip, "203.0.113.20");
  });

  it("clamps invalid hop counts to the default", () => {
    process.env[TRUST_PROXY_HEADERS_ENV] = "true";
    process.env[TRUST_PROXY_HOPS_ENV] = "not-a-number";
    const ip = getClientIp(
      requestWith({ "x-forwarded-for": "spoofed-value, 203.0.113.30" })
    );
    assert.equal(ip, "203.0.113.30");
  });

  it("uses a shared unknown bucket when trusted mode has no headers", () => {
    process.env[TRUST_PROXY_HEADERS_ENV] = "true";
    assert.equal(getClientIp(requestWith({})), "unknown");
  });
});

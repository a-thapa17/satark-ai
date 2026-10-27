import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { analyzeUrl } from "../src/lib/url/analyze.ts";
import { BlockedUrlError, UrlValidationError } from "../src/lib/url/errors.ts";
import { getRegistrableDomain } from "../src/lib/url/domain.ts";
import { isPublicIp } from "../src/lib/url/ip.ts";
import { lookupRdapDomain } from "../src/lib/url/rdap.ts";
import {
  createPinnedLookup,
  requestOnce,
  traceRedirects,
  type HopRequester,
} from "../src/lib/url/safe-request.ts";
import { checkGoogleSafeBrowsing, checkUrlhaus } from "../src/lib/url/threats.ts";
import {
  normalizeUrlInput,
  resolvePublicAddresses,
  type LookupFn,
} from "../src/lib/url/validation.ts";
import type { RdapDomainInfo, ThreatCheckResult } from "../src/lib/url/types.ts";

const publicLookup: LookupFn = async () => [{ address: "93.184.216.34", family: 4 }];
const privateLookup: LookupFn = async () => [{ address: "10.0.0.5", family: 4 }];

function requestMap(
  responses: Record<string, { status: number; location?: string }>
): HopRequester {
  return async (url) => responses[url.href] ?? { status: 200 };
}

function cleanCheck(service: "Google Safe Browsing" | "URLhaus", urls: string[]): ThreatCheckResult {
  return {
    service,
    status: "clean",
    message: "clean in test",
    matches: [],
    checkedUrls: urls,
  };
}

function oldRdap(domain: string): RdapDomainInfo {
  return {
    status: "ok",
    domain,
    ageDays: 5000,
    registrar: "Test Registrar",
    registryStatuses: [],
    message: "old domain",
  };
}

describe("Phase 2 URL normalization and static validation", () => {
  it("adds a default HTTPS scheme and removes fragments", () => {
    const result = normalizeUrlInput("example.com/path#fragment");
    assert.equal(result.normalizedUrl, "https://example.com/path");
    assert.equal(result.hostname, "example.com");
  });

  it("accepts public HTTP and HTTPS URLs", () => {
    assert.equal(normalizeUrlInput("https://example.com").normalizedUrl, "https://example.com/");
    assert.equal(normalizeUrlInput("http://example.com/a?b=1").normalizedUrl, "http://example.com/a?b=1");
  });

  it("rejects unsupported schemes", () => {
    assert.throws(() => normalizeUrlInput("javascript:alert(1)"), UrlValidationError);
    assert.throws(() => normalizeUrlInput("ftp://example.com/file"), UrlValidationError);
    assert.throws(() => normalizeUrlInput("mailto:test@example.com"), UrlValidationError);
  });

  it("rejects embedded credentials", () => {
    assert.throws(
      () => normalizeUrlInput("https://user:pass@example.com/"),
      /embedded usernames or passwords/i
    );
  });

  it("rejects non-standard ports", () => {
    assert.throws(() => normalizeUrlInput("https://example.com:8443/"), /Only standard HTTP/i);
  });

  it("rejects localhost and internal hostnames", () => {
    assert.throws(() => normalizeUrlInput("http://localhost/"), /Local and internal/i);
    assert.throws(() => normalizeUrlInput("http://router.local/"), /Local and internal/i);
    assert.throws(() => normalizeUrlInput("http://metadata.google.internal/"), /Local and internal/i);
  });

  it("rejects whitespace and control characters", () => {
    assert.throws(() => normalizeUrlInput("https://example.com/a b"), /whitespace/i);
    assert.throws(() => normalizeUrlInput("https://example.com/\u0000"), /whitespace/i);
  });

  it("rejects oversized URLs", () => {
    assert.throws(
      () => normalizeUrlInput(`https://example.com/${"a".repeat(2100)}`),
      /2048 characters or fewer/i
    );
  });

  it("extracts registrable domains with common Indian suffixes", () => {
    assert.equal(getRegistrableDomain("a.b.example.co.in"), "example.co.in");
    assert.equal(getRegistrableDomain("www.example.com"), "example.com");
  });
});

describe("Phase 2 IP and DNS SSRF protections", () => {
  it("classifies private, reserved, loopback, link-local, and CGNAT addresses as non-public", () => {
    for (const ip of [
      "127.0.0.1",
      "10.0.0.1",
      "172.16.0.1",
      "192.168.1.1",
      "169.254.169.254",
      "100.64.0.1",
      "192.0.2.10",
      "0.0.0.0",
      "224.0.0.1",
      "::1",
      "fc00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
    ]) {
      assert.equal(isPublicIp(ip), false, `${ip} should be blocked`);
    }
  });

  it("accepts globally routable IPv4 and IPv6 addresses", () => {
    assert.equal(isPublicIp("8.8.8.8"), true);
    assert.equal(isPublicIp("2606:4700:4700::1111"), true);
    assert.equal(isPublicIp("::ffff:8.8.8.8"), true);
  });

  it("blocks a hostname that resolves to a private address", async () => {
    const url = normalizeUrlInput("https://internal.example/");
    await assert.rejects(
      () => resolvePublicAddresses(url.url, privateLookup),
      /private or reserved/i
    );
  });

  it("blocks a hostname with mixed public and private DNS answers", async () => {
    const lookup: LookupFn = async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.5", family: 4 },
    ];
    const url = normalizeUrlInput("https://mixed.example/");
    await assert.rejects(
      () => resolvePublicAddresses(url.url, lookup),
      /private or reserved/i
    );
  });

  it("pins the validated address and blocks a rebinding lookup", async () => {
    let call = 0;
    const lookup: LookupFn = async () => {
      call += 1;
      return call === 1
        ? [{ address: "93.184.216.34", family: 4 }]
        : [{ address: "10.0.0.5", family: 4 }];
    };
    const pinned = createPinnedLookup(lookup) as unknown as (
      hostname: string,
      options: { family?: number; all?: boolean },
      callback: (error: Error | null, address?: string, family?: number) => void
    ) => void;

    const first = await new Promise<string>((resolve, reject) => {
      pinned("rebind.example", { family: 4 }, (error, address) =>
        error ? reject(error) : resolve(String(address))
      );
    });
    assert.equal(first, "93.184.216.34");

    await assert.rejects(
      () =>
        new Promise<string>((resolve, reject) => {
          pinned("rebind.example", { family: 4 }, (error, address) =>
            error ? reject(error) : resolve(String(address))
          );
        }),
      /non-public address/
    );
  });

  it("blocks the connection-time lookup when DNS returns a private address", async () => {
    await assert.rejects(
      () =>
        requestOnce(new URL("https://rebind.example/"), {
          lookup: privateLookup,
          timeoutMs: 1000,
        }),
      /non-public address|private or reserved/i
    );
  });

  it("rejects a direct private IP before making a network request", async () => {
    let requested = false;
    await assert.rejects(
      () =>
        analyzeUrl("http://127.0.0.1/admin", {
          lookup: publicLookup,
          request: async () => {
            requested = true;
            return { status: 200 };
          },
          safeBrowsing: async (urls) => cleanCheck("Google Safe Browsing", urls),
          urlhaus: async (urls) => cleanCheck("URLhaus", [urls]),
          rdap: async (domain) => oldRdap(domain),
        }),
      BlockedUrlError
    );
    assert.equal(requested, false);
  });
});

describe("Phase 2 redirect tracing", () => {
  it("records a normal redirect chain", async () => {
    const start = normalizeUrlInput("https://a.example/start");
    const trace = await traceRedirects(start, {
      lookup: publicLookup,
      request: requestMap({
        "https://a.example/start": {
          status: 302,
          location: "https://b.example/landing",
        },
        "https://b.example/landing": { status: 200 },
      }),
    });

    assert.equal(trace.redirectCount, 1);
    assert.equal(trace.truncated, false);
    assert.equal(trace.finalUrl, "https://b.example/landing");
    assert.equal(trace.hops.length, 2);
    assert.equal(trace.hops[0].status, 302);
    assert.equal(trace.hops[1].status, 200);
  });

  it("stops at the configured redirect limit", async () => {
    const start = normalizeUrlInput("https://chain.example/1");
    const trace = await traceRedirects(start, {
      maxRedirects: 2,
      lookup: publicLookup,
      request: requestMap({
        "https://chain.example/1": { status: 302, location: "https://chain.example/2" },
        "https://chain.example/2": { status: 302, location: "https://chain.example/3" },
        "https://chain.example/3": { status: 302, location: "https://chain.example/4" },
        "https://chain.example/4": { status: 200 },
      }),
    });

    assert.equal(trace.redirectCount, 2);
    assert.equal(trace.truncated, true);
    assert.equal(trace.hops.at(-1)?.kind, "blocked");
    assert.match(trace.hops.at(-1)?.note ?? "", /redirect limit/i);
  });

  it("blocks a redirect to a private address and does not request it", async () => {
    const requested: string[] = [];
    const start = normalizeUrlInput("https://public.example/start");
    const trace = await traceRedirects(start, {
      lookup: publicLookup,
      request: async (url) => {
        requested.push(url.href);
        if (url.href === "https://public.example/start") {
          return { status: 302, location: "http://10.0.0.5/internal" };
        }
        return { status: 200 };
      },
    });

    assert.ok(trace.blocked);
    assert.match(trace.blocked?.reason ?? "", /private|reserved/i);
    assert.deepEqual(requested, ["https://public.example/start"]);
    assert.equal(trace.hops.at(-1)?.kind, "blocked");
  });

  it("detects a redirect loop", async () => {
    const start = normalizeUrlInput("https://loop.example/a");
    const trace = await traceRedirects(start, {
      lookup: publicLookup,
      request: requestMap({
        "https://loop.example/a": { status: 302, location: "https://loop.example/b" },
        "https://loop.example/b": { status: 302, location: "https://loop.example/a" },
      }),
    });

    assert.equal(trace.error?.code, "REDIRECT_ERROR");
    assert.match(trace.hops.at(-1)?.note ?? "", /loop/i);
  });

  it("returns a timeout error gracefully", async () => {
    const start = normalizeUrlInput("https://slow.example/");
    const trace = await traceRedirects(start, {
      lookup: publicLookup,
      request: async () => {
        throw new Error("simulated timeout");
      },
    });
    assert.equal(trace.error?.code, "NETWORK_ERROR");
    assert.equal(trace.hops.at(-1)?.kind, "error");
  });
});

describe("Phase 2 URL verdicts and service fallbacks", () => {
  const baseDeps = {
    lookup: publicLookup,
    request: async () => ({ status: 200 }),
    safeBrowsing: async (urls: string[]) => cleanCheck("Google Safe Browsing", urls),
    urlhaus: async (urls: string) => cleanCheck("URLhaus", [urls]),
    rdap: async (domain: string) => oldRdap(domain),
  };

  it("returns NO_KNOWN_THREAT when a usable service reports clean and no warnings exist", async () => {
    const report = await analyzeUrl("https://example.com/", baseDeps);
    assert.equal(report.verdict, "NO_KNOWN_THREAT");
    assert.equal(report.redirects.length, 1);
    assert.equal(report.threats.safeBrowsing.status, "clean");
    assert.equal(report.threats.urlhaus.status, "clean");
  });

  it("returns MALICIOUS for a confirmed Safe Browsing match", async () => {
    const report = await analyzeUrl("https://bad.example/", {
      ...baseDeps,
      safeBrowsing: async (urls: string[]) => ({
        service: "Google Safe Browsing",
        status: "threat",
        message: "match",
        matches: [{ threatType: "SOCIAL_ENGINEERING" }],
        checkedUrls: urls,
      }),
    });
    assert.equal(report.verdict, "MALICIOUS");
    assert.equal(report.score, 100);
    assert.ok(report.nextSteps.some((step) => /1930/.test(step)));
  });

  it("returns MALICIOUS for a URLhaus record", async () => {
    const report = await analyzeUrl("https://bad.example/", {
      ...baseDeps,
      urlhaus: async (urls: string) => ({
        service: "URLhaus",
        status: "threat",
        message: "record",
        matches: [{ threatType: "malware_download" }],
        checkedUrls: [urls],
      }),
    });
    assert.equal(report.verdict, "MALICIOUS");
  });

  it("returns INCONCLUSIVE when no threat service is available and the site is otherwise quiet", async () => {
    const report = await analyzeUrl("https://quiet.example/", {
      ...baseDeps,
      safeBrowsing: async (urls: string[]) => ({
        service: "Google Safe Browsing",
        status: "not_configured",
        message: "no key",
        matches: [],
        checkedUrls: urls,
      }),
      urlhaus: async (urls: string) => ({
        service: "URLhaus",
        status: "unavailable",
        message: "down",
        matches: [],
        checkedUrls: [urls],
      }),
      rdap: async () => ({
        status: "unavailable",
        registryStatuses: [],
        message: "no rdap",
      }),
    });
    assert.equal(report.verdict, "INCONCLUSIVE");
  });

  it("flags a brand lookalike with a newly registered domain as SUSPICIOUS", async () => {
    const report = await analyzeUrl("https://onlinesbi-kyc.portal.evil.example/login", {
      ...baseDeps,
      request: async () => ({ status: 200 }),
      rdap: async (domain) => ({
        status: "ok",
        domain,
        ageDays: 3,
        registrar: "Test Registrar",
        registryStatuses: [],
        message: "new",
      }),
    });
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.ok(report.warnings.some((warning) => warning.id === "BRAND_LOOKALIKE"));
    assert.ok(report.warnings.some((warning) => warning.id === "DOMAIN_VERY_NEW"));
  });

  it("does not match short brand tokens inside unrelated words", async () => {
    for (const url of ["https://praxis.example/", "https://arbitrary.example/"]) {
      const report = await analyzeUrl(url, baseDeps);
      assert.equal(report.verdict, "NO_KNOWN_THREAT");
      assert.ok(!report.warnings.some((warning) => warning.id === "BRAND_LOOKALIKE"));
    }
  });

  it("applies brand and path warnings to the final redirect destination", async () => {
    const report = await analyzeUrl("https://legit.example/start", {
      ...baseDeps,
      request: async (url) =>
        url.hostname === "legit.example"
          ? {
              status: 302,
              location: "https://onlinesbi-kyc.evil.example/login",
            }
          : { status: 200 },
    });
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.equal(report.finalUrl, "https://onlinesbi-kyc.evil.example/login");
    assert.ok(report.warnings.some((warning) => warning.id === "BRAND_LOOKALIKE"));
    assert.ok(report.warnings.some((warning) => warning.id === "SENSITIVE_PATH_KEYWORDS"));
  });

  it("recognises a shortener on the www hostname", async () => {
    const report = await analyzeUrl("https://www.bit.ly/abc123", baseDeps);
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.ok(report.warnings.some((warning) => warning.id === "URL_SHORTENER"));
  });

  it("returns SUSPICIOUS and a blocked record for a redirect to an internal service", async () => {
    const report = await analyzeUrl("https://public.example/start", {
      ...baseDeps,
      request: async (url) =>
        url.href === "https://public.example/start"
          ? { status: 302, location: "http://169.254.169.254/latest/meta-data" }
          : { status: 200 },
    });
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.ok(report.blocked);
    assert.ok(report.warnings.some((warning) => warning.id === "BLOCKED_REDIRECT"));
  });

  it("returns SUSPICIOUS when the redirect limit is reached", async () => {
    const chain: Record<string, { status: number; location?: string }> = {};
    for (let index = 1; index <= 5; index += 1) {
      chain[`https://long.example/${index}`] = {
        status: 302,
        location: `https://long.example/${index + 1}`,
      };
    }
    chain["https://long.example/6"] = { status: 200 };

    const report = await analyzeUrl("https://long.example/1", {
      ...baseDeps,
      maxRedirects: 2,
      request: requestMap(chain),
    });
    assert.equal(report.verdict, "SUSPICIOUS");
    assert.equal(report.redirectChainTruncated, true);
  });

  it("handles a timeout from the URL fetch as INCONCLUSIVE", async () => {
    const report = await analyzeUrl("https://slow.example/", {
      ...baseDeps,
      request: async () => {
        throw new Error("network down");
      },
    });
    assert.equal(report.verdict, "INCONCLUSIVE");
  });

  it("returns clearly labelled demo data when demo mode is enabled", async () => {
    const report = await analyzeUrl("https://example.com/", {
      ...baseDeps,
      demoMode: true,
    });
    assert.equal(report.demo, true);
    assert.match(report.limitations, /DEMO MODE/i);
    assert.equal(report.verdict, "NO_KNOWN_THREAT");
  });
});

describe("Phase 2 threat-service adapters", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  it("marks Safe Browsing as not configured without a key", async () => {
    delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    const result = await checkGoogleSafeBrowsing(["https://example.com/"]);
    assert.equal(result.status, "not_configured");
  });

  it("parses a Safe Browsing clean response", async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = "test-key";
    globalThis.fetch = async () =>
      new Response(JSON.stringify({}), { status: 200, headers: { "Content-Type": "application/json" } });
    const result = await checkGoogleSafeBrowsing(["https://example.com/"]);
    assert.equal(result.status, "clean");
  });

  it("parses a Safe Browsing threat match", async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = "test-key";
    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          matches: [{ threatType: "SOCIAL_ENGINEERING", platformType: "ANY_PLATFORM" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    const result = await checkGoogleSafeBrowsing(["https://bad.example/"]);
    assert.equal(result.status, "threat");
    assert.equal(result.matches[0].threatType, "SOCIAL_ENGINEERING");
  });

  it("translates Safe Browsing quota errors to unavailable", async () => {
    process.env.GOOGLE_SAFE_BROWSING_API_KEY = "test-key";
    globalThis.fetch = async () => new Response("{}", { status: 429 });
    const result = await checkGoogleSafeBrowsing(["https://example.com/"]);
    assert.equal(result.status, "unavailable");
    assert.match(result.message, /quota/i);
  });

  it("parses URLhaus no-results and threat records", async () => {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ query_status: "no_results" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    let result = await checkUrlhaus("https://example.com/");
    assert.equal(result.status, "clean");

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          query_status: "ok",
          url_info: { url: "https://bad.example/", threat: "malware_download", tags: ["emotet"] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    result = await checkUrlhaus("https://bad.example/");
    assert.equal(result.status, "threat");
    assert.deepEqual(result.matches[0].tags, ["emotet"]);
  });

  it("translates URLhaus auth failures to unavailable", async () => {
    globalThis.fetch = async () => new Response("{}", { status: 401 });
    const result = await checkUrlhaus("https://example.com/");
    assert.equal(result.status, "unavailable");
    assert.match(result.message, /URLHAUS_AUTH_KEY/);
  });

  it("parses RDAP registration data and computes age", async () => {
    const now = new Date("2026-10-25T00:00:00.000Z");
    const result = await lookupRdapDomain("example.com", {
      now,
      lookup: publicLookup,
      endpoint: "https://rdap.example/domain/example.com",
      request: async () => ({
        status: 200,
        body: JSON.stringify({
          ldhName: "EXAMPLE.COM",
          status: ["client transfer prohibited"],
          events: [{ eventAction: "registration", eventDate: "2026-10-20T00:00:00.000Z" }],
          entities: [
            {
              roles: ["registrar"],
              vcardArray: ["vcard", [["fn", {}, "text", "Test Registrar"]]],
            },
          ],
        }),
      }),
    });

    assert.equal(result.status, "ok");
    assert.equal(result.ageDays, 5);
    assert.equal(result.registrar, "Test Registrar");
    assert.deepEqual(result.registryStatuses, ["client transfer prohibited"]);
  });

  it("marks a missing RDAP record as not_found", async () => {
    const result = await lookupRdapDomain("missing.example", {
      lookup: publicLookup,
      endpoint: "https://rdap.example/domain/missing.example",
      request: async () => ({ status: 404 }),
    });
    assert.equal(result.status, "not_found");
  });
});

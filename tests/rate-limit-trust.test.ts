import { after, describe, it } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/analyze-url/route.ts";

const originalTrustHeaders = process.env.TRUST_PROXY_HEADERS;
delete process.env.TRUST_PROXY_HEADERS;

after(() => {
  if (originalTrustHeaders === undefined) delete process.env.TRUST_PROXY_HEADERS;
  else process.env.TRUST_PROXY_HEADERS = originalTrustHeaders;
});

function requestWithForwardedIp(ip: string): Request {
  return new Request("http://localhost/api/analyze-url", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify({ url: "ftp://example.com/file" }),
  });
}

describe("Satark AI — unspoofable default rate-limit bucket", () => {
  it("does not let a caller rotate X-Forwarded-For to bypass the limit", async () => {
    for (let index = 0; index < 10; index += 1) {
      const response = await POST(
        requestWithForwardedIp(`203.0.113.${100 + index}`)
      );
      assert.equal(response.status, 400);
    }

    const limited = await POST(requestWithForwardedIp("203.0.113.250"));
    assert.equal(limited.status, 429);
    const data = (await limited.json()) as { code: string };
    assert.equal(data.code, "RATE_LIMITED");
  });
});

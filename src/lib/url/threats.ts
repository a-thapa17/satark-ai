import type { ThreatCheckResult, ThreatMatch } from "./types.ts";

const SERVICE_TIMEOUT_MS = 7000;

function timeoutSignal(ms = SERVICE_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export async function checkGoogleSafeBrowsing(
  urls: string[]
): Promise<ThreatCheckResult> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY?.trim();
  const checkedUrls = Array.from(new Set(urls)).slice(0, 10);

  if (!apiKey) {
    return {
      service: "Google Safe Browsing",
      status: "not_configured",
      message:
        "Google Safe Browsing is not configured. Set GOOGLE_SAFE_BROWSING_API_KEY on the server to enable confirmed threat matching.",
      matches: [],
      checkedUrls,
    };
  }

  try {
    const response = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: timeoutSignal(),
        body: JSON.stringify({
          client: { clientId: "satark-ai", clientVersion: "2.0.0" },
          threatInfo: {
            threatTypes: [
              "MALWARE",
              "SOCIAL_ENGINEERING",
              "UNWANTED_SOFTWARE",
              "POTENTIALLY_HARMFUL_APPLICATION",
            ],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: checkedUrls.map((url) => ({ url })),
          },
        }),
      }
    );

    if (!response.ok) {
      return {
        service: "Google Safe Browsing",
        status: response.status === 429 ? "unavailable" : "error",
        message:
          response.status === 429
            ? "Google Safe Browsing quota was exceeded. No threat conclusion is available from this service."
            : `Google Safe Browsing returned HTTP ${response.status}. No threat conclusion is available from this service.`,
        matches: [],
        checkedUrls,
      };
    }

    const data: unknown = await response.json();
    if (!isRecord(data)) {
      return {
        service: "Google Safe Browsing",
        status: "error",
        message: "Google Safe Browsing returned an unreadable response.",
        matches: [],
        checkedUrls,
      };
    }

    const rawMatches = Array.isArray(data.matches) ? data.matches : [];
    const matches: ThreatMatch[] = rawMatches
      .filter(isRecord)
      .map((match) => ({
        threatType: typeof match.threatType === "string" ? match.threatType : undefined,
        platformType: typeof match.platformType === "string" ? match.platformType : undefined,
        url: isRecord(match.threat) && typeof match.threat.url === "string" ? match.threat.url : undefined,
      }));

    if (matches.length > 0) {
      return {
        service: "Google Safe Browsing",
        status: "threat",
        message: "Google Safe Browsing returned at least one confirmed threat match.",
        matches,
        checkedUrls,
      };
    }

    return {
      service: "Google Safe Browsing",
      status: "clean",
      message: "Google Safe Browsing reported no matches for the checked URLs at scan time.",
      matches: [],
      checkedUrls,
    };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return {
      service: "Google Safe Browsing",
      status: "unavailable",
      message:
        name === "TimeoutError" || name === "AbortError"
          ? "Google Safe Browsing timed out. No threat conclusion is available from this service."
          : "Google Safe Browsing could not be reached. No threat conclusion is available from this service.",
      matches: [],
      checkedUrls,
    };
  }
}

export async function checkUrlhaus(url: string): Promise<ThreatCheckResult> {
  const authKey = process.env.URLHAUS_AUTH_KEY?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (authKey) headers["Auth-Key"] = authKey;

  try {
    const response = await fetch("https://urlhaus-api.abuse.ch/v1/url/", {
      method: "POST",
      headers,
      cache: "no-store",
      signal: timeoutSignal(),
      body: new URLSearchParams({ url }).toString(),
    });

    if (!response.ok) {
      const requiresKey = response.status === 401 || response.status === 403;
      return {
        service: "URLhaus",
        status: "unavailable",
        message: requiresKey
          ? "URLhaus rejected the request. Set URLHAUS_AUTH_KEY on the server or continue without this service."
          : response.status === 429
            ? "URLhaus rate limit reached. No threat conclusion is available from this service."
            : `URLhaus returned HTTP ${response.status}. No threat conclusion is available from this service.`,
        matches: [],
        checkedUrls: [url],
      };
    }

    const data: unknown = await response.json();
    if (!isRecord(data)) {
      return {
        service: "URLhaus",
        status: "error",
        message: "URLhaus returned an unreadable response.",
        matches: [],
        checkedUrls: [url],
      };
    }

    const queryStatus = typeof data.query_status === "string" ? data.query_status : "";
    if (queryStatus === "no_results") {
      return {
        service: "URLhaus",
        status: "clean",
        message: "URLhaus has no record of this URL at scan time.",
        matches: [],
        checkedUrls: [url],
      };
    }

    if (queryStatus === "ok") {
      const rawInfo = Array.isArray(data.url_info) ? data.url_info : data.url_info ? [data.url_info] : [];
      const infos = rawInfo.filter(isRecord);
      if (infos.length === 0) {
        return {
          service: "URLhaus",
          status: "clean",
          message: "URLhaus has no record of this URL at scan time.",
          matches: [],
          checkedUrls: [url],
        };
      }
      const matches: ThreatMatch[] = infos.map((info) => ({
        url: typeof info.url === "string" ? info.url : url,
        threatType: typeof info.threat === "string" ? info.threat : "URLhaus record",
        tags: stringArray(info.tags),
        reference:
          typeof info.urlhaus_reference === "string" ? info.urlhaus_reference : undefined,
      }));
      return {
        service: "URLhaus",
        status: "threat",
        message: "URLhaus has an active or historical record for this URL.",
        matches,
        checkedUrls: [url],
      };
    }

    return {
      service: "URLhaus",
      status: "error",
      message:
        queryStatus === "invalid_url"
          ? "URLhaus rejected the submitted URL as invalid."
          : "URLhaus returned an unrecognized response.",
      matches: [],
      checkedUrls: [url],
    };
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    return {
      service: "URLhaus",
      status: "unavailable",
      message:
        name === "TimeoutError" || name === "AbortError"
          ? "URLhaus timed out. No threat conclusion is available from this service."
          : "URLhaus could not be reached. No threat conclusion is available from this service.",
      matches: [],
      checkedUrls: [url],
    };
  }
}

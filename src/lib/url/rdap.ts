import { isIpLiteral } from "./ip.ts";
import { requestOnce, SafeRequestError } from "./safe-request.ts";
import {
  normalizeRedirectTarget,
  normalizeUrlInput,
  resolvePublicAddresses,
  type LookupFn,
} from "./validation.ts";
import type { RdapDomainInfo } from "./types.ts";

const RDAP_MAX_REDIRECTS = 3;
const RDAP_DEADLINE_MS = 8000;
const RDAP_MAX_BYTES = 750_000;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function extractRegistrar(data: Record<string, unknown>): string | undefined {
  const entities = Array.isArray(data.entities) ? data.entities.filter(isRecord) : [];
  for (const entity of entities) {
    const roles = stringArray(entity.roles).map((role) => role.toLowerCase());
    if (!roles.includes("registrar")) continue;

    const vcard = Array.isArray(entity.vcardArray) && Array.isArray(entity.vcardArray[1])
      ? entity.vcardArray[1]
      : [];
    for (const entry of vcard) {
      if (!Array.isArray(entry) || entry[0] !== "fn") continue;
      if (typeof entry[3] === "string") return entry[3];
      if (Array.isArray(entry[3]) && typeof entry[3][0] === "string") {
        return entry[3][0];
      }
    }
    if (typeof entity.handle === "string") return entity.handle;
  }
  return undefined;
}

export interface RdapOptions {
  lookup?: LookupFn;
  now?: Date;
  endpoint?: string;
  request?: typeof requestOnce;
}

async function fetchRdapText(
  endpoint: string,
  lookup?: LookupFn,
  request: typeof requestOnce = requestOnce
): Promise<{
  status: number;
  body?: string;
}> {
  let current = normalizeUrlInput(endpoint);
  const deadline = Date.now() + RDAP_DEADLINE_MS;

  for (let redirects = 0; redirects <= RDAP_MAX_REDIRECTS; redirects += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      throw new SafeRequestError("REQUEST_TIMEOUT", "RDAP lookup timed out.");
    }
    await resolvePublicAddresses(current.url, lookup);
    const response = await request(current.url, {
      timeoutMs: Math.min(4000, remaining),
      readBody: true,
      maxBytes: RDAP_MAX_BYTES,
      accept: "application/rdap+json, application/json;q=0.9",
      lookup,
    });

    if (REDIRECT_STATUSES.has(response.status) && response.location) {
      if (redirects === RDAP_MAX_REDIRECTS) {
        throw new SafeRequestError("NETWORK_ERROR", "RDAP redirect limit reached.");
      }
      current = normalizeRedirectTarget(response.location, current.url);
      continue;
    }
    return { status: response.status, body: response.body };
  }

  throw new SafeRequestError("NETWORK_ERROR", "RDAP redirect limit reached.");
}

export async function lookupRdapDomain(
  domain: string,
  options: RdapOptions = {}
): Promise<RdapDomainInfo> {
  const cleanDomain = domain.trim().toLowerCase().replace(/\.$/, "");
  if (
    !cleanDomain ||
    cleanDomain.length > 253 ||
    isIpLiteral(cleanDomain) ||
    !/^[a-z0-9.-]+\.[a-z0-9-]{2,}$/i.test(cleanDomain)
  ) {
    return {
      status: "unavailable",
      domain: cleanDomain || undefined,
      registryStatuses: [],
      message: "RDAP domain registration data is not available for this hostname.",
    };
  }

  const endpoint =
    options.endpoint ?? `https://rdap.org/domain/${encodeURIComponent(cleanDomain)}`;

  try {
    const response = await fetchRdapText(endpoint, options.lookup, options.request);
    if (response.status === 404) {
      return {
        status: "not_found",
        domain: cleanDomain,
        registryStatuses: [],
        message: "The RDAP service has no registration record for this domain.",
      };
    }
    if (response.status !== 200 || !response.body) {
      return {
        status: "unavailable",
        domain: cleanDomain,
        registryStatuses: [],
        message: `RDAP registration data was unavailable (HTTP ${response.status}).`,
      };
    }

    let data: unknown;
    try {
      data = JSON.parse(response.body);
    } catch {
      return {
        status: "error",
        domain: cleanDomain,
        registryStatuses: [],
        message: "The RDAP response could not be parsed.",
      };
    }
    if (!isRecord(data)) {
      return {
        status: "error",
        domain: cleanDomain,
        registryStatuses: [],
        message: "The RDAP response had an unexpected shape.",
      };
    }

    const events = Array.isArray(data.events) ? data.events.filter(isRecord) : [];
    const registration = events.find(
      (event) =>
        typeof event.eventAction === "string" &&
        event.eventAction.toLowerCase() === "registration"
    );
    const createdAt =
      registration && typeof registration.eventDate === "string"
        ? registration.eventDate
        : undefined;
    const createdAtMs = createdAt ? Date.parse(createdAt) : Number.NaN;
    const ageDays = Number.isFinite(createdAtMs)
      ? Math.max(0, Math.floor(((options.now ?? new Date()).getTime() - createdAtMs) / 86_400_000))
      : undefined;

    const registrar = extractRegistrar(data);
    const registryStatuses = stringArray(data.status);
    const domainName =
      typeof data.ldhName === "string"
        ? data.ldhName.toLowerCase()
        : typeof data.unicodeName === "string"
          ? data.unicodeName
          : cleanDomain;

    return {
      status: "ok",
      domain: domainName,
      registrar,
      createdAt: Number.isFinite(createdAtMs) ? new Date(createdAtMs).toISOString() : undefined,
      ageDays,
      registryStatuses,
      message: ageDays === undefined
        ? "RDAP returned registration data, but no creation date was available."
        : `RDAP registration data retrieved; domain age is ${ageDays} day(s).`,
    };
  } catch (error) {
    const message =
      error instanceof SafeRequestError && error.code === "REQUEST_TIMEOUT"
        ? "RDAP registration lookup timed out."
        : "RDAP registration data could not be retrieved.";
    return {
      status: "unavailable",
      domain: cleanDomain,
      registryStatuses: [],
      message,
    };
  }
}

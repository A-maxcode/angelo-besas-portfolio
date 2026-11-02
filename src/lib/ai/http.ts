/** HTTP helpers for the A-MAX AI API: bounded input, generic errors, CSRF/CORS. */

export const CSRF_HEADER = "x-amax-request";
export const CSRF_HEADER_VALUE = "1";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly publicMessage: string,
    readonly headers: Record<string, string> = {},
  ) {
    super(code);
    this.name = "HttpError";
  }
}

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
};

export function json(data: unknown, status = 200, extra?: HeadersInit): Response {
  const headers = new Headers(BASE_HEADERS);
  if (extra) new Headers(extra).forEach((value, key) => headers.append(key, value));
  return new Response(JSON.stringify(data), { status, headers });
}

export function errorJson(error: HttpError, extra?: HeadersInit): Response {
  const headers = new Headers(extra);
  for (const [key, value] of Object.entries(error.headers)) headers.set(key, value);
  return json({ error: error.publicMessage, code: error.code }, error.status, headers);
}

/** Reads a JSON body with content-type, size, and syntax checks. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!/^application\/json(\s*;|$)/i.test(contentType)) {
    throw new HttpError(415, "unsupported_media_type", "Requests must be sent as JSON.");
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new HttpError(413, "payload_too_large", "The request is too large.");
  }

  const text = await readBoundedText(request, maxBytes);

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "invalid_json", "The request body is not valid JSON.");
  }
}

async function readBoundedText(request: Request, maxBytes: number): Promise<string> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new HttpError(413, "payload_too_large", "The request is too large.");
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

/** Parses a comma-separated origin allowlist (exact origins only, no wildcards). */
export function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      try {
        const url = new URL(item);
        return url.protocol === "https:" || url.hostname === "localhost" ? [url.origin] : [];
      } catch {
        return [];
      }
    });
}

function requestOrigin(request: Request): string {
  return new URL(request.url).origin;
}

/**
 * Rejects cross-site requests. Writes additionally require a custom header,
 * which HTML forms cannot send and cross-origin scripts cannot send without a
 * CORS preflight that this API only approves for allowlisted origins.
 */
export function assertTrustedRequest(
  request: Request,
  allowedOrigins: string[],
  { write }: { write: boolean },
) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (origin) {
    let normalized: string;
    try {
      normalized = new URL(origin).origin;
    } catch {
      throw new HttpError(403, "forbidden_origin", "This request origin is not allowed.");
    }
    if (normalized !== requestOrigin(request) && !allowedOrigins.includes(normalized)) {
      throw new HttpError(403, "forbidden_origin", "This request origin is not allowed.");
    }
  } else if (fetchSite === "cross-site") {
    throw new HttpError(403, "forbidden_origin", "This request origin is not allowed.");
  }

  if (write && request.headers.get(CSRF_HEADER) !== CSRF_HEADER_VALUE) {
    throw new HttpError(403, "csrf_check_failed", "This request could not be verified.");
  }
}

/** CORS headers for explicitly allowlisted cross-origin callers only. */
export function corsHeaders(request: Request, allowedOrigins: string[]): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  if (origin && origin !== requestOrigin(request) && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }
  return headers;
}

export function preflight(request: Request, allowedOrigins: string[], methods: string): Response {
  const headers = corsHeaders(request, allowedOrigins);
  if (!headers.has("Access-Control-Allow-Origin")) {
    return json({ error: "This request origin is not allowed." }, 403);
  }
  headers.set("Access-Control-Allow-Methods", methods);
  headers.set("Access-Control-Allow-Headers", `content-type, ${CSRF_HEADER}`);
  headers.set("Access-Control-Max-Age", "600");
  return new Response(null, { status: 204, headers });
}

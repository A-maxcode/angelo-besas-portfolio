import { AI_LIMITS } from "./config";
import type { ChatRepository } from "./repository";

/** `__Host-` prefix forces Secure, Path=/ and no Domain on HTTPS. */
export const SECURE_COOKIE_NAME = "__Host-amax_ai_session";
/** Plain-HTTP local development only. */
export const DEV_COOKIE_NAME = "amax_ai_session";

const TOKEN_RE = /^[a-f0-9]{64}$/;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 256-bit random session token (Web Crypto; works on edge and Node). */
export function generateToken(): string {
  return toHex(crypto.getRandomValues(new Uint8Array(32)));
}

/** Only the SHA-256 hash of the token is stored in the database. */
export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(new Uint8Array(digest));
}

function isSecureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export function readSessionToken(request: Request): string | null {
  const name = isSecureRequest(request) ? SECURE_COOKIE_NAME : DEV_COOKIE_NAME;
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) {
      const value = rest.join("=");
      return TOKEN_RE.test(value) ? value : null;
    }
  }
  return null;
}

export function buildSessionCookie(request: Request, token: string): string {
  const secure = isSecureRequest(request);
  return [
    `${secure ? SECURE_COOKIE_NAME : DEV_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Strict",
    "Path=/",
    `Max-Age=${AI_LIMITS.sessionDays * 24 * 60 * 60}`,
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/** Looks up the caller's anonymous session from its HttpOnly cookie. */
export async function getSession(request: Request, repo: ChatRepository): Promise<{ sessionId: string } | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  const row = await repo.findActiveSessionByTokenHash(await hashToken(token));
  return row ? { sessionId: row.id } : null;
}

export async function createSession(request: Request, repo: ChatRepository, now: Date) {
  const token = generateToken();
  const expiresAt = new Date(now.getTime() + AI_LIMITS.sessionDays * 24 * 60 * 60 * 1000);
  const row = await repo.createSession(await hashToken(token), expiresAt);
  return { sessionId: row.id, setCookie: buildSessionCookie(request, token) };
}

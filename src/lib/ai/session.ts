import { createHash, randomBytes } from "node:crypto";
import { sql } from "./db";

const COOKIE_NAME = "amax_ai_session";
const SESSION_DAYS = 30;

type SessionRow = {
  id: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createCookie(token: string, secure: boolean): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;

  return [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${maxAge}`,
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export async function getOrCreateSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const existingToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  const secure = new URL(request.url).protocol === "https:";

  if (existingToken && /^[a-f0-9]{64}$/i.test(existingToken)) {
    const tokenHash = hashToken(existingToken);

    const existing = (await sql`
      SELECT id
      FROM ai_sessions
      WHERE token_hash = ${tokenHash}
        AND expires_at > NOW()
      LIMIT 1
    `) as SessionRow[];

    if (existing.length > 0) {
      return {
        sessionId: existing[0].id,
        setCookie: null,
      };
    }
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const created = (await sql`
    INSERT INTO ai_sessions (token_hash, expires_at)
    VALUES (
      ${tokenHash},
      NOW() + (${SESSION_DAYS} * INTERVAL '1 day')
    )
    RETURNING id
  `) as SessionRow[];

  if (!created.length) {
    throw new Error("Could not create visitor session.");
  }

  return {
    sessionId: created[0].id,
    setCookie: createCookie(token, secure),
  };
}

export async function getSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return null;
  }

  const tokenHash = hashToken(token);

  const rows = (await sql`
    SELECT id
    FROM ai_sessions
    WHERE token_hash = ${tokenHash}
      AND expires_at > NOW()
    LIMIT 1
  `) as SessionRow[];

  return rows.length > 0
    ? { sessionId: rows[0].id }
    : null;
}

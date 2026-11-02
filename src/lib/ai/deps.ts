import { getSql, NeonChatRepository } from "./db";
import { parseAllowedOrigins } from "./http";
import { providerFromEnv } from "./provider";
import { FixedWindowRateLimiter, InFlightGuard } from "./rate-limit";
import { secretValuesFromEnv } from "./redact";
import type { AiDeps } from "./service";

// Per-instance throttles. Constructing empty containers is safe at module scope.
const limiter = new FixedWindowRateLimiter();
const inFlight = new InFlightGuard();

/**
 * Builds server dependencies from env. Call ONLY inside a server route
 * handler: env is read per request and nothing here reaches the browser.
 */
export function getAiDeps(): AiDeps {
  const env = process.env as Record<string, string | undefined>;
  return {
    repo: new NeonChatRepository(getSql(env.DATABASE_URL)),
    provider: providerFromEnv(env),
    limiter,
    inFlight,
    allowedOrigins: parseAllowedOrigins(env.AMAX_ALLOWED_ORIGINS),
    secrets: secretValuesFromEnv(env),
  };
}

export function getAllowedOrigins(): string[] {
  return parseAllowedOrigins(process.env.AMAX_ALLOWED_ORIGINS);
}

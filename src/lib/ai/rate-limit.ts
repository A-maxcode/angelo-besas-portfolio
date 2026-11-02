import type { RateRule } from "./config";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window counter kept in memory. Bounded in size so a flood of unique
 * keys cannot exhaust memory. On serverless platforms each instance keeps its
 * own counters, so this is a best-effort throttle layered on top of the
 * durable, database-counted per-session caps.
 */
export class FixedWindowRateLimiter {
  private buckets = new Map<string, Bucket>();

  constructor(private readonly maxKeys = 10_000) {}

  hit(key: string, rule: RateRule, now = Date.now()): RateLimitResult {
    let bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.evictIfNeeded(now);
      bucket = { count: 0, resetAt: now + rule.windowMs };
      this.buckets.set(key, bucket);
    }

    bucket.count += 1;
    const allowed = bucket.count <= rule.limit;

    return {
      allowed,
      limit: rule.limit,
      remaining: Math.max(0, rule.limit - bucket.count),
      retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  reset() {
    this.buckets.clear();
  }

  private evictIfNeeded(now: number) {
    if (this.buckets.size < this.maxKeys) return;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
    // Still full: drop the oldest entries (Map keeps insertion order).
    while (this.buckets.size >= this.maxKeys) {
      const oldest = this.buckets.keys().next().value;
      if (oldest === undefined) break;
      this.buckets.delete(oldest);
    }
  }
}

/** Allows one in-flight model request per visitor session. */
export class InFlightGuard {
  private active = new Set<string>();

  tryAcquire(key: string): boolean {
    if (this.active.has(key)) return false;
    this.active.add(key);
    return true;
  }

  release(key: string) {
    this.active.delete(key);
  }
}

/** Best-effort client IP from platform headers. Never stored or logged. */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  const direct =
    headers.get("cf-connecting-ip") ??
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-real-ip");
  if (direct) return direct.trim().slice(0, 64);

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 64);

  return "unknown";
}

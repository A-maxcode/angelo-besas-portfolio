/**
 * Central limits for the A-MAX AI assistant. Shared by the API and the UI so
 * client-side hints and server-side enforcement never drift apart. The server
 * is always the source of truth; the client values are only UX hints.
 */
export const AI_LIMITS = {
  /** Maximum accepted request body, in bytes (UTF-8). */
  maxBodyBytes: 24 * 1024,
  /** Maximum characters in a single visitor message. */
  maxMessageChars: 4000,
  /** Maximum characters in a conversation title. */
  maxTitleChars: 100,
  /** Messages of history sent to the model runtime per request. */
  historyMessages: 20,
  /** Maximum characters stored/returned for one assistant reply. */
  maxOutputChars: 12_000,
  /** Token budget requested from the model runtime. */
  maxOutputTokens: 1200,
  /** Upper bound for raw model-runtime response bodies, in bytes. */
  maxProviderResponseBytes: 256 * 1024,
  /** Model runtime request timeout. */
  providerTimeoutMs: 25_000,
  /** Maximum conversations a single visitor session can keep. */
  maxConversationsPerSession: 50,
  /** Maximum messages returned when loading one conversation. */
  maxMessagesPerLoad: 200,
  /** Anonymous visitor session lifetime. */
  sessionDays: 30,
} as const;

export type RateRule = { limit: number; windowMs: number };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** Safe defaults. In-memory rules are per server instance (best effort). */
export const RATE_LIMITS = {
  /** Any A-MAX AI API call, per client IP. */
  ipAny: { limit: 60, windowMs: MINUTE },
  /** Chat messages, per client IP. */
  ipChat: { limit: 10, windowMs: MINUTE },
  /** New anonymous sessions, per client IP. */
  ipNewSession: { limit: 10, windowMs: HOUR },
  /** Chat messages, per visitor session (burst). */
  sessionChat: { limit: 8, windowMs: MINUTE },
  /** New conversations, per visitor session. */
  sessionNewConversation: { limit: 20, windowMs: HOUR },
  /** Durable (database-counted) visitor message caps. */
  sessionChatHourly: { limit: 60, windowMs: HOUR },
  sessionChatDaily: { limit: 200, windowMs: 24 * HOUR },
} satisfies Record<string, RateRule>;

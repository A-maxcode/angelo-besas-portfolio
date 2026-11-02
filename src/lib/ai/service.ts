import { AI_LIMITS, RATE_LIMITS } from "./config";
import {
  HttpError,
  assertTrustedRequest,
  corsHeaders,
  errorJson,
  json,
  preflight,
  readJsonBody,
} from "./http";
import { AMAX_SYSTEM_PROMPT } from "./prompts";
import { ProviderError, type ModelProvider } from "./provider";
import { FixedWindowRateLimiter, InFlightGuard, getClientIp } from "./rate-limit";
import type { ChatRepository } from "./repository";
import { logSafeError } from "./redact";
import { createSession, getSession } from "./session";
import { chatRequestSchema, createConversationSchema, parseOrThrow, requireUuid } from "./validation";

export interface AiDeps {
  repo: ChatRepository;
  provider: ModelProvider;
  limiter: FixedWindowRateLimiter;
  inFlight: InFlightGuard;
  allowedOrigins: string[];
  /** Secret values to scrub from any log line. */
  secrets: string[];
  now?: () => Date;
}

type Handler = (request: Request, deps: AiDeps) => Promise<Response>;

/** Wraps a handler: origin checks, IP throttle, generic errors, CORS. */
function guarded(scope: string, write: boolean, handler: Handler): Handler {
  return async (request, deps) => {
    const cors = corsHeaders(request, deps.allowedOrigins);
    try {
      assertTrustedRequest(request, deps.allowedOrigins, { write });
      enforce(deps, `ip:any:${getClientIp(request)}`, RATE_LIMITS.ipAny);
      const response = await handler(request, deps);
      cors.forEach((value, key) => response.headers.set(key, value));
      return response;
    } catch (error) {
      if (error instanceof HttpError) return errorJson(error, cors);
      logSafeError(scope, error, deps.secrets);
      return errorJson(new HttpError(500, "server_error", "Something went wrong. Please try again."), cors);
    }
  };
}

function enforce(deps: AiDeps, key: string, rule: { limit: number; windowMs: number }) {
  const result = deps.limiter.hit(key, rule, (deps.now?.() ?? new Date()).getTime());
  if (!result.allowed) {
    throw new HttpError(429, "rate_limited", "Too many requests. Please wait a moment and try again.", {
      "Retry-After": String(result.retryAfterSeconds),
    });
  }
}

async function requireSession(request: Request, deps: AiDeps) {
  const session = await getSession(request, deps.repo);
  if (!session) {
    throw new HttpError(401, "session_required", "Your chat session has expired. Refresh the page to start a new one.");
  }
  return session;
}

const now = (deps: AiDeps) => deps.now?.() ?? new Date();

/** GET /api/ai/session — creates an anonymous visitor session if needed. */
export const handleSession = guarded("session", false, async (request, deps) => {
  const existing = await getSession(request, deps.repo);
  if (existing) return json({ ok: true, provider: { configured: deps.provider.configured } });

  enforce(deps, `ip:new-session:${getClientIp(request)}`, RATE_LIMITS.ipNewSession);
  const created = await createSession(request, deps.repo, now(deps));
  // The session ID and token are never returned in the body.
  return json({ ok: true, provider: { configured: deps.provider.configured } }, 200, {
    "Set-Cookie": created.setCookie,
  });
});

/** GET /api/ai/conversations */
export const handleListConversations = guarded("list_conversations", false, async (request, deps) => {
  const session = await requireSession(request, deps);
  const conversations = await deps.repo.listConversations(session.sessionId, AI_LIMITS.maxConversationsPerSession);
  return json({ conversations });
});

/** POST /api/ai/conversations */
export const handleCreateConversation = guarded("create_conversation", true, async (request, deps) => {
  const session = await requireSession(request, deps);
  const body = parseOrThrow(createConversationSchema, await readJsonBody(request, AI_LIMITS.maxBodyBytes));
  enforce(deps, `session:new-conversation:${session.sessionId}`, RATE_LIMITS.sessionNewConversation);

  if ((await deps.repo.countConversations(session.sessionId)) >= AI_LIMITS.maxConversationsPerSession) {
    throw new HttpError(409, "conversation_limit", "You've reached the conversation limit. Delete an old chat to start a new one.");
  }

  const conversation = await deps.repo.createConversation(session.sessionId, body.title || "New chat");
  return json({ conversation }, 201);
});

/** GET /api/ai/conversations/:id */
export function handleGetConversation(conversationId: string) {
  return guarded("get_conversation", false, async (request, deps) => {
    const id = requireUuid(conversationId, "conversation ID");
    const session = await requireSession(request, deps);
    const conversation = await deps.repo.getConversation(session.sessionId, id);
    // 404 (not 403) so other visitors' IDs are indistinguishable from missing ones.
    if (!conversation) throw new HttpError(404, "not_found", "Conversation not found.");
    const messages = await deps.repo.listMessages(session.sessionId, id, AI_LIMITS.maxMessagesPerLoad);
    return json({ conversation, messages });
  });
}

/** DELETE /api/ai/conversations/:id */
export function handleDeleteConversation(conversationId: string) {
  return guarded("delete_conversation", true, async (request, deps) => {
    const id = requireUuid(conversationId, "conversation ID");
    const session = await requireSession(request, deps);
    if (!(await deps.repo.deleteConversation(session.sessionId, id))) {
      throw new HttpError(404, "not_found", "Conversation not found.");
    }
    return json({ success: true });
  });
}

/** POST /api/ai/chat */
export const handleChat = guarded("chat", true, async (request, deps) => {
  const session = await requireSession(request, deps);
  const ip = getClientIp(request);
  const body = parseOrThrow(chatRequestSchema, await readJsonBody(request, AI_LIMITS.maxBodyBytes));
  const conversationId = body.conversationId.toLowerCase();

  enforce(deps, `ip:chat:${ip}`, RATE_LIMITS.ipChat);
  enforce(deps, `session:chat:${session.sessionId}`, RATE_LIMITS.sessionChat);

  const conversation = await deps.repo.getConversation(session.sessionId, conversationId);
  if (!conversation) throw new HttpError(404, "not_found", "Conversation not found.");

  // Durable caps counted from stored messages, so they survive restarts.
  const at = now(deps).getTime();
  for (const rule of [RATE_LIMITS.sessionChatHourly, RATE_LIMITS.sessionChatDaily]) {
    const used = await deps.repo.countUserMessagesSince(session.sessionId, new Date(at - rule.windowMs));
    if (used >= rule.limit) {
      throw new HttpError(429, "rate_limited", "You've reached the message limit for now. Please come back later.", {
        "Retry-After": String(Math.ceil(rule.windowMs / 1000 / 4)),
      });
    }
  }

  if (!deps.provider.configured) {
    throw new HttpError(503, "model_not_configured", "A-MAX AI's model runtime isn't connected yet, so it can't reply right now.");
  }

  if (!deps.inFlight.tryAcquire(session.sessionId)) {
    throw new HttpError(429, "busy", "Please wait for the current reply to finish.");
  }

  try {
    const history = (
      await deps.repo.listMessages(session.sessionId, conversationId, AI_LIMITS.historyMessages - 1, true)
    ).reverse();

    let result;
    try {
      result = await deps.provider.generate({
        system: AMAX_SYSTEM_PROMPT,
        messages: [
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: body.message },
        ],
        maxOutputTokens: AI_LIMITS.maxOutputTokens,
      });
    } catch (error) {
      logSafeError("model_runtime", error, deps.secrets);
      if (error instanceof ProviderError) {
        if (error.kind === "not_configured") {
          throw new HttpError(503, "model_not_configured", "A-MAX AI's model runtime isn't connected yet, so it can't reply right now.");
        }
        if (error.kind === "timeout") throw new HttpError(504, "model_timeout", "The assistant took too long to reply. Please try again.");
        if (error.kind === "rate_limited") throw new HttpError(429, "model_busy", "The assistant is busy right now. Please try again shortly.");
      }
      throw new HttpError(502, "model_error", "The assistant couldn't complete your request.");
    }

    const content = result.content.trim().slice(0, AI_LIMITS.maxOutputChars);

    // Saved only after a successful reply, so failures leave no orphan messages.
    await deps.repo.addMessage(session.sessionId, conversationId, "user", body.message);
    await deps.repo.addMessage(session.sessionId, conversationId, "assistant", content);
    await deps.repo.touchConversation(session.sessionId, conversationId, body.message);

    return json({ content });
  } finally {
    deps.inFlight.release(session.sessionId);
  }
});

/** OPTIONS for any A-MAX AI endpoint. */
export function handlePreflight(methods: string) {
  return async (request: Request, deps: Pick<AiDeps, "allowedOrigins">) =>
    preflight(request, deps.allowedOrigins, methods);
}

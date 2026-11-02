import { z } from "zod";
import { AI_LIMITS } from "./config";
import { HttpError } from "./http";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function requireUuid(value: unknown, label = "ID"): string {
  if (!isUuid(value)) {
    throw new HttpError(400, "invalid_id", `The ${label} is not valid.`);
  }
  return value.toLowerCase();
}

// Strip control characters except tab/newline/carriage return.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, "").normalize("NFC").trim();
}

const messageText = z
  .string()
  .transform(cleanText)
  .refine((v) => v.length > 0, "Message cannot be empty.")
  .refine((v) => v.length <= AI_LIMITS.maxMessageChars, `Messages are limited to ${AI_LIMITS.maxMessageChars} characters.`);

/**
 * `.strict()` rejects unknown keys, so a client cannot smuggle a `role`,
 * `system`, `sessionId`, or other privileged field into the request.
 */
export const chatRequestSchema = z
  .object({
    conversationId: z.string().refine(isUuid, "Invalid conversation ID."),
    message: messageText,
  })
  .strict();

export const createConversationSchema = z
  .object({
    title: z
      .string()
      .max(AI_LIMITS.maxTitleChars * 4)
      .transform((v) => cleanText(v).slice(0, AI_LIMITS.maxTitleChars))
      .optional(),
  })
  .strict();

export function parseOrThrow<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const first = result.error.issues[0];
    const message =
      first && first.code === "custom" && first.message ? first.message : "The request is not valid.";
    throw new HttpError(400, "invalid_request", message);
  }
  return result.data;
}

export const ALLOWED_ROLES = ["user", "assistant"] as const;
export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export function isAllowedRole(value: unknown): value is AllowedRole {
  return value === "user" || value === "assistant";
}

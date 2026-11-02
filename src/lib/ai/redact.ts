/**
 * Redaction helpers. Server logs must never contain prompts, credentials,
 * tokens, cookies, or personal data — only coarse error metadata.
 */

const SECRET_PATTERNS: RegExp[] = [
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s"'<>]+/gi,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{8,}/gi,
  /\b(?:sk|pk|rk|sb|xox[abprs]|ghp|gho|ghs|github_pat|re)_[A-Za-z0-9_-]{8,}/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
  /\b(?:api[_-]?key|token|secret|password|passwd|authorization|cookie)\s*[:=]\s*["']?[^\s"',;]+/gi,
  /\b[a-f0-9]{48,}\b/gi,
];

/** Removes known secret values and common credential shapes from text. */
export function redactSecrets(text: string, knownSecrets: Array<string | undefined> = []): string {
  let output = text;

  for (const secret of knownSecrets) {
    if (secret && secret.length >= 6) {
      output = output.split(secret).join("[REDACTED]");
    }
  }

  for (const pattern of SECRET_PATTERNS) {
    output = output.replace(pattern, "[REDACTED]");
  }

  return output;
}

/** Collects secret-looking env values so they can be scrubbed from logs. */
export function secretValuesFromEnv(env: Record<string, string | undefined>): string[] {
  return Object.entries(env)
    .filter(([name]) => /KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL|_URL$/i.test(name))
    .map(([, value]) => value)
    .filter((value): value is string => typeof value === "string" && value.length >= 6);
}

/**
 * Logs an error without its payload. Only the error class, an optional
 * status/code, and a short redacted message are written.
 */
export function logSafeError(scope: string, error: unknown, knownSecrets: string[] = []) {
  const name = error instanceof Error ? error.name : typeof error;
  const raw = error instanceof Error ? error.message : "";
  const status =
    error && typeof error === "object" && "status" in error
      ? String((error as { status: unknown }).status)
      : undefined;
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code).slice(0, 32)
      : undefined;

  console.error(`[amax-ai] ${scope} failed`, {
    name,
    ...(status ? { status } : {}),
    ...(code ? { code } : {}),
    detail: redactSecrets(raw, knownSecrets).slice(0, 160),
  });
}

import { AI_LIMITS } from "./config";

/**
 * Model runtime boundary. A-MAX AI is an assistant/application layer; the
 * actual language model is whatever runtime is plugged in here. Secrets for
 * that runtime stay inside the provider on the server and are never returned.
 */
export type ProviderMessage = { role: "user" | "assistant"; content: string };

export interface ModelRequest {
  system: string;
  messages: ProviderMessage[];
  maxOutputTokens: number;
  signal?: AbortSignal;
}

export interface ModelResult {
  content: string;
  finishReason?: string;
}

export interface ModelProvider {
  readonly id: string;
  readonly configured: boolean;
  generate(request: ModelRequest): Promise<ModelResult>;
}

/** Thrown with a status only — never the upstream body or credentials. */
export class ProviderError extends Error {
  constructor(
    readonly kind: "not_configured" | "timeout" | "rate_limited" | "upstream" | "bad_response",
    readonly status?: number,
  ) {
    super(`provider_${kind}`);
    this.name = "ProviderError";
  }
}

/** Default when no runtime is configured. Never pretends to answer. */
export class UnconfiguredProvider implements ModelProvider {
  readonly id = "none";
  readonly configured = false;
  async generate(): Promise<ModelResult> {
    throw new ProviderError("not_configured");
  }
}

export interface HttpChatProviderOptions {
  endpoint: string;
  model: string;
  apiKey?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * Generic HTTP adapter for self-hosted or third-party runtimes that accept the
 * widely used `chat/completions` JSON shape (e.g. llama.cpp server, vLLM,
 * Ollama's compatible endpoint). No vendor SDK is bundled.
 */
export class HttpChatProvider implements ModelProvider {
  readonly id = "http";
  readonly configured = true;
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: HttpChatProviderOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async generate(request: ModelRequest): Promise<ModelResult> {
    const timeout = AbortSignal.timeout(this.options.timeoutMs ?? AI_LIMITS.providerTimeoutMs);
    const signal = request.signal ? AbortSignal.any([request.signal, timeout]) : timeout;

    let response: Response;
    try {
      response = await this.fetchImpl(this.options.endpoint, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          ...(this.options.apiKey ? { Authorization: `Bearer ${this.options.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: this.options.model,
          messages: [{ role: "system", content: request.system }, ...request.messages],
          max_tokens: request.maxOutputTokens,
          temperature: 0.3,
          stream: false,
        }),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new ProviderError("timeout");
      }
      throw new ProviderError("upstream");
    }

    if (!response.ok) {
      // Drain without reading into logs or responses.
      await response.body?.cancel().catch(() => undefined);
      throw new ProviderError(response.status === 429 ? "rate_limited" : "upstream", response.status);
    }

    const text = await response.text();
    if (text.length > AI_LIMITS.maxProviderResponseBytes) throw new ProviderError("bad_response");

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ProviderError("bad_response");
    }

    const choice = (parsed as { choices?: Array<{ message?: { content?: unknown }; finish_reason?: unknown }> })
      ?.choices?.[0];
    const content = typeof choice?.message?.content === "string" ? choice.message.content : "";
    if (!content.trim()) throw new ProviderError("bad_response");

    return {
      content,
      finishReason: typeof choice?.finish_reason === "string" ? choice.finish_reason : undefined,
    };
  }
}

function isAllowedEndpoint(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.username || url.password) return false;
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Builds the provider from server env. Call inside a request handler only.
 *   AMAX_MODEL_PROVIDER = "none" (default) | "http"
 *   AMAX_MODEL_ENDPOINT = https URL (or http://localhost for local runtimes)
 *   AMAX_MODEL_NAME     = model identifier understood by that runtime
 *   AMAX_MODEL_API_KEY  = optional bearer credential for that runtime
 */
export function providerFromEnv(env: Record<string, string | undefined>): ModelProvider {
  if (env.AMAX_MODEL_PROVIDER !== "http") return new UnconfiguredProvider();
  const endpoint = env.AMAX_MODEL_ENDPOINT ?? "";
  const model = env.AMAX_MODEL_NAME ?? "";
  if (!isAllowedEndpoint(endpoint) || !model) return new UnconfiguredProvider();
  return new HttpChatProvider({ endpoint, model, apiKey: env.AMAX_MODEL_API_KEY || undefined });
}

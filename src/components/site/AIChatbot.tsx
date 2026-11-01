"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, KeyRound, Loader2, MessageCircle, Send, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type Provider = "openai" | "xai";

const STORAGE_KEY = "portfolio-ai-chat-config";
const HISTORY_KEY = "portfolio-ai-chat-history";

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded in Angelo Besas' personal portfolio website.

About Angelo:
- Name: Angelo Besas
- Headline: Young IT
- Studying: Bachelor of Science in Information Technology at Holy Name University (Tagbilaran City, Bohol, Philippines)
- Main interest: Web Development
- Focus: building clean, accessible, and responsive web experiences

Your role:
- Answer questions about Angelo, his skills, projects, education, and portfolio in a friendly, professional tone.
- Help visitors understand his work and background.
- If asked something outside the portfolio context, still be helpful but gently steer back when appropriate.
- Keep responses concise and useful (2-4 short paragraphs max unless the user asks for detail).
- Never invent specific project details, certificates, or achievements that are not provided. If unsure, say so and suggest contacting Angelo via the Contact page.
`;

interface ChatConfig {
  apiKey: string;
  provider: Provider;
  model: string;
}

const DEFAULT_MODELS: Record<Provider, string> = {
  openai: "gpt-4o-mini",
  xai: "grok-2-latest",
};

function loadConfig(): ChatConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatConfig;
  } catch {}
  return { apiKey: "", provider: "xai", model: DEFAULT_MODELS.xai };
}

function saveConfig(config: ChatConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as Message[];
  } catch {}
  return [];
}

function saveHistory(messages: Message[]) {
  const trimmed = messages.slice(-40);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState<ChatConfig>({ apiKey: "", provider: "xai", model: DEFAULT_MODELS.xai });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setConfig(loadConfig());
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open && !showSettings) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, showSettings]);

  const handleSaveSettings = () => {
    if (!config.apiKey.trim()) {
      setError("API key is required.");
      return;
    }
    saveConfig(config);
    setShowSettings(false);
    setError(null);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!config.apiKey) {
      setShowSettings(true);
      setError("Please add your API key first.");
      return;
    }

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const endpoint =
        config.provider === "xai"
          ? "https://api.x.ai/v1/chat/completions"
          : "https://api.openai.com/v1/chat/completions";

      const payload = {
        model: config.model || DEFAULT_MODELS[config.provider],
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...nextMessages.map((m) => ({ role: m.role, content: m.content })),
        ],
        temperature: 0.7,
        max_tokens: 800,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg =
          errBody?.error?.message ||
          errBody?.message ||
          `API error ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      const assistantContent =
        data.choices?.[0]?.message?.content?.trim() ||
        "Sorry, I couldn't generate a response.";

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
      };

      const finalMessages = [...nextMessages, assistantMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl",
          open && "scale-0 opacity-0 pointer-events-none"
        )}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <div
        className={cn(
          "fixed bottom-6 right-6 z-50 flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl transition-all duration-300",
          open
            ? "h-[min(85vh,560px)] opacity-100 scale-100"
            : "h-0 opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold leading-none">AI Assistant</p>
              <p className="text-xs opacity-80">Ask about Angelo or his work</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setShowSettings((v) => !v)}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setOpen(false)}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showSettings ? (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Provider</label>
              <Select
                value={config.provider}
                onValueChange={(v: Provider) =>
                  setConfig((c) => ({
                    ...c,
                    provider: v,
                    model: DEFAULT_MODELS[v],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="xai">xAI (Grok)</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Model</label>
              <Input
                value={config.model}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, model: e.target.value }))
                }
                placeholder={DEFAULT_MODELS[config.provider]}
              />
              <p className="text-xs text-muted-foreground">
                {config.provider === "xai"
                  ? "Examples: grok-2-latest, grok-3"
                  : "Examples: gpt-4o-mini, gpt-4o"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5" />
                API Key
              </label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, apiKey: e.target.value }))
                }
                placeholder={config.provider === "xai" ? "xai-..." : "sk-..."}
              />
              <p className="text-xs text-muted-foreground">
                Stored only in your browser (localStorage). Never sent to this site's server.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="mt-auto flex gap-2">
              <Button onClick={handleSaveSettings} className="flex-1">
                Save
              </Button>
              <Button variant="outline" onClick={clearChat} className="flex-1">
                Clear chat
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Get a key:{" "}
              {config.provider === "xai" ? (
                <a href="https://console.x.ai/" target="_blank" rel="noreferrer" className="underline">
                  console.x.ai
                </a>
              ) : (
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="underline">
                  platform.openai.com
                </a>
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
                  <Bot className="h-10 w-10 opacity-40" />
                  <p className="text-sm">
                    Hi! I'm Angelo's AI assistant.
                    <br />
                    Ask me anything about his work or background.
                  </p>
                  {!config.apiKey && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowSettings(true)}
                    >
                      <KeyRound className="mr-2 h-3.5 w-3.5" />
                      Add API key to start
                    </Button>
                  )}
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}

              {error && !showSettings && (
                <p className="text-center text-xs text-destructive">{error}</p>
              )}

              <div ref={bottomRef} />
            </div>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about Angelo…"
                  rows={1}
                  className="min-h-[44px] max-h-28 resize-none"
                  disabled={loading}
                />
                <Button
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
                Powered by {config.provider === "xai" ? "xAI Grok" : "OpenAI"} · Key stays in your browser
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

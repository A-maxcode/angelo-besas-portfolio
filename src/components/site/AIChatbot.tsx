
"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const HISTORY_KEY = "portfolio-ai-chat-history";

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is Message =>
        item !== null &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string",
    ).slice(-40);
  } catch {
    return [];
  }
}

function saveHistory(messages: Message[]) {
  try {
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify(messages.slice(-40)),
    );
  } catch {
    // Chat continues to work even if browser storage is unavailable.
  }
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      const focusTimer = window.setTimeout(
        () => inputRef.current?.focus(),
        100,
      );

      return () => window.clearTimeout(focusTimer);
    }
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const text = input.trim();

    if (!text || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
    };

    // Keep the request within the server's message limit.
    const nextMessages = [
      ...messages.slice(-39),
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.error || `Request failed (${res.status})`,
        );
      }

      if (
        typeof data?.content !== "string" ||
        !data.content.trim()
      ) {
        throw new Error("The AI returned an empty response.");
      }

      const finalMessages: Message[] = [
        ...nextMessages,
        {
          role: "assistant",
          content: data.content.trim(),
        },
      ];

      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          "bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl",
          open && "scale-0 opacity-0 pointer-events-none",
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
            : "h-0 opacity-0 scale-95 pointer-events-none",
        )}
      >
        <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />

            <div>
              <p className="text-sm font-semibold leading-none">
                AI Assistant
              </p>

              <p className="text-xs opacity-80">
                Ask about Angelo or his work
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setOpen(false)}
            aria-label="Close AI assistant"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Bot className="h-10 w-10 opacity-40" />

              <p className="text-sm">
                Hi! I'm Angelo's AI assistant.
                <br />
                Ask me anything about his work or background.
              </p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                m.role === "user"
                  ? "justify-end"
                  : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md",
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

          {error && (
            <p
              role="alert"
              className="text-center text-xs text-destructive"
            >
              {error}
            </p>
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
              onClick={() => void sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

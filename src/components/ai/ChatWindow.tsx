import { useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import type { AIMessage } from "../../types/ai";

const STORAGE_KEY = "amax-ai-chat-history";

const welcomeMessage: AIMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm A-Max AI. I can help you with programming, research, writing, technical questions, and more. What would you like to work on?",
  createdAt: Date.now(),
};

export function ChatWindow() {
  const [messages, setMessages] = useState<AIMessage[]>([
    welcomeMessage,
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  // Restore browser conversation history.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          const validMessages = parsed.filter(
            (message): message is AIMessage =>
              message &&
              typeof message.id === "string" &&
              ["user", "assistant"].includes(message.role) &&
              typeof message.content === "string" &&
              typeof message.createdAt === "number",
          );

          setMessages(validMessages.slice(-40));
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save conversation history.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages.slice(-40)),
      );
    } catch (error) {
      console.error("Could not save chat history:", error);
    }
  }, [messages]);

  // Scroll to latest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(content: string) {
    if (loading) return;

    setError("");

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: Date.now(),
    };

    const updatedMessages = [...messages, userMessage].slice(-40);

    setMessages(updatedMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((message) => message.id !== "welcome")
            .map(({ role, content }) => ({ role, content })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to contact A-Max AI.");
      }

      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.content,
        createdAt: Date.now(),
      };

      setMessages((previous) =>
        [...previous, assistantMessage].slice(-40),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    if (loading) return;

    setMessages([welcomeMessage]);
    setError("");
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-xl font-black">
            A
          </div>

          <div>
            <h1 className="text-lg font-bold">A-Max AI</h1>
            <p className="text-xs text-zinc-400">
              Your all-in-one AI assistant
            </p>
          </div>
        </div>

        <button
          onClick={clearConversation}
          disabled={loading}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-40"
        >
          New chat
        </button>
      </header>

      {/* Chat area */}
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <div className="flex-1 space-y-6">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">
                A
              </div>
              A-Max AI is thinking...
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 mt-8 bg-black pb-4 pt-3">
          <ChatInput
            onSend={sendMessage}
            disabled={loading}
          />

          <p className="mt-3 text-center text-xs text-zinc-500">
            A-Max AI can make mistakes. Verify important information.
          </p>
        </div>
      </section>
    </main>
  );
          }

import { useCallback, useEffect, useRef, useState } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import type { AIMessage, AIConversation } from "../../types/ai";

const welcomeMessage: AIMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hello! I'm A-Max AI. I can help you with programming, research, writing, technical questions, and more. What would you like to work on?",
  createdAt: Date.now(),
};

async function apiRequest<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "X-AMAX-Request": "1",
      ...options?.headers,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.error || "The request could not be completed.",
    );
  }

  return result as T;
}

function mapMessage(message: {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}): AIMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: new Date(message.created_at).getTime(),
  };
}

export function ChatWindow() {
  const [messages, setMessages] = useState<AIMessage[]>([
    welcomeMessage,
  ]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const result = await apiRequest<{
      conversations: AIConversation[];
    }>("/api/ai/conversations");

    setConversations(result.conversations);
    return result.conversations;
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    const result = await apiRequest<{
      conversation: AIConversation;
      messages: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
        created_at: string;
      }>;
    }>(`/api/ai/conversations/${encodeURIComponent(id)}`);

    setActiveConversationId(id);
    setMessages(
      result.messages.length
        ? result.messages.map(mapMessage)
        : [welcomeMessage],
    );
    setError("");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setInitializing(true);

        // Initialize the anonymous HTTP-only session cookie.
        await apiRequest<{ ok: boolean }>("/api/ai/session");

        // Load conversations belonging to this session.
        const result = await apiRequest<{
          conversations: AIConversation[];
        }>("/api/ai/conversations");

        if (cancelled) return;

        setConversations(result.conversations);

        if (result.conversations.length > 0) {
          await loadConversation(result.conversations[0].id);
        } else {
          setMessages([welcomeMessage]);
          setActiveConversationId(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to initialize A-Max AI.",
          );
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function createConversation() {
    if (loading) return;

    try {
      setError("");

      const result = await apiRequest<{
        conversation: AIConversation;
      }>("/api/ai/conversations", {
        method: "POST",
        body: JSON.stringify({ title: "New chat" }),
      });

      setConversations((previous) => [
        result.conversation,
        ...previous,
      ]);

      setActiveConversationId(result.conversation.id);
      setMessages([welcomeMessage]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create a new conversation.",
      );
    }
  }

  async function sendMessage(content: string) {
    if (loading || !content.trim()) return;

    setError("");
    setLoading(true);

    try {
      let conversationId = activeConversationId;

      // Create a conversation if this is the first message.
      if (!conversationId) {
        const created = await apiRequest<{
          conversation: AIConversation;
        }>("/api/ai/conversations", {
          method: "POST",
          body: JSON.stringify({ title: content.slice(0, 60) }),
        });

        conversationId = created.conversation.id;
        setActiveConversationId(conversationId);
        setConversations((previous) => [
          created.conversation,
          ...previous,
        ]);
      }

      const userMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: Date.now(),
      };

      setMessages((previous) => [...previous, userMessage]);

      const result = await apiRequest<{ content: string }>(
        "/api/ai/chat",
        {
          method: "POST",
          body: JSON.stringify({
            conversationId,
            message: content,
          }),
        },
      );

      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.content,
        createdAt: Date.now(),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      await loadConversations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteConversation(id: string) {
    if (loading) return;

    try {
      await apiRequest<{ success: boolean }>(
        `/api/ai/conversations/${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );

      const remaining = conversations.filter(
        (conversation) => conversation.id !== id,
      );

      setConversations(remaining);

      if (activeConversationId === id) {
        if (remaining.length > 0) {
          await loadConversation(remaining[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([welcomeMessage]);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete conversation.",
      );
    }
  }

  async function selectConversation(id: string) {
    if (loading || id === activeConversationId) return;

    try {
      setError("");
      await loadConversation(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation.",
      );
    }
  }

  return (
    <main className="flex min-h-screen bg-black text-white">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-white/10 bg-zinc-950 p-4 md:flex">
        <h2 className="mb-5 text-lg font-bold">A-Max AI</h2>

        <button
          onClick={createConversation}
          disabled={loading || initializing}
          className="mb-5 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold hover:bg-violet-500 disabled:opacity-40"
        >
          + New chat
        </button>

        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Your conversations
        </p>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`flex items-center gap-2 rounded-lg ${
                activeConversationId === conversation.id
                  ? "bg-white/10"
                  : "hover:bg-white/5"
              }`}
            >
              <button
                onClick={() => selectConversation(conversation.id)}
                disabled={loading}
                className="min-w-0 flex-1 truncate px-3 py-3 text-left text-sm text-zinc-300"
              >
                {conversation.title}
              </button>

              <button
                onClick={() => deleteConversation(conversation.id)}
                disabled={loading}
                aria-label="Delete conversation"
                className="px-3 py-2 text-xs text-zinc-500 hover:text-red-400"
              >
                ×
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="text-xs text-zinc-600">
              No conversations yet.
            </p>
          )}
        </div>
      </aside>

      <section className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-10">
          <div>
            <h1 className="text-lg font-bold">A-Max AI</h1>
            <p className="text-xs text-zinc-400">
              Your all-in-one AI assistant
            </p>
          </div>

          <button
            onClick={createConversation}
            disabled={loading || initializing}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 disabled:opacity-40 md:hidden"
          >
            New chat
          </button>
        </header>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
          <div className="flex-1 space-y-6">
            {initializing ? (
              <p className="text-sm text-zinc-400">
                Loading your conversations...
              </p>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {loading && (
              <p className="text-sm text-zinc-400">
                A-Max AI is thinking...
              </p>
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

          <div className="sticky bottom-0 mt-8 bg-black pb-4 pt-3">
            <ChatInput
              onSend={sendMessage}
              disabled={loading || initializing}
            />

            <p className="mt-3 text-center text-xs text-zinc-500">
              A-Max AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

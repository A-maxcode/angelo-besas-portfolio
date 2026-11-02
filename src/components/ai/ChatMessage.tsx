import type { AIMessage } from "../../types/ai";

interface ChatMessageProps {
  message: AIMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">
          A
        </div>
      )}

      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 ${
          isUser
            ? "rounded-br-sm bg-violet-600 text-white"
            : "rounded-bl-sm border border-white/10 bg-zinc-900 text-zinc-100"
        }`}
      >
        {message.content}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-700 font-bold text-white">
          You
        </div>
      )}
    </div>
  );
}

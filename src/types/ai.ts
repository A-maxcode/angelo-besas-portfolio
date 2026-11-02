export type MessageRole = "user" | "assistant";

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface ChatRequest {
  messages: Array<{
    role: MessageRole;
    content: string;
  }>;
}

export interface ChatResponse {
  content: string;
}

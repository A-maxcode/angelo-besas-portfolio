export type MessageRole = "user" | "assistant";

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatRequest {
  conversationId: string;
  message: string;
}

export interface ChatResponse {
  content: string;
}

export interface ConversationsResponse {
  conversations: AIConversation[];
}

export interface ConversationResponse {
  conversation: AIConversation;
  messages: Array<{
    id: string;
    role: MessageRole;
    content: string;
    created_at: string;
  }>;
}

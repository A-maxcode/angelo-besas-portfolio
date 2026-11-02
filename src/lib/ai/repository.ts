import type { AllowedRole } from "./validation";

export type ConversationRecord = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

export type MessageRecord = {
  id: string;
  role: AllowedRole;
  content: string;
  created_at: string;
};

/**
 * Every read and write takes the caller's `sessionId` and is scoped to it in
 * the query itself, so one visitor can never read or change another visitor's
 * conversations even if they guess a valid conversation ID.
 */
export interface ChatRepository {
  findActiveSessionByTokenHash(tokenHash: string): Promise<{ id: string } | null>;
  createSession(tokenHash: string, expiresAt: Date): Promise<{ id: string }>;

  listConversations(sessionId: string, limit: number): Promise<ConversationRecord[]>;
  countConversations(sessionId: string): Promise<number>;
  createConversation(sessionId: string, title: string): Promise<ConversationRecord>;
  getConversation(sessionId: string, conversationId: string): Promise<ConversationRecord | null>;
  deleteConversation(sessionId: string, conversationId: string): Promise<boolean>;

  listMessages(sessionId: string, conversationId: string, limit: number, newestFirst?: boolean): Promise<MessageRecord[]>;
  addMessage(sessionId: string, conversationId: string, role: AllowedRole, content: string): Promise<void>;
  /** Sets the title from the first message (if still "New chat") and bumps updated_at. */
  touchConversation(sessionId: string, conversationId: string, firstMessage?: string): Promise<void>;
  countUserMessagesSince(sessionId: string, since: Date): Promise<number>;
}

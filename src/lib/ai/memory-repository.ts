import type { ChatRepository, ConversationRecord, MessageRecord } from "./repository";
import type { AllowedRole } from "./validation";

type StoredConversation = ConversationRecord & { session_id: string };
type StoredMessage = MessageRecord & { conversation_id: string };

/**
 * In-memory repository with the same ownership rules as the Neon version.
 * Used by tests; never used in production.
 */
export class InMemoryChatRepository implements ChatRepository {
  sessions = new Map<string, { id: string; tokenHash: string; expiresAt: Date }>();
  conversations: StoredConversation[] = [];
  messages: StoredMessage[] = [];
  private tick = 0;

  constructor(private readonly now: () => Date = () => new Date()) {}

  private stamp() {
    // Monotonic timestamps so ordering is deterministic in tests.
    this.tick += 1;
    return new Date(this.now().getTime() + this.tick).toISOString();
  }

  async findActiveSessionByTokenHash(tokenHash: string) {
    for (const session of this.sessions.values()) {
      if (session.tokenHash === tokenHash && session.expiresAt > this.now()) return { id: session.id };
    }
    return null;
  }

  async createSession(tokenHash: string, expiresAt: Date) {
    const id = crypto.randomUUID();
    this.sessions.set(id, { id, tokenHash, expiresAt });
    return { id };
  }

  async listConversations(sessionId: string, limit: number) {
    return this.conversations
      .filter((c) => c.session_id === sessionId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, limit)
      .map(strip);
  }

  async countConversations(sessionId: string) {
    return this.conversations.filter((c) => c.session_id === sessionId).length;
  }

  async createConversation(sessionId: string, title: string) {
    const at = this.stamp();
    const row: StoredConversation = { id: crypto.randomUUID(), session_id: sessionId, title, created_at: at, updated_at: at };
    this.conversations.push(row);
    return strip(row);
  }

  async getConversation(sessionId: string, conversationId: string) {
    const row = this.conversations.find((c) => c.id === conversationId && c.session_id === sessionId);
    return row ? strip(row) : null;
  }

  async deleteConversation(sessionId: string, conversationId: string) {
    const before = this.conversations.length;
    this.conversations = this.conversations.filter((c) => !(c.id === conversationId && c.session_id === sessionId));
    const deleted = this.conversations.length < before;
    if (deleted) this.messages = this.messages.filter((m) => m.conversation_id !== conversationId);
    return deleted;
  }

  async listMessages(sessionId: string, conversationId: string, limit: number, newestFirst = false) {
    if (!(await this.getConversation(sessionId, conversationId))) return [];
    const rows = this.messages
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
    const ordered = newestFirst ? rows.reverse() : rows;
    return ordered.slice(0, limit).map(({ conversation_id: _c, ...rest }) => rest);
  }

  async addMessage(sessionId: string, conversationId: string, role: AllowedRole, content: string) {
    if (!(await this.getConversation(sessionId, conversationId))) {
      throw new Error("Message insert rejected by ownership check.");
    }
    this.messages.push({ id: crypto.randomUUID(), conversation_id: conversationId, role, content, created_at: this.stamp() });
  }

  async touchConversation(sessionId: string, conversationId: string, firstMessage?: string) {
    const row = this.conversations.find((c) => c.id === conversationId && c.session_id === sessionId);
    if (!row) return;
    if (firstMessage && row.title === "New chat") row.title = firstMessage.slice(0, 60);
    row.updated_at = this.stamp();
  }

  async countUserMessagesSince(sessionId: string, since: Date) {
    const ids = new Set(this.conversations.filter((c) => c.session_id === sessionId).map((c) => c.id));
    return this.messages.filter((m) => ids.has(m.conversation_id) && m.role === "user" && new Date(m.created_at) > since).length;
  }
}

function strip({ session_id: _s, ...rest }: StoredConversation): ConversationRecord {
  return rest;
}

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { ChatRepository, ConversationRecord, MessageRecord } from "./repository";
import { isAllowedRole } from "./validation";

let cached: { url: string; sql: NeonQueryFunction<false, false> } | null = null;

/**
 * Returns the Neon client. Must only be called inside a server handler:
 * DATABASE_URL is read per request and never leaves the server.
 */
export function getSql(databaseUrl: string | undefined): NeonQueryFunction<false, false> {
  if (!databaseUrl) throw new Error("Database is not configured.");
  if (!cached || cached.url !== databaseUrl) {
    cached = { url: databaseUrl, sql: neon(databaseUrl) };
  }
  return cached.sql;
}

/**
 * Neon implementation of the chat repository. All queries use tagged
 * templates, which send values as bound parameters — never string-built SQL.
 */
export class NeonChatRepository implements ChatRepository {
  constructor(private readonly sql: NeonQueryFunction<false, false>) {}

  async findActiveSessionByTokenHash(tokenHash: string) {
    const rows = (await this.sql`
      SELECT id FROM ai_sessions
      WHERE token_hash = ${tokenHash} AND expires_at > NOW()
      LIMIT 1
    `) as Array<{ id: string }>;
    return rows[0] ?? null;
  }

  async createSession(tokenHash: string, expiresAt: Date) {
    const rows = (await this.sql`
      INSERT INTO ai_sessions (token_hash, expires_at)
      VALUES (${tokenHash}, ${expiresAt.toISOString()})
      RETURNING id
    `) as Array<{ id: string }>;
    if (!rows[0]) throw new Error("Session insert returned no row.");
    return rows[0];
  }

  async listConversations(sessionId: string, limit: number) {
    return (await this.sql`
      SELECT id, title, created_at, updated_at FROM ai_conversations
      WHERE session_id = ${sessionId}
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `) as ConversationRecord[];
  }

  async countConversations(sessionId: string) {
    const rows = (await this.sql`
      SELECT COUNT(*)::int AS count FROM ai_conversations WHERE session_id = ${sessionId}
    `) as Array<{ count: number }>;
    return rows[0]?.count ?? 0;
  }

  async createConversation(sessionId: string, title: string) {
    const rows = (await this.sql`
      INSERT INTO ai_conversations (session_id, title)
      VALUES (${sessionId}, ${title})
      RETURNING id, title, created_at, updated_at
    `) as ConversationRecord[];
    if (!rows[0]) throw new Error("Conversation insert returned no row.");
    return rows[0];
  }

  async getConversation(sessionId: string, conversationId: string) {
    const rows = (await this.sql`
      SELECT id, title, created_at, updated_at FROM ai_conversations
      WHERE id = ${conversationId} AND session_id = ${sessionId}
      LIMIT 1
    `) as ConversationRecord[];
    return rows[0] ?? null;
  }

  async deleteConversation(sessionId: string, conversationId: string) {
    const rows = (await this.sql`
      DELETE FROM ai_conversations
      WHERE id = ${conversationId} AND session_id = ${sessionId}
      RETURNING id
    `) as Array<{ id: string }>;
    return rows.length > 0;
  }

  async listMessages(sessionId: string, conversationId: string, limit: number, newestFirst = false) {
    const rows = (newestFirst
      ? await this.sql`
          SELECT m.id, m.role, m.content, m.created_at
          FROM ai_messages m
          JOIN ai_conversations c ON c.id = m.conversation_id
          WHERE m.conversation_id = ${conversationId} AND c.session_id = ${sessionId}
          ORDER BY m.created_at DESC
          LIMIT ${limit}
        `
      : await this.sql`
          SELECT m.id, m.role, m.content, m.created_at
          FROM ai_messages m
          JOIN ai_conversations c ON c.id = m.conversation_id
          WHERE m.conversation_id = ${conversationId} AND c.session_id = ${sessionId}
          ORDER BY m.created_at ASC
          LIMIT ${limit}
        `) as MessageRecord[];
    return rows.filter((row) => isAllowedRole(row.role));
  }

  async addMessage(sessionId: string, conversationId: string, role: "user" | "assistant", content: string) {
    // INSERT ... SELECT only writes when the conversation belongs to the session.
    const rows = (await this.sql`
      INSERT INTO ai_messages (conversation_id, role, content)
      SELECT c.id, ${role}, ${content}
      FROM ai_conversations c
      WHERE c.id = ${conversationId} AND c.session_id = ${sessionId}
      RETURNING id
    `) as Array<{ id: string }>;
    if (!rows.length) throw new Error("Message insert rejected by ownership check.");
  }

  async touchConversation(sessionId: string, conversationId: string, firstMessage?: string) {
    const title = firstMessage ? firstMessage.slice(0, 60) : null;
    await this.sql`
      UPDATE ai_conversations
      SET
        title = CASE WHEN ${title}::text IS NOT NULL AND title = 'New chat' THEN ${title}::text ELSE title END,
        updated_at = NOW()
      WHERE id = ${conversationId} AND session_id = ${sessionId}
    `;
  }

  async countUserMessagesSince(sessionId: string, since: Date) {
    const rows = (await this.sql`
      SELECT COUNT(*)::int AS count
      FROM ai_messages m
      JOIN ai_conversations c ON c.id = m.conversation_id
      WHERE c.session_id = ${sessionId}
        AND m.role = 'user'
        AND m.created_at > ${since.toISOString()}
    `) as Array<{ count: number }>;
    return rows[0]?.count ?? 0;
  }
}

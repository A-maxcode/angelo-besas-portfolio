import { createFileRoute } from "@tanstack/react-router";
import { sql } from "../../../lib/ai/db";
import {
  getOrCreateSession,
  getSession,
} from "../../../lib/ai/session";

type ConversationRow = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

function jsonResponse(
  data: unknown,
  status = 200,
  cookie?: string | null,
) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  if (cookie) {
    headers.set("Set-Cookie", cookie);
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export const Route = createFileRoute("/api/ai/conversations")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const session = await getOrCreateSession(request);

          const rows = await sql`
            SELECT id, title, created_at, updated_at
            FROM ai_conversations
            WHERE session_id = ${session.sessionId}
            ORDER BY updated_at DESC
          ` as ConversationRow[];

          return jsonResponse(
            { conversations: rows },
            200,
            session.setCookie,
          );
        } catch (error) {
          console.error("List conversations error:", error);

          return jsonResponse(
            { error: "Unable to load conversations." },
            500,
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const session = await getOrCreateSession(request);

          let body: unknown;

          try {
            body = await request.json();
          } catch {
            return jsonResponse(
              { error: "Invalid JSON request." },
              400,
            );
          }

          const requestedTitle =
            typeof body === "object" &&
            body !== null &&
            "title" in body &&
            typeof body.title === "string"
              ? body.title.trim()
              : "";

          const title = (requestedTitle || "New chat").slice(0, 100);

          const rows = await sql`
            INSERT INTO ai_conversations (session_id, title)
            VALUES (${session.sessionId}, ${title})
            RETURNING id, title, created_at, updated_at
          ` as ConversationRow[];

          if (!rows.length) {
            return jsonResponse(
              { error: "Unable to create conversation." },
              500,
              session.setCookie,
            );
          }

          return jsonResponse(
            { conversation: rows[0] },
            201,
            session.setCookie,
          );
        } catch (error) {
          console.error("Create conversation error:", error);

          return jsonResponse(
            { error: "Unable to create conversation." },
            500,
          );
        }
      },
    },
  },
});

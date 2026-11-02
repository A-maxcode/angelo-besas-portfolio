import { createFileRoute } from "@tanstack/react-router";
import { sql } from "../../../../lib/ai/db";
import { getSession } from "../../../../lib/ai/session";

type MessageRow = {
id: string;
role: "user" | "assistant";
content: string;
created_at: string;
};

function jsonResponse(data: unknown, status = 200) {
return new Response(JSON.stringify(data), {
status,
headers: {
"Content-Type": "application/json",
"Cache-Control": "no-store",
},
});
}

export const Route = createFileRoute(
"/api/ai/conversations/$conversationId",
)({
server: {
handlers: {
GET: async ({ request, params }) => {
try {
const session = await getSession(request);

      if (!session) {
        return jsonResponse(
          { error: "Session not found." },
          401,
        );
      }

      const conversationId = params.conversationId;

      const conversations = await sql`
        SELECT id, title, created_at, updated_at
        FROM ai_conversations
        WHERE id = ${conversationId}
          AND session_id = ${session.sessionId}
        LIMIT 1
      `;

      if (!conversations.length) {
        return jsonResponse(
          { error: "Conversation not found." },
          404,
        );
      }

      const messages = await sql`
        SELECT id, role, content, created_at
        FROM ai_messages
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at ASC
      ` as MessageRow[];

      return jsonResponse({
        conversation: conversations[0],
        messages,
      });
    } catch (error) {
      console.error("Load conversation error:", error);

      return jsonResponse(
        { error: "Unable to load conversation." },
        500,
      );
    }
  },

  DELETE: async ({ request, params }) => {
    try {
      const session = await getSession(request);

      if (!session) {
        return jsonResponse(
          { error: "Session not found." },
          401,
        );
      }

      const conversationId = params.conversationId;

      const deleted = await sql`
        DELETE FROM ai_conversations
        WHERE id = ${conversationId}
          AND session_id = ${session.sessionId}
        RETURNING id
      `;

      if (!deleted.length) {
        return jsonResponse(
          { error: "Conversation not found." },
          404,
        );
      }

      return jsonResponse({ success: true });
    } catch (error) {
      console.error("Delete conversation error:", error);

      return jsonResponse(
        { error: "Unable to delete conversation." },
        500,
      );
    }
  },
},

},
});

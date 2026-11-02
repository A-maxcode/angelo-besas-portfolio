import { createFileRoute } from "@tanstack/react-router";
import { AMAX_SYSTEM_PROMPT } from "../../../lib/ai/prompts";
import { sql } from "../../../lib/ai/db";
import { getSession } from "../../../lib/ai/session";

type StoredMessage = {
role: "user" | "assistant";
content: string;
};

function jsonResponse(
data: unknown,
status = 200,
) {
return Response.json(data, {
status,
headers: {
"Cache-Control": "no-store",
},
});
}

export const Route = createFileRoute("/api/ai/chat")({
server: {
handlers: {
POST: async ({ request }) => {
try {
// Validate request origin.
const origin = request.headers.get("origin");

      if (origin) {
        const requestOrigin = new URL(origin).origin;
        const expectedOrigin = new URL(request.url).origin;

        if (requestOrigin !== expectedOrigin) {
          return jsonResponse(
            { error: "Invalid request origin." },
            403,
          );
        }
      }

      // Require an existing session.
      const session = await getSession(request);

      if (!session) {
        return jsonResponse(
          { error: "Session not found. Refresh the page and try again." },
          401,
        );
      }

      // Validate request body.
      let body: unknown;

      try {
        body = await request.json();
      } catch {
        return jsonResponse(
          { error: "Invalid JSON request." },
          400,
        );
      }

      if (
        typeof body !== "object" ||
        body === null ||
        !("conversationId" in body) ||
        !("message" in body) ||
        typeof body.conversationId !== "string" ||
        typeof body.message !== "string"
      ) {
        return jsonResponse(
          { error: "A conversation ID and message are required." },
          400,
        );
      }

      const conversationId = body.conversationId;
      const message = body.message.trim();

      if (
        !conversationId ||
        message.length === 0 ||
        message.length > 8000
      ) {
        return jsonResponse(
          { error: "The message is empty or exceeds the 8000-character limit." },
          400,
        );
      }

      // Confirm that this conversation belongs to this session.
      const conversations = await sql`
        SELECT id, title
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

      // Save the user's message.
      await sql`
        INSERT INTO ai_messages (
          conversation_id,
          role,
          content
        )
        VALUES (
          ${conversationId},
          'user',
          ${message}
        )
      `;

      // Set the conversation title from its first message.
      await sql`
        UPDATE ai_conversations
        SET
          title = CASE
            WHEN title = 'New chat'
            THEN LEFT(${message}, 60)
            ELSE title
          END,
          updated_at = NOW()
        WHERE id = ${conversationId}
          AND session_id = ${session.sessionId}
      `;

      // Load recent history from Neon.
      const storedMessages = await sql`
        SELECT role, content
        FROM ai_messages
        WHERE conversation_id = ${conversationId}
        ORDER BY created_at DESC
        LIMIT 20
      ` as StoredMessage[];

      const messages = storedMessages.reverse();

      // Check server-side OpenAI configuration.
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        console.error("OPENAI_API_KEY is not configured.");

        return jsonResponse(
          { error: "AI service is not configured." },
          500,
        );
      }

      // Request an AI response.
      const response = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            instructions: AMAX_SYSTEM_PROMPT,
            input: messages.map((item) => ({
              role: item.role,
              content: item.content,
            })),
            max_output_tokens: 1500,
          }),
        },
      );

      if (!response.ok) {
        const errorDetails = await response.text();

        console.error("OpenAI API error:", errorDetails);

        return jsonResponse(
          {
            error:
              response.status === 429
                ? "AI usage limit or API credits reached. Please try again later."
                : "The AI service could not complete your request.",
          },
          response.status === 429 ? 429 : 502,
        );
      }

      const result = await response.json();

      const content =
        result.output
          ?.flatMap((item: any) => item.content ?? [])
          .filter((item: any) => item.type === "output_text")
          .map((item: any) => item.text)
          .join("\n") ?? "";

      if (!content) {
        return jsonResponse(
          { error: "The AI returned an empty response." },
          502,
        );
      }

      // Save the assistant's response.
      await sql`
        INSERT INTO ai_messages (
          conversation_id,
          role,
          content
        )
        VALUES (
          ${conversationId},
          'assistant',
          ${content}
        )
      `;

      // Update conversation activity.
      await sql`
        UPDATE ai_conversations
        SET updated_at = NOW()
        WHERE id = ${conversationId}
          AND session_id = ${session.sessionId}
      `;

      return jsonResponse({ content });
    } catch (error) {
      console.error("A-Max AI server error:", error);

      return jsonResponse(
        { error: "Something went wrong. Please try again." },
        500,
      );
    }
  },
},

},
});

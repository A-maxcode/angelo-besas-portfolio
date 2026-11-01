import { createFileRoute } from "@tanstack/react-router";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded in Angelo Besas' personal portfolio website.

About Angelo:
- Name: Angelo Besas
- Headline: Young IT
- Studying: Bachelor of Science in Information Technology at Holy Name University (Tagbilaran City, Bohol, Philippines)
- Main interest: Web Development
- Focus: building clean, accessible, and responsive web experiences

Your role:
- Answer questions about Angelo, his skills, projects, education, and portfolio in a friendly, professional tone.
- Keep responses concise and useful.
- Never invent specific project details, certificates, or credentials. If unsure, suggest contacting Angelo via the Contact page.`;

function json(data: object, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const origin = request.headers.get("origin");
          const allowedOrigin = new URL(request.url).origin;

          if (origin && origin !== allowedOrigin) {
            return json({ error: "Invalid request origin." }, 403);
          }

          const contentType = request.headers.get("content-type") ?? "";
          if (!contentType.includes("application/json")) {
            return json({ error: "Invalid request format." }, 415);
          }

          const body = await request.json().catch(() => null);
          const incoming = body?.messages;

          if (
            !Array.isArray(incoming) ||
            incoming.length === 0 ||
            incoming.length > 40
          ) {
            return json({ error: "Please send a valid chat message." }, 400);
          }

          const messages: ChatMessage[] = [];

          for (const item of incoming) {
            if (
              !item ||
              (item.role !== "user" && item.role !== "assistant") ||
              typeof item.content !== "string" ||
              !item.content.trim() ||
              item.content.length > 4000
            ) {
              return json({ error: "Invalid chat message." }, 400);
            }

            messages.push({
              role: item.role,
              content: item.content.trim(),
            });
          }

          if (messages[messages.length - 1]?.role !== "user") {
            return json({ error: "A user message is required." }, 400);
          }

          const apiKey = process.env.OPENAI_API_KEY;

          if (!apiKey) {
            console.error("OPENAI_API_KEY is not configured.");
            return json({ error: "AI service is not configured yet." }, 503);
          }

          const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                  { role: "system", content: SYSTEM_PROMPT },
                  ...messages.slice(-20),
                ],
                temperature: 0.7,
                max_tokens: 800,
              }),
            },
          );

          if (!response.ok) {
            const details = await response.text();
            console.error("OpenAI chat API error:", response.status, details);

            return json(
              {
                error:
                  "The AI service is temporarily unavailable. Please try again later.",
              },
              response.status === 429 ? 429 : 502,
            );
          }

          const data = await response.json();
          const content = data.choices?.[0]?.message?.content?.trim();

          if (typeof content !== "string" || !content) {
            return json(
              { error: "The AI couldn't generate a response. Please try again." },
              502,
            );
          }

          return json({ content });
        } catch (error) {
          console.error("AI chat route error:", error);
          return json({ error: "Something went wrong. Please try again." }, 500);
        }
      },
    },
  },
});

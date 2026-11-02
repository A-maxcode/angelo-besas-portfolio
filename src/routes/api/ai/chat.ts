import { createFileRoute } from "@tanstack/react-router";
import { AMAX_SYSTEM_PROMPT } from "../../../lib/ai/prompts";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Validate request origin when supplied.
          const origin = request.headers.get("origin");

          if (origin) {
            const requestOrigin = new URL(origin).origin;
            const expectedOrigin = new URL(request.url).origin;

            if (requestOrigin !== expectedOrigin) {
              return Response.json(
                { error: "Invalid request origin." },
                { status: 403 },
              );
            }
          }

          const body = await request.json();

          if (!Array.isArray(body.messages)) {
            return Response.json(
              { error: "Invalid messages." },
              { status: 400 },
            );
          }

          const messages = body.messages as Message[];

          if (
            messages.length === 0 ||
            messages.length > 40 ||
            !messages.every(
              (message) =>
                message &&
                ["user", "assistant"].includes(message.role) &&
                typeof message.content === "string" &&
                message.content.length > 0 &&
                message.content.length <= 8000,
            )
          ) {
            return Response.json(
              { error: "Messages are invalid or exceed the allowed limit." },
              { status: 400 },
            );
          }

          if (messages[messages.length - 1]?.role !== "user") {
            return Response.json(
              { error: "The last message must be from the user." },
              { status: 400 },
            );
          }

          const apiKey = process.env.OPENAI_API_KEY;

          if (!apiKey) {
            console.error("OPENAI_API_KEY is not configured.");

            return Response.json(
              { error: "AI service is not configured." },
              { status: 500 },
            );
          }

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
                input: messages.slice(-20).map((message) => ({
                  role: message.role,
                  content: message.content,
                })),
                max_output_tokens: 1500,
              }),
            },
          );

          if (!response.ok) {
            const errorDetails = await response.text();

            console.error("OpenAI API error:", errorDetails);

            return Response.json(
              {
                error:
                  response.status === 429
                    ? "AI usage limit or API credits reached. Please try again later."
                    : "The AI service could not complete your request.",
              },
              { status: response.status === 429 ? 429 : 502 },
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
            return Response.json(
              { error: "The AI returned an empty response." },
              { status: 502 },
            );
          }

          return Response.json({ content });
        } catch (error) {
          console.error("A-Max AI server error:", error);

          return Response.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 },
          );
        }
      },
    },
  },
});

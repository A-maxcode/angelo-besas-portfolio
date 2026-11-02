
import { createFileRoute } from "@tanstack/react-router";
import { getOrCreateSession } from "../../../lib/ai/session";

export const Route = createFileRoute("/api/ai/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const session = await getOrCreateSession(request);

          const headers = new Headers({
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          });

          if (session.setCookie) {
            headers.set("Set-Cookie", session.setCookie);
          }

          return new Response(
            JSON.stringify({ sessionId: session.sessionId }),
            { status: 200, headers },
          );
        } catch (error) {
          console.error("AI session error:", error);

          return Response.json(
            { error: "Unable to initialize AI session." },
            { status: 500 },
          );
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { handleChat, handlePreflight } from "../../../lib/ai/service";
import { withDeps } from "../../../lib/ai/route-helpers";

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: ({ request }) => withDeps((deps) => handleChat(request, deps)),
      OPTIONS: ({ request }) => withDeps((deps) => handlePreflight("POST")(request, deps)),
    },
  },
});

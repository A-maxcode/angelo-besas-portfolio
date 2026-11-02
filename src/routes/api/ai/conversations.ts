import { createFileRoute } from "@tanstack/react-router";
import { handleCreateConversation, handleListConversations, handlePreflight } from "../../../lib/ai/service";
import { withDeps } from "../../../lib/ai/route-helpers";

export const Route = createFileRoute("/api/ai/conversations")({
  server: {
    handlers: {
      GET: ({ request }) => withDeps((deps) => handleListConversations(request, deps)),
      POST: ({ request }) => withDeps((deps) => handleCreateConversation(request, deps)),
      OPTIONS: ({ request }) => withDeps((deps) => handlePreflight("GET, POST")(request, deps)),
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { handleDeleteConversation, handleGetConversation, handlePreflight } from "../../../../lib/ai/service";
import { withDeps } from "../../../../lib/ai/route-helpers";

export const Route = createFileRoute("/api/ai/conversations/$conversationId")({
  server: {
    handlers: {
      GET: ({ request, params }) => withDeps((deps) => handleGetConversation(params.conversationId)(request, deps)),
      DELETE: ({ request, params }) => withDeps((deps) => handleDeleteConversation(params.conversationId)(request, deps)),
      OPTIONS: ({ request }) => withDeps((deps) => handlePreflight("GET, DELETE")(request, deps)),
    },
  },
});

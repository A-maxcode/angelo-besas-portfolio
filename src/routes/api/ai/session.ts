import { createFileRoute } from "@tanstack/react-router";
import { handlePreflight, handleSession } from "../../../lib/ai/service";
import { withDeps } from "../../../lib/ai/route-helpers";

export const Route = createFileRoute("/api/ai/session")({
  server: {
    handlers: {
      GET: ({ request }) => withDeps((deps) => handleSession(request, deps)),
      OPTIONS: ({ request }) => withDeps((deps) => handlePreflight("GET")(request, deps)),
    },
  },
});

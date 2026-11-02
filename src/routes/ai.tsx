import { createFileRoute } from "@tanstack/react-router";
import { ChatWindow } from "../components/ai/ChatWindow";

export const Route = createFileRoute("/ai")({
  component: AIPage,
});

function AIPage() {
  return <ChatWindow />;
}

import { json } from "./http";
import { getAiDeps } from "./deps";
import type { AiDeps } from "./service";

/** Builds deps inside the handler; config errors become a generic 503. */
export async function withDeps(run: (deps: AiDeps) => Promise<Response>): Promise<Response> {
  let deps: AiDeps;
  try {
    deps = getAiDeps();
  } catch {
    console.error("[amax-ai] configuration missing");
    return json({ error: "A-MAX AI is temporarily unavailable." }, 503);
  }
  return run(deps);
}

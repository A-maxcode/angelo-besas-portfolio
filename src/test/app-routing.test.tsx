import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
const paths = [
  "/",
  "/about",
  "/achievements",
  "/certificates",
  "/projects",
  "/skills",
  "/contact",
  "/admin/login",
  "/admin",
  "/admin/profile",
  "/admin/achievements",
  "/admin/certificates",
  "/admin/projects",
  "/admin/skills",
  "/admin/education",
  "/admin/messages",
  "/admin/settings",
];

describe("App routing", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

  it.each(paths)("matches a page for %s", (path) => {
    const leaf = router.matchRoutes(path).at(-1);
    expect(leaf?.routeId).not.toBe(rootRouteId);
    expect(leaf?.routeId).not.toBe("__root__");
  });

  it("renders /admin/login outside the admin sidebar layout", () => {
    const ids = router.matchRoutes("/admin/login").map((m) => m.routeId);
    expect(ids).not.toContain("/admin");
  });
});

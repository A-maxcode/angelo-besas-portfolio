import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ResourceManager, newId, splitTags } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/site/StatusBadge";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";

export const Route = createFileRoute("/admin/projects")({
  component: () => (
    <ResourceManager<Project>
      title="Projects"
      singular="Project"
      description="Manage project cards shown on the public Projects page."
      initialItems={projects}
      searchText={(p) => p.title}
      columns={[
        { key: "title", header: "Title", render: (p) => <span className="font-medium">{p.title}</span> },
        {
          key: "tech",
          header: "Technologies",
          className: "hidden md:table-cell",
          render: (p) => (
            <div className="flex flex-wrap gap-1">
              {p.tech.map((t) => (
                <Badge key={t} variant="tag">
                  {t}
                </Badge>
              ))}
            </div>
          ),
        },
        { key: "status", header: "Status", className: "hidden sm:table-cell", render: (p) => <StatusBadge status={p.status} /> },
      ]}
      fields={[
        { name: "title", label: "Title", placeholder: "Project name" },
        { name: "summary", label: "Description", type: "textarea" },
        { name: "tech", label: "Technologies", hint: "Comma-separated, e.g. React, TypeScript" },
        { name: "repoUrl", label: "Repository URL", type: "url", hint: "Optional — keep empty while private" },
        { name: "liveUrl", label: "Live URL", type: "url", hint: "Optional" },
      ]}
      toForm={(p) => ({ title: p.title, summary: p.summary, tech: p.tech.join(", "), repoUrl: p.repoUrl ?? "", liveUrl: p.liveUrl ?? "" })}
      fromForm={(v, ex) => ({
        id: ex?.id ?? newId("proj"),
        title: v("title").trim(),
        summary: v("summary").trim(),
        tech: splitTags(v("tech")),
        repoUrl: v("repoUrl").trim() || undefined,
        liveUrl: v("liveUrl").trim() || undefined,
        featured: ex?.featured,
        status: ex?.status ?? "sample",
      })}
    />
  ),
});

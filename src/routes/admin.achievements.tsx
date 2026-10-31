import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ResourceManager, newId } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/site/StatusBadge";
import { achievements } from "@/data/achievements";
import type { Achievement } from "@/data/types";

export const Route = createFileRoute("/admin/achievements")({
  component: () => (
    <ResourceManager<Achievement>
      title="Achievements"
      singular="Achievement"
      description="Manage awards, honors, and milestones."
      initialItems={achievements}
      searchText={(a) => a.title}
      columns={[
        { key: "title", header: "Title", render: (a) => <span className="font-medium">{a.title}</span> },
        { key: "category", header: "Category", className: "hidden md:table-cell", render: (a) => <Badge variant="cyan">{a.category}</Badge> },
        { key: "date", header: "Date", className: "hidden sm:table-cell", render: (a) => a.date },
        { key: "status", header: "Status", className: "hidden lg:table-cell", render: (a) => <StatusBadge status={a.status} /> },
      ]}
      fields={[
        { name: "title", label: "Title" },
        { name: "category", label: "Category", placeholder: "Academic, Competition, Leadership…" },
        { name: "date", label: "Date", placeholder: "e.g. March 2026" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      toForm={(a) => ({ title: a.title, category: a.category, date: a.date, description: a.description })}
      fromForm={(v, ex) => ({
        id: ex?.id ?? newId("ach"),
        title: v.title.trim(),
        category: v.category.trim() || "Uncategorized",
        date: v.date.trim() || "Date TBA",
        description: v.description.trim(),
        featured: ex?.featured,
        status: ex?.status ?? "placeholder",
      })}
    />
  ),
});

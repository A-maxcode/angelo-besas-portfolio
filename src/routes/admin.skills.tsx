import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, newId, splitTags } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/site/StatusBadge";
import { skillGroups } from "@/data/skills";
import type { SkillGroup } from "@/data/types";

export const Route = createFileRoute("/admin/skills")({
  component: () => (
    <ResourceManager<SkillGroup>
      title="Skills"
      singular="Skill group"
      description="Group skills by area. No proficiency ratings are shown publicly."
      initialItems={skillGroups}
      searchText={(g) => g.title}
      columns={[
        { key: "title", header: "Group", render: (g) => <span className="font-medium">{g.title}</span> },
        {
          key: "skills",
          header: "Skills",
          className: "hidden md:table-cell",
          render: (g) => <span className="text-sm text-muted-foreground">{g.skills.join(", ")}</span>,
        },
        { key: "status", header: "Status", className: "hidden sm:table-cell", render: (g) => <StatusBadge status={g.status} /> },
      ]}
      fields={[
        { name: "title", label: "Group name" },
        { name: "description", label: "Short description" },
        { name: "skills", label: "Skills", hint: "Comma-separated" },
      ]}
      toForm={(g) => ({ title: g.title, description: g.description, skills: g.skills.join(", ") })}
      fromForm={(v, ex) => ({
        id: ex?.id ?? newId("sk"),
        title: v("title").trim(),
        description: v("description").trim(),
        skills: splitTags(v("skills")),
        status: ex?.status ?? "placeholder",
      })}
    />
  ),
});

import { createFileRoute } from "@tanstack/react-router";
import { ResourceManager, newId } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/site/StatusBadge";
import { education } from "@/data/profile";
import type { Education } from "@/data/types";

export const Route = createFileRoute("/admin/education")({
  component: () => (
    <ResourceManager<Education>
      title="Education"
      singular="Education entry"
      description="Schools, programs, and periods shown on the About page."
      initialItems={education}
      searchText={(e) => e.degree}
      columns={[
        { key: "degree", header: "Program", render: (e) => <span className="font-medium">{e.degree}</span> },
        { key: "school", header: "School", className: "hidden md:table-cell", render: (e) => e.school },
        { key: "period", header: "Period", className: "hidden sm:table-cell", render: (e) => e.period },
        { key: "status", header: "Status", className: "hidden lg:table-cell", render: (e) => <StatusBadge status={e.status} /> },
      ]}
      fields={[
        { name: "degree", label: "Program / degree" },
        { name: "school", label: "School" },
        { name: "period", label: "Period", placeholder: "e.g. 2023 – present" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      toForm={(e) => ({ degree: e.degree, school: e.school, period: e.period, description: e.description })}
      fromForm={(v, ex) => ({
        id: ex?.id ?? newId("edu"),
        degree: v.degree.trim(),
        school: v.school.trim(),
        period: v.period.trim() || "Dates to be added",
        description: v.description.trim(),
        status: ex?.status ?? "placeholder",
      })}
    />
  ),
});

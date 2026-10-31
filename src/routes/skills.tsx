import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SkillGroupCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/EmptyState";
import { skillGroups } from "@/data/skills";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/skills")({
  head: () =>
    pageMeta(
      "Skills — Angelo Besas",
      "Frontend, backend, tooling, and professional skills of Angelo Besas, grouped by area.",
    ),
  component: SkillsPage,
});

function SkillsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Skills"
        title="Tools and technologies"
        description="Grouped by area, without ratings. Lists are placeholders until confirmed."
      />
      <Section>
        {skillGroups.length === 0 ? (
          <EmptyState icon={Wrench} title="No skills listed" description="Skill groups will appear here once added." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {skillGroups.map((g) => (
              <SkillGroupCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { AchievementCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/EmptyState";
import { achievements } from "@/data/achievements";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/achievements")({
  head: () =>
    pageMeta(
      "Achievements — Angelo Besas",
      "Academic, competition, and leadership achievements of Angelo Besas, IT student at Holy Name University.",
    ),
  component: AchievementsPage,
});

function AchievementsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Achievements"
        title="Milestones along the way"
        description="Entries below are placeholders and will be replaced with verified achievements."
      />
      <Section>
        {achievements.length === 0 ? (
          <EmptyState icon={Award} title="No achievements yet" description="Achievements will appear here once added." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <AchievementCard key={a.id} item={a} />
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

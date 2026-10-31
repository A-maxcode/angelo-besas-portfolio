import { createFileRoute } from "@tanstack/react-router";
import { FolderGit2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ProjectCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/EmptyState";
import { projects } from "@/data/projects";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/projects")({
  head: () =>
    pageMeta(
      "Projects — Angelo Besas",
      "Web development projects by Angelo Besas, with technologies used and links to repositories and live demos.",
    ),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Projects"
        title="Things I'm building"
        description="Sample projects are labeled. Repositories stay private during development."
      />
      <Section>
        {projects.length === 0 ? (
          <EmptyState icon={FolderGit2} title="No projects yet" description="Projects will appear here once added." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} item={p} />
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, GraduationCap, Code2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Section, SectionHeading } from "@/components/site/Section";
import { AchievementCard, ProjectCard } from "@/components/site/cards";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { achievements } from "@/data/achievements";
import { certificates } from "@/data/certificates";
import { skillGroups } from "@/data/skills";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta(
      "Angelo Besas — Young IT · Web Development Portfolio",
      "Angelo Besas is a BS Information Technology student at Holy Name University focused on web development. Explore projects, achievements, and skills.",
    ),
  component: HomePage,
});

function HomePage() {
  const featuredProjects = projects.filter((p) => p.featured);
  const featuredAchievements = achievements.filter((a) => a.featured);
  const stats = [
    { label: "Projects listed", value: projects.length },
    { label: "Achievements listed", value: achievements.length },
    { label: "Certificates listed", value: certificates.length },
    { label: "Skill groups", value: skillGroups.length },
  ];

  return (
    <SiteLayout>
      <Hero />

      <section aria-label="Portfolio at a glance" className="relative z-10 -mt-10">
        <div className="container-page">
          <dl className="card-surface grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
            {stats.map((s) => (
              <div key={s.label} className="px-5 py-5 text-center md:py-6">
                <dd className="text-3xl font-bold text-gradient-brand">{s.value}</dd>
                <dt className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Counts reflect current entries, including sample and placeholder content.
          </p>
        </div>
      </section>

      <Section labelledBy="featured-projects">
        <SectionHeading
          id="featured-projects"
          eyebrow="Selected work"
          title="Featured projects"
          description="Sample projects shown for layout — real work will replace them."
          action={
            <Button asChild variant="outline">
              <Link to="/projects">
                All projects <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {featuredProjects.map((p) => (
            <ProjectCard key={p.id} item={p} />
          ))}
        </div>
      </Section>

      <Section labelledBy="featured-achievements" className="bg-card border-y">
        <SectionHeading
          id="featured-achievements"
          eyebrow="Milestones"
          title="Featured achievements"
          action={
            <Button asChild variant="outline">
              <Link to="/achievements">
                All achievements <ArrowRight />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {featuredAchievements.map((a) => (
            <AchievementCard key={a.id} item={a} />
          ))}
        </div>
      </Section>

      <Section labelledBy="cta">
        <div className="relative overflow-hidden rounded-2xl bg-hero px-6 py-12 text-navy-foreground md:px-12">
          <div aria-hidden="true" className="grid-lines absolute inset-0" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 id="cta" className="text-2xl font-bold md:text-3xl">
                Let's build something for the web.
              </h2>
              <p className="mt-2 text-navy-muted">Questions, collaborations, or feedback are welcome.</p>
            </div>
            <Button asChild size="lg" variant="hero">
              <Link to="/contact">
                <Mail /> Contact me
              </Link>
            </Button>
          </div>
        </div>
      </Section>
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-hero text-navy-foreground" aria-labelledby="hero-title">
      <div aria-hidden="true" className="grid-lines absolute inset-0" />
      <div className="container-page relative grid items-center gap-12 pb-24 pt-14 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:pb-32 lg:pt-24">
        <div className="animate-fade-up">
          <Badge variant="dark" className="font-mono">
            <span className="size-1.5 rounded-full bg-cyan" aria-hidden="true" /> {profile.headline}
          </Badge>
          <h1 id="hero-title" className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            {profile.name.split(" ")[0]}{" "}
            <span className="text-gradient-brand">{profile.name.split(" ").slice(1).join(" ")}</span>
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-navy-muted md:text-base">
            <GraduationCap className="size-4 text-cyan" aria-hidden="true" />
            {profile.course}
            <span aria-hidden="true">·</span>
            {profile.school}
          </p>
          <p className="mt-6 max-w-xl text-base text-navy-muted md:text-lg">{profile.intro}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="hero">
              <Link to="/projects">
                View projects <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="heroOutline">
              <Link to="/about">About me</Link>
            </Button>
          </div>
        </div>

        <CodeCard />
      </div>
    </section>
  );
}

function CodeCard() {
  return (
    <figure
      className="animate-fade-up rounded-2xl border border-navy-border bg-navy/80 shadow-glow backdrop-blur [animation-delay:150ms]"
      aria-label="Profile summary written as code"
    >
      <div className="flex items-center gap-2 border-b border-navy-border px-4 py-3">
        <span className="size-2.5 rounded-full bg-navy-3" />
        <span className="size-2.5 rounded-full bg-navy-3" />
        <span className="size-2.5 rounded-full bg-cyan" />
        <span className="ml-3 font-mono text-xs text-navy-muted">angelo.ts</span>
        <Code2 className="ml-auto size-4 text-navy-muted" aria-hidden="true" />
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[0.8rem] leading-relaxed text-navy-muted sm:text-sm">
        <code>
          <span className="text-cyan">const</span> <span className="text-navy-foreground">developer</span> = {"{"}
          {"\n"}  name: <span className="text-brand">"{profile.name}"</span>,
          {"\n"}  role: <span className="text-brand">"{profile.headline}"</span>,
          {"\n"}  school: <span className="text-brand">"{profile.school}"</span>,
          {"\n"}  focus: <span className="text-brand">"{profile.mainInterest}"</span>,
          {"\n"}  learning: <span className="text-cyan">true</span>,
          {"\n"}{"}"};<span className="animate-blink text-cyan">▍</span>
        </code>
      </pre>
    </figure>
  );
}

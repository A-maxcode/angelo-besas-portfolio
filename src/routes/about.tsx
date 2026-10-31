import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Section, SectionHeading } from "@/components/site/Section";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Monogram } from "@/components/site/Logo";
import { education, interests, profile } from "@/data/profile";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageMeta(
      "About Angelo Besas — BS Information Technology Student",
      "Profile, education at Holy Name University, and interests of Angelo Besas, a young IT student focused on web development.",
    ),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <PageHero eyebrow="About" title="Hi, I'm Angelo." description={`${profile.headline} · ${profile.mainInterest}`} />

      <Section labelledBy="overview">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <aside className="card-surface h-fit p-6">
            <Monogram className="size-20 rounded-2xl text-2xl" />
            <h2 id="overview" className="mt-5 text-xl font-bold">
              {profile.name}
            </h2>
            <p className="text-sm text-muted-foreground">{profile.headline}</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Course</dt>
                <dd className="font-medium">{profile.course}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">School</dt>
                <dd className="font-medium">{profile.school}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Main interest</dt>
                <dd className="font-medium">{profile.mainInterest}</dd>
              </div>
            </dl>
          </aside>
          <div className="space-y-4 text-base leading-relaxed md:text-lg">
            {profile.about.map((p, i) => (
              <p key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>
                {p}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section labelledBy="education" className="border-y bg-card">
        <SectionHeading id="education" eyebrow="Education" title="Where I'm studying" />
        <ol className="relative space-y-6 border-l-2 border-border pl-6">
          {education.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -left-[2.1rem] grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                <GraduationCap className="size-4" aria-hidden="true" />
              </span>
              <div className="card-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{e.degree}</h3>
                    <p className="text-sm text-muted-foreground">
                      {e.school} · {e.period}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section labelledBy="interests">
        <SectionHeading id="interests" eyebrow="Interests" title="What I care about" />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {interests.map((i) => (
            <li key={i.id} className="card-surface p-6">
              <Sparkles className="size-5 text-cyan" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
            </li>
          ))}
        </ul>
      </Section>
    </SiteLayout>
  );
}

import { Award, Calendar, ExternalLink, FileText, Github, ImageIcon, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Achievement, Certificate, Project, SkillGroup } from "@/data/types";
import { StatusBadge } from "./StatusBadge";

export function AchievementCard({ item }: { item: Achievement }) {
  return (
    <article className="card-surface card-interactive flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary">
          <Award className="size-5" aria-hidden="true" />
        </span>
        <StatusBadge status={item.status} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="cyan">{item.category}</Badge>
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3.5" aria-hidden="true" />
          {item.date}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
    </article>
  );
}

export function CertificateCard({ item }: { item: Certificate }) {
  const DocIcon = item.documentType === "pdf" ? FileText : ImageIcon;
  return (
    <article className="card-surface card-interactive flex h-full flex-col overflow-hidden">
      <div
        className="placeholder-hatch flex aspect-[4/3] flex-col items-center justify-center gap-2 border-b text-muted-foreground"
        role="img"
        aria-label={`${item.documentType === "pdf" ? "PDF document" : "Certificate image"} placeholder`}
      >
        <DocIcon className="size-8" aria-hidden="true" />
        <span className="font-mono text-xs">
          {item.documentType === "pdf" ? "PDF preview" : "Image preview"} · pending upload
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Issuer</dt>
          <dd>{item.issuer}</dd>
          <dt className="text-muted-foreground">Issued</dt>
          <dd>{item.date}</dd>
        </dl>
      </div>
    </article>
  );
}

function PlaceholderLink({ icon: Icon, label }: { icon: typeof Github; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-2.5 py-1.5 text-xs text-muted-foreground"
      title="Link will be added later"
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export function ProjectCard({ item }: { item: Project }) {
  return (
    <article className="card-surface card-interactive flex h-full flex-col overflow-hidden">
      <div aria-hidden="true" className="relative h-28 overflow-hidden bg-navy-2">
        <div className="grid-lines absolute inset-0" />
        <div className="absolute inset-x-5 bottom-0 h-16 rounded-t-lg border border-b-0 border-navy-border bg-navy p-3">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-navy-3" />
            <span className="size-2 rounded-full bg-navy-3" />
            <span className="size-2 rounded-full bg-cyan" />
          </div>
          <div className="mt-2.5 h-1.5 w-2/3 rounded bg-gradient-brand opacity-80" />
          <div className="mt-1.5 h-1.5 w-1/3 rounded bg-navy-3" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{item.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {item.tech.map((t) => (
            <li key={t}>
              <Badge variant="tag">{t}</Badge>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
          <PlaceholderLink icon={Lock} label="Repository · private" />
          <PlaceholderLink icon={ExternalLink} label="Live demo · coming soon" />
        </div>
      </div>
    </article>
  );
}

export function SkillGroupCard({ group }: { group: SkillGroup }) {
  return (
    <article className="card-surface flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{group.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
        </div>
        <StatusBadge status={group.status} />
      </div>
      <ul className="mt-5 flex flex-wrap gap-2">
        {group.skills.map((s) => (
          <li key={s} className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium">
            {s}
          </li>
        ))}
      </ul>
    </article>
  );
}

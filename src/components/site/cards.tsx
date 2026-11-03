import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Award, Calendar, ExternalLink, FileText, ImageIcon } from "lucide-react";
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
  return (
    <article className="card-surface card-interactive flex h-full flex-col overflow-hidden">
      {item.imageUrl && (
        <div className="aspect-[4/3] overflow-hidden border-b bg-muted">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-snug">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>

        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Issuer</dt>
          <dd>{item.issuer}</dd>
          <dt className="text-muted-foreground">Issued</dt>
          <dd>{item.date}</dd>
        </dl>

        {item.credentialUrl && (
          <a
            href={item.credentialUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            View credential <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </article>
  );
}

export function ProjectCard({ item }: { item: Project }) {
  return (
    <article className="card-surface card-interactive flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <StatusBadge status={item.status} />
        </div>

        <p className="mt-2 flex-1 text-sm text-muted-foreground">
          {item.summary}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {item.tech.map((technology) => (
            <li key={technology}>
              <Badge variant="tag">{technology}</Badge>
            </li>
          ))}
        </ul>

        {(item.repoUrl || item.liveUrl) && (
          <div className="mt-5 flex flex-wrap gap-4 border-t pt-4">
            {item.repoUrl && (
              <a
                href={item.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Repository <ExternalLink className="size-3.5" />
              </a>
            )}

            {item.liveUrl && (
              <a
                href={item.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Live <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )}
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
          <p className="mt-1 text-sm text-muted-foreground">
            {group.description}
          </p>
        </div>
        <StatusBadge status={group.status} />
      </div>

      <ul className="mt-5 flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium"
          >
            {skill}
          </li>
        ))}
      </ul>
    </article>
  );
}

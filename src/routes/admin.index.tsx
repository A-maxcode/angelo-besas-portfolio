import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, BadgeCheck, FolderGit2, Mail, Plus, Activity, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, StatCard } from "@/components/admin/AdminPageHeader";
import { projects } from "@/data/projects";
import { achievements } from "@/data/achievements";
import { certificates } from "@/data/certificates";
import { skillGroups } from "@/data/skills";
import { mockActivity, mockMessages } from "@/data/admin";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const unread = mockMessages.filter((m) => !m.read).length;
  const quick = [
    { to: "/admin/projects", label: "Add project", icon: FolderGit2 },
    { to: "/admin/achievements", label: "Add achievement", icon: Award },
    { to: "/admin/certificates", label: "Add certificate", icon: BadgeCheck },
  ] as const;

  return (
    <>
      <AdminPageHeader title={`Welcome back, ${profile.name.split(" ")[0]}`} description="Overview of portfolio content (mock data)." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Projects" value={projects.length} icon={FolderGit2} note="Sample entries" />
        <StatCard label="Achievements" value={achievements.length} icon={Award} note="Placeholders" />
        <StatCard label="Certificates" value={certificates.length} icon={BadgeCheck} note="Placeholders" />
        <StatCard label="Unread messages" value={unread} icon={Mail} note="Sample inbox" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card-surface" aria-labelledby="activity-title">
          <div className="flex items-center justify-between border-b p-5">
            <h2 id="activity-title" className="flex items-center gap-2 font-semibold">
              <Activity className="size-4 text-primary" aria-hidden="true" /> Recent activity
            </h2>
            <Badge variant="sample">Sample</Badge>
          </div>
          <ul className="divide-y">
            {mockActivity.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-4">
                <span className="size-2 shrink-0 rounded-full bg-cyan" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{a.when}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-6">
          <section className="card-surface p-5" aria-labelledby="quick-title">
            <h2 id="quick-title" className="font-semibold">
              Quick actions
            </h2>
            <div className="mt-4 grid gap-2">
              {quick.map((q) => (
                <Button key={q.to} asChild variant="outline" className="justify-start">
                  <Link to={q.to}>
                    <Plus /> {q.label}
                  </Link>
                </Button>
              ))}
            </div>
          </section>
          <section className="rounded-xl bg-hero p-5 text-navy-foreground" aria-labelledby="content-title">
            <h2 id="content-title" className="flex items-center gap-2 font-semibold">
              <Wrench className="size-4 text-cyan" aria-hidden="true" /> Content health
            </h2>
            <p className="mt-2 text-sm text-navy-muted">
              {skillGroups.length} skill groups and most entries are still placeholders. Replace them with verified
              content once the CMS is connected.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

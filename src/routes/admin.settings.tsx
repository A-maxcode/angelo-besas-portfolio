import { createFileRoute } from "@tanstack/react-router";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const toggles = [
  { id: "show-achievements", label: "Show Achievements page", desc: "Hide the page while entries are placeholders.", on: true },
  { id: "show-certificates", label: "Show Certificates page", desc: "Hide until documents are uploaded.", on: true },
  { id: "contact-enabled", label: "Accept contact messages", desc: "Requires the backend milestone.", on: false, disabled: true },
];

function SettingsPage() {
  return (
    <>
      <AdminPageHeader title="Settings" description="Site-wide preferences (prototype)." />
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          toast.info("Not saved", { description: "Settings will persist after backend integration." });
        }}
      >
        <section className="card-surface space-y-5 p-6" aria-labelledby="site-title">
          <h2 id="site-title" className="font-semibold">
            Site details
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-title">Site title</Label>
              <Input id="s-title" defaultValue="Angelo Besas — Young IT" maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Contact email</Label>
              <Input id="s-email" type="email" placeholder="To be added" maxLength={255} />
            </div>
          </div>
        </section>

        <section className="card-surface divide-y" aria-labelledby="vis-title">
          <h2 id="vis-title" className="p-6 pb-4 font-semibold">
            Visibility
          </h2>
          {toggles.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <Label htmlFor={t.id}>{t.label}</Label>
                <p className="text-xs text-muted-foreground">{t.desc}</p>
              </div>
              <Switch id={t.id} defaultChecked={t.on} disabled={t.disabled} />
            </div>
          ))}
        </section>

        <div className="flex justify-end">
          <Button type="submit">
            <Save /> Save settings
          </Button>
        </div>
      </form>
    </>
  );
}

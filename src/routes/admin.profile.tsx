import { createFileRoute } from "@tanstack/react-router";
import { Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Monogram } from "@/components/site/Logo";
import { profile } from "@/data/profile";

export const Route = createFileRoute("/admin/profile")({
  component: ProfileEditor,
});

const fields = [
  { id: "name", label: "Display name", value: profile.name },
  { id: "headline", label: "Headline", value: profile.headline },
  { id: "course", label: "Course", value: profile.course },
  { id: "school", label: "School", value: profile.school },
  { id: "interest", label: "Main interest", value: profile.mainInterest },
];

function ProfileEditor() {
  return (
    <>
      <AdminPageHeader title="Profile" description="Public identity shown across the site." />
      <form
        className="grid gap-6 lg:grid-cols-[1fr_2fr]"
        onSubmit={(e) => {
          e.preventDefault();
          toast.info("Not saved", { description: "Profile editing will be saved once the backend is connected." });
        }}
      >
        <section className="card-surface h-fit p-6 text-center" aria-labelledby="photo-title">
          <h2 id="photo-title" className="sr-only">
            Profile photo
          </h2>
          <Monogram className="mx-auto size-24 rounded-2xl text-3xl" />
          <p className="mt-4 text-sm font-medium">Profile photo</p>
          <p className="text-xs text-muted-foreground">Upload available after storage integration.</p>
          <Button type="button" variant="outline" className="mt-4" disabled>
            <Upload /> Upload photo
          </Button>
        </section>

        <section className="card-surface space-y-5 p-6" aria-label="Profile details">
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.id} className={f.id === "course" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
                <Label htmlFor={`p-${f.id}`}>{f.label}</Label>
                <Input id={`p-${f.id}`} defaultValue={f.value} maxLength={150} />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-intro">Short intro</Label>
            <Textarea id="p-intro" rows={3} defaultValue={profile.intro} maxLength={400} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-about">About text</Label>
            <Textarea id="p-about" rows={6} defaultValue={profile.about.join("\n\n")} maxLength={3000} />
          </div>
          <div className="flex justify-end border-t pt-5">
            <Button type="submit">
              <Save /> Save profile
            </Button>
          </div>
        </section>
      </form>
    </>
  );
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/site/FormField";
import { Monogram } from "@/components/site/Logo";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin_/login")({
  head: () =>
    pageMeta("Admin sign-in (prototype) — Angelo Besas Portfolio", "Sign-in screen prototype for the portfolio admin.", {
      noindex: true,
    }),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address." }).max(255),
  password: z.string().min(1, { message: "Enter your password." }).max(128),
});

function LoginPage() {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }
    setErrors({});
    toast.warning("Sign-in isn't available yet", {
      description: "Authentication will be added in the backend milestone. No credentials were checked or sent.",
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-hero px-4 py-12">
      <div aria-hidden="true" className="grid-lines absolute inset-0" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-3 text-navy-foreground">
          <Monogram className="size-10" />
          <span className="text-lg font-semibold">Portfolio admin</span>
        </div>

        <div className="card-surface p-6 sm:p-8">
          <h1 className="text-xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Owner access to the content dashboard.</p>

          <div role="note" className="mt-5 flex gap-3 rounded-lg border border-warning/40 bg-warning-soft p-3 text-xs text-warning-foreground">
            <ShieldAlert className="size-4 shrink-0" aria-hidden="true" />
            <p>
              Prototype screen. Sign-in is not connected and the admin area is <strong>not protected</strong> yet —
              real authentication and access rules come in a later milestone.
            </p>
          </div>

          <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
            <FormField id="email" label="Email" error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" maxLength={255} />
            </FormField>
            <FormField id="password" label="Password" error={errors.password}>
              <Input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} />
            </FormField>
            <Button type="submit" className="w-full" size="lg">
              <Lock /> Sign in
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2 border-t pt-5 text-sm sm:flex-row sm:justify-between">
            <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden="true" /> Back to site
            </Link>
            <Link to="/admin" className="font-medium text-primary hover:underline">
              Preview dashboard UI
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, GraduationCap, Code2 } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { FormField } from "@/components/site/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTACT_LIMITS,
  contactSchema,
  type ContactValues,
} from "@/lib/contact-schema";
import { profile } from "@/data/profile";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageMeta(
      "Contact Angelo Besas",
      "Send a message to Angelo Besas about web development projects, collaborations, or questions.",
    ),
  component: ContactPage,
});

function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const messageLength = watch("message")?.length ?? 0;

  const onSubmit = async (values: ContactValues) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Message could not be sent.");
        return;
      }

      toast.success("Message sent successfully!", {
        description: "Thank you for contacting me.",
      });

      reset();
    } catch {
      toast.error("Message could not be sent.", {
        description: "Please check your connection and try again.",
      });
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Say hello"
        description="Have a question or an idea? Leave a message below."
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.6fr]">
          <aside className="space-y-4">
            <div className="card-surface p-6">
              <h2 className="font-semibold">About the sender</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <GraduationCap
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {profile.course}, {profile.school}
                </li>
                <li className="flex gap-3">
                  <Code2
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  Focused on {profile.mainInterest.toLowerCase()}
                </li>
              </ul>
            </div>
          </aside>

          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="card-surface space-y-5 p-6 md:p-8"
            aria-label="Contact form"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="name"
                label="Name"
                error={errors.name?.message}
              >
                <Input
                  id="name"
                  autoComplete="name"
                  maxLength={CONTACT_LIMITS.name}
                  {...register("name")}
                />
              </FormField>

              <FormField
                id="email"
                label="Email"
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  maxLength={CONTACT_LIMITS.email}
                  {...register("email")}
                />
              </FormField>
            </div>

            <FormField
              id="subject"
              label="Subject"
              error={errors.subject?.message}
            >
              <Input
                id="subject"
                maxLength={CONTACT_LIMITS.subject}
                {...register("subject")}
              />
            </FormField>

            <FormField
              id="message"
              label="Message"
              error={errors.message?.message}
              hint={`${messageLength}/${CONTACT_LIMITS.message}`}
            >
              <Textarea
                id="message"
                rows={6}
                maxLength={CONTACT_LIMITS.message}
                {...register("message")}
              />
            </FormField>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                All fields are required.
              </p>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
              >
                <Send />
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>
            </div>
          </form>
        </div>
      </Section>
    </SiteLayout>
  );
}

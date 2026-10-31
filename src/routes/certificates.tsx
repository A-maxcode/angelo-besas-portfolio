import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CertificateCard } from "@/components/site/cards";
import { EmptyState } from "@/components/site/EmptyState";
import { certificates } from "@/data/certificates";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/certificates")({
  head: () =>
    pageMeta(
      "Certificates — Angelo Besas",
      "Certificates and credentials earned by Angelo Besas, BS Information Technology student.",
    ),
  component: CertificatesPage,
});

function CertificatesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Certificates"
        title="Credentials & trainings"
        description="Certificate documents will be uploaded later. Entries below are placeholders."
      />
      <Section>
        {certificates.length === 0 ? (
          <EmptyState icon={BadgeCheck} title="No certificates yet" description="Certificates will appear here once added." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((c) => (
              <CertificateCard key={c.id} item={c} />
            ))}
          </div>
        )}
      </Section>
    </SiteLayout>
  );
}

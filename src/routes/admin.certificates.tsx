import { createFileRoute } from "@tanstack/react-router";
import { FileText, ImageIcon } from "lucide-react";
import { ResourceManager, newId } from "@/components/admin/ResourceManager";
import { StatusBadge } from "@/components/site/StatusBadge";
import { certificates } from "@/data/certificates";
import type { Certificate } from "@/data/types";

export const Route = createFileRoute("/admin/certificates")({
  component: () => (
    <ResourceManager<Certificate>
      title="Certificates"
      singular="Certificate"
      description="Manage certificates. File uploads will use cloud storage in a later milestone."
      initialItems={certificates}
      searchText={(c) => c.title}
      columns={[
        {
          key: "title",
          header: "Title",
          render: (c) => (
            <span className="flex items-center gap-2 font-medium">
              {c.documentType === "pdf" ? (
                <FileText className="size-4 text-muted-foreground" aria-label="PDF" />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" aria-label="Image" />
              )}
              {c.title}
            </span>
          ),
        },
        { key: "issuer", header: "Issuer", className: "hidden md:table-cell", render: (c) => c.issuer },
        { key: "date", header: "Date", className: "hidden sm:table-cell", render: (c) => c.date },
        { key: "status", header: "Status", className: "hidden lg:table-cell", render: (c) => <StatusBadge status={c.status} /> },
      ]}
      fields={[
        { name: "title", label: "Title" },
        { name: "issuer", label: "Issuer" },
        { name: "date", label: "Date issued" },
        { name: "credentialUrl", label: "Credential URL", type: "url", hint: "Optional. Document upload comes with storage integration." },
      ]}
      toForm={(c) => ({ title: c.title, issuer: c.issuer, date: c.date, credentialUrl: c.credentialUrl ?? "" })}
      fromForm={(v, ex) => ({
        id: ex?.id ?? newId("cert"),
        title: v("title").trim(),
        issuer: v("issuer").trim() || "Issuer to be added",
        date: v("date").trim() || "Date TBA",
        credentialUrl: v("credentialUrl").trim() || undefined,
        documentType: ex?.documentType ?? "image",
        status: ex?.status ?? "placeholder",
      })}
    />
  ),
});

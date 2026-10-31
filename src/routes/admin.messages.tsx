import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/site/EmptyState";
import { mockMessages, type MockMessage } from "@/data/admin";

export const Route = createFileRoute("/admin/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const [items, setItems] = useState<MockMessage[]>(mockMessages);

  const toggle = (id: string) => setItems((prev) => prev.map((m) => (m.id === id ? { ...m, read: !m.read } : m)));
  const remove = (id: string) => {
    setItems((prev) => prev.filter((m) => m.id !== id));
    toast("Message removed locally", { description: "Prototype only." });
  };

  return (
    <>
      <AdminPageHeader
        title="Messages"
        description="Contact form submissions will appear here once the form is connected. Rows below are samples."
      />
      {items.length === 0 ? (
        <EmptyState icon={Mail} title="Inbox is empty" description="New messages from the contact form will show up here." />
      ) : (
        <div className="card-surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className={m.read ? "font-medium" : "font-semibold"}>{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{m.subject}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {m.read ? <Badge variant="outline">Read</Badge> : <Badge variant="secondary">Unread</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggle(m.id)}
                        aria-label={m.read ? `Mark message from ${m.name} as unread` : `Mark message from ${m.name} as read`}
                      >
                        {m.read ? <Mail /> : <MailOpen />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => remove(m.id)}
                        aria-label={`Delete message from ${m.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader } from "./AdminPageHeader";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

export interface Field {
  name: string;
  label: string;
  type?: "text" | "textarea" | "tags" | "date" | "url";
  placeholder?: string;
  hint?: string;
}

type FormValues = Record<string, string>;

interface ResourceManagerProps<T extends { id: string }> {
  title: string;
  singular: string;
  description: string;
  initialItems: T[];
  columns: Column<T>[];
  fields: Field[];
  /** Searchable text for an item. */
  searchText: (item: T) => string;
  toForm: (item: T) => FormValues;
  fromForm: (values: FormValues, existing?: T) => T;
}

/**
 * Generic CRUD-style management screen used by every admin content page.
 * State lives in memory only — nothing is persisted until the backend exists.
 */
export function ResourceManager<T extends { id: string }>({
  title,
  singular,
  description,
  initialItems,
  columns,
  fields,
  searchText,
  toForm,
  fromForm,
}: ResourceManagerProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<T | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<FormValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toDelete, setToDelete] = useState<T | null>(null);

  const filtered = useMemo(
    () => items.filter((i) => searchText(i).toLowerCase().includes(query.trim().toLowerCase())),
    [items, query, searchText],
  );

  const emptyForm = () => Object.fromEntries(fields.map((f) => [f.name, ""]));

  const openCreate = () => {
    setEditing(null);
    setValues(emptyForm());
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (item: T) => {
    setEditing(item);
    setValues({ ...emptyForm(), ...toForm(item) });
    setErrors({});
    setFormOpen(true);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const first = fields[0];
    if (!values[first.name]?.trim()) {
      setErrors({ [first.name]: `${first.label} is required.` });
      return;
    }
    const next = fromForm(values, editing ?? undefined);
    setItems((prev) => (editing ? prev.map((i) => (i.id === editing.id ? next : i)) : [next, ...prev]));
    setFormOpen(false);
    toast.success(`${singular} ${editing ? "updated" : "added"} locally`, {
      description: "Prototype only — this change disappears on reload.",
    });
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setItems((prev) => prev.filter((i) => i.id !== toDelete.id));
    toast(`${singular} removed locally`, { description: "Prototype only — nothing was deleted from storage." });
    setToDelete(null);
  };

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        action={
          <Button onClick={openCreate}>
            <Plus /> Add {singular.toLowerCase()}
          </Button>
        }
      />

      <div className="card-surface overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              aria-label={`Search ${title.toLowerCase()}`}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {items.length} {items.length === 1 ? "entry" : "entries"} · mock data
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="grid size-12 place-items-center rounded-xl bg-secondary text-primary">
              <Inbox className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold">{items.length === 0 ? `No ${title.toLowerCase()} yet` : "No matches"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length === 0 ? `Add your first ${singular.toLowerCase()} to get started.` : "Try a different search."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.className}>
                    {c.header}
                  </TableHead>
                ))}
                <TableHead className="w-24 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render(item)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(item)} aria-label={`Edit ${searchText(item)}`}>
                        <Pencil />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setToDelete(item)}
                        aria-label={`Delete ${searchText(item)}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit" : "Add"} {singular.toLowerCase()}
              </DialogTitle>
              <DialogDescription>Prototype form — values stay in this browser tab only.</DialogDescription>
            </DialogHeader>
            <div className="my-5 space-y-4">
              {fields.map((f) => {
                const id = `field-${f.name}`;
                const err = errors[f.name];
                const common = {
                  id,
                  value: values[f.name] ?? "",
                  placeholder: f.placeholder,
                  "aria-invalid": err ? true : undefined,
                  "aria-describedby": err ? `${id}-error` : f.hint ? `${id}-hint` : undefined,
                  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    setValues((v) => ({ ...v, [f.name]: e.target.value })),
                };
                return (
                  <div key={f.name} className="space-y-1.5">
                    <Label htmlFor={id}>{f.label}</Label>
                    {f.type === "textarea" ? (
                      <Textarea rows={4} maxLength={2000} {...common} />
                    ) : (
                      <Input type={f.type === "url" ? "url" : "text"} maxLength={300} {...common} />
                    )}
                    {f.hint && !err && (
                      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
                        {f.hint}
                      </p>
                    )}
                    {err && (
                      <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
                        {err}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editing ? "Save changes" : `Add ${singular.toLowerCase()}`}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {singular.toLowerCase()}?</AlertDialogTitle>
            <AlertDialogDescription>
              In this prototype it is only removed from the current view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const splitTags = (s: string) =>
  s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

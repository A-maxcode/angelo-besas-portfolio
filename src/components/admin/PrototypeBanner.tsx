import { FlaskConical } from "lucide-react";

export function PrototypeBanner() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 border-b border-warning/40 bg-warning-soft px-4 py-2 text-xs text-warning-foreground md:items-center md:px-6"
    >
      <FlaskConical className="mt-0.5 size-3.5 shrink-0 md:mt-0" aria-hidden="true" />
      <p>
        <strong className="font-semibold">UI prototype.</strong> No sign-in or access control exists yet, and changes
        are not saved. Backend, authentication, and security rules arrive in a later milestone.
      </p>
    </div>
  );
}

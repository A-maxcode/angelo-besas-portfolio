import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Monogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 place-items-center rounded-lg bg-gradient-brand font-mono text-sm font-bold text-primary-foreground",
        className,
      )}
    >
      AB
    </span>
  );
}

export function Logo({ to = "/" as const }: { to?: "/" | "/admin" }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2.5 rounded-lg text-navy-foreground"
      aria-label="Angelo Besas — home"
    >
      <Monogram />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tracking-tight">Angelo Besas</span>
        <span className="font-mono text-[0.65rem] text-navy-muted">young.it</span>
      </span>
    </Link>
  );
}

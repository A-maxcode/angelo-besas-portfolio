import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Monogram({ className }: { className?: string }) {
  return (
    <img
      src="/profile.jpg"          
      alt="Angelo Besas"
      className={cn(
        "size-9 rounded-lg object-cover ring-1 ring-navy-border",
        className,
      )}
    />
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

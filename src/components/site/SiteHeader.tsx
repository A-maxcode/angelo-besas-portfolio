import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { publicNav } from "./nav-items";

const linkBase =
  "rounded-md px-3 py-2 text-sm font-medium text-navy-muted transition-colors hover:text-navy-foreground";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-border bg-navy/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {publicNav.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={linkBase}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-navy-foreground bg-navy-foreground/10" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <Button asChild size="sm" variant="hero">
            <Link to="/contact">Get in touch</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="navGhost" className="lg:hidden" aria-label="Open navigation menu">
              <Menu />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-xs border-navy-border bg-navy text-navy-foreground">
            <SheetHeader>
              <SheetTitle className="text-left text-navy-foreground">Navigation</SheetTitle>
            </SheetHeader>
            <nav aria-label="Mobile" className="mt-2 px-4">
              <ul className="flex flex-col gap-1">
                {publicNav.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-navy-muted hover:bg-navy-foreground/10 hover:text-navy-foreground"
                      activeOptions={{ exact: item.to === "/" }}
                      activeProps={{ className: "bg-navy-foreground/10 text-navy-foreground" }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

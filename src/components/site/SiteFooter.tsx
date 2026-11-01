import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { publicNav } from "./nav-items";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-muted">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Logo />
        </div>
        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
            {publicNav.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-sm hover:text-navy-foreground">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-navy-border">
        <div className="container-page flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

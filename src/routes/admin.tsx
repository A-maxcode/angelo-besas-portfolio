import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { PrototypeBanner } from "@/components/admin/PrototypeBanner";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/admin")({
  head: () =>
    pageMeta("Admin (UI prototype) — Angelo Besas Portfolio", "Content management UI prototype for the portfolio.", {
      noindex: true,
    }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-card/90 px-4 backdrop-blur md:px-6">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <Badge variant="sample">Prototype</Badge>
            <div className="ml-auto">
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/login">
                  <LogIn /> Sign-in screen
                </Link>
              </Button>
            </div>
          </header>
          <PrototypeBanner />
          <div className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BadgeCheck,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Settings,
  User,
  Wrench,
  ExternalLink,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Monogram } from "@/components/site/Logo";

export const adminNav = [
  {
    label: "Overview",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/profile", label: "Profile", icon: User },
      { to: "/admin/projects", label: "Projects", icon: FolderGit2 },
      { to: "/admin/achievements", label: "Achievements", icon: Award },
      { to: "/admin/certificates", label: "Certificates", icon: BadgeCheck },
      { to: "/admin/skills", label: "Skills", icon: Wrench },
      { to: "/admin/education", label: "Education", icon: GraduationCap },
    ],
  },
  {
    label: "Inbox & system",
    items: [
      { to: "/admin/messages", label: "Messages", icon: Mail },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/admin" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(to));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1 py-1.5">
          <Monogram className="size-8 shrink-0" />
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-accent-foreground">Portfolio CMS</p>
              <p className="font-mono text-[0.65rem] text-sidebar-foreground/70">UI prototype</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {adminNav.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-foreground/60">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                      <Link to={item.to} onClick={() => setOpenMobile(false)}>
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View public site">
              <Link to="/">
                <ExternalLink aria-hidden="true" />
                <span>View public site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

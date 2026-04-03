"use client";

import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { 
  LucideGlobe, 
  LucideLogOut, 
  LucideActivity, 
  LucideAlertOctagon, 
  LucideSettings, 
  PanelLeft, 
  LucideCalendar,
  LucideRadar
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const monitoringItems = [
  { label: "Dashboard", href: "/dashboard", icon: LucideGlobe },
  { label: "Status Pages", href: "/statuspages", icon: LucideActivity },
  { label: "Incidents", href: "/incidents", icon: LucideAlertOctagon },
];

const managementItems = [
  { label: "On-Call Schedule", href: "/on-call-schedule", icon: LucideCalendar },
  { label: "Settings", href: "/settings", icon: LucideSettings },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/settings") return pathname.startsWith("/settings");
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId");

    try {
      if (token) {
        await fetch(process.env.NEXT_PUBLIC_API_URL + "/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId: sessionId || undefined }),
        });
      }
    } catch (error) {
      // ignore best-effort failure
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      router.push("/signin");
    }
  };

  const renderNavItem = (item: { label: string; href: string; icon: any }) => {
    const active = isActive(item.href);
    return (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton asChild tooltip={item.label}>
          <Link
            href={item.href}
            className={cn(
              "relative transition-colors",
              active && "text-primary font-semibold"
            )}
          >
            {/* Active indicator bar */}
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-[13px] w-[3px] h-4 rounded-r-full bg-primary group-data-[collapsible=icon]:-ml-[9px]" />
            )}
            <item.icon className={cn("h-4 w-4", active && "text-primary")} />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-[57px] justify-center border-b border-sidebar-border !p-0">
        <div className="flex w-full items-center justify-between px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          
          {/* Expanded State Content */}
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <LucideRadar className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">Observiq</span>
          </div>
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden text-muted-foreground transition-colors"
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>

          {/* Collapsed State Content */}
          <div 
            onClick={toggleSidebar}
            className="hidden group-data-[collapsible=icon]:flex group/toggle h-8 w-8 cursor-pointer items-center justify-center relative rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary absolute transition-all duration-200 group-hover/toggle:opacity-0 group-hover/toggle:scale-75">
              <LucideRadar className="h-4 w-4 text-primary-foreground" />
            </div>
            <PanelLeft className="absolute h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all duration-200 group-hover/toggle:opacity-100 group-hover/toggle:scale-100 scale-75" />
          </div>

        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-4 mb-1">
            Monitoring
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {monitoringItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-4 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map(renderNavItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:!pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="text-muted-foreground hover:text-destructive transition-colors"
              tooltip="Logout"
            >
              <LucideLogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

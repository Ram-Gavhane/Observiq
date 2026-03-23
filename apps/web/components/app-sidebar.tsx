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
import { LucideGlobe, LucideLogOut, LucideActivity, LucideAlertOctagon, LucideSettings, PanelLeft, LucideCalendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/signin");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 py-4">
        <div className="flex items-center justify-between px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
          
          {/* Expanded State Content */}
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight group-data-[collapsible=icon]:hidden">
            <img src="/icon.svg" alt="Observiq" className="h-6 w-6 shrink-0" />
          </div>
          
          <button 
            onClick={toggleSidebar}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-md hover:bg-sidebar-accent group-data-[collapsible=icon]:hidden text-muted-foreground transition-colors"
          >
            <PanelLeft className="h-5 w-5" />
          </button>

          {/* Collapsed State Content */}
          <div 
            onClick={toggleSidebar}
            className="hidden group-data-[collapsible=icon]:flex group/toggle h-8 w-8 cursor-pointer items-center justify-center relative rounded-md hover:bg-sidebar-accent transition-colors"
          >
            <img src="/icon.svg" alt="Observiq" className="absolute h-6 w-6 transition-all duration-200 group-hover/toggle:opacity-0 group-hover/toggle:scale-75" />
            <PanelLeft className="absolute h-5 w-5 text-muted-foreground opacity-0 transition-all duration-200 group-hover/toggle:opacity-100 group-hover/toggle:scale-100 scale-75" />
          </div>

        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard">
                  <Link href="/dashboard">
                    <LucideGlobe className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Status Pages">
                  <Link href="/statuspages">
                  <LucideActivity className="h-4 w-4" />
                    <span>Status Pages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Incidents">
                  <Link href="/incidents">
                  <LucideAlertOctagon className="h-4 w-4" />
                    <span>Incidents</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="On-Call Schedule">
                  <Link href="/on-call-schedule">
                  <LucideCalendar className="h-4 w-4" />
                    <span>On-Call Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <Link href="/settings/notifications">
                  <LucideSettings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50 p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:!pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              className="text-muted-foreground hover:text-foreground"
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

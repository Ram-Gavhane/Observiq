"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LucideUser, 
  LucideLock, 
  LucideBell, 
  LucideUsers 
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    category: "Account",
    items: [
      { label: "Account Settings", href: "/settings/account", icon: LucideUser },
      { label: "Security", href: "/settings/security", icon: LucideLock },
      { label: "Alerts", href: "/settings/notifications", icon: LucideBell },
    ]
  },
  {
    category: "Organization",
    items: [
      { label: "Teams", href: "/settings/teams", icon: LucideUsers },
    ]
  }
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1200px] flex min-h-[calc(100vh-120px)] w-full gap-8">
      {/* Settings Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col gap-6">
        <h2 className="text-lg font-bold tracking-tight">Settings</h2>
        
        <nav className="flex flex-col gap-6">
          {sidebarItems.map((group) => (
            <div key={group.category} className="flex flex-col gap-1.5">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 px-3 mb-0.5">
                {group.category}
              </h3>
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
                        )}
                        <item.icon className={cn("h-4 w-4", isActive && "text-primary")} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 min-w-0">
        <div className="h-full rounded-xl border border-border bg-card p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

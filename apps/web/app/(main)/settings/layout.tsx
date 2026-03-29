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
      { label: "Account settings", href: "/settings/account", icon: LucideUser },
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
    <div className="flex min-h-[calc(100vh-120px)] w-full gap-8">
      {/* Settings Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight mb-6">Settings</h2>
          
          <nav className="flex flex-col gap-8">
            {sidebarItems.map((group) => (
              <div key={group.category} className="flex flex-col gap-2">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 px-3">
                  {group.category}
                </h3>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                            isActive 
                              ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
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
        </div>
      </aside>

      {/* Main Settings Content */}
      <main className="flex-1 min-w-0">
        <div className="h-full rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-8 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}

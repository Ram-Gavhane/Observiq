"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LucideLogOut, User, LucideChevronRight, LucideRadar } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/statuspages": "Status Pages",
  "/incidents": "Incidents",
  "/on-call-schedule": "On-Call Schedule",
  "/settings": "Settings",
  "/settings/account": "Account",
  "/settings/security": "Security",
  "/settings/notifications": "Alerts",
  "/settings/teams": "Teams",
  "/profile": "Profile",
};

function getBreadcrumbs(pathname: string) {
  // Handle monitor detail pages
  if (pathname.startsWith("/dashboard/monitor/")) {
    return [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Monitor Details", href: pathname },
    ];
  }
  // Handle settings sub-pages
  if (pathname.startsWith("/settings/")) {
    const settingsPage = pageNames[pathname] || pathname.split("/").pop() || "";
    return [
      { label: "Settings", href: "/settings" },
      { label: settingsPage, href: pathname },
    ];
  }
  // Default: single page
  const label = pageNames[pathname] || "Dashboard";
  return [{ label, href: pathname }];
}

export function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const breadcrumbs = getBreadcrumbs(pathname);

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
      // best effort, still clear local state
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      router.push("/signin");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="h-[57px] flex items-center border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex w-full items-center justify-between px-6">
        {/* Left: Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-sm min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <LucideChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
              )}
              {i === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-foreground truncate">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Right: User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold transition-all hover:bg-primary/20",
              isDropdownOpen && "ring-2 ring-primary/30"
            )}
          >
            <User className="h-4 w-4" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-popover border border-border py-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-accent transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </Link>
              <div className="mx-3 my-1 border-t border-border/50" />
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-colors text-left"
              >
                <LucideLogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

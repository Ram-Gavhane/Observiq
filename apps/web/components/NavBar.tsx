"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LucideLogOut, UserCircle, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function NavBar() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span>Observiq</span>
          </Link>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity focus:outline-none"
          >
            <UserCircle className="h-6 w-6" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-background border border-border py-1 z-50">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm opacity-80 hover:opacity-100 hover:bg-muted transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-red-500 opacity-80 hover:opacity-100 hover:bg-muted transition-colors text-left"
              >
                <LucideLogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

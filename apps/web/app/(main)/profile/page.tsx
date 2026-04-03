"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LucideLoader2,
  LucideGlobe,
  LucideBell,
  LucideActivity,
  LucideSettings,
  LucideArrowRight,
  LucideShield,
  LucideClock,
  LucideLogOut,
  LucideChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  _count: {
    monitors: number;
    notificationChannels: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data.user);
    } catch (err: unknown) {
      toast.error("Failed to fetch profile details");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    const sessionId = localStorage.getItem("sessionId");

    try {
      if (token) {
        await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/logout",
          { sessionId: sessionId || undefined },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      toast.error("Could not notify server about logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      router.push("/signin");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LucideLoader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : "U";

  const stats = [
    {
      label: "Active Monitors",
      value: profile?._count.monitors ?? 0,
      icon: LucideGlobe,
    },
    {
      label: "Alert Channels",
      value: profile?._count.notificationChannels ?? 0,
      icon: LucideBell,
    },
    {
      label: "Avg. Uptime",
      value: "99.98%",
      icon: LucideActivity,
    },
  ];

  const menuItems = [
    {
      label: "Account Settings",
      desc: "Manage your personal information",
      icon: LucideSettings,
      href: "/settings/account",
    },
    {
      label: "Security",
      desc: "Password and two-factor authentication",
      icon: LucideShield,
      href: "/settings/security",
    },
    {
      label: "Notification Preferences",
      desc: "Configure how you receive alerts",
      icon: LucideBell,
      href: "/settings/account",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <span className="text-xl font-semibold tracking-tight">{initials}</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {profile?.firstName} {profile?.lastName}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>

        <span className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
          {profile?.role}
        </span>
      </div>

      {/* Stats */}
      <div className="mt-10 grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-card">
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1 py-5 px-3">
            <stat.icon className="mb-1.5 h-4 w-4 text-muted-foreground/60" />
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
              {stat.value}
            </span>
            <span className="text-[11px] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Settings
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border">
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={() => router.push(item.href)}
              className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-accent/30"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <LucideChevronRight className="h-4 w-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Go to Dashboard */}
      <div className="mt-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.99]"
        >
          Go to Dashboard
          <LucideArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Account Info Footer */}
      <div className="mt-10 space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <LucideClock className="h-4 w-4 text-muted-foreground/50" />
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-sm font-medium text-foreground">March 2026</p>
            </div>
          </div>
          <code className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            {profile?.id?.slice(0, 8)}…
          </code>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
        >
          <LucideLogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

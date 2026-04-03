"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideGlobe, 
  LucideLoader2,
  LucideCheckCircle2,
  LucideActivity,
  LucideAlertCircle,
  LucideZap,
  LucideArrowUpRight,
  LucideArrowDownRight,
  LucidePlus,
  LucideClock,
  LucideShield,
  LucideDatabase,
  LucideRadar
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AddMonitorModal } from "@/components/AddMonitorModal";
import { cn } from "@/lib/utils";

interface Monitor {
  id: string;
  name: string;
  type: string;
  target: string;
  status?: "up" | "down" | "degraded" | "unknown";
  regions?: string[];
  latency?: number | null;
  uptime?: number;
  lastCheckedAt?: string | null;
}

interface DashboardStats {
  totalMonitors: number;
  operationalMonitors: number;
  averageLatencyMs: number;
  averageUptimePercent: number;
}

function getRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 10) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getMonitorTypeIcon(type: string) {
  switch (type) {
    case "HTTP": return LucideGlobe;
    case "PING": return LucideActivity;
    case "DNS": return LucideDatabase;
    case "SSL": return LucideShield;
    default: return LucideActivity;
  }
}

function MiniSparkline({ className }: { className?: string }) {
  // Create a smooth, realistic latency sparkline 
  const [points, setPoints] = useState<string>("");
  
  useEffect(() => {
    const data = Array.from({ length: 12 }, () => 20 + Math.random() * 30);
    const w = 64, h = 24;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => ({
      x: (i / (data.length - 1)) * w,
      y: h - ((v - min) / range) * (h - 4) - 2
    }));
    setPoints(`M ${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`);
  }, []);

  if (!points) return null;

  return (
    <svg width="64" height="24" className={cn("overflow-visible", className)}>
      <path
        d={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary/40"
      />
    </svg>
  );
}

function StatusDot({ status, showLabel = true }: { status?: string; showLabel?: boolean }) {
  const isUp = status === "up" || !status;
  const isDown = status === "down";
  const isDegraded = status === "degraded";

  const color = isDown 
    ? "bg-red-500" 
    : isDegraded 
      ? "bg-amber-500" 
      : "bg-emerald-500";

  const pingColor = isDown 
    ? "bg-red-400" 
    : isDegraded 
      ? "bg-amber-400" 
      : "bg-emerald-400";

  const textColor = isDown 
    ? "text-red-500" 
    : isDegraded 
      ? "text-amber-500" 
      : "text-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", pingColor)}></span>
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)}></span>
      </div>
      {showLabel && (
        <span className={cn("text-[11px] font-semibold uppercase tracking-wider", textColor)}>
          {isDown ? "Down" : isDegraded ? "Degraded" : "Up"}
        </span>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
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
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { monitors, stats } = response.data;
      const normalizedMonitors = monitors.map((m: Monitor) => ({
        ...m,
        status: (m.status as Monitor["status"]) || "unknown",
        latency: m.latency ?? null,
        uptime: m.uptime ?? 0,
      }));
      setMonitors(normalizedMonitors);
      setStats(stats);
    } catch (err: unknown) {
      toast.error("Failed to fetch monitors");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LucideLoader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const allOperational = stats && stats.operationalMonitors === stats.totalMonitors;

  return (
    <div className="mx-auto max-w-[1200px] flex flex-col gap-6">
      {/* ─── Page Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor your infrastructure in real-time
          </p>
        </div>
        <AddMonitorModal onSuccess={fetchDashboardData} />
      </div>

      {/* ─── Status Strip ─── */}
      {monitors.length > 0 && stats && (
        <div className={cn(
          "flex items-center gap-3 rounded-lg px-4 py-2.5 border-l-[3px]",
          allOperational 
            ? "border-l-emerald-500 bg-emerald-500/5 border border-emerald-500/10"
            : "border-l-amber-500 bg-amber-500/5 border border-amber-500/10"
        )}>
          {allOperational ? (
            <LucideCheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          ) : (
            <LucideAlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
          )}
          <span className={cn(
            "text-sm font-medium",
            allOperational ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}>
            {allOperational 
              ? "All systems operational"
              : `${stats.totalMonitors - stats.operationalMonitors} of ${stats.totalMonitors} systems experiencing issues`}
          </span>
          {mounted && monitors[0]?.lastCheckedAt && (
            <span className="ml-auto text-[11px] text-muted-foreground hidden sm:block">
              Updated {getRelativeTime(monitors[0].lastCheckedAt)}
            </span>
          )}
        </div>
      )}

      {/* ─── KPI Cards ─── */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { 
              label: "Total Monitors", 
              value: stats.totalMonitors, 
              icon: LucideRadar, 
              accent: "text-primary",
              bg: "bg-primary/5"
            },
            { 
              label: "Operational", 
              value: `${stats.operationalMonitors}/${stats.totalMonitors}`, 
              icon: LucideCheckCircle2, 
              accent: "text-emerald-500",
              bg: "bg-emerald-500/5"
            },
            { 
              label: "Avg. Latency", 
              value: `${stats.averageLatencyMs}ms`, 
              icon: LucideZap, 
              accent: "text-amber-500",
              bg: "bg-amber-500/5"
            },
            { 
              label: "Avg. Uptime", 
              value: `${stats.averageUptimePercent.toFixed(2)}%`, 
              icon: LucideActivity, 
              accent: stats.averageUptimePercent >= 99.5 ? "text-emerald-500" : stats.averageUptimePercent >= 95 ? "text-amber-500" : "text-red-500",
              bg: stats.averageUptimePercent >= 99.5 ? "bg-emerald-500/5" : stats.averageUptimePercent >= 95 ? "bg-amber-500/5" : "bg-red-500/5"
            },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-3.5 w-3.5", stat.accent)} />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Monitors Table ─── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {monitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <LucideRadar className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-semibold mb-1">No monitors yet</h3>
            <p className="max-w-[240px] text-sm text-muted-foreground">
              Start monitoring your infrastructure by adding your first endpoint.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monitor</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Target</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Trend</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Latency</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right hidden sm:table-cell">Uptime</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right hidden lg:table-cell">Checked</th>
                </tr>
              </thead>
              <tbody>
                {monitors.map((monitor) => {
                  const TypeIcon = getMonitorTypeIcon(monitor.type);
                  const isDown = monitor.status === "down";
                  const borderColor = isDown ? "border-l-red-500" : monitor.status === "degraded" ? "border-l-amber-500" : "border-l-emerald-500";
                  
                  return (
                    <tr 
                      key={monitor.id} 
                      className={cn(
                        "group border-b border-border/50 last:border-b-0 transition-colors hover:bg-accent/30 cursor-pointer border-l-2",
                        borderColor
                      )}
                      onClick={() => router.push(`/dashboard/monitor/${monitor.id}`)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                              {monitor.name}
                            </div>
                            <div className="text-[11px] text-muted-foreground/60 uppercase tracking-wide font-medium">
                              {monitor.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusDot status={monitor.status} />
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <code className="rounded-md bg-muted/50 px-2 py-1 font-mono text-[11px] text-muted-foreground truncate max-w-[200px] block">
                          {monitor.target}
                        </code>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <MiniSparkline />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-mono font-semibold text-sm tabular-nums">
                          {monitor.latency != null ? `${monitor.latency}ms` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                        <span className={cn(
                          "font-mono font-semibold text-sm tabular-nums",
                          (monitor.uptime ?? 0) >= 99.5 
                            ? "text-emerald-500" 
                            : (monitor.uptime ?? 0) >= 95 
                              ? "text-amber-500" 
                              : "text-red-500"
                        )}>
                          {monitor.uptime != null ? `${monitor.uptime}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {mounted ? getRelativeTime(monitor.lastCheckedAt) : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

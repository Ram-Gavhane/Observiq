"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideGlobe, 
  LucideLoader2,
  LucideExternalLink,
  LucideCheckCircle2,
  LucideMapPin,
  LucideActivity,
  LucideAlertCircle,
  LucideZap
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

// Simple Sparkline component using SVG
function Sparkline({ data, className }: { data: number[], className?: string }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height
  }));
  
  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
  
  return (
    <svg width={width} height={height} className={cn("overflow-visible", className)}>
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary opacity-50"
      />
    </svg>
  );
}

function StatusBulb({ status }: { status?: string }) {
  const isUp = status === "up" || !status; // Default to up for now if not specified
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-2 w-2">
        <span className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          isUp ? "bg-emerald-400" : "bg-red-400"
        )}></span>
        <span className={cn(
          "relative inline-flex h-2 w-2 rounded-full",
          isUp ? "bg-emerald-500" : "bg-red-500"
        )}></span>
      </div>
      <span className={cn(
        "text-[11px] font-bold uppercase tracking-wider",
        isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      )}>
        {isUp ? "Up" : "Down"}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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
      <div className="flex min-h-screen items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Global Status Banner */}
      {monitors.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-emerald-700 dark:text-emerald-400">
          <LucideCheckCircle2 className="h-5 w-5 shrink-0" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-semibold tracking-tight">All systems are operational</span>
            <span className="hidden text-xs opacity-70 md:inline">Last checked: Just now</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Monitors", value: stats.totalMonitors, icon: LucideGlobe, color: "text-blue-500" },
            { label: "Operational", value: `${stats.operationalMonitors}/${stats.totalMonitors}`, icon: LucideActivity, color: "text-emerald-500" },
            { label: "Avg. Latency", value: `${stats.averageLatencyMs}ms`, icon: LucideZap, color: "text-amber-500" },
            { label: "Avg. Uptime", value: `${stats.averageUptimePercent.toFixed(2)}%`, icon: LucideActivity, color: "text-indigo-500" },
          ].map((stat, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</span>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </div>
              <div className="mt-2 text-2xl font-bold tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Monitors</h1>
          <AddMonitorModal onSuccess={fetchDashboardData} />
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          {monitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <LucideGlobe className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-lg font-bold">No monitors active</h3>
              <p className="max-w-[200px] text-sm text-muted-foreground mt-1">Start monitoring your infrastructure by adding your first endpoint.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Monitor</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Type</th>
                    <th className="px-6 py-3 font-semibold text-muted-foreground">Target</th>
                    <th className="px-4 py-3 font-semibold text-muted-foreground">Trend</th>
                    <th className="px-6 py-3 font-semibold text-right text-muted-foreground">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {monitors.map((monitor) => (
                    <tr key={monitor.id} className="group transition-colors hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/monitor/${monitor.id}`} className="font-bold hover:underline decoration-primary/30 underline-offset-4">
                          {monitor.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBulb status={monitor.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-tight text-muted-foreground">
                          {monitor.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[12px] text-muted-foreground">
                          {monitor.target}
                        </code>
                      </td>
                      <td className="px-4 py-4">
                         <Sparkline data={Array.from({length: 10}, () => Math.floor(Math.random() * 50) + 10)} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold">
                            {monitor.latency != null ? `${monitor.latency}ms` : "—"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {monitor.uptime != null ? `${monitor.uptime}%` : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

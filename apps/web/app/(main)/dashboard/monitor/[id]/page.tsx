"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft, 
  LucideClock, 
  LucideMapPin,
  LucideCheckCircle2,
  LucideXCircle,
  LucideLoader2, 
  LucideTrash2,
  LucideAlertTriangle,
  LucideShield,
  LucidePauseCircle,
  LucideSettings,
  LucideActivity,
  LucideGlobe,
  LucideDatabase,
  LucideCalendar,
  LucideLock,
  LucideBell,
  LucideExternalLink
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { MonitorTypeDetails } from "@/components/MonitorTypeDetails";

interface Tick {
  id: string;
  status: string;
  durationMs: number;
  region: string;
  createdAt: string;
  details?: any;
}

interface Monitor {
  id: string;
  name: string;
  type: string;
  target: string;
  createdAt: string;
  config: any;
  _count?: {
    alerts: number;
  };
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

export default function MonitorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [insights, setInsights] = useState<{uptime24h: string, uptime7d: string, responseTimeTrends: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchDetails();
    
    const interval = setInterval(fetchDetails, 60 * 1000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const [monitorRes, ticksRes, insightsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitor/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitor/${id}/checks`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/monitor/${id}/insights`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setMonitor(monitorRes.data.monitor);
      setTicks(ticksRes.data.checks);
      setInsights(insightsRes.data);
    } catch (err: unknown) {
      toast.error("Failed to fetch monitor details");
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/monitor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete monitor");
      setDeleting(false);
    }
  };

  const handleDelete = () => {
    toast("Delete Monitor", {
      position: "top-center",
      description: "Are you sure? This action cannot be undone.",
      duration: 6000,
      classNames: {
        toast: "bg-background/95 backdrop-blur-xl border border-border shadow-lg rounded-xl p-4 gap-2",
        title: "text-sm font-semibold text-foreground",
        description: "text-xs text-muted-foreground mt-0.5",
        actionButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ml-auto",
        cancelButton: "bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors mr-2",
      },
      action: { label: "Delete", onClick: executeDelete },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LucideLoader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs text-muted-foreground">Loading monitor...</span>
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">Monitor not found</p>
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const getTypeIcon = () => {
    switch(monitor.type) {
      case "HTTP": return LucideGlobe;
      case "PING": return LucideActivity;
      case "DNS": return LucideDatabase;
      case "SSL": return LucideShield;
      default: return LucideActivity;
    }
  };
  const TypeIcon = getTypeIcon();
  const latestStatus = ticks[0]?.status;
  const isUp = latestStatus === "UP";

  return (
    <main className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-6">
        {/* ─── Back + Header ─── */}
        <div className="flex flex-col gap-4">
          <Link 
            href="/dashboard" 
            className="group flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LucideArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Dashboard
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                isUp ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"
              )}>
                <TypeIcon className={cn("h-5 w-5", isUp ? "text-emerald-500" : "text-red-500")} />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h1 className="text-2xl font-bold tracking-tight">{monitor.name}</h1>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    isUp 
                      ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" 
                      : "bg-red-500/10 text-red-500 ring-1 ring-red-500/20"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", isUp ? "bg-emerald-500" : "bg-red-500")} />
                    {isUp ? "Healthy" : "Down"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <code className="font-mono text-xs">{monitor.target}</code>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-xs">{monitor.type}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  {mounted && (
                    <span className="text-xs">Created {new Date(monitor.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Action Toolbar ─── */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toast.success("Test alert dispatched for " + monitor.name)} 
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                <LucideBell className="h-3 w-3" />
                Test Alert
              </button>
              <Link 
                href={`/dashboard/monitor/${id}/configure`} 
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                <LucideSettings className="h-3 w-3" />
                Configure
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3 text-xs font-medium text-destructive hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
              >
                {deleting ? <LucideLoader2 className="h-3 w-3 animate-spin" /> : <LucideTrash2 className="h-3 w-3" />}
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* ─── KPI Cards ─── */}
        <div className="grid gap-3 md:grid-cols-3">
          {monitor.type === "SSL" ? (
            <>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LucideShield className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Days to Expiry</span>
                </div>
                <div className={cn(
                  "text-2xl font-bold tabular-nums",
                  (ticks[0]?.details?.daysRemaining ?? 100) < 30 ? "text-destructive" : "text-foreground"
                )}>
                  {ticks[0]?.details?.daysRemaining !== undefined ? `${ticks[0].details.daysRemaining}` : 'N/A'}
                  <span className="text-sm font-normal text-muted-foreground ml-1">days</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LucideLock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Issuer</span>
                </div>
                <div className="text-lg font-bold truncate">
                  {ticks[0]?.details?.issuer?.O || 'Unknown'}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LucideClock className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Avg. Response</span>
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {insights?.responseTimeTrends && insights.responseTimeTrends.length > 0
                    ? `${Math.round(insights.responseTimeTrends.reduce((acc: number, curr: any) => acc + curr.responseTime, 0) / insights.responseTimeTrends.length)}`
                    : '—'}
                  <span className="text-sm font-normal text-muted-foreground ml-0.5">ms</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <LucideActivity className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Current Status</span>
                </div>
                <div className={cn(
                  "text-2xl font-bold",
                  ticks[0]?.status === "UP" ? "text-emerald-500" : "text-destructive"
                )}>
                  {ticks[0]?.status || 'Unknown'}
                </div>
              </div>
            </>
          )}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <LucideAlertTriangle className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Incidents</span>
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {monitor._count?.alerts || 0}
            </div>
          </div>
        </div>

        {/* ─── Uptime Cards ─── */}
        {insights && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Uptime (24h)</span>
                <span className="text-3xl font-bold tracking-tight text-emerald-500 tabular-nums">
                  {insights.uptime24h}%
                </span>
              </div>
              <div className="h-12 w-12 rounded-full border-[3px] border-emerald-500/20 flex items-center justify-center">
                <LucideCheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">Uptime (7 Days)</span>
                <span className="text-3xl font-bold tracking-tight text-emerald-500 tabular-nums">
                  {insights.uptime7d}%
                </span>
              </div>
              <div className="h-12 w-12 rounded-full border-[3px] border-emerald-500/20 flex items-center justify-center">
                <LucideCalendar className="h-5 w-5 text-emerald-500/60" />
              </div>
            </div>
          </div>
        )}

        {/* ─── Response Time Chart ─── */}
        {insights && insights.responseTimeTrends.length > 0 && monitor.type !== "SSL" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold">
                {monitor.type === "PING" ? "Latency Trends" : "Response Time"} 
                <span className="text-muted-foreground font-normal ml-1.5">Last 24h</span>
              </h2>
            </div>
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights.responseTimeTrends}>
                  <defs>
                    <linearGradient id="colorRT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.18 265)" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="oklch(0.55 0.18 265)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.08} vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#888888', fontSize: 11 }}
                    dx={-8}
                    tickFormatter={(value) => `${value}ms`}
                    width={55}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '10px', 
                      border: '1px solid oklch(0.22 0.02 264)', 
                      background: 'oklch(0.16 0.02 264)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      fontSize: '12px'
                    }}
                    labelStyle={{ fontWeight: 600, color: '#aaa', marginBottom: '4px', fontSize: '11px' }}
                    formatter={(value) => [`${value}ms`, monitor.type === "PING" ? 'Latency' : 'Response Time']}
                  />
                  <Area
                    type="monotone"
                    dataKey="responseTime"
                    stroke="oklch(0.60 0.18 265)"
                    strokeWidth={2}
                    fill="url(#colorRT)"
                    dot={false}
                    activeDot={{ r: 5, fill: 'oklch(0.60 0.18 265)', stroke: 'oklch(0.16 0.02 264)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ─── Type-Specific Details ─── */}
        <MonitorTypeDetails monitor={monitor} latestCheck={ticks[0]} />

        {/* ─── Latest Checks Table ─── */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Latest Status Checks</h2>
          </div>
          {ticks.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No checks recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {monitor.type === "SSL" ? "Expiry" : monitor.type === "DNS" ? "Resolution" : "Response"}
                    </th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Region</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {ticks.map((tick) => (
                    <tr key={tick.id} className="border-b border-border/50 last:border-0 transition-colors hover:bg-accent/20">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {tick.status === "UP" ? (
                            <>
                              <LucideCheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="font-semibold text-emerald-500 text-xs">UP</span>
                            </>
                          ) : (
                            <>
                              <LucideXCircle className="h-3.5 w-3.5 text-destructive" />
                              <span className="font-semibold text-destructive text-xs">{tick.status}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="font-mono font-semibold text-xs tabular-nums">
                          {monitor.type === "HTTP" || monitor.type === "PING" ? `${tick.durationMs}ms` : ''}
                          {monitor.type === "SSL" && tick.details?.daysRemaining !== undefined ? `${tick.details.daysRemaining}d left` : ''}
                          {monitor.type === "DNS" && (tick.details?.resolvedIp || tick.details?.responseStatus) ? (tick.details.resolvedIp || tick.details.responseStatus) : ''}
                          {!["HTTP", "PING", "SSL", "DNS"].includes(monitor.type) && '-'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                          <LucideMapPin className="h-3 w-3 opacity-40" />
                          <span className="capitalize">{tick.region}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {mounted ? new Date(tick.createdAt).toLocaleTimeString() : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

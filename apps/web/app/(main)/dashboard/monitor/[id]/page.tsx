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
  LucideLock
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

function formatUptime(dateStr: string) {
  const now = new Date();
  const added = new Date(dateStr);
  const diffMs = now.getTime() - added.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  let result = [];
  if (days > 0) result.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0) result.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0) result.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  return result.length > 0 ? result.join(' ') : 'Just added';
}

function formatLastChecked(dateStr?: string) {
  if (!dateStr) return 'Never';
  const now = new Date();
  const checked = new Date(dateStr);
  const diffSec = Math.floor((now.getTime() - checked.getTime()) / 1000);
  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
}

export default function MonitorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [insights, setInsights] = useState<{uptime24h: string, uptime7d: string, responseTimeTrends: any[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
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
      description: "Are you sure you want to delete this monitor? This action cannot be undone.",
      duration: 6000,
      classNames: {
        toast: "bg-background/80 backdrop-blur-xl border border-border shadow-md rounded-2xl p-4 gap-2",
        title: "text-sm font-semibold text-foreground tracking-tight",
        description: "text-xs text-foreground mt-0.5 leading-relaxed",
        actionButton: "bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ml-auto",
        cancelButton: "bg-secondary/50 text-secondary-foreground hover:bg-secondary text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors mr-2",
      },
      action: {
        label: "Ok",
        onClick: executeDelete,
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
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

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Link 
              href="/dashboard" 
              className="group flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LucideArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-xl">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                    {monitor.type}
                  </span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight truncate max-w-2xl">{monitor.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground truncate max-w-xl">{monitor.target}</p>
                  <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Created {new Date(monitor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 text-sm font-semibold text-destructive transition-all hover:bg-destructive hover:text-white disabled:opacity-50"
              >
                {deleting ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : <LucideTrash2 className="h-4 w-4" />}
                Delete Monitor
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => toast.success("Test alert dispatched for " + monitor.name)} 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LucideAlertTriangle className="h-4 w-4" />
                <span>Send a test alert</span>
              </button>
              <Link href="/incidents" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <LucideShield className="h-4 w-4" />
                <span>Incidents</span>
              </Link>
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <LucidePauseCircle className="h-4 w-4" />
                <span>Pause this monitor</span>
              </button>
              <Link href={`/dashboard/monitor/${id}/configure`} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <LucideSettings className="h-4 w-4" />
                <span>Configure</span>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {monitor.type === "SSL" ? (
                <>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <LucideShield className="h-4 w-4 opacity-50" />
                      Days to Expiry
                    </h3>
                    <div className={cn(
                      "text-xl font-bold",
                      (ticks[0]?.details?.daysRemaining ?? 100) < 30 ? "text-destructive" : ""
                    )}>
                      {ticks[0]?.details?.daysRemaining !== undefined ? `${ticks[0].details.daysRemaining} days` : 'N/A'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <LucideLock className="h-4 w-4 opacity-50" />
                      Issuer
                    </h3>
                    <div className="text-xl font-bold truncate">
                      {ticks[0]?.details?.issuer?.O || 'Unknown'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <LucideClock className="h-4 w-4 opacity-50" />
                      Avg. Response Time
                    </h3>
                    <div className="text-xl font-bold">
                      {insights?.responseTimeTrends && insights.responseTimeTrends.length > 0
                        ? `${Math.round(insights.responseTimeTrends.reduce((acc: number, curr: any) => acc + curr.responseTime, 0) / insights.responseTimeTrends.length)}ms`
                        : '---'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <LucideActivity className="h-4 w-4 opacity-50" />
                      Last Status
                    </h3>
                    <div className={cn(
                      "text-xl font-bold",
                      ticks[0]?.status === "UP" ? "text-emerald-500" : "text-destructive"
                    )}>
                      {ticks[0]?.status || 'Unknown'}
                    </div>
                  </div>
                </>
              )}
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <LucideAlertTriangle className="h-4 w-4 opacity-50" />
                  Total Incidents
                </h3>
                <div className="text-xl font-bold">
                  {monitor._count?.alerts || 0}
                </div>
              </div>
            </div>
          </div>

          {insights && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-center items-center text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Uptime (Last 24h)</h3>
                <div className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {insights.uptime24h}%
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-center items-center text-center">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Uptime (Last 7 Days)</h3>
                <div className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {insights.uptime7d}%
                </div>
              </div>
            </div>
          )}

          {insights && insights.responseTimeTrends.length > 0 && monitor.type !== "SSL" && (
            <div className="grid gap-6">
              <h2 className="text-xl font-bold">
                {monitor.type === "PING" ? "Latency Trends" : "Response Time Trends"} (Last 24h)
              </h2>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-sm h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insights.responseTimeTrends}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888888', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#888888', fontSize: 12 }}
                      dx={-10}
                      tickFormatter={(value) => `${value}ms`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#888888', marginBottom: '4px' }}
                      formatter={(value) => [`${value}ms`, monitor.type === "PING" ? 'Latency' : 'Response Time']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#4f46e5" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#4f46e5', stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Type-Specific Details Section */}
          <MonitorTypeDetails monitor={monitor} latestCheck={ticks[0]} />


          <div className="grid gap-6">
            <h2 className="text-xl font-bold">Latest Status Checks</h2>
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
              {ticks.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground">No checks recorded yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Status</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                          {monitor.type === "SSL" ? "Expiry" : monitor.type === "DNS" ? "Resolution" : "Response"}
                        </th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-center">Region</th>
                        <th className="px-6 py-4 font-bold uppercase tracking-wider text-[10px] text-muted-foreground text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {ticks.map((tick) => (
                        <tr key={tick.id} className="transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {tick.status == "UP" ? (
                                <>
                                  <LucideCheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">{tick.status}</span>
                                </>
                              ) : (
                                <>
                                  <LucideXCircle className="h-4 w-4 text-destructive" />
                                  <span className="font-bold text-destructive tracking-tight">{tick.status}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {monitor.type === "SSL" ? <LucideShield className="h-3.5 w-3.5 opacity-40" /> : <LucideClock className="h-3.5 w-3.5 opacity-40" />}
                              <span className="font-bold tabular-nums text-xs">
                                {monitor.type === "HTTP" || monitor.type === "PING" ? `${tick.durationMs}ms` : ''}
                                {monitor.type === "SSL" && tick.details?.daysRemaining !== undefined ? `${tick.details.daysRemaining}d left` : ''}
                                {monitor.type === "DNS" && (tick.details?.resolvedIp || tick.details?.responseStatus) ? (tick.details.resolvedIp || tick.details.responseStatus) : ''}
                                {!["HTTP", "PING", "SSL", "DNS"].includes(monitor.type) && '-'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <LucideMapPin className="h-4 w-4 opacity-40" />
                              <span className="capitalize font-medium">{tick.region}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-muted-foreground font-medium tabular-nums">
                            {new Date(tick.createdAt).toLocaleTimeString()}
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
      </main>
    </>
  );
}

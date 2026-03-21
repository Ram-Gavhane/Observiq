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
  LucideSettings
} from "lucide-react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Tick {
  id: string;
  status: string;
  responseTimeMs: number;
  region: string;
  createdAt: string;
}

interface Website {
  id: string;
  url: string;
  timeAdded: string;
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

export default function WebsiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [website, setWebsite] = useState<Website | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [insights, setInsights] = useState<{uptime24h: string, uptime7d: string, responseTimeTrends: unknown[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 1 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/website/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const insightsResponse = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/website/${id}/insights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsite(response.data.website);
      setTicks(response.data.latestTicks);
      setInsights(insightsResponse.data);
    } catch (err: unknown) {
      setError("Failed to fetch website details");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this website? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(process.env.NEXT_PUBLIC_API_URL + `/website/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete website");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">{error || "Website not found"}</p>
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

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
                <h1 className="text-3xl font-extrabold tracking-tight truncate max-w-2xl">{website.url}</h1>
                <p className="text-muted-foreground mt-1">Real-time status and historical performance.</p>
              </div>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-destructive/20 bg-destructive/5 px-4 text-sm font-semibold text-destructive transition-all hover:bg-destructive hover:text-white disabled:opacity-50"
              >
                {deleting ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : <LucideTrash2 className="h-4 w-4" />}
                Delete Website
              </button>
            </div>
          </div>

          {/* New ActionBar & Stats */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
              <Link href={`/dashboard/website/${website.id}/configure`} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <LucideSettings className="h-4 w-4" />
                <span>Configure</span>
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Monitor is up for</h3>
                <div className="text-xl font-bold">
                  {website.timeAdded ? formatUptime(website.timeAdded) : 'N/A'}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Last checked</h3>
                <div className="text-xl font-bold">
                  {formatLastChecked(ticks[0]?.createdAt)}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Incidents</h3>
                <div className="text-xl font-bold">
                  {website._count?.alerts || 0}
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

          {insights && insights.responseTimeTrends.length > 0 && (
            <div className="grid gap-6">
              <h2 className="text-xl font-bold">Response Time Trends (Last 24h)</h2>
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
                      formatter={(value) => [`${value}ms`, 'Response Time']}
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
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold">Response Time</th>
                        <th className="px-6 py-4 font-bold">Region</th>
                        <th className="px-6 py-4 font-bold text-right">Time</th>
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
                                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{tick.status}</span>
                                </>
                              ) : (
                                <>
                                  <LucideXCircle className="h-4 w-4 text-destructive" />
                                  <span className="font-semibold text-destructive">{tick.status}</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <LucideClock className="h-4 w-4 opacity-40" />
                              <span className="font-medium">{tick.responseTimeMs}ms</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <LucideMapPin className="h-4 w-4 opacity-40" />
                              <span className="capitalize">{tick.region}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right text-muted-foreground">
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

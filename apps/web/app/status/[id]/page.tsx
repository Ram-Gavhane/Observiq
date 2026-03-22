"use client";

import { useEffect, useState, use } from "react";
import { 
  LucideShieldCheck, 
  LucideClock, 
  LucideMapPin,
  LucideCheckCircle2,
  LucideXCircle,
  LucideLoader2,
  LucideAlertCircle,
  LucideSearch,
  LucideActivity
} from "lucide-react";
import axios from "axios";
import { UptimeBars } from "@/components/UptimeBars";

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
}

interface StatusPage {
  id: string;
  title: string;
  description: string;
  website: Website;
}

export default function PublicStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [statusPage, setStatusPage] = useState<StatusPage | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDetails();
    
    const interval = setInterval(() => {
      fetchDetails();
    }, 3 * 60 * 1000); // refresh every 3 min
    return () => clearInterval(interval);
  }, [id]);

  const fetchDetails = async () => {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/statuspage/${id}`);
      setStatusPage(response.data.statusPage);
      setTicks(response.data.latestTicks);
    } catch (err: any) {
      setError("Unable to load public status at this time.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading status...</p>
        </div>
      </div>
    );
  }

  if (error || !statusPage) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 dark:bg-zinc-950 px-6 text-center">
        <div className="rounded-full bg-destructive/10 p-6">
          <LucideSearch className="h-12 w-12 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Status Page Not Found</h1>
          <p className="text-muted-foreground mt-2 max-w-sm">
            {error || "The status page you are looking for does not exist or has been removed."}
          </p>
        </div>
      </div>
    );
  }

  // Calculate generic uptime based on recent ticks
  const upTicks = ticks.filter(t => t.status === "UP").length;
  const recentUptime = ticks.length > 0 ? Math.round((upTicks / ticks.length) * 100) : 100;

  const isCurrentlyUp = ticks.length > 0 ? ticks[0].status === "UP" : true;

  // Group ticks by region
  const groupedTicks = ticks.reduce((acc, tick) => {
    if (!acc[tick.region]) {
      acc[tick.region] = [];
    }
    acc[tick.region].push({ status: tick.status, createdAt: tick.createdAt });
    return acc;
  }, {} as Record<string, { status: string; createdAt: string }[]>);

  const activeRegions = Object.keys(groupedTicks).sort();

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      {/* Public Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-20 max-w-4xl items-center gap-4 px-6 md:px-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <LucideShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{statusPage.title}</h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{statusPage.description}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:px-8">
        <div className="flex flex-col gap-12">
          
          {/* Big Status Banner */}
          <div className={`flex flex-col items-center justify-center gap-4 rounded-3xl p-10 text-center shadow-sm border ${isCurrentlyUp ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50" : "bg-destructive/5 border-destructive/20"}`}>
            {isCurrentlyUp ? (
              <>
                <div className="rounded-full bg-emerald-100 p-4 dark:bg-emerald-900/50">
                  <LucideCheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-emerald-900 dark:text-emerald-50">All Systems Operational</h2>
                  <p className="mt-2 font-medium text-emerald-700/80 dark:text-emerald-200/60">We are currently not experiencing any issues with {statusPage.website.url}.</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-full bg-destructive/10 p-4">
                  <LucideXCircle className="h-10 w-10 text-destructive" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-destructive">Partial Outage Detected</h2>
                  <p className="mt-2 font-medium text-destructive/80">We are currently experiencing connectivity issues with {statusPage.website.url}.</p>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-6">
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-bold">Region Status</h3>
              <div className="text-sm font-medium">
                Overall Uptime: <span className={recentUptime >= 99 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}>{recentUptime}%</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-sm">
              {activeRegions.length === 0 ? (
                <div className="py-24 text-center">
                  <p className="text-muted-foreground">Monitoring just started. No data available yet.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {activeRegions.map((region, index) => {
                    const regionTicks = groupedTicks[region];
                    const isRegionUp = regionTicks.length > 0 ? regionTicks[0].status === "UP" : true;
                    
                    return (
                      <div 
                        key={region} 
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:px-6 ${index !== activeRegions.length - 1 ? "border-b border-border" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-[150px]">
                          <LucideActivity className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{region}</span>
                        </div>
                        
                        <div className="flex flex-1 items-center justify-between sm:justify-end gap-6 sm:gap-8">
                          <span className={`text-sm font-medium ${isRegionUp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"}`}>
                            {isRegionUp ? "Operational" : "Degraded"}
                          </span>
                          
                          {/* We render exactly 45 bars to fit nicely on mobile/desktop without wrapping visually, or 40. */}
                          <UptimeBars ticks={regionTicks} maxBars={40} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-4xl px-6 py-8 md:px-8 flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-muted-foreground font-medium">Powered by</p>
          <div className="flex items-center gap-2 text-primary font-bold">
            <LucideShieldCheck className="h-4 w-4" />
            Observiq
          </div>
        </div>
      </footer>
    </div>
  );
}

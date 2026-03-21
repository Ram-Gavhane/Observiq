"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { 
  LucideAlertOctagon,
  LucideClock,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideLoader2,
  LucideAlertCircle,
  LucideGlobe
} from "lucide-react";

interface Incident {
  id: string;
  websiteId: string;
  notificationChannelId: string | null;
  status: string; // "triggered" | "escalated" | "resolved"
  alertCount: number;
  escalated: boolean;
  triggeredAt: string;
  resolvedAt: string | null;
  lastAlertedAt: string | null;
  website?: {
    id: string;
    url: string;
  };
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchIncidents();
  }, [router]);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-incidents", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(response.data);
    } catch (err: unknown) {
      setError("Failed to fetch incidents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading incidents...</p>
      </div>
    );
  }

  const getSeverityBadge = (incident: Incident) => {
    if (incident.status === "resolved") {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Resolved
        </span>
      );
    }
    if (incident.escalated) {
      return (
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
          Critical
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
        Major
      </span>
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Incidents</h1>
            <p className="text-muted-foreground mt-1">Track and manage service disruptions.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
            <LucideAlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Incidents Table/Grid */}
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                <LucideCheckCircle2 className="h-8 w-8 text-emerald-500 opacity-80" />
              </div>
              <h3 className="text-lg font-bold">All systems operational</h3>
              <p className="text-muted-foreground mt-1">No incidents have been recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="px-6 py-4 font-bold">Incident</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Severity</th>
                    <th className="px-6 py-4 font-bold">Component</th>
                    <th className="px-6 py-4 font-bold">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incidents.map((incident) => (
                    <tr key={incident.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            {incident.status === 'resolved' ? (
                              <LucideCheckCircle2 className="h-4 w-4 text-emerald-500 rounded-lg" />
                            ) : (
                              <LucideAlertOctagon className="h-4 w-4 text-rose-500 rounded-lg" />
                            )}
                          </div>
                          <span className="font-medium whitespace-nowrap">
                            Incident on {incident.website?.url || 'Unknown System'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 capitalize">
                          {incident.status === 'resolved' && <LucideCheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          {incident.status === 'triggered' && <LucideAlertTriangle className="h-4 w-4 text-orange-500" />}
                          {incident.status === 'escalated' && <LucideAlertTriangle className="h-4 w-4 text-rose-500" />}
                          <span className="font-medium text-muted-foreground">{incident.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getSeverityBadge(incident)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <LucideGlobe className="h-3 w-3" />
                          {incident.website?.url || incident.websiteId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 whitespace-nowrap">
                          <span className="text-muted-foreground">
                            {new Date(incident.triggeredAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                            <LucideClock className="h-3 w-3" />
                            {new Date(incident.triggeredAt).toLocaleTimeString()}
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
    </main>
  );
}

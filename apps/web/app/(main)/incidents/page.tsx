"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { 
  LucideAlertOctagon,
  LucideClock,
  LucideCheckCircle2,
  LucideAlertTriangle,
  LucideLoader2,
  LucideGlobe,
  LucideChevronDown,
  LucideShieldAlert,
  LucideBellRing,
  LucideShieldCheck
} from "lucide-react";

interface Incident {
  id: string;
  websiteId: string;
  notificationChannelId: string | null;
  status: string;
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

interface TimelineEvent {
  id: string;
  alertId: string;
  type: string;
  message: string;
  createdAt: string;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineCache, setTimelineCache] = useState<Record<string, TimelineEvent[]>>({});
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
      toast.error("Failed to fetch incidents");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (incident: Incident) => {
    if (expandedId === incident.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(incident.id);

    if (timelineCache[incident.id]) return;

    setTimelineLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + `/get-incident-timeline/${incident.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTimelineCache((prev) => ({ ...prev, [incident.id]: response.data }));
    } catch {
      toast.error("Failed to load incident timeline");
      setExpandedId(null);
    } finally {
      setTimelineLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "incident_created":
        return <LucideAlertOctagon className="h-4 w-4 text-rose-500" />;
      case "incident_resolved":
        return <LucideShieldCheck className="h-4 w-4 text-emerald-500" />;
      case "alert_escalated":
        return <LucideShieldAlert className="h-4 w-4 text-orange-500" />;
      case "alert_sent":
        return <LucideBellRing className="h-4 w-4 text-blue-500" />;
      default:
        return <LucideClock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventDotColor = (type: string) => {
    switch (type) {
      case "incident_created": return "bg-rose-500";
      case "incident_resolved": return "bg-emerald-500";
      case "alert_escalated": return "bg-orange-500";
      case "alert_sent": return "bg-blue-500";
      default: return "bg-zinc-400";
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
                    <th className="px-6 py-4 font-bold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {incidents.map((incident) => (
                    <Fragment key={incident.id}>
                      <tr
                        key={incident.id}
                        onClick={() => handleRowClick(incident)}
                        className="group cursor-pointer transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                              {incident.status === 'resolved' ? (
                                <LucideCheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <LucideAlertOctagon className="h-4 w-4 text-rose-500" />
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
                        <td className="px-6 py-4">
                          <LucideChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                              expandedId === incident.id ? "rotate-180" : ""
                            }`}
                          />
                        </td>
                      </tr>

                      {/* Timeline Panel */}
                      {expandedId === incident.id && (
                        <tr key={`${incident.id}-timeline`}>
                          <td colSpan={6} className="bg-zinc-50/80 dark:bg-zinc-900/20 px-6 py-6">
                            {timelineLoading && !timelineCache[incident.id] ? (
                              <div className="flex items-center justify-center py-8">
                                <LucideLoader2 className="h-5 w-5 animate-spin text-primary" />
                                <span className="ml-2 text-sm text-muted-foreground">Loading timeline...</span>
                              </div>
                            ) : timelineCache[incident.id]?.length === 0 ? (
                              <div className="flex items-center justify-center py-8">
                                <p className="text-sm text-muted-foreground">No timeline events recorded.</p>
                              </div>
                            ) : (
                              <div className="relative ml-4">
                                {/* Vertical line */}
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border" />

                                <div className="flex flex-col gap-0">
                                  {timelineCache[incident.id]?.map((event, idx) => (
                                    <div key={event.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                                      {/* Dot */}
                                      <div className={`relative z-10 mt-1 h-4 w-4 rounded-full border-2 border-background ${getEventDotColor(event.type)} flex items-center justify-center shrink-0`}>
                                      </div>

                                      {/* Content */}
                                      <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          {getEventIcon(event.type)}
                                          <span className="text-sm font-semibold capitalize">
                                            {event.type.replace(/_/g, " ")}
                                          </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{event.message}</p>
                                        <span className="text-xs text-muted-foreground/60 flex items-center gap-1 mt-0.5">
                                          <LucideClock className="h-3 w-3" />
                                          {new Date(event.createdAt).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

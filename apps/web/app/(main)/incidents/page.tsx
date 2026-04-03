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
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function FormattedDate({ date, formatStr = "PP" }: { date: string | Date | null | undefined, formatStr?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  
  if (!mounted || !date) return <span className="animate-pulse bg-muted rounded w-16 h-3 inline-block" />;
  
  try {
    return <span>{format(new Date(date), formatStr)}</span>;
  } catch {
    return <span>Invalid Date</span>;
  }
}

interface Incident {
  id: string;
  monitorId: string;
  notificationChannelId: string | null;
  status: string;
  alertCount: number;
  escalated: boolean;
  startedAt: string;
  resolvedAt: string | null;
  lastAlertedAt: string | null;
  createdAt: string;
  monitor?: {
    id: string;
    name: string;
    target: string;
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
        return <LucideAlertOctagon className="h-3.5 w-3.5 text-rose-500" />;
      case "incident_resolved":
        return <LucideShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
      case "alert_escalated":
        return <LucideShieldAlert className="h-3.5 w-3.5 text-orange-500" />;
      case "alert_sent":
        return <LucideBellRing className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <LucideClock className="h-3.5 w-3.5 text-muted-foreground" />;
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <LucideLoader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-xs text-muted-foreground">Loading incidents...</p>
      </div>
    );
  }

  const getSeverityBadge = (incident: Incident) => {
    const status = incident.status.toLowerCase();
    if (status === "resolved") {
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
          Resolved
        </span>
      );
    }
    if (incident.escalated) {
      return (
        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-500 ring-1 ring-rose-500/20">
          Critical
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20">
        Major
      </span>
    );
  };

  const activeIncidents = incidents.filter(i => i.status.toLowerCase() !== "resolved");
  const resolvedIncidents = incidents.filter(i => i.status.toLowerCase() === "resolved");

  return (
    <main className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track and manage service disruptions.</p>
          </div>
          {incidents.length > 0 && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                {activeIncidents.length} active
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {resolvedIncidents.length} resolved
              </span>
            </div>
          )}
        </div>

        {/* Incidents Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <LucideCheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="text-base font-semibold mb-1">All systems operational</h3>
              <p className="text-sm text-muted-foreground">No incidents have been recorded.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Incident</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Component</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Started</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => {
                    const isResolved = incident.status.toLowerCase() === 'resolved';
                    const borderColor = isResolved 
                      ? "border-l-emerald-500/40" 
                      : incident.escalated 
                        ? "border-l-rose-500" 
                        : "border-l-orange-500";

                    return (
                      <Fragment key={incident.id}>
                        <tr
                          onClick={() => handleRowClick(incident)}
                          className={cn(
                            "group cursor-pointer transition-colors hover:bg-accent/20 border-b border-border/50 border-l-2",
                            borderColor,
                            isResolved && "opacity-60"
                          )}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                isResolved ? "bg-emerald-500/10" : "bg-rose-500/10"
                              )}>
                                {isResolved ? (
                                  <LucideShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <LucideAlertOctagon className="h-3.5 w-3.5 text-rose-500" />
                                )}
                              </div>
                              <span className="font-medium text-sm">
                                Incident on {incident.monitor?.name || 'Unknown'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 capitalize text-xs font-medium text-muted-foreground">
                              {isResolved && <LucideShieldCheck className="h-3 w-3 text-emerald-500" />}
                              {incident.status.toLowerCase() === 'triggered' && <LucideAlertTriangle className="h-3 w-3 text-orange-500" />}
                              {incident.status.toLowerCase() === 'escalated' && <LucideAlertTriangle className="h-3 w-3 text-rose-500" />}
                              {incident.status.toLowerCase()}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {getSeverityBadge(incident)}
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <LucideGlobe className="h-3 w-3 opacity-40" />
                              {incident.monitor?.name || incident.monitorId}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                <FormattedDate date={incident.startedAt || incident.createdAt} formatStr="MMM d, yyyy" />
                              </span>
                              <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
                                <LucideClock className="h-2.5 w-2.5" />
                                <FormattedDate date={incident.startedAt || incident.createdAt} formatStr="HH:mm:ss" />
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <LucideChevronDown
                              className={cn(
                                "h-3.5 w-3.5 text-muted-foreground/40 transition-transform duration-200",
                                expandedId === incident.id && "rotate-180"
                              )}
                            />
                          </td>
                        </tr>

                        {/* Timeline Panel */}
                        {expandedId === incident.id && (
                          <tr key={`${incident.id}-timeline`}>
                            <td colSpan={6} className="bg-accent/10 px-6 py-5 border-b border-border/50">
                              {timelineLoading && !timelineCache[incident.id] ? (
                                <div className="flex items-center justify-center py-6">
                                  <LucideLoader2 className="h-4 w-4 animate-spin text-primary" />
                                  <span className="ml-2 text-xs text-muted-foreground">Loading timeline...</span>
                                </div>
                              ) : timelineCache[incident.id]?.length === 0 ? (
                                <div className="flex items-center justify-center py-6">
                                  <p className="text-xs text-muted-foreground">No timeline events recorded.</p>
                                </div>
                              ) : (
                                <div className="relative ml-4">
                                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

                                  <div className="flex flex-col gap-0">
                                    {timelineCache[incident.id]?.map((event) => (
                                      <div key={event.id} className="relative flex items-start gap-4 pb-5 last:pb-0">
                                        <div className={cn(
                                          "relative z-10 mt-0.5 h-3 w-3 rounded-full border-2 border-background shrink-0",
                                          getEventDotColor(event.type)
                                        )} />

                                        <div className="flex flex-col gap-0.5 min-w-0">
                                          <div className="flex items-center gap-2">
                                            {getEventIcon(event.type)}
                                            <span className="text-xs font-semibold capitalize">
                                              {event.type.replace(/_/g, " ")}
                                            </span>
                                          </div>
                                          <p className="text-xs text-muted-foreground">{event.message}</p>
                                          <span className="text-[11px] text-muted-foreground/50 flex items-center gap-1 mt-0.5">
                                            <LucideClock className="h-2.5 w-2.5" />
                                            <FormattedDate date={event.createdAt} formatStr="PPpp" />
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

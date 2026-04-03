"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideGlobe, 
  LucideLoader2,
  LucideExternalLink,
  LucidePresentation,
  LucidePlus,
  LucideTrash2
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AddMonitorModal } from "@/components/AddMonitorModal";
import { cn } from "@/lib/utils";

interface Monitor {
  id: string;
  name: string;
  target: string;
  type: string;
  statusPage?: {
    id: string;
    title: string;
    description: string;
  };
}

export default function StatusPages() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchMonitors();
  }, []);

  const fetchMonitors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-monitors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonitors(response.data.monitors);
    } catch (err: any) {
      toast.error("Failed to fetch monitors for status pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatusPage = async (monitorId: string) => {
    setRequestingId(monitorId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(process.env.NEXT_PUBLIC_API_URL + `/monitor/${monitorId}/statuspage`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Status page created successfully!");
      fetchMonitors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create status page.");
    }
    setRequestingId(null);
  };

  const handleDeleteStatusPage = async (monitorId: string) => {
    setDeletingId(monitorId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(process.env.NEXT_PUBLIC_API_URL + `/monitor/${monitorId}/statuspage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Status page deleted successfully!");
      fetchMonitors();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete status page.");
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LucideLoader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Status Pages</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Create and manage public status pages for your monitors.</p>
          </div>
          <AddMonitorModal onSuccess={fetchMonitors} />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {monitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <LucidePresentation className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <h3 className="text-base font-semibold mb-1">No monitors yet</h3>
              <p className="text-sm text-muted-foreground">Add your first monitor to get a public status page.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Monitor</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monitors.map((monitor) => (
                    <tr key={monitor.id} className="group transition-colors hover:bg-accent/20 border-b border-border/50 last:border-0">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
                            <LucideGlobe className="h-3.5 w-3.5 text-muted-foreground/60" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-sm block truncate">{monitor.name}</span>
                            <span className="text-[11px] text-muted-foreground/60 block truncate">{monitor.target}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {monitor.statusPage ? (
                          <div className="flex items-center gap-2 justify-end">
                            <Link
                              href={`/status/${monitor.id}`}
                              target="_blank"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                            >
                              <LucidePresentation className="h-3 w-3" />
                              View
                              <LucideExternalLink className="h-2.5 w-2.5 opacity-50" />
                            </Link>
                            <button
                              onClick={() => handleDeleteStatusPage(monitor.id)}
                              disabled={deletingId === monitor.id}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/5 px-2.5 text-xs font-medium text-destructive hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                            >
                              {deletingId === monitor.id ? (
                                <LucideLoader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <LucideTrash2 className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreateStatusPage(monitor.id)}
                            disabled={requestingId === monitor.id}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all disabled:opacity-50"
                          >
                            {requestingId === monitor.id ? (
                              <LucideLoader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <LucidePlus className="h-3 w-3" />
                            )}
                            Create Page
                          </button>
                        )}
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

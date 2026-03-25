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
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-6xl px-6 py-6 w-full">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Status Pages</h1>
              <p className="text-muted-foreground mt-1">Select a monitor to view your public status page.</p>
            </div>
            <AddMonitorModal onSuccess={fetchMonitors} />
          </div>

          {/* Grid */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            {monitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                  <LucidePresentation className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-lg font-bold">No monitors added yet</h3>
                <p className="text-muted-foreground mt-1">Add your first monitor above to get a status page.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <th className="px-6 py-4 font-bold">Monitor</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monitors.map((monitor) => (
                      <tr key={monitor.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                              <LucideGlobe className="h-4 w-4 opacity-40" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{monitor.name}</span>
                              <span className="text-xs text-muted-foreground">{monitor.target}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {monitor.statusPage ? (
                            <div className="flex items-center gap-2 justify-end">
                              <Link
                                href={`/status/${monitor.id}`}
                                target="_blank"
                                className="inline-flex h-8 items-center gap-2 rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                              >
                                <LucidePresentation className="h-3 w-3" />
                                View Status Page
                                <LucideExternalLink className="h-3 w-3 opacity-50" />
                              </Link>
                              <button
                                onClick={() => handleDeleteStatusPage(monitor.id)}
                                disabled={deletingId === monitor.id}
                                className="inline-flex h-8 items-center gap-2 rounded-full border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-3 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 transition-all disabled:opacity-50"
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
                              className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                            >
                              {requestingId === monitor.id ? (
                                <LucideLoader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <LucidePlus className="h-3 w-3" />
                              )}
                              Create Status Page
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
    </>
  );
}

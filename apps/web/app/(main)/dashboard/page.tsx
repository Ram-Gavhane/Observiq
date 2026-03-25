"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideGlobe, 
  LucideLoader2,
  LucideExternalLink,
  LucideCheckCircle2,
  LucideMapPin
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AddMonitorModal } from "@/components/AddMonitorModal";

interface Monitor {
  id: string;
  name: string;
  type: string;
  target: string;
  status?: string;
  regions?: string[];
}

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
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
    <>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col gap-8">
          {/* Header & Add Modal */}
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your monitored infrastructure.</p>
            </div>
            <AddMonitorModal onSuccess={fetchMonitors} />
          </div>

          {/* Monitors Table/Grid */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            {monitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                  <LucideGlobe className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-lg font-bold">No monitors added yet</h3>
                <p className="text-muted-foreground mt-1">Add your first monitor above to start monitoring.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <th className="px-6 py-4 font-bold">Monitor</th>
                      <th className="px-6 py-4 font-bold">Type</th>
                      <th className="px-6 py-4 font-bold">Target</th>
                      <th className="px-6 py-4 font-bold">Region</th>
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
                            <span className="font-medium">{monitor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">{monitor.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-muted-foreground">{monitor.target}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <LucideMapPin className="h-4 w-4" />
                            <span className="capitalize">{monitor.regions?.join(", ") || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/monitor/${monitor.id}`}
                            className="inline-flex h-8 items-center gap-2 rounded-full bg-zinc-100 px-3 text-xs font-semibold opacity-60 hover:opacity-100 hover:bg-zinc-200 transition-all dark:bg-zinc-800 dark:hover:bg-zinc-700"
                          >
                            Details
                            <LucideExternalLink className="h-3 w-3" />
                          </Link>
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

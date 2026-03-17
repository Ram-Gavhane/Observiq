"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideGlobe, 
  LucideLoader2,
  LucideExternalLink,
  LucideCheckCircle2,
  LucideAlertCircle,
  LucideMapPin
} from "lucide-react";
import axios from "axios";
import { AddWebsiteModal } from "@/components/AddWebsiteModal";

interface Website {
  id: string;
  url: string;
  status?: string;
  regions?: string[];
}

export default function DashboardPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-websites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsites(response.data.websites);
    } catch (err: unknown) {
      setError("Failed to fetch websites");
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
            <AddWebsiteModal onSuccess={fetchWebsites} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
              <LucideAlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Websites Table/Grid */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            {websites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                  <LucideGlobe className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-lg font-bold">No websites monitored yet</h3>
                <p className="text-muted-foreground mt-1">Add your first website above to start monitoring.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <th className="px-6 py-4 font-bold">Website</th>
                      <th className="px-6 py-4 font-bold">Region</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {websites.map((website) => (
                      <tr key={website.id} className="group transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                              <LucideGlobe className="h-4 w-4 opacity-40" />
                            </div>
                            <span className="font-medium">{website.url}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-muted-foreground font-medium">
                            <LucideMapPin className="h-4 w-4" />
                            <span className="capitalize">{website.regions?.join(", ") || "Unknown"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/website/${website.id}`}
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

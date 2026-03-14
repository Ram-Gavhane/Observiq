"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideGlobe, 
  LucideLoader2,
  LucideExternalLink,
  LucideAlertCircle,
  LucidePresentation,
  LucidePlus
} from "lucide-react";
import axios from "axios";
import { AddWebsiteModal } from "@/components/AddWebsiteModal";

interface Website {
  id: string;
  url: string;
  statusPage?: {
    id: string;
    title: string;
    description: string;
  };
}

export default function StatusPages() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
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
      const response = await axios.get("http://localhost:3001/get-websites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsites(response.data.websites);
    } catch (err: any) {
      setError("Failed to fetch websites for status pages.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStatusPage = async (websiteId: string) => {
    setRequesting(true);
    if (!confirm("Create a public status page for this website?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:3001/website/${websiteId}/statuspage`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWebsites(); // Refresh to get the new status page reference
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create status page.");
    }
    setRequesting(false);
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
              <p className="text-muted-foreground mt-1">Select a website to view your public status page.</p>
            </div>
            <AddWebsiteModal onSuccess={fetchWebsites} />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
              <LucideAlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Grid */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            {websites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                  <LucidePresentation className="h-8 w-8 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-lg font-bold">No websites monitored yet</h3>
                <p className="text-muted-foreground mt-1">Add your first website above to get a status page.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-zinc-50/50 dark:bg-zinc-900/50">
                      <th className="px-6 py-4 font-bold">Website</th>
                      <th className="px-6 py-4 font-bold text-right">Action</th>
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
                        <td className="px-6 py-4 text-right">
                          {website.statusPage ? (
                            <Link
                              href={`/status/${website.id}`}
                              target="_blank"
                              className="inline-flex h-8 items-center gap-2 rounded-full bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20 transition-all"
                            >
                              <LucidePresentation className="h-3 w-3" />
                              View Status Page
                              <LucideExternalLink className="h-3 w-3 opacity-50" />
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleCreateStatusPage(website.id)}
                              className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            >
                              <LucidePlus className="h-3 w-3" />
                              {requesting ? <LucideLoader2 className="h-3 w-3 animate-spin" /> : "Create Status Page"}
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

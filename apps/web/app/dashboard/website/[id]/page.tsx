"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideShieldCheck, 
  LucideArrowLeft, 
  LucideGlobe, 
  LucideClock, 
  LucideMapPin,
  LucideCheckCircle2,
  LucideXCircle,
  LucideLoader2,
  LucideTrash2
} from "lucide-react";
import axios from "axios";

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

export default function WebsiteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [website, setWebsite] = useState<Website | null>(null);
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  setInterval(function(){
    window.location.reload()
  }, 3* 60 * 1000);

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
      const response = await axios.get(`http://localhost:3001/website/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsite(response.data.website);
      setTicks(response.data.latestTicks);
    } catch (err: any) {
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
      await axios.delete(`http://localhost:3001/website/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete website");
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
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
      <nav className="border-b border-border bg-background/70 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <LucideShieldCheck className="h-6 w-6 text-primary" />
            <span>Better Uptime</span>
          </Link>
          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-12">
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
    </div>
  );
}

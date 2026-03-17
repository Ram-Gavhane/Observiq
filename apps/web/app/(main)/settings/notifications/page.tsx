"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LucideBellRing, 
  LucidePlus,
  LucideTrash2,
  LucideLoader2,
  LucideMail
} from "lucide-react";
import axios from "axios";

interface Channel {
  id: string;
  type: string;
  config: unknown;
  active: boolean;
  createdAt: string;
}

export default function NotificationChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  
  const router = useRouter();

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-channels", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data);
    } catch (err) {
      setError("Failed to fetch notification channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [router]);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setAdding(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/create-channel", 
        {
          type: "email",
          config: { email: newEmail }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setShowAddModal(false);
      setNewEmail("");
      fetchChannels();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to add channel");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(process.env.NEXT_PUBLIC_API_URL + `/delete-channel/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchChannels();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to delete channel");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Channels</h1>
          <p className="text-muted-foreground mt-2">
            Configure where you want to receive alerts for your websites.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <LucidePlus className="h-4 w-4" />
          Add Channel
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/15 p-4 text-destructive">
          {error}
        </div>
      )}

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <LucideBellRing className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold">No channels configured</h3>
          <p className="mb-6 mt-2 text-sm text-muted-foreground max-w-sm">
            You haven't added any notification channels yet. Add an email address to get started receiving alerts.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <LucidePlus className="h-4 w-4" />
            Add Channel
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {channels.map((channel) => (
            <div 
              key={channel.id} 
              className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {channel.type === 'email' ? (
                    <LucideMail className="h-5 w-5 text-primary" />
                  ) : (
                    <LucideBellRing className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold capitalize text-foreground flex items-center gap-2">
                    {channel.type}
                    {channel.active && (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {channel.type === 'email' ? (channel.config as any)?.email : JSON.stringify(channel.config)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(channel.id)}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Delete channel"
              >
                <LucideTrash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-xl border bg-card p-6 shadow-lg">
            <h2 className="text-xl font-bold">Add Channel</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Add a new email address to receive downtime alerts.
            </p>

            <form onSubmit={handleAddChannel}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="alerts@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {adding ? (
                    <>
                      <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Add Channel"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

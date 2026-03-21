"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft,
  LucideLoader2,
  LucideBellRing,
  LucideCheck,
  LucideMail
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface Channel {
  id: string;
  type: string;
  config: unknown;
  active: boolean;
}

interface Website {
  id: string;
  url: string;
}

export default function WebsiteConfigurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [website, setWebsite] = useState<Website | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/signin");
          return;
        }

        const [websiteRes, channelsRes] = await Promise.all([
          axios.get(process.env.NEXT_PUBLIC_API_URL + `/website/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-channels", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const websiteData = websiteRes.data.website;
        setWebsite(websiteData);
        setChannels(channelsRes.data);

        // Pre-select existing configured channels
        const existingLinks = websiteData.websiteNotificationChannels || [];
        const initialSelections = new Set<string>();
        existingLinks.forEach((link: any) => initialSelections.add(link.notificationChannelId));
        setSelectedChannels(initialSelections);

      } catch (err) {
        toast.error("Failed to load configuration data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const toggleChannel = (channelId: string) => {
    const newSelection = new Set(selectedChannels);
    if (newSelection.has(channelId)) {
      newSelection.delete(channelId);
    } else {
      newSelection.add(channelId);
    }
    setSelectedChannels(newSelection);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        process.env.NEXT_PUBLIC_API_URL + `/website/${id}/channels`,
        { channelIds: Array.from(selectedChannels) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      router.push(`/dashboard/website/${id}`);
    } catch (err) {
      toast.error("Failed to save configuration");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-destructive font-medium">Website not found</p>
        <Link href={`/dashboard/website/${id}`} className="text-sm font-semibold text-primary hover:underline">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/website/${id}`}
          className="rounded-full p-2 hover:bg-accent transition-colors"
        >
          <LucideArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Alerts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {website.url}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Notification Channels</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Select which channels should receive downtime alerts when this website goes offline.
        </p>

        {channels.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center bg-zinc-50 dark:bg-zinc-900/50">
            <LucideBellRing className="mx-auto h-8 w-8 opacity-20 mb-3" />
            <p className="text-muted-foreground text-sm mb-4">You don't have any notification channels.</p>
            <Link 
              href="/settings/notifications"
              className="inline-flex h-9 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
            >
              Add a Channel
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {channels.map((channel) => {
              const isSelected = selectedChannels.has(channel.id);
              return (
                <div 
                  key={channel.id}
                  onClick={() => toggleChannel(channel.id)}
                  className={`
                    cursor-pointer flex items-center justify-between p-4 rounded-xl border transition-all
                    ${isSelected 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-border hover:border-primary/50 hover:bg-accent/50"}
                  `}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                       {channel.type === "email" ? (
                         <LucideMail className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                       ) : (
                         <LucideBellRing className={`h-4 w-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                       )}
                       <span className="font-semibold capitalize">{channel.type}</span>
                    </div>
                    <span className="text-sm text-muted-foreground mt-1 ml-6">
                      {channel.type === 'email' ? (channel.config as any)?.email : JSON.stringify(channel.config)}
                    </span>
                  </div>
                  
                  <div className={`
                    flex h-6 w-6 items-center justify-center rounded-full border
                    ${isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 bg-transparent"}
                  `}>
                    {isSelected && <LucideCheck className="h-4 w-4" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-4">
        <Link 
          href={`/dashboard/website/${id}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
        >
          Cancel
        </Link>
        <button
          onClick={handleSave}
          disabled={saving || channels.length === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : <LucideCheck className="h-4 w-4" />}
          Save Configuration
        </button>
      </div>

    </main>
  );
}

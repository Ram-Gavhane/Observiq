"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LucideArrowLeft,
  LucideLoader2,
  LucideBellRing,
  LucideCheck,
  LucidePlus,
  LucideMail
} from "lucide-react";
import Image from "next/image";
import SlackIcon from "@/app/slack-svgrepo-com.svg";
import DiscordIcon from "@/app/discord-svgrepo-com.svg";
import axios from "axios";
import { toast } from "sonner";

interface Channel {
  id: string;
  type: string;
  config: unknown;
  active: boolean;
}

interface Monitor {
  id: string;
  name: string;
  target: string;
  monitorNotificationChannels?: {
    notificationChannelId: string;
  }[];
}

export default function MonitorConfigurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [monitor, setMonitor] = useState<Monitor | null>(null);
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

        const [monitorRes, channelsRes] = await Promise.all([
          axios.get(process.env.NEXT_PUBLIC_API_URL + `/monitor/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(process.env.NEXT_PUBLIC_API_URL + "/get-channels", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const monitorData = monitorRes.data.monitor;
        setMonitor(monitorData);
        setChannels(channelsRes.data);

        // Pre-select existing configured channels
        const existingLinks = monitorData.monitorNotificationChannels || [];
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

  const configuredChannels = channels.filter((c) => selectedChannels.has(c.id));
  const availableChannels = channels.filter((c) => !selectedChannels.has(c.id));

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        process.env.NEXT_PUBLIC_API_URL + `/monitor/${id}/channels`,
        { channelIds: Array.from(selectedChannels) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Configuration saved successfully");
      router.push(`/dashboard/monitor/${id}`);
    } catch (err) {
      toast.error("Failed to save configuration");
      setSaving(false);
    }
  };

  const getChannelDisplay = (channel: Channel) => {
    if (channel.type === "email") {
      return (channel.config as any)?.email ?? "—";
    }
    if (channel.type === "slack" || channel.type === "discord") {
      const url = (channel.config as any)?.webhookUrl ?? "";
      if (url.length > 40) {
        return url.slice(0, 30) + "•••" + url.slice(-8);
      }
      return url || "—";
    }
    return JSON.stringify(channel.config);
  };

  const getChannelIcon = (type: string, isConfigured: boolean) => {
    const cls = `h-4 w-4 ${isConfigured ? "text-primary" : "text-muted-foreground"}`;
    switch (type) {
      case "email":
        return <LucideMail className={cls} />;
      case "slack":
        return <Image src={SlackIcon} alt="Slack" className={`h-4 w-4 ${isConfigured ? "" : "opacity-60"}`} />;
      case "discord":
        return <Image src={DiscordIcon} alt="Discord" className={`h-4 w-4 ${isConfigured ? "" : "opacity-60"}`} />;
      default:
        return <LucideBellRing className={cls} />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-destructive font-medium">Monitor not found</p>
        <Link href={`/dashboard/monitor/${id}`} className="text-sm font-semibold text-primary hover:underline">
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/dashboard/monitor/${id}`}
          className="rounded-full p-2 hover:bg-accent transition-colors"
        >
          <LucideArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configure Alerts</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {monitor.name} ({monitor.target})
          </p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Configured Channels */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LucideCheck className="h-5 w-5 text-emerald-500" />
              Configured Channels
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {configuredChannels.length} Active
              </span>
            </h2>
          </div>
          <div className="p-6">
            {configuredChannels.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center bg-zinc-50 dark:bg-zinc-900/50">
                <p className="text-muted-foreground text-sm">No channels are currently receiving alerts for this monitor.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {configuredChannels.map((channel) => (
                  <div 
                    key={channel.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        {getChannelIcon(channel.type, true)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold capitalize block text-sm">{channel.type}</span>
                        <span className="text-xs text-muted-foreground truncate block max-w-xs">
                          {getChannelDisplay(channel)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className="text-xs font-semibold text-destructive hover:underline px-3 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Available Channels */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LucidePlus className="h-5 w-5 text-primary" />
              Available Channels
              <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {availableChannels.length} Unused
              </span>
            </h2>
          </div>
          <div className="p-6">
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
            ) : availableChannels.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center bg-zinc-50 dark:bg-zinc-900/50">
                <p className="text-muted-foreground text-sm">All available channels are already configured.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableChannels.map((channel) => (
                  <div 
                    key={channel.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        {getChannelIcon(channel.type, false)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold capitalize block text-sm">{channel.type}</span>
                        <span className="text-xs text-muted-foreground truncate block max-w-xs">
                          {getChannelDisplay(channel)}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleChannel(channel.id)}
                      className="text-xs font-semibold text-primary hover:underline px-3 py-1"
                    >
                      Add to monitor
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between border-t border-border pt-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LucideBellRing className="h-4 w-4" />
          <span>{selectedChannels.size} channel(s) selected for alerts</span>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href={`/dashboard/monitor/${id}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : <LucideCheck className="h-4 w-4" />}
            Save Configuration
          </button>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  LucideClock,
  LucideKey,
  LucideLoader2,
  LucideShieldAlert,
  LucideSmartphone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Session = {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt?: string | null;
};

export default function SecuritySettingsPage() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/signin");
      return;
    }
    setToken(storedToken);
    fetchSessions(storedToken);
  }, []);

  const fetchSessions = async (authToken: string) => {
    try {
      setLoadingSessions(true);
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/sessions", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setSessions(response.data.sessions || []);
    } catch (err) {
      toast.error("Unable to load active sessions");
    } finally {
      setLoadingSessions(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      router.push("/signin");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setChanging(true);
    try {
      await axios.put(
        process.env.NEXT_PUBLIC_API_URL + "/me/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update password";
      toast.error(message);
    } finally {
      setChanging(false);
    }
  };

  const deviceBadges = useMemo(
    () => [
      { match: "Mac", label: "macOS" },
      { match: "Windows", label: "Windows" },
      { match: "Linux", label: "Linux" },
      { match: "iPhone", label: "iPhone" },
      { match: "Android", label: "Android" },
    ],
    []
  );

  const getDeviceLabel = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown device";
    const badge = deviceBadges.find((d) => userAgent.includes(d.match));
    return badge ? `${badge.label} • ${userAgent}` : userAgent;
  };

  const renderSessionMeta = (session: Session) => {
    const lastSeen = session.lastSeenAt
      ? formatDistanceToNow(new Date(session.lastSeenAt), { addSuffix: true })
      : "Unknown";
    const created = session.createdAt
      ? new Date(session.createdAt).toLocaleString()
      : "Unknown";
    return `${lastSeen} • Started ${created}`;
  };

  return (
    <div className="max-w-4xl space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Security</h1>
          <p className="text-muted-foreground">
            Update your password and review where your account is currently signed in.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-600 dark:text-amber-400">
          <LucideShieldAlert className="h-4 w-4" />
          <span className="text-xs font-semibold">Keep your password private. MFA coming soon.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Password Form */}
        <form
          onSubmit={handlePasswordChange}
          className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-2"
        >
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <LucideKey className="h-5 w-5 text-primary" />
            Change password
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Current password</label>
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">New password</label>
              <input
                required
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground">Confirm new password</label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Repeat new password"
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <LucideSmartphone className="h-4 w-4 text-muted-foreground" />
              <span>Changes apply immediately. MFA is not required yet.</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changing}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {changing ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : "Save new password"}
            </button>
          </div>
        </form>

        <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/10 p-6 h-min">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <LucideShieldAlert className="h-4 w-4 text-primary" />
            Tips
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Use a unique password for this account.</li>
            <li>Avoid sharing login links or tokens.</li>
            <li>We will surface MFA once available—no action needed now.</li>
          </ul>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm font-bold tracking-tight">
          <LucideClock className="h-5 w-5 text-primary" />
          Active sessions
        </div>
        <p className="text-sm text-muted-foreground">
          See where you are currently signed in. You can review but not revoke sessions yet.
        </p>

        <div className="rounded-2xl border border-border bg-card p-4">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <LucideLoader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
              <LucideClock className="h-5 w-5" />
              <span className="text-sm">No active sessions found.</span>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {sessions.map((session) => (
                <div key={session.id} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-foreground">{getDeviceLabel(session.userAgent)}</div>
                    <div className="text-xs text-muted-foreground">
                      {session.ipAddress || "IP unknown"}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground md:text-right">
                    {renderSessionMeta(session)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

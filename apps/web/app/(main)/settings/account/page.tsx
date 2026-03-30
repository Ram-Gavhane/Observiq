"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { LucideInfo, LucideLoader2, LucideSave } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

export default function AccountSettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const timezones = useMemo<string[]>(() => {
    if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
      // @ts-ignore supportedValuesOf is available in modern browsers
      return Intl.supportedValuesOf("timeZone");
    }
    return [
      "UTC",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Kolkata",
      "Asia/Tokyo",
    ];
  }, []);

  useEffect(() => {
    const storedTz = typeof window !== "undefined" ? localStorage.getItem("timezone") : "";
    const guessedTz =
      typeof Intl !== "undefined" && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC";
    setTimezone(storedTz || guessedTz);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    fetchProfile(token);
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user: UserProfile = response.data.user;
      setProfile(user);
      setFirstName(user.firstName);
      setLastName(user.lastName);
    } catch (err) {
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timezone) {
      localStorage.setItem("timezone", timezone);
    }
  }, [timezone]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
    setSaving(true);
    try {
      await axios.put(
        process.env.NEXT_PUBLIC_API_URL + "/me",
        { firstName, lastName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.setItem("timezone", timezone);
      toast.success("Account updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LucideLoader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Account settings</h1>
        <p className="text-muted-foreground">Update your personal details and regional preferences.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Basic Profile</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Doe"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Contact Info</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">E-mail</label>
              <input
                value={profile?.email || ""}
                disabled
                className="w-full h-10 px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Role</label>
              <input
                value={profile?.role || ""}
                disabled
                className="w-full h-10 px-3 rounded-md border border-border bg-muted/30 text-sm text-muted-foreground"
              />
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">Regional</h3>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">Saved locally for scheduling and UI hints.</p>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? <LucideLoader2 className="h-4 w-4 animate-spin" /> : <LucideSave className="h-4 w-4" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>

        {/* Sidebar / Info Area */}
        <div className="space-y-6 rounded-2xl border border-border/50 bg-muted/10 p-6 h-min">
          <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight">
            <LucideInfo className="h-4 w-4 text-primary" />
            Basic account information
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Keep your name updated for alerts and status pages. Your email and role are managed by the workspace and
            cannot be changed here.
          </p>
        </div>
      </form>
    </div>
  );
}

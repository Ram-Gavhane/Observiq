"use client";

import { LucideShieldAlert, LucideKey, LucideSmartphone, LucideClock } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-3xl space-y-12 shrink-0">
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-amber-600 dark:text-amber-400">
        <LucideShieldAlert className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold tracking-tight">Security features are coming soon.</span>
      </div>

      <div className="space-y-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Security</h1>

        {/* Password Group */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight">
            <LucideKey className="h-5 w-5 text-primary" />
            Password
          </div>
          <p className="text-sm text-muted-foreground">Modify your existing password to protect your account.</p>
          <div className="w-full h-12 flex items-center justify-between px-4 rounded-xl border border-border bg-muted/10 cursor-not-allowed opacity-50">
            <span className="text-sm text-muted-foreground/60">Change password</span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Not available</span>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight">
            <LucideSmartphone className="h-5 w-5 text-primary" />
            Two-Factor Authentication (2FA)
          </div>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
          <div className="w-full h-12 flex items-center justify-between px-4 rounded-xl border border-border bg-muted/10 cursor-not-allowed opacity-50">
            <span className="text-sm text-muted-foreground/60">Set up 2FA</span>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">Not available</span>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight">
            <LucideClock className="h-5 w-5 text-primary" />
            Active Sessions
          </div>
          <p className="text-sm text-muted-foreground">Manage your currently active browser sessions across different devices.</p>
          <div className="w-full rounded-xl border border-border bg-muted/10 h-32 flex flex-col items-center justify-center cursor-not-allowed opacity-40">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Session management coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { LucideShieldAlert, LucideInfo } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="max-w-3xl space-y-12">
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-amber-600 dark:text-amber-400">
        <LucideShieldAlert className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold tracking-tight">This feature will be available soon.</span>
      </div>

      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Account settings</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Main Form Area */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Basic Profile</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">First Name</label>
                <input disabled placeholder="John" className="w-full h-10 px-3 rounded-md border border-border bg-muted/30 cursor-not-allowed opacity-50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Last Name</label>
                <input disabled placeholder="Doe" className="w-full h-10 px-3 rounded-md border border-border bg-muted/30 cursor-not-allowed opacity-50" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Contact Info</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">E-mail</label>
                <input disabled placeholder="john.doe@example.com" className="w-full h-10 px-3 rounded-md border border-border bg-muted/30 cursor-not-allowed opacity-50" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Regional</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Timezone</label>
                <div className="w-full h-10 flex items-center px-3 rounded-md border border-border bg-muted/30 cursor-not-allowed opacity-50 text-sm text-muted-foreground">
                  (GMT+05:30) Chennai
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Info Area */}
          <div className="space-y-6 px-6 py-4 rounded-xl border border-border/50 bg-muted/10 h-min">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight">
              <LucideInfo className="h-4 w-4 text-primary" />
              Basic account information
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We'll ask you to click a magic link in your email every time you sign in. You can configure your profile picture here or at Gravatar once account management is live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

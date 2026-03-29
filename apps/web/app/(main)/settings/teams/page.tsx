"use client";

import { LucideShieldAlert, LucideUsers, LucideUserPlus, LucideMail } from "lucide-react";

export default function TeamsSettingsPage() {
  return (
    <div className="max-w-3xl space-y-12">
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-amber-600 dark:text-amber-400">
        <LucideShieldAlert className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold tracking-tight">Teams and collaboration features are coming soon.</span>
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight">Teams</h1>
          <button disabled className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed border border-zinc-700">
            <LucideUserPlus className="h-4 w-4" />
            Invite Member
          </button>
        </div>

        {/* Member List Placeholder */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm font-bold tracking-tight px-1">
            <LucideUsers className="h-5 w-5 text-primary" />
            Members
          </div>
          
          <div className="rounded-xl border border-border bg-muted/10 divide-y divide-border/50">
            <div className="flex items-center justify-between p-4 bg-muted/5 opacity-80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">RG</div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight">Ram Gavhane (You)</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <LucideMail className="h-3 w-3" />
                    ramgavhane2005@gmail.com
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                Owner
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 opacity-30 italic text-sm text-muted-foreground">
              Invite your team to collaborate on monitoring.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

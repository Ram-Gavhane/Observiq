import { cn } from "@/lib/utils";
import { LucideShield, LucideGlobe, LucideActivity, LucideDatabase } from "lucide-react";

interface MonitorTypeDetailsProps {
  monitor: {
    type: string;
    target: string;
  };
  latestCheck?: {
    status: string;
    details?: any;
  };
}

export function MonitorTypeDetails({ monitor, latestCheck }: MonitorTypeDetailsProps) {
  const details = latestCheck?.details || {};

  if (monitor.type === "SSL") {
    const sslInfo = details; // The worker returns the info directly in details
    if (!sslInfo || sslInfo.error) {
       return (
         <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <LucideShield className="h-5 w-5 text-destructive" />
             <h3 className="font-bold text-lg text-destructive tracking-tight">SSL Certificate Error</h3>
           </div>
           <p className="text-sm text-destructive/80 font-medium">
             {sslInfo?.error || "No certificate information available."}
           </p>
         </div>
       );
    }

    return (
      <div className="grid gap-6">
        <h2 className="text-xl font-bold">SSL Certificate Info</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Days to Expiry</div>
            <div className={cn(
              "text-2xl font-black tabular-nums",
              sslInfo.daysRemaining < 30 ? "text-destructive" : "text-emerald-500"
            )}>
              {sslInfo.daysRemaining} days
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm overflow-hidden">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Issuer</div>
            <div className="text-base font-bold truncate" title={sslInfo.issuer?.O || "Unknown"}>
              {sslInfo.issuer?.O || "Unknown Issuer"}
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Valid From</div>
            <div className="text-base font-semibold tabular-nums">
              {new Date(sslInfo.validFrom).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Valid To</div>
            <div className="text-base font-semibold tabular-nums">
              {new Date(sslInfo.validTo).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (monitor.type === "HTTP") {
    return (
      <div className="grid gap-6">
        <h2 className="text-xl font-bold">Recent HTTP Performance</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Status Code</div>
            <div className={cn(
               "text-2xl font-black tabular-nums",
               details.statusCode >= 200 && details.statusCode < 400 ? "text-emerald-500" : "text-destructive"
            )}>
              {details.statusCode || "N/A"}
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Response Time</div>
            <div className="text-2xl font-black tabular-nums text-primary">
              {details.responseTimeMs ? `${details.responseTimeMs}ms` : "N/A"}
            </div>
          </div>
          <div className="bg-card border border-border p-4 rounded-2xl shadow-sm">
            <div className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest pl-0.5">Target URL</div>
            <div className="text-base font-bold truncate text-muted-foreground" title={monitor.target}>
              {monitor.target}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for PING/DNS/Others
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-1 text-muted-foreground">
          {monitor.type === "PING" ? <LucideActivity className="h-4 w-4" /> : <LucideDatabase className="h-4 w-4" />}
          <span className="text-[10px] font-bold uppercase tracking-widest">Monitor Type</span>
        </div>
        <div className="text-lg font-bold">{monitor.type}</div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-1 text-muted-foreground">
          <LucideGlobe className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Target</span>
        </div>
        <div className="text-lg font-bold truncate">{monitor.target}</div>
      </div>
    </div>
  );
}

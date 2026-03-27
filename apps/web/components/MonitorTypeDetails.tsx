import { cn } from "@/lib/utils";
import { 
  LucideShield, 
  LucideGlobe, 
  LucideActivity, 
  LucideDatabase, 
  LucideServer, 
  LucideLock,
  LucideZap,
  LucideSearch
} from "lucide-react";

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
    const sslInfo = details;
    if (!sslInfo || sslInfo.error) {
      return (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <LucideShield className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-lg text-destructive tracking-tight">SSL Certificate Error</h3>
          </div>
          <p className="text-sm text-destructive/80 font-medium">
            {sslInfo?.error || "No certificate information available. The check might still be in progress or the target is unreachable."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LucideLock className="h-5 w-5 text-primary" />
            SSL Certificate Details
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-md border border-emerald-500/20">
            Secure Connection
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DetailCard 
            label="Security Status" 
            value={sslInfo.daysRemaining > 0 ? "Valid" : "Expired"} 
            subValue={`${sslInfo.daysRemaining} days remaining`}
            status={sslInfo.daysRemaining < 30 ? "warning" : "success"}
          />
          <DetailCard 
            label="Issuer Organisation" 
            value={sslInfo.issuer?.O || "Unknown"} 
            subValue={sslInfo.issuer?.CN || "No Common Name"}
          />
          <DetailCard 
            label="Valid From" 
            value={new Date(sslInfo.validFrom).toLocaleDateString()} 
            subValue={new Date(sslInfo.validFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
          <DetailCard 
            label="Valid To" 
            value={new Date(sslInfo.validTo).toLocaleDateString()} 
            subValue={new Date(sslInfo.validTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          />
        </div>
      </div>
    );
  }

  if (monitor.type === "HTTP") {
    return (
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LucideGlobe className="h-5 w-5 text-primary" />
            HTTP Performance Insights
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-2 py-1 rounded-md">
            Real-time Metrics
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DetailCard 
            label="Response Status" 
            value={details.statusCode || "---"} 
            subValue={details.statusCode === 200 ? "Success OK" : details.error ? "Request Failed" : "Checking..."}
            status={details.statusCode >= 200 && details.statusCode < 400 ? "success" : "error"}
          />
          <DetailCard 
            label="Total Latency" 
            value={details.responseTimeMs ? `${details.responseTimeMs}ms` : "---"} 
            subValue="TTFB + Transfer"
          />
          <DetailCard 
            label="Request Target" 
            value={new URL(monitor.target).hostname} 
            subValue={new URL(monitor.target).pathname}
          />
        </div>
      </div>
    );
  }

  if (monitor.type === "PING") {
    return (
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LucideZap className="h-5 w-5 text-primary" />
            ICMP Network Statistics
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-2 py-1 rounded-md">
            Low-level Ping
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DetailCard 
            label="Packet Loss" 
            value={details.packetLoss !== undefined ? `${details.packetLoss}%` : "0%"} 
            subValue="Last 10 packets"
            status="success"
          />
          <DetailCard 
            label="Avg Round Trip" 
            value={details.responseTimeMs ? `${details.responseTimeMs}ms` : "---"} 
            subValue="Average latency"
          />
          <DetailCard 
            label="Hostname/IP" 
            value={monitor.target} 
            subValue="ICMP Target"
          />
        </div>
      </div>
    );
  }

  if (monitor.type === "DNS") {
    return (
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LucideSearch className="h-5 w-5 text-primary" />
            DNS Resolution Details
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-muted-foreground px-2 py-1 rounded-md">
            Query Results
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DetailCard 
            label="Resolved IP" 
            value={details.resolvedIp || "No records"} 
            subValue={`Type: ${details.recordType || 'A'}`}
          />
          <DetailCard 
            label="Resolution Time" 
            value={details.durationMs ? `${details.durationMs}ms` : "---"} 
            subValue="DNS Lookup Speed"
          />
          <DetailCard 
            label="Nameserver" 
            value={details.nameserver || "System Default"} 
            subValue="Querying source"
          />
        </div>
      </div>
    );
  }

  return null;
}

function DetailCard({ 
  label, 
  value, 
  subValue, 
  status = "neutral" 
}: { 
  label: string; 
  value: string | number; 
  subValue?: string;
  status?: "success" | "warning" | "error" | "neutral";
}) {
  const statusColors = {
    success: "text-emerald-500",
    warning: "text-amber-500",
    error: "text-destructive",
    neutral: "text-foreground"
  };

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
      <div className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest pl-0.5 group-hover:text-primary transition-colors">
        {label}
      </div>
      <div className={cn("text-xl font-black tabular-nums truncate", statusColors[status])}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs font-medium text-muted-foreground mt-1 truncate">
          {subValue}
        </div>
      )}
    </div>
  );
}

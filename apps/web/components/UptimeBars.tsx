import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Tick {
  status: string; // "UP" | "DOWN" | "UNKNOWN"
  createdAt: string;
}

export function UptimeBars({ ticks, maxBars = 60 }: { ticks: Tick[]; maxBars?: number }) {
  
  const sortedTicks = [...ticks].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const recentTicks = sortedTicks.slice(-maxBars);
  
  const padding = Math.max(0, maxBars - recentTicks.length);
  const bars = [
    ...Array(padding).fill(null),
    ...recentTicks
  ];

  return (
    <div className="flex items-center gap-[2px]">
      <TooltipProvider delayDuration={100}>
        {bars.map((tick, i) => {
          if (!tick) {
            return (
              <div 
                key={`empty-${i}`} 
                className="h-8 w-2 rounded-[1px] bg-zinc-200 dark:bg-zinc-800 opacity-20"
              />
            );
          }

          const isUp = tick.status === "UP";
          const colorClass = isUp 
            ? "bg-emerald-500/80 hover:bg-emerald-400 dark:bg-emerald-500 dark:hover:bg-emerald-400" 
            : "bg-amber-500 hover:bg-amber-400 dark:bg-amber-500 dark:hover:bg-amber-400"; // Can use destructive for red

          return (
            <Tooltip key={`tick-${i}`}>
              <TooltipTrigger asChild>
                <div 
                  className={`h-8 w-2 rounded-[1px] transition-colors cursor-pointer ${colorClass}`}
                />
              </TooltipTrigger>
              <TooltipContent className="text-xs">
                <p className="font-semibold">{isUp ? "Operational" : "Issue Detected"}</p>
                <p className="text-muted-foreground">{new Date(tick.createdAt).toLocaleString()}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}

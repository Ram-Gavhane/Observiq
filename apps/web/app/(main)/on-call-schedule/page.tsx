import { Calendar } from "lucide-react";

export default function OnCallSchedulePage() {
  const dummyDays = Array.from({ length: 35 }, (_, i) => i);
  const dummyShifts = [2, 5, 8, 14, 15, 22, 23, 27];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[85vh] overflow-hidden px-4 md:px-10 font-sans bg-background/50">
      
      {/* Subtle but Visible Background Dummy Schedule */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none p-4 md:p-10 pointer-events-none overflow-hidden">
        <div className="w-full h-full max-w-6xl grid grid-cols-7 gap-2 md:gap-3 opacity-30 dark:opacity-[0.15] mt-[-5vh]">
          {dummyDays.map((day) => (
            <div 
              key={day} 
              className="border border-border/50 bg-secondary/10 rounded-md md:rounded-lg p-2 md:p-3 flex flex-col h-full min-h-[70px] md:min-h-[100px]"
            >
              <div className="text-right text-[10px] md:text-xs font-medium text-muted-foreground mb-2">
                {day > 0 && day <= 31 ? day : ""}
              </div>
              <div className="w-full flex-1 flex flex-col gap-1.5 justify-end mt-auto">
                {dummyShifts.includes(day) && (
                  <div className="w-full bg-primary/60 h-2 rounded-md"></div>
                )}
                {day % 7 === 2 && day > 0 && (
                  <div className="w-full bg-blue-500/50 h-2 rounded-md"></div>
                )}
                {day % 9 === 0 && day > 0 && (
                  <div className="w-full bg-rose-500/50 h-2 rounded-md"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Gradient overlay to fade the grid nicely */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background z-0 pointer-events-none"></div>
      </div>

      {/* Foreground Minimal Content Box */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-lg w-full mt-[-5vh]">
        
        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary/50 text-muted-foreground mb-8 border border-border/50">
          <Calendar className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4 text-foreground">
          On-call scheduling
        </h1>
        
        <p className="text-muted-foreground text-sm md:text-base mb-10 leading-relaxed font-normal max-w-md">
          A seamless on-call and escalation system is currently under development. Soon you will be able to manage team rotations, shifts, and complex routing rules effortlessly.
        </p>

        <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-secondary/80 text-secondary-foreground hover:bg-secondary h-9 px-6 border border-border/50 shadow-sm cursor-default">
          Coming Soon
        </div>
        
      </div>
      
    </div>
  );
}

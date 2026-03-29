"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/account");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-muted-foreground text-sm uppercase tracking-widest">
        Redirecting...
      </div>
    </div>
  );
}

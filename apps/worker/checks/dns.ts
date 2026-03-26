import type { REGION as RegionEnum } from "@repo/db";

type MonitorJob = {
  id: string;
  type: string;
  target: string;
  region: RegionEnum;
  config?: Record<string, unknown>;
};

export async function runDnsCheck(job: MonitorJob) {
  const startedAt = new Date();
  const finishedAt = new Date();
  return {
    status: "UNKNOWN" as const,
    startedAt,
    finishedAt,
    details: { note: "DNS check not implemented yet", target: job.target },
  };
}

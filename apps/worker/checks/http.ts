import axios from "axios";
import type { REGION as RegionEnum } from "@repo/db";

type MonitorJob = {
  id: string;
  type: string;
  target: string;
  region: RegionEnum;
  config?: Record<string, unknown>;
};

export async function runHttpCheck(job: MonitorJob) {
  const startedAt = new Date();
  let status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN" = "UP";
  let details: Record<string, unknown> = {};

  try {
    const response = await axios.get(job.target);
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    details = { statusCode: response.status, responseTimeMs: durationMs };
    return { status, startedAt, finishedAt, durationMs, details };
  } catch (error: any) {
    status = "DOWN";
    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    details = { error: error?.message || "request failed" };
    return { status, startedAt, finishedAt, durationMs, details };
  }
}

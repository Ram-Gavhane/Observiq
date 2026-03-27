import type { REGION as RegionEnum } from "@repo/db";
import { exec as execCb } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCb);

type MonitorJob = {
  id: string;
  type: string;
  target: string;
  region: RegionEnum;
  config?: Record<string, unknown>;
};

type PingCheckConfig = {
  packetCount?: number;
  timeoutMs?: number;
};

type CheckExecutionResult = {
  status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN";
  startedAt: Date;
  finishedAt: Date;
  durationMs?: number;
  summary?: string;
  details: Record<string, unknown>;
};

type ParsedPing = {
  packetsTransmitted: number;
  packetsReceived: number;
  packetLoss: number; // percentage
  minRttMs: number | null;
  avgRttMs: number | null;
  maxRttMs: number | null;
  raw: string;
};

const parsePingOutput = (output: string): ParsedPing => {
  const defaultParsed: ParsedPing = {
    packetsTransmitted: 0,
    packetsReceived: 0,
    packetLoss: 100,
    minRttMs: null,
    avgRttMs: null,
    maxRttMs: null,
    raw: output,
  };

  const packetMatch =
    output.match(/(\d+)\s+packets transmitted.*?(\d+)\s+(?:packets )?received.*?([\d.]+)%\s*packet loss/i) ||
    output.match(/(\d+)\s+transmitted.*?(\d+)\s+received.*?([\d.]+)%\s*packet loss/i);

  if (packetMatch) {
    defaultParsed.packetsTransmitted = parseInt(packetMatch[1] ?? "nil", 10);//Remove nil by correct err
    defaultParsed.packetsReceived = parseInt(packetMatch[2] ?? "nil", 10);//Remove nil by correct err
    defaultParsed.packetLoss = parseFloat(packetMatch[3] ?? "nil");//Remove nil by correct err
  }

  const rttMatch = output.match(/(?:round-trip|rtt).*?=\s*([\d.]+)\/([\d.]+)\/([\d.]+)\/([\d.]+)/i);
  if (rttMatch) {
    defaultParsed.minRttMs = parseFloat(rttMatch[1] ?? "nil");//Remove nil by correct err
    defaultParsed.avgRttMs = parseFloat(rttMatch[2] ?? "nil");//Remove nil by correct err
    defaultParsed.maxRttMs = parseFloat(rttMatch[3] ?? "nil");//Remove nil by correct err
  }

  return defaultParsed;
};

export async function runPingCheck(job: MonitorJob): Promise<CheckExecutionResult> {
  const startedAt = new Date();
  const cfg = (job.config as PingCheckConfig) || {};
  const packetCount = Math.max(1, Math.floor(cfg.packetCount ?? 4));
  const timeoutMs = Math.max(1000, Math.floor(cfg.timeoutMs ?? 5000));

  const cmd = `ping -c ${packetCount} ${job.target}`;

  try {
    const { stdout, stderr } = await exec(cmd, { timeout: timeoutMs });
    const parsed = parsePingOutput((stdout || "") + (stderr || ""));
    const finishedAt = new Date();
    const status =
      parsed.packetsReceived > 0
        ? parsed.packetLoss > 0
          ? "DEGRADED"
          : "UP"
        : "DOWN";

    return {
      status,
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      summary: status === "UP" ? "Ping successful" : status === "DEGRADED" ? "Partial packet loss" : "No reply",
      details: {
        target: job.target,
        packetLoss: parsed.packetLoss,
        packetsTransmitted: parsed.packetsTransmitted,
        packetsReceived: parsed.packetsReceived,
        responseTimeMs: parsed.avgRttMs ?? null,
        minRttMs: parsed.minRttMs,
        maxRttMs: parsed.maxRttMs,
        rawOutput: parsed.raw,
        packetCount,
        timeoutMs,
      },
    };
  } catch (error: any) {
    const stdout = error?.stdout || "";
    const stderr = error?.stderr || "";
    const parsed = parsePingOutput((stdout || "") + (stderr || ""));
    const finishedAt = new Date();

    const status =
      parsed.packetsReceived > 0
        ? parsed.packetLoss > 0
          ? "DEGRADED"
          : "UP"
        : "DOWN";

    return {
      status,
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      summary: "Ping failed",
      details: {
        target: job.target,
        packetLoss: parsed.packetLoss,
        packetsTransmitted: parsed.packetsTransmitted,
        packetsReceived: parsed.packetsReceived,
        responseTimeMs: parsed.avgRttMs ?? null,
        minRttMs: parsed.minRttMs,
        maxRttMs: parsed.maxRttMs,
        rawOutput: parsed.raw,
        error: error?.message || "ping command failed",
        exitCode: error?.code ?? null,
        packetCount,
        timeoutMs,
      },
    };
  }
}

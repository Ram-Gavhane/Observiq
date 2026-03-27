import type { REGION as RegionEnum } from "@repo/db";
import dns from "node:dns/promises";
import type { MxRecord, SrvRecord, SoaRecord } from "node:dns";

type MonitorJob = {
  id: string;
  type: string;
  target: string;
  region: RegionEnum;
  config?: Record<string, unknown>;
};

type CheckExecutionResult = {
  status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN";
  startedAt: Date;
  finishedAt: Date;
  durationMs?: number;
  summary?: string;
  details: Record<string, unknown>;
};

type DnsCheckConfig = {
  recordType?: string;
  expectedValues?: string[];
  resolver?: string;
};

const dnsResolverForConfig = (config: DnsCheckConfig) => {
  if (config.resolver) {
    const customResolver = new dns.Resolver();
    customResolver.setServers([config.resolver]);
    return customResolver;
  }
  return dns;
};

const normalizeRecordValues = (recordType: string, raw: any): string[] => {
  switch (recordType) {
    case "A":
    case "AAAA":
    case "CNAME":
    case "NS":
    case "PTR":
      return raw as string[];
    case "MX":
      return (raw as MxRecord[]).map((r) => `${r.exchange}:${r.priority}`);
    case "SRV":
      return (raw as SrvRecord[]).map((r) => `${r.name}:${r.port}:${r.priority}:${r.weight}`);
    case "SOA": {
      const soa = raw as SoaRecord;
      return [`${soa.nsname}:${soa.hostmaster}:${soa.serial}`];
    }
    case "TXT":
      return (raw as string[][]).map((chunk) => chunk.join(""));
    default:
      return Array.isArray(raw) ? raw.map(String) : [String(raw)];
  }
};

export async function runDnsCheck(job: MonitorJob): Promise<CheckExecutionResult> {
  const startedAt = new Date();
  const cfg = (job.config as DnsCheckConfig) || {};
  const recordType = (cfg.recordType || "A").toUpperCase();
  const expectedValues = (cfg.expectedValues || []).filter(Boolean);
  const resolver = dnsResolverForConfig(cfg);

  try {
    let rawResult: any;
    switch (recordType) {
      case "A":
        rawResult = await resolver.resolve4(job.target);
        break;
      case "AAAA":
        rawResult = await resolver.resolve6(job.target);
        break;
      case "CNAME":
        rawResult = await resolver.resolveCname(job.target);
        break;
      case "MX":
        rawResult = await resolver.resolveMx(job.target);
        break;
      case "NS":
        rawResult = await resolver.resolveNs(job.target);
        break;
      case "PTR":
        rawResult = await resolver.resolvePtr(job.target);
        break;
      case "SOA":
        rawResult = await resolver.resolveSoa(job.target);
        break;
      case "SRV":
        rawResult = await resolver.resolveSrv(job.target);
        break;
      case "TXT":
        rawResult = await resolver.resolveTxt(job.target);
        break;
      default:
        throw new Error(`Unsupported DNS record type: ${recordType}`);
    }

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    const resolvedValues = normalizeRecordValues(recordType, rawResult);

    const matchesExpectation =
      expectedValues.length === 0
        ? resolvedValues.length > 0
        : expectedValues.every((exp) =>
          resolvedValues.some((val) => val.toLowerCase() === exp.toLowerCase())
        );

    const status: CheckExecutionResult["status"] = matchesExpectation ? "UP" : "DOWN";

    return {
      status,
      startedAt,
      finishedAt,
      durationMs,
      summary: matchesExpectation ? "DNS resolved successfully" : "DNS record mismatch",
      details: {
        recordType,
        expectedValues,
        resolvedValues,
        resolvedIp: resolvedValues[0] ?? null,
        nameserver: cfg.resolver || "system",
        matched: matchesExpectation,
      },
    };
  } catch (error: any) {
    const finishedAt = new Date();
    return {
      status: "DOWN",
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      summary: "DNS resolution failed",
      details: {
        recordType,
        nameserver: cfg.resolver || "system",
        error: error?.message || "DNS query failed",
      },
    };
  }
}

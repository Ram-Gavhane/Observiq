import prismaClient, { MonitorStatus } from "@repo/db";

type DashboardStatsResponse = {
  stats: {
    totalMonitors: number;
    operationalMonitors: number;
    averageLatencyMs: number;
    averageUptimePercent: number;
  };
  monitors: Array<{
    id: string;
    name: string;
    type: string;
    target: string;
    status: "up" | "down" | "degraded" | "unknown";
    latency: number | null;
    uptime: number;
    lastCheckedAt: Date | null;
  }>;
};

const mapStatus = (status?: MonitorStatus): "up" | "down" | "degraded" | "unknown" => {
  if (status === MonitorStatus.UP) return "up";
  if (status === MonitorStatus.DOWN) return "down";
  if (status === MonitorStatus.DEGRADED) return "degraded";
  return "unknown";
};

export const getDashboardStats = async (userId: string): Promise<DashboardStatsResponse> => {
  const monitors = await prismaClient.monitor.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      type: true,
      target: true,
    },
  });

  if (monitors.length === 0) {
    return {
      stats: {
        totalMonitors: 0,
        operationalMonitors: 0,
        averageLatencyMs: 0,
        averageUptimePercent: 100,
      },
      monitors: [],
    };
  }

  const monitorIds = monitors.map((m) => m.id);
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const latestChecks = await prismaClient.monitorCheckResult.findMany({
    where: { monitorId: { in: monitorIds } },
    orderBy: [{ monitorId: "asc" }, { createdAt: "desc" }],
    distinct: ["monitorId"],
    select: { monitorId: true, status: true, durationMs: true, createdAt: true },
  });

  const latencyByMonitor = await prismaClient.monitorCheckResult.groupBy({
    by: ["monitorId"],
    where: {
      monitorId: { in: monitorIds },
      createdAt: { gte: twentyFourHoursAgo },
      durationMs: { not: null },
    },
    _avg: { durationMs: true },
  });

  const uptimeByMonitorStatus = await prismaClient.monitorCheckResult.groupBy({
    by: ["monitorId", "status"],
    where: { monitorId: { in: monitorIds }, createdAt: { gte: sevenDaysAgo } },
    _count: { _all: true },
  });

  const overallLatency = await prismaClient.monitorCheckResult.aggregate({
    where: {
      monitorId: { in: monitorIds },
      createdAt: { gte: twentyFourHoursAgo },
      durationMs: { not: null },
    },
    _avg: { durationMs: true },
  });

  const totalUptimeChecks = await prismaClient.monitorCheckResult.count({
    where: { monitorId: { in: monitorIds }, createdAt: { gte: sevenDaysAgo } },
  });

  const upChecks = await prismaClient.monitorCheckResult.count({
    where: {
      monitorId: { in: monitorIds },
      createdAt: { gte: sevenDaysAgo },
      status: MonitorStatus.UP,
    },
  });

  const latencyMap = new Map<string, number>();
  latencyByMonitor.forEach((entry) => {
    if (entry._avg.durationMs != null) {
      latencyMap.set(entry.monitorId, entry._avg.durationMs);
    }
  });

  const uptimeMap = new Map<string, { up: number; total: number }>();
  uptimeByMonitorStatus.forEach((entry) => {
    const value = uptimeMap.get(entry.monitorId) ?? { up: 0, total: 0 };
    value.total += entry._count._all;
    if (entry.status === MonitorStatus.UP) {
      value.up += entry._count._all;
    }
    uptimeMap.set(entry.monitorId, value);
  });

  const latestMap = new Map<string, { status?: MonitorStatus; createdAt: Date | null }>();
  latestChecks.forEach((entry) => {
    latestMap.set(entry.monitorId, { status: entry.status, createdAt: entry.createdAt });
  });

  const monitorsWithStats = monitors.map((monitor) => {
    const latest = latestMap.get(monitor.id);
    const status = mapStatus(latest?.status);
    const latency = latencyMap.get(monitor.id);
    const uptimeEntry = uptimeMap.get(monitor.id);
    const uptimePercent =
      uptimeEntry && uptimeEntry.total > 0 ? (uptimeEntry.up / uptimeEntry.total) * 100 : 100;

    return {
      ...monitor,
      status,
      latency: latency != null ? Math.round(latency) : null,
      uptime: Number(uptimePercent.toFixed(2)),
      lastCheckedAt: latest?.createdAt ?? null,
    };
  });

  const operationalMonitors = monitorsWithStats.filter((m) => m.status !== "down").length;
  const averageUptimePercent =
    totalUptimeChecks > 0 ? Number(((upChecks / totalUptimeChecks) * 100).toFixed(2)) : 100;

  return {
    stats: {
      totalMonitors: monitors.length,
      operationalMonitors,
      averageLatencyMs: overallLatency._avg.durationMs ? Math.round(overallLatency._avg.durationMs) : 0,
      averageUptimePercent,
    },
    monitors: monitorsWithStats,
  };
};

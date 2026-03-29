import prismaClient, { Prisma } from "@repo/db";
import { MonitorType, REGION } from "@repo/db";

export type CreateMonitorInput = {
  userId: string;
  name: string;
  type: (typeof MonitorType)[keyof typeof MonitorType];
  target: string;
  regions: (typeof REGION)[keyof typeof REGION][];
  intervalSec?: number;
  config?: Prisma.InputJsonValue;
};

export const createMonitor = async (data: CreateMonitorInput) => {
  return prismaClient.monitor.create({
    data: {
      userId: data.userId,
      name: data.name,
      type: data.type,
      target: data.target,
      regions: data.regions,
      intervalSec: data.intervalSec ?? 60,
      nextCheckAt: new Date(),
      config: data.config ?? {},
    },
  });
};

export const getMonitorsByUser = async (userId: string) => {
  const monitors = await prismaClient.monitor.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      checkResults: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, createdAt: true },
      },
      statusPage: true,
    },
  });

  return monitors.map((monitor) => {
    const { checkResults, ...rest } = monitor;
    return {
      ...rest,
      latestStatus: checkResults[0]?.status ?? "UNKNOWN",
      lastCheckedAt: checkResults[0]?.createdAt ?? null,
    };
  });
};

export const getMonitorForUser = async (userId: string, monitorId: string) => {
  return prismaClient.monitor.findFirst({
    where: { id: monitorId, userId },
    include: {
      statusPage: true,
      monitorNotificationChannels: {
        include: { notificationChannel: true },
      },
      checkResults: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });
};

export const updateMonitorChannels = async (userId: string, monitorId: string, channelIds: string[]) => {
  // 1. Verify ownership
  const monitor = await prismaClient.monitor.findFirst({ where: { id: monitorId, userId } });
  if (!monitor) return null;

  // 2. Transaction to sync channels
  return prismaClient.$transaction(async (tx) => {
    // Delete existing
    await tx.monitorNotificationChannel.deleteMany({
      where: { monitorId }
    });

    // Create new
    if (channelIds.length > 0) {
      await tx.monitorNotificationChannel.createMany({
        data: channelIds.map(channelId => ({
          monitorId,
          notificationChannelId: channelId
        }))
      });
    }

    return { success: true };
  });
};

export const deleteMonitorForUser = async (userId: string, monitorId: string) => {
  // Ensure ownership first to avoid deleting other users' monitors
  const monitor = await prismaClient.monitor.findFirst({ where: { id: monitorId, userId } });
  if (!monitor) {
    return null;
  }

  await prismaClient.monitor.delete({ where: { id: monitorId } });
  return monitor;
};

export const getMonitorInsights = async (monitorId: string) => {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const results24h = await prismaClient.monitorCheckResult.findMany({
    where: { monitorId, createdAt: { gte: oneDayAgo } },
    select: { status: true, durationMs: true, createdAt: true },
  });

  const results7d = await prismaClient.monitorCheckResult.findMany({
    where: { monitorId, createdAt: { gte: sevenDaysAgo } },
    select: { status: true },
  });

  const uptime24h = results24h.length > 0 
    ? (results24h.filter(r => r.status === "UP").length / results24h.length * 100).toFixed(2)
    : "100.00";

  const uptime7d = results7d.length > 0
    ? (results7d.filter(r => r.status === "UP").length / results7d.length * 100).toFixed(2)
    : "100.00";

  // Group by hour for trends
  const trends: Record<number, { count: number; total: number }> = {};
  results24h.forEach((r) => {
    const hour = new Date(r.createdAt).getHours();
    if (!trends[hour]) trends[hour] = { count: 0, total: 0 };
    trends[hour].count++;
    trends[hour].total += r.durationMs || 0;
  });

  const responseTimeTrends = Object.entries(trends).map(([hour, entry]) => ({
    time: `${hour}:00`,
    responseTime: Math.round(entry.total / entry.count)
  })).sort((a, b) => parseInt(a.time) - parseInt(b.time));

  return { uptime24h, uptime7d, responseTimeTrends };
};

export const getMonitorChecks = async (monitorId: string, limit = 50) => {
  return prismaClient.monitorCheckResult.findMany({
    where: { monitorId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
};

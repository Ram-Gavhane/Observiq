import prismaClient, { MonitorType, REGION } from "@repo/db";
import { createMonitor, deleteMonitorForUser } from "../monitors/monitors.service";

export const createWebsiteMonitor = async (userId: string, url: string, regions: REGION[]) => {
  const normalizedUrl = url.trim();
  const friendlyName = (() => {
    try {
      const parsed = new URL(normalizedUrl);
      return parsed.hostname || normalizedUrl;
    } catch (_) {
      return normalizedUrl;
    }
  })();

  return createMonitor({
    userId,
    name: friendlyName,
    type: MonitorType.HTTP,
    target: normalizedUrl,
    regions,
  });
};

export const getWebsitesForUser = async (userId: string) => {
  return prismaClient.monitor.findMany({
    where: { userId, type: MonitorType.HTTP },
    include: { statusPage: true },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteWebsiteForUser = async (userId: string, monitorId: string) => {
  return deleteMonitorForUser(userId, monitorId);
};

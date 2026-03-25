import prismaClient from "@repo/db";

export const getMonitorById = async (id: string) => {
  return prismaClient.monitor.findUnique({
    where: { id },
  });
};

export const createStatusPage = async (monitorId: string, title?: string, description?: string) => {
  return prismaClient.statusPage.create({
    data: {
      title: title || "",
      description: description || "",
      monitorId,
    },
  });
};

export const getStatusPageByMonitorId = async (monitorId: string) => {
  return prismaClient.statusPage.findUnique({
    where: { monitorId },
    include: { monitor: true },
  });
};

export const getLatestResults = async (monitorId: string, take = 500) => {
  return prismaClient.monitorCheckResult.findMany({
    where: { monitorId },
    take,
    orderBy: { createdAt: "desc" },
  });
};

export const deleteStatusPage = async (monitorId: string) => {
  return prismaClient.statusPage.delete({
    where: { monitorId },
  });
};

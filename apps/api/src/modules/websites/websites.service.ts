import prismaClient, { REGION } from "@repo/db";

export const findUserById = async (id: string) => {
  return prismaClient.user.findUnique({
    where: { id },
  });
};

export const createWebsite = async (url: string, regions: REGION[], userId: string) => {
  return prismaClient.website.create({
    data: {
      url,
      userId,
      regions,
    },
  });
};

export const listWebsitesForUser = async (userId: string) => {
  return prismaClient.website.findMany({
    where: { userId },
    include: { statusPage: true },
  });
};

export const getWebsiteById = async (id: string) => {
  return prismaClient.website.findFirst({
    where: { id },
  });
};

export const getLatestTicks = async (websiteId: string, take = 10) => {
  return prismaClient.websiteTick.findMany({
    where: { websiteId },
    take,
    orderBy: { createdAt: "desc" },
  });
};

export const getTicksSince = async (websiteId: string, since: Date) => {
  return prismaClient.websiteTick.findMany({
    where: { websiteId, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
  });
};

export const countTicksSince = async (websiteId: string, since: Date) => {
  return prismaClient.websiteTick.count({
    where: { websiteId, createdAt: { gte: since } },
  });
};

export const countUpTicksSince = async (websiteId: string, since: Date) => {
  return prismaClient.websiteTick.count({
    where: { websiteId, createdAt: { gte: since }, status: "UP" },
  });
};

export const deleteWebsiteTicks = async (websiteId: string) => {
  return prismaClient.websiteTick.deleteMany({
    where: { websiteId },
  });
};

export const deleteWebsite = async (websiteId: string) => {
  return prismaClient.website.delete({
    where: { id: websiteId },
  });
};

import prismaClient from "@repo/db";

export const getWebsiteById = async (id: string) => {
  return prismaClient.website.findUnique({
    where: { id },
  });
};

export const createStatusPage = async (websiteId: string, title?: string, description?: string) => {
  return prismaClient.statusPage.create({
    data: {
      title: title || "",
      description: description || "",
      websiteId,
    },
  });
};

export const getStatusPageByWebsiteId = async (websiteId: string) => {
  return prismaClient.statusPage.findUnique({
    where: { websiteId },
    include: { website: true },
  });
};

export const getLatestTicks = async (websiteId: string, take = 500) => {
  return prismaClient.websiteTick.findMany({
    where: { websiteId },
    take,
    orderBy: { createdAt: "desc" },
  });
};

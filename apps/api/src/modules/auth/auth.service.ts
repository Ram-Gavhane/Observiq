import prismaClient from "@repo/db";

export const findUserByEmail = async (email: string) => {
  return prismaClient.user.findUnique({
    where: { email },
  });
};

export const createUser = async (email: string, password: string, firstName: string, lastName: string) => {
  return prismaClient.user.create({
    data: { email, password, firstName, lastName },
  });
};

export const getUserById = async (id: string) => {
  return prismaClient.user.findUnique({
    where: { id },
  });
};

export const updateUserPassword = async (id: string, password: string) => {
  return prismaClient.user.update({
    where: { id },
    data: { password },
  });
};

export const updateUserProfile = async (id: string, firstName: string, lastName: string) => {
  return prismaClient.user.update({
    where: { id },
    data: { firstName, lastName },
  });
};

export const getUserProfile = async (id: string) => {
  return prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      _count: {
        select: {
          monitors: true,
          notificationChannels: true,
        },
      },
    },
  });
};

export const createSession = async (
  userId: string,
  userAgent?: string | null,
  ipAddress?: string | null,
  expiresAt?: Date
) => {
  return prismaClient.session.create({
    data: {
      userId,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
      expiresAt: expiresAt || null,
    },
  });
};

export const listSessionsForUser = async (userId: string) => {
  return prismaClient.session.findMany({
    where: { userId },
    orderBy: { lastSeenAt: "desc" },
  });
};

export const getSessionById = async (sessionId: string) => {
  return prismaClient.session.findUnique({
    where: { id: sessionId },
  });
};

export const deleteSession = async (sessionId: string) => {
  return prismaClient.session.delete({
    where: { id: sessionId },
  });
};

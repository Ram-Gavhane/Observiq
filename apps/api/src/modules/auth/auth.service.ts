import prismaClient from "@repo/db";

export const findUserByEmail = async (email: string) => {
  return prismaClient.user.findUnique({
    where: { email },
  });
};

export const createUser = async (email: string, password: string) => {
  return prismaClient.user.create({
    data: { email, password },
  });
};

export const getUserProfile = async (id: string) => {
  return prismaClient.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      _count: {
        select: {
          monitors: true,
          notificationChannels: true,
        },
      },
    },
  });
};

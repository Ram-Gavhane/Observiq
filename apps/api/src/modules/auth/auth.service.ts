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

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prismaClient = new PrismaClient({ adapter });

export default prismaClient;
export * from "./generated/prisma/enums";
export { Prisma } from "./generated/prisma/client";
export type { NotificationChannel } from "./generated/prisma/client"
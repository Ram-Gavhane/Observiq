import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Monitor } from "./generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
const prismaClient = new PrismaClient({ adapter });


export async function claimDueMonitors(intervalMs: number): Promise<Monitor[]> {
    const now = new Date();
    const due = new Date(now.getTime() - intervalMs);

    const monitors = await prismaClient.$queryRaw<Monitor[]>`
    UPDATE "Monitor"
    SET "nextCheckAt" = ${now}
    WHERE id IN (
        SELECT id FROM "Monitor"
        WHERE "nextCheckAt" <= ${due}
        AND "paused" = false
        LIMIT 100
        FOR UPDATE SKIP LOCKED
    )
    RETURNING *`

    return monitors.map((m: any) => ({
        ...m,
        regions: (m.regions as string).replace("{", "").replace("}", "").split(","),
        config: typeof m.config === "string" ? JSON.parse(m.config) : m.config,
    })) as Monitor[];
}


export default prismaClient;
export * from "./generated/prisma/enums";
export { Prisma } from "./generated/prisma/client";
export type { NotificationChannel } from "./generated/prisma/client"
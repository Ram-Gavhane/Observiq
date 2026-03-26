import prismaClient, { Prisma, REGION as RegionEnum } from "@repo/db";
import { xAckBulk, xReadGroup } from "@repo/redisstreams";
import { runHttpCheck } from "./checks/http";
import { runPingCheck } from "./checks/ping";
import { runDnsCheck } from "./checks/dns";
import { runSslCheck } from "./checks/ssl";

const REGION: RegionEnum = process.env.REGION! as RegionEnum;

type MonitorJob = {
    id: string;
    type: string;
    target: string;
    region: RegionEnum;
    config?: Record<string, unknown>;
};

type CheckExecutionResult = {
    status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN";
    startedAt: Date;
    finishedAt: Date;
    durationMs?: number;
    summary?: string;
    details: Record<string, unknown>;
};

async function main() {
    while (true) {
        const result = await xReadGroup(REGION, `${REGION}-worker-1`, 5000);
        if (!result) continue;

        const regionSpecificMessages = result.filter(message => message.message.region === REGION);

        const promises = regionSpecificMessages.map((message) =>
            checkMonitorHealth({
                id: message.message.id,
                type: message.message.type,
                target: message.message.target,
                region: message.message.region as RegionEnum,
                config: message.message.config ? JSON.parse(String(message.message.config)) : undefined
            })
        );

        await Promise.all(promises);

        xAckBulk(REGION, regionSpecificMessages.map(({ id }) => id));
    }
}

async function executeMonitorJob(job: MonitorJob): Promise<CheckExecutionResult> {
    switch (job.type) {
        case "HTTP":
            return runHttpCheck(job);
        case "PING":
            return runPingCheck(job);
        case "DNS":
            return runDnsCheck(job);
        case "SSL":
            return runSslCheck(job);
        default:
            return {
                status: "UNKNOWN",
                startedAt: new Date(),
                finishedAt: new Date(),
                details: { error: "Unsupported monitor type" },
            };
    }
}

async function checkMonitorHealth(job: MonitorJob) {
    const result = await executeMonitorJob(job);

    try {
        await prismaClient.monitorCheckResult.create({
            data: {
                monitorId: job.id,
                status: result.status,
                startedAt: result.startedAt,
                finishedAt: result.finishedAt,
                durationMs: result.durationMs,
                region: REGION,
                summary: result.summary,
                details: result.details as Prisma.InputJsonValue,
            }
        });
    } catch (dbError: any) {
        if (dbError.code === 'P2003') {
            console.log(`Monitor ${job.id} no longer exists. Skipping result.`);
        } else {
            console.error(`Failed to save result for monitor ${job.id}:`, dbError);
        }
    }
}

main();

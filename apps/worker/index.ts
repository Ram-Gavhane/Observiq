import prismaClient, { REGION as RegionEnum } from "@repo/db";
import { xAckBulk, xReadGroup } from "@repo/redisstreams";
import axios from "axios";

const REGION: RegionEnum = process.env.REGION! as RegionEnum;

type messageType = {
    id: string,
    type: string,
    target: string,
    region: RegionEnum,
    config?: Record<string, unknown>
}

async function main() {
    while (true) {
        const result = await xReadGroup(REGION, `${REGION}-worker-1`, 5000);
        if (!result) {
            continue;
        }

        // Only process health checks meant for this specific region
        const regionSpecificMessages = result.filter(message => message.message.region === REGION);

        let promises = regionSpecificMessages.map((message) =>
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

async function checkMonitorHealth(job: messageType) {
    const startTime = Date.now();
    let status: "UP" | "DOWN" | "DEGRADED" | "UNKNOWN" = "UP";
    let details: Record<string, unknown> = {};

    try {
        if (job.type === "HTTP") {
            const response = await axios.get(job.target);
            details = { statusCode: response.status, responseTimeMs: Date.now() - startTime };
        } else {
            // TODO: implement PING/DNS/SSL checks
            status = "UNKNOWN";
        }
    } catch (error: any) {
        status = "DOWN";
        details = { error: error?.message || "request failed" };
    }

    const endTime = Date.now();

    try {
        await prismaClient.monitorCheckResult.create({
            data: {
                monitorId: job.id,
                status,
                startedAt: new Date(startTime),
                finishedAt: new Date(endTime),
                durationMs: endTime - startTime,
                region: REGION,
                details: JSON.stringify(details),
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

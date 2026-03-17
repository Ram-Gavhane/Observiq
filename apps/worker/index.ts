import prismaClient, { REGION as RegionEnum } from "@repo/db";
import { xAckBulk, xReadGroup } from "@repo/redisstreams";
import axios from "axios";

const REGION: RegionEnum = process.env.REGION! as RegionEnum;

type messageType = {
    id: string,
    url: string,
    region: RegionEnum
}

const CONSECUTIVE_FAILURES_THRESHOLD = 2;


async function main() {
    while (1) {
        const result = await xReadGroup(REGION, `${REGION}-worker-1`);
        if (!result) {
            continue;
        }

        // Only process health checks meant for this specific region
        const regionSpecificMessages = result.filter(message => message.message.region === REGION);

        let promises = regionSpecificMessages.map((message) =>
            checkWebsiteHealth({
                id: message.message.id,
                url: message.message.url,
                region: message.message.region as RegionEnum
            })
        );

        await Promise.all(promises);

        xAckBulk(REGION, result.map(({ id }) => id));
    }
}

async function checkWebsiteHealth(website: messageType) {
    const startTime = Date.now();
    let status: "UP" | "DOWN" = "UP";

    try {
        await axios.get(website.url);
    } catch (error) {
        status = "DOWN";
    }

    const endTime = Date.now();

    try {
        await prismaClient.websiteTick.create({
            data: {
                websiteId: website.id,
                status: status,
                responseTimeMs: endTime - startTime,
                region: REGION
            }
        });
    } catch (dbError: any) {
        if (dbError.code === 'P2003') {
            console.log(`Website ${website.id} no longer exists. Skipping tick.`);
        } else {
            console.error(`Failed to save tick for website ${website.id}:`, dbError);
        }
    }

    await handleAlertLogic(website.id, status)
}

async function handleAlertLogic(websiteId: string, currentStatus: "UP" | "DOWN") {
    // Get the last N ticks for this website (any region — or filter by region if you prefer)
    const recentTicks = await prismaClient.websiteTick.findMany({
        where: { websiteId, region: REGION },
        orderBy: { createdAt: "desc" },
        take: CONSECUTIVE_FAILURES_THRESHOLD,
        select: { status: true },
    });

    const allDown = recentTicks.length === CONSECUTIVE_FAILURES_THRESHOLD
        && recentTicks.every(t => t.status === "DOWN");

    // Fetch all active notification channels for this website
    const channels = await prismaClient.notificationChannel.findMany({
        where: { websiteId, active: true },
    });

    if (channels.length === 0) return;

    if (allDown) {
        // Open or update an alert for each channel
        for (const channel of channels) {
            const existingAlert = await prismaClient.alerts.findFirst({
                where: {
                    websiteId,
                    notificationChannelId: channel.id,
                    status: { in: ["triggered", "escalated"] },
                },
            });

            if (existingAlert) {
                // Bump alert count
                await prismaClient.alerts.update({
                    where: { id: existingAlert.id },
                    data: {
                        alertCount: { increment: 1 },
                        lastAlertedAt: new Date(),
                        escalated: existingAlert.alertCount >= 3, // escalate after 3 bumps
                        status: existingAlert.alertCount >= 3 ? "escalated" : "triggered",
                    },
                });
                console.log(`Alert updated for website ${websiteId}`);
            } else {
                // Create a new alert
                await prismaClient.alerts.create({
                    data: {
                        websiteId,
                        notificationChannelId: channel.id,
                        status: "triggered",
                        alertCount: 1,
                        lastAlertedAt: new Date(),
                    },
                });
                console.log(`Alert created for website ${websiteId}`);
            }
        }
    } else if (currentStatus === "UP") {
        // Resolve any open alerts
        await prismaClient.alerts.updateMany({
            where: {
                websiteId,
                status: { in: ["triggered", "escalated"] },
            },
            data: {
                status: "resolved",
                resolvedAt: new Date(),
            },
        });
        console.log(`Alerts resolved for website ${websiteId}`);
    }
}

main();
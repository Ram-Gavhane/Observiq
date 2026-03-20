import prismaClient from "@repo/db";

const CONSECUTIVE_FAILURES_THRESHOLD = 2;

async function handleAlertLogic(websiteId: string, currentStatus: "UP" | "DOWN") {
    // Get the last N ticks for this website (any region — or filter by region if you prefer)
    const recentTicks = await prismaClient.websiteTick.findMany({
        where: { websiteId },
        orderBy: { createdAt: "desc" },
        take: CONSECUTIVE_FAILURES_THRESHOLD,
        select: { status: true },
    });

    const allDown = recentTicks.length === CONSECUTIVE_FAILURES_THRESHOLD
        && recentTicks.every(t => t.status === "DOWN");

    // Fetch all active notification channels for this website
    const channels = await prismaClient.websiteNotificationChannel.findMany({
        where: { websiteId },
        include: { notificationChannel: true }
    });

    if (channels.length === 0) return;

    if (allDown) {
        // Open or update an alert for each channel
        for (const channel of channels) {
            const existingAlert = await prismaClient.alerts.findFirst({
                where: {
                    websiteId,
                    notificationChannelId: channel.notificationChannelId,
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
                        notificationChannelId: channel.notificationChannelId,
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
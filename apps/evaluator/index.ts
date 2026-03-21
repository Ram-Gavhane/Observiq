import prismaClient from "@repo/db";

async function handleAlertLogic() {
    const CONSECUTIVE_FAILURES_THRESHOLD = 2;

    const websitesDown = await prismaClient.$queryRaw<{ websiteId: string }[]>`
    SELECT "websiteId"
    FROM (
        SELECT "websiteId", "status",
               ROW_NUMBER() OVER (PARTITION BY "websiteId" ORDER BY "createdAt" DESC) as rn
        FROM "WebsiteTick"
    ) ranked
    WHERE rn <= ${CONSECUTIVE_FAILURES_THRESHOLD}
    GROUP BY "websiteId"
    HAVING COUNT(*) = ${CONSECUTIVE_FAILURES_THRESHOLD}
       AND SUM(CASE WHEN status = 'DOWN' THEN 1 ELSE 0 END) = ${CONSECUTIVE_FAILURES_THRESHOLD}
`;

    // Step 2 — find websites that are back UP, resolve their alerts
    const websitesUp = await prismaClient.$queryRaw<{ websiteId: string }[]>`
    SELECT "websiteId"
    FROM (
        SELECT "websiteId", "status",
               ROW_NUMBER() OVER (PARTITION BY "websiteId" ORDER BY "createdAt" DESC) as rn
        FROM "WebsiteTick"
    ) ranked
    WHERE rn <= ${CONSECUTIVE_FAILURES_THRESHOLD}
    GROUP BY "websiteId"
    HAVING COUNT(*) = ${CONSECUTIVE_FAILURES_THRESHOLD}
       AND SUM(CASE WHEN status = 'UP' THEN 1 ELSE 0 END) = ${CONSECUTIVE_FAILURES_THRESHOLD}
`;

    await prismaClient.alerts.updateMany({
        where: {
            websiteId: { in: websitesUp.map(w => w.websiteId) },
            status: { in: ["triggered", "escalated"] },
        },
        data: {
            status: "resolved",
            resolvedAt: new Date(),
        },
    });

    // Step 3 — fetch channels through the join table
    const websiteChannels = await prismaClient.websiteNotificationChannel.findMany({
        where: {
            websiteId: { in: websitesDown.map(w => w.websiteId) }
        },
        include: {
            notificationChannel: true
        }
    });

    if (websiteChannels.length === 0) return;

    for (const wc of websiteChannels) {
        const existing = await prismaClient.alerts.findFirst({
            where: {
                websiteId: wc.websiteId,
                notificationChannelId: wc.notificationChannelId,
                status: { in: ["triggered", "escalated"] },
            },
            select: { alertCount: true }
        });

        const newCount = (existing?.alertCount ?? 0) + 1;

        await prismaClient.alerts.upsert({
            where: {
                websiteId_notificationChannelId: {
                    websiteId: wc.websiteId,
                    notificationChannelId: wc.notificationChannelId,
                }
            },
            update: {
                alertCount: { increment: 1 },
                lastAlertedAt: new Date(),
                escalated: newCount >= 3,
                status: newCount >= 3 ? "escalated" : "triggered",
            },
            create: {
                websiteId: wc.websiteId,
                notificationChannelId: wc.notificationChannelId,
                status: "triggered",
                alertCount: 1,
                lastAlertedAt: new Date(),
            }
        });
    }
}

setInterval(() => {
    handleAlertLogic().catch(console.error);
}, 60 * 1000);

handleAlertLogic().catch(console.error);
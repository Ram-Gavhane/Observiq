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

    const resolvedAlerts = await prismaClient.alerts.findMany({
        where: {
            websiteId: { in: websitesUp.map(w => w.websiteId) },
            status: { in: ["triggered", "escalated"] },
        },
        select: { id: true }
    });

    await prismaClient.alerts.updateMany({
        where: { id: { in: resolvedAlerts.map(a => a.id) } },
        data: { status: "resolved", resolvedAt: new Date() },
    });

    await prismaClient.incidentEvent.createMany({
        data: resolvedAlerts.map(alert => ({
            alertId: alert.id,
            type: "incident_resolved",
            message: "Website is back UP — incident resolved",
        }))
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

        const upsertedAlert = await prismaClient.alerts.upsert({
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

        if (!existing) {
            // freshly created
            await prismaClient.incidentEvent.create({
                data: {
                    alertId: upsertedAlert.id,
                    type: "incident_created",
                    message: "Incident detected — website is DOWN",
                }
            });
        } else {
            // updated — alert sent or escalated
            await prismaClient.incidentEvent.create({
                data: {
                    alertId: upsertedAlert.id,
                    type: newCount >= 3 ? "alert_escalated" : "alert_sent",
                    message: newCount >= 3
                        ? "Escalated to on-call after 3 alerts"
                        : `Alert #${newCount} sent via ${wc.notificationChannel.type}`,
                }
            });
        }
    }
}

setInterval(() => {
    handleAlertLogic().catch(console.error);
}, 60 * 1000);

handleAlertLogic().catch(console.error);
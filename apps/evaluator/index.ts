import prismaClient from "@repo/db";
import { sendNotification } from "@repo/notifications";

async function handleAlertLogic() {
    const CONSECUTIVE_FAILURES_THRESHOLD = 2;

    const websitesDown = await prismaClient.$queryRaw<{ websiteId: string }[]>`
    SELECT "websiteId"
    FROM (
        SELECT "websiteId", "status", "region",
               ROW_NUMBER() OVER (PARTITION BY "websiteId", "region" ORDER BY "createdAt" DESC) as rn
        FROM "WebsiteTick"
    ) ranked
    WHERE rn <= ${CONSECUTIVE_FAILURES_THRESHOLD}
    GROUP BY "websiteId", "region"
    HAVING COUNT(*) = ${CONSECUTIVE_FAILURES_THRESHOLD}
       AND SUM(CASE WHEN "status" = 'DOWN' THEN 1 ELSE 0 END) = ${CONSECUTIVE_FAILURES_THRESHOLD}
    `;

    const websitesUp = await prismaClient.$queryRaw<{ websiteId: string }[]>`
    SELECT "websiteId"
    FROM (
        SELECT "websiteId", "status", "region",
               ROW_NUMBER() OVER (PARTITION BY "websiteId", "region" ORDER BY "createdAt" DESC) as rn
        FROM "WebsiteTick"
    ) ranked
    WHERE rn <= ${CONSECUTIVE_FAILURES_THRESHOLD}
    GROUP BY "websiteId", "region"
    HAVING COUNT(*) = ${CONSECUTIVE_FAILURES_THRESHOLD}
       AND SUM(CASE WHEN "status" = 'UP' THEN 1 ELSE 0 END) = ${CONSECUTIVE_FAILURES_THRESHOLD}
    `;

    const downWebsiteIds = [...new Set(websitesDown.map(w => w.websiteId))];
    const upWebsiteIds = [...new Set(websitesUp.map(w => w.websiteId))]
        .filter(id => !downWebsiteIds.includes(id));

    const resolvedAlerts = await prismaClient.alerts.findMany({
        where: {
            websiteId: { in: upWebsiteIds },
            status: { in: ["triggered", "escalated"] },
        },
        include: {
            website: {
                include: {
                    websiteNotificationChannels: {
                        include: { notificationChannel: true }
                    }
                }
            }
        }
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
        })),
    });

    for (const alert of resolvedAlerts) {
        for (const wc of alert.website.websiteNotificationChannels) {
            if (!wc.notificationChannel.active) continue;

            await sendNotification({
                eventType: "incident_resolved",
                websiteUrl: alert.website.url,
                message: "Website is back UP — incident resolved",
                channel: wc.notificationChannel
            });

            await prismaClient.alertNotification.create({
                data: {
                    alertId: alert.id,
                    notificationChannelId: wc.notificationChannelId,
                    eventType: "incident_resolved",
                }
            });
        }
    }

    if (downWebsiteIds.length === 0) return;

    const downWebsites = await prismaClient.website.findMany({
        where: { id: { in: downWebsiteIds } },
        include: {
            websiteNotificationChannels: {
                include: { notificationChannel: true }
            }
        }
    });

    for (const website of downWebsites) {
        const existingAlert = await prismaClient.alerts.findFirst({
            where: {
                websiteId: website.id,
                status: { in: ["triggered", "escalated"] }
            }
        });

        const newCount = (existingAlert?.alertCount ?? 0) + 1;
        const isEscalated = newCount >= 3;

        let alert;

        if (!existingAlert) {
            alert = await prismaClient.alerts.create({
                data: {
                    websiteId: website.id,
                    status: "triggered",
                    alertCount: 1,
                    lastAlertedAt: new Date(),
                }
            });
            await prismaClient.incidentEvent.create({
                data: {
                    alertId: alert.id,
                    type: "incident_created",
                    message: "Incident detected — website is DOWN",
                }
            });
        } else {
            alert = await prismaClient.alerts.update({
                where: { id: existingAlert.id },
                data: {
                    alertCount: { increment: 1 },
                    lastAlertedAt: new Date(),
                    escalated: isEscalated,
                    status: isEscalated ? "escalated" : "triggered",
                }
            });

            await prismaClient.incidentEvent.create({
                data: {
                    alertId: alert.id,
                    type: isEscalated ? "alert_escalated" : "alert_sent",
                    message: isEscalated
                        ? "Escalated to on-call after 3 alerts"
                        : `Alert #${newCount} — website still DOWN`,
                }
            });
        }

        for (const wc of website.websiteNotificationChannels) {
            if (!wc.notificationChannel.active) continue;

            const eventType = !existingAlert
                ? "incident_created"
                : isEscalated ? "alert_escalated" : "alert_sent";

            await sendNotification({
                eventType,
                websiteUrl: website.url,
                message: !existingAlert
                    ? "Incident detected — website is DOWN"
                    : isEscalated
                        ? "Escalated to on-call after 3 alerts"
                        : `Alert #${newCount} — website still DOWN`,
                channel: wc.notificationChannel
            });

            await prismaClient.alertNotification.create({
                data: {
                    alertId: alert.id,
                    notificationChannelId: wc.notificationChannelId,
                    eventType,
                }
            });
        }
    }
}

setInterval(() => {
    handleAlertLogic().catch(console.error);
}, 60 * 1000);

handleAlertLogic().catch(console.error);
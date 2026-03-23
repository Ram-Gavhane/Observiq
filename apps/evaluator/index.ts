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

    const downWebsiteIds = [...new Set(websitesDown.map(w => w.websiteId))]
    const upWebsiteIds = [...new Set(websitesUp.map(w => w.websiteId))].filter(id => !downWebsiteIds.includes(id))

    const resolvedAlerts = await prismaClient.alerts.findMany({
        where: {
            websiteId: { in: upWebsiteIds },
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

    const websiteChannels = await prismaClient.websiteNotificationChannel.findMany({
        where: {
            websiteId: { in: downWebsiteIds }
        },
        include: {
            notificationChannel: true,
            website:true
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
            await sendNotification({
                eventType:"incident_created",
                websiteUrl:wc.website.url,
                message:"Incident detected — website is DOWN",
                channel:wc.notificationChannel
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
            if(newCount<3){
                await sendNotification({
                    eventType:"alert_sent",
                    websiteUrl:wc.website.url,
                    message:`Alert #${newCount} sent via ${wc.notificationChannel.type}`,
                    channel:wc.notificationChannel
                });
            }else{
                await sendNotification({
                    eventType:"alert_escalated",
                    websiteUrl:wc.website.url,
                    message:"Escalated to on-call after 3 alerts",
                    channel:wc.notificationChannel
                });
            }
        }
    }
}

setInterval(() => {
    handleAlertLogic().catch(console.error);
}, 60 * 1000);

handleAlertLogic().catch(console.error);
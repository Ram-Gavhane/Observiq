import prismaClient, {
    Prisma,
    IncidentStatus,
    MonitorStatus,
    type NotificationChannel,
} from "@repo/db";
import { sendNotification } from "@repo/notifications";

const CONSECUTIVE_FAILURES_THRESHOLD = 2; // how many consecutive DOWNs trigger an incident
const SAMPLE_RESULTS = 5; // how many recent results to look at per monitor
const ALERT_COOLDOWN_MINUTES = 10;
const STALE_CHECK_MINUTES = 15; // if we haven't seen a result recently, treat as unknown

type NotificationPlan = {
    incidentId: string;
    channel: NotificationChannel;
    eventType: "incident_created" | "incident_resolved" | "alert_escalated";
    message: string;
    websiteUrl: string;
};

async function deriveStatus(tx: Prisma.TransactionClient, monitorId: string) {
    const results = await tx.monitorCheckResult.findMany({
        where: { monitorId },
        orderBy: { createdAt: "desc" },
        take: SAMPLE_RESULTS,
    });

    if (results.length === 0) return { status: MonitorStatus.UNKNOWN, latest: undefined };

    const latest = results[0];
    const minutesSinceLatest = (Date.now() - latest!.createdAt.getTime()) / (1000 * 60);
    if (minutesSinceLatest > STALE_CHECK_MINUTES) {
        return { status: MonitorStatus.UNKNOWN, latest };
    }

    let consecutiveDown = 0;
    for (const r of results) {
        if (r.status === MonitorStatus.DOWN) consecutiveDown++;
        else break;
    }

    if (consecutiveDown >= CONSECUTIVE_FAILURES_THRESHOLD) {
        return { status: MonitorStatus.DOWN, latest };
    }

    if (results.some(r => r.status === MonitorStatus.DOWN || r.status === MonitorStatus.DEGRADED)) {
        return { status: MonitorStatus.DEGRADED, latest };
    }

    return { status: MonitorStatus.UP, latest };
}

function shouldNotify(lastAlertedAt: Date | null, force: boolean) {
    if (force) return true;
    if (!lastAlertedAt) return true;
    const minutes = (Date.now() - lastAlertedAt.getTime()) / (1000 * 60);
    return minutes >= ALERT_COOLDOWN_MINUTES;
}

async function processMonitor(tx: Prisma.TransactionClient, monitorId: string) {
    const monitor = await tx.monitor.findUnique({
        where: { id: monitorId },
        include: {
            monitorNotificationChannels: {
                include: { notificationChannel: true },
            },
        },
    });

    if (!monitor) return [] as NotificationPlan[];
    if (monitor.paused) return [] as NotificationPlan[];

    const { status: derivedStatus, latest } = await deriveStatus(tx, monitor.id);

    const openIncident = await tx.incident.findFirst({
        where: {
            monitorId: monitor.id,
            status: { in: [IncidentStatus.OPEN, IncidentStatus.ACKNOWLEDGED] },
        },
    });

    const notifications: NotificationPlan[] = [];

    // Transition logic
    if (!openIncident && (derivedStatus === MonitorStatus.DOWN || derivedStatus === MonitorStatus.DEGRADED)) {
        const incident = await tx.incident.create({
            data: {
                monitorId: monitor.id,
                status: IncidentStatus.OPEN,
                severity: derivedStatus === MonitorStatus.DOWN ? "critical" : "warning",
                startedAt: new Date(),
                lastAlertedAt: new Date(),
            },
        });

        await tx.incidentEvent.create({
            data: {
                incidentId: incident.id,
                type: "incident_created",
                message: `Incident opened. Status: ${derivedStatus}. Target: ${monitor.target}`,
            },
        });

        const message = derivedStatus === MonitorStatus.DOWN
            ? `❌ ${monitor.name || monitor.target} is DOWN`
            : `⚠️ ${monitor.name || monitor.target} is DEGRADED`;

        notifications.push(...(monitor.monitorNotificationChannels.map<NotificationPlan>(({ notificationChannel }) => ({
            incidentId: incident.id,
            channel: notificationChannel,
            eventType: "incident_created",
            message,
            websiteUrl: monitor.target,
        }))));
    } else if (openIncident && derivedStatus === MonitorStatus.UP) {
        await tx.incident.update({
            where: { id: openIncident.id },
            data: { status: IncidentStatus.RESOLVED, resolvedAt: new Date() },
        });

        await tx.incidentEvent.create({
            data: {
                incidentId: openIncident.id,
                type: "incident_resolved",
                message: `Incident resolved. Target: ${monitor.target}`,
            },
        });

        const message = `✅ ${monitor.name || monitor.target} is back UP`;

        notifications.push(...(monitor.monitorNotificationChannels.map<NotificationPlan>(({ notificationChannel }) => ({
            incidentId: openIncident.id,
            channel: notificationChannel,
            eventType: "incident_resolved",
            message,
            websiteUrl: monitor.target,
        }))));
    } else if (openIncident && (derivedStatus === MonitorStatus.DOWN || derivedStatus === MonitorStatus.DEGRADED)) {
        // Still unhealthy – maybe send a periodic reminder
        const force = false;
        if (shouldNotify(openIncident.lastAlertedAt, force)) {
            const updated = await tx.incident.update({
                where: { id: openIncident.id },
                data: { lastAlertedAt: new Date() },
            });

            await tx.incidentEvent.create({
                data: {
                    incidentId: updated.id,
                    type: "alert_escalated",
                    message: `Reminder: ${monitor.name || monitor.target} still ${derivedStatus}`,
                },
            });

            const message = `⏰ ${monitor.name || monitor.target} still ${derivedStatus}`;
            notifications.push(...(monitor.monitorNotificationChannels.map<NotificationPlan>(({ notificationChannel }) => ({
                incidentId: updated.id,
                channel: notificationChannel,
                eventType: "alert_escalated",
                message,
                websiteUrl: monitor.target,
            }))));
        }
    }

    return notifications;
}

async function handleAlertLogic() {
    const monitors = await prismaClient.monitor.findMany({
        where: { paused: false },
        select: { id: true },
        take: 200,
    });

    const notificationsToSend: NotificationPlan[] = [];

    for (const m of monitors) {
        const planned = await prismaClient.$transaction((tx) => processMonitor(tx, m.id));
        notificationsToSend.push(...planned);
    }

    for (const notification of notificationsToSend) {
        try {
            await sendNotification({
                websiteUrl: notification.websiteUrl,
                eventType: notification.eventType,
                message: notification.message,
                channel: notification.channel,
            });
            await prismaClient.alertDelivery.create({
                data: {
                    incidentId: notification.incidentId,
                    notificationChannelId: notification.channel.id,
                    eventType: notification.eventType,
                    status: "sent",
                },
            });
        } catch (err: any) {
            console.error("Failed to send notification", err);
        }
    }
}

setInterval(() => {
    handleAlertLogic().catch(console.error);
}, 60 * 1000);

handleAlertLogic().catch(console.error);

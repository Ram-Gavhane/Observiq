import type { NotificationPayload, SlackConfig } from "../types";

export async function sendSlackalert(notificationPayload: NotificationPayload) {
    const config = notificationPayload.channel.config as SlackConfig;
    const webhookUrl = config.webhookUrl;
    if (!webhookUrl) {
        console.warn("Slack webhook URL missing");
        return;
    }
    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            text: `*${notificationPayload.eventType}*\n${notificationPayload.message}\nWebsite: ${notificationPayload.websiteUrl}`
        })
    })


    if (!response.ok) {
        console.error("Slack webhook failed", response.status, response.statusText);
        return;
    }

    console.log("Slack alert sent successfully");
}
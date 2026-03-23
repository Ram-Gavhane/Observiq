import type { DiscordConfig, NotificationPayload } from "../types";

export async function sendDiscordAlert(notificationPayload: NotificationPayload) {
    const config = notificationPayload.channel.config as DiscordConfig;
    const webhookUrl = config.webhookUrl;

    if (!webhookUrl) {
        console.warn("Discord webhook URL missing");
        return;
    }

    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: `*${notificationPayload.eventType}*\n${notificationPayload.message}\nWebsite: ${notificationPayload.websiteUrl}`
        })
    })

    if (!response.ok) {
        console.error("Discord webhook failed", response.status, response.statusText);
        return;
    }

    console.log("Discord alert sent successfully")
}
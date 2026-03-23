import { sendDiscordAlert } from "./discord";
import { sendEmail } from "./email";
import { sendSlackAlert } from "./slack";
import type { NotificationPayload } from "./types";
export async function sendNotification(notificationPayload: NotificationPayload) {
    switch (notificationPayload.channel.type) {
        case "email":
            await sendEmail(notificationPayload)
            break;
        case "slack":
            await sendSlackAlert(notificationPayload);
            break;
        case "discord":
            await sendDiscordAlert(notificationPayload);
            break;
        default:
            console.log("no valid channel")
    }
}
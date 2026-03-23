import { sendEmail } from "./email";
import type { NotificationPayload } from "./types";
export async function sendNotification(notificationPayload: NotificationPayload){
    switch (notificationPayload.channel.type){
        case "email":
            await sendEmail(notificationPayload)
            break;
        case "slack":
            break;
        case "discord":
            break;
        }
        
}
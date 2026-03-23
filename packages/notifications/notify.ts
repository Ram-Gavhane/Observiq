import { sendEmail } from "./email";
import { sendSlackalert } from "./slack";
import type { NotificationPayload } from "./types";
export async function sendNotification(notificationPayload: NotificationPayload){
    switch (notificationPayload.channel.type){
        case "email":
            await sendEmail(notificationPayload)
            break;
        case "slack":
            await sendSlackalert(notificationPayload);
            break;
        case "discord":
            break;
        }
        
}
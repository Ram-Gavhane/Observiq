import type { NotificationPayload } from "./types";
export function sendNotification(notificationPayload: NotificationPayload){
    switch (notificationPayload.channel.type){
        case "email":
            break;
        case "slack":
            break;
        case "discord":
            break;
        }
        
}
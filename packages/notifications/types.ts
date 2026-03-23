import type { NotificationChannel } from "@repo/db";

export type EventType =
  | "incident_created"
  | "incident_resolved"
  | "alert_escalated"
  | "alert_sent";

export type EmailConfig = { email: string };
export type SlackConfig = { webhookUrl: string };
export type DiscordConfig = { webhookUrl: string };

export type NotificationPayload = {
  websiteUrl: string;
  eventType: EventType;
  message: string;
  channel: NotificationChannel;
};
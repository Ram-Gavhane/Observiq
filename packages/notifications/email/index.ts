import { Resend } from 'resend';
import type { EmailConfig, NotificationPayload } from "../types";

const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendEmail(notificationPayload: NotificationPayload) {

  const config = notificationPayload.channel.config as EmailConfig;
  const emailAddress = config.email;

  const message = `
  <h1>${notificationPayload.eventType}</h1>
  <p>${notificationPayload.message}</p>
  <p>Website: ${notificationPayload.websiteUrl}</p>
  <p>Time: ${new Date().toISOString()}</p>
  `;

  const { data, error } = await resend.emails.send({
    from: 'Acme <onboarding@resend.dev>',
    to: emailAddress,
    subject: notificationPayload.eventType,
    html: message,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}
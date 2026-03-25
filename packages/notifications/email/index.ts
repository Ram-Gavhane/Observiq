import { Resend } from 'resend';
import type { EmailConfig, NotificationPayload } from "../types";

const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendEmail(notificationPayload: NotificationPayload) {

  const config = notificationPayload.channel.config as EmailConfig;
  const emailAddress = config.email;

  let color = '#3b82f6'; // blue
  let title = 'Alert Notification';

  switch (notificationPayload.eventType) {
    case 'incident_created':
      color = '#ef4444'; // red
      title = 'New Incident Created';
      break;
    case 'incident_resolved':
      color = '#22c55e'; // green
      title = 'Incident Resolved';
      break;
    case 'alert_escalated':
      color = '#f97316'; // orange
      title = 'Alert Escalated';
      break;
    case 'alert_sent':
      color = '#3b82f6'; // blue
      title = 'Alert Sent';
      break;
  }

  const message = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }
    .header {
      background-color: ${color};
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: -0.025em;
    }
    .content {
      padding: 32px 24px;
    }
    .message-box {
      background-color: #f9fafb;
      border-left: 4px solid ${color};
      padding: 16px;
      margin: 20px 0;
      border-radius: 0 4px 4px 0;
    }
    .message-text {
      margin: 0;
      font-size: 16px;
      color: #4b5563;
    }
    .details {
      margin-top: 24px;
      border-top: 1px solid #e5e7eb;
      padding-top: 24px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 24px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: ${color};
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      margin-top: 24px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0; font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">This is an automated notification from <strong>Better Uptime</strong> regarding your monitored service.</p>
      
      <div class="message-box">
        <p class="message-text">${notificationPayload.message}</p>
      </div>
      
      <div class="details">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
          <tr>
            <td style="font-weight: 600; color: #6b7280; width: 100px; font-size: 14px; padding-bottom: 12px; vertical-align: top;">Website:</td>
            <td style="color: #111827; font-size: 14px; padding-bottom: 12px;"><a href="${notificationPayload.websiteUrl}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${notificationPayload.websiteUrl}</a></td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #6b7280; width: 100px; font-size: 14px; padding-bottom: 12px; vertical-align: top;">Event Type:</td>
            <td style="color: #111827; font-size: 14px; padding-bottom: 12px;">
              <span style="background-color: ${color}20; color: ${color}; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">
                ${title.toUpperCase()}
              </span>
            </td>
          </tr>
          <tr>
            <td style="font-weight: 600; color: #6b7280; width: 100px; font-size: 14px; padding-bottom: 12px; vertical-align: top;">Time:</td>
            <td style="color: #111827; font-size: 14px; padding-bottom: 12px;">${new Date().toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short' })}</td>
          </tr>
        </table>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="${notificationPayload.websiteUrl}" class="button" style="color: #ffffff !important;">View Website</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin-bottom: 8px;">You are receiving this email because you are subscribed to alerts for this monitor.</p>
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Better Uptime. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  const { data, error } = await resend.emails.send({
    from: 'Observiq <onboarding@resend.dev>',
    to: emailAddress,
    subject: `[Observiq] ${title} - ${notificationPayload.websiteUrl}`,
    html: message,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}
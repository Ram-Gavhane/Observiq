/*
  Warnings:

  - You are about to drop the column `websiteId` on the `NotificationChannel` table. All the data in the column will be lost.
  - Added the required column `userId` to the `NotificationChannel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alerts" DROP CONSTRAINT "Alerts_notificationChannelId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationChannel" DROP CONSTRAINT "NotificationChannel_websiteId_fkey";

-- AlterTable
ALTER TABLE "Alerts" ALTER COLUMN "notificationChannelId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "NotificationChannel" DROP COLUMN "websiteId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WebsiteNotificationChannel" (
    "websiteId" TEXT NOT NULL,
    "notificationChannelId" TEXT NOT NULL,

    CONSTRAINT "WebsiteNotificationChannel_pkey" PRIMARY KEY ("websiteId","notificationChannelId")
);

-- AddForeignKey
ALTER TABLE "NotificationChannel" ADD CONSTRAINT "NotificationChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteNotificationChannel" ADD CONSTRAINT "WebsiteNotificationChannel_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteNotificationChannel" ADD CONSTRAINT "WebsiteNotificationChannel_notificationChannelId_fkey" FOREIGN KEY ("notificationChannelId") REFERENCES "NotificationChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerts" ADD CONSTRAINT "Alerts_notificationChannelId_fkey" FOREIGN KEY ("notificationChannelId") REFERENCES "NotificationChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

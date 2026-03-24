/*
  Warnings:

  - You are about to drop the column `notificationChannelId` on the `Alerts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alerts" DROP CONSTRAINT "Alerts_notificationChannelId_fkey";

-- DropIndex
DROP INDEX "Alerts_websiteId_notificationChannelId_key";

-- AlterTable
ALTER TABLE "Alerts" DROP COLUMN "notificationChannelId";

-- CreateTable
CREATE TABLE "AlertNotification" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "notificationChannelId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertNotification_alertId_idx" ON "AlertNotification"("alertId");

-- CreateIndex
CREATE INDEX "Alerts_websiteId_idx" ON "Alerts"("websiteId");

-- AddForeignKey
ALTER TABLE "AlertNotification" ADD CONSTRAINT "AlertNotification_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "Alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertNotification" ADD CONSTRAINT "AlertNotification_notificationChannelId_fkey" FOREIGN KEY ("notificationChannelId") REFERENCES "NotificationChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

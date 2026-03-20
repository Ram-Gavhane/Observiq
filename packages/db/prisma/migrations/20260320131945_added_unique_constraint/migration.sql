/*
  Warnings:

  - A unique constraint covering the columns `[websiteId,notificationChannelId]` on the table `Alerts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Alerts_websiteId_notificationChannelId_key" ON "Alerts"("websiteId", "notificationChannelId");

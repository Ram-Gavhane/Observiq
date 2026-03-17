import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { createNotificationChannel, deleteNotificationChannel, getNotificationChannels } from "./notification.controller";

const router = Router();

router.post("/create-channel", authMiddleware, createNotificationChannel);
router.get("/get-channels", authMiddleware, getNotificationChannels);
router.delete("/delete-channel/:id", authMiddleware, deleteNotificationChannel);

export default router;
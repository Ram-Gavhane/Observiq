import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { createWebsiteStatusPage, deleteWebsiteStatusPage, getStatusPage } from "./statuspage.controller";

const router = Router();

router.post("/monitors/:id/statuspage", authMiddleware, createWebsiteStatusPage);
router.post("/website/:id/statuspage", authMiddleware, createWebsiteStatusPage);
router.get("/statuspage/:monitorId", getStatusPage);
router.delete("/monitors/:monitorId/statuspage", authMiddleware, deleteWebsiteStatusPage);
router.delete("/website/:monitorId/statuspage", authMiddleware, deleteWebsiteStatusPage);

export default router;

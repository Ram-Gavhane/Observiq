import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { createWebsiteStatusPage, deleteWebsiteStatusPage, getStatusPage } from "./statuspage.controller";

const router = Router();

router.post("/website/:id/statuspage", authMiddleware, createWebsiteStatusPage);
router.get("/statuspage/:websiteId", getStatusPage);
router.delete("/website/:websiteId/statuspage", authMiddleware, deleteWebsiteStatusPage);

export default router;

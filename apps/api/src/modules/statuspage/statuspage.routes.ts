import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { createWebsiteStatusPage, getStatusPage } from "./statuspage.controller";

const router = Router();

router.post("/website/:id/statuspage", authMiddleware, createWebsiteStatusPage);
router.get("/statuspage/:websiteId", getStatusPage);

export default router;

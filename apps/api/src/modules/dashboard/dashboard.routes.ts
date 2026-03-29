import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { getDashboardStatsHandler } from "./dashboard.controller";

const router = Router();

router.get("/dashboard/stats", authMiddleware, getDashboardStatsHandler);

export default router;

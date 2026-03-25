import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { addMonitor, deleteMonitor, getMonitorChecks, getMonitorDetails, getMonitorInsights, getMonitors } from "./monitors.controller";

const router = Router();

router.post("/add-monitor", authMiddleware, addMonitor);
router.get("/get-monitors", authMiddleware, getMonitors);
router.get("/monitor/:id", authMiddleware, getMonitorDetails);
router.get("/monitor/:id/insights", authMiddleware, getMonitorInsights);
router.get("/monitor/:id/checks", authMiddleware, getMonitorChecks);
router.delete("/monitor/:id", authMiddleware, deleteMonitor);

export default router;

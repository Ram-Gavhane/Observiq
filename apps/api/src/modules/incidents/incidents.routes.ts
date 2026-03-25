import { Router } from "express";
import { getIncidentTimeline, getIncidents } from "./incidents.controller";
import authMiddleware from "../../common/auth/middleware";

const router = Router();

router.get("/get-incidents", authMiddleware, getIncidents);
router.get("/get-incident-timeline/:incidentId", authMiddleware, getIncidentTimeline);

export default router;

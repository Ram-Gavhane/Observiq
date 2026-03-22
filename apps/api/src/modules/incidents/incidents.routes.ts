import { Router } from "express";
import { getIncidentTimeline, getIncidents } from "./incidents.controller";

const router = Router();

router.get("/get-incidents", getIncidents);
router.get("/get-incident-timeline/:alertId", getIncidentTimeline);

export default router;
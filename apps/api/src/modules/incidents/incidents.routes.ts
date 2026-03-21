import { Router } from "express";
import { getIncidents } from "./incidents.controller";

const router = Router();

router.get("/get-incidents", getIncidents);

export default router;
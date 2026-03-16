import { Router } from "express";
import { createIncident } from "./incidents.controller";

const router = Router();

router.post("/create-incident", createIncident)

export default router;
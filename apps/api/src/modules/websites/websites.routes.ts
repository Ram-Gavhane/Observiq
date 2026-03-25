import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { addWebsite, deleteWebsite, getWebsites } from "./websites.controller";

const router = Router();

router.post("/add-website", authMiddleware, addWebsite);
router.get("/get-websites", authMiddleware, getWebsites);
router.delete("/delete-website/:id", authMiddleware, deleteWebsite);

export default router;

import { Router } from "express";
import authMiddleware from "../../common/auth/middleware";
import { addWebsite, getWebsite, getWebsiteInsights, getWebsites, removeWebsite, updateWebsiteChannelsController } from "./websites.controller";

const router = Router();

router.post("/add-website", authMiddleware, addWebsite);
router.get("/get-websites", authMiddleware, getWebsites);
router.get("/website/:id", authMiddleware, getWebsite);
router.get("/website/:id/insights", authMiddleware, getWebsiteInsights);
router.put("/website/:id/channels", authMiddleware, updateWebsiteChannelsController);
router.delete("/website/:id", removeWebsite);

export default router;

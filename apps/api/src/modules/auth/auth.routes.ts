import { Router } from "express";
import { signin, signup, getMe, updateMe } from "./auth.controller";
import authMiddleware from "../../common/auth/middleware";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);

export default router;

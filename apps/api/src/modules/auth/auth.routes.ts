import { Router } from "express";
import { signin, signup, getMe } from "./auth.controller";
import authMiddleware from "../../common/auth/middleware";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/me", authMiddleware, getMe);

export default router;

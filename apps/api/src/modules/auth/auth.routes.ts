import { Router } from "express";
import { signin, signup, getMe, updateMe, changePassword, getSessions, logout } from "./auth.controller";
import authMiddleware from "../../common/auth/middleware";

const router = Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.put("/me/password", authMiddleware, changePassword);
router.get("/sessions", authMiddleware, getSessions);

export default router;

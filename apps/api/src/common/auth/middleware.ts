import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; sessionId?: string };
    req.userId = decoded.id;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default authMiddleware;

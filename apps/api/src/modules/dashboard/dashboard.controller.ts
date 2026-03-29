import type { Request, Response } from "express";
import { getDashboardStats } from "./dashboard.service";

export const getDashboardStatsHandler = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const data = await getDashboardStats(userId);
    res.json(data);
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

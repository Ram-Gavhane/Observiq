import type { Request, Response } from "express";
import { MonitorType, REGION } from "@repo/db";
import {
  createMonitor,
  deleteMonitorForUser,
  getMonitorForUser,
  getMonitorsByUser,
  getMonitorInsights as getMonitorInsightsService,
  getMonitorChecks as getMonitorChecksService,
} from "./monitors.service";

const ALLOWED_TYPES = new Set(Object.values(MonitorType));
const ALLOWED_REGIONS = new Set(Object.values(REGION));

const normalizeRegions = (regions: unknown) => {
  if (!Array.isArray(regions)) return null;
  const normalized = regions
    .map((r) => (typeof r === "string" ? r.toUpperCase() : ""))
    .filter((r) => ALLOWED_REGIONS.has(r as REGION)) as REGION[];
  return normalized.length > 0 ? normalized : null;
};

export const addMonitor = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, type, target, regions, intervalSec, config } = req.body;

  if (!name || !type || !target) {
    return res.status(400).json({ message: "name, type and target are required" });
  }

  if (!ALLOWED_TYPES.has(type)) {
    return res.status(400).json({ message: "Invalid monitor type" });
  }

  const normalizedRegions = normalizeRegions(regions);
  if (!normalizedRegions) {
    return res.status(400).json({ message: "At least one valid region is required" });
  }

  try {
    const monitor = await createMonitor({
      userId,
      name,
      type,
      target,
      regions: normalizedRegions,
      intervalSec,
      config,
    });

    res.json({ message: "Monitor created successfully", monitor });
  } catch (error) {
    console.error("Failed to create monitor", error);
    res.status(500).json({ message: "Failed to create monitor" });
  }
};

export const getMonitors = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const monitors = await getMonitorsByUser(userId);
    res.json({ monitors });
  } catch (error) {
    console.error("Failed to fetch monitors", error);
    res.status(500).json({ message: "Failed to fetch monitors" });
  }
};

export const getMonitorDetails = async (req: Request, res: Response) => {
  const userId = req.userId;
  const monitorId = req.params.id as string;

  try {
    const monitor = await getMonitorForUser(userId, monitorId);
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    res.json({ monitor });
  } catch (error) {
    console.error("Failed to fetch monitor", error);
    res.status(500).json({ message: "Failed to fetch monitor" });
  }
};

export const deleteMonitor = async (req: Request, res: Response) => {
  const userId = req.userId;
  const monitorId = req.params.id as string;

  try {
    const monitor = await deleteMonitorForUser(userId, monitorId);
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }
    res.json({ message: "Monitor deleted", monitor });
  } catch (error) {
    console.error("Failed to delete monitor", error);
    res.status(500).json({ message: "Failed to delete monitor" });
  }
};

export const getMonitorInsights = async (req: Request, res: Response) => {
  const monitorId = req.params.id as string;
  try {
    const insights = await getMonitorInsightsService(monitorId);
    res.json(insights);
  } catch (error) {
    console.error("Failed to fetch monitor insights", error);
    res.status(500).json({ message: "Failed to fetch monitor insights" });
  }
};

export const getMonitorChecks = async (req: Request, res: Response) => {
  const monitorId = req.params.id as string;
  try {
    const checks = await getMonitorChecksService(monitorId);
    res.json({ checks });
  } catch (error) {
    console.error("Failed to fetch monitor checks", error);
    res.status(500).json({ message: "Failed to fetch monitor checks" });
  }
};

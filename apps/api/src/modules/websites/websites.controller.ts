import type { Request, Response } from "express";
import { REGION } from "@repo/db";
import { createWebsiteMonitor, deleteWebsiteForUser, getWebsitesForUser } from "./websites.service";

const ALLOWED_REGIONS = new Set(Object.values(REGION));

const normalizeRegions = (regions: unknown) => {
  if (!Array.isArray(regions)) return null;
  const normalized = regions
    .map((r) => (typeof r === "string" ? r.toUpperCase() : ""))
    .filter((r) => ALLOWED_REGIONS.has(r as REGION)) as REGION[];
  return normalized.length > 0 ? normalized : null;
};

export const addWebsite = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { url, regions } = req.body;

  if (!url) {
    return res.status(400).json({ message: "url is required" });
  }

  const normalizedRegions = normalizeRegions(regions);
  if (!normalizedRegions) {
    return res.status(400).json({ message: "At least one valid region is required" });
  }

  try {
    const website = await createWebsiteMonitor(userId, url, normalizedRegions);
    res.json({ message: "Website added successfully", website });
  } catch (error) {
    console.error("Failed to add website", error);
    res.status(500).json({ message: "Failed to add website" });
  }
};

export const getWebsites = async (req: Request, res: Response) => {
  const userId = req.userId;
  try {
    const websites = await getWebsitesForUser(userId);
    res.json({ websites });
  } catch (error) {
    console.error("Failed to fetch websites", error);
    res.status(500).json({ message: "Failed to fetch websites" });
  }
};

export const deleteWebsite = async (req: Request, res: Response) => {
  const userId = req.userId;
  const monitorId = req.params.id as string;

  try {
    const website = await deleteWebsiteForUser(userId, monitorId);
    if (!website) {
      return res.status(404).json({ message: "Website not found" });
    }
    res.json({ message: "Website deleted", website });
  } catch (error) {
    console.error("Failed to delete website", error);
    res.status(500).json({ message: "Failed to delete website" });
  }
};

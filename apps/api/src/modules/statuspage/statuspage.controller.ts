import type { Request, Response } from "express";
import {
  createStatusPage,
  getLatestTicks,
  getStatusPageByWebsiteId,
  getWebsiteById,
} from "./statuspage.service";

export const createWebsiteStatusPage = async (req: Request, res: Response) => {
  const websiteId = req.params.id as string;
  const { title, description } = req.body;

  const website = await getWebsiteById(websiteId);

  if (!website || website.userId !== req.userId) {
    return res.status(403).json({ message: "Unauthorized or website not found" });
  }

  try {
    const statusPage = await createStatusPage(
      websiteId,
      title || `${website.url} Status`,
      description || `Real-time status for ${website.url}`
    );

    res.json({
      message: "Status page created successfully",
      statusPage,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Status page already exists for this website" });
    }
    res.status(500).json({ message: "Failed to create status page" });
  }
};

export const getStatusPage = async (req: Request, res: Response) => {
  const websiteId = req.params.websiteId as string;

  try {
    const statusPage = await getStatusPageByWebsiteId(websiteId);

    if (!statusPage) {
      return res.status(404).json({ message: "Status page not found" });
    }

    const latestTicks = await getLatestTicks(websiteId, 500);

    res.json({
      statusPage,
      latestTicks,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch status page" });
  }
};

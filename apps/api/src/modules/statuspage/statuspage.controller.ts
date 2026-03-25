import type { Request, Response } from "express";
import {
  createStatusPage,
  deleteStatusPage,
  getLatestResults,
  getStatusPageByMonitorId,
  getMonitorById,
} from "./statuspage.service";

export const createWebsiteStatusPage = async (req: Request, res: Response) => {
  const monitorId = req.params.id as string;
  const { title, description } = req.body;

  const monitor = await getMonitorById(monitorId);

  if (!monitor || monitor.userId !== req.userId) {
    return res.status(403).json({ message: "Unauthorized or monitor not found" });
  }

  try {
    const statusPage = await createStatusPage(
      monitorId,
      title || `${monitor.name} Status`,
      description || `Real-time status for ${monitor.target}`
    );

    res.json({
      message: "Status page created successfully",
      statusPage,
    });
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Status page already exists for this monitor" });
    }
    res.status(500).json({ message: "Failed to create status page" });
  }
};

export const getStatusPage = async (req: Request, res: Response) => {
  const monitorId = req.params.monitorId as string;

  try {
    const statusPage = await getStatusPageByMonitorId(monitorId);

    if (!statusPage) {
      return res.status(404).json({ message: "Status page not found" });
    }

    const latestTicks = await getLatestResults(monitorId, 500);

    res.json({
      statusPage,
      latestTicks,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch status page" });
  }
};

export const deleteWebsiteStatusPage = async (req: Request, res: Response) => {
  const monitorId = req.params.monitorId as string;

  const monitor = await getMonitorById(monitorId);

  if (!monitor || monitor.userId !== req.userId) {
    return res.status(403).json({ message: "Unauthorized or monitor not found" });
  }

  try {
    const statusPage = await deleteStatusPage(monitorId);

    res.json({
      message: "Status page deleted successfully",
      statusPage,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete status page" });
  }
}

import type { Request, Response } from "express";
import type { WebsiteTick } from "../../common/types";
import {
  countTicksSince,
  countUpTicksSince,
  createWebsite,
  deleteWebsite,
  deleteWebsiteTicks,
  findUserById,
  getLatestTicks,
  getTicksSince,
  getWebsiteById,
  listWebsitesForUser,
} from "./websites.service";
import { xAddBulk } from "@repo/redisstreams";

export const addWebsite = async (req: Request, res: Response) => {
  const { url, regions } = req.body;
  const userId = req.userId;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const response = await createWebsite(url, regions, userId);
    await xAddBulk([{ id: response.id, regions, url }])
    res.json({
      message: "Website added successfully",
      response,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error });
  }
};

export const getWebsites = async (req: Request, res: Response) => {
  const userId = req.userId;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const websites = await listWebsitesForUser(userId);
  res.json({
    message: "Websites fetched successfully",
    websites,
  });
};

export const getWebsite = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const website = await getWebsiteById(id);
  const latestTicks = await getLatestTicks(id, 10);

  res.json({
    message: "Website fetched successfully",
    website,
    latestTicks,
  });
};

export const updateWebsiteChannelsController = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { channelIds } = req.body;
  const userId = req.userId;

  const website = await getWebsiteById(id);
  if (!website || website.userId !== userId) {
    return res.status(404).json({ message: "Website not found or unauthorized" });
  }

  try {
    await import("./websites.service").then(srv => srv.updateWebsiteChannels(id, channelIds || []));
    res.json({ message: "Channels updated successfully" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to update channels" });
  }
};

export const getWebsiteInsights = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.userId;

  const website = await getWebsiteById(id);
  if (!website || website.userId !== userId) {
    return res.status(404).json({ message: "Website not found or unauthorized" });
  }

  const now = new Date();
  const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const ticks24h: WebsiteTick[] = await getTicksSince(id, ago24h);

    const total7dTicks = await countTicksSince(id, ago7d);
    const up7dTicks = await countUpTicksSince(id, ago7d);

    const uptime7d = total7dTicks > 0 ? (up7dTicks / total7dTicks) * 100 : 0;

    let up24hTicks = 0;
    const responseTimeTrends: { time: string; responseTime: number }[] = [];

    ticks24h.forEach((tick) => {
      if (tick.status === "UP") up24hTicks++;
      const timeStr = new Date(tick.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      responseTimeTrends.push({
        time: timeStr,
        responseTime: tick.responseTimeMs,
      });
    });

    const uptime24h = ticks24h.length > 0 ? (up24hTicks / ticks24h.length) * 100 : 0;

    res.json({
      uptime24h: uptime24h.toFixed(2),
      uptime7d: uptime7d.toFixed(2),
      responseTimeTrends,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch insights" });
  }
};

export const removeWebsite = async (req: Request, res: Response) => {
  const websiteId = req.params.id as string;

  try {
    const response = await deleteWebsiteTicks(websiteId);
    if (!response) {
      res.json({ message: "An error occured while deleting website try again" });
      return;
    }
    await deleteWebsite(websiteId);
    res.status(200).json({ message: "Webiste deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

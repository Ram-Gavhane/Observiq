import type { Request, Response } from "express";
import prismaClient from "@repo/db";

export const getIncidents = async (req: Request, res: Response) => {
    const userId = req.userId;
    const monitors = await prismaClient.monitor.findMany({
        where: { userId },
        select: { id: true, name: true, target: true, type: true },
    });
    const monitorIds = monitors.map((m) => m.id);

    const incidents = await prismaClient.incident.findMany({
        where: { monitorId: { in: monitorIds } },
        include: { monitor: true },
        orderBy: { startedAt: "desc" },
    });

    res.json(incidents);
}

export const getIncidentTimeline = async (req: Request, res: Response) => {
    const incidentId = req.params.incidentId as string;

    const events = await prismaClient.incidentEvent.findMany({
        where: { incidentId },
        include: { incident: true },
        orderBy: { createdAt: "asc" },
    });

    res.json(events);
}

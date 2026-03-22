import type { Request, Response } from "express";
import prismaClient from "@repo/db";

export const getIncidents = async (req: Request, res: Response) => {
    const userId = req.userId;

    const incidents = await prismaClient.alerts.findMany({
        where: {
            website: {
                userId,
            },
        },
        include: {
            website: true,
        },
        orderBy: {
            triggeredAt: "desc"
        }
    });

    res.json(incidents);
}

export const getIncidentTimeline = async (req: Request, res: Response) => {
    const alertId = req.params.alertId as string;

    const events = await prismaClient.incidentEvent.findMany({
        where: {
            alertId
        },
        include: {
            alert: true,
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    res.json(events);
}
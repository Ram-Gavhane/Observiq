import type { Request, Response } from "express";
import prismaClient from "@repo/db";

export const getIncidents = async (req: Request, res: Response) => {
    const userId = req.userId;
    console.log(userId);
    const websites = await prismaClient.website.findMany({
        where: {
            userId,
        }
    });
    console.log(websites);

    const incidents = await prismaClient.alerts.findMany({
        where: {
            websiteId: {
                in: websites.map(w => w.id),
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
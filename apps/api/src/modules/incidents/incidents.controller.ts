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
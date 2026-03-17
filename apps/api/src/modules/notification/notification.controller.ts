import type { Request, Response } from "express";
import prismaClient from "@repo/db";

export const createNotificationChannel = async (req: Request, res: Response) => {
    const { type, config } = req.body;
    const userId = req.userId;

    const notificationChannel = await prismaClient.notificationChannel.create({
        data: {
            userId,
            type,
            config,
        },
    });

    res.json(notificationChannel);
}

export const getNotificationChannels = async (req: Request, res: Response) => {
    const userId = req.userId;

    const notificationChannels = await prismaClient.notificationChannel.findMany({
        where: {
            userId,
        },
    });

    if (!notificationChannels) {
        res.json({
            message: "No notification channels found",
            notificationChannels: []
        })
        return;
    }

    res.json(notificationChannels);
}

export const deleteNotificationChannel = async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const userId = req.userId;

    const notificationChannel = await prismaClient.notificationChannel.delete({
        where: {
            id,
            userId,
        },
    });

    res.json(notificationChannel);
}
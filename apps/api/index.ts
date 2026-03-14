import prismaClient from "@repo/db";
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./config";
import middleware from "./middleware";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is up");
});

app.post("/signup", async (req, res) => {
    const { email, password } = req.body;
    const user = await prismaClient.user.findUnique({
        where: {
            email,
        },
    });
    if (user) {
        return res.status(400).json({ message: "User associated with this email already exists" });
    }
    try {
        const user = await prismaClient.user.create({
            data: {
                email,
                password,
            },
        });
        res.json({
            message: "User created successfully",
            userId: user.id
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error });
    }
});

app.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    const user = await prismaClient.user.findUnique({
        where: {
            email,
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (user.password !== password) {
        return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({
        message: "User signed in successfully",
        token
    });
});

app.post("/add-website", middleware, async (req, res) => {
    const { url, regions } = req.body;
    const userId = req.userId;
    const user = await prismaClient.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    try {
        const response = await prismaClient.website.create({
            data: {
                url,
                userId: userId,
                regions
            },
        });
        res.json({
            message: "Website added successfully",
            response
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ error });
    }
});

app.get("/get-websites", middleware, async (req, res) => {
    const userId = req.userId;
    const user = await prismaClient.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const websites = await prismaClient.website.findMany({
        where: {
            userId: userId,
        },
        include: {
            statusPage: true
        }
    });
    res.json({
        message: "Websites fetched successfully",
        websites
    });
});

app.get("/website/:id", middleware, async (req, res) => {
    const id = req.params.id as string;
    const website = await prismaClient.website.findFirst({
        where: {
            id
        }
    })
    const latestTicks = await prismaClient.websiteTick.findMany({
        where: {
            websiteId: id
        },
        take: 10,
        orderBy: {
            createdAt: "desc"
        }
    });
    res.json({
        message: "Website fetched successfully",
        website,
        latestTicks
    });
});

app.get("/website/:id/insights", middleware, async (req, res) => {
    const id = req.params.id as string;
    const userId = req.userId;

    // Verify website ownership
    const website = await prismaClient.website.findFirst({
        where: { id, userId }
    });

    if (!website) {
        return res.status(404).json({ message: "Website not found or unauthorized" });
    }

    const now = new Date();
    const ago24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const ago7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    try {
        // Fetch 24h ticks
        const ticks24h = await prismaClient.websiteTick.findMany({
            where: {
                websiteId: id,
                createdAt: { gte: ago24h }
            },
            select: { status: true, responseTimeMs: true, createdAt: true },
            orderBy: { createdAt: "asc" } // Order chronological for chart
        });

        // count UP, count DOWN for 7d
        const total7dTicks = await prismaClient.websiteTick.count({
            where: { websiteId: id, createdAt: { gte: ago7d } }
        });
        const up7dTicks = await prismaClient.websiteTick.count({
            where: { websiteId: id, createdAt: { gte: ago7d }, status: "UP" }
        });

        const uptime7d = total7dTicks > 0 ? (up7dTicks / total7dTicks) * 100 : 0;
        
        let up24hTicks = 0;
        const responseTimeTrends: { time: string, responseTime: number }[] = [];
        
        ticks24h.forEach(tick => {
            if (tick.status === "UP") up24hTicks++;
            // Downsample for the chart if many, but for now we just map them directly
            // e.g. "14:00"
            const timeStr = new Date(tick.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            responseTimeTrends.push({
                time: timeStr,
                responseTime: tick.responseTimeMs
            });
        });

        const uptime24h = ticks24h.length > 0 ? (up24hTicks / ticks24h.length) * 100 : 0;

        res.json({
            uptime24h: uptime24h.toFixed(2),
            uptime7d: uptime7d.toFixed(2),
            responseTimeTrends
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch insights" });
    }
});

app.delete("/website/:id", async (req, res) => {
    const websiteId = req.params.id;
    try {
        const response = await prismaClient.websiteTick.deleteMany({
            where: {
                websiteId
            }
        })
        if (!response) {
            res.json({
                message: "An error occured while deleting website try again"
            })
            return;
        }
        await prismaClient.website.delete({
            where: {
                id: websiteId
            }
        })
        res.status(200).json({
            message: "Webiste deleted successfully"
        })
    } catch (err) {
        res.status(500).json(err)
    }
});

app.post("/website/:id/statuspage", middleware, async (req, res) => {
    const websiteId = req.params.id as string;
    const { title, description } = req.body;

    // Ensure website exists and belongs to user
    const website = await prismaClient.website.findUnique({
        where: { id: websiteId }
    });

    if (!website || website.userId !== req.userId) {
        return res.status(403).json({ message: "Unauthorized or website not found" });
    }

    try {
        const statusPage = await prismaClient.statusPage.create({
            data: {
                title: title || `${website.url} Status`,
                description: description || `Real-time status for ${website.url}`,
                websiteId
            }
        });
        res.json({
            message: "Status page created successfully",
            statusPage
        });
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') {
            return res.status(400).json({ message: "Status page already exists for this website" });
        }
        res.status(500).json({ message: "Failed to create status page" });
    }
});

app.get("/statuspage/:websiteId", async (req, res) => {
    const websiteId = req.params.websiteId as string;
    try {
        const statusPage = await prismaClient.statusPage.findUnique({
            where: { websiteId },
            include: {
                website: true
            }
        });

        if (!statusPage) {
            return res.status(404).json({ message: "Status page not found" });
        }

        const latestTicks = await prismaClient.websiteTick.findMany({
            where: { websiteId },
            take: 500,
            orderBy: { createdAt: "desc" }
        });

        res.json({
            statusPage,
            latestTicks
        });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch status page" });
    }
});


app.listen(3001, () => {
    console.log("Server started on port 3001");
});
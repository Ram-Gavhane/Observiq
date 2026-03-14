import prismaClient, { REGION as RegionEnum } from "@repo/db";
import { xAckBulk, xReadGroup } from "@repo/redisstreams";
import axios from "axios";

const REGION: RegionEnum = process.env.REGION! as RegionEnum;

type messageType = {
    id: string,
    url: string,
    region: RegionEnum
}


async function main() {
    while (1) {
        const result = await xReadGroup(REGION, `${REGION}-worker-1`);
        if (!result) {
            continue;
        }

        // Only process health checks meant for this specific region
        const regionSpecificMessages = result.filter(message => message.message.region === REGION);

        let promises = regionSpecificMessages.map((message) =>
            checkWebsiteHealth({
                id: message.message.id,
                url: message.message.url,
                region: message.message.region as RegionEnum
            })
        );

        await Promise.all(promises);

        xAckBulk(REGION, result.map(({ id }) => id));
    }
}

async function checkWebsiteHealth(website: messageType) {
    const startTime = Date.now();
    let status: "UP" | "DOWN" = "UP";

    try {
        await axios.get(website.url);
    } catch (error) {
        status = "DOWN";
    }

    const endTime = Date.now();

    try {
        await prismaClient.websiteTick.create({
            data: {
                websiteId: website.id,
                status: status,
                responseTimeMs: endTime - startTime,
                region: REGION
            }
        });
    } catch (dbError: any) {
        // If the website was deleted from DB but still in Redis stream, we ignore the P2003 constraint error.
        if (dbError.code === 'P2003') {
            console.log(`Website ${website.id} no longer exists. Skipping tick.`);
        } else {
            console.error(`Failed to save tick for website ${website.id}:`, dbError);
        }
    }
}

main();
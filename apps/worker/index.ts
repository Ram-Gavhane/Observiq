import prismaClient from "@repo/db";
import { xAckBulk, xReadGroup } from "@repo/redisstreams";
import axios from "axios";

type messageType = {
    id: string,
    url: string
}


async function main() {
    while (1) {
        const result = await xReadGroup("USA", "us-worker-1");
        if (!result) {
            continue;
        }
        let promises = result.map((message) => checkWebsiteHealth({ id: message.message.id, url: message.message.url }))
        await Promise.all(promises);

        xAckBulk("USA", result.map(({ id }) => id));
    }
}

async function checkWebsiteHealth(website: messageType) {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();

        axios.get(website.url).then(async (response) => {
            const endTime = Date.now();
            await prismaClient.websiteTick.create({
                data: {
                    websiteId: website.id,
                    status: "UP",
                    responseTimeMs: endTime - startTime,
                    region: "US"
                }
            })
            resolve();
        }).catch(async (error) => {
            const endTime = Date.now();
            await prismaClient.websiteTick.create({
                data: {
                    websiteId: website.id,
                    status: "DOWN",
                    responseTimeMs: endTime - startTime,
                    region: "US"
                }
            })
            resolve();
        })
    })
}

main();
import prismaClient from "@repo/db";
import { client, xAddBulk } from "@repo/redisstreams";

async function main() {
    const websites = await prismaClient.website.findMany({
        where: {
            nextCheckAt: {
                lte: new Date()
            }
        }
    });

    await xAddBulk(websites.map(website => ({
        url: website.url,
        id: website.id,
        regions: website.regions,
    })));

    await prismaClient.website.updateMany({
        where: {
            id: {
                in: websites.map(w => w.id)
            }
        },
        data: {
            nextCheckAt: new Date(Date.now() + 1 * 60 * 1000)
        }
    });
}

async function createConsumerGroup() {
    const groups = ['US', 'EU', 'INDIA'];
    for (const group of groups) {
        try {
            await client.xGroupCreate('better-uptime:website', group, '$', { MKSTREAM: true });
            console.log(`Group ${group} created`);
        } catch (e: any) {
            const errMsg = String(e);
            if (errMsg.includes('BUSYGROUP')) {
                console.log(`Group ${group} already exists, skipping`);
            } else {
                console.log(`Error creating group ${group}:`, e);
            }
        }
    }
}

setInterval(() => {
    main();
}, 1 * 60 * 1000);

createConsumerGroup();
main();
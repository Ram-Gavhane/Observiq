import prismaClient from "@repo/db";
import { client, xAddBulk } from "@repo/redisstreams";

async function main() {
    const websites = await prismaClient.website.findMany({
        select: {
            url: true,
            id: true,
        }
    });

    await xAddBulk(websites.map(website => ({
        url: website.url,
        id: website.id,
    })));
}

async function createConsumerGroup() {
    try {
        const response = await client.xGroupCreate('better-uptime:website', 'USA', '$');
        if (response === "OK") {
            return;
        } else {
            console.log("Group already exists")
        }
    } catch (e) {

    }


}

setInterval(() => {
    main();
}, 3 * 60 * 1000);

createConsumerGroup();
main();
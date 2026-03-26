import { claimDueMonitors } from "@repo/db";
import { client, xAddBulk } from "@repo/redisstreams";

async function main() {
    const monitors = await claimDueMonitors(1 * 60 * 1000);
    console.log("monitors", monitors);
    await xAddBulk(monitors.map(monitor => ({
        id: monitor.id,
        type: monitor.type,
        target: monitor.target,
        regions: monitor.regions,
        config: monitor.config as Record<string, unknown>,
    })));


}

async function createConsumerGroup() {
    const groups = ['US', 'EU', 'INDIA'];
    for (const group of groups) {
        try {
            await client.xGroupCreate('better-uptime:monitor', group, '$', { MKSTREAM: true });
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

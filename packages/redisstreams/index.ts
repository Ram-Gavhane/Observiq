import { createClient } from 'redis';
import { REGION as RegionEnum } from '@repo/db';


const client = createClient({
    url: process.env.REDIS_URL
});

client.on("error", function (err) {
    throw err;
});
async function connectRedis() {
    await client.connect()
}
connectRedis();

type monitorJob = {
    id: string;
    type: string;
    target: string;
    regions: RegionEnum[];
    config?: Record<string, unknown>;
};

type redisStreamResultType = {
    name: string,
    messages: {
        id: string;
        message: {
            id: string,
            type: string,
            target: string,
            region: RegionEnum,
            config?: string
        }
    }[]
}

type messageType = {
    id: string,
    message: {
        id: string,
        type: string,
        target: string,
        region: RegionEnum,
        config?: string
    }
}

const STREAM_NAME = "better-uptime:monitor";


async function xAddBulk(monitors: monitorJob[]) {
    for (let i = 0; i < monitors.length; i++) {
        for (let regions = 0; regions < monitors[i]!.regions.length; regions++) {
            await client.xAdd(STREAM_NAME, '*', {
                id: monitors[i]!.id,
                type: monitors[i]!.type,
                target: monitors[i]!.target,
                region: monitors[i]!.regions[regions] as string,
                config: JSON.stringify(monitors[i]!.config || {}),
            })
        }
    }
}

async function xReadGroup(consumerGroupId: string, workerId: string, waitingPeriod: number): Promise<messageType[] | undefined> {
    const redisStreamResult = await client.xReadGroup(consumerGroupId, workerId, {
        key: STREAM_NAME,
        id: '>'
    }, {
        COUNT: 5,
        BLOCK: waitingPeriod
    }
    )
    const messages = redisStreamResult as redisStreamResultType[] | undefined;
    const result: messageType[] | undefined = messages?.[0]?.messages;
    return result;
}

async function xAck(consumerGroup: string, eventId: string) {
    await client.xAck(STREAM_NAME, consumerGroup, eventId)
}

async function xAckBulk(consumerGroup: string, eventIds: string[]) {
    eventIds.map(eventId => xAck(consumerGroup, eventId));
}
export { xAddBulk, xReadGroup, xAckBulk, client };

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

type websiteData = {
    url: string;
    id: string;
    regions: RegionEnum[];
}

type redisStreamResultType = {
    name: string,
    messages: {
        id: string;
        message: {
            id: string,
            url: string,
            region: RegionEnum
        }
    }[]
}

type messageType = {
    id: string,
    message: {
        id: string,
        url: string,
        region: RegionEnum
    }
}

const STREAM_NAME = "better-uptime:website";


async function xAddBulk(websites: websiteData[]) {
    for (let i = 0; i < websites.length; i++) {
        for (let regions = 0; regions < websites[i]!.regions.length; regions++) {
            await client.xAdd(STREAM_NAME, '*', {
                url: websites[i]!.url,
                id: websites[i]!.id,
                region: websites[i]!.regions[regions] as string
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
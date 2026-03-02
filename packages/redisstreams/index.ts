import { createClient } from 'redis';

const client = await createClient()
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

type websiteData = {
    url: string;
    id: string;
}

type redisStreamResultType = {
    name: string,
    messages: {
        id: string;
        message: {
            id: string,
            url: string
        }
    }[]
}

type messageType = {
    id: string,
    message: {
        id: string,
        url: string
    }
}

const STREAM_NAME = "better-uptime:website";


async function xAddBulk(websites: websiteData[]) {
    for (let i = 0; i < websites.length; i++) {
        await client.xAdd(STREAM_NAME, '*', {
            url: websites[i]!.url,
            id: websites[i]!.id
        })
    }
}

async function xReadGroup(consumerGroupId: string, workerId: string): Promise<messageType[] | undefined> {
    const redisStreamResult = await client.xReadGroup(consumerGroupId, workerId, {
        key: STREAM_NAME,
        id: '>'
    }, {
        COUNT: 5
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
import { createClient, RedisClientType } from 'redis'
import { logger } from './logger'

const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
}

let redisClient: RedisClientType

export async function connectToRedis() {
    redisClient = createClient({
        url: `redis://${redisConfig.host}:${redisConfig.port}`,
    })
    redisClient.on('connect', () => {
        logger.info('Connected to Redis.')
    })
    redisClient.on('error', (error: any) => {
        logger.error('Error connecting to Redis.', error)
        throw error
    })
    await redisClient.connect()
    return redisClient
}

export function getRedisClient() {
    if (!redisClient) {
        throw new Error('Redis client not initialized.')
    }
    return redisClient
}

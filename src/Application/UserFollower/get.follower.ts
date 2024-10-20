import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { getRedisClient } from '../../Connectors/redis'
import { UserFollower } from '../../Domain/user_follower'

async function getUserFollower(req: Request, res: Response) {
    const { userId } = req.params
    if (!UserFollower.isValidUserFollowerRequest({ fk_user_id: userId })) {
        res.status(400).json(new MyResponse('Invalid request', 'error', 400))
        return
    }

    const cacheKey = `follower:${userId}`
    const redisClient = getRedisClient()
    // Check if the follower is already in the list
    let followers = await redisClient.lRange(cacheKey, 0, -1)
    if (followers) {
        res.status(200).json(new MyResponse('Followers found', 'success', 200, followers))
        return
    }
    // Retrieve followers from the database
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        const [rows]: any = await connection.execute('SELECT fk_follower_id FROM user_follower WHERE fk_user_id = ?', [userId])
        // Add the followers to the cache
        followers = rows.map((row: { fk_follower_id: string }) => row.fk_follower_id)
        for (const follower of followers) {
            await redisClient.lPush(cacheKey, follower)
        }
        res.status(200).json(new MyResponse('Followers found', 'success', 200, followers))
    } catch (error) {
        logger.error('Error getting followers:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

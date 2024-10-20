import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { getRedisClient } from '../../Connectors/redis'
import { UserFollower } from '../../Domain/user_follower'

export async function addUserFollower(req: Request, res: Response) {
    const { userId, followerId } = req.params

    const cacheKey = `follower:${userId}`
    const redisClient = getRedisClient()
    // Check if the follower is already in the list
    const followers = await redisClient.lRange(cacheKey, 0, -1)
    if (followers && followers.includes(followerId)) {
        res.status(409).json(new MyResponse('User is already following the follower', 'error', 409))
        return
    }

    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        // Check if the user_follower table exists, and create it if it doesn't
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS user_followers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fk_user_id INT NOT NULL,
            fk_follower_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
        // Check if the user is already following the follower
        const [existingFollower]: any[] = await connection.execute(
            'SELECT * FROM user_followers WHERE fk_user_id = ? AND fk_follower_id = ?',
            [parseInt(userId, 10), parseInt(followerId, 10)]
        )
        if (existingFollower.length > 0) {
            res.status(409).json(new MyResponse('User is already following the follower', 'error', 409))
            return
        }
        // Insert the new follower into the database
        await connection.execute(
            'INSERT INTO user_followers (fk_user_id, fk_follower_id) VALUES (?, ?)',
            [parseInt(userId, 10), parseInt(followerId, 10)]
        )

        // Add the follower to the cache
        await redisClient.lPush(cacheKey, followerId)
        res.status(200).json(new MyResponse('Follower added successfully', 'success', 200))
    } catch (error) {
        logger.error('Error adding follower:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

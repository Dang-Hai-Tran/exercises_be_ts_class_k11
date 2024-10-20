import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { getRedisClient } from '../../Connectors/redis'

// Write function to handle create post in url POST /posts
export async function createPost(req: Request, res: Response) {
    const { content_text, visible, content_image_path } = req.body
    if (!content_text || typeof content_text !== 'string' || !visible || typeof visible !== 'boolean') {
        res.status(400).json(new MyResponse('Invalid request body', 'error', 400))
        return
    }

    const userId = req.session.userId

    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        const [rows]: any = await connection.execute('SELECT * FROM users WHERE id = ?', [req.session.userId])
        if (rows.length === 0) {
            res.status(401).json(new MyResponse('Invalid user', 'error', 401))
            return
        }
        // Create table posts if it doesn't exist
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            fk_user_id INT NOT NULL,
            content_text TEXT NOT NULL,
            content_image_path VARCHAR(255),
            visible BOOLEAN NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)
        // Insert the new post into the database
        const [row]:any = await connection.execute(
            'INSERT INTO posts (fk_user_id, content_text, visible, content_image_path) VALUES (?, ?, ?, ?)',
            [userId, content_text, visible, content_image_path || null]
        )
        const postId = row.insertId
        // Push the new post to the cache
        const cacheKey = `posts:${userId}`
        const redisClient = getRedisClient()
        // Check if the cache key exists
        const cacheExists = await redisClient.exists(cacheKey)
        if (cacheExists) {
            await redisClient.lPush(cacheKey, JSON.stringify({
                id: postId,
                fk_user_id: userId,
                content_text,
                visible,
                content_image_path,
                created_at: new Date().toDateString(),
            }))
            res.status(201).json(new MyResponse('Post created successfully', 'success', 201, { post_id: postId }))
        }
    } catch (error) {
        logger.error('Error during post creation:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

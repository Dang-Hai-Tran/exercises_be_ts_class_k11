import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { getRedisClient } from '../../Connectors/redis'

export async function seeUserPosts(req: Request, res: Response) {
    const { userId } = req.params
    const cacheKey = `posts:${userId}`
    const redisClient = getRedisClient()
    let posts = await redisClient.lRange(cacheKey, 0, -1)
    if (posts.length > 0) {
        posts = posts.map((post: string) => JSON.parse(post))
        res.status(200).json(new MyResponse('Posts found', 'success', 200, { posts: posts }))
        return
    }
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        const [rows]: any = await connection.execute('SELECT * FROM posts WHERE fk_user_id = ?', [parseInt(userId, 10)])
        posts = rows.map(
            (row: {
                id: number
                fk_user_id: number
                content_text: string
                visible: boolean
                created_at: Date
                content_image_path?: string
            }) => {
                return {
                    id: row.id,
                    fk_user_id: row.fk_user_id,
                    content_text: row.content_text,
                    visible: row.visible,
                    created_at: row.created_at.toDateString(),
                    content_image_path: row.content_image_path
                }
            }
        )
        for (const post of posts) {
            await redisClient.lPush(cacheKey, JSON.stringify(post))
        }
        res.status(200).json(new MyResponse('Posts found', 'success', 200, { posts: posts }))
    } catch (error) {
        logger.error('Error getting posts:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

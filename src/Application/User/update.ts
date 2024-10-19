import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { hash, checkHash } from '../utils/hash'
import { getRedisClient } from '../../Connectors/redis'
import { IUser } from '../../Domain/user'

export async function userUpdate(req: Request, res: Response) {
    const userId = req.session.userId
    let { password, first_name, last_name, email } = req.body
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        const [rows]: any = await connection.execute('SELECT * FROM users WHERE id = ?', [userId])
        if (rows.length === 0) {
            res.status(401).json(new MyResponse('Invalid user', 'error', 401))
            return
        }
        const user: IUser = rows[0]
        const salt = user.salt
        if (password) {
            user.password = hash(password, salt)
        }
        if (first_name) {
            user.first_name = first_name
        }
        if (last_name) {
            user.last_name = last_name
        }
        if (email) {
            user.email = email
        }
        await connection.execute(
            'UPDATE users SET password = ?, first_name = ?, last_name = ?, email = ? WHERE id = ?',
            [user.password, user.first_name, user.last_name, user.email, userId]
        )
        // Invalidate the cache
        const cacheKey = `user:${user.username}`
        const redisClient = getRedisClient()
        redisClient.del(cacheKey)
        // Update the cache
        redisClient.set(cacheKey, JSON.stringify(user), {
            EX: 60 * 60 // 1 hour
        })
        res.status(200).json(new MyResponse('User updated successfully', 'success', 200))
    }catch (error) {
        logger.error('Error during user update:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

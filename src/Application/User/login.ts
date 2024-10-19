declare module 'express-session' {
    interface SessionData {
        userId: number;
        username: string;
    }
}
import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { checkHash } from '../utils/hash'
import { getRedisClient } from '../../Connectors/redis';

export async function userLogin(req: Request, res: Response) {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(400).json(new MyResponse('Invalid request body', 'error', 400))
        return
    }

    const cacheKey = `user:${username}`
    const redisClient = getRedisClient()
    const cachedUser = await redisClient.get(cacheKey)
    if (cachedUser) {
        const user = JSON.parse(cachedUser)
        if (checkHash(password, user.salt, user.password)) {
            req.session.userId = user.id
            res.status(200).json(new MyResponse('User signed in successfully', 'success', 200))
            return
        }
        res.status(401).json(new MyResponse('Invalid password', 'error', 401))
        return
    }
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        const [rows]: any = await connection.execute('SELECT * FROM users WHERE username = ?', [username])
        if (rows.length === 0) {
            res.status(401).json(new MyResponse('Invalid username', 'error', 401))
            return
        }
        // Check password
        const hashedPassword = rows[0].password
        const salt = rows[0].salt
        if (!checkHash(password, salt, hashedPassword)) {
            res.status(401).json(new MyResponse('Invalid password', 'error', 401))
            return
        }
        // Cache user
        redisClient.set(cacheKey, JSON.stringify(rows[0]), {
            EX: 60 * 60 // 1 hour
        })
        // Create a session
        req.session.userId = rows[0].id
        res.status(200).json(new MyResponse('User signed in successfully', 'success', 200))
    } catch (error) {
        logger.error('Error during sign-in:', error)
        res.status(500).json({ message: 'Internal server error' })
    } finally {
        connection.release()
    }
}

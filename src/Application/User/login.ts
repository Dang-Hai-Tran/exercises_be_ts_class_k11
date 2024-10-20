declare module 'express-session' {
    interface SessionData {
        userId: number
        username: string
    }
}
import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { Response as MyResponse } from '../../Domain/response'
import { checkHash } from '../utils/hash'
import { getRedisClient } from '../../Connectors/redis'
import { IUser } from '../../Domain/user'

export async function userLogin(req: Request, res: Response) {
    const { username, password } = req.body
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        res.status(400).json(new MyResponse('Invalid request body', 'error', 400))
        return
    }

    const cacheKey = `user:${username}`
    const redisClient = getRedisClient()
    const cachedUser = await redisClient.hGetAll(cacheKey)
    if (Object.keys(cachedUser).length > 0) {
        if (checkHash(password, cachedUser.salt, cachedUser.password)) {
            req.session.userId = parseInt(cachedUser.id, 10)
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
        const user: IUser = rows[0]
        const hashedPassword = user.password
        const salt = user.salt
        if (!checkHash(password, salt, hashedPassword)) {
            res.status(401).json(new MyResponse('Invalid password', 'error', 401))
            return
        }
        // Cache user
        await redisClient.hSet(cacheKey, {
            id: user.id,
            username: user.username,
            salt: user.salt,
            password: user.password,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            created_at: user.created_at.toDateString()
        })
        await redisClient.expire(cacheKey, 60 * 60) // 1 hour
        // Create a session
        req.session.userId = rows[0].id
        res.status(200).json(new MyResponse('User signed in successfully', 'success', 200))
    } catch (error) {
        logger.error('Error during sign-in:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

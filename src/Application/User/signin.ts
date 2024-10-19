import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
export async function signInHandler(req: Request, res: Response) {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' })
        return
    }
    try {
        const pool = getPool()
        const [rows]: any = await pool.execute('SELECT * FROM users WHERE username = ? AND password = ?', [
            username,
            password,
        ])

        if (rows.length > 0) {
            res.status(200).json({ message: 'Sign-in successful' })
        } else {
            res.status(401).json({ message: 'Invalid username or password' })
        }
    } catch (error) {
        logger.error('Error during sign-in:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}

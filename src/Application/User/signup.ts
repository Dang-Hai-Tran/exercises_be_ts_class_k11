import { Request, Response } from 'express'
import { getPool } from '../../Connectors/db'
import { logger } from '../../Connectors/logger'
import { hash, generateSalt } from '../utils/hash'
import { User } from '../../Domain/user'
import { Response as MyResponse } from '../../Domain/response'

export async function userSignup(req: Request, res: Response) {
    // Check if the request body match the User interface
    if (!User.isValidRegisterRequest(req.body)) {
        res.status(400).json(new MyResponse('Invalid request body', 'error', 400))
        return
    }
    const { username, password, first_name, last_name, email } = req.body

    const pool = getPool()
    const connection = await pool.getConnection()
    try {
        // Hash password before storing it in the database
        const salt = generateSalt()
        const hashedPassword = hash(password, salt)
        // Check if the users table exists, and create it if it doesn't
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            salt VARCHAR(255) NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Check if the username already exists
        const [existingUser]: any[] = await pool.execute('SELECT * FROM users WHERE username = ?', [username])

        if (existingUser.length > 0) {
            res.status(409).json(new MyResponse('Username already exists', 'error', 409))
            return
        }

        // Insert the new user into the database
        await connection.execute(
            'INSERT INTO users (username, password, salt, first_name, last_name, email) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, salt, first_name, last_name, email]
        )

        res.status(201).json(new MyResponse('User registered successfully', 'success', 201))
    } catch (error) {
        logger.error('Error during user registration:', error)
        res.status(500).json(new MyResponse('Internal server error', 'error', 500))
    } finally {
        connection.release()
    }
}

import mysql from 'mysql2/promise'
import { logger } from './logger'

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: 'datran',
    password: 'datran',
    database: 'bek11',
}

let pool: mysql.Pool

export async function connectToDatabase() {
    try {
        pool = mysql.createPool(dbConfig)
        logger.info('Connected to the MySQL database.')
        return pool
    } catch (error) {
        logger.error('Error connecting to the MySQL database.', error)
        throw error
    }
}

export function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized.')
    }
    return pool
}

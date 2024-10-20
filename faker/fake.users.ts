import { getPool, connectToDatabase } from '../src/Connectors/db'
import { hash, generateSalt } from '../src/Application/utils/hash'
import { faker } from '@faker-js/faker'
import { logger } from '../src/Connectors/logger'
import fs from 'fs'
import path from 'path'

async function generateFakeUsers() {
    await connectToDatabase()
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
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
        for (let i = 0; i < 1000; i++) {
            let username = faker.internet.userName()
            // While username exists, generate a new one
            let [rows]: any = await connection.execute('SELECT * FROM users WHERE username = ?', [username])
            while (rows.length > 0) {
                username = faker.internet.userName()
                rows = await connection.execute('SELECT * FROM users WHERE username = ?', [username])
            }
            const password = faker.internet.password()
            // Add username, password to fake.users.csv file
            const filePath = path.join(__dirname, 'fake.users.csv')
            fs.appendFileSync(filePath, `${i},${username},${password}\n`)
            const salt = generateSalt()
            const hashedPassword = hash(password, salt)
            const first_name = faker.person.firstName()
            const last_name = faker.person.lastName()
            const email = faker.internet.email()
            await connection.execute(
                'INSERT INTO users (username, password, salt, first_name, last_name, email) VALUES (?, ?, ?, ?, ?, ?)',
                [username, hashedPassword, salt, first_name, last_name, email]
            )
        }
    } catch (error) {
        logger.error('Error generating fake users:', error)
    } finally {
        connection.release()
    }
}

generateFakeUsers()
    .then(() => {
        logger.info('Fake users generated successfully')
        process.exit(0)
    })
    .catch((error) => {
        process.exit(1)
    })

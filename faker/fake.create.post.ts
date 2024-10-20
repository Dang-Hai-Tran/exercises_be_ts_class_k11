import { getPool, connectToDatabase } from '../src/Connectors/db'
import { hash, generateSalt } from '../src/Application/utils/hash'
import { faker } from '@faker-js/faker'
import { logger } from '../src/Connectors/logger'

async function generateFakePosts() {
    await connectToDatabase()
    const pool = getPool()
    const connection = await pool.getConnection()
    try {
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
        for (let i = 0; i < 1000; i++) {
            const content_text = faker.lorem.paragraphs()
            const user_id = Math.floor(Math.random() * 936) + 1
            await connection.execute('INSERT INTO posts (fk_user_id, content_text, visible) VALUES (?, ?, ?)', [
                user_id,
                content_text,
                true,
            ])
        }
    } catch (error) {
        logger.error('Error during fake post generation:', error)
    } finally {
        connection.release()
    }
}

generateFakePosts()
    .then(() => {
        logger.info('Fake posts generated successfully')
        process.exit(0)
    })
    .catch((error) => {
        process.exit(1)
    })

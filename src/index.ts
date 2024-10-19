import { Server } from 'http';
import { app } from './Application/app';
import { port } from './Application/app';
import { connectToDatabase, getPool } from './Connectors/db';
import { connectToRedis, getRedisClient } from './Connectors/redis';
import { logger } from './Connectors/logger';

let server: Server;

async function start() {
    try {
        await connectToDatabase();
        await connectToRedis();
        server = app.listen(port, () => {
            logger.info(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        logger.error('Failed to start the server: ', error);
        process.exit(1);
    }
}

async function stop() {
    try {
        const pool = getPool();
        await pool.end();
        logger.info('Database connection pool closed.');
        const redisClient = getRedisClient();
        await redisClient.quit();
        logger.info('Redis connection closed.');
        if (server) {
            server.close(() => {
                logger.info('Server stopped.');
            });
        }
    } catch (error) {
        logger.error('Failed to stop the server: ', error);
    }
}

start();

// Handle shutdown
process.on('SIGTERM', stop);
process.on('SIGINT', stop);

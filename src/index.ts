import { Server } from 'http';
import { app } from './Application/app';
import { port } from './Application/app';
import { connectToDatabase, getPool } from './Connectors/db';
import { logger } from './Connectors/logger';

let server: Server;

async function start() {
    try {
        await connectToDatabase();
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

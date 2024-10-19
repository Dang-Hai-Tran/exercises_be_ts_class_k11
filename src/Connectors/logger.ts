import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level.toUpperCase()}: ${message}`)
    ),
    transports: [new transports.Console(), new transports.File({ filename: 'app.log' })]
})

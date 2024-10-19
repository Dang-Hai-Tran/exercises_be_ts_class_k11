import express from 'express'
import { router } from './router';
import compression from 'compression'
import session from 'express-session'
import dotenv from 'dotenv'

dotenv.config()

export const app = express()
export const port = process.env.PORT || 3000;

app.use(express.json())
app.use(compression())
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use('/api/v1', router)

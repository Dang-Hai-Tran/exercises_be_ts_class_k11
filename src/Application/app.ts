import express from 'express'
import { router } from './router';

export const app = express()
export const port = process.env.PORT || 3000;

app.use(express.json())
app.use('/api/v1', router)

import { Router } from 'express'
import { signInHandler } from './User/signin'
import { registerHandler } from './User/register'

export const router = Router()

router.post('/signin', signInHandler)
router.post('/register', registerHandler)

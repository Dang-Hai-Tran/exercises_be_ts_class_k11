import { Router } from 'express'
import { userLogin} from './User/login'
import { userSignup } from './User/signup'
import { authMiddleware } from './User/auth.middleware'
import { userUpdate } from './User/update'

export const router = Router()

router.post('/users/signup', userSignup)
router.post('/users/login', userLogin)
router.use(authMiddleware)
router.put('/users', userUpdate)

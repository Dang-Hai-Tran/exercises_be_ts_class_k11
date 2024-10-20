import { Router } from 'express'
import { userLogin} from './User/login'
import { userSignup } from './User/signup'
import { authMiddleware } from './User/auth.middleware'
import { userUpdate } from './User/update'
import { addUserFollower } from './UserFollower/add.follower'

export const router = Router()

// User routes
router.post('/users/signup', userSignup)
router.post('/users/login', userLogin)
router.use(authMiddleware)
router.put('/users', userUpdate)

// UserFollower routes
router.post('/followers/:userId/:followerId', addUserFollower)

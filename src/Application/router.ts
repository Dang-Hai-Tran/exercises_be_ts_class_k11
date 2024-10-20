import { Router } from 'express'
import { userLogin} from './User/login'
import { userSignup } from './User/signup'
import { authMiddleware } from './User/auth.middleware'
import { userUpdate } from './User/update'
import { addUserFollower } from './UserFollower/add.follower'
import { createPost } from './Post/create.post'
import { seeUserPosts } from './Post/see.user.posts'
import { getUserFollower } from './UserFollower/get.follower'

export const router = Router()

// User routes
router.post('/users/signup', userSignup)
router.post('/users/login', userLogin)

// Authenticated routes
// router.use(authMiddleware)


router.put('/users', userUpdate)

// UserFollower routes
router.post('/followers/:userId/:followerId', addUserFollower)
router.get('/followers/:userId', getUserFollower)


// Posts routes
router.post('/posts', createPost)
router.get('/posts/:userId', seeUserPosts)

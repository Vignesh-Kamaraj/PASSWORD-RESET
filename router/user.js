import express from 'express'
import Auth from '../common/auth.js'
import UserController from '../controller/user.js'
const router = express.Router()

router.post('/signup',UserController.create)
router.post('/login',UserController.login)
router.get('/user',Auth.validate, UserController.getAllUsers)
router.post('/forgetPassword',UserController.forgetPassword)
router.post('/resetPassword',UserController.resetPassword)

export default router
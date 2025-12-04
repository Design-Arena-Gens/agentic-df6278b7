import { Router } from 'express'
import { body } from 'express-validator'
import { login, register, me } from '../controllers/authController.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Provide valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
  ],
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Provide valid email'),
    body('password').notEmpty().withMessage('Password required')
  ],
  login
)

router.get('/me', authenticate, me)

export default router

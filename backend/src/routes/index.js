import { Router } from 'express'
import authRouter from './auth.js'
import projectRouter from './projects.js'
import taskRouter from './tasks.js'
import automationRouter from './automation.js'
import chatRouter from './chat.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = Router()

router.use('/auth', authRouter)
router.use('/projects', authenticate, projectRouter)
router.use('/projects/:projectId/tasks', authenticate, taskRouter)
router.use('/projects/:projectId/automation', authenticate, automationRouter)
router.use('/projects/:projectId/chat', authenticate, chatRouter)

export default router

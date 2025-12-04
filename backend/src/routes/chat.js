import { Router } from 'express'
import { chatWithAssistant } from '../controllers/chatController.js'

const router = Router({ mergeParams: true })

router.post('/', chatWithAssistant)

export default router

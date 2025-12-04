import { Router } from 'express'
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js'

const router = Router({ mergeParams: true })

router.get('/', listTasks)
router.post('/', createTask)
router.put('/:taskId', updateTask)
router.delete('/:taskId', deleteTask)

export default router

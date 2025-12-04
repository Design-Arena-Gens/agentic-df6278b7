import { Router } from 'express'
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js'

const router = Router()

router.get('/', listProjects)
router.post('/', createProject)
router.put('/:id', updateProject)
router.delete('/:id', deleteProject)

export default router

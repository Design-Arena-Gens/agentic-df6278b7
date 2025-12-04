import { Router } from 'express'
import {
  listAutomationRules,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  executeAutomationRules
} from '../controllers/automationController.js'

const router = Router({ mergeParams: true })

router.get('/', listAutomationRules)
router.post('/', createAutomationRule)
router.put('/:ruleId', updateAutomationRule)
router.delete('/:ruleId', deleteAutomationRule)
router.post('/execute', executeAutomationRules)

export default router

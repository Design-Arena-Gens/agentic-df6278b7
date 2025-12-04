import AutomationRule from '../models/AutomationRule.js'
import { evaluateAutomationRules } from '../services/automationService.js'
import { assertProjectAccess } from '../utils/projectAccess.js'

export const listAutomationRules = async (req, res) => {
  const { projectId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const rules = await AutomationRule.find({ project: projectId })
    return res.json({ rules })
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const createAutomationRule = async (req, res) => {
  const { projectId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const rule = await AutomationRule.create({ ...req.body, project: projectId })
    res.status(201).json({ rule })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const updateAutomationRule = async (req, res) => {
  const { projectId, ruleId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const rule = await AutomationRule.findOneAndUpdate(
      { _id: ruleId, project: projectId },
      req.body,
      { new: true }
    )
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' })
    }
    res.json({ rule })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const deleteAutomationRule = async (req, res) => {
  const { projectId, ruleId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const rule = await AutomationRule.findOneAndDelete({ _id: ruleId, project: projectId })
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const executeAutomationRules = async (req, res) => {
  const { projectId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const results = await evaluateAutomationRules({
      projectId,
      triggerContext: { type: 'manual', ...req.body }
    })
    res.json({ results })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

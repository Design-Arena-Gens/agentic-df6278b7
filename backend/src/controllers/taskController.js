import Task from '../models/Task.js'
import { evaluateAutomationRules } from '../services/automationService.js'
import { broadcastProjectEvent } from '../services/socketService.js'
import { assertProjectAccess } from '../utils/projectAccess.js'

export const listTasks = async (req, res) => {
  const { projectId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email')
    return res.json({ tasks })
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const createTask = async (req, res) => {
  const { projectId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const payload = { ...req.body, project: projectId }
    const task = await Task.create(payload)
    const populated = await task.populate('assignedTo', 'name email')
    broadcastProjectEvent(projectId, 'task:created', populated)
    res.status(201).json({ task: populated })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const updateTask = async (req, res) => {
  const { projectId, taskId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const prev = await Task.findById(taskId)
    if (!prev) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const updated = await Task.findByIdAndUpdate(taskId, req.body, { new: true }).populate(
      'assignedTo',
      'name email'
    )

    broadcastProjectEvent(projectId, 'task:updated', updated)

    if (req.body.status && req.body.status !== prev.status) {
      await evaluateAutomationRules({
        projectId,
        triggerContext: {
          type: 'task_status_change',
          status: req.body.status,
          taskId,
          progress: req.body.progress,
          priority: req.body.priority
        }
      })
    }

    return res.json({ task: updated })
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

export const deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params
  try {
    await assertProjectAccess(req.user._id, projectId)
    const result = await Task.findByIdAndDelete(taskId)
    if (!result) {
      return res.status(404).json({ message: 'Task not found' })
    }
    broadcastProjectEvent(projectId, 'task:deleted', { taskId })
    return res.status(204).send()
  } catch (error) {
    return res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

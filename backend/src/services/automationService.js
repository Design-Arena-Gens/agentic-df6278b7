import AutomationRule from '../models/AutomationRule.js'
import Task from '../models/Task.js'

const operators = {
  equals: (a, b) => a === b,
  not_equals: (a, b) => a !== b,
  gt: (a, b) => a > b,
  lt: (a, b) => a < b,
  contains: (a, b) => Array.isArray(a) ? a.includes(b) : String(a).includes(b)
}

export const evaluateAutomationRules = async ({ projectId, triggerContext }) => {
  const rules = await AutomationRule.find({ project: projectId, active: true })
  const results = []

  for (const rule of rules) {
    if (rule.trigger.type && rule.trigger.type !== triggerContext.type) continue
    if (rule.trigger.status && triggerContext.status !== rule.trigger.status) continue

    let conditionMet = true
    if (rule.condition?.field) {
      const fieldValue = triggerContext[rule.condition.field]
      const comparator = operators[rule.condition.operator] ?? operators.equals
      conditionMet = comparator(fieldValue, rule.condition.value)
    }

    if (!conditionMet) continue

    // Execute action
    if (rule.action.type === 'update_status' && triggerContext.taskId) {
      await Task.findByIdAndUpdate(triggerContext.taskId, {
        status: rule.action.payload?.status ?? 'in_progress'
      })
      results.push({ rule: rule.name, action: 'updated task status' })
    } else if (rule.action.type === 'create_task') {
      await Task.create({
        project: projectId,
        title: rule.action.payload?.title ?? `Automation task from ${rule.name}`,
        status: rule.action.payload?.status ?? 'todo',
        priority: rule.action.payload?.priority ?? 'medium'
      })
      results.push({ rule: rule.name, action: 'created task' })
    } else if (rule.action.type === 'notify') {
      results.push({ rule: rule.name, action: 'notification queued', payload: rule.action.payload })
    }
  }

  return results
}

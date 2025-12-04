import mongoose from 'mongoose'

const automationRuleSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    name: { type: String, required: true },
    trigger: {
      type: { type: String, enum: ['task_status_change', 'task_overdue', 'manual'], default: 'manual' },
      status: { type: String, enum: ['todo', 'in_progress', 'blocked', 'done'] },
      field: { type: String }
    },
    condition: {
      field: { type: String },
      operator: { type: String, enum: ['equals', 'not_equals', 'gt', 'lt', 'contains'], default: 'equals' },
      value: { type: mongoose.Schema.Types.Mixed }
    },
    action: {
      type: { type: String, enum: ['update_status', 'create_task', 'notify'], required: true },
      payload: { type: mongoose.Schema.Types.Mixed }
    },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
)

const AutomationRule = mongoose.model('AutomationRule', automationRuleSchema)
export default AutomationRule

import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in_progress', 'blocked', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    labels: [{ type: String }]
  },
  { timestamps: true }
)

const Task = mongoose.model('Task', taskSchema)
export default Task

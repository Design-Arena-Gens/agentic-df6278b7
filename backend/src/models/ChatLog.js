import mongoose from 'mongoose'

const chatMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
)

const chatLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    messages: [chatMessageSchema]
  },
  { timestamps: true }
)

const ChatLog = mongoose.model('ChatLog', chatLogSchema)
export default ChatLog

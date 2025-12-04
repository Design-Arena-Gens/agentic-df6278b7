import { sendChatMessage } from '../services/chatService.js'
import { broadcastProjectEvent } from '../services/socketService.js'
import { assertProjectAccess } from '../utils/projectAccess.js'

export const chatWithAssistant = async (req, res) => {
  const { projectId } = req.params
  const { message } = req.body
  try {
    await assertProjectAccess(req.user._id, projectId)
    const result = await sendChatMessage({
      userId: req.user._id,
      projectId,
      message
    })
    broadcastProjectEvent(projectId, 'chat:assistant', {
      message: result.reply,
      timestamp: new Date().toISOString()
    })
    res.json({ reply: result.reply, log: result.log })
  } catch (error) {
    res.status(error.statusCode ?? 500).json({ message: error.message })
  }
}

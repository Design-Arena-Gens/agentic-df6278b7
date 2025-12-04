import OpenAI from 'openai'
import ChatLog from '../models/ChatLog.js'
import { openAIConfig } from '../config/appConfig.js'

const apiKey = process.env.OPENAI_API_KEY
const client = apiKey
  ? new OpenAI({
    apiKey
  })
  : null

export const sendChatMessage = async ({ userId, projectId, message }) => {
  const log =
    (await ChatLog.findOne({ user: userId, project: projectId })) ||
    (await ChatLog.create({ user: userId, project: projectId, messages: [] }))

  log.messages.push({ role: 'user', content: message })

  let assistantMessage = 'I am sorry, I could not generate a response.'
  if (client) {
    const response = await client.chat.completions.create({
      model: openAIConfig.model,
      messages: [
        {
          role: 'system',
          content: 'You are TaskFlow Pro assistant. Help with project management and workflow automation.'
        },
        ...log.messages.map(({ role, content }) => ({ role, content }))
      ],
      temperature: 0.5
    })

    assistantMessage = response.choices?.[0]?.message?.content ?? assistantMessage
  } else {
    assistantMessage =
      'OpenAI integration is not configured. Set OPENAI_API_KEY to enable AI-powered conversations.'
  }
  log.messages.push({ role: 'assistant', content: assistantMessage })
  await log.save()

  return {
    reply: assistantMessage,
    log
  }
}

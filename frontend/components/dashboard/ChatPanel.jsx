"use client"

import { useEffect, useRef, useState } from 'react'
import api from '../../lib/api'
import LoadingSpinner from '../LoadingSpinner'

export default function ChatPanel({ projectId, socket }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!socket || !projectId) return
    socket.on('chat:assistant', (payload) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: payload.message, createdAt: payload.timestamp }
      ])
    })
    return () => {
      socket.off('chat:assistant')
    }
  }, [socket, projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() || !projectId) return
    const userMessage = { role: 'user', content: input.trim(), createdAt: new Date().toISOString() }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setInput('')
    try {
      const { data } = await api.post(`/projects/${projectId}/chat`, { message: userMessage.content })
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, createdAt: new Date().toISOString() }
      ])
    } catch (error) {
      console.error('Failed to send chat message', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'The assistant is currently unavailable. Please check your configuration and try again.',
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!projectId) {
    return null
  }

  return (
    <section className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900/60">
      <header className="border-b border-slate-800 px-4 py-3">
        <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
        <p className="text-xs text-slate-400">
          Collaborate with the TaskFlow AI to plan sprints, automate processes, and answer workflow questions.
        </p>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="rounded-md border border-slate-800 bg-slate-950 px-4 py-5 text-center text-sm text-slate-400">
            Start a conversation to get tailored automation suggestions and project insights.
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.createdAt}-${index}`}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-md rounded-2xl px-4 py-3 text-sm ${
                message.role === 'user'
                  ? 'bg-brand-500 text-white shadow-brand-500/40'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              <p className="leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && <LoadingSpinner label="Assistant is thinking..." />}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-slate-800 p-4">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask TaskFlow AI for help automating your workflow..."
            className="flex-1 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  )
}

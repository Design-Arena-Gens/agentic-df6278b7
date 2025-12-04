"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import clsx from 'clsx'
import api from '../../lib/api'
import LoadingSpinner from '../LoadingSpinner'

const statusOrder = ['todo', 'in_progress', 'blocked', 'done']

export default function TaskBoard({ projectId, socket }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })
  const [creating, setCreating] = useState(false)

  const loadTasks = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/projects/${projectId}/tasks`)
      setTasks(data.tasks ?? [])
    } catch (error) {
      console.error('Failed to load tasks', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    if (!socket || !projectId) return
    socket.emit('joinProject', projectId)

    const handleCreated = (task) => {
      setTasks((prev) => [...prev.filter((t) => t._id !== task._id), task])
    }
    const handleUpdated = (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)))
    }
    const handleDeleted = ({ taskId }) => {
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
    }

    socket.on('task:created', handleCreated)
    socket.on('task:updated', handleUpdated)
    socket.on('task:deleted', handleDeleted)

    return () => {
      socket.emit('leaveProject', projectId)
      socket.off('task:created', handleCreated)
      socket.off('task:updated', handleUpdated)
      socket.off('task:deleted', handleDeleted)
    }
  }, [socket, projectId])

  const groupedTasks = useMemo(() => {
    const map = Object.fromEntries(statusOrder.map((status) => [status, []]))
    for (const task of tasks) {
      map[task.status]?.push(task)
    }
    return map
  }, [tasks])

  const handleFormChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleCreateTask = async (event) => {
    event.preventDefault()
    if (!projectId) return
    setCreating(true)
    try {
      await api.post(`/projects/${projectId}/tasks`, {
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null
      })
      setForm({ title: '', description: '', dueDate: '', priority: 'medium' })
    } catch (error) {
      console.error('Failed to create task', error)
    } finally {
      setCreating(false)
    }
  }

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/projects/${projectId}/tasks/${taskId}`, { status })
    } catch (error) {
      console.error('Failed to update task status', error)
    }
  }

  const removeTask = async (taskId) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`)
    } catch (error) {
      console.error('Failed to delete task', error)
    }
  }

  if (!projectId) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        Select or create a project to start tracking tasks.
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Create task</h2>
        <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleCreateTask}>
          <input
            name="title"
            value={form.title}
            onChange={handleFormChange}
            placeholder="Task title"
            required
            className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <input
            name="dueDate"
            type="date"
            value={form.dueDate}
            onChange={handleFormChange}
            className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Add context or subtasks"
            rows={2}
            className="sm:col-span-2 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-wide text-slate-500">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleFormChange}
              className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="sm:col-span-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Add Task'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
          <LoadingSpinner label="Loading tasks..." />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statusOrder.map((status) => (
            <div key={status} className="rounded-lg border border-slate-800 bg-slate-950/80">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{status}</h3>
                <span className="text-xs text-slate-500">{groupedTasks[status]?.length ?? 0}</span>
              </div>
              <div className="space-y-3 p-4">
                {groupedTasks[status]?.map((task) => (
                  <article key={task._id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <header className="mb-2 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-white">{task.title}</h4>
                        <p className="text-xs text-slate-400">{task.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTask(task._id)}
                        className="text-xs text-slate-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </header>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="rounded-full bg-slate-800 px-2 py-1">
                        Priority: <span className="text-brand-300">{task.priority}</span>
                      </span>
                      {task.dueDate && (
                        <span className="rounded-full bg-slate-800 px-2 py-1">
                          Due: {format(parseISO(task.dueDate), 'MMM dd')}
                        </span>
                      )}
                      <span className="rounded-full bg-slate-800 px-2 py-1">Progress: {task.progress}%</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {statusOrder.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateStatus(task._id, s)}
                          className={clsx(
                            'rounded-md border px-2 py-1 text-xs capitalize transition',
                            s === status
                              ? 'border-brand-400 bg-brand-500/20 text-brand-200'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-brand-500/50 hover:text-brand-200'
                          )}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
                {groupedTasks[status]?.length === 0 && (
                  <p className="text-sm text-slate-500">No tasks in this stage yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

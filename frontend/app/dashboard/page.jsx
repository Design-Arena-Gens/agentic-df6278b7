"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'
import ProjectSelector from '../../components/dashboard/ProjectSelector'
import TaskBoard from '../../components/dashboard/TaskBoard'
import AutomationPanel from '../../components/dashboard/AutomationPanel'
import ChatPanel from '../../components/dashboard/ChatPanel'
import StatsOverview from '../../components/dashboard/StatsOverview'
import api from '../../lib/api'

const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, logout, loading } = useAuth()
  const [projectId, setProjectId] = useState(null)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [projectForm, setProjectForm] = useState({ name: '', description: '' })
  const [creatingProject, setCreatingProject] = useState(false)

  const socket = useMemo(() => io(socketURL, { autoConnect: false }), [])

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else {
        socket.connect()
      }
    }
    return () => {
      socket.disconnect()
    }
  }, [loading, isAuthenticated, router, socket])

  const handleProjectSelect = useCallback((id) => {
    if (id === 'new') {
      setShowProjectForm(true)
      return
    }
    setProjectId(id)
  }, [])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    setCreatingProject(true)
    try {
      const { data } = await api.post('/projects', projectForm)
      setProjectId(data.project._id)
      setShowProjectForm(false)
      setProjectForm({ name: '', description: '' })
    } finally {
      setCreatingProject(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Preparing your workspace...
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 pb-12">
      <header className="border-b border-slate-900 bg-slate-900/70 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">TaskFlow Pro</h1>
            <p className="text-sm text-slate-400">
              Manage tasks, orchestrate automation rules, and collaborate with AI in one unified workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 pt-6 md:grid-cols-[280px,1fr]">
        <div className="space-y-6">
          <ProjectSelector selectedProjectId={projectId} onSelect={handleProjectSelect} />
          {showProjectForm && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">New project</h2>
              <form className="mt-3 space-y-3" onSubmit={handleCreateProject}>
                <input
                  name="name"
                  placeholder="Project name"
                  value={projectForm.name}
                  onChange={(event) => setProjectForm({ ...projectForm, name: event.target.value })}
                  required
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
                />
                <textarea
                  name="description"
                  placeholder="Describe goals and scope"
                  value={projectForm.description}
                  onChange={(event) => setProjectForm({ ...projectForm, description: event.target.value })}
                  rows={3}
                  className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(false)}
                    className="text-sm text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingProject}
                    className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingProject ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <StatsOverview projectId={projectId} />
          <TaskBoard projectId={projectId} socket={socket} />
          <AutomationPanel projectId={projectId} />
          <ChatPanel projectId={projectId} socket={socket} />
        </div>
      </div>
    </main>
  )
}

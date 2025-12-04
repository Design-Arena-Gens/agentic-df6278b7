"use client"

import { useEffect, useState } from 'react'
import clsx from 'clsx'
import api from '../../lib/api'
import LoadingSpinner from '../LoadingSpinner'

export default function ProjectSelector({ selectedProjectId, onSelect }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      try {
        const { data } = await api.get('/projects')
        setProjects(data.projects ?? [])
        if (!selectedProjectId && data.projects?.length) {
          onSelect(data.projects[0]._id)
        }
      } catch (error) {
        console.error('Failed to load projects', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [onSelect, selectedProjectId])

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <LoadingSpinner label="Loading projects..." />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Projects</h2>
        <button
          type="button"
          onClick={() => onSelect('new')}
          className="text-xs text-brand-300 hover:text-brand-200"
        >
          + New
        </button>
      </div>
      <div className="mt-3 space-y-2">
        {projects.map((project) => (
          <button
            type="button"
            key={project._id}
            onClick={() => onSelect(project._id)}
            className={clsx(
              'w-full rounded-md border px-3 py-2 text-left text-sm transition',
              selectedProjectId === project._id
                ? 'border-brand-500 bg-brand-500/10 text-brand-200'
                : 'border-transparent bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
            )}
          >
            <div className="font-medium text-white">{project.name}</div>
            <p className="text-xs text-slate-400">{project.description || 'No description provided.'}</p>
          </button>
        ))}
        {projects.length === 0 && <p className="text-sm text-slate-400">You have not created any projects yet.</p>}
      </div>
    </div>
  )
}

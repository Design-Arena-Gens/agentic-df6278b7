"use client"

import { useEffect, useState } from 'react'
import api from '../../lib/api'
import LoadingSpinner from '../LoadingSpinner'

export default function StatsOverview({ projectId }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) {
      setStats(null)
      setLoading(false)
      return
    }

    const loadStats = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/projects/${projectId}/tasks`)
        const tasks = data.tasks ?? []
        const total = tasks.length
        const done = tasks.filter((task) => task.status === 'done').length
        const inProgress = tasks.filter((task) => task.status === 'in_progress').length
        const blocked = tasks.filter((task) => task.status === 'blocked').length
        const completion = total > 0 ? Math.round((done / total) * 100) : 0

        setStats({
          total,
          done,
          inProgress,
          blocked,
          completion
        })
      } catch (error) {
        console.error('Failed to load stats', error)
        setStats({
          total: 0,
          done: 0,
          inProgress: 0,
          blocked: 0,
          completion: 0
        })
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [projectId])

  if (!projectId) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-400">
        Create a project to view analytics and completion metrics.
      </div>
    )
  }

  if (loading || !stats) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
        <LoadingSpinner label="Preparing insights..." />
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total tasks" value={stats.total} />
      <StatCard label="In progress" value={stats.inProgress} tone="amber" />
      <StatCard label="Blocked" value={stats.blocked} tone="red" />
      <StatCard label="Completion" value={`${stats.completion}%`} tone="emerald" />
    </div>
  )
}

function StatCard({ label, value, tone = 'brand' }) {
  const colorMap = {
    brand: 'text-brand-300 border-brand-500/40 bg-brand-500/10',
    amber: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    red: 'text-red-300 border-red-500/30 bg-red-500/10',
    emerald: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <div className={`mt-2 inline-flex rounded-full border px-3 py-2 text-lg font-semibold ${colorMap[tone]}`}>
        {value}
      </div>
    </div>
  )
}

"use client"

import { useCallback, useEffect, useState } from 'react'
import api from '../../lib/api'
import LoadingSpinner from '../LoadingSpinner'

const triggers = [
  { value: 'manual', label: 'Manual' },
  { value: 'task_status_change', label: 'Task status change' },
  { value: 'task_overdue', label: 'Task overdue' }
]

const actions = [
  { value: 'update_status', label: 'Update task status' },
  { value: 'create_task', label: 'Create task' },
  { value: 'notify', label: 'Send notification' }
]

export default function AutomationPanel({ projectId }) {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    triggerType: 'manual',
    actionType: 'update_status',
    status: 'todo',
    actionStatus: 'in_progress',
    conditionField: '',
    operator: 'equals',
    value: ''
  })
  const [creating, setCreating] = useState(false)

  const loadRules = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const { data } = await api.get(`/projects/${projectId}/automation`)
      setRules(data.rules ?? [])
    } catch (error) {
      console.error('Failed to load automation rules', error)
      setRules([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleCreateRule = async (event) => {
    event.preventDefault()
    if (!projectId) return
    setCreating(true)
    try {
      await api.post(`/projects/${projectId}/automation`, {
        name: form.name,
        trigger: {
          type: form.triggerType,
          status: form.status
        },
        condition: form.conditionField
          ? {
              field: form.conditionField,
              operator: form.operator,
              value: form.value
            }
          : undefined,
        action: {
          type: form.actionType,
          payload: {
            status: form.actionStatus,
            title: form.value,
            message: form.value
          }
        }
      })
      setForm({
        name: '',
        triggerType: 'manual',
        actionType: 'update_status',
        status: 'todo',
        actionStatus: 'in_progress',
        conditionField: '',
        operator: 'equals',
        value: ''
      })
      loadRules()
    } catch (error) {
      console.error('Failed to create automation rule', error)
    } finally {
      setCreating(false)
    }
  }

  const handleExecute = async () => {
    try {
      await api.post(`/projects/${projectId}/automation/execute`, {
        info: 'Manual execution triggered from dashboard'
      })
    } catch (error) {
      console.error('Failed to execute automation rules', error)
    }
  }

  const handleToggle = async (ruleId, active) => {
    try {
      await api.put(`/projects/${projectId}/automation/${ruleId}`, { active })
      loadRules()
    } catch (error) {
      console.error('Failed to toggle automation rule', error)
    }
  }

  const handleDelete = async (ruleId) => {
    try {
      await api.delete(`/projects/${projectId}/automation/${ruleId}`)
      loadRules()
    } catch (error) {
      console.error('Failed to delete automation rule', error)
    }
  }

  if (!projectId) {
    return null
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Automation rules</h2>
          <p className="text-sm text-slate-400">
            Define IF-THEN logic that reacts to task events and keeps your projects moving.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExecute}
          className="rounded-md border border-brand-400/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-200 hover:bg-brand-500/10"
        >
          Run rules
        </button>
      </div>

      <form className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3" onSubmit={handleCreateRule}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Rule name"
          required
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        />
        <select
          name="triggerType"
          value={form.triggerType}
          onChange={handleChange}
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        >
          {triggers.map((trigger) => (
            <option key={trigger.value} value={trigger.value}>
              {trigger.label}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        >
          <option value="todo">When task becomes Todo</option>
          <option value="in_progress">When task becomes In Progress</option>
          <option value="blocked">When task becomes Blocked</option>
          <option value="done">When task becomes Done</option>
        </select>
        <input
          name="conditionField"
          value={form.conditionField}
          onChange={handleChange}
          placeholder="Condition field (optional)"
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        />
        <select
          name="operator"
          value={form.operator}
          onChange={handleChange}
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        >
          <option value="equals">Equals</option>
          <option value="not_equals">Not equals</option>
          <option value="gt">Greater than</option>
          <option value="lt">Less than</option>
          <option value="contains">Contains</option>
        </select>
        <input
          name="value"
          value={form.value}
          onChange={handleChange}
          placeholder="Value"
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        />
        <select
          name="actionType"
          value={form.actionType}
          onChange={handleChange}
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        >
          {actions.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <select
          name="actionStatus"
          value={form.actionStatus}
          onChange={handleChange}
          className="rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-brand-400 focus:outline-none"
        >
          <option value="todo">Set status to Todo</option>
          <option value="in_progress">Set status to In Progress</option>
          <option value="blocked">Set status to Blocked</option>
          <option value="done">Set status to Done</option>
        </select>
        <button
          type="submit"
          disabled={creating}
          className="col-span-1 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50 md:col-span-3"
        >
          {creating ? 'Creating rule...' : 'Add automation rule'}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {loading ? (
          <LoadingSpinner label="Loading rules..." />
        ) : rules.length === 0 ? (
          <p className="text-sm text-slate-400">No automation rules yet. Create one to get started.</p>
        ) : (
          rules.map((rule) => (
            <div key={rule._id} className="rounded-md border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{rule.name}</h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Trigger: {rule.trigger?.type?.replace('_', ' ')} &middot; Action:{' '}
                    {rule.action?.type?.replace('_', ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={rule.active}
                      onChange={(event) => handleToggle(rule._id, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900 accent-brand-500"
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDelete(rule._id)}
                    className="rounded-md border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {rule.condition?.field && (
                <p className="mt-2 text-xs text-slate-400">
                  Condition: {rule.condition.field} {rule.condition.operator} {String(rule.condition.value)}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await register(form)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-brand-950/30 backdrop-blur">
        <div>
          <h1 className="text-3xl font-semibold text-white">Create your workspace</h1>
          <p className="text-sm text-slate-400">Set up TaskFlow Pro and automate your team&apos;s workflow.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              placeholder="Ada Lovelace"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              placeholder="you@company.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-white focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-500 px-4 py-2 font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create workspace'}
          </button>
        </form>
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-300 hover:text-brand-200">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}

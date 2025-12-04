import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 text-center">
      <div className="max-w-3xl space-y-6">
        <span className="rounded-full bg-brand-500/10 px-4 py-1 text-sm font-medium text-brand-200">
          TaskFlow Pro
        </span>
        <h1 className="text-5xl font-bold text-white sm:text-6xl">
          Orchestrate workflows, automate tasks, and collaborate with AI.
        </h1>
        <p className="text-lg text-slate-300">
          Manage projects, track progress, and let automation rules handle the repetitive stuff. Chat with
          an AI assistant to plan sprints, refine processes, and stay ahead of deadlines.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="rounded-md bg-brand-500 px-6 py-3 text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-400"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-brand-400/50 px-6 py-3 text-brand-200 hover:border-brand-300 hover:text-brand-100"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  )
}

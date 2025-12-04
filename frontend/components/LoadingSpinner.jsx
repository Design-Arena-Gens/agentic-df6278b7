"use client"

export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
      {label}
    </div>
  )
}

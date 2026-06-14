import { useAuth } from '../contexts/AuthContext'

export function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const name = profile?.full_name || user?.email?.split('@')[0] || 'You'
  const email = user?.email ?? ''
  const initial = (name || email || '?').charAt(0).toUpperCase()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-100 bg-white p-4 md:flex">
      {/* brand */}
      <div className="mb-8 flex items-center gap-2.5 px-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <span className="text-lg font-bold text-slate-900">TaskBoard</span>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-1">
        <span className="flex items-center gap-3 rounded-lg bg-brand-light px-3 py-2 text-sm font-semibold text-brand-darker">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="5" height="16" rx="1" />
            <rect x="10" y="4" width="5" height="10" rx="1" />
            <rect x="17" y="4" width="4" height="13" rx="1" />
          </svg>
          Board
        </span>
        <span className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M7 15l3-3 3 3 5-6" />
          </svg>
          Analytics
          <span className="ml-auto rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">soon</span>
        </span>
      </nav>

      {/* user + sign out */}
      <div className="mt-auto border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2.5 px-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-sm font-bold text-brand-darker">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-700">{name}</p>
            <p className="truncate text-xs text-slate-400">{email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

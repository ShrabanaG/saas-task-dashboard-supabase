import { useAuth } from '../contexts/AuthContext'
import { Board } from '../components/Board'

const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  const name = profile?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Your board</h1>
          <p className="text-sm text-slate-500">Welcome back, {name}</p>
        </div>
        <button
          onClick={signOut}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Board />
      </main>
    </div>
  )
}

export default Dashboard

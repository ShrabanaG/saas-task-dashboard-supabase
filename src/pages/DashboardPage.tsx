import { Sidebar } from '../components/Sidebar'
import { Board } from '../components/Board'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user, profile, signOut } = useAuth()
  const name = profile?.full_name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        {/* mobile top bar — sidebar is hidden below md */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3 md:hidden">
          <span className="text-base font-bold text-slate-900">TaskBoard</span>
          <button onClick={signOut} className="text-sm font-medium text-slate-600">Sign out</button>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Your board</h1>
            <p className="text-sm text-slate-500">Welcome back, {name}</p>
          </div>
          <Board />
        </main>
      </div>
    </div>
  )
}

export default Dashboard

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import loginArt from '../assets/login-illustration.svg'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setNotice(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) setError(error.message)
      else setNotice('Account created — check your email to confirm, then sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      // On success, AuthContext updates the session and App.tsx redirects to "/".
    }

    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) {
      setError('Enter your email above first, then click “Forgot password”.')
      return
    }
    setError(null)
    setNotice(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setError(error.message)
    else setNotice('Password reset link sent — check your inbox.')
  }

  

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 ' +
    'placeholder-slate-400 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20'

  return (
    // PARENT is the flex container → lays its two children out in a row.
    <div className="flex min-h-screen bg-white text-slate-900">

      {/* ── LEFT: form half (always visible, fills remaining width) ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-4xl font-bold tracking-tight">
            {isSignUp ? 'Create account' : 'Welcome back!'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {isSignUp
              ? 'Sign up and start organizing your work today.'
              : 'Simplify your workflow and boost your productivity. Get started for free.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {isSignUp && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              {/* relative wrapper so the eye toggle can be absolutely positioned inside */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass + ' pr-11'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-sm font-medium text-brand transition hover:text-brand-dark"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
            )}
            {notice && (
              <p className="rounded-lg bg-brand-light px-4 py-2.5 text-sm text-brand-darker">{notice}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand py-3 font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Login'}
            </button>
          </form>

          

          <p className="mt-8 text-center text-sm text-slate-500">
            {isSignUp ? 'Already have an account?' : 'Not a member?'}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setNotice(null) }}
              className="font-semibold text-brand transition hover:text-brand-dark"
            >
              {isSignUp ? 'Sign in' : 'Register now'}
            </button>
          </p>
        </div>
      </div>

      {/* ── RIGHT: illustration panel (hidden on phones, shown at lg ≥1024px) ── */}
      <div className="hidden flex-1 p-4 lg:flex">
        <div className="flex w-full flex-col items-center justify-center rounded-[40px] bg-brand-light px-10 py-12 text-center">
          <img src={loginArt} alt="" className="w-full max-w-md" />
          {/* decorative carousel dots */}
          <div className="mt-8 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand/30" />
            <span className="h-2 w-2 rounded-full bg-brand/30" />
            <span className="h-2 w-6 rounded-full bg-brand" />
          </div>
          <p className="mt-6 max-w-sm text-2xl font-bold leading-snug text-brand-darker">
            Make your work easier and organized
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

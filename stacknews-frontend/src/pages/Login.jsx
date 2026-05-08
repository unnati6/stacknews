import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Toast = ({ toasts, removeToast }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[280px] max-w-sm animate-slide-up
          ${t.type === 'success'
            ? 'bg-black-500/10 border-green-500/30 text-green-300'
            : 'bg-black-500/10 border-red-500/30 text-red-300'
          }`}
      >
        <span className="mt-0.5 flex-shrink-0">
          {t.type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
        </span>
        <div className="flex-1">
          <p className="text-sm font-display font-semibold">
            {t.type === 'success' ? 'Success!' : 'Error'}
          </p>
          <p className="text-xs font-body opacity-80 mt-0.5">{t.message}</p>
        </div>
        <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    ))}
  </div>
)

const Login = () => {
  const { login, loading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    clearError()
  }, [clearError])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const handleChange = (e) => {
    setLocalError('')
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setLocalError('Please fill in all fields.')
      return
    }
    const result = await login(form.email, form.password)
    if (result.success) {
      addToast('Welcome back! Signing you in... 👋', 'success')
      setTimeout(() => navigate(from, { replace: true }), 4000)
    } else {
      addToast(result.message || 'Login failed. Try again.', 'error')
    }
  }

  const displayError = localError

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white font-display font-bold text-xl mx-auto mb-4">
              SN
            </div>
            <h1 className="font-display font-bold text-2xl text-white">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1 font-body">Sign in to your StackNews account</p>
          </div>

          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-display font-medium text-gray-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input-field"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-display font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="input-field"
                  autoComplete="current-password"
                />
              </div>

              {displayError && (
                <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-body">
                  {displayError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-5 font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Login
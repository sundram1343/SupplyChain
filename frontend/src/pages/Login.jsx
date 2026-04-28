import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import api from '../services/api'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'operator' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password, role: form.role }
      const { data } = await api.post(endpoint, payload)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="w-full max-w-md px-4 animate-fade-in relative z-10">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/30 mb-4 mx-auto">
            <svg className="w-8 h-8 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold gradient-text">Resilient Supply Chain AI</h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time logistics intelligence platform</p>
        </div>

        <div className="glass-card p-8">
          {/* Mode tabs */}
          <div className="flex bg-dark-surface rounded-xl p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${mode === m ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span>⚠️</span>{error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input name="name" value={form.name} onChange={handle} placeholder="John Doe"
                  className="input-field" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="you@company.com" className="input-field" required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                placeholder="••••••••" className="input-field" required />
            </div>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Role</label>
                <select name="role" value={form.role} onChange={handle} className="input-field">
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Loading...</span>
              ) : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo credentials */}
          {mode === 'login' && (
            <div className="mt-5 p-3 bg-dark-surface rounded-xl border border-dark-border">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Demo Credentials</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">🔑 Admin: <span className="text-brand-400 font-mono">admin@supplychain.ai / Admin@123</span></p>
                <p className="text-xs text-slate-400">👤 Operator: <span className="text-brand-400 font-mono">operator@supplychain.ai / Operator@123</span></p>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setForm({ ...form, email: 'admin@supplychain.ai', password: 'Admin@123' })}
                  className="text-xs bg-brand-600/20 text-brand-400 border border-brand-600/30 px-3 py-1.5 rounded-lg hover:bg-brand-600/30 transition-colors">
                  Use Admin
                </button>
                <button onClick={() => setForm({ ...form, email: 'operator@supplychain.ai', password: 'Operator@123' })}
                  className="text-xs bg-slate-600/20 text-slate-400 border border-slate-600/30 px-3 py-1.5 rounded-lg hover:bg-slate-600/30 transition-colors">
                  Use Operator
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

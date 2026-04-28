import { useAppStore } from '../store/useAppStore'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout, wsConnected, alerts } = useAppStore((s) => ({
    user: s.user, logout: s.logout, wsConnected: s.wsConnected, alerts: s.alerts
  }))
  const navigate = useNavigate()
  const unread = alerts.filter((a) => !a.acknowledged).length

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <header className="h-16 flex items-center px-6 border-b border-dark-border bg-dark-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600/20 border border-brand-500/30">
          <svg className="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-white text-sm">Resilient Supply Chain</span>
          <span className="ml-2 text-xs text-brand-400 font-semibold bg-brand-600/15 px-2 py-0.5 rounded-full border border-brand-600/30">AI</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live WS status */}
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className={`w-2 h-2 rounded-full live-dot ${wsConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          <span className={wsConnected ? 'text-emerald-400' : 'text-red-400'}>
            {wsConnected ? 'LIVE' : 'Offline'}
          </span>
        </div>

        {/* Alert bell */}
        <div className="relative">
          <button className="btn-ghost px-3 py-2 relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-2 bg-dark-surface border border-dark-border rounded-xl px-3 py-1.5">
          <div className="w-7 h-7 rounded-lg bg-brand-600/30 flex items-center justify-center text-brand-400 font-bold text-xs">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
          </div>
        </div>

        <button onClick={handleLogout} className="btn-ghost px-3 py-2 text-slate-400 hover:text-red-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  )
}

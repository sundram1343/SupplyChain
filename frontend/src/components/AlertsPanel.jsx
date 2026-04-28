import { useAppStore } from '../store/useAppStore'
import { formatDistanceToNow } from 'date-fns'
import api from '../services/api'

export default function AlertsPanel() {
  const { alerts, acknowledgeAlert, removeAlert } = useAppStore()

  const handleAcknowledge = async (id) => {
    try {
      await api.patch(`/alerts/${id}/acknowledge`)
      acknowledgeAlert(id)
    } catch (error) {
      console.error('Error acknowledging alert:', error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/alerts/${id}`)
      removeAlert(id)
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'border-l-4 border-red-500 bg-red-500/5'
      case 'warning': return 'border-l-4 border-amber-500 bg-amber-500/5'
      case 'info': return 'border-l-4 border-blue-500 bg-blue-500/5'
      default: return 'border-l-4 border-slate-500 bg-slate-500/5'
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'weather': return '🌩️'
      case 'traffic': return '🚦'
      case 'risk_threshold': return '⚠️'
      case 'delay': return '⏰'
      default: return '📢'
    }
  }

  return (
    <div className="flex flex-col">
      {alerts.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-dark-surface flex items-center justify-center text-xl grayscale opacity-50">🔔</div>
          <p className="text-slate-500 text-sm">All systems normal. No active alerts.</p>
        </div>
      ) : (
        <div className="divide-y divide-dark-border">
          {alerts.map((alert) => (
            <div 
              key={alert._id} 
              className={`p-4 transition-all duration-200 group ${getSeverityStyle(alert.severity)} ${alert.acknowledged ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
            >
              <div className="flex gap-3">
                <div className="text-lg mt-0.5">{getIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                       {alert.shipment_id} • {alert.type.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-medium mb-3">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!alert.acknowledged && (
                      <button 
                        onClick={() => handleAcknowledge(alert._id)}
                        className="text-[10px] font-bold bg-brand-600/20 text-brand-400 px-2 py-1 rounded border border-brand-500/30 hover:bg-brand-600 hover:text-white transition-all"
                      >
                        ACKNOWLEDGE
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(alert._id)}
                      className="text-[10px] font-bold bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    >
                      DISMISS
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

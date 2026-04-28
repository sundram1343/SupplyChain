import { useAppStore } from '../store/useAppStore'
import { format } from 'date-fns'

export default function ShipmentTable() {
  const filteredShipments = useAppStore((s) => s.getFilteredShipments())
  const setSelectedShipment = useAppStore((s) => s.setSelectedShipment)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'on_track': return <span className="badge-on-track">On Track</span>
      case 'at_risk': return <span className="badge-at-risk">At Risk</span>
      case 'delayed': return <span className="badge-delayed">Delayed</span>
      case 'delivered': return <span className="badge-delivered">Delivered</span>
      default: return <span className="badge-info">{status}</span>
    }
  }

  const getPriorityBadge = (priority) => {
    const base = "text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase"
    switch (priority) {
      case 'critical': return <span className={`${base} bg-red-500/10 text-red-400 border-red-500/20`}>Critical</span>
      case 'high': return <span className={`${base} bg-orange-500/10 text-orange-400 border-orange-500/20`}>High</span>
      case 'medium': return <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20`}>Medium</span>
      case 'low': return <span className={`${base} bg-slate-500/10 text-slate-400 border-slate-500/20`}>Low</span>
      default: return <span className={`${base} bg-slate-500/10 text-slate-400 border-slate-500/20`}>{priority}</span>
    }
  }

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-dark-card z-10">
          <tr className="border-b border-dark-border">
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Score</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ETA</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Carrier</th>
          </tr>
        </thead>
        <tbody>
          {filteredShipments.map((s) => (
            <tr 
              key={s.shipment_id} 
              className="table-row"
              onClick={() => setSelectedShipment(s)}
            >
              <td className="px-6 py-4">
                <span className="font-mono text-brand-400 text-sm font-semibold">{s.shipment_id}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">{s.origin} → {s.destination}</span>
                  <span className="text-xs text-slate-500">Current: {s.current_location}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(s.status)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-[60px] h-1.5 bg-dark-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${s.risk_score > 0.7 ? 'bg-red-500' : s.risk_score > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${s.risk_score * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400">{s.risk_score.toFixed(2)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-slate-400 font-medium">
                  {format(new Date(s.eta), 'MMM dd, HH:mm')}
                </span>
              </td>
              <td className="px-6 py-4">
                {getPriorityBadge(s.priority_level)}
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-slate-500">{s.carrier}</span>
              </td>
            </tr>
          ))}
          {filteredShipments.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                No shipments found matching the filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

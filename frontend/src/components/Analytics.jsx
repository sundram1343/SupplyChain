import { useAppStore } from '../store/useAppStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

export default function Analytics() {
  const shipments = useAppStore((s) => s.shipments)

  // Data for risk distribution
  const riskData = [
    { name: 'Low (<0.4)', value: shipments.filter(s => s.risk_score < 0.4).length, color: '#10b981' },
    { name: 'Moderate (0.4-0.7)', value: shipments.filter(s => s.risk_score >= 0.4 && s.risk_score <= 0.7).length, color: '#f59e0b' },
    { name: 'High (>0.7)', value: shipments.filter(s => s.risk_score > 0.7).length, color: '#ef4444' },
  ]

  // Mock data for delay trends (usually would come from backend)
  const trendData = [
    { time: '08:00', delays: 2, risk: 0.15 },
    { time: '10:00', delays: 3, risk: 0.22 },
    { time: '12:00', delays: 5, risk: 0.38 },
    { time: '14:00', delays: 8, risk: 0.55 },
    { time: '16:00', delays: 4, risk: 0.42 },
    { time: '18:00', delays: 3, risk: 0.30 },
    { time: '20:00', delays: 2, risk: 0.20 },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <div className="flex flex-col h-full">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Risk Distribution</h4>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col h-full">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Risk & Delay Trends</h4>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="risk" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="delays" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

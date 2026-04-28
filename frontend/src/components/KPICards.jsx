import { useAppStore } from '../store/useAppStore'

const cards = [
  {
    key: 'total',
    label: 'Total Shipments',
    icon: '📦',
    color: 'blue',
    getValue: (k) => k.total,
    sub: (k) => `${k.onTrack} on track`,
    border: 'border-brand-600/30',
    glow: 'shadow-brand-600/20'
  },
  {
    key: 'ontime',
    label: 'On-Time Rate',
    icon: '✅',
    color: 'emerald',
    getValue: (k) => `${k.onTimePercent}%`,
    sub: (k) => `${k.onTrack} of ${k.total} shipments`,
    border: 'border-emerald-600/30',
    glow: 'shadow-emerald-600/20'
  },
  {
    key: 'delayed',
    label: 'Delayed',
    icon: '🚨',
    color: 'red',
    getValue: (k) => k.delayed,
    sub: (k) => `${k.atRisk} at risk`,
    border: 'border-red-600/30',
    glow: 'shadow-red-600/20'
  },
  {
    key: 'risk',
    label: 'Avg Risk Score',
    icon: '⚡',
    color: 'amber',
    getValue: (k) => k.avgRisk,
    sub: (k) => getRiskLabel(k.avgRisk),
    border: 'border-amber-600/30',
    glow: 'shadow-amber-600/20'
  },
  {
    key: 'cost',
    label: 'Total Cargo Value',
    icon: '💰',
    color: 'purple',
    getValue: (k) => `$${(k.totalCost / 1000).toFixed(0)}K`,
    sub: () => 'USD in transit',
    border: 'border-purple-600/30',
    glow: 'shadow-purple-600/20'
  }
]

function getRiskLabel(avg) {
  if (avg < 0.4) return '🟢 Low risk'
  if (avg <= 0.7) return '🟡 Moderate risk'
  return '🔴 High risk'
}

const colorMap = {
  blue: { text: 'text-brand-400', bg: 'bg-brand-600/15', bar: 'bg-brand-500' },
  emerald: { text: 'text-emerald-400', bg: 'bg-emerald-600/15', bar: 'bg-emerald-500' },
  red: { text: 'text-red-400', bg: 'bg-red-600/15', bar: 'bg-red-500' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-600/15', bar: 'bg-amber-500' },
  purple: { text: 'text-purple-400', bg: 'bg-purple-600/15', bar: 'bg-purple-500' }
}

export default function KPICards() {
  const kpis = useAppStore((s) => s.getKPIs())

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const c = colorMap[card.color]
        const value = card.getValue(kpis)
        return (
          <div key={card.key} className={`stat-card border ${card.border}`}
            style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)` }}>
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center text-lg`}>
                {card.icon}
              </div>
              <span className={`text-xs font-semibold ${c.text} uppercase tracking-wider`}>{card.label}</span>
            </div>
            <div>
              <div className={`text-3xl font-extrabold ${c.text}`}>{value}</div>
              <p className="text-xs text-slate-500 mt-0.5">{card.sub(kpis)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

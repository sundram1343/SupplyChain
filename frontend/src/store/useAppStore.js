import { create } from 'zustand'

const storedUser = localStorage.getItem('user')
const storedToken = localStorage.getItem('token')

export const useAppStore = create((set, get) => ({
  // Auth
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  // WebSocket
  wsConnected: false,
  setWsConnected: (v) => set({ wsConnected: v }),

  // Shipments
  shipments: [],
  shipmentsLoading: false,
  setShipments: (shipments) => set({ shipments }),
  setShipmentsLoading: (v) => set({ shipmentsLoading: v }),
  updateShipments: (updated) => {
    const current = get().shipments
    const updatedMap = Object.fromEntries(updated.map((s) => [s.shipment_id, s]))
    set({ shipments: current.map((s) => updatedMap[s.shipment_id] || s) })
  },
  addShipment: (s) => set((state) => ({ shipments: [s, ...state.shipments] })),
  removeShipment: (id) => set((state) => ({ shipments: state.shipments.filter((s) => s.shipment_id !== id) })),

  // Alerts
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts].slice(0, 100) })),
  acknowledgeAlert: (id) =>
    set((state) => ({ alerts: state.alerts.map((a) => (a._id === id ? { ...a, acknowledged: true } : a)) })),
  removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a._id !== id) })),

  // Filters
  statusFilter: 'all',
  priorityFilter: 'all',
  searchQuery: '',
  setStatusFilter: (v) => set({ statusFilter: v }),
  setPriorityFilter: (v) => set({ priorityFilter: v }),
  setSearchQuery: (v) => set({ searchQuery: v }),

  // UI
  sidebarOpen: true,
  selectedShipment: null,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setSelectedShipment: (s) => set({ selectedShipment: s }),

  // Derived
  getFilteredShipments: () => {
    const { shipments, statusFilter, priorityFilter, searchQuery } = get()
    return shipments.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      if (priorityFilter !== 'all' && s.priority_level !== priorityFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return s.shipment_id.toLowerCase().includes(q) ||
          s.origin.toLowerCase().includes(q) ||
          s.destination.toLowerCase().includes(q) ||
          (s.carrier || '').toLowerCase().includes(q)
      }
      return true
    })
  },
  getKPIs: () => {
    const { shipments } = get()
    const total = shipments.length
    const onTrack = shipments.filter((s) => s.status === 'on_track').length
    const delayed = shipments.filter((s) => s.status === 'delayed').length
    const atRisk = shipments.filter((s) => s.status === 'at_risk').length
    const onTimePercent = total > 0 ? Math.round((onTrack / total) * 100) : 0
    const totalCost = shipments.reduce((sum, s) => sum + (s.cost_usd || 0), 0)
    const avgRisk = total > 0 ? (shipments.reduce((s, x) => s + x.risk_score, 0) / total).toFixed(3) : 0
    return { total, onTrack, delayed, atRisk, onTimePercent, totalCost, avgRisk }
  }
}))

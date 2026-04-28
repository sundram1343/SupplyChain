import { useEffect, useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { connectWebSocket, disconnectWebSocket } from '../services/websocket'
import Navbar from '../components/Navbar'
import KPICards from '../components/KPICards'
import ShipmentTable from '../components/ShipmentTable'
import Analytics from '../components/Analytics'
import AlertsPanel from '../components/AlertsPanel'
import ShipmentMap from '../components/Map/ShipmentMap'
import api from '../services/api'

export default function Dashboard() {
  const { setShipments, setAlerts, setShipmentsLoading } = useAppStore()
  const [activeTab, setActiveTab] = useState('map') // 'map' or 'table'

  useEffect(() => {
    const fetchData = async () => {
      setShipmentsLoading(true)
      try {
        const [shipmentsRes, alertsRes] = await Promise.all([
          api.get('/shipments'),
          api.get('/alerts?acknowledged=false')
        ])
        setShipments(shipmentsRes.data.shipments)
        setAlerts(alertsRes.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setShipmentsLoading(false)
      }
    }

    fetchData()
    connectWebSocket()

    return () => disconnectWebSocket()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Logistics Control Tower</h1>
            <p className="text-slate-400 text-sm">Real-time supply chain monitoring and disruption detection</p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setActiveTab('map')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'map' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-surface'}`}
            >
              Map View
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'table' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-dark-surface'}`}
            >
              Shipment List
            </button>
            <button className="btn-primary ml-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Shipment
            </button>
          </div>
        </div>

        {/* KPI Section */}
        <KPICards />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-320px)] min-h-[600px]">
          {/* Main content area */}
          <div className="lg:col-span-9 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 glass-card overflow-hidden flex flex-col">
               {activeTab === 'map' ? (
                <div className="flex-1 relative">
                   <ShipmentMap />
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <ShipmentTable />
                </div>
              )}
            </div>
            
            <div className="h-64 glass-card p-4">
               <Analytics />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-3 flex flex-col gap-6 overflow-hidden">
            <div className="flex-1 glass-card overflow-hidden flex flex-col">
               <div className="p-4 border-b border-dark-border flex items-center justify-between">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Real-time Alerts</h3>
                  <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-500/30">CRITICAL</span>
               </div>
               <div className="flex-1 overflow-y-auto">
                  <AlertsPanel />
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { useAppStore } from '../../store/useAppStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createStatusIcon = (status) => {
  let color = '#3b82f6' // blue
  if (status === 'on_track') color = '#10b981' // emerald
  if (status === 'at_risk') color = '#f59e0b' // amber
  if (status === 'delayed') color = '#ef4444' // red

  return L.divIcon({
    className: 'custom-icon',
    html: `
      <div class="relative">
        <div class="w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse" style="background-color: ${color}"></div>
        <div class="absolute -inset-1 rounded-full opacity-30 animate-ping" style="background-color: ${color}"></div>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

function MapUpdater({ selectedShipment }) {
  const map = useMap()
  useEffect(() => {
    if (selectedShipment?.current_coords) {
      map.setView([selectedShipment.current_coords.lat, selectedShipment.current_coords.lng], 6, {
        animate: true
      })
    }
  }, [selectedShipment, map])
  return null
}

export default function ShipmentMap() {
  const shipments = useAppStore((s) => s.shipments)
  const selectedShipment = useAppStore((s) => s.selectedShipment)
  const setSelectedShipment = useAppStore((s) => s.setSelectedShipment)

  const center = [39.8283, -98.5795] // Geographic center of US

  return (
    <MapContainer 
      center={center} 
      zoom={4} 
      className="w-full h-full"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <MapUpdater selectedShipment={selectedShipment} />

      {shipments.map((s) => (
        <Marker 
          key={s.shipment_id}
          position={[s.current_coords.lat, s.current_coords.lng]}
          icon={createStatusIcon(s.status)}
          eventHandlers={{
            click: () => setSelectedShipment(s)
          }}
        >
          <Popup className="custom-popup">
            <div className="p-2 min-w-[200px]">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-brand-400 font-bold text-xs">{s.shipment_id}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                  s.status === 'on_track' ? 'bg-emerald-500/20 text-emerald-400' :
                  s.status === 'at_risk' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {s.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm font-bold text-white mb-1">{s.origin} → {s.destination}</p>
              <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                <span>Carrier: {s.carrier}</span>
                <span>Risk: {s.risk_score.toFixed(2)}</span>
              </div>
              <div className="w-full bg-dark-border h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${s.risk_score > 0.7 ? 'bg-red-500' : s.risk_score > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${s.risk_score * 100}%` }}
                />
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Show active route polyline if a shipment is selected */}
      {selectedShipment?.route_coords && (
        <Polyline 
          positions={selectedShipment.route_coords.map(c => [c.lat, c.lng])}
          color="#3b82f6"
          weight={3}
          opacity={0.6}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  )
}

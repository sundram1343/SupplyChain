import { useAppStore } from '../store/useAppStore'

let ws = null
let reconnectTimer = null

export function connectWebSocket() {
  if (ws && ws.readyState === WebSocket.OPEN) return

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const url = `${protocol}//${window.location.host}/ws/shipments`

  ws = new WebSocket(url)

  ws.onopen = () => {
    console.log('✅ WebSocket connected')
    useAppStore.getState().setWsConnected(true)
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
  }

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data)
      const store = useAppStore.getState()
      if (msg.type === 'INITIAL_DATA') {
        store.setShipments(msg.data.shipments)
        store.setAlerts(msg.data.alerts)
      } else if (msg.type === 'SHIPMENT_UPDATE') {
        store.updateShipments(msg.data)
      } else if (msg.type === 'ALERT') {
        store.addAlert(msg.data)
      }
    } catch (e) { console.error('WS parse error', e) }
  }

  ws.onerror = (err) => { console.error('WS error', err) }

  ws.onclose = () => {
    console.warn('⚠️ WebSocket disconnected. Reconnecting in 3s...')
    useAppStore.getState().setWsConnected(false)
    reconnectTimer = setTimeout(connectWebSocket, 3000)
  }
}

export function disconnectWebSocket() {
  if (ws) { ws.close(); ws = null }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
}

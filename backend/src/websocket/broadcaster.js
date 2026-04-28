const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');
const { simulateFactors, computeRisk } = require('../services/riskEngine');

const clients = new Set();

function initBroadcaster(wss) {
  wss.on('connection', (ws, req) => {
    console.log('📡 WebSocket client connected');
    clients.add(ws);
    ws.on('close', () => { clients.delete(ws); console.log('📡 WebSocket client disconnected'); });
    ws.on('error', (err) => { console.error('WS error:', err.message); clients.delete(ws); });
    // Send initial payload on connect
    sendInitialData(ws);
  });

  // Live simulation: update 3 random shipments every 4 seconds
  setInterval(async () => {
    if (clients.size === 0) return;
    try {
      const count = await Shipment.countDocuments();
      if (count === 0) return;

      const randomSkips = Array.from({ length: 3 }, () => Math.floor(Math.random() * count));
      const updated = [];

      for (const skip of randomSkips) {
        const shipment = await Shipment.findOne().skip(skip);
        if (!shipment) continue;

        // Move current location slightly
        const oc = shipment.origin_coords;
        const dc = shipment.destination_coords;
        if (!oc || !dc) continue;

        const progress = Math.min(1, Math.random() * 0.05 + 0.1);
        const newLat = parseFloat((shipment.current_coords.lat + progress * (dc.lat - oc.lat) * 0.1).toFixed(4));
        const newLng = parseFloat((shipment.current_coords.lng + progress * (dc.lng - oc.lng) * 0.1).toFixed(4));

        // Slightly mutate risk factors
        const tf = Math.min(1, Math.max(0, shipment.traffic_factor + (Math.random() - 0.5) * 0.1));
        const wf = Math.min(1, Math.max(0, shipment.weather_factor + (Math.random() - 0.5) * 0.05));
        const { risk_score, classification } = computeRisk({ traffic_factor: tf, weather_factor: wf, historical_delay: shipment.historical_delay });

        shipment.current_coords = { lat: newLat, lng: newLng };
        shipment.current_location = `${newLat}, ${newLng}`;
        shipment.traffic_factor = parseFloat(tf.toFixed(2));
        shipment.weather_factor = parseFloat(wf.toFixed(2));
        shipment.risk_score = risk_score;
        shipment.status = classification;
        await shipment.save();

        // Trigger alert if newly critical
        if (risk_score > 0.7) {
          const recentAlert = await Alert.findOne({
            shipment_id: shipment.shipment_id,
            type: 'risk_threshold',
            timestamp: { $gte: new Date(Date.now() - 120000) }
          });
          if (!recentAlert) {
            const alert = await Alert.create({
              shipment_id: shipment.shipment_id, shipment_ref: shipment._id,
              message: `⚠️ LIVE: ${shipment.shipment_id} risk score spiked to ${risk_score.toFixed(2)}`,
              severity: 'critical', type: 'risk_threshold'
            });
            broadcast({ type: 'ALERT', data: alert });
          }
        }

        updated.push(shipment);
      }

      if (updated.length > 0) {
        broadcast({ type: 'SHIPMENT_UPDATE', data: updated });
      }
    } catch (err) {
      console.error('Broadcaster error:', err.message);
    }
  }, 4000);
}

async function sendInitialData(ws) {
  try {
    const shipments = await Shipment.find().limit(50);
    const alerts = await Alert.find({ acknowledged: false }).sort({ timestamp: -1 }).limit(20);
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'INITIAL_DATA', data: { shipments, alerts } }));
    }
  } catch (err) { console.error('sendInitialData error:', err.message); }
}

function broadcast(message) {
  const payload = JSON.stringify(message);
  clients.forEach(ws => {
    if (ws.readyState === 1) ws.send(payload);
  });
}

module.exports = { initBroadcaster };

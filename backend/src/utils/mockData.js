const { v4: uuidv4 } = require('uuid');
const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { CITY_COORDS } = require('../services/routeOptimizer');

const CITIES = Object.keys(CITY_COORDS);
const CARRIERS = ['FastFreight Inc.', 'GlobalLogix', 'SwiftCargo', 'PrimeHaul', 'CrossCountry Express'];
const CARGO_TYPES = ['Electronics', 'Pharmaceuticals', 'Automotive Parts', 'Food & Beverage', 'Chemicals', 'Machinery'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function buildRouteCoords(from, to, steps = 5) {
  const result = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    result.push({
      lat: parseFloat((from[0] + t * (to[0] - from[0])).toFixed(4)),
      lng: parseFloat((from[1] + t * (to[1] - from[1])).toFixed(4))
    });
  }
  return result;
}

function makeShipment(index) {
  let origin, destination;
  do { origin = pick(CITIES); destination = pick(CITIES); } while (origin === destination);

  const oc = CITY_COORDS[origin];
  const dc = CITY_COORDS[destination];
  const p = rand(0.1, 0.9);
  const clat = parseFloat((oc[0] + p * (dc[0] - oc[0])).toFixed(4));
  const clng = parseFloat((oc[1] + p * (dc[1] - oc[1])).toFixed(4));

  const tf = parseFloat(rand(0.1, 0.9).toFixed(2));
  const wf = parseFloat(rand(0.05, 0.85).toFixed(2));
  const hd = parseFloat(rand(0.05, 0.6).toFixed(2));
  const rs = parseFloat((0.4 * tf + 0.3 * wf + 0.3 * hd).toFixed(3));
  const status = rs < 0.4 ? 'on_track' : rs <= 0.7 ? 'at_risk' : 'delayed';

  return {
    shipment_id: `SHP-${String(index + 1).padStart(4, '0')}`,
    origin, destination,
    current_location: `${clat}, ${clng}`,
    origin_coords: { lat: oc[0], lng: oc[1], city: origin },
    destination_coords: { lat: dc[0], lng: dc[1], city: destination },
    current_coords: { lat: clat, lng: clng },
    route_coords: buildRouteCoords(oc, dc, 6).map(c => ({ lat: c.lat, lng: c.lng })),
    eta: new Date(Date.now() + rand(2, 72) * 3600000),
    status, risk_score: rs,
    priority_level: pick(PRIORITIES),
    cargo_type: pick(CARGO_TYPES),
    weight_kg: Math.floor(rand(500, 20000)),
    cost_usd: Math.floor(rand(2000, 50000)),
    carrier: pick(CARRIERS),
    traffic_factor: tf, weather_factor: wf, historical_delay: hd
  };
}

async function seedMockData() {
  await Shipment.deleteMany({});
  await Alert.deleteMany({});

  if (!(await User.findOne({ email: 'admin@supplychain.ai' }))) {
    await User.create({ name: 'Admin User', email: 'admin@supplychain.ai', password: 'Admin@123', role: 'admin' });
  }
  if (!(await User.findOne({ email: 'operator@supplychain.ai' }))) {
    await User.create({ name: 'John Operator', email: 'operator@supplychain.ai', password: 'Operator@123', role: 'operator' });
  }

  const docs = Array.from({ length: 35 }, (_, i) => makeShipment(i));
  const inserted = await Shipment.insertMany(docs);

  const alerts = [];
  for (const s of inserted) {
    if (s.risk_score > 0.7) {
      alerts.push({ shipment_id: s.shipment_id, shipment_ref: s._id, severity: 'critical', type: 'risk_threshold',
        message: `⚠️ HIGH RISK: Shipment ${s.shipment_id} (${s.origin} → ${s.destination}) risk score ${s.risk_score.toFixed(2)}`,
        timestamp: new Date(Date.now() - rand(0, 3600000)) });
    } else if (s.weather_factor > 0.65) {
      alerts.push({ shipment_id: s.shipment_id, shipment_ref: s._id, severity: 'warning', type: 'weather',
        message: `🌩️ WEATHER: Severe conditions on ${s.shipment_id} route (${s.origin} → ${s.destination})`,
        timestamp: new Date(Date.now() - rand(0, 7200000)) });
    } else if (s.traffic_factor > 0.7) {
      alerts.push({ shipment_id: s.shipment_id, shipment_ref: s._id, severity: 'warning', type: 'traffic',
        message: `🚦 TRAFFIC: Heavy congestion affecting ${s.shipment_id} — ETA may increase`,
        timestamp: new Date(Date.now() - rand(0, 1800000)) });
    }
  }
  if (alerts.length) await Alert.insertMany(alerts);
  return { shipments: inserted.length, alerts: alerts.length };
}

module.exports = { seedMockData };

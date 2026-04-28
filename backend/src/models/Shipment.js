const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  city: { type: String }
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
  shipment_id: { type: String, required: true, unique: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  current_location: { type: String, required: true },
  current_coords: { type: coordinateSchema },
  origin_coords: { type: coordinateSchema },
  destination_coords: { type: coordinateSchema },
  route_coords: [{ type: coordinateSchema }],
  eta: { type: Date, required: true },
  status: {
    type: String,
    enum: ['on_track', 'at_risk', 'delayed', 'delivered'],
    default: 'on_track'
  },
  risk_score: { type: Number, default: 0, min: 0, max: 1 },
  priority_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  cargo_type: { type: String, default: 'General' },
  weight_kg: { type: Number, default: 1000 },
  cost_usd: { type: Number, default: 5000 },
  carrier: { type: String, default: 'FastFreight Inc.' },
  traffic_factor: { type: Number, default: 0.3, min: 0, max: 1 },
  weather_factor: { type: Number, default: 0.2, min: 0, max: 1 },
  historical_delay: { type: Number, default: 0.2, min: 0, max: 1 },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Compute risk_score before save
shipmentSchema.pre('save', function (next) {
  this.risk_score = parseFloat(
    (0.4 * this.traffic_factor + 0.3 * this.weather_factor + 0.3 * this.historical_delay).toFixed(3)
  );
  if (this.risk_score < 0.4) this.status = 'on_track';
  else if (this.risk_score <= 0.7) this.status = 'at_risk';
  else this.status = 'delayed';
  next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);

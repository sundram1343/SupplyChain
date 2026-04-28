const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  shipment_id: { type: String, required: true },
  shipment_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  message: { type: String, required: true },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning'
  },
  type: {
    type: String,
    enum: ['risk_threshold', 'weather', 'traffic', 'delay', 'system'],
    default: 'risk_threshold'
  },
  acknowledged: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Alert', alertSchema);

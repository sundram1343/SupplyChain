const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');
const { computeRisk } = require('../services/riskEngine');

// GET /api/risk/:shipment_id
router.get('/:shipment_id', protect, async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ shipment_id: req.params.shipment_id });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const riskAnalysis = computeRisk({
      traffic_factor: shipment.traffic_factor,
      weather_factor: shipment.weather_factor,
      historical_delay: shipment.historical_delay
    });

    // Create alert if crossing threshold
    if (riskAnalysis.risk_score > 0.7) {
      const existing = await Alert.findOne({
        shipment_id: shipment.shipment_id,
        type: 'risk_threshold',
        createdAt: { $gte: new Date(Date.now() - 60000) }
      });
      if (!existing) {
        await Alert.create({
          shipment_id: shipment.shipment_id,
          shipment_ref: shipment._id,
          message: `⚠️ CRITICAL: Shipment ${shipment.shipment_id} risk score is ${riskAnalysis.risk_score.toFixed(2)} — ${shipment.origin} → ${shipment.destination}`,
          severity: 'critical',
          type: 'risk_threshold'
        });
      }
    }

    res.json({
      shipment_id: shipment.shipment_id,
      ...riskAnalysis,
      factors: {
        traffic: { value: shipment.traffic_factor, label: getTrafficLabel(shipment.traffic_factor) },
        weather: { value: shipment.weather_factor, label: getWeatherLabel(shipment.weather_factor) },
        historical: { value: shipment.historical_delay, label: `${(shipment.historical_delay * 100).toFixed(0)}% delay probability` }
      }
    });
  } catch (err) { next(err); }
});

function getTrafficLabel(v) {
  if (v < 0.3) return 'Clear';
  if (v < 0.6) return 'Moderate';
  return 'Heavy';
}

function getWeatherLabel(v) {
  if (v < 0.3) return 'Clear';
  if (v < 0.6) return 'Cloudy / Light Rain';
  return 'Severe Storm';
}

module.exports = router;

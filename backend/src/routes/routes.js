const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const { protect } = require('../middleware/auth');
const { optimizeRoute } = require('../services/routeOptimizer');

// GET /api/optimize-route/:shipment_id
router.get('/:shipment_id', protect, async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ shipment_id: req.params.shipment_id });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });

    const result = optimizeRoute(shipment.origin, shipment.destination);
    res.json({
      shipment_id: shipment.shipment_id,
      origin: shipment.origin,
      destination: shipment.destination,
      ...result
    });
  } catch (err) { next(err); }
});

module.exports = router;

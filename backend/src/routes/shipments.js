const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/shipments
router.get('/', protect, async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority_level = priority;
    if (search) {
      filter.$or = [
        { shipment_id: new RegExp(search, 'i') },
        { origin: new RegExp(search, 'i') },
        { destination: new RegExp(search, 'i') }
      ];
    }
    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await Shipment.countDocuments(filter);
    res.json({ shipments, total, page: parseInt(page) });
  } catch (err) { next(err); }
});

// POST /api/shipments
router.post('/', protect, async (req, res, next) => {
  try {
    const data = { ...req.body, shipment_id: req.body.shipment_id || `SHP-${uuidv4().slice(0,8).toUpperCase()}`, created_by: req.user._id };
    const shipment = await Shipment.create(data);
    // Auto-create alert if high risk
    if (shipment.risk_score > 0.7) {
      await Alert.create({
        shipment_id: shipment.shipment_id,
        shipment_ref: shipment._id,
        message: `New shipment ${shipment.shipment_id} created with HIGH risk score (${shipment.risk_score.toFixed(2)})`,
        severity: 'critical',
        type: 'risk_threshold'
      });
    }
    res.status(201).json(shipment);
  } catch (err) { next(err); }
});

// GET /api/shipments/:id
router.get('/:id', protect, async (req, res, next) => {
  try {
    const shipment = await Shipment.findOne({ shipment_id: req.params.id }) || await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (err) { next(err); }
});

// PUT /api/shipments/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const shipment = await Shipment.findOneAndUpdate(
      { shipment_id: req.params.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (err) { next(err); }
});

// DELETE /api/shipments/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const shipment = await Shipment.findOneAndDelete({ shipment_id: req.params.id });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ message: 'Shipment deleted successfully' });
  } catch (err) { next(err); }
});

module.exports = router;

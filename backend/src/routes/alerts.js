const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect } = require('../middleware/auth');

// GET /api/alerts
router.get('/', protect, async (req, res, next) => {
  try {
    const { severity, acknowledged, limit = 50 } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true';
    const alerts = await Alert.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    res.json(alerts);
  } catch (err) { next(err); }
});

// PATCH /api/alerts/:id/acknowledge
router.patch('/:id/acknowledge', protect, async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (err) { next(err); }
});

// DELETE /api/alerts/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted' });
  } catch (err) { next(err); }
});

module.exports = router;

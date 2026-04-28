const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const shipmentRoutes = require('./src/routes/shipments');
const riskRoutes = require('./src/routes/risk');
const routeOptRoutes = require('./src/routes/routes');
const alertRoutes = require('./src/routes/alerts');
const { initBroadcaster } = require('./src/websocket/broadcaster');
const { seedMockData } = require('./src/utils/mockData');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws/shipments' });
initBroadcaster(wss);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/optimize-route', routeOptRoutes);
app.use('/api/alerts', alertRoutes);

// Seed endpoint (dev only)
app.post('/api/seed', async (req, res) => {
  try {
    await seedMockData();
    res.json({ message: 'Mock data seeded successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/supply_chain_ai';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Auto-seed if empty
    const Shipment = require('./src/models/Shipment');
    const count = await Shipment.countDocuments();
    if (count === 0) {
      console.log('📦 Seeding mock data...');
      await seedMockData();
      console.log('✅ Mock data seeded');
    }
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws/shipments`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

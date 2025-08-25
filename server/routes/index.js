const express = require('express');
const systemRoutes = require('./systemRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const cardRoutes = require('./cardRoutes');
const processingRoutes = require('./processingRoutes');

const router = express.Router();

// Health check endpoint
router.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CardCataloger API'
  });
});

// System routes
router.use('/api/system', systemRoutes);

// Dashboard routes
router.use('/api/dashboard', dashboardRoutes);

// Card routes
router.use('/api/cards', cardRoutes);

// Processing routes
router.use('/api/processing', processingRoutes);

module.exports = router;
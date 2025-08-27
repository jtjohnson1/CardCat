const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ollamaService = require('../services/ollamaService');

// GET /api/system/status - Get system status
router.get('/status', async (req, res) => {
  try {
    console.log('Checking system status...');

    // Check database connection
    const databaseConnected = mongoose.connection.readyState === 1;
    console.log('Database connected:', databaseConnected);

    // Check Ollama connection
    let ollamaConnected = false;
    try {
      await ollamaService.checkOllamaHealth();
      ollamaConnected = true;
      console.log('Ollama connected: true');
    } catch (error) {
      console.log('Ollama connected: false -', error.message);
    }

    res.json({
      ollamaConnected,
      databaseConnected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    res.status(500).json({
      error: 'Failed to check system status',
      message: error.message
    });
  }
});

module.exports = router;
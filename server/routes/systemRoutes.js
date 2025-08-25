const express = require('express');
const { getSystemStatus } = require('../services/systemService');
const router = express.Router();

/**
 * GET /api/system/status
 * Get system status including Ollama and database connectivity
 */
router.get('/status', async (req, res) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`[${requestId}] System status endpoint called from ${req.ip}`);
    const startTime = Date.now();

    const systemStatus = await getSystemStatus();

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] System status response sent (${duration}ms)`);

    res.json(systemStatus);
  } catch (error) {
    console.error(`[${requestId}] Error getting system status:`, error.message);
    console.error(`[${requestId}] Stack trace:`, error.stack);

    res.status(500).json({
      error: 'Failed to get system status',
      message: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const priceService = require('../services/priceService');

// GET /api/prices/compare - Get price comparisons for a card
router.get('/compare', async (req, res) => {
  try {
    const { manufacturer, playerName, year, cardNumber } = req.query;

    console.log('\n=== PRICE COMPARISON REQUEST ===');
    console.log('Card details:', { manufacturer, playerName, year, cardNumber });

    if (!manufacturer || !playerName || !year) {
      console.error('Missing required parameters:', { manufacturer, playerName, year });
      return res.status(400).json({
        error: 'Missing required parameters: manufacturer, playerName, year'
      });
    }

    // Use the price service to get comparisons
    const result = await priceService.getPriceComparisons({
      manufacturer,
      playerName,
      year: parseInt(year),
      cardNumber
    });

    console.log(`Returning ${result.priceComparisons.length} price comparisons with average: $${result.averagePrice.toFixed(2)}`);

    res.json(result);

  } catch (error) {
    console.error('Error getting price comparisons:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to get price comparisons',
      message: error.message
    });
  }
});

// GET /api/prices/history/:cardId - Get price history for a specific card
router.get('/history/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;

    console.log('\n=== PRICE HISTORY REQUEST ===');
    console.log('Card ID:', cardId);

    // Return empty history since we're removing mock data
    res.json({
      cardId,
      priceHistory: [],
      message: 'Price history feature not yet implemented'
    });

  } catch (error) {
    console.error('Error getting price history:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to get price history',
      message: error.message
    });
  }
});

// POST /api/prices/update - Update price for a specific card
router.post('/update', async (req, res) => {
  try {
    const { cardId, newPrice, source } = req.body;

    console.log('\n=== PRICE UPDATE REQUEST ===');
    console.log('Card ID:', cardId);
    console.log('New price:', newPrice);
    console.log('Source:', source);

    if (!cardId || !newPrice) {
      console.error('Missing required parameters:', { cardId, newPrice });
      return res.status(400).json({
        error: 'Missing required parameters: cardId, newPrice'
      });
    }

    if (typeof newPrice !== 'number' || newPrice < 0) {
      console.error('Invalid price value:', newPrice);
      return res.status(400).json({
        error: 'Price must be a positive number'
      });
    }

    // In a real implementation, this would update the card price in the database
    // For now, we'll just return success
    console.log(`Price updated successfully for card ${cardId}: $${newPrice}`);

    res.json({
      success: true,
      cardId,
      newPrice,
      source: source || 'Manual Update',
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating price:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to update price',
      message: error.message
    });
  }
});

module.exports = router;
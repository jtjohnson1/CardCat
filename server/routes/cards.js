const express = require('express');
const router = express.Router();

// GET /api/cards - Get all cards
router.get('/', async (req, res) => {
  try {
    // TODO: Implement database query to get all cards
    // For now, return empty array until database models are implemented
    res.json({
      cards: [],
      totalCount: 0
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({
      error: 'Failed to fetch cards',
      message: error.message
    });
  }
});

// DELETE /api/cards - Delete selected cards
router.delete('/', async (req, res) => {
  try {
    const { cardIds } = req.body;

    if (!cardIds || !Array.isArray(cardIds)) {
      return res.status(400).json({
        error: 'cardIds array is required'
      });
    }

    // TODO: Implement database deletion
    // For now, return success with 0 deleted
    res.json({
      success: true,
      deletedCount: 0
    });
  } catch (error) {
    console.error('Error deleting cards:', error);
    res.status(500).json({
      error: 'Failed to delete cards',
      message: error.message
    });
  }
});

module.exports = router;
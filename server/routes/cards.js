const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// GET /api/cards - Get all cards
router.get('/', async (req, res) => {
  try {
    console.log('\n=== GET CARDS REQUEST ===');
    console.log('Request received at:', new Date().toISOString());
    console.log('Request headers:', req.headers);
    console.log('Request query:', req.query);

    console.log('Querying database for cards...');
    const cards = await Card.find({}).sort({ createdAt: -1 });
    
    console.log(`✅ Database query completed. Found ${cards.length} cards`);
    
    if (cards.length > 0) {
      console.log('Sample card from database:');
      console.log('- ID:', cards[0]._id);
      console.log('- Player:', cards[0].playerName);
      console.log('- Manufacturer:', cards[0].manufacturer);
      console.log('- Front Image Path:', cards[0].frontImagePath);
      console.log('- Front Image URL:', cards[0].frontImageUrl);
      console.log('- Created At:', cards[0].createdAt);
    } else {
      console.log('⚠️ No cards found in database');
    }

    const response = {
      cards: cards,
      totalCount: cards.length
    };

    console.log('Sending response:');
    console.log('- Response type:', typeof response);
    console.log('- Cards array length:', response.cards.length);
    console.log('- Total count:', response.totalCount);

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching cards:');
    console.error('- Error type:', typeof error);
    console.error('- Error message:', error.message);
    console.error('- Error stack:', error.stack);
    
    res.status(500).json({
      error: 'Failed to fetch cards',
      message: error.message
    });
  }
});

// GET /api/cards/:id - Get specific card
router.get('/:id', async (req, res) => {
  try {
    console.log(`\n=== GET CARD BY ID: ${req.params.id} ===`);

    const card = await Card.findOne({ id: req.params.id });

    if (!card) {
      return res.status(404).json({
        error: 'Card not found'
      });
    }

    console.log(`Found card: ${card.playerName}`);
    res.json(card);

  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({
      error: 'Failed to fetch card',
      message: error.message
    });
  }
});

// DELETE /api/cards/:id - Delete specific card
router.delete('/:id', async (req, res) => {
  try {
    console.log(`\n=== DELETE CARD BY ID: ${req.params.id} ===`);

    const result = await Card.deleteOne({ id: req.params.id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'Card not found'
      });
    }

    console.log(`Deleted card: ${req.params.id}`);
    res.json({
      success: true,
      message: 'Card deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({
      error: 'Failed to delete card',
      message: error.message
    });
  }
});

// DELETE /api/cards - Delete multiple cards
router.delete('/', async (req, res) => {
  try {
    const { cardIds } = req.body;
    console.log(`\n=== DELETE MULTIPLE CARDS: ${cardIds?.length || 0} cards ===`);

    if (!cardIds || !Array.isArray(cardIds)) {
      return res.status(400).json({
        error: 'cardIds array is required'
      });
    }

    const result = await Card.deleteMany({ id: { $in: cardIds } });

    console.log(`Deleted ${result.deletedCount} cards`);
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} cards successfully`
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
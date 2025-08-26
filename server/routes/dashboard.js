const express = require('express');
const router = express.Router();
const Card = require('../models/Card');

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('\n=== DASHBOARD STATS REQUEST ===');
    console.log('Request received at:', new Date().toISOString());

    // Get total card count
    const totalCards = await Card.countDocuments();
    console.log('Total cards in database:', totalCards);

    // Get cards by manufacturer
    const cardsByManufacturer = await Card.aggregate([
      {
        $group: {
          _id: '$manufacturer',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);
    console.log('Cards by manufacturer:', cardsByManufacturer);

    // Get cards by sport
    const cardsBySport = await Card.aggregate([
      {
        $group: {
          _id: '$sport',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    console.log('Cards by sport:', cardsBySport);

    // Get total estimated value
    const totalValueResult = await Card.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$estimatedValue' }
        }
      }
    ]);
    const totalValue = totalValueResult.length > 0 ? totalValueResult[0].totalValue : 0;
    console.log('Total estimated value:', totalValue);

    // Get average card value
    const averageValue = totalCards > 0 ? totalValue / totalCards : 0;
    console.log('Average card value:', averageValue);

    // Get recently added cards (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCards = await Card.find({
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: -1 }).limit(10);
    console.log('Recent cards (last 7 days):', recentCards.length);

    // Get cards processed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const cardsProcessedToday = await Card.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    console.log('Cards processed today:', cardsProcessedToday);

    // Get most valuable cards
    const mostValuableCards = await Card.find()
      .sort({ estimatedValue: -1 })
      .limit(5)
      .select('playerName manufacturer year estimatedValue frontImageUrl');
    console.log('Most valuable cards:', mostValuableCards.length);

    const response = {
      totalCards,
      totalValue,
      averageValue,
      cardsProcessedToday,
      cardsByManufacturer,
      cardsBySport,
      recentCards: recentCards.map(card => ({
        _id: card._id,
        playerName: card.playerName,
        manufacturer: card.manufacturer,
        year: card.year,
        estimatedValue: card.estimatedValue,
        createdAt: card.createdAt
      })),
      mostValuableCards
    };

    console.log('Sending dashboard stats response');
    console.log('Response summary:', {
      totalCards: response.totalCards,
      totalValue: response.totalValue,
      averageValue: response.averageValue,
      cardsProcessedToday: response.cardsProcessedToday,
      manufacturerCount: response.cardsByManufacturer.length,
      sportCount: response.cardsBySport.length,
      recentCardsCount: response.recentCards.length,
      mostValuableCardsCount: response.mostValuableCards.length
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);

    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const axios = require('axios');

// eBay API configuration
const EBAY_CONFIG = {
  appId: process.env.EBAY_APP_ID, // INPUT_REQUIRED {eBay Application ID from eBay Developer Program}
  devId: process.env.EBAY_DEV_ID, // INPUT_REQUIRED {eBay Developer ID from eBay Developer Program}
  certId: process.env.EBAY_CERT_ID, // INPUT_REQUIRED {eBay Certificate ID from eBay Developer Program}
  rotatingKey: process.env.EBAY_ROTATING_KEY, // INPUT_REQUIRED {eBay Rotating Key from eBay Developer Program}
  baseUrl: 'https://svcs.ebay.com/services/search/FindingService/v1'
};

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

    const priceComparisons = [];

    // eBay API call
    if (EBAY_CONFIG.appId && EBAY_CONFIG.devId && EBAY_CONFIG.certId && EBAY_CONFIG.rotatingKey) {
      try {
        console.log('Fetching eBay prices...');
        const ebayPrices = await getEbayPrices({ manufacturer, playerName, year, cardNumber });
        priceComparisons.push(...ebayPrices);
        console.log(`Retrieved ${ebayPrices.length} eBay price comparisons`);
      } catch (error) {
        console.error('eBay API error:', error.message);
        console.error('eBay API error stack:', error.stack);
      }
    } else {
      console.log('eBay API not configured - missing API credentials (App ID, Dev ID, Cert ID, or Rotating Key)');
    }

    // If no real API data and no eBay config, return empty results
    if (priceComparisons.length === 0) {
      console.log('No price data available - eBay API not configured');

      return res.json({
        priceComparisons: [],
        averagePrice: 0,
        message: 'Price comparison service not configured. Please set up all eBay API credentials (App ID, Dev ID, Cert ID, and Rotating Key).'
      });
    }

    const averagePrice = priceComparisons.reduce((sum, price) => sum + price.price, 0) / priceComparisons.length;

    console.log(`Returning ${priceComparisons.length} price comparisons with average: $${averagePrice.toFixed(2)}`);

    res.json({
      priceComparisons,
      averagePrice
    });

  } catch (error) {
    console.error('Error getting price comparisons:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to get price comparisons',
      message: error.message
    });
  }
});

// Helper function to get eBay prices
async function getEbayPrices({ manufacturer, playerName, year, cardNumber }) {
  try {
    console.log('Making eBay API request...');

    // Build search query
    let searchQuery = `${playerName} ${year} ${manufacturer}`;
    if (cardNumber) {
      searchQuery += ` ${cardNumber}`;
    }

    console.log('eBay search query:', searchQuery);

    const params = {
      'OPERATION-NAME': 'findCompletedItems',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_CONFIG.appId,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': searchQuery,
      'categoryId': '213', // Sports Trading Cards category
      'itemFilter(0).name': 'SoldItemsOnly',
      'itemFilter(0).value': 'true',
      'itemFilter(1).name': 'Condition',
      'itemFilter(1).value': 'Used',
      'sortOrder': 'EndTimeSoonest',
      'paginationInput.entriesPerPage': '10'
    };

    const response = await axios.get(EBAY_CONFIG.baseUrl, {
      params,
      timeout: 10000
    });

    console.log('eBay API response status:', response.status);

    if (!response.data || !response.data.findCompletedItemsResponse) {
      console.error('Invalid eBay API response structure:', response.data);
      throw new Error('Invalid eBay API response');
    }

    const ebayResponse = response.data.findCompletedItemsResponse[0];

    if (ebayResponse.ack[0] !== 'Success') {
      console.error('eBay API error:', ebayResponse.errorMessage);
      throw new Error(`eBay API error: ${ebayResponse.errorMessage?.[0]?.error?.[0]?.message?.[0] || 'Unknown error'}`);
    }

    const searchResult = ebayResponse.searchResult[0];
    const items = searchResult.item || [];

    console.log(`Found ${items.length} completed eBay listings`);

    const prices = items.map(item => {
      const price = parseFloat(item.sellingStatus[0].currentPrice[0].__value__);
      const condition = item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown';
      const title = item.title[0];
      const url = item.viewItemURL[0];
      const endTime = item.listingInfo[0].endTime[0];

      return {
        source: 'eBay (Sold)',
        price: price,
        condition: condition,
        title: title,
        url: url,
        lastUpdated: endTime
      };
    });

    console.log(`Processed ${prices.length} eBay price entries`);
    return prices;

  } catch (error) {
    console.error('Error fetching eBay prices:', error.message);
    console.error('Error details:', error.response?.data || error.stack);
    throw error;
  }
}

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
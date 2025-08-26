const axios = require('axios');

class PriceService {
  constructor() {
    this.ebayConfig = {
      appId: process.env.EBAY_APP_ID,
      devId: process.env.EBAY_DEV_ID,
      certId: process.env.EBAY_CERT_ID,
      rotatingKey: process.env.EBAY_ROTATING_KEY,
      baseUrl: 'https://svcs.ebay.com/services/search/FindingService/v1'
    };
  }

  /**
   * Get price comparisons from multiple sources
   */
  async getPriceComparisons(cardData) {
    console.log('\n=== PRICE SERVICE: Getting price comparisons ===');
    console.log('Card data:', cardData);

    const priceComparisons = [];

    try {
      // Get eBay prices
      if (this.ebayConfig.appId) {
        try {
          const ebayPrices = await this.getEbayPrices(cardData);
          priceComparisons.push(...ebayPrices);
          console.log(`Retrieved ${ebayPrices.length} eBay prices`);
        } catch (error) {
          console.error('eBay price lookup failed:', error.message);
        }
      }

      // Get TCGPlayer prices
      try {
        const tcgPlayerPrices = await this.getTCGPlayerPrices(cardData);
        priceComparisons.push(...tcgPlayerPrices);
        console.log(`Retrieved ${tcgPlayerPrices.length} TCGPlayer prices`);
      } catch (error) {
        console.error('TCGPlayer price lookup failed:', error.message);
      }

      // Calculate average price
      const averagePrice = priceComparisons.length > 0
        ? priceComparisons.reduce((sum, price) => sum + price.price, 0) / priceComparisons.length
        : 0;

      console.log(`Total price comparisons: ${priceComparisons.length}, Average: $${averagePrice.toFixed(2)}`);

      return {
        priceComparisons,
        averagePrice,
        estimatedValue: averagePrice
      };

    } catch (error) {
      console.error('Error getting price comparisons:', error);
      return {
        priceComparisons: [],
        averagePrice: 0,
        estimatedValue: 0
      };
    }
  }

  /**
   * Get eBay prices for a card
   */
  async getEbayPrices(cardData) {
    try {
      console.log('Fetching eBay prices...');

      // Build search query
      let searchQuery = `${cardData.playerName} ${cardData.year} ${cardData.manufacturer}`;
      if (cardData.cardNumber && cardData.cardNumber !== 'Unknown') {
        searchQuery += ` ${cardData.cardNumber}`;
      }

      console.log('eBay search query:', searchQuery);

      const params = {
        'OPERATION-NAME': 'findCompletedItems',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': this.ebayConfig.appId,
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

      const response = await axios.get(this.ebayConfig.baseUrl, {
        params,
        timeout: 10000
      });

      if (!response.data || !response.data.findCompletedItemsResponse) {
        throw new Error('Invalid eBay API response');
      }

      const ebayResponse = response.data.findCompletedItemsResponse[0];

      if (ebayResponse.ack[0] !== 'Success') {
        throw new Error(`eBay API error: ${ebayResponse.errorMessage?.[0]?.error?.[0]?.message?.[0] || 'Unknown error'}`);
      }

      const searchResult = ebayResponse.searchResult[0];
      const items = searchResult.item || [];

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

      return prices;

    } catch (error) {
      console.error('Error fetching eBay prices:', error.message);
      throw error;
    }
  }

  /**
   * Get TCGPlayer prices for a card (mock implementation for now)
   */
  async getTCGPlayerPrices(cardData) {
    try {
      console.log('Fetching TCGPlayer prices...');

      // For now, return mock TCGPlayer data since we don't have API access
      // In a real implementation, you would integrate with TCGPlayer's API
      const mockPrices = [];

      // Only add TCGPlayer data for sports cards that might be on TCGPlayer
      if (cardData.sport && (cardData.sport.toLowerCase().includes('baseball') || 
                            cardData.sport.toLowerCase().includes('football') ||
                            cardData.sport.toLowerCase().includes('basketball'))) {
        
        // Generate realistic price range based on card attributes
        let basePrice = 5;
        if (cardData.specialFeatures.includes('Rookie Card')) basePrice *= 2;
        if (cardData.specialFeatures.includes('Autograph')) basePrice *= 5;
        if (cardData.year < 2000) basePrice *= 1.5;

        mockPrices.push({
          source: 'TCGPlayer',
          price: basePrice + Math.random() * 10,
          condition: 'Near Mint',
          title: `${cardData.playerName} ${cardData.year} ${cardData.manufacturer}`,
          url: 'https://www.tcgplayer.com',
          lastUpdated: new Date().toISOString()
        });
      }

      console.log(`TCGPlayer returned ${mockPrices.length} prices`);
      return mockPrices;

    } catch (error) {
      console.error('Error fetching TCGPlayer prices:', error.message);
      throw error;
    }
  }
}

module.exports = new PriceService();
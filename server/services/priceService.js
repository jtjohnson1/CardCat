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
    console.log('\n=== PRICE SERVICE: Getting price comparisons (ABSOLUTELY NO MOCK DATA) ===');
    console.log('Card data:', cardData);

    const priceComparisons = [];

    try {
      // 🚨 STRICT CHECK: Only use eBay if ALL credentials are present
      const ebayConfigured = this.ebayConfig.appId && 
                            this.ebayConfig.devId && 
                            this.ebayConfig.certId && 
                            this.ebayConfig.rotatingKey;

      console.log('🔍 eBay Configuration Check:');
      console.log(`- App ID: ${this.ebayConfig.appId ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`- Dev ID: ${this.ebayConfig.devId ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`- Cert ID: ${this.ebayConfig.certId ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`- Rotating Key: ${this.ebayConfig.rotatingKey ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`- Overall eBay Status: ${ebayConfigured ? 'READY' : 'NOT CONFIGURED'}`);

      if (ebayConfigured) {
        try {
          console.log('✅ eBay API is fully configured - attempting REAL price lookup...');
          const ebayPrices = await this.getEbayPrices(cardData);
          priceComparisons.push(...ebayPrices);
          console.log(`✅ Retrieved ${ebayPrices.length} REAL eBay prices`);
        } catch (error) {
          console.error('❌ eBay price lookup failed:', error.message);
        }
      } else {
        console.log('🚫 eBay API not fully configured - NO PRICE LOOKUP PERFORMED');
      }

      // 🚨 TCGPlayer: ABSOLUTELY NO MOCK DATA
      console.log('🚫 TCGPlayer API not implemented - NO MOCK DATA GENERATED');

      // 🚨 FINAL PRICE CALCULATION
      const averagePrice = priceComparisons.length > 0
        ? priceComparisons.reduce((sum, price) => sum + price.price, 0) / priceComparisons.length
        : 0;

      console.log(`🔍 FINAL PRICE RESULTS:`);
      console.log(`- Total REAL price comparisons: ${priceComparisons.length}`);
      console.log(`- Average price from REAL data: $${averagePrice.toFixed(2)}`);
      console.log(`- Estimated value to be saved: $${averagePrice.toFixed(2)}`);
      
      if (averagePrice === 0) {
        console.log('✅ NO MOCK DATA - Card will have $0.00 estimated value');
      } else {
        console.log('✅ REAL PRICE DATA - Card will have real market value');
      }

      // 🚨 GUARANTEE: Return exactly what will be saved to database
      const result = {
        priceComparisons,
        averagePrice,
        estimatedValue: averagePrice // This exact value goes to the database
      };

      console.log('🚨 RETURNING PRICE RESULT:', result);
      return result;

    } catch (error) {
      console.error('❌ Error getting price comparisons:', error);
      const errorResult = {
        priceComparisons: [],
        averagePrice: 0,
        estimatedValue: 0
      };
      console.log('🚨 ERROR RESULT (NO MOCK DATA):', errorResult);
      return errorResult;
    }
  }

  /**
   * Get eBay prices for a card
   */
  async getEbayPrices(cardData) {
    try {
      console.log('🔍 Fetching REAL eBay prices...');

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

        console.log(`🔍 eBay Price Found: $${price} - ${title.substring(0, 50)}...`);

        return {
          source: 'eBay (Sold)',
          price: price,
          condition: condition,
          title: title,
          url: url,
          lastUpdated: endTime
        };
      });

      console.log(`✅ Retrieved ${prices.length} REAL eBay prices`);
      return prices;

    } catch (error) {
      console.error('❌ Error fetching eBay prices:', error.message);
      throw error;
    }
  }

  /**
   * Get TCGPlayer prices for a card (ABSOLUTELY NO MOCK DATA)
   */
  async getTCGPlayerPrices(cardData) {
    console.log('🚫 TCGPlayer API integration not implemented');
    console.log('🚫 ABSOLUTELY NO MOCK DATA WILL BE GENERATED');
    console.log('🚫 RETURNING EMPTY ARRAY');

    // 🚨 GUARANTEE: Return empty array - NO MOCK DATA EVER
    return [];
  }
}

module.exports = new PriceService();
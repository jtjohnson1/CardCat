import api from './api'

interface PriceComparison {
  source: string
  price: number
  condition: string
  url: string
  lastUpdated: string
}

// Description: Get price comparisons for a card
// Endpoint: GET /api/prices/compare
// Request: { manufacturer: string, playerName: string, year: number, cardNumber: string }
// Response: { priceComparisons: Array<PriceComparison>, averagePrice: number }
export const getPriceComparisons = async (cardData: {
  manufacturer: string
  playerName: string
  year: number
  cardNumber: string
}) => {
  // Mocking the response for now
  return new Promise<{ priceComparisons: PriceComparison[], averagePrice: number }>((resolve) => {
    setTimeout(() => {
      const mockPrices: PriceComparison[] = [
        {
          source: 'eBay',
          price: Math.floor(Math.random() * 100) + 10,
          condition: 'Near Mint',
          url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(cardData.playerName + ' ' + cardData.year + ' ' + cardData.manufacturer)}`,
          lastUpdated: new Date().toISOString()
        },
        {
          source: 'COMC',
          price: Math.floor(Math.random() * 80) + 15,
          condition: 'Excellent',
          url: `https://www.comc.com/Cards/Baseball/1987/Topps/${cardData.cardNumber}`,
          lastUpdated: new Date().toISOString()
        },
        {
          source: 'TCGPlayer',
          price: Math.floor(Math.random() * 90) + 12,
          condition: 'Lightly Played',
          url: `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(cardData.playerName)}`,
          lastUpdated: new Date().toISOString()
        }
      ]

      const averagePrice = mockPrices.reduce((sum, price) => sum + price.price, 0) / mockPrices.length

      resolve({
        priceComparisons: mockPrices,
        averagePrice
      })
    }, 1000)
  })

  // Uncomment the below lines to make an actual API call
  // try {
  //   return await api.get('/api/prices/compare', { params: cardData });
  // } catch (error) {
  //   throw new Error(error?.response?.data?.error || error.message);
  // }
}
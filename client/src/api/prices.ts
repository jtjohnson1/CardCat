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
  try {
    console.log('Making API call to get price comparisons for:', cardData)
    const response = await api.get('/api/prices/compare', { params: cardData })
    console.log('Price comparison API response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error fetching price comparisons:', error)
    throw new Error(error?.response?.data?.message || error.message)
  }
}
import api from './api'

interface Card {
  _id: string
  id: string
  manufacturer: string
  sport: string
  setName: string
  cardNumber: string
  playerName: string
  team: string
  year: number
  condition: string
  specialFeatures: string[]
  estimatedValue: number
  frontImagePath: string
  backImagePath: string
  processedAt: string
  createdAt: string
  updatedAt: string
}

// Description: Get all cards from database
// Endpoint: GET /api/cards
// Request: {}
// Response: { cards: Array<Card>, totalCount: number }
export const getCards = async () => {
  console.log('=== getCards API function called ===')
  
  try {
    console.log('Making GET request to /api/cards...')
    const response = await api.get('/api/cards')
    
    console.log('API response received:')
    console.log('- Status:', response.status)
    console.log('- Headers:', response.headers)
    console.log('- Data type:', typeof response.data)
    console.log('- Data keys:', Object.keys(response.data || {}))
    console.log('- Data:', response.data)
    
    if (response.data && response.data.cards) {
      console.log('✅ Cards found in response.data.cards:', response.data.cards.length)
      console.log('Sample card:', response.data.cards[0])
    } else if (Array.isArray(response.data)) {
      console.log('✅ Response data is array:', response.data.length)
      console.log('Sample card:', response.data[0])
    } else {
      console.log('⚠️ Unexpected response format')
    }
    
    return response.data
  } catch (error: any) {
    console.error('❌ getCards API error:')
    console.error('- Error type:', typeof error)
    console.error('- Error message:', error.message)
    console.error('- Error response:', error.response)
    console.error('- Error response data:', error.response?.data)
    console.error('- Error response status:', error.response?.status)
    console.error('- Full error:', error)
    
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Delete selected cards from database
// Endpoint: DELETE /api/cards
// Request: { cardIds: string[] }
// Response: { success: boolean, deletedCount: number, message: string }
export const deleteSelectedCards = async (cardIds: string[]) => {
  try {
    const response = await api.delete('/api/cards', { data: { cardIds } })
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Delete selected cards from database (alias for deleteSelectedCards)
// Endpoint: DELETE /api/cards
// Request: { cardIds: string[] }
// Response: { success: boolean, deletedCount: number, message: string }
export const deleteCards = async (cardIds: string[]) => {
  try {
    const response = await api.delete('/api/cards', { data: { cardIds } })
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Delete a single card from database
// Endpoint: DELETE /api/cards/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteCard = async (cardId: string) => {
  try {
    const response = await api.delete(`/api/cards/${cardId}`)
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Get a single card by ID
// Endpoint: GET /api/cards/:id
// Request: {}
// Response: Card
export const getCard = async (cardId: string) => {
  try {
    const response = await api.get(`/api/cards/${cardId}`)
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}
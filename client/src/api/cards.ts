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
  try {
    const response = await api.get('/api/cards')
    return response.data
  } catch (error: any) {
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
import api from './api'

// Description: Get all cards from database
// Endpoint: GET /api/cards
// Request: {}
// Response: { cards: Array<Card> }
export const getCards = async () => {
  try {
    return await api.get('/api/cards');
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}

// Description: Delete selected cards
// Endpoint: DELETE /api/cards
// Request: { cardIds: string[] }
// Response: { success: boolean, deletedCount: number }
export const deleteSelectedCards = async (cardIds: string[]) => {
  try {
    return await api.delete('/api/cards', { data: { cardIds } });
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}
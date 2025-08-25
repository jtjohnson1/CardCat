import api from './api'

interface CardData {
  _id: string
  frontImage: string
  backImage: string
  manufacturer: string
  sport: string
  setName: string
  cardNumber: string
  player: string
  year: number
  estimatedValue: number
  processingDate: string
}

// Description: Get all cards from the database
// Endpoint: GET /api/cards
// Request: {}
// Response: { cards: Array<CardData> }
export const getCards = async () => {
  // Mocking the response
  return new Promise<{ cards: CardData[] }>((resolve) => {
    setTimeout(() => {
      const mockCards: CardData[] = [
        {
          _id: '1',
          frontImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          manufacturer: 'Topps',
          sport: 'Baseball',
          setName: '1989 Topps Baseball',
          cardNumber: '1',
          player: 'Ken Griffey Jr.',
          year: 1989,
          estimatedValue: 125.50,
          processingDate: '2024-01-15T10:30:00Z'
        },
        {
          _id: '2',
          frontImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          manufacturer: 'Panini',
          sport: 'Basketball',
          setName: '2021 Panini Prizm',
          cardNumber: '280',
          player: 'LaMelo Ball',
          year: 2021,
          estimatedValue: 89.99,
          processingDate: '2024-01-15T11:15:00Z'
        },
        {
          _id: '3',
          frontImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          manufacturer: 'Fleer',
          sport: 'Basketball',
          setName: '1986 Fleer Basketball',
          cardNumber: '57',
          player: 'Michael Jordan',
          year: 1986,
          estimatedValue: 2500.00,
          processingDate: '2024-01-15T09:45:00Z'
        },
        {
          _id: '4',
          frontImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          manufacturer: 'Upper Deck',
          sport: 'Hockey',
          setName: '1993 Upper Deck',
          cardNumber: '1',
          player: 'Wayne Gretzky',
          year: 1993,
          estimatedValue: 45.75,
          processingDate: '2024-01-15T14:20:00Z'
        },
        {
          _id: '5',
          frontImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          manufacturer: 'Topps',
          sport: 'Football',
          setName: '2000 Topps Chrome',
          cardNumber: '236',
          player: 'Tom Brady',
          year: 2000,
          estimatedValue: 1850.00,
          processingDate: '2024-01-15T16:10:00Z'
        }
      ]
      resolve({ cards: mockCards })
    }, 800)
  })
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/cards')
  //   return response.data
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message)
  // }
}

// Description: Delete selected cards
// Endpoint: DELETE /api/cards
// Request: { cardIds: string[] }
// Response: { success: boolean, deletedCount: number }
export const deleteCards = async (cardIds: string[]) => {
  // Mocking the response
  return new Promise<{ success: boolean, deletedCount: number }>((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        deletedCount: cardIds.length
      })
    }, 500)
  })
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.delete('/api/cards', { data: { cardIds } })
  //   return response.data
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message)
  // }
}
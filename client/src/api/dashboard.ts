import api from './api'

interface DashboardStats {
  totalCards: number
  totalValue: number
  averageValue: number
  cardsProcessedToday: number
  cardsByManufacturer: Array<{ _id: string; count: number }>
  cardsBySport: Array<{ _id: string; count: number }>
  recentCards: Array<{
    _id: string
    playerName: string
    manufacturer: string
    year: number
    estimatedValue: number
    createdAt: string
  }>
  mostValuableCards: Array<{
    _id: string
    playerName: string
    manufacturer: string
    year: number
    estimatedValue: number
    frontImageUrl?: string
  }>
}

// Description: Get dashboard statistics and recent activity
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: DashboardStats
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    console.log('Making API call to get dashboard stats...')
    const response = await api.get('/api/dashboard/stats')
    console.log('Dashboard stats API response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error)
    throw new Error(error?.response?.data?.message || error.message)
  }
}
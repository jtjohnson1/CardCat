import api from './api'

// Description: Get dashboard statistics and recent activity
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { totalCards: number, processedToday: number, averageValue: number, recentActivity: Array, processingQueue: number }
export const getDashboardStats = async () => {
  // Mocking the response
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      resolve({
        totalCards: 1247,
        processedToday: 23,
        averageValue: 15.67,
        processingQueue: 5,
        recentActivity: [
          {
            id: '1',
            type: 'processed',
            message: 'Successfully processed 1989 Topps Baseball #1 - Ken Griffey Jr.',
            timestamp: '2 minutes ago'
          },
          {
            id: '2',
            type: 'processed',
            message: 'Successfully processed 2021 Panini Prizm Basketball #280 - LaMelo Ball',
            timestamp: '5 minutes ago'
          },
          {
            id: '3',
            type: 'error',
            message: 'Failed to process card: Image quality too low',
            timestamp: '8 minutes ago'
          },
          {
            id: '4',
            type: 'processed',
            message: 'Successfully processed 1986 Fleer Basketball #57 - Michael Jordan',
            timestamp: '12 minutes ago'
          }
        ]
      })
    }, 800)
  })
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/dashboard/stats')
  //   return response.data
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message)
  // }
}
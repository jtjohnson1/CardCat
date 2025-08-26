import api from './api'

// Description: Get system status including Ollama and database connectivity
// Endpoint: GET /api/system/status
// Request: {}
// Response: { ollama: 'connected' | 'disconnected', database: 'connected' | 'disconnected' }
export const getSystemStatus = async () => {
  // Mocking the response
  return new Promise<{ ollama: 'connected' | 'disconnected', database: 'connected' | 'disconnected' }>((resolve) => {
    setTimeout(() => {
      resolve({
        ollama: 'connected',
        database: 'connected'
      })
    }, 500)
  })
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/system/status')
  //   return response.data
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message)
  // }
}
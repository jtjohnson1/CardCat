import api from './api'

// Description: Get system status including Ollama and database connectivity
// Endpoint: GET /api/system/status
// Request: {}
// Response: { ollama: 'connected' | 'disconnected', database: 'connected' | 'disconnected', ollamaDetails?: { error: string }, databaseDetails?: { error: string } }
export const getSystemStatus = async () => {
  try {
    const response = await api.get('/api/system/status')
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}
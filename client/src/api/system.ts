import api from './api'

// Description: Get system status including Ollama and database connectivity
// Endpoint: GET /api/system/status
// Request: {}
// Response: { ollamaConnected: boolean, databaseConnected: boolean }
export const getSystemStatus = async () => {
  try {
    return await api.get('/api/system/status');
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}
import api from './api'

// Description: Get dashboard statistics and recent activity
// Endpoint: GET /api/dashboard/stats
// Request: {}
// Response: { stats: object, recentActivity: Array<object> }
export const getDashboardStats = async () => {
  try {
    return await api.get('/api/dashboard/stats');
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message);
  }
}
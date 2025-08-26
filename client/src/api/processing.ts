import api from './api'

interface FileItem {
  id: string
  frontImage: string
  backImage: string
  filename: string
  valid: boolean
  selected: boolean
}

// Description: Get directory contents and card image pairs
// Endpoint: GET /api/processing/directory
// Request: { directory: string, includeSubdirectories: boolean }
// Response: { files: Array<FileItem>, totalCount: number }
export const getDirectoryContents = async (directory: string, includeSubdirectories: boolean) => {
  try {
    const response = await api.get('/api/processing/directory', {
      params: { directory, includeSubdirectories }
    })
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Process selected card files
// Endpoint: POST /api/processing/process
// Request: { fileIds: string[] }
// Response: { success: boolean, processedCount: number, errors: string[] }
export const processSelectedCards = async (fileIds: string[]) => {
  try {
    const response = await api.post('/api/processing/process', { fileIds })
    return response.data
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || error.message)
  }
}
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
  // Mocking the response
  return new Promise<{ files: FileItem[], totalCount: number }>((resolve) => {
    setTimeout(() => {
      const mockFiles: FileItem[] = [
        {
          id: '1',
          frontImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          filename: '1989-topps-001-front.jpg',
          valid: true,
          selected: false
        },
        {
          id: '2',
          frontImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          filename: '1989-topps-002-front.jpg',
          valid: true,
          selected: false
        },
        {
          id: '3',
          frontImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          filename: '1989-topps-003-front.jpg',
          valid: false,
          selected: false
        },
        {
          id: '4',
          frontImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          filename: '2021-panini-280-front.jpg',
          valid: true,
          selected: false
        },
        {
          id: '5',
          frontImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          filename: '1986-fleer-057-front.jpg',
          valid: true,
          selected: false
        },
        {
          id: '6',
          frontImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=280&fit=crop',
          backImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=280&fit=crop',
          filename: '1993-upper-deck-001-front.jpg',
          valid: true,
          selected: false
        }
      ]
      resolve({
        files: mockFiles,
        totalCount: mockFiles.length
      })
    }, 1000)
  })
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.get('/api/processing/directory', {
  //     params: { directory, includeSubdirectories }
  //   })
  //   return response.data
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message)
  // }
}

// Description: Process selected card files
// Endpoint: POST /api/processing/process
// Request: { fileIds: string[] }
// Response: { success: boolean, processedCount: number, errors: string[] }
export const processSelectedCards = async (fileIds: string[]) => {
  // Mocking the response with simulated processing
  return new Promise<{ success: boolean, processedCount: number, errors: string[] }>((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      resolve({
        success: true,
        processedCount: fileIds.length,
        errors: []
      })
    }, 3000)
  })
  // Uncomment the below lines to make an actual API call
  // try {
  //   const response = await api.post('/api/processing/process', { fileIds })
  //   return response.data
  // } catch (error) {
  //   throw new Error(error?.response?.data?.message || error.message)
  // }
}
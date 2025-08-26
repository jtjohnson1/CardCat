import api from './api'

interface EbaySettings {
  appId: string
  devId: string
  certId: string
  rotatingKey: string
  configured: boolean
}

interface OllamaSettings {
  url: string
  model: string
  configured: boolean
}

// Description: Get eBay API configuration
// Endpoint: GET /api/settings/ebay
// Request: {}
// Response: EbaySettings
export const getEbaySettings = async (): Promise<EbaySettings> => {
  try {
    console.log('Getting eBay settings from API...')
    const response = await api.get('/api/settings/ebay')
    console.log('eBay settings response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error fetching eBay settings:', error)
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Save eBay API configuration
// Endpoint: POST /api/settings/ebay
// Request: { appId: string, devId: string, certId: string, rotatingKey: string }
// Response: { success: boolean, message: string, configured: boolean }
export const saveEbaySettings = async (settings: {
  appId: string
  devId: string
  certId: string
  rotatingKey: string
}) => {
  try {
    console.log('Saving eBay settings to API...')
    const response = await api.post('/api/settings/ebay', settings)
    console.log('Save eBay settings response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error saving eBay settings:', error)
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Get Ollama configuration
// Endpoint: GET /api/settings/ollama
// Request: {}
// Response: OllamaSettings
export const getOllamaSettings = async (): Promise<OllamaSettings> => {
  try {
    console.log('Getting Ollama settings from API...')
    const response = await api.get('/api/settings/ollama')
    console.log('Ollama settings response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error fetching Ollama settings:', error)
    throw new Error(error?.response?.data?.message || error.message)
  }
}

// Description: Save Ollama configuration
// Endpoint: POST /api/settings/ollama
// Request: { url: string, model: string }
// Response: { success: boolean, message: string, configured: boolean }
export const saveOllamaSettings = async (settings: {
  url: string
  model: string
}) => {
  try {
    console.log('Saving Ollama settings to API...')
    const response = await api.post('/api/settings/ollama', settings)
    console.log('Save Ollama settings response:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error saving Ollama settings:', error)
    throw new Error(error?.response?.data?.message || error.message)
  }
}
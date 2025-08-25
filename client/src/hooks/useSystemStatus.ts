import { useState, useEffect } from 'react'
import { getSystemStatus } from '../api/system'

export function useSystemStatus() {
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected'>('disconnected')
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected'>('disconnected')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true)
        console.log('Fetching system status...')
        const startTime = Date.now()
        
        const status = await getSystemStatus()
        
        const duration = Date.now() - startTime
        console.log(`System status received (${duration}ms):`, status)
        
        setOllamaStatus(status.ollama)
        setDatabaseStatus(status.database)
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Failed to fetch system status:', error)
        // On error, set both to disconnected
        setOllamaStatus('disconnected')
        setDatabaseStatus('disconnected')
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { 
    ollamaStatus, 
    databaseStatus, 
    lastUpdated, 
    isLoading 
  }
}
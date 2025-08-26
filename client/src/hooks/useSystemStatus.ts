import { useState, useEffect } from 'react'
import { getSystemStatus } from '../api/system'

export function useSystemStatus() {
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected'>('disconnected')
  const [databaseStatus, setDatabaseStatus] = useState<'connected' | 'disconnected'>('disconnected')

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getSystemStatus()
        setOllamaStatus(status.ollama)
        setDatabaseStatus(status.database)
      } catch (error) {
        console.error('Failed to fetch system status:', error)
      }
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return { ollamaStatus, databaseStatus }
}
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'

export type ConnectionState = 'connected' | 'disconnected' | 'checking'

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>('checking')
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = async () => {
    setStatus('checking')
    try {
      const response = await fetch('http://127.0.0.1:8000/health', {
        method: 'GET',
        //timeout: 5000
      })
      
      if (response.ok) {
        setStatus('connected')
      } else {
        setStatus('disconnected')
      }
    } catch (error) {
      setStatus('disconnected')
    } finally {
      setLastChecked(new Date())
    }
  }

  useEffect(() => {
    checkConnection()
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    status,
    lastChecked,
    checkConnection
  }
}

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { status, lastChecked, checkConnection } = useConnectionStatus()

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: CheckCircle,
          text: 'Backend Conectado',
          description: 'Pronto para análises',
          className: 'text-emerald-600 bg-emerald-50 border-emerald-200'
        }
      case 'disconnected':
        return {
          icon: AlertCircle,
          text: 'Backend Desconectado',
          description: 'Verifique se o servidor está rodando',
          className: 'text-red-600 bg-red-50 border-red-200'
        }
      case 'checking':
        return {
          icon: Clock,
          text: 'Verificando Conexão',
          description: 'Aguarde...',
          className: 'text-blue-600 bg-blue-50 border-blue-200'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>Status da Conexão</span>
          <button
            onClick={checkConnection}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={status === 'checking'}
          >
            <RefreshCw className={`h-4 w-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${config.className}`}>
          <Icon className="h-5 w-5" />
          <div>
            <p className="font-medium text-sm">{config.text}</p>
            <p className="text-xs opacity-80">{config.description}</p>
            {lastChecked && (
              <p className="text-xs opacity-60 mt-1">
                Última verificação: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
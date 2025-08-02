// src/components/connectivity-status.tsx
'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface ConnectionStatus {
  status: string
  agente_revisor?: string
  agentes_reais?: string
  modo?: string
  message?: string  // ADICIONAR esta linha
  timestamp: number
}

export function ConnectivityStatus() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [backendInfo, setBackendInfo] = useState<ConnectionStatus | null>(null)

  const checkConnection = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/health`)
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus('connected')
        setBackendInfo({
          ...data,
          timestamp: Date.now()
        })
      } else {
        setConnectionStatus('disconnected')
        setBackendInfo(null)
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      setBackendInfo(null)
    }
  }

  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-3 w-3" />
      case 'disconnected':
        return <XCircle className="h-3 w-3" />
      default:
        return <AlertTriangle className="h-3 w-3 animate-pulse" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return backendInfo?.modo || backendInfo?.status || 'Conectado'
      case 'disconnected':
        return 'Desconectado'
      default:
        return 'Conectando...'
    }
  }

  const getStatusVariant = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'default' as const
      case 'disconnected':
        return 'destructive' as const
      default:
        return 'secondary' as const
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant()} className="flex items-center gap-1">
        {getStatusIcon()}
        Backend: {getStatusText()}
      </Badge>
      
      {backendInfo?.agentes_reais && (
        <Badge variant={backendInfo.agentes_reais.includes('Disponíveis') ? 'default' : 'outline'}>
          {backendInfo.agentes_reais}
        </Badge>
      )}
      
      <button
        onClick={checkConnection}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        title="Testar conexão"
      >
        Testar Conexão
      </button>
    </div>
  )
}
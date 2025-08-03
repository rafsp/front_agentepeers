import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertTriangle 
} from 'lucide-react'
import { backendService, type HealthCheckResponse } from '@/lib/services/backend-service'
import { useToast } from '@/components/ui/use-toast'

interface ConnectionStatusProps {
  showDetails?: boolean
  compact?: boolean
  className?: string
}

export function ConnectionStatus({ 
  showDetails = false, 
  compact = false,
  className = ""
}: ConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean
    baseUrl: string
    lastCheck: number
  }>({
    isConnected: false,
    baseUrl: '',
    lastCheck: 0
  })
  
  const [isChecking, setIsChecking] = useState(false)
  const { toast } = useToast()

  // Verificar status inicial e configurar polling
  useEffect(() => {
    checkStatus()
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    const status = backendService.getConnectionStatus()
    setConnectionStatus(status)
  }

  const handleManualCheck = async () => {
    setIsChecking(true)
    
    try {
      const result = await backendService.testConnection()
      
      if (result.success) {
        toast({
          title: 'Conexão testada',
          description: `Backend conectado (${result.latency}ms)`,
        })
      } else {
        toast({
          title: 'Falha na conexão',
          description: result.error,
          variant: 'destructive',
        })
      }
      
      await checkStatus()
    } catch (error) {
      toast({
        title: 'Erro no teste',
        description: 'Não foi possível testar a conexão',
        variant: 'destructive',
      })
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }
    
    return connectionStatus.isConnected ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const getStatusBadge = () => {
    if (isChecking) {
      return <Badge variant="secondary">Verificando...</Badge>
    }
    
    return (
      <Badge variant={connectionStatus.isConnected ? "default" : "destructive"}>
        {connectionStatus.isConnected ? 'Conectado' : 'Desconectado'}
      </Badge>
    )
  }

  // Versão compacta
  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        {getStatusBadge()}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualCheck}
          disabled={isChecking}
          className="h-6 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    )
  }

  // Versão completa
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {connectionStatus.isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <h3 className="font-semibold">Status do Backend</h3>
          </div>
          
          {getStatusBadge()}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div>URL: {connectionStatus.baseUrl}</div>
        </div>

        {!connectionStatus.isConnected && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Backend desconectado</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Verifique se o servidor backend está rodando em {connectionStatus.baseUrl}
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Verificando...' : 'Testar Conexão'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook para usar o status em outros componentes
export function useConnectionStatus() {
  const [status, setStatus] = useState(backendService.getConnectionStatus())
  
  useEffect(() => {
    const checkStatus = () => {
      setStatus(backendService.getConnectionStatus())
    }
    
    checkStatus()
    const interval = setInterval(checkStatus, 5000) // Verificar a cada 5s
    
    return () => clearInterval(interval)
  }, [])
  
  return status
}
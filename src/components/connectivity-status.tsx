// src/components/connectivity-status.tsx - NOVO ARQUIVO (usando Card)

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WifiOff, Wifi, RefreshCw } from 'lucide-react'
import { backendService } from '@/lib/services/backend-service'

interface ConnectivityStatusProps {
  className?: string
  showWhenConnected?: boolean
}

export function ConnectivityStatus({ 
  className = "", 
  showWhenConnected = false 
}: ConnectivityStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null) // null = checking
  const [isChecking, setIsChecking] = useState(false)
  const [lastError, setLastError] = useState<string>('')

  const checkConnection = async () => {
    setIsChecking(true)
    setLastError('')
    
    try {
      const health = await backendService.healthCheck()
      setIsConnected(true)
      console.log('✅ Backend conectado:', health.message)
    } catch (error) {
      setIsConnected(false)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setLastError(errorMessage)
      console.warn('❌ Backend desconectado:', errorMessage)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
    
    // Verificar conectividade a cada 30 segundos
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Mostrar quando conectado (opcional)
  if (isConnected && showWhenConnected) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-600" />
            <span className="text-green-700 text-sm">
              Backend conectado e funcionando
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar quando checking pela primeira vez
  if (isConnected === null && isChecking) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-blue-700 text-sm">
              Verificando conexão com o backend...
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Mostrar apenas quando desconectado
  if (!isConnected) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <WifiOff className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <div>
                <div className="font-medium text-red-700">
                  Não foi possível conectar ao backend
                </div>
                <div className="text-sm text-red-600 mt-1">
                  Verifique se o servidor está rodando em:
                  <code className="ml-1 px-2 py-0.5 bg-red-100 rounded text-xs font-mono">
                    http://localhost:8000
                  </code>
                </div>
              </div>
              
              {lastError && (
                <div className="text-xs text-red-600 bg-red-100 p-2 rounded border border-red-200">
                  <strong>Erro:</strong> {lastError}
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkConnection}
                  disabled={isChecking}
                  className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                >
                  {isChecking ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                  className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                >
                  Abrir Documentação
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Quando conectado e showWhenConnected = false, não mostrar nada
  return null
}

// Hook para usar em outros componentes
export function useConnectivity() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      await backendService.healthCheck()
      setIsConnected(true)
    } catch {
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return { isConnected, isChecking, checkConnection }
}
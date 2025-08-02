// src/components/error-boundary.tsx - VERSÃO COMPLETA

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
}

class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Em produção, você pode enviar o erro para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: enviar para Sentry, LogRocket, etc.
      // captureException(error, { extra: errorInfo })
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { error } = this.state

      // Se tem fallback customizado, usar ele
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} reset={this.reset} />
      }

      // Fallback padrão
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl text-red-600">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
              </p>
              
              {process.env.NODE_ENV === 'development' && error && (
                <div className="space-y-2">
                  <details className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <summary className="text-sm font-medium text-red-700 cursor-pointer">
                      Detalhes do erro (desenvolvimento)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong className="text-xs text-red-600">Mensagem:</strong>
                        <p className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded mt-1 break-all">
                          {error.message}
                        </p>
                      </div>
                      {error.stack && (
                        <div>
                          <strong className="text-xs text-red-600">Stack Trace:</strong>
                          <pre className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded mt-1 overflow-auto max-h-32">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={this.reset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'} 
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir para Home
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Recarregar Página
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper funcional para usar hooks se necessário
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

// Hook para capturar erros em componentes funcionais
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)
  
  const resetError = React.useCallback(() => {
    setError(null)
  }, [])
  
  const captureError = React.useCallback((error: Error) => {
    console.error('Erro capturado:', error)
    setError(error)
  }, [])
  
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])
  
  return { captureError, resetError }
}

// Componente para testar error boundary (apenas desenvolvimento)
export function ErrorTrigger() {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const triggerError = () => {
    throw new Error('Erro de teste do Error Boundary')
  }

  return (
    <Button variant="destructive" onClick={triggerError} className="fixed bottom-4 right-4 z-50">
      🧪 Testar Erro
    </Button>
  )
}
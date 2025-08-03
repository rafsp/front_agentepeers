'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, Play, CheckCircle, XCircle, AlertCircle, RefreshCw, 
  Trash2, Code, GitBranch, TestTube, Database, Upload, Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface JobProgressProps {
  job: {
    id: string
    title: string
    status: string
    progress: number
    message: string
    repository: string
    branch?: string
    createdAt: Date
    lastUpdated?: Date
    backendJobId?: string
    error?: string
  }
  onUpdate: (jobId: string, updates: any) => void
  onRemove: (jobId: string) => void
}

// Configuração das etapas do processo
const processSteps = [
  {
    id: 'pending_approval',
    label: 'Aguardando Aprovação',
    icon: AlertCircle,
    color: 'orange',
    progress: 15,
    description: 'Relatório inicial gerado'
  },
  {
    id: 'approved',
    label: 'Aprovado',
    icon: CheckCircle,
    color: 'green',
    progress: 25,
    description: 'Iniciando processamento'
  },
  {
    id: 'refactoring_code',
    label: 'Refatorando Código',
    icon: Code,
    color: 'blue',
    progress: 40,
    description: 'Aplicando melhorias no código'
  },
  {
    id: 'grouping_commits',
    label: 'Agrupando Commits',
    icon: GitBranch,
    color: 'blue',
    progress: 55,
    description: 'Organizando mudanças por tema'
  },
  {
    id: 'writing_unit_tests',
    label: 'Escrevendo Testes',
    icon: TestTube,
    color: 'blue',
    progress: 70,
    description: 'Criando testes unitários'
  },
  {
    id: 'grouping_tests',
    label: 'Agrupando Testes',
    icon: TestTube,
    color: 'blue',
    progress: 80,
    description: 'Organizando testes por módulo'
  },
  {
    id: 'populating_data',
    label: 'Preparando Dados',
    icon: Database,
    color: 'blue',
    progress: 90,
    description: 'Finalizando preparação'
  },
  {
    id: 'committing_to_github',
    label: 'Enviando para GitHub',
    icon: Upload,
    color: 'blue',
    progress: 95,
    description: 'Criando pull requests'
  },
  {
    id: 'completed',
    label: 'Concluído',
    icon: CheckCircle,
    color: 'green',
    progress: 100,
    description: 'Análise finalizada com sucesso'
  }
]

export function JobProgressCard({ job, onUpdate, onRemove }: JobProgressProps) {
  const [pollingData, setPollingData] = useState({
    isActive: false,
    lastCheck: new Date(),
    checkCount: 0,
    connectionStatus: 'unknown' as 'unknown' | 'connected' | 'error'
  })

  const currentStep = processSteps.find(step => step.id === job.status)
  const currentStepIndex = processSteps.findIndex(step => step.id === job.status)

  const isActiveStatus = [
    'approved', 'refactoring_code', 'grouping_commits', 
    'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'
  ].includes(job.status)

  // Função para buscar status do backend
  const fetchJobStatus = useCallback(async () => {
    if (!job.backendJobId || !isActiveStatus) return

    try {
      setPollingData(prev => ({ 
        ...prev, 
        isActive: true,
        connectionStatus: 'connected'
      }))

      const response = await fetch(`http://localhost:8000/status/${job.backendJobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      // Atualizar job se houve mudanças
      if (data.status !== job.status || 
          data.progress !== job.progress || 
          data.message !== job.message) {
        
        onUpdate(job.id, {
          status: data.status,
          progress: data.progress || job.progress,
          message: data.message || job.message,
          lastUpdated: new Date()
        })
      }

      setPollingData(prev => ({
        ...prev,
        lastCheck: new Date(),
        checkCount: prev.checkCount + 1,
        connectionStatus: 'connected'
      }))

    } catch (error) {
      setPollingData(prev => ({
        ...prev,
        connectionStatus: 'error',
        lastCheck: new Date()
      }))
      
      onUpdate(job.id, {
        error: `Erro de conexão: ${error.message}`,
        lastUpdated: new Date()
      })
    }
  }, [job.backendJobId, job.status, job.progress, job.message, job.id, onUpdate, isActiveStatus])

  // Polling automático
  useEffect(() => {
    if (!isActiveStatus || !job.backendJobId) {
      setPollingData(prev => ({ ...prev, isActive: false }))
      return
    }

    // Poll imediatamente
    fetchJobStatus()

    // Configurar interval
    const interval = setInterval(fetchJobStatus, 2000) // A cada 2 segundos

    return () => {
      clearInterval(interval)
      setPollingData(prev => ({ ...prev, isActive: false }))
    }
  }, [fetchJobStatus, isActiveStatus, job.backendJobId])

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>📁 {job.repository}</span>
              {job.branch && <span>🌿 {job.branch}</span>}
              <span>📅 {formatDistanceToNow(job.createdAt, { 
                addSuffix: true, 
                locale: ptBR 
              })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Status de Conexão em Tempo Real */}
            {pollingData.isActive && (
              <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 rounded-full">
                <div className={`w-2 h-2 rounded-full ${
                  pollingData.connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  pollingData.connectionStatus === 'error' ? 'bg-red-500' :
                  'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className="text-xs text-blue-700">
                  {pollingData.connectionStatus === 'connected' ? 'Conectado' :
                   pollingData.connectionStatus === 'error' ? 'Erro' :
                   'Conectando...'}
                </span>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(job.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Atual Grande */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          {currentStep && (
            <>
              <div className="flex items-center justify-center gap-3 mb-2">
                <currentStep.icon className={`h-8 w-8 ${
                  isActiveStatus ? 'animate-spin' : ''
                } ${
                  currentStep.color === 'green' ? 'text-green-600' :
                  currentStep.color === 'orange' ? 'text-orange-600' :
                  currentStep.color === 'red' ? 'text-red-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <h3 className="text-xl font-bold">{currentStep.label}</h3>
                  <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {job.progress}%
              </div>
              <Progress value={job.progress} className="h-3" />
            </>
          )}
        </div>

        {/* Timeline Visual das Etapas */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-600">Progresso da Análise:</h4>
          <div className="space-y-2">
            {processSteps.map((step, index) => {
              const isCompleted = index < currentStepIndex
              const isCurrent = step.id === job.status
              const isUpcoming = index > currentStepIndex
              
              return (
                <div key={step.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isCurrent ? 'bg-blue-50 border border-blue-200' :
                  isCompleted ? 'bg-green-50' :
                  'bg-gray-50'
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-blue-500 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <step.icon className={`h-4 w-4 ${isCurrent && isActiveStatus ? 'animate-spin' : ''}`} />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${
                        isCurrent ? 'text-blue-700' :
                        isCompleted ? 'text-green-700' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                      <span className={`text-sm ${
                        isCurrent ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                        'text-gray-400'
                      }`}>
                        {step.progress}%
                      </span>
                    </div>
                    <p className={`text-xs ${
                      isCurrent ? 'text-blue-600' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mensagem de Status Atual */}
        <div className="p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">Status Atual:</span>
          </div>
          <p className="text-sm">{job.message}</p>
        </div>

        {/* Informações de Monitoramento */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg text-xs">
          <div>
            <span className="font-medium">Última verificação:</span>
            <br />
            <span className="text-muted-foreground">
              {formatDistanceToNow(pollingData.lastCheck, { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          </div>
          <div>
            <span className="font-medium">Verificações:</span>
            <br />
            <span className="text-muted-foreground">
              {pollingData.checkCount} checks
            </span>
          </div>
          {job.lastUpdated && (
            <>
              <div>
                <span className="font-medium">Última atualização:</span>
                <br />
                <span className="text-muted-foreground">
                  {formatDistanceToNow(job.lastUpdated, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
              <div>
                <span className="font-medium">Backend Job:</span>
                <br />
                <span className="text-muted-foreground font-mono">
                  {job.backendJobId?.slice(0, 8)}...
                </span>
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {job.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium text-red-700">Erro de Conexão:</span>
            </div>
            <p className="text-sm text-red-600">{job.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
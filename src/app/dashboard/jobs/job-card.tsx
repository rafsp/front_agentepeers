'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, Play, CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface JobCardProps {
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

const statusConfig = {
  pending_approval: { icon: AlertCircle, color: 'warning', label: 'Aguardando Aprovação' },
  approved: { icon: CheckCircle, color: 'default', label: 'Aprovado' },
  running: { icon: Play, color: 'default', label: 'Executando' },
  refactoring_code: { icon: Play, color: 'default', label: 'Refatorando Código' },
  grouping_commits: { icon: Play, color: 'default', label: 'Agrupando Commits' },
  writing_unit_tests: { icon: Play, color: 'default', label: 'Escrevendo Testes' },
  grouping_tests: { icon: Play, color: 'default', label: 'Agrupando Testes' },
  populating_data: { icon: Play, color: 'default', label: 'Preparando Dados' },
  committing_to_github: { icon: Play, color: 'default', label: 'Enviando para GitHub' },
  completed: { icon: CheckCircle, color: 'success', label: 'Concluído' },
  failed: { icon: XCircle, color: 'destructive', label: 'Falhou' },
  rejected: { icon: XCircle, color: 'destructive', label: 'Rejeitado' }
} as const

export function JobCard({ job, onUpdate, onRemove }: JobCardProps) {
  const [isPolling, setIsPolling] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.running
  const Icon = config.icon

  const isActiveStatus = [
    'approved', 'running', 'refactoring_code', 'grouping_commits', 
    'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'
  ].includes(job.status)

  // Função para buscar status do backend
  const fetchJobStatus = useCallback(async () => {
    if (!job.backendJobId || !isActiveStatus) return

    try {
      console.log(`🔄 Checking status for job ${job.backendJobId}`)
      
      const response = await fetch(`http://localhost:8000/status/${job.backendJobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log(`📊 Backend response:`, data)

      // Atualizar job se houve mudanças
      if (data.status !== job.status || 
          data.progress !== job.progress || 
          data.message !== job.message) {
        
        console.log(`🔄 Updating job: ${data.status} (${data.progress}%)`)
        
        onUpdate(job.id, {
          status: data.status,
          progress: data.progress || job.progress,
          message: data.message || job.message,
          lastUpdated: new Date()
        })
      }

      setLastCheck(new Date())

    } catch (error) {
      console.error(`❌ Error polling job ${job.backendJobId}:`, error)
      onUpdate(job.id, {
        error: `Erro de conexão: ${error.message}`,
        lastUpdated: new Date()
      })
    }
  }, [job.backendJobId, job.status, job.progress, job.message, job.id, onUpdate, isActiveStatus])

  // Polling automático
  useEffect(() => {
    if (!isActiveStatus || !job.backendJobId) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    console.log(`🚀 Starting polling for job ${job.backendJobId}`)

    // Poll imediatamente
    fetchJobStatus()

    // Configurar interval
    const interval = setInterval(fetchJobStatus, 3000) // A cada 3 segundos

    return () => {
      console.log(`⏹️ Stopping polling for job ${job.backendJobId}`)
      clearInterval(interval)
      setIsPolling(false)
    }
  }, [fetchJobStatus, isActiveStatus, job.backendJobId])

  const handleManualRefresh = () => {
    console.log(`🔄 Manual refresh for job ${job.id}`)
    fetchJobStatus()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>📁 {job.repository}</span>
              {job.branch && <span>🌿 {job.branch}</span>}
              <span>📅 {formatDistanceToNow(job.createdAt, { 
                addSuffix: true, 
                locale: ptBR 
              })}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Indicador de Polling */}
            {isPolling && (
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Monitorando</span>
              </div>
            )}
            
            {/* Botão de Refresh Manual */}
            {isActiveStatus && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            
            {/* Botão de Remover */}
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
      
      <CardContent className="space-y-4">
        {/* Status e Progresso */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${isActiveStatus ? 'animate-spin' : ''} ${
                config.color === 'success' ? 'text-green-600' :
                config.color === 'destructive' ? 'text-red-600' :
                config.color === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} />
              <Badge variant={config.color as any}>{config.label}</Badge>
            </div>
            <span className="text-sm font-medium">{job.progress}%</span>
          </div>

          <Progress value={job.progress} className="h-2" />
        </div>

        {/* Mensagem de Status */}
        <div className="p-3 bg-muted rounded text-sm">
          {job.message}
        </div>

        {/* Informações de Debug */}
        <div className="text-xs text-muted-foreground space-y-1">
          {job.backendJobId && (
            <div>Backend Job ID: {job.backendJobId}</div>
          )}
          <div>
            Última verificação: {formatDistanceToNow(lastCheck, { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </div>
          {job.lastUpdated && (
            <div>
              Última atualização: {formatDistanceToNow(job.lastUpdated, { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          )}
        </div>

        {/* Error Display */}
        {job.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{job.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hook simples para gerenciar jobs
export function useSimpleJobs() {
  const [jobs, setJobs] = useState<Record<string, any>>({})

  const updateJob = useCallback((jobId: string, updates: any) => {
    console.log(`🔄 Updating job ${jobId}:`, updates)
    setJobs(prev => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        ...updates
      }
    }))
  }, [])

  const removeJob = useCallback((jobId: string) => {
    console.log(`🗑️ Removing job ${jobId}`)
    setJobs(prev => {
      const { [jobId]: removed, ...rest } = prev
      return rest
    })
  }, [])

  const addJob = useCallback((job: any) => {
    console.log(`➕ Adding job ${job.id}`)
    setJobs(prev => ({
      ...prev,
      [job.id]: job
    }))
  }, [])

  return {
    jobs: Object.values(jobs),
    updateJob,
    removeJob,
    addJob
  }
}
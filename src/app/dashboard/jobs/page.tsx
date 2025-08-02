'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Play, CheckCircle, XCircle, Loader2, Bot, AlertCircle, RefreshCw } from 'lucide-react'
import { backendService } from '@/lib/services/backend-service'

interface BackendJob {
  job_id: string
  repo_name: string
  analysis_type: string
  status: string
  progress: number
  real_mode: boolean
  message: string
  created_at?: number
  last_updated?: number
}

const statusIcons = {
  pending_approval: AlertCircle,
  approved: CheckCircle,
  workflow_started: Bot,
  reading_repository: Bot,
  analyzing_code: Bot,
  completed: CheckCircle,
  failed: XCircle,
  rejected: XCircle,
} as const

const statusLabels = {
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  workflow_started: 'Iniciando Agentes',
  reading_repository: 'Lendo Repositório',
  analyzing_code: 'Analisando Código',
  completed: 'Concluído',
  failed: 'Falhou',
  rejected: 'Rejeitado',
} as const

export default function JobsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<BackendJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadingActions, setLoadingActions] = useState<Record<string, 'approve' | 'reject' | null>>({})

  // Buscar jobs do backend
  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:8000/jobs')
      const data = await response.json()
      
      if (data.jobs) {
        // Converter objeto de jobs em array
        const jobsArray = Object.entries(data.jobs).map(([job_id, jobData]: [string, any]) => ({
          job_id,
          ...jobData
        }))
        setJobs(jobsArray)
        console.log('📊 Jobs carregados:', jobsArray)
      }
    } catch (err) {
      console.error('❌ Erro ao buscar jobs:', err)
      setError('Erro ao conectar com o backend')
    } finally {
      setLoading(false)
    }
  }

  // Verificar status de um job específico
  const checkJobStatus = async (jobId: string) => {
    try {
      const response = await backendService.getJobStatus(jobId)
      console.log(`🔍 Status do job ${jobId}:`, response)
      
      // Atualizar o job na lista
      setJobs(prev => prev.map(job => 
        job.job_id === jobId 
          ? { ...job, ...response }
          : job
      ))
    } catch (err) {
      console.error(`❌ Erro ao verificar status do job ${jobId}:`, err)
    }
  }

  // Função para aprovar job
  const handleApprove = async (jobId: string) => {
    setLoadingActions(prev => ({ ...prev, [jobId]: 'approve' }))
    try {
      const response = await backendService.updateJobStatus({
        job_id: jobId,
        action: 'approve'
      })

      alert("✅ Análise Aprovada! Agentes reais iniciados!")
      console.log('🎯 Job aprovado:', response)
      
      // Recarregar jobs após 1 segundo
      setTimeout(() => {
        fetchJobs()
      }, 1000)
      
      // Monitorar progresso do job
      const interval = setInterval(() => {
        checkJobStatus(jobId)
      }, 3000) // Verificar a cada 3 segundos
      
      // Parar monitoramento após 2 minutos
      setTimeout(() => clearInterval(interval), 120000)
      
    } catch (error) {
      console.error('❌ Erro ao aprovar:', error)
      alert(`Erro ao aprovar: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoadingActions(prev => ({ ...prev, [jobId]: null }))
    }
  }

  // Função para rejeitar job
  const handleReject = async (jobId: string) => {
    setLoadingActions(prev => ({ ...prev, [jobId]: 'reject' }))
    try {
      await backendService.updateJobStatus({
        job_id: jobId,
        action: 'reject'
      })

      alert("Análise rejeitada com sucesso!")
      fetchJobs() // Recarregar lista
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar:', error)
      alert(`Erro ao rejeitar: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setLoadingActions(prev => ({ ...prev, [jobId]: null }))
    }
  }

  // Carregar jobs na inicialização
  useEffect(() => {
    fetchJobs()
    
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(fetchJobs, 10000)
    return () => clearInterval(interval)
  }, [])

  // Função helper para pegar ícone de status
  const getStatusIcon = (status: string) => {
    return statusIcons[status as keyof typeof statusIcons] || Play
  }

  // Função helper para pegar label do status
  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status
  }

  // Função para formatar data
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Data não disponível'
    return new Date(timestamp * 1000).toLocaleString('pt-BR')
  }

  const pendingJobs = jobs.filter(job => job.status === 'pending_approval')
  const processingJobs = jobs.filter(job => ['approved', 'workflow_started', 'reading_repository', 'analyzing_code'].includes(job.status))
  const completedJobs = jobs.filter(job => job.status === 'completed')
  const failedJobs = jobs.filter(job => ['failed', 'rejected'].includes(job.status))

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Jobs de Análise</h1>
              <p className="text-muted-foreground">
                Conectado ao backend - {jobs.length} jobs encontrados
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchJobs}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                Nova Análise
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingJobs.length}</div>
              <div className="text-sm text-muted-foreground">Aguardando Aprovação</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{processingJobs.length}</div>
              <div className="text-sm text-muted-foreground">Em Execução</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{completedJobs.length}</div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{failedJobs.length}</div>
              <div className="text-sm text-muted-foreground">Com Problemas</div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6">
            <CardContent className="p-4 text-center text-red-600">
              <XCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{error}</p>
              <Button onClick={fetchJobs} variant="outline" size="sm" className="mt-2">
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum job encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não iniciou nenhuma análise de código.
              </p>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                Iniciar Primeira Análise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => {
              const StatusIcon = getStatusIcon(job.status)
              const statusLabel = getStatusLabel(job.status)
              const isLoading = loadingActions[job.job_id]
              const needsApproval = job.status === 'pending_approval'
              const isProcessing = ['approved', 'workflow_started', 'reading_repository', 'analyzing_code'].includes(job.status)
              
              return (
                <Card key={job.job_id} className={`w-full ${needsApproval ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${isProcessing ? 'animate-pulse' : ''}`} />
                        <span className="truncate">{job.analysis_type} - {job.repo_name}</span>
                        {job.real_mode && <Bot className="h-4 w-4 text-green-600" title="Agentes Reais" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={needsApproval ? 'secondary' : job.status === 'completed' ? 'default' : 'outline'}>
                          {statusLabel}
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>

                    {/* Job Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Repositório</p>
                        <p>{job.repo_name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Tipo</p>
                        <p>{job.analysis_type}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Job ID</p>
                        <p className="font-mono text-xs">{job.job_id.slice(-8)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Modo</p>
                        <p>{job.real_mode ? '🤖 Real' : '⚡ Simulação'}</p>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{job.message || 'Processando...'}</p>
                    </div>

                    {/* Approval Actions */}
                    {needsApproval && (
                      <div className="pt-3 border-t bg-yellow-50 -mx-6 px-6 pb-2">
                        <p className="text-sm font-medium mb-3 text-center text-yellow-800">
                          ⚠️ Esta análise precisa da sua aprovação para prosseguir
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReject(job.job_id)}
                            disabled={!!isLoading}
                            className="flex-1"
                          >
                            {isLoading === 'reject' ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Rejeitando...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Rejeitar
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(job.job_id)}
                            disabled={!!isLoading}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isLoading === 'approve' ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Aprovando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                🤖 Aprovar Análise Real
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Processing Status */}
                    {isProcessing && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                          <Bot className="h-4 w-4 animate-pulse" />
                          <span className="text-sm font-medium">
                            🤖 Agentes reais executando...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground text-center">
                      Criado: {formatDate(job.created_at)} | 
                      Atualizado: {formatDate(job.last_updated)}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
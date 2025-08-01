'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  Download, 
  Eye, 
  Trash2, 
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  Plus,
  Activity
} from 'lucide-react'
import { useJobStore, JobStatus } from '@/stores/job-store'
import { JobApprovalModal } from '@/components/job-approval-modal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Configuração de status
const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'warning', 
    label: 'Pendente',
    description: 'Aguardando processamento'
  },
  pending_approval: { 
    icon: AlertCircle, 
    color: 'warning', 
    label: 'Aguardando Aprovação',
    description: 'Análise pronta para revisão'
  },
  approved: { 
    icon: CheckCircle, 
    color: 'default', 
    label: 'Aprovado',
    description: 'Aprovado para processamento'
  },
  running: { 
    icon: Play, 
    color: 'default', 
    label: 'Executando',
    description: 'Em processamento'
  },
  workflow_started: { 
    icon: Activity, 
    color: 'default', 
    label: 'Iniciado',
    description: 'Workflow em andamento'
  },
  refactoring_code: { 
    icon: Play, 
    color: 'default', 
    label: 'Refatorando',
    description: 'Aplicando mudanças no código'
  },
  grouping_commits: { 
    icon: Play, 
    color: 'default', 
    label: 'Organizando',
    description: 'Agrupando commits'
  },
  writing_unit_tests: { 
    icon: Play, 
    color: 'default', 
    label: 'Testando',
    description: 'Escrevendo testes unitários'
  },
  grouping_tests: { 
    icon: Play, 
    color: 'default', 
    label: 'Agrupando Testes',
    description: 'Organizando testes'
  },
  populating_data: { 
    icon: Play, 
    color: 'default', 
    label: 'Preparando Dados',
    description: 'Populando dados'
  },
  committing_to_github: { 
    icon: Play, 
    color: 'default', 
    label: 'Enviando',
    description: 'Commitando no GitHub'
  },
  completed: { 
    icon: CheckCircle, 
    color: 'success', 
    label: 'Concluído',
    description: 'Análise finalizada com sucesso'
  },
  failed: { 
    icon: XCircle, 
    color: 'destructive', 
    label: 'Falhou',
    description: 'Erro durante processamento'
  },
  rejected: { 
    icon: XCircle, 
    color: 'destructive', 
    label: 'Rejeitado',
    description: 'Análise rejeitada pelo usuário'
  },
} as const

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { jobs, removeJob, clearCompleted, testConnection, isConnected } = useJobStore()
  
  // Estados locais
  const [selectedJobForApproval, setSelectedJobForApproval] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Processar jobs
  const jobsList = Object.values(jobs).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )

  // Filtrar jobs
  const filteredJobs = jobsList.filter(job => {
    const matchesSearch = job.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Estatísticas
  const stats = {
    total: jobsList.length,
    pending: jobsList.filter(job => job.status === 'pending_approval').length,
    running: jobsList.filter(job => ['running', 'workflow_started', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)).length,
    completed: jobsList.filter(job => job.status === 'completed').length,
    failed: jobsList.filter(job => ['failed', 'rejected'].includes(job.status)).length,
  }

  // Auto-abrir modal para jobs pendentes
  useEffect(() => {
    const pendingJobs = jobsList.filter(job => job.status === 'pending_approval')
    if (pendingJobs.length > 0 && !selectedJobForApproval) {
      setSelectedJobForApproval(pendingJobs[0].id)
    }
  }, [jobsList, selectedJobForApproval])

  // Testar conexão ao carregar
  useEffect(() => {
    testConnection()
  }, [testConnection])

  const handleRefreshConnection = async () => {
    setIsRefreshing(true)
    try {
      await testConnection()
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleViewReport = (jobId: string) => {
    router.push(`/dashboard/reports/${jobId}`)
  }

  const handleDownloadReport = (jobId: string) => {
    const job = jobs[jobId]
    if (!job) return

    const reportContent = job.result?.resultado || job.report || job.initialReport || ''
    if (!reportContent) return

    const blob = new Blob([reportContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analise-${job.repository.replace('/', '-')}-${job.id.slice(0, 8)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const selectedJob = selectedJobForApproval ? jobs[selectedJobForApproval] : null

  // Status únicos para filtro
  const uniqueStatuses = Array.from(new Set(jobsList.map(job => job.status)))

  // Função para obter label do progresso baseado no status
  const getProgressLabel = (status: JobStatus, progress: number) => {
    const progressLabels: Record<JobStatus, string> = {
      pending: 'Aguardando...',
      pending_approval: 'Aguardando aprovação',
      approved: 'Aprovado',
      running: 'Executando',
      workflow_started: 'Iniciando workflow',
      refactoring_code: 'Refatorando código',
      grouping_commits: 'Agrupando commits',
      writing_unit_tests: 'Escrevendo testes',
      grouping_tests: 'Organizando testes',
      populating_data: 'Preparando dados',
      committing_to_github: 'Enviando para GitHub',
      completed: 'Concluído',
      failed: 'Falhou',
      rejected: 'Rejeitado',
    }
    
    return progressLabels[status] || `Progresso ${progress}%`
  }

  // Função para obter cor do progresso
  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-600'
    if (progress >= 70) return 'bg-blue-600'
    if (progress >= 40) return 'bg-yellow-500'
    if (progress >= 20) return 'bg-orange-500'
    return 'bg-gray-400'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Jobs de Análise</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas análises de código
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'success' : 'destructive'} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </Badge>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshConnection}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Testar
              </Button>

              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Estatísticas */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
              <div className="text-sm text-muted-foreground">Executando</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Falharam</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por repositório ou título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value as JobStatus | 'all')}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">Todos os Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {statusConfig[status]?.label || status}
              </option>
            ))}
          </select>

          {stats.completed > 0 && (
            <Button 
              variant="outline" 
              onClick={clearCompleted}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Limpar Concluídos
            </Button>
          )}
        </div>

        {/* Lista de Jobs */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {jobsList.length === 0 ? 'Nenhuma análise ainda' : 'Nenhum resultado encontrado'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {jobsList.length === 0 
                    ? 'Comece criando sua primeira análise de código'
                    : 'Tente ajustar os filtros de busca'
                  }
                </p>
                <Button onClick={() => router.push('/dashboard/new-analysis')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Análise
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredJobs.map((job) => {
              const config = statusConfig[job.status]
              const StatusIcon = config.icon

              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                          <Badge variant={config.color as any} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm text-muted-foreground">
                          <div>
                            <strong>Repositório:</strong> {job.repository}
                          </div>
                          <div>
                            <strong>Tipo:</strong> {job.analysisType}
                          </div>
                          <div>
                            <strong>Criado:</strong> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: ptBR })}
                          </div>
                          <div>
                            <strong>Atualizado:</strong> {formatDistanceToNow(new Date(job.updatedAt), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>

                        {job.progress !== undefined && job.progress >= 0 && job.progress < 100 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium">
                                {getProgressLabel(job.status, job.progress)}
                              </span>
                              <span className="text-muted-foreground">{job.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor(job.progress)}`}
                                style={{ width: `${Math.max(job.progress, 5)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {job.progress === 100 && job.status !== 'completed' && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Finalizando análise...</span>
                            </div>
                          </div>
                        )}

                        {job.message && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {job.message}
                          </p>
                        )}

                        {job.errorDetails && (
                          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                            <p className="text-sm text-red-800">{job.errorDetails}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {job.status === 'pending_approval' && (
                          <Button 
                            onClick={() => setSelectedJobForApproval(job.id)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Revisar
                          </Button>
                        )}

                        {job.status === 'completed' && (
                          <>
                            <Button 
                              onClick={() => handleViewReport(job.id)} 
                              variant="default" 
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Relatório
                            </Button>
                            <Button 
                              onClick={() => handleDownloadReport(job.id)} 
                              variant="outline" 
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </>
                        )}

                        {(job.report || job.initialReport || job.result?.resultado) && job.status !== 'completed' && (
                          <Button 
                            onClick={() => handleDownloadReport(job.id)} 
                            variant="outline" 
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        
                        <Button 
                          onClick={() => removeJob(job.id)} 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Modal de Aprovação */}
      <JobApprovalModal
        job={selectedJob}
        isOpen={!!selectedJobForApproval}
        onClose={() => setSelectedJobForApproval(null)}
      />
    </div>
  )
}
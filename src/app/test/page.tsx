// src/app/test/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Loader2, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Eye
} from 'lucide-react'

const API_URL = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'

interface Job {
  id: string
  status: string
  progress: number
  message?: string
  analysis_report?: string
  error_details?: string
  created_at: Date
  updated_at: Date
}

export default function TestPage() {
  // Estados
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isPolling, setIsPolling] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  
  // Formulário
  const [formData, setFormData] = useState({
    repo_name: 'LucioFlavioRosa/teste_agent',
    analysis_type: 'relatorio_teste_unitario',
    branch_name: 'main',
    instrucoes_extras: '',
    usar_rag: false,
    gerar_relatorio_apenas: true,
    model_name: 'gpt-4o'
  })

  // Mapear status para cor e ícone
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { color: string; icon: any; label: string }> = {
      'pending_approval': { color: 'bg-yellow-500', icon: AlertCircle, label: 'Aguardando Aprovação' },
      'approved': { color: 'bg-blue-500', icon: ThumbsUp, label: 'Aprovado' },
      'workflow_started': { color: 'bg-blue-500', icon: Play, label: 'Iniciado' },
      'reading_repository': { color: 'bg-blue-500', icon: FileText, label: 'Lendo Repositório' },
      'analyzing_code': { color: 'bg-blue-500', icon: Loader2, label: 'Analisando Código' },
      'refactoring_code': { color: 'bg-blue-500', icon: Loader2, label: 'Refatorando' },
      'writing_unit_tests': { color: 'bg-blue-500', icon: Loader2, label: 'Escrevendo Testes' },
      'completed': { color: 'bg-green-500', icon: CheckCircle, label: 'Concluído' },
      'failed': { color: 'bg-red-500', icon: XCircle, label: 'Falhou' },
      'rejected': { color: 'bg-gray-500', icon: XCircle, label: 'Rejeitado' }
    }
    return statusMap[status || ''] || { color: 'bg-gray-500', icon: Clock, label: status || 'Processando' }
  }

  // Calcular progresso baseado no status
  const calculateProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      'pending_approval': 10,
      'approved': 20,
      'workflow_started': 30,
      'reading_repository': 40,
      'analyzing_code': 50,
      'refactoring_code': 60,
      'writing_unit_tests': 70,
      'grouping_commits': 80,
      'committing_to_github': 90,
      'completed': 100,
      'failed': 0,
      'rejected': 0
    }
    return progressMap[status] || 0
  }

  // Criar novo job
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch(`${API_URL}/start-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      console.log('Job criado:', data)
      
      // Adicionar novo job à lista
      const newJob: Job = {
        id: data.job_id || data.task_id || data.id || `temp-${Date.now()}`,
        status: data.status || 'pending_approval',
        progress: 10,
        message: data.message || 'Job criado, aguardando processamento...',
        created_at: new Date(),
        updated_at: new Date()
      }
      
      setJobs(prev => [newJob, ...prev])
      setSelectedJob(newJob)
      
      // Se o modo é "gerar_relatorio_apenas", o job pode não precisar de aprovação
      if (formData.gerar_relatorio_apenas) {
        console.log('Modo apenas relatório - iniciando polling direto')
        startPolling(newJob.id)
      } else if (data.job_id || data.task_id || data.id) {
        // Iniciar polling automático apenas se temos um ID válido
        startPolling(newJob.id)
      }
      
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao criar job. Verifique o console.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Polling de status
  const startPolling = (jobId: string) => {
    setIsPolling(jobId)
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/status/${jobId}`)
        const data = await response.json()
        
        console.log(`Status do job ${jobId}:`, data)
        
        // Atualizar job na lista
        setJobs(prev => prev.map(job => {
          if (job.id === jobId) {
            return {
              ...job,
              status: data.status,
              progress: calculateProgress(data.status),
              message: data.message,
              analysis_report: data.analysis_report || data.report,
              error_details: data.error_details,
              updated_at: new Date()
            }
          }
          return job
        }))
        
        // Atualizar job selecionado
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? {
            ...prev,
            status: data.status,
            progress: calculateProgress(data.status),
            message: data.message,
            analysis_report: data.analysis_report || data.report,
            error_details: data.error_details,
            updated_at: new Date()
          } : null)
        }
        
        // Parar polling se completou ou falhou
        if (['completed', 'failed', 'rejected'].includes(data.status)) {
          clearInterval(interval)
          setIsPolling(null)
          
          // Se completou e é modo relatório, buscar relatório
          if (data.status === 'completed' && formData.gerar_relatorio_apenas) {
            fetchReport(jobId)
          }
        }
        
      } catch (error) {
        console.error('Erro no polling:', error)
      }
    }, 5000) // Poll a cada 5 segundos
    
    // Limpar interval após 10 minutos
    setTimeout(() => {
      clearInterval(interval)
      setIsPolling(null)
    }, 600000)
  }

  // Buscar relatório
  const fetchReport = async (jobId: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/report`)
      const data = await response.json()
      
      console.log('Relatório recebido:', data)
      
      // Atualizar job com relatório
      setJobs(prev => prev.map(job => {
        if (job.id === jobId) {
          return {
            ...job,
            analysis_report: data.analysis_report || data.report
          }
        }
        return job
      }))
      
      if (selectedJob?.id === jobId) {
        setSelectedJob(prev => prev ? {
          ...prev,
          analysis_report: data.analysis_report || data.report
        } : null)
      }
      
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
    }
  }

  // Aprovar job
  const approveJob = async (jobId: string) => {
    try {
      console.log('Tentando aprovar job:', jobId)
      
      // Primeiro, vamos verificar se o endpoint existe
      const response = await fetch(`${API_URL}/update-job-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          action: 'approve',
          observacoes: 'Aprovado pelo usuário'
        })
      })
      
      // Se der 404, talvez o job já esteja aprovado ou o endpoint seja diferente
      if (response.status === 404) {
        console.log('Endpoint não encontrado ou job já processado')
        // Atualizar status localmente mesmo assim
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'approved', progress: 30, message: 'Aprovado (local)' }
            : job
        ))
        // Continuar polling para ver o status real
        startPolling(jobId)
        return
      }
      
      const data = await response.json()
      console.log('Job aprovado:', data)
      
      // Atualizar status local
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'approved', progress: 30 }
          : job
      ))
      
      // Continuar polling
      startPolling(jobId)
      
    } catch (error) {
      console.error('Erro ao aprovar:', error)
      // Mesmo com erro, vamos tentar continuar o polling
      alert('Nota: O endpoint de aprovação pode não estar disponível, mas vamos continuar monitorando o job.')
      startPolling(jobId)
    }
  }

  // Rejeitar job
  const rejectJob = async (jobId: string) => {
    try {
      console.log('Tentando rejeitar job:', jobId)
      
      const response = await fetch(`${API_URL}/update-job-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          action: 'reject',
          observacoes: 'Rejeitado pelo usuário'
        })
      })
      
      // Se der 404, atualizar apenas localmente
      if (response.status === 404) {
        console.log('Endpoint não encontrado, atualizando apenas localmente')
      } else {
        const data = await response.json()
        console.log('Job rejeitado:', data)
      }
      
      // Atualizar status local
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'rejected', progress: 0 }
          : job
      ))
      
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
      // Atualizar localmente mesmo com erro
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'rejected', progress: 0 }
          : job
      ))
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">🚀 Teste Completo - Fluxo de Análise</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Análise</CardTitle>
            <CardDescription>Configure e inicie uma análise de código</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="repo">Repositório</Label>
                <Input
                  id="repo"
                  value={formData.repo_name}
                  onChange={(e) => setFormData({...formData, repo_name: e.target.value})}
                  placeholder="owner/repository"
                />
              </div>

              <div>
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={formData.branch_name}
                  onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="analysis">Tipo de Análise</Label>
                <Select
                  value={formData.analysis_type}
                  onValueChange={(value) => setFormData({...formData, analysis_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="refatoracao">Refatoração</SelectItem>
                    <SelectItem value="docstring">Documentação</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="pentest">Pentest</SelectItem>
                    <SelectItem value="terraform">Terraform</SelectItem>
                    <SelectItem value="relatorio_teste_unitario">Relatório de Testes</SelectItem>
                    <SelectItem value="criar_testes_unitarios">Criar Testes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model">Modelo</Label>
                <Select
                  value={formData.model_name}
                  onValueChange={(value) => setFormData({...formData, model_name: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="instructions">Instruções Extras</Label>
                <Textarea
                  id="instructions"
                  value={formData.instrucoes_extras}
                  onChange={(e) => setFormData({...formData, instrucoes_extras: e.target.value})}
                  placeholder="Instruções adicionais..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="report-only"
                  checked={formData.gerar_relatorio_apenas}
                  onChange={(e) => setFormData({...formData, gerar_relatorio_apenas: e.target.checked})}
                />
                <Label htmlFor="report-only">Apenas gerar relatório (mais rápido)</Label>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Job...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Análise
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs Criados</CardTitle>
            <CardDescription>Acompanhe o status das análises</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {jobs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum job criado ainda</p>
                  <p className="text-sm">Use o formulário ao lado para iniciar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map(job => {
                    const statusDisplay = getStatusDisplay(job.status)
                    const StatusIcon = statusDisplay.icon
                    
                    return (
                      <Card 
                        key={job.id} 
                        className={`cursor-pointer transition-all ${
                          selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedJob(job)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${
                                job.status && job.status.includes('ing') ? 'animate-spin' : ''
                              }`} />
                              <Badge className={statusDisplay.color}>
                                {statusDisplay.label}
                              </Badge>
                            </div>
                            {isPolling === job.id && (
                              <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                            )}
                          </div>
                          
                          <Progress value={job.progress} className="mb-2" />
                          
                          <div className="text-xs text-muted-foreground">
                            <p>ID: {job.id ? `${job.id.substring(0, 8)}...` : 'Sem ID'}</p>
                            <p>Criado: {job.created_at instanceof Date ? job.created_at.toLocaleTimeString() : 'N/A'}</p>
                            {job.message && (
                              <p className="mt-1 text-foreground">{job.message}</p>
                            )}
                          </div>
                          
                          {/* Botões de ação */}
                          {job.status && job.status === 'pending_approval' && (
                            <div className="flex gap-2 mt-3">
                              <Button 
                                size="sm" 
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  approveJob(job.id)
                                }}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                Aprovar
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  rejectJob(job.id)
                                }}
                              >
                                <ThumbsDown className="h-3 w-3 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          )}
                          
                          {job.analysis_report && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="mt-3 w-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedJob(job)
                                setShowReport(true)
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver Relatório
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do Job Selecionado */}
      {selectedJob && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detalhes do Job</CardTitle>
            <CardDescription>ID: {selectedJob.id || 'Sem ID'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="log">Log</TabsTrigger>
                <TabsTrigger value="report">Relatório</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <p className="text-sm">{getStatusDisplay(selectedJob.status).label}</p>
                  </div>
                  <div>
                    <Label>Progresso</Label>
                    <Progress value={selectedJob.progress} className="mt-1" />
                  </div>
                  <div>
                    <Label>Criado em</Label>
                    <p className="text-sm">{selectedJob.created_at instanceof Date ? selectedJob.created_at.toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Última atualização</Label>
                    <p className="text-sm">{selectedJob.updated_at instanceof Date ? selectedJob.updated_at.toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                
                {selectedJob.error_details && (
                  <Alert className="mt-4 border-red-500">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {selectedJob.error_details}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="log">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  <pre className="text-xs">
                    {selectedJob.message || 'Nenhuma mensagem de log disponível'}
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="report">
                {selectedJob.analysis_report ? (
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-xs">
                        {selectedJob.analysis_report}
                      </pre>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Relatório não disponível</p>
                    <p className="text-sm">Aguarde a conclusão da análise</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Ações */}
            <div className="flex gap-2 mt-4">
              {!isPolling && selectedJob.status && selectedJob.status !== 'completed' && (
                <Button
                  variant="outline"
                  onClick={() => startPolling(selectedJob.id)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Status
                </Button>
              )}
              
              {selectedJob.status === 'completed' && !selectedJob.analysis_report && (
                <Button
                  variant="outline"
                  onClick={() => fetchReport(selectedJob.id)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Buscar Relatório
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
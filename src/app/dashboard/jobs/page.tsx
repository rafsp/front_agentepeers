'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Play, CheckCircle, XCircle, Download, Eye, Trash2, AlertCircle } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusIcons = {
  pending_approval: AlertCircle,
  workflow_started: Play,
  refactoring_code: Play,
  grouping_commits: Play,
  writing_unit_tests: Play,
  grouping_tests: Play,
  populating_data: Play,
  committing_to_github: Play,
  completed: CheckCircle,
  failed: XCircle,
  rejected: XCircle,
}

const statusColors = {
  pending_approval: 'warning',
  workflow_started: 'default',
  refactoring_code: 'default',
  grouping_commits: 'default',
  writing_unit_tests: 'default',
  grouping_tests: 'default',
  populating_data: 'default',
  committing_to_github: 'default',
  completed: 'success',
  failed: 'destructive',
  rejected: 'destructive',
} as const

const statusLabels = {
  pending_approval: 'Aguardando Aprovação',
  workflow_started: 'Processando',
  refactoring_code: 'Refatorando Código',
  grouping_commits: 'Agrupando Commits',
  writing_unit_tests: 'Escrevendo Testes',
  grouping_tests: 'Agrupando Testes',
  populating_data: 'Preenchendo Dados',
  committing_to_github: 'Enviando para GitHub',
  completed: 'Concluído',
  failed: 'Falhou',
  rejected: 'Rejeitado',
}

export default function JobsPage() {
  const router = useRouter()
  const { jobs, removeJob, clearCompleted } = useJobStore()

  const jobsList = Object.values(jobs).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  const handleViewJob = (jobId: string) => {
    router.push(`/dashboard/jobs/${jobId}`)
  }

  const handleViewReport = (jobId: string) => {
    router.push(`/dashboard/reports/${jobId}`)
  }

  const handleDownloadReport = (jobId: string) => {
    const job = jobs[jobId]
    if (job?.report) {
      const blob = new Blob([job.report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analise-${job.repository.replace('/', '-')}-${job.id}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getJobDescription = (job: any) => {
    if (job.status === 'pending_approval') {
      return 'Clique para revisar o relatório e aprovar'
    }
    if (['workflow_started', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)) {
      return 'Processamento em andamento - acompanhe o progresso'
    }
    if (job.status === 'completed') {
      return 'Análise concluída - visualize o relatório'
    }
    if (job.status === 'failed') {
      return 'Análise falhou - verifique os detalhes do erro'
    }
    if (job.status === 'rejected') {
      return 'Análise rejeitada pelo usuário'
    }
    return job.message
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
                Acompanhe o progresso de todas as suas análises
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCompleted}
                disabled={!jobsList.some(job => ['completed', 'failed', 'rejected'].includes(job.status))}
              >
                Limpar Concluídos
              </Button>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                Nova Análise
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {jobsList.length === 0 ? (
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
            {jobsList.map((job) => {
              const StatusIcon = statusIcons[job.status]
              
              return (
                <Card key={job.id} className="w-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        <span className="truncate">{job.title}</span>
                      </div>
                      <Badge variant={statusColors[job.status]}>
                        {statusLabels[job.status]}
                      </Badge>
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

                    {/* Job Details */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Repositório:</strong> {job.repository}</p>
                        <p><strong>Tipo:</strong> {job.analysisType}</p>
                        {job.branch && <p><strong>Branch:</strong> {job.branch}</p>}
                      </div>
                      <div>
                        <p><strong>Criado:</strong> {formatDistanceToNow(job.createdAt, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}</p>
                        {job.completedAt && (
                          <p><strong>Concluído:</strong> {formatDistanceToNow(job.completedAt, { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}</p>
                        )}
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{getJobDescription(job)}</p>
                    </div>

                    {/* Error Message */}
                    {job.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600"><strong>Erro:</strong> {job.error}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {/* Primary Action Button */}
                      {job.status === 'pending_approval' && (
                        <Button 
                          onClick={() => handleViewJob(job.id)} 
                          variant="default" 
                          size="sm"
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Revisar e Aprovar
                        </Button>
                      )}
                      
                      {['workflow_started', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status) && (
                        <Button 
                          onClick={() => handleViewJob(job.id)} 
                          variant="default" 
                          size="sm"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Acompanhar Progresso
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

                      {(job.status === 'failed' || job.status === 'rejected') && (
                        <Button 
                          onClick={() => handleViewJob(job.id)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      )}
                      
                      {/* Remove Button */}
                      <Button 
                        onClick={() => removeJob(job.id)} 
                        variant="outline" 
                        size="sm"
                        className="ml-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remover
                      </Button>
                    </div>
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
'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, GitBranch, Calendar, AlertCircle } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusIcons = {
  pending_approval: AlertCircle,
  workflow_started: Clock,
  refactoring_code: Clock,
  grouping_commits: Clock,
  writing_unit_tests: Clock,
  grouping_tests: Clock,
  populating_data: Clock,
  committing_to_github: Clock,
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

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { jobs, updateJob, approveJob, rejectJob, startPolling } = useJobStore()
  
  const jobId = params.id as string
  const job = jobs[jobId]

  useEffect(() => {
    if (job && ['workflow_started', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)) {
      startPolling(jobId)
    }
  }, [job?.status, jobId, startPolling])

  const handleApprove = async () => {
    try {
      await approveJob(jobId)
      toast({
        title: 'Relatório aprovado',
        description: 'O processamento foi iniciado. Acompanhe o progresso abaixo.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Não foi possível aprovar o relatório. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleReject = async () => {
    try {
      await rejectJob(jobId)
      toast({
        title: 'Relatório rejeitado',
        description: 'A análise foi cancelada.',
      })
    } catch (error) {
      toast({
        title: 'Erro ao rejeitar',
        description: 'Não foi possível rejeitar o relatório. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  const handleDownloadReport = () => {
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

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard/jobs')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Jobs
            </Button>
            <h1 className="text-2xl font-bold">Job não encontrado</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Job não encontrado</h3>
              <p className="text-muted-foreground mb-4">
                O job solicitado não existe ou foi removido.
              </p>
              <Button onClick={() => router.push('/dashboard/jobs')}>
                Voltar aos Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[job.status]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/jobs')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Jobs
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GitBranch className="h-4 w-4" />
                  {job.repository}
                </span>
                {job.branch && (
                  <span>Branch: {job.branch}</span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(job.createdAt, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
            
            <Badge variant={statusColors[job.status]}>
              <StatusIcon className="h-4 w-4 mr-1" />
              {statusLabels[job.status]}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar com informações e ações */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Status da Análise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>

                {/* Status Message */}
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{job.message}</p>
                </div>

                {/* Error Message */}
                {job.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{job.error}</p>
                  </div>
                )}

                {/* Approval Actions */}
                {job.status === 'pending_approval' && (
                  <div className="space-y-2">
                    <Button onClick={handleApprove} className="w-full" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar e Prosseguir
                    </Button>
                    <Button 
                      onClick={handleReject} 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rejeitar
                    </Button>
                  </div>
                )}

                {/* Download Report */}
                {job.report && (
                  <Button 
                    onClick={handleDownloadReport} 
                    variant="outline" 
                    className="w-full" 
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Relatório
                  </Button>
                )}

                {/* Job Info */}
                <div className="border-t pt-4 space-y-2 text-sm">
                  <div>
                    <p className="font-medium">Tipo de Análise</p>
                    <p className="text-muted-foreground">{job.analysisType}</p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Repositório</p>
                    <p className="text-muted-foreground">{job.repository}</p>
                  </div>
                  
                  {job.branch && (
                    <div>
                      <p className="font-medium">Branch</p>
                      <p className="text-muted-foreground">{job.branch}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">Criado em</p>
                    <p className="text-muted-foreground">
                      {job.createdAt.toLocaleDateString('pt-BR')} às {job.createdAt.toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                  
                  {job.completedAt && (
                    <div>
                      <p className="font-medium">Concluído em</p>
                      <p className="text-muted-foreground">
                        {job.completedAt.toLocaleDateString('pt-BR')} às {job.completedAt.toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  )}

                  {job.instructions && (
                    <div>
                      <p className="font-medium">Instruções</p>
                      <p className="text-muted-foreground text-xs">{job.instructions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo do relatório */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {job.status === 'pending_approval' ? 'Relatório para Aprovação' : 'Relatório de Análise'}
                </CardTitle>
                {job.status === 'pending_approval' && (
                  <p className="text-sm text-muted-foreground">
                    Revise o relatório abaixo e aprove para iniciar o processamento automático.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {job.report ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{job.report}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      {job.status === 'pending_approval' ? 'Gerando relatório...' : 'Relatório não disponível'}
                    </h3>
                    <p className="text-muted-foreground">
                      {job.status === 'pending_approval' 
                        ? 'O relatório está sendo gerado. Aguarde alguns instantes.'
                        : 'O relatório para esta análise ainda não foi gerado.'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
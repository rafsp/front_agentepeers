// src/app/dashboard/jobs/[id]/page.tsx - CORRIGIDO
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
  pending: Clock,
  pending_approval: AlertCircle,
  approved: CheckCircle,
  running: Clock,
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
  pending: 'warning',
  pending_approval: 'warning',
  approved: 'default',
  running: 'default',
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
  pending: 'Pendente',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  running: 'Executando',
  refactoring_code: 'Refatorando Código',
  grouping_commits: 'Agrupando Commits',
  writing_unit_tests: 'Escrevendo Testes',
  grouping_tests: 'Agrupando Testes',
  populating_data: 'Preparando Dados',
  committing_to_github: 'Enviando para GitHub',
  completed: 'Concluído',
  failed: 'Falhou',
  rejected: 'Rejeitado',
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { jobs, updateJob, approveJob, rejectJob, startPollingJob } = useJobStore()
  
  const jobId = params.id as string
  const job = jobs[jobId]

  useEffect(() => {
    if (job && job.backendJobId && ['approved', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)) {
      startPollingJob(jobId, job.backendJobId)
    }
  }, [job?.status, jobId, startPollingJob, job?.backendJobId])

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
        variant: 'destructive',
      })
    } catch (error) {
      toast({
        title: 'Erro ao rejeitar',
        description: 'Não foi possível rejeitar o relatório. Tente novamente.',
        variant: 'destructive',
      })
    }
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/jobs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Jobs
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Job não encontrado</h3>
            <p className="text-muted-foreground">
              O job que você está procurando não existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const StatusIcon = statusIcons[job.status] || Clock
  const statusColor = statusColors[job.status] || 'default'
  const statusLabel = statusLabels[job.status] || job.status

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/jobs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Jobs
          </Button>
          <h1 className="text-2xl font-bold">{job.title}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <StatusIcon className="h-5 w-5" />
          <Badge variant={statusColor as any}>{statusLabel}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar com informações */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Informações do Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusIcon className="h-4 w-4" />
                  <Badge variant={statusColor as any}>{statusLabel}</Badge>
                </div>
              </div>

              {/* Progress Bar */}
              {['approved', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status) && (
                <div>
                  <p className="font-medium">Progresso</p>
                  <Progress value={job.progress} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">{job.progress}%</p>
                </div>
              )}

              <div>
                <p className="font-medium">Repositório</p>
                <p className="text-muted-foreground">{job.repository}</p>
              </div>
              
              <div>
                <p className="font-medium">Tipo de Análise</p>
                <p className="text-muted-foreground">{job.analysisType}</p>
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
                  <p className="text-muted-foreground text-sm">{job.instructions}</p>
                </div>
              )}

              {/* Botões de Ação para Aprovação */}
              {job.status === 'pending_approval' && (
                <div className="space-y-2 pt-4 border-t">
                  <Button
                    onClick={handleApprove}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}
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
              
              {/* Status da Mensagem */}
              {job.message && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">{job.message}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {job.report || job.initialReport ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{job.report || job.initialReport}</ReactMarkdown>
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
                      : 'O relatório para esta análise ainda não foi gerado.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Erro */}
          {job.error && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-5 w-5" />
                  Erro na Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-red-700">{job.error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
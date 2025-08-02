'use client'

import React, { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  GitBranch, 
  Calendar, 
  AlertCircle,
  Download,
  RefreshCw,
  Loader2,
  Play
} from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const statusIcons = {
  pending_approval: AlertCircle,
  workflow_started: Clock,
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

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { jobs, updateJob, approveJob, rejectJob, refreshJob } = useJobStore()
  
  const jobId = params.id as string
  const job = jobs[jobId]

  // Auto-refresh para jobs ativos
  useEffect(() => {
    if (!job) return

    const isActive = ['workflow_started', 'refactoring_code', 'grouping_commits', 
                     'writing_unit_tests', 'grouping_tests', 'populating_data', 
                     'committing_to_github'].includes(job.status)

    if (isActive) {
      const interval = setInterval(async () => {
        try {
          await refreshJob(jobId)
        } catch (error) {
          console.warn('Erro ao atualizar job:', error)
        }
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [job?.status, jobId, refreshJob])

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

  const handleDownload = () => {
    if (!job) return

    const content = job.result?.resultado || job.report || job.initialReport || ''
    if (!content) return

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analise-${job.repository?.replace('/', '-') || 'repo'}-${job.id.slice(0, 8)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleRefresh = async () => {
    try {
      await refreshJob(jobId)
      toast({
        title: 'Atualizado',
        description: 'Status do job foi atualizado.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Job não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O job solicitado não existe ou foi removido.
          </p>
          <Button onClick={() => router.push('/dashboard/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Jobs
          </Button>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[job.status as keyof typeof statusIcons] || Clock
  const statusColor = statusColors[job.status as keyof typeof statusColors] || 'default'
  const statusLabel = statusLabels[job.status as keyof typeof statusLabels] || job.status

  const isInProgress = ['workflow_started', 'refactoring_code', 'grouping_commits', 
                       'writing_unit_tests', 'grouping_tests', 'populating_data', 
                       'committing_to_github'].includes(job.status)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard/jobs')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Jobs
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Detalhes da análise
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              
              {(job.report || job.result?.resultado) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <StatusIcon className="h-5 w-5" />
                Status da Análise
              </CardTitle>
              <Badge variant={statusColor as any} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Informações Básicas */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm"><strong>Repositório:</strong> {job.repository}</p>
                <p className="text-sm"><strong>Tipo:</strong> {job.analysisType}</p>
                {job.branch && <p className="text-sm"><strong>Branch:</strong> {job.branch}</p>}
              </div>
              <div>
                <p className="text-sm"><strong>Criado:</strong> {formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ptBR })}</p>
                {/* <p className="text-sm"><strong>Atualizado:</strong> {formatDistanceToNow(job.updatedAt, { addSuffix: true, locale: ptBR })}</p> */}
                {job.instructions && (
                  <p className="text-sm mt-2">
                    <strong>Instruções:</strong> {job.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {job.progress !== undefined && job.progress >= 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Progresso da Análise</h4>
                  <span className="text-sm text-muted-foreground">{job.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ease-out ${
                      job.progress === 100 ? 'bg-green-600' :
                      job.progress >= 75 ? 'bg-blue-600' :
                      job.progress >= 50 ? 'bg-yellow-500' :
                      job.progress >= 25 ? 'bg-orange-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.max(job.progress, 0)}%` }}
                  />
                </div>

                {job.message && (
                  <p className="text-sm text-muted-foreground">
                    {isInProgress && <Loader2 className="h-4 w-4 inline mr-1 animate-spin" />}
                    {job.message}
                  </p>
                )}

                {/* Progress Steps */}
                {isInProgress && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                    {[
                      { key: 'refactoring_code', label: 'Refatoração', progress: 25 },
                      { key: 'grouping_commits', label: 'Commits', progress: 40 },
                      { key: 'writing_unit_tests', label: 'Testes', progress: 65 },
                      { key: 'committing_to_github', label: 'GitHub', progress: 90 }
                    ].map((step) => (
                      <div 
                        key={step.key}
                        className={`p-2 rounded text-center text-xs ${
                          job.progress >= step.progress 
                            ? 'bg-green-100 text-green-800' 
                            : job.status === step.key
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {step.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Error Details */}
            {job.errorDetails && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <h4 className="font-medium text-red-800 mb-2">Erro:</h4>
                <p className="text-sm text-red-700">{job.errorDetails}</p>
              </div>
            )}

            {/* Actions */}
            {job.status === 'pending_approval' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={handleReject} variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
                <Button onClick={handleApprove} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Content */}
        {(job.report || job.result?.resultado) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatório da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {job.result?.resultado || job.report || 'Relatório não disponível'}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
// src/app/dashboard/jobs/page.tsx - VERSÃO CORRIGIDA

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Play, CheckCircle, XCircle, Download, Eye, Trash2, FileCheck, AlertCircle } from 'lucide-react'
import { useJobs } from '@/hooks/use-jobs'
import { formatJobDate } from '@/lib/utils/date-utils'

// Mapear todos os status possíveis
const statusIcons = {
  pending: Clock,
  pending_approval: AlertCircle,
  approved: CheckCircle,
  running: Play,
  analyzing_code: Play,
  refactoring_code: Play,
  grouping_commits: Play,
  writing_unit_tests: Play,
  grouping_tests: Play,
  populating_data: Play,
  committing_to_github: Play,
  ready_for_commit: CheckCircle,
  committing: Play,
  completed: CheckCircle,
  failed: XCircle,
  rejected: XCircle,
} as const

const statusColors = {
  pending: 'warning',
  pending_approval: 'warning',
  approved: 'default',
  running: 'default',
  analyzing_code: 'default',
  refactoring_code: 'default',
  grouping_commits: 'default',
  writing_unit_tests: 'default',
  grouping_tests: 'default',
  populating_data: 'default',
  committing_to_github: 'default',
  ready_for_commit: 'success',
  committing: 'default',
  completed: 'success',
  failed: 'destructive',
  rejected: 'destructive',
} as const

const statusLabels = {
  pending: 'Pendente',
  pending_approval: 'Aguardando Aprovação',
  approved: 'Aprovado',
  running: 'Executando',
  analyzing_code: 'Analisando Código',
  refactoring_code: 'Refatorando Código',
  grouping_commits: 'Agrupando Commits',
  writing_unit_tests: 'Escrevendo Testes',
  grouping_tests: 'Agrupando Testes',
  populating_data: 'Preparando Dados',
  committing_to_github: 'Enviando para GitHub',
  ready_for_commit: 'Pronto para Commit',
  committing: 'Fazendo Commit',
  completed: 'Concluído',
  failed: 'Falhou',
  rejected: 'Rejeitado',
} as const

export default function JobsPage() {
  const router = useRouter()
  const { jobsList, removeJob, clearCompleted } = useJobs()
  const [selectedJobForApproval, setSelectedJobForApproval] = useState<string | null>(null)

  const sortedJobs = jobsList.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  // Auto-abrir modal se há job aguardando aprovação
  useEffect(() => {
    const pendingApprovalJobs = sortedJobs.filter(job => job.status === 'pending_approval')
    if (pendingApprovalJobs.length > 0 && !selectedJobForApproval) {
      setSelectedJobForApproval(pendingApprovalJobs[0].id)
    }
  }, [sortedJobs, selectedJobForApproval])

  const handleViewReport = (jobId: string) => {
    router.push(`/dashboard/reports/${jobId}`)
  }

  const handleDownloadReport = (job: any) => {
    if (job?.report || job?.initialReport) {
      const reportContent = job.report || job.initialReport || ''
      const blob = new Blob([reportContent], { type: 'text/markdown' })
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

  const handleApprovalClick = (jobId: string) => {
    setSelectedJobForApproval(jobId)
  }

  const selectedJob = selectedJobForApproval ? 
    sortedJobs.find(job => job.id === selectedJobForApproval) : null

  // Função helper para pegar ícone de status
  const getStatusIcon = (status: string) => {
    return statusIcons[status as keyof typeof statusIcons] || Play
  }

  // Função helper para pegar cor do status
  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'destructive' => {
    return statusColors[status as keyof typeof statusColors] || 'default'
  }

  // Função helper para pegar label do status
  const getStatusLabel = (status: string) => {
    return statusLabels[status as keyof typeof statusLabels] || status
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
                disabled={!sortedJobs.some(job => ['completed', 'failed', 'rejected'].includes(job.status))}
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
        {sortedJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum job encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não iniciou nenhuma análise de código.
              </p>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                Criar Primeira Análise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedJobs.map((job) => {
              const StatusIcon = getStatusIcon(job.status)
              const statusColor = getStatusColor(job.status)
              const statusLabel = getStatusLabel(job.status)

              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <StatusIcon className="h-6 w-6" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <Badge variant={statusColor}>
                              {statusLabel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {job.repository} • Criado: {formatJobDate(job.createdAt)}
                            {job.updatedAt && job.updatedAt !== job.createdAt && (
                              <> • Atualizado: {formatJobDate(job.updatedAt)}</>
                            )}
                          </p>
                          {job.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {job.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Progress */}
                        {['running', 'analyzing_code'].includes(job.status) && (
                          <div className="flex items-center gap-2 min-w-32">
                            <Progress value={job.progress || 0} className="w-24 h-2" />
                            <span className="text-sm text-muted-foreground">
                              {job.progress || 0}%
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {job.status === 'pending_approval' && (
                            <Button
                              size="sm"
                              onClick={() => handleApprovalClick(job.id)}
                            >
                              <FileCheck className="h-4 w-4 mr-2" />
                              Revisar
                            </Button>
                          )}

                          {(job.status === 'completed' || job.report) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewReport(job.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(job)}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Error Display */}
                    {job.error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                          <strong>Erro:</strong> {job.error}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de Aprovação */}
      {selectedJob && selectedJob.status === 'pending_approval' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Revisar Análise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedJob.title}</h3>
                  <p className="text-muted-foreground">{selectedJob.repository}</p>
                </div>

                {selectedJob.initialReport && (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                      {selectedJob.initialReport}
                    </pre>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJobForApproval(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      // rejectJob(selectedJob.id) - implementar se necessário
                      setSelectedJobForApproval(null)
                    }}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => {
                      // approveJob(selectedJob.id) - implementar se necessário
                      setSelectedJobForApproval(null)
                    }}
                  >
                    Aprovar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
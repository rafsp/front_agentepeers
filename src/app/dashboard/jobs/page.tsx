'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Play, CheckCircle, XCircle, Download, Eye, Trash2, FileCheck, AlertCircle } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { JobApprovalModal } from '@/components/job-approval-modal'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Mapear todos os status possíveis
const statusIcons = {
  pending: Clock,
  pending_approval: AlertCircle,
  approved: CheckCircle,
  running: Play,
  refactoring_code: Play,
  grouping_commits: Play,
  writing_unit_tests: Play,
  grouping_tests: Play,
  populating_data: Play,
  committing_to_github: Play,
  completed: CheckCircle,
  failed: XCircle,
  rejected: XCircle,
} as const

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
} as const

export default function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { jobs, removeJob, clearCompleted } = useJobStore()
  const [selectedJobForApproval, setSelectedJobForApproval] = useState<string | null>(null)

  const jobsList = Object.values(jobs).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )

  // Auto-abrir modal se há job aguardando aprovação
  useEffect(() => {
    const pendingApprovalJobs = jobsList.filter(job => job.status === 'pending_approval')
    if (pendingApprovalJobs.length > 0 && !selectedJobForApproval) {
      // Abrir modal para o primeiro job pendente
      setSelectedJobForApproval(pendingApprovalJobs[0].id)
    }
  }, [jobsList, selectedJobForApproval])

  const handleViewReport = (jobId: string) => {
    router.push(`/dashboard/reports/${jobId}`)
  }

  const handleDownloadReport = (jobId: string) => {
    const job = jobs[jobId]
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

  const selectedJob = selectedJobForApproval ? jobs[selectedJobForApproval] : null

  // Função helper para pegar ícone de status
  const getStatusIcon = (status: string) => {
    return statusIcons[status as keyof typeof statusIcons] || Play
  }

  // Função helper para pegar cor do status
  const getStatusColor = (status: string) => {
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
              const StatusIcon = getStatusIcon(job.status)
              const statusColor = getStatusColor(job.status)
              const statusLabel = getStatusLabel(job.status)
              
              return (
                <Card key={job.id} className="w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-5 w-5" />
                        <span className="truncate">{job.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusColor as any}>
                          {statusLabel}
                        </Badge>
                        {job.status === 'pending_approval' && (
                          <Button
                            size="sm"
                            onClick={() => handleApprovalClick(job.id)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Revisar
                          </Button>
                        )}
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
                      <p className="text-sm">{job.message}</p>
                    </div>

                    {/* Error Message */}
                    {job.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{job.error}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
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

                      {(job.report || job.initialReport) && job.status !== 'completed' && (
                        <Button 
                          onClick={() => handleDownloadReport(job.id)} 
                          variant="outline" 
                          size="sm"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Relatório
                        </Button>
                      )}
                      
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

      {/* Modal de Aprovação */}
      {selectedJob && (
        <JobApprovalModal
          job={selectedJob}
          isOpen={!!selectedJobForApproval}
          onClose={() => setSelectedJobForApproval(null)}
        />
      )}
    </div>
  )
}
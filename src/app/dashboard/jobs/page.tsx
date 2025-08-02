// src/app/dashboard/jobs/page.tsx - CORRIGIDO
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

  // 🔧 CORREÇÃO: Detectar automaticamente jobs aguardando aprovação
  useEffect(() => {
    const pendingApprovalJobs = jobsList.filter(job => job.status === 'pending_approval')
    
    // Verificar se há job pendente e se não há modal aberto
    if (pendingApprovalJobs.length > 0 && !selectedJobForApproval) {
      console.log('📋 Jobs pendentes de aprovação:', pendingApprovalJobs.length)
      console.log('🎯 Abrindo modal para job:', pendingApprovalJobs[0].id)
      setSelectedJobForApproval(pendingApprovalJobs[0].id)
    }
    
    // Fechar modal se não há mais jobs pendentes
    if (pendingApprovalJobs.length === 0 && selectedJobForApproval) {
      console.log('✅ Não há mais jobs pendentes - fechando modal')
      setSelectedJobForApproval(null)
    }
  }, [jobsList, selectedJobForApproval])

  // 🔧 CORREÇÃO: Debug para verificar se jobs estão sendo detectados
  useEffect(() => {
    const pendingJobs = jobsList.filter(job => job.status === 'pending_approval')
    console.log('🔍 Debug JobsPage:')
    console.log('- Total jobs:', jobsList.length)
    console.log('- Jobs pending_approval:', pendingJobs.length)
    console.log('- Selected job for approval:', selectedJobForApproval)
    console.log('- Jobs list:', jobsList.map(j => ({ 
      id: j.id, 
      status: j.status, 
      title: j.title,
      backendJobId: j.backendJobId,
      awaitingApproval: j.awaitingApproval,
      hasReport: !!(j.report || j.initialReport)
    })))
    
    // 🔧 Debug individual de cada job
    pendingJobs.forEach(job => {
      console.log(`📋 Job ${job.id}:`, {
        status: job.status,
        awaitingApproval: job.awaitingApproval,
        backendJobId: job.backendJobId,
        hasInitialReport: !!job.initialReport,
        hasReport: !!job.report
      })
    })
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
    console.log('🖱️ Clique manual para aprovação do job:', jobId)
    setSelectedJobForApproval(jobId)
  }

  const selectedJob = selectedJobForApproval ? jobs[selectedJobForApproval] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Jobs de Análise</h1>
          <Badge variant="outline">{jobsList.length} jobs</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearCompleted}
            disabled={!jobsList.some(job => ['completed', 'failed', 'rejected'].includes(job.status))}
          >
            Limpar Concluídos
          </Button>
        </div>
      </div>

      {/* 🔧 CORREÇÃO: Debug Visual */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800">
            <strong>Debug:</strong> Jobs pending_approval: {jobsList.filter(j => j.status === 'pending_approval').length} | 
            Modal aberto: {selectedJobForApproval ? 'Sim' : 'Não'} | 
            Selected ID: {selectedJobForApproval || 'None'}
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aguardando Aprovação</p>
                <p className="text-2xl font-bold">
                  {jobsList.filter(job => job.status === 'pending_approval').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Em Execução</p>
                <p className="text-2xl font-bold">
                  {jobsList.filter(job => ['running', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">
                  {jobsList.filter(job => job.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Com Problemas</p>
                <p className="text-2xl font-bold">
                  {jobsList.filter(job => ['failed', 'rejected'].includes(job.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Jobs */}
      <div className="space-y-4">
        {jobsList.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum job encontrado</h3>
              <p className="text-muted-foreground">
                Inicie uma nova análise para ver os jobs aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          jobsList.map((job) => {
            const StatusIcon = statusIcons[job.status] || Clock
            const statusColor = statusColors[job.status] || 'default'
            const statusLabel = statusLabels[job.status] || job.status

            return (
              <Card key={job.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className="h-5 w-5" />
                        <h3 className="font-semibold">{job.title}</h3>
                        <Badge variant={statusColor as any}>{statusLabel}</Badge>
                        {job.status === 'pending_approval' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            🔔 Necessita Aprovação
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <p><strong>Repositório:</strong> {job.repository}</p>
                        <p><strong>Tipo:</strong> {job.analysisType}</p>
                        {job.branch && <p><strong>Branch:</strong> {job.branch}</p>}
                        <p><strong>Criado:</strong> {formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ptBR })}</p>
                      </div>

                      {['running', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status) && (
                        <div className="mb-3">
                          <Progress value={job.progress} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">{job.message}</p>
                        </div>
                      )}

                      {job.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                          <p className="text-sm text-red-700">{job.error}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 ml-4">
                      {job.status === 'pending_approval' && (
                        <Button
                          onClick={() => handleApprovalClick(job.id)}
                          className="bg-yellow-500 hover:bg-yellow-600"
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Revisar e Aprovar
                        </Button>
                      )}
                      
                      {['completed', 'failed'].includes(job.status) && (job.report || job.initialReport) && (
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
                            onClick={() => handleDownloadReport(job.id)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                      
                      {['completed', 'failed', 'rejected'].includes(job.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* 🔧 CORREÇÃO: Modal de Aprovação sempre renderizado */}
      <JobApprovalModal
        job={selectedJob}
        isOpen={!!selectedJobForApproval && !!selectedJob}
        onClose={() => {
          console.log('🚪 Fechando modal de aprovação')
          setSelectedJobForApproval(null)
        }}
      />
    </div>
  )
}
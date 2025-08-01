// src/hooks/use-jobs.ts - Hook personalizado para gestão de jobs

import { useEffect, useCallback, useState } from 'react'
import { useJobStore, Job, JobStatus } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'

interface UseJobsOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  filterStatus?: JobStatus[]
}

interface UseJobsReturn {
  jobs: Job[]
  totalJobs: number
  pendingJobs: Job[]
  runningJobs: Job[]
  completedJobs: Job[]
  failedJobs: Job[]
  isConnected: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  refreshJobs: () => Promise<void>
  startAnalysis: (params: any) => Promise<string>
  approveJob: (jobId: string) => Promise<void>
  rejectJob: (jobId: string) => Promise<void>
  removeJob: (jobId: string) => void
  clearCompleted: () => void
  testConnection: () => Promise<boolean>
  
  // Utils
  getJobById: (jobId: string) => Job | undefined
  getJobsByStatus: (status: JobStatus) => Job[]
  getJobsStats: () => JobsStats
}

interface JobsStats {
  total: number
  pending: number
  running: number
  completed: number
  failed: number
  byType: Record<string, number>
  byStatus: Record<JobStatus, number>
}

export function useJobs(options: UseJobsOptions = {}): UseJobsReturn {
  const {
    autoRefresh = false,
    refreshInterval = 5000,
    filterStatus = []
  } = options

  const { toast } = useToast()
  const store = useJobStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Converter jobs object para array e ordenar
  const jobsArray = Object.values(store.jobs).sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  )

  // Filtrar jobs se necessário
  const filteredJobs = filterStatus.length > 0 
    ? jobsArray.filter(job => filterStatus.includes(job.status))
    : jobsArray

  // Jobs categorizados
  const pendingJobs = jobsArray.filter(job => job.status === 'pending_approval')
  const runningJobs = jobsArray.filter(job => 
    ['running', 'workflow_started', 'refactoring_code', 'grouping_commits', 
     'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
  )
  const completedJobs = jobsArray.filter(job => job.status === 'completed')
  const failedJobs = jobsArray.filter(job => ['failed', 'rejected'].includes(job.status))

  // Refresh todos os jobs ativos
  const refreshJobs = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Refresh jobs ativos (não finalizados)
      const activeJobs = jobsArray.filter(job => 
        !['completed', 'failed', 'rejected'].includes(job.status)
      )

      await Promise.all(
        activeJobs.map(job => 
          store.refreshJob(job.id).catch(err => 
            console.warn(`Erro ao atualizar job ${job.id}:`, err)
          )
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar jobs'
      setError(errorMessage)
      console.error('Erro ao atualizar jobs:', err)
    } finally {
      setIsLoading(false)
    }
  }, [jobsArray, store])

  // Auto-refresh para jobs ativos
  useEffect(() => {
    if (!autoRefresh) return

    const hasActiveJobs = runningJobs.length > 0 || pendingJobs.length > 0
    
    if (hasActiveJobs) {
      const interval = setInterval(refreshJobs, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, runningJobs.length, pendingJobs.length, refreshJobs])

  // Iniciar análise com tratamento de erro
  const startAnalysis = useCallback(async (params: any) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const jobId = await store.startAnalysisJob(params)
      
      toast({
        title: 'Análise iniciada!',
        description: `Análise ${params.analysis_type} criada para ${params.repo_name}`,
      })

      return jobId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar análise'
      setError(errorMessage)
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [store, toast])

  // Aprovar job com feedback
  const approveJob = useCallback(async (jobId: string) => {
    try {
      await store.approveJob(jobId)
      
      toast({
        title: 'Análise aprovada!',
        description: 'O processamento foi iniciado.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao aprovar'
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
      
      throw err
    }
  }, [store, toast])

  // Rejeitar job com feedback
  const rejectJob = useCallback(async (jobId: string) => {
    try {
      await store.rejectJob(jobId)
      
      toast({
        title: 'Análise rejeitada',
        description: 'A análise foi cancelada.',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao rejeitar'
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      })
      
      throw err
    }
  }, [store, toast])

  // Remover job com confirmação
  const removeJob = useCallback((jobId: string) => {
    const job = store.jobs[jobId]
    if (!job) return

    store.removeJob(jobId)
    
    toast({
      title: 'Job removido',
      description: `Análise ${job.title} foi removida.`,
    })
  }, [store, toast])

  // Limpar concluídos com feedback
  const clearCompleted = useCallback(() => {
    const completedCount = completedJobs.length + failedJobs.length
    
    if (completedCount === 0) {
      toast({
        title: 'Nenhum job para limpar',
        description: 'Não há análises concluídas ou falhadas.',
      })
      return
    }

    store.clearCompleted()
    
    toast({
      title: 'Jobs limpos',
      description: `${completedCount} análises foram removidas.`,
    })
  }, [store, completedJobs.length, failedJobs.length, toast])

  // Testar conexão
  const testConnection = useCallback(async () => {
    try {
      const isConnected = await store.testConnection()
      
      toast({
        title: isConnected ? 'Conectado!' : 'Desconectado',
        description: isConnected 
          ? 'Backend está funcionando normalmente.' 
          : 'Não foi possível conectar ao backend.',
        variant: isConnected ? 'default' : 'destructive',
      })
      
      return isConnected
    } catch (err) {
      toast({
        title: 'Erro de conexão',
        description: 'Falha ao testar conexão com o backend.',
        variant: 'destructive',
      })
      
      return false
    }
  }, [store, toast])

  // Utilitários
  const getJobById = useCallback((jobId: string) => store.jobs[jobId], [store.jobs])
  
  const getJobsByStatus = useCallback((status: JobStatus) => 
    jobsArray.filter(job => job.status === status), [jobsArray]
  )

  const getJobsStats = useCallback((): JobsStats => {
    const byType: Record<string, number> = {}
    const byStatus: Record<JobStatus, number> = {} as any

    jobsArray.forEach(job => {
      // Por tipo
      byType[job.analysisType] = (byType[job.analysisType] || 0) + 1
      
      // Por status
      byStatus[job.status] = (byStatus[job.status] || 0) + 1
    })

    return {
      total: jobsArray.length,
      pending: pendingJobs.length,
      running: runningJobs.length,
      completed: completedJobs.length,
      failed: failedJobs.length,
      byType,
      byStatus
    }
  }, [jobsArray, pendingJobs.length, runningJobs.length, completedJobs.length, failedJobs.length])

  return {
    // Data
    jobs: filteredJobs,
    totalJobs: jobsArray.length,
    pendingJobs,
    runningJobs,
    completedJobs,
    failedJobs,
    isConnected: store.isConnected,
    isLoading,
    error,
    
    // Actions
    refreshJobs,
    startAnalysis,
    approveJob,
    rejectJob,
    removeJob,
    clearCompleted,
    testConnection,
    
    // Utils
    getJobById,
    getJobsByStatus,
    getJobsStats
  }
}

// Hook especializado para polling de job específico
export function useJobPolling(jobId: string, enabled: boolean = true) {
  const store = useJobStore()
  const job = store.jobs[jobId]
  
  useEffect(() => {
    if (!enabled || !jobId || !job) return
    
    // Só fazer polling se job não estiver finalizado
    if (['completed', 'failed', 'rejected'].includes(job.status)) {
      return
    }

    const interval = setInterval(async () => {
      try {
        await store.refreshJob(jobId)
      } catch (error) {
        console.warn(`Erro no polling do job ${jobId}:`, error)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [enabled, jobId, job?.status, store])

  return {
    job,
    isActive: job && !['completed', 'failed', 'rejected'].includes(job.status),
    refresh: () => store.refreshJob(jobId)
  }
}

// Hook para notificações de mudança de status
export function useJobNotifications() {
  const { jobs } = useJobStore()
  const { toast } = useToast()
  const [lastStatuses, setLastStatuses] = useState<Record<string, JobStatus>>({})

  useEffect(() => {
    Object.values(jobs).forEach(job => {
      const lastStatus = lastStatuses[job.id]
      
      // Se status mudou
      if (lastStatus && lastStatus !== job.status) {
        // Notificar mudanças importantes
        if (job.status === 'completed') {
          toast({
            title: 'Análise concluída!',
            description: `${job.title} foi finalizada com sucesso.`,
          })
        } else if (job.status === 'failed') {
          toast({
            title: 'Análise falhou',
            description: `${job.title} encontrou um erro.`,
            variant: 'destructive',
          })
        }
      }
    })

    // Atualizar últimos status
    const currentStatuses: Record<string, JobStatus> = {}
    Object.values(jobs).forEach(job => {
      currentStatuses[job.id] = job.status
    })
    setLastStatuses(currentStatuses)
  }, [jobs, lastStatuses, toast])
}
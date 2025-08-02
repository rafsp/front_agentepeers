// src/hooks/use-jobs.ts - HOOK CORRIGIDO

import { useEffect, useState } from 'react'
import { useJobStore, type Job } from '@/stores/job-store'

// Interface para estatísticas de jobs
export interface JobStatistics {
  total: number
  byStatus: Record<string, number>
  byCategory: Record<string, number>
  successRate: number
  averageCompletionTime: number
}

// Hook principal para jobs
export function useJobs() {
  const store = useJobStore()
  
  return {
    jobs: store.jobs,
    jobsList: Object.values(store.jobs),
    isConnected: store.isConnected,
    
    // Ações
    startAnalysis: store.startAnalysisJob,
    approveJob: store.approveJob,
    rejectJob: store.rejectJob,
    refreshJob: store.refreshJob,
    removeJob: store.removeJob,
    testConnection: store.testConnection,
    
    // Seletores
    getJobsByStatus: store.getJobsByStatus,
    clearCompleted: store.clearCompleted,
  }
}

// Hook para estatísticas
export function useJobStatistics(): JobStatistics {
  const { jobs } = useJobStore()
  const [stats, setStats] = useState<JobStatistics>({
    total: 0,
    byStatus: {},
    byCategory: {},
    successRate: 0,
    averageCompletionTime: 0
  })

  useEffect(() => {
    const jobsList = Object.values(jobs)
    const total = jobsList.length

    if (total === 0) {
      setStats({
        total: 0,
        byStatus: {},
        byCategory: {},
        successRate: 0,
        averageCompletionTime: 0
      })
      return
    }

    // Calcular estatísticas por status
    const byStatus = jobsList.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calcular estatísticas por categoria
    const byCategory = jobsList.reduce((acc, job) => {
      const category = getCategoryFromType(job.analysisType)
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calcular taxa de sucesso
    const completed = byStatus['completed'] || 0
    const successRate = (completed / total) * 100

    // Calcular tempo médio (simulado por agora)
    const averageCompletionTime = completed > 0 ? 12 : 0 // minutos

    setStats({
      total,
      byStatus,
      byCategory,
      successRate,
      averageCompletionTime
    })
  }, [jobs])

  return stats
}

// Hook para jobs ativos (que precisam de polling)
export function useActiveJobs() {
  const { jobs } = useJobStore()
  
  const activeJobs = Object.values(jobs).filter(job => 
    ['running', 'analyzing_code', 'pending_approval'].includes(job.status)
  )
  
  return {
    activeJobs,
    hasActiveJobs: activeJobs.length > 0,
    pendingApproval: activeJobs.filter(job => job.status === 'pending_approval'),
    running: activeJobs.filter(job => ['running', 'analyzing_code'].includes(job.status))
  }
}

// Hook para jobs recentes
export function useRecentJobs(limit: number = 5) {
  const { jobs } = useJobStore()
  
  const recentJobs = Object.values(jobs)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
  
  return recentJobs
}

// Hook para conectividade
export function useConnectivity() {
  const { isConnected, testConnection } = useJobStore()
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      await testConnection()
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Verificar conectividade a cada 30 segundos
    const interval = setInterval(testConnection, 30000)
    return () => clearInterval(interval)
  }, [testConnection])

  return {
    isConnected,
    isChecking,
    checkConnection
  }
}

// Função helper para categorizar tipos de análise
function getCategoryFromType(analysisType: string): string {
  const categoryMap: Record<string, string> = {
    'design': 'Análises',
    'seguranca': 'Segurança',
    'pentest': 'Segurança',
    'terraform': 'Infraestrutura',
    'relatorio_teste_unitario': 'Testes',
    'refatoracao': 'Refatoração',
    'refatorador': 'Refatoração',
    'escrever_testes': 'Testes',
    'agrupamento_testes': 'Testes',
    'agrupamento_design': 'Refatoração',
    'docstring': 'Documentação'
  }
  return categoryMap[analysisType] || 'Outros'
}

// Hook para polling automático de um job específico
export function useJobPolling(jobId: string | null, enabled: boolean = true) {
  const { refreshJob } = useJobStore()
  
  useEffect(() => {
    if (!jobId || !enabled) return

    const interval = setInterval(() => {
      refreshJob(jobId)
    }, 3000)

    return () => clearInterval(interval)
  }, [jobId, enabled, refreshJob])
}
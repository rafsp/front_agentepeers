// src/stores/job-store.ts - VERSÃO CORRIGIDA

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { backendService } from '@/lib/services/backend-service'

// Interfaces atualizadas
export interface Job {
  id: string
  title: string
  status: 'pending' | 'pending_approval' | 'running' | 'analyzing_code' | 'ready_for_commit' | 
          'committing' | 'completed' | 'failed' | 'rejected'
  progress: number
  message: string
  createdAt: Date
  updatedAt?: Date
  completedAt?: Date
  repository: string
  analysisType: string
  report?: string
  initialReport?: string
  error?: string
  errorDetails?: string
  branch?: string
  instructions?: string
  result?: any
  
  // Novos campos para integração
  backendJobId?: string
  awaitingApproval?: boolean
}

export interface StartAnalysisRequestLocal {
  repo_name: string
  analysis_type: string
  branch_name?: string
  instrucoes_extras?: string
}

interface JobState {
  jobs: Record<string, Job>
  activeJobs: string[]
  pollingIntervals: Record<string, NodeJS.Timeout>
  isConnected: boolean
  
  // Ações básicas
  addJob: (job: Omit<Job, 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  getJobsByStatus: (status: Job['status']) => Job[]
  clearCompleted: () => void
  
  // Ações de API
  startAnalysisJob: (request: StartAnalysisRequestLocal) => Promise<string>
  approveJob: (jobId: string) => Promise<void>
  rejectJob: (jobId: string) => Promise<void>
  getAllJobs: () => Promise<void>
  refreshJob: (jobId: string) => Promise<void>
  
  // Conectividade
  testConnection: () => Promise<boolean>
  setConnectionStatus: (status: boolean) => void
  
  // Polling
  startPolling: (jobId: string, backendJobId: string) => void
  stopPolling: (jobId: string) => void
}

const mapAnalysisTypeToTitle = (analysisType: string, repository: string): string => {
  const typeMap: Record<string, string> = {
    'design': 'Análise de Design',
    'seguranca': 'Auditoria de Segurança',
    'pentest': 'Plano de Pentest',
    'terraform': 'Análise de Terraform',
    'relatorio_teste_unitario': 'Relatório de Testes',
    'refatoracao': 'Refatoração de Código',
    'refatorador': 'Refatorador Automático',
    'escrever_testes': 'Criar Testes Unitários',
    'agrupamento_testes': 'Agrupar Testes',
    'agrupamento_design': 'Agrupar Melhorias',
    'docstring': 'Documentação de Código'
  }
  
  const typeTitle = typeMap[analysisType] || 'Análise de Código'
  return `${typeTitle} - ${repository}`
}

const mapBackendStatusToFrontend = (backendStatus: string): Job['status'] => {
  const statusMap: Record<string, Job['status']> = {
    'pending_approval': 'pending_approval',
    'running': 'running',
    'analyzing_code': 'analyzing_code',
    'ready_for_commit': 'ready_for_commit',
    'committing': 'committing',
    'completed': 'completed',
    'failed': 'failed',
    'rejected': 'rejected'
  }
  
  return statusMap[backendStatus] || 'running'
}

export const useJobStore = create<JobState>()(
  devtools(
    (set, get) => ({
      jobs: {},
      activeJobs: [],
      pollingIntervals: {},
      isConnected: false,

      addJob: (job) =>
        set((state) => {
          const newJob = { ...job, createdAt: new Date(), updatedAt: new Date() }
          return {
            jobs: { ...state.jobs, [job.id]: newJob },
            activeJobs: [...state.activeJobs, job.id],
          }
        }),

      updateJob: (id, updates) =>
        set((state) => {
          const currentJob = state.jobs[id]
          if (!currentJob) return state
          
          return {
            jobs: {
              ...state.jobs,
              [id]: { 
                ...currentJob, 
                ...updates,
                updatedAt: new Date()
              },
            },
          }
        }),

      removeJob: (id) =>
        set((state) => {
          const newJobs = { ...state.jobs }
          delete newJobs[id]
          
          return {
            jobs: newJobs,
            activeJobs: state.activeJobs.filter(jobId => jobId !== id),
          }
        }),

      getJobsByStatus: (status) => {
        const { jobs } = get()
        return Object.values(jobs).filter(job => job.status === status)
      },

      clearCompleted: () =>
        set((state) => {
          const completedStatuses = ['completed', 'failed', 'rejected']
          const newJobs = Object.fromEntries(
            Object.entries(state.jobs).filter(([_, job]) => !completedStatuses.includes(job.status))
          )
          
          return {
            jobs: newJobs,
            activeJobs: Object.keys(newJobs),
          }
        }),

      startAnalysisJob: async (request) => {
        try {
          console.log('🚀 Iniciando job:', request)
          
          const response = await backendService.startAnalysis(request)
          
          // Criar job local
          const jobId = Date.now().toString()
          const job: Omit<Job, 'createdAt'> = {
            id: jobId,
            title: mapAnalysisTypeToTitle(request.analysis_type, request.repo_name),
            status: mapBackendStatusToFrontend(response.status),
            progress: 10,
            message: response.message || 'Análise iniciada',
            repository: request.repo_name,
            analysisType: request.analysis_type,
            branch: request.branch_name,
            instructions: request.instrucoes_extras,
            backendJobId: response.job_id,
            initialReport: response.report,
            awaitingApproval: response.config?.requires_approval || false
          }
          
          get().addJob(job)
          
          // Iniciar polling se necessário
          if (!response.config?.requires_approval) {
            get().startPolling(jobId, response.job_id)
          }
          
          console.log('✅ Job criado:', jobId)
          return jobId
          
        } catch (error) {
          console.error('❌ Erro ao iniciar job:', error)
          throw error
        }
      },

      approveJob: async (jobId) => {
        try {
          const job = get().jobs[jobId]
          if (!job?.backendJobId) {
            throw new Error('Job não encontrado ou sem ID do backend')
          }
          
          await backendService.updateJobStatus({
            job_id: job.backendJobId,
            action: 'approve'
          })
          
          get().updateJob(jobId, {
            status: 'running',
            message: 'Análise aprovada e iniciada',
            progress: 30
          })
          
          // Iniciar polling
          get().startPolling(jobId, job.backendJobId)
          
        } catch (error) {
          console.error('❌ Erro ao aprovar job:', error)
          throw error
        }
      },

      rejectJob: async (jobId) => {
        try {
          const job = get().jobs[jobId]
          if (!job?.backendJobId) {
            throw new Error('Job não encontrado ou sem ID do backend')
          }
          
          await backendService.updateJobStatus({
            job_id: job.backendJobId,
            action: 'reject'
          })
          
          get().updateJob(jobId, {
            status: 'rejected',
            message: 'Análise rejeitada pelo usuário',
            progress: 0
          })
          
        } catch (error) {
          console.error('❌ Erro ao rejeitar job:', error)
          throw error
        }
      },

      getAllJobs: async () => {
        try {
          const response = await backendService.getAllJobs()
          console.log('📋 Jobs do backend:', response.total)
          
          // Sincronizar jobs do backend com o store local
          // (implementar se necessário)
          
        } catch (error) {
          console.error('❌ Erro ao buscar jobs:', error)
          // Não fazer throw para não quebrar a UI
        }
      },

      refreshJob: async (jobId) => {
        try {
          const job = get().jobs[jobId]
          if (!job?.backendJobId) return
          
          const status = await backendService.getJobStatus(job.backendJobId)
          
          get().updateJob(jobId, {
            status: mapBackendStatusToFrontend(status.status),
            progress: status.progress || 0,
            message: status.message || '',
            error: status.error,
            errorDetails: status.error
          })
          
        } catch (error) {
          console.error(`❌ Erro ao atualizar job ${jobId}:`, error)
        }
      },

      testConnection: async () => {
        try {
          const health = await backendService.healthCheck()
          const connected = health.status === 'healthy'
          get().setConnectionStatus(connected)
          return connected
        } catch {
          get().setConnectionStatus(false)
          return false
        }
      },

      setConnectionStatus: (status) =>
        set({ isConnected: status }),

      // Método helper para polling
      startPolling: (jobId: string, backendJobId: string) => {
        const pollInterval = setInterval(async () => {
          try {
            const job = get().jobs[jobId]
            if (!job) {
              clearInterval(pollInterval)
              return
            }
            
            // Parar polling se job terminou
            const finalStatuses = ['completed', 'failed', 'rejected']
            if (finalStatuses.includes(job.status)) {
              clearInterval(pollInterval)
              return
            }
            
            await get().refreshJob(jobId)
            
          } catch (error) {
            console.error(`❌ Erro no polling do job ${jobId}:`, error)
            clearInterval(pollInterval)
          }
        }, 3000)
        
        // Salvar referência do interval
        set((state) => ({
          pollingIntervals: { ...state.pollingIntervals, [jobId]: pollInterval }
        }))
      },

      stopPolling: (jobId: string) => {
        const { pollingIntervals } = get()
        const interval = pollingIntervals[jobId]
        if (interval) {
          clearInterval(interval)
          set((state) => {
            const newIntervals = { ...state.pollingIntervals }
            delete newIntervals[jobId]
            return { pollingIntervals: newIntervals }
          })
        }
      }
    }),
    {
      name: 'job-store',
    }
  )
)
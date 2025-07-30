// src/stores/job-store.ts - Com Polling Automático
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { apiService, StartAnalysisRequest } from '@/lib/api/api-service'

export interface Job {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rejected' | 'pending_approval' | 'approved' | 'refactoring_code' | 'grouping_commits' | 'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 'committing_to_github'
  progress: number
  message: string
  createdAt: Date
  completedAt?: Date
  repository: string
  analysisType: string
  report?: string
  error?: string
  branch?: string
  instructions?: string
  // Novos campos para integração
  backendJobId?: string
  awaitingApproval?: boolean
  initialReport?: string
}

interface JobState {
  jobs: Record<string, Job>
  activeJobs: string[]
  pollingIntervals: Record<string, NodeJS.Timeout>
  addJob: (job: Omit<Job, 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  getJobsByStatus: (status: Job['status']) => Job[]
  clearCompleted: () => void
  
  // Novos métodos para integração com API
  startAnalysisJob: (request: StartAnalysisRequest) => Promise<string>
  approveJob: (jobId: string) => Promise<void>
  rejectJob: (jobId: string) => Promise<void>
  testConnection: () => Promise<boolean>
  syncJobsFromBackend: () => Promise<void>
  startPollingJob: (jobId: string, backendJobId: string) => void
  stopPollingJob: (jobId: string) => void
}

const mapAnalysisTypeToTitle = (analysisType: string, repository: string): string => {
  const typeMap: Record<string, string> = {
    'design': 'Análise de Design',
    'relatorio_teste_unitario': 'Relatório de Testes Unitários',
    'security': 'Análise de Segurança',
    'performance': 'Análise de Performance'
  }
  
  const typeTitle = typeMap[analysisType] || 'Análise de Código'
  return `${typeTitle} - ${repository}`
}

const mapBackendStatusToFrontend = (backendStatus: string): Job['status'] => {
  const statusMap: Record<string, Job['status']> = {
    'pending_approval': 'pending_approval',
    'approved': 'approved',
    'refactoring_code': 'refactoring_code',
    'grouping_commits': 'grouping_commits',
    'writing_unit_tests': 'writing_unit_tests',
    'grouping_tests': 'grouping_tests',
    'populating_data': 'populating_data',
    'committing_to_github': 'committing_to_github',
    'completed': 'completed',
    'failed': 'failed',
    'rejected': 'rejected'
  }
  
  return statusMap[backendStatus] || 'running'
}

const getProgressFromBackend = (backendResponse: any): number => {
  return backendResponse.progress || 0
}

const getMessageFromBackend = (backendResponse: any): string => {
  return backendResponse.message || 'Processando análise...'
}

export const useJobStore = create<JobState>()(
  devtools(
    (set, get) => ({
      jobs: {},
      activeJobs: [],
      pollingIntervals: {},

      addJob: (job) =>
        set((state) => {
          const newJob = { ...job, createdAt: new Date() }
          return {
            jobs: { ...state.jobs, [job.id]: newJob },
            activeJobs: [...state.activeJobs, job.id],
          }
        }),

updateJob: (id, updates) =>
  set((state) => {
    const currentJob = state.jobs[id]
    return {
      jobs: {
        ...state.jobs,
        [id]: { 
          ...currentJob, 
          ...updates,
          // Preservar relatórios se não foram passados no update
          report: updates.report !== undefined ? updates.report : currentJob?.report,
          initialReport: updates.initialReport !== undefined ? updates.initialReport : currentJob?.initialReport,
        },
      },
    }
  }),
      removeJob: (id) =>
        set((state) => {
          // Parar polling se estiver ativo
          if (state.pollingIntervals[id]) {
            clearInterval(state.pollingIntervals[id])
          }
          
          const newPollingIntervals = { ...state.pollingIntervals }
          delete newPollingIntervals[id]
          
          return {
            jobs: Object.fromEntries(
              Object.entries(state.jobs).filter(([jobId]) => jobId !== id)
            ),
            activeJobs: state.activeJobs.filter((jobId) => jobId !== id),
            pollingIntervals: newPollingIntervals
          }
        }),

      getJobsByStatus: (status) =>
        Object.values(get().jobs).filter((job) => job.status === status),

      clearCompleted: () =>
        set((state) => {
          const activeJobs = Object.entries(state.jobs)
            .filter(([, job]) => !['completed', 'failed', 'rejected'].includes(job.status))
            .reduce((acc, [id, job]) => ({ ...acc, [id]: job }), {})
          
          // Parar polling para jobs removidos
          Object.keys(state.pollingIntervals).forEach(jobId => {
            if (!activeJobs[jobId]) {
              clearInterval(state.pollingIntervals[jobId])
            }
          })
          
          const newPollingIntervals = Object.keys(activeJobs).reduce((acc, jobId) => {
            if (state.pollingIntervals[jobId]) {
              acc[jobId] = state.pollingIntervals[jobId]
            }
            return acc
          }, {} as Record<string, NodeJS.Timeout>)
          
          return {
            jobs: activeJobs,
            activeJobs: Object.keys(activeJobs),
            pollingIntervals: newPollingIntervals
          }
        }),

      testConnection: async (): Promise<boolean> => {
        try {
          await apiService.checkHealth()
          return true
        } catch (error) {
          console.error('Erro na conexão:', error)
          return false
        }
      },

      syncJobsFromBackend: async (): Promise<void> => {
        try {
          const response = await apiService.getAllJobs()
          console.log('Jobs do backend:', response)
        } catch (error) {
          console.error('Erro ao sincronizar jobs:', error)
        }
      },

      startPollingJob: (jobId: string, backendJobId: string) => {
        // Parar polling existente se houver
        const currentInterval = get().pollingIntervals[jobId]
        if (currentInterval) {
          clearInterval(currentInterval)
        }

        // Iniciar novo polling
        const interval = setInterval(async () => {
          try {
            const response = await apiService.getJobStatus(backendJobId)
            const frontendStatus = mapBackendStatusToFrontend(response.status)
            const progress = getProgressFromBackend(response)
            const message = getMessageFromBackend(response)
            
            console.log(`📊 Polling update for ${jobId}:`, { status: frontendStatus, progress, message })
            
            get().updateJob(jobId, {
              status: frontendStatus,
              progress,
              message,
              ...(response.status === 'completed' && { completedAt: new Date() })
            })
            
            // Parar polling se job foi concluído
            if (['completed', 'failed', 'rejected'].includes(response.status)) {
              get().stopPollingJob(jobId)
            }
          } catch (error) {
            console.error(`Erro no polling do job ${jobId}:`, error)
            get().updateJob(jobId, {
              status: 'failed',
              error: error instanceof Error ? error.message : 'Erro no polling',
              message: 'Erro ao atualizar status'
            })
            get().stopPollingJob(jobId)
          }
        }, 2000) // Polling a cada 2 segundos

        // Salvar o interval
        set((state) => ({
          pollingIntervals: {
            ...state.pollingIntervals,
            [jobId]: interval
          }
        }))
      },

      stopPollingJob: (jobId: string) => {
        const interval = get().pollingIntervals[jobId]
        if (interval) {
          clearInterval(interval)
          set((state) => {
            const newPollingIntervals = { ...state.pollingIntervals }
            delete newPollingIntervals[jobId]
            return { pollingIntervals: newPollingIntervals }
          })
        }
      },

      startAnalysisJob: async (request: StartAnalysisRequest): Promise<string> => {
        const localJobId = `job_${Date.now()}`
        const newJob: Job = {
          id: localJobId,
          title: mapAnalysisTypeToTitle(request.analysis_type, request.repo_name),
          status: 'pending',
          progress: 0,
          message: 'Iniciando análise...',
          repository: request.repo_name,
          analysisType: request.analysis_type,
          branch: request.branch_name,
          instructions: request.instrucoes_extras,
          createdAt: new Date()
        }
        
        get().addJob(newJob)
        
        try {
          const response = await apiService.startAnalysis(request)
          
          get().updateJob(localJobId, {
            backendJobId: response.job_id,
            status: 'pending_approval',
            awaitingApproval: true,
            initialReport: response.report,
            progress: 10,
            message: 'Relatório inicial gerado. Aguardando aprovação...'
          })
          
          return localJobId
        } catch (error) {
          get().updateJob(localJobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            message: 'Falha ao iniciar análise'
          })
          throw error
        }
      },

      approveJob: async (jobId: string): Promise<void> => {
        const job = get().jobs[jobId]
        if (!job || !job.backendJobId) {
          throw new Error('Job não encontrado ou sem ID do backend')
        }
        
        try {
          await apiService.updateJobStatus({
            job_id: job.backendJobId,
            action: 'approve'
          })
          
          get().updateJob(jobId, {
            status: 'approved',
            awaitingApproval: false,
            progress: 25,
            message: 'Análise aprovada! Processando...'
          })
          
          // Iniciar polling automático
          get().startPollingJob(jobId, job.backendJobId)
          
        } catch (error) {
          get().updateJob(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Erro na aprovação'
          })
          throw error
        }
      },

      rejectJob: async (jobId: string): Promise<void> => {
        const job = get().jobs[jobId]
        if (!job || !job.backendJobId) {
          throw new Error('Job não encontrado ou sem ID do backend')
        }
        
        try {
          await apiService.updateJobStatus({
            job_id: job.backendJobId,
            action: 'reject'
          })
          
          get().updateJob(jobId, {
            status: 'rejected',
            awaitingApproval: false,
            message: 'Análise rejeitada pelo usuário'
          })
        } catch (error) {
          get().updateJob(jobId, {
            status: 'failed',
            error: error instanceof Error ? error.message : 'Erro na rejeição'
          })
          throw error
        }
      }
    }),
    { name: 'job-store' }
  )
)
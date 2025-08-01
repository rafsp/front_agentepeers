// src/stores/job-store.ts - Versão corrigida com tipos fixos
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Interfaces corrigidas
export interface StartAnalysisRequest {
  repo_name: string
  analysis_type: 'design' | 'relatorio_teste_unitario' | 'security' | 'performance'
  branch_name?: string
  instrucoes_extras?: string
}

export interface StartAnalysisResponse {
  job_id: string
  report: string
  status?: string
}

export interface UpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject'
}

export interface JobStatusResponse {
  job_id: string
  status: string
  message?: string
  progress?: number
  error_details?: string
  repo_name?: string
  analysis_type?: string
}

export interface UpdateJobResponse {
  job_id: string
  status: string
  message: string
}

// Definição corrigida do Job
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

// API Service simplificado
class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
        } catch {
          // Se não conseguir parsear o JSON do erro, usa a mensagem padrão
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`✅ API Response:`, data)
      return data
    } catch (error) {
      console.error(`❌ API Error:`, error)
      if (error instanceof Error) {
        // Se o erro for de rede (backend não disponível)
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          throw new Error('Backend não disponível. Verifique se está rodando.')
        }
      }
      throw error
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.request('/')
      return true
    } catch {
      return false
    }
  }

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    return this.request<StartAnalysisResponse>('/start-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.request<JobStatusResponse>(`/status/${jobId}`)
  }

  async updateJobStatus(request: UpdateJobRequest): Promise<UpdateJobResponse> {
    return this.request<UpdateJobResponse>('/update-job-status', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }
}

const apiService = new ApiService()

// Interface do Store
interface JobState {
  jobs: Record<string, Job>
  activeJobs: string[]
  pollingIntervals: Record<string, NodeJS.Timeout>
  addJob: (job: Omit<Job, 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  getJobsByStatus: (status: Job['status']) => Job[]
  clearCompleted: () => void
  
  // Métodos para integração com API
  startAnalysisJob: (request: StartAnalysisRequest) => Promise<string>
  approveJob: (jobId: string) => Promise<void>
  rejectJob: (jobId: string) => Promise<void>
  testConnection: () => Promise<boolean>
  syncJobsFromBackend: () => Promise<void>
  startPollingJob: (jobId: string, backendJobId: string) => void
  stopPollingJob: (jobId: string) => void
}

// Funções utilitárias
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

// Store principal
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
          if (!currentJob) return state
          
          return {
            jobs: {
              ...state.jobs,
              [id]: { 
                ...currentJob, 
                ...updates,
                // Preservar relatórios se não foram passados no update
                report: updates.report !== undefined ? updates.report : currentJob.report,
                initialReport: updates.initialReport !== undefined ? updates.initialReport : currentJob.initialReport,
                // Se status for completed, definir completedAt
                completedAt: updates.status === 'completed' ? new Date() : currentJob.completedAt
              }
            }
          }
        }),

      removeJob: (id) =>
        set((state) => {
          // Parar polling se existir
          get().stopPollingJob(id)
          
          const newJobs = { ...state.jobs }
          delete newJobs[id]
          
          return {
            jobs: newJobs,
            activeJobs: state.activeJobs.filter(jobId => jobId !== id),
          }
        }),

      getJobsByStatus: (status) => {
        const jobs = get().jobs
        return Object.values(jobs).filter(job => job.status === status)
      },

      clearCompleted: () =>
        set((state) => {
          const newJobs: Record<string, Job> = {}
          const newActiveJobs: string[] = []
          
          Object.entries(state.jobs).forEach(([id, job]) => {
            if (job.status !== 'completed') {
              newJobs[id] = job
              newActiveJobs.push(id)
            } else {
              // Parar polling se existir
              get().stopPollingJob(id)
            }
          })
          
          return { jobs: newJobs, activeJobs: newActiveJobs }
        }),

      testConnection: async (): Promise<boolean> => {
        return apiService.testConnection()
      },

      syncJobsFromBackend: async (): Promise<void> => {
        // Implementar sincronização se necessário
        console.log('Sync with backend not implemented yet')
      },

      startPollingJob: (jobId: string, backendJobId: string) => {
        // Parar polling anterior se existir
        get().stopPollingJob(jobId)

        const interval = setInterval(async () => {
          try {
            const response = await apiService.getJobStatus(backendJobId)
            
            const job = get().jobs[jobId]
            if (!job) {
              get().stopPollingJob(jobId)
              return
            }

            get().updateJob(jobId, {
              status: mapBackendStatusToFrontend(response.status),
              progress: response.progress || job.progress,
              message: response.message || job.message,
            })

            // Parar polling se job terminou
            if (['completed', 'failed', 'rejected'].includes(response.status)) {
              get().stopPollingJob(jobId)
            }
          } catch (error) {
            console.error('Polling error:', error)
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
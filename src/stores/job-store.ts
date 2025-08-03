import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Interfaces
export interface StartAnalysisRequest {
  repo_name: string
  analysis_type: 'design' | 'relatorio_teste_unitario' | 'pentest' | 'seguranca'
  branch_name?: string
  instrucoes_extras?: string
}

export interface Job {
  id: string
  title: string
  status: 'pending' | 'pending_approval' | 'approved' | 'running' | 'refactoring_code' | 
          'grouping_commits' | 'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 
          'committing_to_github' | 'completed' | 'failed' | 'rejected'
  progress: number
  message: string
  lastUpdated: Date
  createdAt: Date
  completedAt?: Date
  repository: string
  analysisType: string
  report?: string
  initialReport?: string
  error?: string
  branch?: string
  instructions?: string
  backendJobId?: string
}

interface JobState {
  jobs: Record<string, Job>
  pollingIntervals: Record<string, NodeJS.Timeout>
  isConnected: boolean
  
  // Actions básicas
  addJob: (job: Omit<Job, 'createdAt' | 'lastUpdated'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  clearCompleted: () => void
  
  // Actions para integração com backend
  startAnalysisJob: (request: StartAnalysisRequest) => Promise<string>
  approveJob: (jobId: string) => Promise<void>
  rejectJob: (jobId: string) => Promise<void>
  testConnection: () => Promise<boolean>
  
  // Polling management
  startPollingJob: (jobId: string, backendJobId: string) => void
  stopPollingJob: (jobId: string) => void
  syncJobsFromBackend: () => Promise<void>
}

// Configuração da API
class JobAPI {
  private baseUrl: string
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  }
  
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  async startAnalysis(request: StartAnalysisRequest) {
    return this.request<{ job_id: string; report: string; status: string }>('/start-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }
  
  async getJobStatus(jobId: string) {
    return this.request<{
      job_id: string
      status: string
      message?: string
      progress?: number
      repo_name?: string
      analysis_type?: string
    }>(`/status/${jobId}`)
  }
  
  async updateJobStatus(jobId: string, action: 'approve' | 'reject') {
    return this.request<{ job_id: string; status: string; message: string }>('/update-job-status', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, action }),
    })
  }
  
  async testConnection() {
    try {
      await this.request<any>('/test')
      return true
    } catch {
      return false
    }
  }
  
  async listJobs() {
    return this.request<{ total: number; jobs: Record<string, any> }>('/jobs')
  }
}

// Instância da API
const api = new JobAPI()

// Funções utilitárias
const mapAnalysisTypeToTitle = (analysisType: string, repository: string): string => {
  const typeMap: Record<string, string> = {
    'design': 'Análise de Design',
    'relatorio_teste_unitario': 'Relatório de Testes Unitários',
    'pentest': 'Análise de Penetração',
    'seguranca': 'Análise de Segurança'
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
      pollingIntervals: {},
      isConnected: false,

      addJob: (job) =>
        set((state) => {
          const newJob = { 
            ...job, 
            createdAt: new Date(),
            lastUpdated: new Date()
          }
          return {
            jobs: { ...state.jobs, [job.id]: newJob }
          }
        }),

      updateJob: (id, updates) =>
        set((state) => ({
          jobs: {
            ...state.jobs,
            [id]: { 
              ...state.jobs[id], 
              ...updates,
              lastUpdated: new Date(),
              completedAt: updates.status === 'completed' ? new Date() : state.jobs[id]?.completedAt
            }
          }
        })),

      removeJob: (id) =>
        set((state) => {
          // Parar polling se estiver ativo
          const { [id]: removed, ...remainingIntervals } = state.pollingIntervals
          if (removed) {
            clearInterval(removed)
          }
          
          const { [id]: removedJob, ...remainingJobs } = state.jobs
          return {
            jobs: remainingJobs,
            pollingIntervals: remainingIntervals
          }
        }),

      clearCompleted: () =>
        set((state) => {
          const completedIds = Object.keys(state.jobs).filter(id => 
            ['completed', 'failed', 'rejected'].includes(state.jobs[id].status)
          )
          
          // Parar polling dos jobs removidos
          const newIntervals = { ...state.pollingIntervals }
          completedIds.forEach(id => {
            if (newIntervals[id]) {
              clearInterval(newIntervals[id])
              delete newIntervals[id]
            }
          })
          
          // Remover jobs concluídos
          const newJobs = { ...state.jobs }
          completedIds.forEach(id => {
            delete newJobs[id]
          })
          
          return {
            jobs: newJobs,
            pollingIntervals: newIntervals
          }
        }),

      startAnalysisJob: async (request) => {
        try {
          const response = await api.startAnalysis(request)
          
          const jobId = Date.now().toString()
          const newJob: Job = {
            id: jobId,
            title: mapAnalysisTypeToTitle(request.analysis_type, request.repo_name),
            status: 'pending_approval',
            progress: 15,
            message: 'Relatório inicial gerado. Aguardando aprovação...',
            repository: request.repo_name,
            analysisType: request.analysis_type,
            branch: request.branch_name,
            instructions: request.instrucoes_extras,
            initialReport: response.report,
            backendJobId: response.job_id,
            createdAt: new Date(),
            lastUpdated: new Date()
          }
          
          get().addJob(newJob)
          return jobId
          
        } catch (error) {
          console.error('Erro ao iniciar análise:', error)
          throw error
        }
      },

      approveJob: async (jobId) => {
        const job = get().jobs[jobId]
        if (!job?.backendJobId) throw new Error('Job não encontrado')
        
        try {
          await api.updateJobStatus(job.backendJobId, 'approve')
          
          get().updateJob(jobId, {
            status: 'approved',
            message: 'Análise aprovada! Iniciando processamento...',
            progress: 25
          })
          
          // Iniciar polling
          get().startPollingJob(jobId, job.backendJobId)
          
        } catch (error) {
          console.error('Erro ao aprovar job:', error)
          throw error
        }
      },

      rejectJob: async (jobId) => {
        const job = get().jobs[jobId]
        if (!job?.backendJobId) throw new Error('Job não encontrado')
        
        try {
          await api.updateJobStatus(job.backendJobId, 'reject')
          
          get().updateJob(jobId, {
            status: 'rejected',
            message: 'Análise rejeitada pelo usuário',
            progress: 0
          })
          
        } catch (error) {
          console.error('Erro ao rejeitar job:', error)
          throw error
        }
      },

      testConnection: async () => {
        try {
          const isConnected = await api.testConnection()
          set({ isConnected })
          return isConnected
        } catch (error) {
          set({ isConnected: false })
          return false
        }
      },

      startPollingJob: (jobId, backendJobId) => {
        const state = get()
        
        // Parar polling existente se houver
        if (state.pollingIntervals[jobId]) {
          clearInterval(state.pollingIntervals[jobId])
        }
        
        // Criar novo intervalo de polling
        const interval = setInterval(async () => {
          try {
            const statusResponse = await api.getJobStatus(backendJobId)
            const currentJob = get().jobs[jobId]
            
            if (!currentJob) {
              get().stopPollingJob(jobId)
              return
            }
            
            const newStatus = mapBackendStatusToFrontend(statusResponse.status)
            const newProgress = statusResponse.progress || currentJob.progress
            const newMessage = statusResponse.message || currentJob.message
            
            // Atualizar job se houve mudanças
            if (newStatus !== currentJob.status || 
                newProgress !== currentJob.progress || 
                newMessage !== currentJob.message) {
              
              get().updateJob(jobId, {
                status: newStatus,
                progress: newProgress,
                message: newMessage
              })
            }
            
            // Parar polling se job foi concluído
            if (['completed', 'failed', 'rejected'].includes(newStatus)) {
              get().stopPollingJob(jobId)
            }
            
          } catch (error) {
            console.error(`Erro no polling do job ${jobId}:`, error)
            
            // Parar polling em caso de erro persistente
            get().updateJob(jobId, {
              error: 'Erro ao sincronizar com o backend'
            })
          }
        }, 2000) // Poll a cada 2 segundos
        
        // Salvar referência do intervalo
        set((state) => ({
          pollingIntervals: {
            ...state.pollingIntervals,
            [jobId]: interval
          }
        }))
      },

      stopPollingJob: (jobId) => {
        set((state) => {
          const interval = state.pollingIntervals[jobId]
          if (interval) {
            clearInterval(interval)
            const { [jobId]: removed, ...remaining } = state.pollingIntervals
            return { pollingIntervals: remaining }
          }
          return state
        })
      },

      syncJobsFromBackend: async () => {
        try {
          const response = await api.listJobs()
          const backendJobs = response.jobs
          
          // Sincronizar jobs existentes
          Object.values(get().jobs).forEach(frontendJob => {
            if (frontendJob.backendJobId && backendJobs[frontendJob.backendJobId]) {
              const backendJob = backendJobs[frontendJob.backendJobId]
              const newStatus = mapBackendStatusToFrontend(backendJob.status)
              
              get().updateJob(frontendJob.id, {
                status: newStatus,
                progress: backendJob.progress || frontendJob.progress,
                message: backendJob.message || frontendJob.message
              })
            }
          })
          
        } catch (error) {
          console.error('Erro ao sincronizar jobs:', error)
          throw error
        }
      }
    }),
    {
      name: 'job-store'
    }
  )
)

// Hook para estatísticas
export const useJobStats = () => {
  const jobs = useJobStore(state => state.jobs)
  const jobsList = Object.values(jobs)
  
  return {
    total: jobsList.length,
    active: jobsList.filter(job => 
      ['running', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 
       'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
    ).length,
    pending: jobsList.filter(job => job.status === 'pending_approval').length,
    completed: jobsList.filter(job => job.status === 'completed').length,
    failed: jobsList.filter(job => ['failed', 'rejected'].includes(job.status)).length
  }
}
// src/stores/job-store.ts - Store Otimizado e Melhorado

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Job {
  id: string
  title: string
  repository: string
  analysisType: 'design' | 'relatorio_teste_unitario' | 'security' | 'pentest' | 'terraform'
  branch?: string
  instructions?: string
  status: JobStatus
  progress: number
  createdAt: Date
  updatedAt: Date
  report?: string
  initialReport?: string
  result?: {
    resultado: string
    tipo_analise: string
    status: string
    tokens_used?: number
  }
  errorDetails?: string
  message?: string
}

export type JobStatus = 
  | 'pending'
  | 'pending_approval' 
  | 'approved'
  | 'running'
  | 'workflow_started'
  | 'refactoring_code'
  | 'grouping_commits'
  | 'writing_unit_tests'
  | 'grouping_tests'
  | 'populating_data'
  | 'committing_to_github'
  | 'completed'
  | 'failed'
  | 'rejected'

interface StartAnalysisRequest {
  repo_name: string
  analysis_type: 'design' | 'relatorio_teste_unitario' | 'security' | 'pentest' | 'terraform'
  branch_name?: string
  instrucoes_extras?: string
}

interface JobStore {
  jobs: Record<string, Job>
  pollingIntervals: Record<string, NodeJS.Timeout>
  isConnected: boolean
  lastConnectionTest?: Date
  
  // Actions
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  clearCompleted: () => void
  
  // API Actions
  startAnalysisJob: (request: StartAnalysisRequest) => Promise<string>
  approveJob: (id: string) => Promise<void>
  rejectJob: (id: string) => Promise<void>
  refreshJob: (id: string) => Promise<void>
  testConnection: () => Promise<boolean>
  
  // Polling Management
  startPolling: (jobId: string) => void
  stopPolling: (jobId: string) => void
  stopAllPolling: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

// Utility function para fazer requests
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    
    try {
      const errorData = JSON.parse(errorText)
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch {
      errorMessage = errorText || errorMessage
    }
    
    throw new Error(errorMessage)
  }

  return response.json()
}

// Converter resposta da API para Job
function apiResponseToJob(data: any, originalRequest?: StartAnalysisRequest): Job {
  const now = new Date()
  
  return {
    id: data.job_id || data.id,
    title: `Análise ${originalRequest?.analysis_type || 'código'}`,
    repository: originalRequest?.repo_name || data.repo_name || 'Repositório',
    analysisType: originalRequest?.analysis_type || data.analysis_type || 'design',
    branch: originalRequest?.branch_name || data.branch_name,
    instructions: originalRequest?.instrucoes_extras || data.instrucoes_extras,
    status: mapApiStatus(data.status),
    progress: data.progress || 0,
    createdAt: data.created_at ? new Date(data.created_at) : now,
    updatedAt: data.last_updated ? new Date(data.last_updated) : now,
    report: data.report,
    initialReport: data.report,
    result: data.result,
    errorDetails: data.error_details,
    message: data.message,
  }
}

// Mapear status da API para nossos tipos
function mapApiStatus(apiStatus: string): JobStatus {
  const statusMap: Record<string, JobStatus> = {
    'pending_approval': 'pending_approval',
    'workflow_started': 'workflow_started',
    'refactoring_code': 'refactoring_code',
    'grouping_commits': 'grouping_commits',
    'writing_unit_tests': 'writing_unit_tests',
    'grouping_tests': 'grouping_tests',
    'populating_data': 'populating_data',
    'committing_to_github': 'committing_to_github',
    'completed': 'completed',
    'failed': 'failed',
    'rejected': 'rejected',
    'approved': 'approved',
    'running': 'running'
  }
  
  return statusMap[apiStatus] || 'pending'
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: {},
      pollingIntervals: {},
      isConnected: false,
      
      addJob: (job) => {
        set((state) => ({
          jobs: {
            ...state.jobs,
            [job.id]: job,
          },
        }))
      },
      
      updateJob: (id, updates) => {
        set((state) => {
          const existingJob = state.jobs[id]
          if (!existingJob) return state
          
          return {
            jobs: {
              ...state.jobs,
              [id]: {
                ...existingJob,
                ...updates,
                updatedAt: new Date(),
                // Garantir que datas sejam objetos Date
                createdAt: existingJob.createdAt instanceof Date ? existingJob.createdAt : new Date(existingJob.createdAt),
              },
            },
          }
        })
      },
      
      removeJob: (id) => {
        const { stopPolling } = get()
        stopPolling(id)
        
        set((state) => {
          const newJobs = { ...state.jobs }
          delete newJobs[id]
          return { jobs: newJobs }
        })
      },
      
      clearCompleted: () => {
        set((state) => {
          const newJobs: Record<string, Job> = {}
          Object.entries(state.jobs).forEach(([id, job]) => {
            if (!['completed', 'failed', 'rejected'].includes(job.status)) {
              newJobs[id] = job
            }
          })
          return { jobs: newJobs }
        })
      },

      testConnection: async () => {
        try {
          await apiRequest('/health')
          set({ isConnected: true, lastConnectionTest: new Date() })
          return true
        } catch (error) {
          console.error('Teste de conexão falhou:', error)
          set({ isConnected: false, lastConnectionTest: new Date() })
          return false
        }
      },
      
      startAnalysisJob: async (request) => {
        try {
          console.log('🚀 Iniciando análise:', request)
          
          const response = await apiRequest<{
            job_id: string
            report: string
            status: string
          }>('/start-analysis', {
            method: 'POST',
            body: JSON.stringify(request),
          })
          
          console.log('✅ Resposta da API:', response)
          
          const job = apiResponseToJob(response, request)
          get().addJob(job)
          
          // Se o job precisa de polling, iniciar
          if (['pending_approval', 'workflow_started', 'running'].includes(job.status)) {
            get().startPolling(job.id)
          }
          
          return job.id
        } catch (error) {
          console.error('❌ Erro ao iniciar análise:', error)
          throw error
        }
      },
      
      approveJob: async (id) => {
        try {
          console.log('👍 Aprovando job:', id)
          
          await apiRequest('/update-job-status', {
            method: 'POST',
            body: JSON.stringify({
              job_id: id,
              action: 'approve',
            }),
          })
          
          // Atualizar job local
          get().updateJob(id, { 
            status: 'approved',
            message: 'Análise aprovada'
          })
          
          // Iniciar polling para acompanhar progresso
          get().startPolling(id)
          
        } catch (error) {
          console.error('❌ Erro ao aprovar job:', error)
          throw error
        }
      },
      
      rejectJob: async (id) => {
        try {
          console.log('👎 Rejeitando job:', id)
          
          await apiRequest('/update-job-status', {
            method: 'POST',
            body: JSON.stringify({
              job_id: id,
              action: 'reject',
            }),
          })
          
          get().updateJob(id, { 
            status: 'rejected',
            message: 'Análise rejeitada'
          })
          
          get().stopPolling(id)
          
        } catch (error) {
          console.error('❌ Erro ao rejeitar job:', error)
          throw error
        }
      },
      
      refreshJob: async (id) => {
        try {
          const response = await apiRequest<any>(`/status/${id}`)
          
          const updatedJob = {
            status: mapApiStatus(response.status),
            progress: response.progress || 0,
            message: response.message,
            report: response.report,
            result: response.result,
            errorDetails: response.error_details,
          }
          
          get().updateJob(id, updatedJob)
          
          // Parar polling se job terminou
          if (['completed', 'failed', 'rejected'].includes(updatedJob.status)) {
            get().stopPolling(id)
          }
          
          return updatedJob
        } catch (error) {
          console.error(`❌ Erro ao atualizar job ${id}:`, error)
          throw error
        }
      },
      
      startPolling: (jobId) => {
        const { pollingIntervals, refreshJob, stopPolling } = get()
        
        // Não iniciar se já existe polling para este job
        if (pollingIntervals[jobId]) {
          return
        }
        
        console.log(`🔄 Iniciando polling para job: ${jobId}`)
        
        const interval = setInterval(async () => {
          try {
            const job = get().jobs[jobId]
            if (!job) {
              stopPolling(jobId)
              return
            }
            
            // Parar polling se job terminou
            if (['completed', 'failed', 'rejected'].includes(job.status)) {
              stopPolling(jobId)
              return
            }
            
            await refreshJob(jobId)
          } catch (error) {
            console.error(`❌ Erro no polling do job ${jobId}:`, error)
            // Não parar polling por erro temporário, mas limitar tentativas
          }
        }, 3000) // Poll a cada 3 segundos
        
        set((state) => ({
          pollingIntervals: {
            ...state.pollingIntervals,
            [jobId]: interval,
          },
        }))
      },
      
      stopPolling: (jobId) => {
        const { pollingIntervals } = get()
        const interval = pollingIntervals[jobId]
        
        if (interval) {
          console.log(`⏹️ Parando polling para job: ${jobId}`)
          clearInterval(interval)
          
          set((state) => {
            const newIntervals = { ...state.pollingIntervals }
            delete newIntervals[jobId]
            return { pollingIntervals: newIntervals }
          })
        }
      },
      
      stopAllPolling: () => {
        const { pollingIntervals } = get()
        
        console.log('⏹️ Parando todos os pollings')
        Object.entries(pollingIntervals).forEach(([jobId, interval]) => {
          clearInterval(interval)
        })
        
        set({ pollingIntervals: {} })
      },
    }),
    {
      name: 'job-store',
      partialize: (state) => ({
        jobs: state.jobs,
        isConnected: state.isConnected,
        lastConnectionTest: state.lastConnectionTest,
      }),
    }
  )
)

// Cleanup quando a aplicação é fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useJobStore.getState().stopAllPolling()
  })
}
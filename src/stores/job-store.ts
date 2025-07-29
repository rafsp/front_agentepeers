// src/stores/job-store.ts

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { analysisService, type JobStatusResponse } from '@/lib/api/analysis-service'

export interface Job {
  id: string
  title: string
  status: 'pending_approval' | 'workflow_started' | 'refactoring_code' | 'grouping_commits' | 'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 'committing_to_github' | 'completed' | 'failed' | 'rejected'
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
  requiresApproval?: boolean
}

interface JobState {
  jobs: Record<string, Job>
  activeJobs: string[]
  addJob: (job: Omit<Job, 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  getJobsByStatus: (status: Job['status']) => Job[]
  clearCompleted: () => void
  approveJob: (jobId: string) => Promise<void>
  rejectJob: (jobId: string) => Promise<void>
  startPolling: (jobId: string) => void
  stopPolling: (jobId: string) => void
}

const statusMessages: Record<Job['status'], string> = {
  pending_approval: 'Aguardando aprovação',
  workflow_started: 'Workflow iniciado',
  refactoring_code: 'Refatorando código',
  grouping_commits: 'Agrupando commits',
  writing_unit_tests: 'Escrevendo testes unitários',
  grouping_tests: 'Agrupando testes',
  populating_data: 'Preenchendo dados',
  committing_to_github: 'Commitando no GitHub',
  completed: 'Concluído com sucesso',
  failed: 'Falhou',
  rejected: 'Rejeitado'
}

const statusProgress: Record<Job['status'], number> = {
  pending_approval: 10,
  workflow_started: 20,
  refactoring_code: 30,
  grouping_commits: 45,
  writing_unit_tests: 60,
  grouping_tests: 75,
  populating_data: 85,
  committing_to_github: 95,
  completed: 100,
  failed: 0,
  rejected: 0
}

// Map para controlar polling ativo
const activePolling = new Map<string, boolean>()

export const useJobStore = create<JobState>()(
  devtools(
    persist(
      (set, get) => ({
        jobs: {},
        activeJobs: [],

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

            const updatedJob = { ...currentJob, ...updates }
            
            // Atualizar progress e message baseado no status
            if (updates.status) {
              updatedJob.progress = statusProgress[updates.status]
              updatedJob.message = statusMessages[updates.status]
              
              if (updates.status === 'completed') {
                updatedJob.completedAt = new Date()
              }
            }

            return {
              jobs: {
                ...state.jobs,
                [id]: updatedJob,
              },
            }
          }),

        removeJob: (id) =>
          set((state) => {
            // Parar polling se estiver ativo
            get().stopPolling(id)
            
            return {
              jobs: Object.fromEntries(
                Object.entries(state.jobs).filter(([jobId]) => jobId !== id)
              ),
              activeJobs: state.activeJobs.filter((jobId) => jobId !== id),
            }
          }),

        getJobsByStatus: (status) =>
          Object.values(get().jobs).filter((job) => job.status === status),

        clearCompleted: () =>
          set((state) => {
            const activeJobs = Object.entries(state.jobs)
              .filter(([, job]) => !['completed', 'failed', 'rejected'].includes(job.status))
              .reduce((acc, [id, job]) => ({ ...acc, [id]: job }), {})
            
            return {
              jobs: activeJobs,
              activeJobs: Object.keys(activeJobs),
            }
          }),

        approveJob: async (jobId: string) => {
          try {
            await analysisService.updateJobStatus({ job_id: jobId, action: 'approve' })
            get().updateJob(jobId, { status: 'workflow_started' })
            get().startPolling(jobId)
          } catch (error) {
            console.error('Erro ao aprovar job:', error)
            get().updateJob(jobId, { 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            })
          }
        },

        rejectJob: async (jobId: string) => {
          try {
            await analysisService.updateJobStatus({ job_id: jobId, action: 'reject' })
            get().updateJob(jobId, { status: 'rejected' })
          } catch (error) {
            console.error('Erro ao rejeitar job:', error)
            get().updateJob(jobId, { 
              status: 'failed', 
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            })
          }
        },

        startPolling: (jobId: string) => {
          if (activePolling.get(jobId)) return // Já está fazendo polling

          activePolling.set(jobId, true)
          
          analysisService.pollJobStatus(jobId, (status: JobStatusResponse) => {
            // Verificar se ainda devemos fazer polling
            if (!activePolling.get(jobId)) return

            get().updateJob(jobId, { 
              status: status.status as Job['status'],
              error: status.error_details 
            })

            // Parar polling se completou
            if (['completed', 'failed', 'rejected'].includes(status.status)) {
              get().stopPolling(jobId)
            }
          })
        },

        stopPolling: (jobId: string) => {
          activePolling.set(jobId, false)
        }
      }),
      { 
        name: 'job-store',
        // Não persistir jobs em polling ativo
        partialize: (state) => ({
          jobs: state.jobs,
          activeJobs: state.activeJobs
        })
      }
    )
  )
)
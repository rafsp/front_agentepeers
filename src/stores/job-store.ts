import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface Job {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rejected'
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
}

interface JobState {
  jobs: Record<string, Job>
  activeJobs: string[]
  addJob: (job: Omit<Job, 'createdAt'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  removeJob: (id: string) => void
  getJobsByStatus: (status: Job['status']) => Job[]
  clearCompleted: () => void
}

export const useJobStore = create<JobState>()(
  devtools(
    persist(
      (set, get) => ({
        jobs: {},
        activeJobs: [],

        addJob: (job) => {
          console.log('Adicionando job:', job)
          const newJob = { 
            ...job, 
            createdAt: new Date(),
            progress: job.progress ?? 0,
            message: job.message || 'Iniciando...',
            status: job.status || 'pending'
          }
          
          set((state) => ({
            jobs: { ...state.jobs, [job.id]: newJob },
            activeJobs: [...state.activeJobs, job.id],
          }))
        },

        updateJob: (id, updates) => {
          console.log('Atualizando job:', id, updates)
          set((state) => {
            const existingJob = state.jobs[id]
            if (!existingJob) {
              console.warn(`Tentativa de atualizar job inexistente: ${id}`)
              return state
            }

            return {
              jobs: {
                ...state.jobs,
                [id]: { ...existingJob, ...updates },
              },
            }
          })
        },

        removeJob: (id) =>
          set((state) => ({
            jobs: Object.fromEntries(
              Object.entries(state.jobs).filter(([jobId]) => jobId !== id)
            ),
            activeJobs: state.activeJobs.filter((jobId) => jobId !== id),
          })),

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
      }),
      { 
        name: 'job-store',
        // Configuração de storage personalizada para lidar com Dates
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name)
              if (!str) return null
              
              const parsed = JSON.parse(str)
              
              // Converter strings de data de volta para objetos Date
              if (parsed.state?.jobs) {
                Object.values(parsed.state.jobs).forEach((job: any) => {
                  if (job.createdAt) job.createdAt = new Date(job.createdAt)
                  if (job.completedAt) job.completedAt = new Date(job.completedAt)
                })
              }
              
              return parsed
            } catch (error) {
              console.error('Erro ao carregar job store:', error)
              return null
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value))
            } catch (error) {
              console.error('Erro ao salvar job store:', error)
            }
          },
          removeItem: (name) => {
            localStorage.removeItem(name)
          },
        },
      }
    ),
    { name: 'job-store' }
  )
)
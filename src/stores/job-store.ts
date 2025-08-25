// // stores/job-store.ts - VERSÃO MELHORADA
// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// // Importar tipos
// export type FrontendAnalysisType = 
//   | 'design' 
//   | 'refatoracao'
//   | 'docstring'
//   | 'security'
//   | 'pentest'
//   | 'relatorio_teste_unitario'
//   | 'escrever_testes'
//   | 'terraform'

// const API_BASE_URL = 'http://127.0.0.1:8000'

// // Funções de API inline
// const startAnalysisAPI = async (params: {
//   repository: string
//   branch: string
//   analysisType: FrontendAnalysisType
//   extraInstructions?: string
// }): Promise<{ job_id: string; report: string }> => {
//   // Mapear tipo frontend -> backend
//   const typeMap: Record<FrontendAnalysisType, string> = {
//     'design': 'design',
//     'refatoracao': 'design',
//     'docstring': 'design', 
//     'security': 'design',
//     'pentest': 'design',
//     'relatorio_teste_unitario': 'relatorio_teste_unitario',
//     'escrever_testes': 'relatorio_teste_unitario',
//     'terraform': 'design'
//   }

//   const response = await fetch(`${API_BASE_URL}/start-analysis`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       repo_name: params.repository,
//       branch_name: params.branch,
//       analysis_type: typeMap[params.analysisType] || 'design',
//       instrucoes_extras: params.extraInstructions
//     }),
//   })

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ detail: 'Erro de comunicação' }))
//     throw new Error(errorData.detail || `HTTP ${response.status}`)
//   }

//   return response.json()
// }

// const updateJobStatusAPI = async (jobId: string, action: 'approve' | 'reject'): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/update-job-status`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ job_id: jobId, action }),
//   })

//   if (!response.ok) {
//     const errorData = await response.json().catch(() => ({ detail: 'Erro de comunicação' }))
//     throw new Error(errorData.detail || `HTTP ${response.status}`)
//   }
// }

// const getJobStatusAPI = async (jobId: string) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/status/${jobId}`)
//     if (!response.ok) return null
//     return response.json()
//   } catch (error) {
//     console.warn(`Erro ao buscar status do job ${jobId}:`, error)
//     return null
//   }
// }

// export type JobStatus = 
//   | 'pending'
//   | 'pending_approval'
//   | 'approved'
//   | 'running'
//   | 'refactoring_code'
//   | 'grouping_commits'
//   | 'writing_unit_tests'
//   | 'grouping_tests'
//   | 'populating_data'
//   | 'committing_to_github'
//   | 'completed'
//   | 'failed'
//   | 'rejected'

// export interface Job {
//   id: string
//   title: string
//   repository: string
//   branch: string
//   analysisType: FrontendAnalysisType
//   status: JobStatus
//   progress: number
//   message?: string
//   initialReport?: string
//   report?: string
//   createdAt: Date
//   lastUpdated?: Date
//   backendJobId?: string
//   error?: string
//   extraInstructions?: string
// }

// interface CreateJobParams {
//   title: string
//   repository: string
//   branch: string
//   analysisType: FrontendAnalysisType
//   extraInstructions?: string
// }

// interface JobStore {
//   jobs: Record<string, Job>
//   pollingIntervals: Record<string, NodeJS.Timeout>
  
//   // Actions
//   createJob: (params: CreateJobParams) => Promise<string>
//   updateJob: (jobId: string, updates: Partial<Job>) => void
//   approveJob: (jobId: string) => Promise<void>
//   rejectJob: (jobId: string) => Promise<void>
//   deleteJob: (jobId: string) => void
//   startPollingJob: (jobId: string, backendJobId: string) => void
//   stopPollingJob: (jobId: string) => void
//   stopAllPolling: () => void
//   syncJobsFromBackend: () => Promise<void>
// }

// // Função para mapear status do backend para frontend
// const mapBackendStatusToFrontend = (backendStatus: string): JobStatus => {
//   const statusMap: Record<string, JobStatus> = {
//     'pending_approval': 'pending_approval',
//     'workflow_started': 'approved',
//     'refactoring_code': 'refactoring_code',
//     'grouping_commits': 'grouping_commits',
//     'writing_unit_tests': 'writing_unit_tests',
//     'grouping_tests': 'grouping_tests',
//     'populating_data': 'populating_data',
//     'committing_to_github': 'committing_to_github',
//     'completed': 'completed',
//     'failed': 'failed',
//     'rejected': 'rejected'
//   }
  
//   return statusMap[backendStatus] || 'pending'
// }

// // Função para calcular progresso baseado no status
// const calculateProgressFromStatus = (status: JobStatus): number => {
//   const progressMap: Record<JobStatus, number> = {
//     'pending': 0,
//     'pending_approval': 25,
//     'approved': 25,
//     'running': 30,
//     'refactoring_code': 40,
//     'grouping_commits': 55,
//     'writing_unit_tests': 70,
//     'grouping_tests': 80,
//     'populating_data': 90,
//     'committing_to_github': 95,
//     'completed': 100,
//     'failed': 0,
//     'rejected': 0
//   }
  
//   return progressMap[status] || 0
// }

// export const useJobStore = create<JobStore>()(
//   persist(
//     (set, get) => ({
//       jobs: {},
//       pollingIntervals: {},

//       createJob: async (params) => {
//         const jobId = crypto.randomUUID()
        
//         // Criar job local imediatamente
//         const newJob: Job = {
//           id: jobId,
//           title: params.title,
//           repository: params.repository,
//           branch: params.branch,
//           analysisType: params.analysisType,
//           status: 'pending',
//           progress: 0,
//           message: 'Preparando análise...',
//           createdAt: new Date(),
//           extraInstructions: params.extraInstructions
//         }

//         set((state) => ({
//           jobs: {
//             ...state.jobs,
//             [jobId]: newJob
//           }
//         }))

//         try {
//           // Fazer chamada para o backend
//           const response = await startAnalysisAPI({
//             repository: params.repository,
//             branch: params.branch,
//             analysisType: params.analysisType,
//             extraInstructions: params.extraInstructions
//           })

//           // Atualizar job com dados do backend
//           set((state) => ({
//             jobs: {
//               ...state.jobs,
//               [jobId]: {
//                 ...state.jobs[jobId],
//                 status: 'pending_approval',
//                 progress: 25,
//                 message: 'Relatório gerado. Aguardando aprovação.',
//                 initialReport: response.report,
//                 backendJobId: response.job_id,
//                 lastUpdated: new Date()
//               }
//             }
//           }))

//           return jobId

//         } catch (error) {
//           // Atualizar job com erro
//           set((state) => ({
//             jobs: {
//               ...state.jobs,
//               [jobId]: {
//                 ...state.jobs[jobId],
//                 status: 'failed',
//                 progress: 0,
//                 message: 'Erro ao gerar relatório inicial',
//                 error: error instanceof Error ? error.message : 'Erro desconhecido',
//                 lastUpdated: new Date()
//               }
//             }
//           }))
          
//           throw error
//         }
//       },

//       updateJob: (jobId, updates) => {
//         set((state) => {
//           const currentJob = state.jobs[jobId]
//           if (!currentJob) return state

//           // Calcular progresso automaticamente se não fornecido
//           let finalProgress = updates.progress
//           if (updates.status && finalProgress === undefined) {
//             finalProgress = calculateProgressFromStatus(updates.status)
//           }

//           return {
//             jobs: {
//               ...state.jobs,
//               [jobId]: {
//                 ...currentJob,
//                 ...updates,
//                 progress: finalProgress !== undefined ? finalProgress : currentJob.progress,
//                 lastUpdated: new Date()
//               }
//             }
//           }
//         })
//       },

//       approveJob: async (jobId) => {
//         const job = get().jobs[jobId]
//         if (!job || !job.backendJobId) {
//           throw new Error('Job não encontrado ou sem ID do backend')
//         }

//         try {
//           await updateJobStatusAPI(job.backendJobId, 'approve')
          
//           // Atualizar status local
//           get().updateJob(jobId, {
//             status: 'approved',
//             progress: 25,
//             message: 'Processamento iniciado...'
//           })

//           // Iniciar polling
//           get().startPollingJob(jobId, job.backendJobId)

//         } catch (error) {
//           get().updateJob(jobId, {
//             status: 'failed',
//             error: 'Erro ao aprovar job',
//             message: 'Falha na comunicação com o backend'
//           })
//           throw error
//         }
//       },

//       rejectJob: async (jobId) => {
//         const job = get().jobs[jobId]
//         if (!job || !job.backendJobId) {
//           throw new Error('Job não encontrado ou sem ID do backend')
//         }

//         try {
//           await updateJobStatusAPI(job.backendJobId, 'reject')
          
//           get().updateJob(jobId, {
//             status: 'rejected',
//             progress: 0,
//             message: 'Análise rejeitada pelo usuário'
//           })

//         } catch (error) {
//           throw error
//         }
//       },

//       deleteJob: (jobId) => {
//         // Parar polling se ativo
//         get().stopPollingJob(jobId)
        
//         set((state) => {
//           const { [jobId]: removed, ...remaining } = state.jobs
//           return { jobs: remaining }
//         })
//       },

//       startPollingJob: (jobId, backendJobId) => {
//         // Parar polling existente se houver
//         get().stopPollingJob(jobId)
        
//         console.log(`🔄 Iniciando polling para job ${jobId} (backend: ${backendJobId})`)
        
//         const interval = setInterval(async () => {
//           try {
//             const currentJob = get().jobs[jobId]
//             if (!currentJob) {
//               console.log(`❌ Job ${jobId} não encontrado, parando polling`)
//               get().stopPollingJob(jobId)
//               return
//             }

//             // Parar polling se job foi concluído
//             if (['completed', 'failed', 'rejected'].includes(currentJob.status)) {
//               console.log(`✅ Job ${jobId} concluído (${currentJob.status}), parando polling`)
//               get().stopPollingJob(jobId)
//               return
//             }

//             // Buscar status atual
//             const statusResponse = await getJobStatusAPI(backendJobId)
            
//             if (!statusResponse) {
//               console.log(`⚠️ Sem resposta do backend para job ${jobId}`)
//               return
//             }
            
//             const newStatus = mapBackendStatusToFrontend(statusResponse.status)
//             let newProgress = statusResponse.progress || calculateProgressFromStatus(newStatus)
//             const newMessage = statusResponse.message || currentJob.message

//             // Garantir que o progresso sempre aumente (nunca diminua)
//             if (newProgress < currentJob.progress) {
//               newProgress = currentJob.progress
//             }
            
//             // Atualizar job se houve mudanças significativas
//             if (newStatus !== currentJob.status || 
//                 newProgress !== currentJob.progress || 
//                 newMessage !== currentJob.message) {
              
//               console.log(`📊 Atualizando job ${jobId}: ${currentJob.status} -> ${newStatus} (${currentJob.progress}% -> ${newProgress}%)`)
              
//               get().updateJob(jobId, {
//                 status: newStatus,
//                 progress: newProgress,
//                 message: newMessage
//               })
//             }
            
//             // Parar polling se job foi concluído
//             if (['completed', 'failed', 'rejected'].includes(newStatus)) {
//               console.log(`🏁 Job ${jobId} finalizado com status: ${newStatus}`)
//               get().stopPollingJob(jobId)
//             }
            
//           } catch (error) {
//             console.error(`❌ Erro no polling do job ${jobId}:`, error)
            
//             // Em caso de erro, manter o job atual mas avisar
//             get().updateJob(jobId, {
//               error: 'Erro de comunicação com o backend'
//             })
//           }
//         }, 2000) // Poll a cada 2 segundos
        
//         // Salvar referência do intervalo
//         set((state) => ({
//           pollingIntervals: {
//             ...state.pollingIntervals,
//             [jobId]: interval
//           }
//         }))
//       },

//       stopPollingJob: (jobId) => {
//         set((state) => {
//           const interval = state.pollingIntervals[jobId]
//           if (interval) {
//             clearInterval(interval)
//             console.log(`⏹️ Polling parado para job ${jobId}`)
//             const { [jobId]: removed, ...remaining } = state.pollingIntervals
//             return { pollingIntervals: remaining }
//           }
//           return state
//         })
//       },

//       stopAllPolling: () => {
//         set((state) => {
//           Object.values(state.pollingIntervals).forEach(interval => {
//             clearInterval(interval)
//           })
//           console.log('⏹️ Todo o polling foi parado')
//           return { pollingIntervals: {} }
//         })
//       },

//       syncJobsFromBackend: async () => {
//         // Esta função não é usada no momento
//         console.log('Sync jobs from backend - not implemented')
//       }
//     }),
//     {
//       name: 'job-store',
//       // Não persistir pollingIntervals
//       partialize: (state) => ({ jobs: state.jobs })
//     }
//   )
// )

// // Hook para estatísticas
// export const useJobStats = () => {
//   const jobs = useJobStore(state => state.jobs)
//   const jobsList = Object.values(jobs)
  
//   return {
//     total: jobsList.length,
//     active: jobsList.filter(job => 
//       ['running', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 
//        'grouping_tests', 'populating_data', 'committing_to_github', 'approved'].includes(job.status)
//     ).length,
//     pending: jobsList.filter(job => job.status === 'pending_approval').length,
//     completed: jobsList.filter(job => job.status === 'completed').length,
//     failed: jobsList.filter(job => ['failed', 'rejected'].includes(job.status)).length
//   }
// }

// // Cleanup ao desmontar componentes
// if (typeof window !== 'undefined') {
//   window.addEventListener('beforeunload', () => {
//     useJobStore.getState().stopAllPolling()
//   })
// }
// // src/hooks/use-jobs.ts - VERSÃO SIMPLIFICADA SEM PROBLEMAS
// import { useJobStore } from '@/stores/job-store'

// export function useJobs() {
//   const store = useJobStore()
  
//   // Converter jobs object para array
//   const jobsList = Object.values(store.jobs).sort(
//     (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
//   )

//   return {
//     // Estado básico
//     jobs: store.jobs,
//     jobsList,
    
//     // Ações principais 
//     startAnalysis: store.startAnalysisJob,
//     approveJob: store.approveJob,
//     rejectJob: store.rejectJob,
    
//     // Gerenciamento
//     removeJob: store.removeJob,
//     clearCompleted: store.clearCompleted,
//     getJobsByStatus: store.getJobsByStatus,
    
//     // Conexão e polling
//     testConnection: store.testConnection,
//     startPollingJob: store.startPollingJob,
//     stopPollingJob: store.stopPollingJob,
//   }
// }
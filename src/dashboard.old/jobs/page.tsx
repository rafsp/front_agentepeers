// 'use client'

// import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Plus, Zap, Activity, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react'
// import { JobProgressCard } from './job-progress-card' // Importe o componente anterior
// import { useJobStore } from '@/stores/job-store'

// export default function VisualJobsPage() {
//   const router = useRouter()
//   const { jobs: storeJobs } = useJobStore()
//   const [jobs, setJobs] = useState<Record<string, any>>({})
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     pending: 0,
//     completed: 0,
//     failed: 0
//   })

//   // Sincronizar jobs do store
//   useEffect(() => {
//     const syncedJobs: Record<string, any> = {}
    
//     Object.values(storeJobs).forEach(storeJob => {
//       syncedJobs[storeJob.id] = {
//         id: storeJob.id,
//         title: storeJob.title,
//         status: storeJob.status,
//         progress: storeJob.progress || 0,
//         message: storeJob.message || 'Processando...',
//         repository: storeJob.repository,
//         branch: storeJob.branch,
//         createdAt: storeJob.createdAt,
//         lastUpdated: storeJob.lastUpdated || new Date(),
//         backendJobId: storeJob.backendJobId,
//         error: storeJob.error
//       }
//     })
    
//     setJobs(syncedJobs)
//   }, [storeJobs])

//   // Calcular estatísticas
//   useEffect(() => {
//     const jobsList = Object.values(jobs)
    
//     setStats({
//       total: jobsList.length,
//       active: jobsList.filter(job => 
//         ['approved', 'running', 'refactoring_code', 'grouping_commits', 
//          'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
//       ).length,
//       pending: jobsList.filter(job => job.status === 'pending_approval').length,
//       completed: jobsList.filter(job => job.status === 'completed').length,
//       failed: jobsList.filter(job => ['failed', 'rejected'].includes(job.status)).length
//     })
//   }, [jobs])

//   const updateJob = (jobId: string, updates: any) => {
//     setJobs(prev => ({
//       ...prev,
//       [jobId]: {
//         ...prev[jobId],
//         ...updates
//       }
//     }))
//   }

//   const removeJob = (jobId: string) => {
//     setJobs(prev => {
//       const { [jobId]: removed, ...rest } = prev
//       return rest
//     })
//   }

//   const jobsList = Object.values(jobs).sort(
//     (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//   )

//   return (
//     <div className="flex-1 p-6">
//       {/* Header com Estatísticas */}
//       <div className="mb-8">
//         <div className="flex justify-between items-start mb-6">
//           <div>
//             <h1 className="text-3xl font-bold mb-2">Monitor de Análises</h1>
//             <p className="text-muted-foreground">
//               Acompanhe o progresso detalhado de todas as suas análises em tempo real
//             </p>
//           </div>
          
//           <Button onClick={() => router.push('/dashboard/new-analysis')}>
//             <Plus className="h-4 w-4 mr-2" />
//             Nova Análise
//           </Button>
//         </div>

//         {/* Dashboard de Estatísticas */}
//         <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//           <Card>
//             <CardContent className="p-4 text-center">
//               <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
//               <div className="text-sm text-muted-foreground">Total</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-4 text-center">
//               <div className="flex items-center justify-center gap-1 mb-1">
//                 <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
//                 <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
//               </div>
//               <div className="text-sm text-muted-foreground">Em Execução</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-4 text-center">
//               <div className="flex items-center justify-center gap-1 mb-1">
//                 <Clock className="h-4 w-4 text-orange-500" />
//                 <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
//               </div>
//               <div className="text-sm text-muted-foreground">Pendentes</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-4 text-center">
//               <div className="flex items-center justify-center gap-1 mb-1">
//                 <CheckCircle className="h-4 w-4 text-green-500" />
//                 <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
//               </div>
//               <div className="text-sm text-muted-foreground">Concluídos</div>
//             </CardContent>
//           </Card>
          
//           <Card>
//             <CardContent className="p-4 text-center">
//               <div className="flex items-center justify-center gap-1 mb-1">
//                 <XCircle className="h-4 w-4 text-red-500" />
//                 <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
//               </div>
//               <div className="text-sm text-muted-foreground">Falhas</div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Status da Conectividade */}
//         {stats.active > 0 && (
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
//               <span className="font-medium text-blue-800">
//                 Sistema de Monitoramento Ativo
//               </span>
//             </div>
//             <p className="text-sm text-blue-700 mt-1">
//               {stats.active} análise{stats.active > 1 ? 's' : ''} sendo monitorada{stats.active > 1 ? 's' : ''} 
//               em tempo real. Atualizações automáticas a cada 2 segundos.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Lista de Jobs */}
//       <div className="space-y-6">
//         {jobsList.length === 0 ? (
//           <Card>
//             <CardContent className="text-center py-12">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Activity className="h-8 w-8 text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold mb-2">Nenhuma análise encontrada</h3>
//               <p className="text-muted-foreground mb-6">
//                 Inicie sua primeira análise de código para começar o monitoramento
//               </p>
//               <Button onClick={() => router.push('/dashboard/new-analysis')}>
//                 <Zap className="h-4 w-4 mr-2" />
//                 Primeira Análise
//               </Button>
//             </CardContent>
//           </Card>
//         ) : (
//           jobsList.map((job) => (
//             <JobProgressCard
//               key={job.id}
//            //   job={job}
//               onUpdate={updateJob}
//               onRemove={removeJob}
//             />
//           ))
//         )}
//       </div>

//       {/* Informações do Sistema */}
//       <div className="mt-8 p-4 bg-gray-50 rounded-lg">
//         <h4 className="font-semibold mb-3 flex items-center gap-2">
//           <RefreshCw className="h-4 w-4" />
//           Sistema de Monitoramento
//         </h4>
//         <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
//           <div>
//             <h5 className="font-medium mb-2">✅ Funcionalidades Ativas:</h5>
//             <ul className="space-y-1">
//               <li>• Polling automático a cada 2 segundos</li>
//               <li>• Timeline visual de progresso</li>
//               <li>• Indicadores de conexão em tempo real</li>
//               <li>• Atualizações automáticas de status</li>
//             </ul>
//           </div>
//           <div>
//             <h5 className="font-medium mb-2">📊 Estatísticas de Monitoramento:</h5>
//             <ul className="space-y-1">
//               <li>• Jobs ativos: {stats.active}</li>
//               <li>• Conexões monitoradas: {stats.active}</li>
//               <li>• Taxa de atualização: 2s</li>
//               <li>• Status: {stats.active > 0 ? 'Monitorando' : 'Em espera'}</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
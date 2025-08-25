// // src/app/dashboard/jobs/[id]/page.tsx - CORRIGIDO com novos status
// 'use client'

// import React, { useEffect } from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { Progress } from '@/components/ui/progress'
// import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, GitBranch, Calendar, AlertCircle, Eye, Shield } from 'lucide-react'
// import { useJobStore } from '@/stores/job-store'
// import { useToast } from '@/components/ui/use-toast'
// import ReactMarkdown from 'react-markdown'
// import { formatDistanceToNow } from 'date-fns'
// import { ptBR } from 'date-fns/locale'

// const statusIcons = {
//   pending: Clock,
//   iniciando_relatorio: FileText,
//   lendo_codigos: Eye,
//   validando_praticas: Shield,
//   pending_approval: AlertCircle,
//   approved: CheckCircle,
//   running: Clock,
//   refactoring_code: Clock,
//   grouping_commits: Clock,
//   writing_unit_tests: Clock,
//   grouping_tests: Clock,
//   populating_data: Clock,
//   committing_to_github: Clock,
//   completed: CheckCircle,
//   failed: XCircle,
//   rejected: XCircle,
// }

// const statusColors = {
//   pending: 'warning',
//   iniciando_relatorio: 'default',
//   lendo_codigos: 'default',
//   validando_praticas: 'default',
//   pending_approval: 'warning',
//   approved: 'default',
//   running: 'default',
//   refactoring_code: 'default',
//   grouping_commits: 'default', 
//   writing_unit_tests: 'default',
//   grouping_tests: 'default',
//   populating_data: 'default',
//   committing_to_github: 'default',
//   completed: 'success',
//   failed: 'destructive',
//   rejected: 'destructive',
// } as const

// const statusLabels = {
//   pending: 'Pendente',
//   iniciando_relatorio: 'Iniciando Relatório',
//   lendo_codigos: 'Lendo Códigos',
//   validando_praticas: 'Validando Práticas',
//   pending_approval: 'Aguardando Aprovação',
//   approved: 'Aprovado',
//   running: 'Executando',
//   refactoring_code: 'Refatorando Código',
//   grouping_commits: 'Agrupando Commits',
//   writing_unit_tests: 'Escrevendo Testes',
//   grouping_tests: 'Agrupando Testes',
//   populating_data: 'Preparando Dados',
//   committing_to_github: 'Enviando para GitHub',
//   completed: 'Concluído',
//   failed: 'Falhou',
//   rejected: 'Rejeitado',
// }

// export default function JobDetailPage() {
//   const router = useRouter()
//   const params = useParams()
//   const { toast } = useToast()
//   const { jobs, updateJob, approveJob, rejectJob, startPollingJob } = useJobStore()
  
//   const jobId = params.id as string
//   const job = jobs[jobId]

//   useEffect(() => {
//     if (job && job.backendJobId && ['approved', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)) {
//       startPollingJob(jobId, job.backendJobId)
//     }
//   }, [job?.status, jobId, startPollingJob, job?.backendJobId])

//   const handleApprove = async () => {
//     try {
//       await approveJob(jobId)
//       toast({
//         title: 'Relatório aprovado',
//         description: 'O processamento foi iniciado. Acompanhe o progresso abaixo.',
//       })
//     } catch (error) {
//       toast({
//         title: 'Erro ao aprovar',
//         description: 'Não foi possível aprovar o relatório. Tente novamente.',
//         variant: 'destructive'
//       })
//     }
//   }

//   const handleReject = async () => {
//     try {
//       await rejectJob(jobId)
//       toast({
//         title: 'Relatório rejeitado',
//         description: 'O job foi cancelado com sucesso.',
//       })
//     } catch (error) {
//       toast({
//         title: 'Erro ao rejeitar',
//         description: 'Não foi possível rejeitar o relatório. Tente novamente.',
//         variant: 'destructive'
//       })
//     }
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <Card className="w-full max-w-md">
//           <CardContent className="p-6 text-center">
//             <h2 className="text-lg font-semibold mb-2">Job não encontrado</h2>
//             <p className="text-muted-foreground mb-4">O job solicitado não foi encontrado.</p>
//             <Button onClick={() => router.push('/dashboard')} variant="outline">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Voltar ao Dashboard
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   const StatusIcon = statusIcons[job.status as keyof typeof statusIcons] || Clock
//   const statusColor = statusColors[job.status as keyof typeof statusColors] || 'default'
//   const statusLabel = statusLabels[job.status as keyof typeof statusLabels] || job.status

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center gap-4">
//             <Button 
//               variant="ghost" 
//               size="sm"
//               onClick={() => router.push('/dashboard')}
//               className="hover:bg-gray-100"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Dashboard
//             </Button>
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Análise: {job.analysisType}
//               </h1>
//               <p className="text-gray-600">{job.repository} • {job.branch}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Sidebar com informações do job */}
//           <div className="lg:col-span-1">
//             <Card className="sticky top-24">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <StatusIcon className="h-5 w-5" />
//                   Status do Job
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <Badge 
//                     //variant={statusColor}
//                     className="mb-2"
//                   >
//                     {statusLabel}
//                   </Badge>
                  
//                   {/* Progress Bar */}
//                   {job.progress !== undefined && job.progress > 0 && (
//                     <div className="space-y-2">
//                       <div className="flex justify-between text-sm">
//                         <span>Progresso</span>
//                         <span>{job.progress}%</span>
//                       </div>
//                       <Progress value={job.progress} className="h-2" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-3 text-sm">
//                   <div>
//                     <p className="font-medium">Repositório</p>
//                     <div className="flex items-center gap-1 text-muted-foreground">
//                       <GitBranch className="h-3 w-3" />
//                       <span>{job.repository}</span>
//                     </div>
//                   </div>

//                   <div>
//                     <p className="font-medium">Branch</p>
//                     <p className="text-muted-foreground">{job.branch}</p>
//                   </div>

//                   <div>
//                     <p className="font-medium">Tipo de Análise</p>
//                     <p className="text-muted-foreground">{job.analysisType}</p>
//                   </div>

//                   <div>
//                     <p className="font-medium">Criado</p>
//                     <div className="flex items-center gap-1 text-muted-foreground">
//                       <Calendar className="h-3 w-3" />
//                       <span>{formatDistanceToNow(job.createdAt, { addSuffix: true, locale: ptBR })}</span>
//                     </div>
//                   </div>

//                   {/* {job.completedAt && (
//                     <div>
//                       <p className="font-medium">Concluído</p>
//                       <p className="text-muted-foreground">
//                         {job.completedAt.toLocaleDateString('pt-BR')} às {job.completedAt.toLocaleTimeString('pt-BR')}
//                       </p>
//                     </div>
//                   )} */}

//                   {job.instructions && (
//                     <div>
//                       <p className="font-medium">Instruções</p>
//                       <p className="text-muted-foreground text-sm">{job.instructions}</p>
//                     </div>
//                   )}

//                   {/* Botões de Ação para Aprovação */}
//                   {job.status === 'pending_approval' && (
//                     <div className="space-y-2 pt-4 border-t">
//                       <Button
//                         onClick={handleApprove}
//                         className="w-full bg-green-600 hover:bg-green-700"
//                       >
//                         <CheckCircle className="h-4 w-4 mr-2" />
//                         Aprovar
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         onClick={handleReject}
//                         className="w-full"
//                       >
//                         <XCircle className="h-4 w-4 mr-2" />
//                         Rejeitar
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Conteúdo do relatório */}
//           <div className="lg:col-span-3">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <FileText className="h-5 w-5" />
//                   {job.status === 'pending_approval' ? 'Relatório para Aprovação' : 'Relatório de Análise'}
//                 </CardTitle>
//                 {job.status === 'pending_approval' && (
//                   <p className="text-sm text-muted-foreground">
//                     Revise o relatório abaixo e aprove para iniciar o processamento automático.
//                   </p>
//                 )}
                
//                 {/* Status da Mensagem */}
//                 {job.message && (
//                   <div className="bg-muted p-3 rounded-md">
//                     <p className="text-sm">{job.message}</p>
//                   </div>
//                 )}
//               </CardHeader>
//               <CardContent>
//                 {job.report || job.initialReport ? (
//                   <div className="prose prose-sm max-w-none dark:prose-invert">
//                     <ReactMarkdown>{job.report || job.initialReport}</ReactMarkdown>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//                     <h3 className="text-lg font-semibold mb-2">
//                       {['iniciando_relatorio', 'lendo_codigos', 'validando_praticas'].includes(job.status) 
//                         ? 'Gerando relatório...' 
//                         : 'Relatório não disponível'}
//                     </h3>
//                     <p className="text-muted-foreground">
//                       {['iniciando_relatorio', 'lendo_codigos', 'validando_praticas'].includes(job.status)
//                         ? 'Os agentes estão analisando o código e gerando o relatório.'
//                         : 'O relatório ainda não foi gerado para este job.'}
//                     </p>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
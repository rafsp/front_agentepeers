// 'use client'

// import React from 'react'
// import { useRouter, useParams } from 'next/navigation'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { ArrowLeft, Download, FileText, Calendar, GitBranch, User } from 'lucide-react'
// import { useJobStore } from '@/stores/job-store'
// import { formatDistanceToNow } from 'date-fns'
// import { ptBR } from 'date-fns/locale'

// export default function ReportDetailPage() {
//   const router = useRouter()
//   const params = useParams()
//   const { jobs } = useJobStore()
  
//   const jobId = params.id as string
//   const job = jobs[jobId]

//   const handleDownloadReport = () => {
//     if (job?.report || job?.initialReport) {
//       const reportContent = job.report || job.initialReport || ''
//       const blob = new Blob([reportContent], { type: 'text/markdown' })
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `analise-${job.repository.replace('/', '-')}-${job.id}.md`
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       URL.revokeObjectURL(url)
//     }
//   }

//   const handleDownloadPDF = () => {
//     // Funcionalidade de PDF será implementada em breve
//     alert('Funcionalidade de PDF será implementada em breve!')
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen bg-background">
//         <header className="border-b">
//           <div className="container mx-auto px-4 py-4">
//             <Button
//               variant="ghost"
//               onClick={() => router.push('/dashboard/reports')}
//               className="mb-4"
//             >
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Voltar aos Relatórios
//             </Button>
//             <h1 className="text-2xl font-bold">Relatório não encontrado</h1>
//           </div>
//         </header>
//         <div className="container mx-auto px-4 py-8">
//           <Card>
//             <CardContent className="text-center py-8">
//               <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//               <h3 className="text-lg font-semibold mb-2">Relatório não encontrado</h3>
//               <p className="text-muted-foreground mb-4">
//                 O relatório solicitado não existe ou foi removido.
//               </p>
//               <Button onClick={() => router.push('/dashboard/reports')}>
//                 Voltar aos Relatórios
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     )
//   }

//   // Pegar o conteúdo do relatório (priorizar report, depois initialReport)
//   const reportContent = job.report || job.initialReport || ''

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b">
//         <div className="container mx-auto px-4 py-4">
//           <Button
//             variant="ghost"
//             onClick={() => router.push('/dashboard/reports')}
//             className="mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Voltar aos Relatórios
//           </Button>
          
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
//               <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                 <span className="flex items-center gap-1">
//                   <GitBranch className="h-4 w-4" />
//                   {job.repository}
//                 </span>
//                 {job.branch && (
//                   <span>Branch: {job.branch}</span>
//                 )}
//                 <span className="flex items-center gap-1">
//                   <Calendar className="h-4 w-4" />
//                   {job.completedAt ? formatDistanceToNow(job.completedAt, { 
//                     addSuffix: true, 
//                     locale: ptBR 
//                   }) : formatDistanceToNow(job.createdAt, { 
//                     addSuffix: true, 
//                     locale: ptBR 
//                   })}
//                 </span>
//               </div>
//             </div>
            
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={handleDownloadReport}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Download MD
//               </Button>
//               <Button onClick={handleDownloadPDF}>
//                 <FileText className="h-4 w-4 mr-2" />
//                 Download PDF
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         <div className="grid lg:grid-cols-4 gap-6">
//           {/* Sidebar com informações */}
//           <div className="lg:col-span-1">
//             <Card className="sticky top-4">
//               <CardHeader>
//                 <CardTitle className="text-lg">Informações da Análise</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div>
//                   <p className="text-sm font-medium mb-1">Status</p>
//                   <Badge variant={job.status === 'completed' ? 'success' : 'default'}>
//                     {job.status === 'completed' ? 'Concluído' : 
//                      job.status === 'approved' ? 'Aprovado' :
//                      job.status === 'pending_approval' ? 'Aguardando Aprovação' :
//                      job.status}
//                   </Badge>
//                 </div>
                
//                 <div>
//                   <p className="text-sm font-medium mb-1">Tipo de Análise</p>
//                   <p className="text-sm text-muted-foreground">{job.analysisType}</p>
//                 </div>
                
//                 <div>
//                   <p className="text-sm font-medium mb-1">Repositório</p>
//                   <p className="text-sm text-muted-foreground">{job.repository}</p>
//                 </div>
                
//                 {job.branch && (
//                   <div>
//                     <p className="text-sm font-medium mb-1">Branch</p>
//                     <p className="text-sm text-muted-foreground">{job.branch}</p>
//                   </div>
//                 )}
                
//                 <div>
//                   <p className="text-sm font-medium mb-1">Criado em</p>
//                   <p className="text-sm text-muted-foreground">
//                     {job.createdAt.toLocaleDateString('pt-BR')}
//                   </p>
//                 </div>
                
//                 {job.completedAt && (
//                   <div>
//                     <p className="text-sm font-medium mb-1">Concluído em</p>
//                     <p className="text-sm text-muted-foreground">
//                       {job.completedAt.toLocaleDateString('pt-BR')}
//                     </p>
//                   </div>
//                 )}

//                 {job.instructions && (
//                   <div>
//                     <p className="text-sm font-medium mb-1">Instruções</p>
//                     <p className="text-sm text-muted-foreground">{job.instructions}</p>
//                   </div>
//                 )}

//                 <div>
//                   <p className="text-sm font-medium mb-1">Progresso</p>
//                   <p className="text-sm text-muted-foreground">{job.progress}%</p>
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
//                   Relatório de Análise
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {reportContent ? (
//                   <div className="prose prose-sm max-w-none dark:prose-invert">
//                     <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg">
//                       {reportContent}
//                     </pre>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//                     <h3 className="text-lg font-semibold mb-2">Relatório não disponível</h3>
//                     <p className="text-muted-foreground">
//                       O relatório para esta análise ainda não foi gerado ou não está disponível.
//                     </p>
//                     <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
//                       <p className="text-sm text-yellow-800">
//                         <strong>Debug info:</strong> Status do job: {job.status}, 
//                         Tem report: {!!job.report ? 'Sim' : 'Não'}, 
//                         Tem initialReport: {!!job.initialReport ? 'Sim' : 'Não'}
//                       </p>
//                     </div>
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
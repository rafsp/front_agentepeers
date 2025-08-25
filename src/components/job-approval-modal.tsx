// 'use client'

// import React, { useState } from 'react'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { ScrollArea } from '@/components/ui/scroll-area'
// import { CheckCircle, XCircle, FileText, Loader2, AlertCircle, X, Copy, Download, ExternalLink } from 'lucide-react'
// import { Job, useJobStore } from '@/stores/job-store'
// import { useToast } from '@/components/ui/use-toast'

// interface JobApprovalModalProps {
//   job: Job | null
//   isOpen: boolean
//   onClose: () => void
// }

// export const JobApprovalModal: React.FC<JobApprovalModalProps> = ({
//   job,
//   isOpen,
//   onClose
// }) => {
//   const { toast } = useToast()
//   const { approveJob, rejectJob } = useJobStore()
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [action, setAction] = useState<'approve' | 'reject' | null>(null)

//   const handleApprove = async () => {
//     if (!job) return
    
//     setIsProcessing(true)
//     setAction('approve')
    
//     try {
//       await approveJob(job.id)
//       toast({
//         title: 'Análise aprovada!',
//         description: 'O processo de refatoração foi iniciado.',
//       })
//       onClose()
//     } catch (error) {
//       toast({
//         title: 'Erro',
//         description: error instanceof Error ? error.message : 'Erro ao aprovar análise',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsProcessing(false)
//       setAction(null)
//     }
//   }

//   const handleReject = async () => {
//     if (!job) return
    
//     setIsProcessing(true)
//     setAction('reject')
    
//     try {
//       await rejectJob(job.id)
//       toast({
//         title: 'Análise rejeitada',
//         description: 'A análise foi rejeitada e não será processada.',
//       })
//       onClose()
//     } catch (error) {
//       toast({
//         title: 'Erro',
//         description: error instanceof Error ? error.message : 'Erro ao rejeitar análise',
//         variant: 'destructive',
//       })
//     } finally {
//       setIsProcessing(false)
//       setAction(null)
//     }
//   }

//   const handleCopyReport = () => {
//     if (job?.initialReport || job?.report) {
//       navigator.clipboard.writeText(job.initialReport || job.report || '')
//       toast({
//         title: 'Relatório copiado!',
//         description: 'O conteúdo do relatório foi copiado para a área de transferência.',
//       })
//     }
//   }

//   const handleDownloadReport = () => {
//     if (job?.initialReport || job?.report) {
//       const content = job.initialReport || job.report || ''
//       const blob = new Blob([content], { type: 'text/markdown' })
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `analise-${job.repository.replace('/', '-')}-${job.id}.md`
//       document.body.appendChild(a)
//       a.click()
//       document.body.removeChild(a)
//       URL.revokeObjectURL(url)
      
//       toast({
//         title: 'Download iniciado!',
//         description: 'O relatório está sendo baixado.',
//       })
//     }
//   }

//   if (!isOpen || !job) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       {/* Overlay */}
//       <div 
//         className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />
      
//       {/* Modal Content */}
//       <div className="relative bg-background border rounded-xl shadow-xl max-w-5xl w-full mx-4 max-h-[95vh] flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-blue-100 rounded-lg">
//               <FileText className="h-5 w-5 text-blue-600" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-gray-900">Análise Concluída - Aguardando Aprovação</h2>
//               <p className="text-sm text-gray-600">Revise os resultados antes de prosseguir com as implementações</p>
//             </div>
//           </div>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={onClose}
//             className="h-8 w-8 p-0 hover:bg-gray-100"
//           >
//             <X className="h-4 w-4" />
//           </Button>
//         </div>

//         {/* Content Area */}
//         <div className="flex-1 flex min-h-0">
//           {/* Left Panel - Details */}
//           <div className="w-80 border-r bg-gray-50/50 p-6 space-y-6">
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da Análise</h3>
              
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm font-medium text-gray-700">Tipo:</p>
//                   <p className="text-gray-900 font-medium">
//                     {job.analysisType === 'design' ? 'Análise de Design' : 'Relatório de Testes Unitários'}
//                   </p>
//                 </div>
                
//                 <div>
//                   <p className="text-sm font-medium text-gray-700">Repositório:</p>
//                   <p className="text-gray-900 font-mono text-sm">{job.repository}</p>
//                 </div>
                
//                 <div>
//                   <p className="text-sm font-medium text-gray-700">Branch:</p>
//                   <p className="text-gray-900">{job.branch || 'main'}</p>
//                 </div>
                
//                 <div>
//                   <p className="text-sm font-medium text-gray-700">Criado:</p>
//                   <p className="text-gray-900 text-sm">
//                     {job.createdAt.toLocaleDateString('pt-BR')} às{' '}
//                     {job.createdAt.toLocaleTimeString('pt-BR')}
//                   </p>
//                 </div>
                
//                 <div>
//                   <p className="text-sm font-medium text-gray-700 mb-2">Status:</p>
//                   <Badge className="bg-amber-100 text-amber-800 border-amber-200">
//                     <AlertCircle className="h-3 w-3 mr-1" />
//                     Aguardando Aprovação
//                   </Badge>
//                 </div>
                
//                 {job.instructions && (
//                   <div>
//                     <p className="text-sm font-medium text-gray-700">Instruções:</p>
//                     <p className="text-gray-900 text-sm bg-white p-2 rounded border">
//                       {job.instructions}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Ações */}
//             <div>
//               <h4 className="text-sm font-medium text-gray-700 mb-3">Ações</h4>
//               <div className="space-y-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleCopyReport}
//                   className="w-full justify-start"
//                 >
//                   <Copy className="h-4 w-4 mr-2" />
//                   Copiar Relatório
//                 </Button>
                
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={handleDownloadReport}
//                   className="w-full justify-start"
//                 >
//                   <Download className="h-4 w-4 mr-2" />
//                   Download PDF
//                 </Button>
                
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => window.open(`https://github.com/${job.repository}`, '_blank')}
//                   className="w-full justify-start"
//                 >
//                   <ExternalLink className="h-4 w-4 mr-2" />
//                   Ver no GitHub
//                 </Button>
//               </div>
//             </div>
//           </div>

//           {/* Right Panel - Report */}
//           <div className="flex-1 flex flex-col min-h-0">
//             <div className="p-6 border-b bg-white">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <FileText className="h-5 w-5 text-blue-600" />
//                   <h3 className="text-lg font-semibold text-gray-900">Relatório de Análise</h3>
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   {job.analysisType === 'design' ? 'Arquitetura e Design' : 'Cobertura de Testes'}
//                 </div>
//               </div>
//             </div>
            
//             {/* Scrollable Report Content */}
//             <div className="flex-1 p-6 min-h-0">
//               <ScrollArea className="h-full w-full">
//                 {job.initialReport || job.report ? (
//                   <div className="prose prose-sm max-w-none">
//                     <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-gray-50 p-4 rounded-lg border">
//                       {job.initialReport || job.report}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex flex-col items-center justify-center h-64 text-center">
//                     <FileText className="h-16 w-16 text-gray-400 mb-4" />
//                     <h4 className="text-lg font-medium text-gray-900 mb-2">
//                       Relatório não disponível
//                     </h4>
//                     <p className="text-gray-600 max-w-md">
//                       O relatório ainda está sendo gerado ou não foi possível carregar o conteúdo.
//                     </p>
//                   </div>
//                 )}
//               </ScrollArea>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex gap-3 p-6 border-t bg-gray-50/50 rounded-b-xl">
//           <Button
//             variant="outline"
//             onClick={onClose}
//             disabled={isProcessing}
//             className="px-8"
//           >
//             Cancelar
//           </Button>
          
//           <Button
//             variant="destructive"
//             onClick={handleReject}
//             disabled={isProcessing}
//             className="px-8"
//           >
//             {isProcessing && action === 'reject' ? (
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             ) : (
//               <XCircle className="h-4 w-4 mr-2" />
//             )}
//             Rejeitar
//           </Button>
          
//           <Button
//             onClick={handleApprove}
//             disabled={isProcessing}
//             className="px-8 bg-green-600 hover:bg-green-700"
//           >
//             {isProcessing && action === 'approve' ? (
//               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//             ) : (
//               <CheckCircle className="h-4 w-4 mr-2" />
//             )}
//             Aprovar e Continuar
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
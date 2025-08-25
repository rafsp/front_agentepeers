// 'use client'

// import React, { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { Badge } from '@/components/ui/badge'
// import { Textarea } from '@/components/ui/textarea'
// import { Switch } from '@/components/ui/switch'
// import { 
//   ArrowLeft, 
//   Clock, 
//   Plus, 
//   Calendar,
//   Play,
//   Pause,
//   Trash2,
//   GitBranch,
//   FileText,
//   Settings
// } from 'lucide-react'
// import { useScheduledAnalysisStore, useScheduledAnalysisStats } from '@/stores/scheduled-analysis-store'
// import { useCompanyStore } from '@/stores/company-store'
// import { useToast } from '@/components/ui/use-toast'
// import { formatDistanceToNow } from 'date-fns'
// import { ptBR } from 'date-fns/locale'

// export default function ScheduledAnalysesPage() {
//   const router = useRouter()
//   const { toast } = useToast()
//   const { 
//     analyses,
//     addScheduledAnalysis,
//     updateScheduledAnalysis,
//     deleteScheduledAnalysis,
//     toggleAnalysisStatus
//   } = useScheduledAnalysisStore()
//   const { policies } = useCompanyStore()
//   const stats = useScheduledAnalysisStats()

//   const [showNewAnalysisForm, setShowNewAnalysisForm] = useState(false)
//   const [formData, setFormData] = useState({
//     name: '',
//     repository: '',
//     branch: 'main',
//     analysisType: 'design' as const,
//     frequency: 'weekly' as const,
//     customFrequency: 7,
//     instructions: '',
//     attachedPolicies: [] as string[]
//   })

//   const analysesList = Object.values(analyses).sort(
//     (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
//   )

//   const frequencyLabels = {
//     daily: 'Diário',
//     weekly: 'Semanal',
//     biweekly: 'Quinzenal',
//     monthly: 'Mensal',
//     quarterly: 'Trimestral',
//     yearly: 'Anual',
//     custom: 'Personalizado'
//   }

//   const analysisTypeLabels = {
//     design: 'Análise de Design',
//     relatorio_teste_unitario: 'Relatório de Testes',
//     security: 'Análise de Segurança',
//     performance: 'Análise de Performance'
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!formData.name || !formData.repository) {
//       toast({
//         title: 'Campos obrigatórios',
//         description: 'Nome e repositório são obrigatórios.',
//         variant: 'destructive'
//       })
//       return
//     }

//     addScheduledAnalysis({
//       name: formData.name,
//       repository: formData.repository,
//       branch: formData.branch,
//       analysisType: formData.analysisType,
//       frequency: formData.frequency,
//       customFrequency: formData.frequency === 'custom' ? formData.customFrequency : undefined,
//       isActive: true,
//       attachedPolicies: formData.attachedPolicies,
//       instructions: formData.instructions
//     })

//     toast({
//       title: 'Análise agendada',
//       description: `"${formData.name}" foi configurada com sucesso.`,
//     })

//     setShowNewAnalysisForm(false)
//     setFormData({
//       name: '',
//       repository: '',
//       branch: 'main',
//       analysisType: 'design',
//       frequency: 'weekly',
//       customFrequency: 7,
//       instructions: '',
//       attachedPolicies: []
//     })
//   }

//   const handleTogglePolicy = (policyId: string) => {
//     const updatedPolicies = formData.attachedPolicies.includes(policyId)
//       ? formData.attachedPolicies.filter(id => id !== policyId)
//       : [...formData.attachedPolicies, policyId]
    
//     setFormData({ ...formData, attachedPolicies: updatedPolicies })
//   }

//   const handleDeleteAnalysis = (id: string) => {
//     const analysis = analyses[id]
//     if (analysis) {
//       deleteScheduledAnalysis(id)
//       toast({
//         title: 'Análise removida',
//         description: `"${analysis.name}" foi removida.`,
//       })
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="border-b">
//         <div className="container mx-auto px-4 py-4">
//           <Button
//             variant="ghost"
//             onClick={() => router.push('/dashboard/settings')}
//             className="mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Voltar às Configurações
//           </Button>
          
//           <div className="flex justify-between items-center">
//             <div>
//               <div className="flex items-center gap-2 mb-2">
//                 <Calendar className="h-6 w-6" />
//                 <h1 className="text-2xl font-bold">Análises Agendadas</h1>
//               </div>
//               <p className="text-muted-foreground">
//                 Configure análises automáticas para seus repositórios
//               </p>
//             </div>
            
//             <Button onClick={() => setShowNewAnalysisForm(true)}>
//               <Plus className="h-4 w-4 mr-2" />
//               Nova Análise Agendada
//             </Button>
//           </div>
//         </div>
//       </header>

//       <div className="container mx-auto px-4 py-8">
//         {/* Stats */}
//         <div className="grid md:grid-cols-4 gap-6 mb-8">
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">
//                     Total
//                   </p>
//                   <p className="text-2xl font-bold">{stats.total}</p>
//                 </div>
//                 <Calendar className="h-6 w-6 text-blue-600" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">
//                     Ativas
//                   </p>
//                   <p className="text-2xl font-bold">{stats.active}</p>
//                 </div>
//                 <Play className="h-6 w-6 text-green-600" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">
//                     Pendentes
//                   </p>
//                   <p className="text-2xl font-bold">{stats.due}</p>
//                 </div>
//                 <Clock className="h-6 w-6 text-yellow-600" />
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-muted-foreground">
//                     Inativas
//                   </p>
//                   <p className="text-2xl font-bold">{stats.inactive}</p>
//                 </div>
//                 <Pause className="h-6 w-6 text-gray-600" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* New Analysis Form */}
//         {showNewAnalysisForm && (
//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle>Nova Análise Agendada</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-sm font-medium mb-2 block">
//                       Nome da Análise *
//                     </label>
//                     <Input
//                       value={formData.name}
//                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                       placeholder="ex: Análise Semanal do Backend"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium mb-2 block">
//                       Repositório *
//                     </label>
//                     <Input
//                       value={formData.repository}
//                       onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
//                       placeholder="ex: usuario/repositorio"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium mb-2 block">
//                       Branch
//                     </label>
//                     <Input
//                       value={formData.branch}
//                       onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
//                       placeholder="main"
//                     />
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium mb-2 block">
//                       Tipo de Análise
//                     </label>
//                     <Select 
//                       value={formData.analysisType} 
//                       onValueChange={(value: any) => setFormData({ ...formData, analysisType: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="design">Análise de Design</SelectItem>
//                         <SelectItem value="relatorio_teste_unitario">Relatório de Testes</SelectItem>
//                         <SelectItem value="security">Análise de Segurança</SelectItem>
//                         <SelectItem value="performance">Análise de Performance</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div>
//                     <label className="text-sm font-medium mb-2 block">
//                       Frequência
//                     </label>
//                     <Select 
//                       value={formData.frequency} 
//                       onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}
//                     >
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="daily">Diário</SelectItem>
//                         <SelectItem value="weekly">Semanal</SelectItem>
//                         <SelectItem value="biweekly">Quinzenal</SelectItem>
//                         <SelectItem value="monthly">Mensal</SelectItem>
//                         <SelectItem value="quarterly">Trimestral</SelectItem>
//                         <SelectItem value="yearly">Anual</SelectItem>
//                         <SelectItem value="custom">Personalizado</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {formData.frequency === 'custom' && (
//                     <div>
//                       <label className="text-sm font-medium mb-2 block">
//                         Dias entre execuções
//                       </label>
//                       <Input
//                         type="number"
//                         min="1"
//                         value={formData.customFrequency}
//                         onChange={(e) => setFormData({ ...formData, customFrequency: parseInt(e.target.value) || 1 })}
//                       />
//                     </div>
//                   )}
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium mb-2 block">
//                     Instruções Extras
//                   </label>
//                   <Textarea
//                     value={formData.instructions}
//                     onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
//                     placeholder="Instruções específicas para a análise..."
//                     rows={3}
//                   />
//                 </div>

//                 {/* Políticas Anexadas */}
//                 {policies.length > 0 && (
//                   <div>
//                     <label className="text-sm font-medium mb-3 block">
//                       Políticas da Empresa
//                     </label>
//                     <div className="grid md:grid-cols-2 gap-3">
//                       {policies.map((policy) => (
//                         <div 
//                           key={policy.id}
//                           className="flex items-center space-x-2 p-3 border rounded-lg"
//                         >
//                           <input
//                             type="checkbox"
//                             id={policy.id}
//                             checked={formData.attachedPolicies.includes(policy.id)}
//                             onChange={() => handleTogglePolicy(policy.id)}
//                             className="rounded"
//                           />
//                           <label htmlFor={policy.id} className="text-sm font-medium cursor-pointer flex-1">
//                             {policy.name}
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex gap-2">
//                   <Button type="submit">
//                     Criar Análise Agendada
//                   </Button>
//                   <Button 
//                     type="button" 
//                     variant="outline"
//                     onClick={() => setShowNewAnalysisForm(false)}
//                   >
//                     Cancelar
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         )}

//         {/* Analyses List */}
//         {analysesList.length === 0 ? (
//           <Card>
//             <CardContent className="text-center py-8">
//               <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//               <h3 className="text-lg font-semibold mb-2">Nenhuma análise agendada</h3>
//               <p className="text-muted-foreground mb-4">
//                 Configure análises automáticas para seus repositórios.
//               </p>
//               <Button onClick={() => setShowNewAnalysisForm(true)}>
//                 <Plus className="h-4 w-4 mr-2" />
//                 Criar Primeira Análise
//               </Button>
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid gap-4">
//             {analysesList.map((analysis) => (
//               <Card key={analysis.id}>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div>
//                         <CardTitle className="text-lg">{analysis.name}</CardTitle>
//                         <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
//                           <span className="flex items-center gap-1">
//                             <GitBranch className="h-4 w-4" />
//                             {analysis.repository}
//                           </span>
//                           <span>Branch: {analysis.branch}</span>
//                           <span>{analysisTypeLabels[analysis.analysisType]}</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center gap-2">
//                       <Badge variant={analysis.isActive ? 'success' : 'secondary'}>
//                         {analysis.isActive ? 'Ativa' : 'Inativa'}
//                       </Badge>
//                       <Switch
//                         checked={analysis.isActive}
//                         onCheckedChange={() => toggleAnalysisStatus(analysis.id)}
//                       />
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid md:grid-cols-2 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm font-medium mb-1">Frequência</p>
//                       <p className="text-sm text-muted-foreground">
//                         {frequencyLabels[analysis.frequency]}
//                         {analysis.frequency === 'custom' && ` (${analysis.customFrequency} dias)`}
//                       </p>
//                     </div>
                    
//                     <div>
//                       <p className="text-sm font-medium mb-1">Próxima Execução</p>
//                       <p className="text-sm text-muted-foreground">
//                         {formatDistanceToNow(analysis.nextRun, { addSuffix: true, locale: ptBR })}
//                       </p>
//                     </div>
                    
//                     {analysis.lastRun && (
//                       <div>
//                         <p className="text-sm font-medium mb-1">Última Execução</p>
//                         <p className="text-sm text-muted-foreground">
//                           {formatDistanceToNow(analysis.lastRun, { addSuffix: true, locale: ptBR })}
//                         </p>
//                       </div>
//                     )}
                    
//                     {analysis.attachedPolicies.length > 0 && (
//                       <div>
//                         <p className="text-sm font-medium mb-1">Políticas Anexadas</p>
//                         <div className="flex gap-1 flex-wrap">
//                           {analysis.attachedPolicies.map((policyId) => {
//                             const policy = policies.find(p => p.id === policyId)
//                             return policy ? (
//                               <Badge key={policyId} variant="outline" className="text-xs">
//                                 <FileText className="h-3 w-3 mr-1" />
//                                 {policy.name}
//                               </Badge>
//                             ) : null
//                           })}
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {analysis.instructions && (
//                     <div className="mb-4">
//                       <p className="text-sm font-medium mb-1">Instruções</p>
//                       <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
//                         {analysis.instructions}
//                       </p>
//                     </div>
//                   )}

//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => router.push(`/dashboard/new-analysis?scheduled=${analysis.id}`)}
//                     >
//                       <Play className="h-4 w-4 mr-2" />
//                       Executar Agora
//                     </Button>
                    
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {/* TODO: Implementar edição */}}
//                     >
//                       <Settings className="h-4 w-4 mr-2" />
//                       Editar
//                     </Button>
                    
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => handleDeleteAnalysis(analysis.id)}
//                     >
//                       <Trash2 className="h-4 w-4 mr-2" />
//                       Remover
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
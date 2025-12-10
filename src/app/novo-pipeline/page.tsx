// src/app/novo-pipeline/page.tsx
"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { 
  codeAIService, type ProjectSummary, type EpicoItem, type FeatureItem,
  ANALYSIS_TYPE_AGENTS, mapEpicoToFrontend, mapFeatureToFrontend,
} from '@/lib/api/codeai-service'
import { 
  Upload, FileText, CheckCircle, ArrowRight, ThumbsUp, Edit, Save, Calendar, Layers,
  ChevronRight, Bot, X, Play, FolderOpen, Loader2, Zap
} from 'lucide-react'

type PipelineStep = 'input' | 'analysis' | 'refinement' | 'actions' | 'planning' | 'features'

interface Epic {
  id: string; title: string; description: string; profiles: string[]
  estimatedSprints: number; priority: string; selected: boolean
}

interface Feature {
  id: string; epicId: string; code: string; title: string
  description: string; profile: string; days: number; acceptanceCriteria: string[]
}

const STEPS: { key: PipelineStep; label: string; icon: React.ElementType }[] = [
  { key: 'input', label: 'Input', icon: Upload },
  { key: 'analysis', label: 'Análise', icon: Bot },
  { key: 'refinement', label: 'Refinamento', icon: CheckCircle },
  { key: 'actions', label: 'Ações', icon: Zap },
  { key: 'planning', label: 'Planejamento', icon: Calendar },
  { key: 'features', label: 'Features', icon: Layers },
]

function PipelineStepper({ currentStep, completedSteps }: { currentStep: PipelineStep; completedSteps: PipelineStep[] }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep)
  return (
    <div className="flex items-center justify-center gap-4 py-6 px-8">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key)
        const isCurrent = step.key === currentStep
        const isPast = index < currentIndex
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isCurrent ? 'text-white shadow-lg scale-110' : ''}
                ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}`}
                style={isCurrent ? { background: BRAND.info } : {}}>
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>{step.label}</span>
            </div>
            {index < STEPS.length - 1 && <div className={`w-16 h-0.5 mx-2 ${isPast || isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        )
      })}
    </div>
  )
}

function PipelineContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  const [currentStep, setCurrentStep] = useState<PipelineStep>('input')
  const [completedSteps, setCompletedSteps] = useState<PipelineStep[]>([])
  const [userProjects, setUserProjects] = useState<ProjectSummary[]>([])
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState('Epic Generator')
  const [loadingExistingProject, setLoadingExistingProject] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [extraInstructions, setExtraInstructions] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisMessage, setAnalysisMessage] = useState('')
  const [epics, setEpics] = useState<Epic[]>([])
  const [selectedEpics, setSelectedEpics] = useState<string[]>([])
  const [features, setFeatures] = useState<Feature[]>([])
  const [showRefinementModal, setShowRefinementModal] = useState(false)
  const [showFeaturesModal, setShowFeaturesModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showPlanningModal, setShowPlanningModal] = useState(false)
  const [refinementText, setRefinementText] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [planningText, setPlanningText] = useState('')
  const [saveDestination, setSaveDestination] = useState('azure')
  const [isRefining, setIsRefining] = useState(false)
  const [isCreatingPlanning, setIsCreatingPlanning] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) initData()
  }, [isAuthenticated])

  const initData = async () => {
    try {
      const response = await codeAIService.loginDev()
      setUserProjects(response.projects || [])
      
      const urlProjectName = searchParams.get('nome')
      const urlProjectId = searchParams.get('id')
      
      if (urlProjectName && urlProjectId) {
        setProjectName(urlProjectName)
        setProjectId(urlProjectId)
        await loadExistingProject(urlProjectId)
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error)
    }
  }

const loadExistingProject = async (id: string) => {
    setLoadingExistingProject(true)
    try {
      const state = await codeAIService.getProjectReports(id)
      const epicosReport = state.epicos?.epicos_report
      const featuresReport = state.features?.features_report
      
      if (epicosReport && epicosReport.length > 0) {
        const mappedEpics: Epic[] = epicosReport.map(e => ({ ...mapEpicoToFrontend(e), selected: true }))
        setEpics(mappedEpics)
        setSelectedEpics(mappedEpics.map(e => e.id))
        setCompletedSteps(['input', 'analysis'])
        
        if (featuresReport && featuresReport.length > 0) {
          setFeatures(featuresReport.map(f => mapFeatureToFrontend(f)))
          setCompletedSteps(['input', 'analysis', 'refinement', 'actions'])
          setCurrentStep('features')
        } else {
          setCurrentStep('refinement')
        }
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
    } finally {
      setLoadingExistingProject(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.docx') || file.name.endsWith('.pdf') || file.name.endsWith('.txt'))) setUploadedFile(file)
  }

  const handleSelectProject = async (project: ProjectSummary) => {
    setProjectName(project.nome_projeto)
    setProjectId(project.project_id || null)
    setShowProjectModal(false)
    if (project.project_id) await loadExistingProject(project.project_id)
  }

  const startAnalysis = async () => {
    if (!uploadedFile || !projectName.trim()) { alert('Por favor, insira o nome do projeto e faça upload de um arquivo.'); return }
    setIsAnalyzing(true); setCurrentStep('analysis'); setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_epicos_azure_devops'])
    setAnalysisMessage('Enviando arquivo...'); setAnalysisProgress(10)
    try {
      const response = await codeAIService.startAnalysis({ nome_projeto: projectName, analysis_type: 'criacao_epicos_azure_devops', instrucoes_extras: extraInstructions || undefined, arquivo_docx: uploadedFile })
      setProjectId(response.project_id); setAnalysisProgress(30); setAnalysisMessage('Aguardando processamento...')
      const epicosData = await codeAIService.pollForResults(response.project_id, 'epicos', (msg) => { setAnalysisMessage(msg); setAnalysisProgress(prev => Math.min(prev + 5, 90)) }) as EpicoItem[]
      const mappedEpics: Epic[] = epicosData.map(e => ({ ...mapEpicoToFrontend(e), selected: true }))
      setEpics(mappedEpics); setSelectedEpics(mappedEpics.map(e => e.id))
      setCompletedSteps(['input', 'analysis']); setCurrentStep('refinement'); setAnalysisProgress(100)
    } catch (error) {
      console.error('Erro na análise:', error); setAnalysisMessage(`Erro: ${error instanceof Error ? error.message : 'Erro'}`)
    } finally { setIsAnalyzing(false) }
  }

  const handleRefinement = async () => {
    if (!projectId || !refinementText.trim()) { alert('Descreva as alterações.'); return }
    setIsRefining(true); setShowRefinementModal(false); setCurrentStep('analysis')
    setActiveAgent(ANALYSIS_TYPE_AGENTS['refinamento_epicos_azure_devops']); setAnalysisMessage('Refinando...'); setAnalysisProgress(10)
    try {
      await codeAIService.startAnalysis({ nome_projeto: projectName, analysis_type: 'refinamento_epicos_azure_devops', instrucoes_extras: refinementText }); setAnalysisProgress(30)
      const epicosData = await codeAIService.pollForResults(projectId, 'epicos', (msg) => { setAnalysisMessage(msg); setAnalysisProgress(prev => Math.min(prev + 5, 90)) }) as EpicoItem[]
      const mappedEpics: Epic[] = epicosData.map(e => ({ ...mapEpicoToFrontend(e), selected: true }))
      setEpics(mappedEpics); setSelectedEpics(mappedEpics.map(e => e.id)); setCurrentStep('refinement'); setRefinementText('')
    } catch (error) { console.error('Erro no refinamento:', error); setCurrentStep('refinement') }
    finally { setIsRefining(false) }
  }

  const handleCreatePlanning = async () => {
    if (!projectId) return
    setIsCreatingPlanning(true); setShowPlanningModal(false); setCurrentStep('analysis')
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_times_azure_devops']); setAnalysisMessage('Criando planejamento...'); setAnalysisProgress(10)
    try {
      await codeAIService.startAnalysis({ nome_projeto: projectName, analysis_type: 'criacao_times_azure_devops', instrucoes_extras: planningText || undefined }); setAnalysisProgress(40)
      await new Promise(resolve => setTimeout(resolve, 5000))
      await codeAIService.startAnalysis({ nome_projeto: projectName, analysis_type: 'criacao_alocacao_azure_devops', instrucoes_extras: planningText || undefined }); setAnalysisProgress(80)
      await new Promise(resolve => setTimeout(resolve, 5000))
      setCompletedSteps([...completedSteps, 'planning']); setCurrentStep('actions'); setPlanningText(''); alert('✅ Planejamento criado!')
    } catch (error) { console.error('Erro no planejamento:', error); setCurrentStep('actions') }
    finally { setIsCreatingPlanning(false) }
  }

  const startFeatureGeneration = async () => {
    if (!projectId) return
    setShowFeaturesModal(false); setIsAnalyzing(true); setCurrentStep('analysis')
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_features_azure_devops']); setAnalysisMessage('Criando features...'); setAnalysisProgress(10)
    try {
      await codeAIService.startAnalysis({ nome_projeto: projectName, analysis_type: 'criacao_features_azure_devops', instrucoes_extras: featuresText || undefined }); setAnalysisProgress(30)
      const featuresData = await codeAIService.pollForResults(projectId, 'features', (msg) => { setAnalysisMessage(msg); setAnalysisProgress(prev => Math.min(prev + 5, 90)) }) as FeatureItem[]
      setFeatures(featuresData.map(f => mapFeatureToFrontend(f)))
      setCompletedSteps([...completedSteps, 'actions', 'planning', 'features']); setCurrentStep('features')
    } catch (error) { console.error('Erro nas features:', error) }
    finally { setIsAnalyzing(false) }
  }

  const handleApproveEpics = () => { setCompletedSteps([...completedSteps, 'refinement']); setCurrentStep('actions') }
  const toggleEpicSelection = (epicId: string) => { setSelectedEpics(prev => prev.includes(epicId) ? prev.filter(id => id !== epicId) : [...prev, epicId]) }

  const handleSaveProject = async () => {
    if (!projectId) return
    try { await codeAIService.saveProjectState(projectId); setShowSaveModal(false); alert('Projeto salvo!') }
    catch (error) { alert(`Erro: ${error instanceof Error ? error.message : 'Erro'}`) }
  }

  if (authLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>

  const renderContent = () => {
    if (loadingExistingProject) return <div className="max-w-md mx-auto text-center py-12"><Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" /><h2 className="text-xl font-bold text-gray-900 mb-2">Carregando projeto...</h2></div>

    switch (currentStep) {
      case 'input':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8"><h2 className="text-2xl font-bold text-gray-900 mb-2">Vamos começar o planejamento</h2><p className="text-gray-500">Faça upload da transcrição (PDF, DOCX, TXT).</p></div>
            <div className="mb-6">
              <Label htmlFor="projectName">Nome do Projeto *</Label>
              <div className="flex gap-2 mt-1">
                <Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ex: Sistema de Gestão" />
                {userProjects.length > 0 && <Button variant="outline" onClick={() => setShowProjectModal(true)} title="Projetos existentes"><FolderOpen className="w-4 h-4" /></Button>}
              </div>
            </div>
            <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input id="file-upload" type="file" accept=".docx,.pdf,.txt" onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} className="hidden" />
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: BRAND.accent }}><Upload className="w-8 h-8" style={{ color: BRAND.info }} /></div>
              <p className="text-gray-700 font-medium mb-1">Clique ou arraste o arquivo aqui</p><p className="text-sm text-gray-400">Suporta PDF, DOCX ou TXT</p>
            </div>
            <div className="mt-6"><Label htmlFor="instructions">Instruções extras (opcional)</Label><Textarea id="instructions" value={extraInstructions} onChange={(e) => setExtraInstructions(e.target.value)} placeholder="Ex: Foque em épicos de vendas..." rows={3} className="mt-1" /></div>
            {uploadedFile && (
              <div className="mt-6 p-4 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${BRAND.info}15` }}><FileText className="w-5 h-5" style={{ color: BRAND.info }} /></div>
                    <div><p className="font-medium text-gray-900">{uploadedFile.name}</p><p className="text-sm text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p></div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}><X className="w-4 h-4" /></Button>
                    <Button onClick={startAnalysis} disabled={!projectName.trim()} className="text-white" style={{ background: BRAND.info }}><ArrowRight className="w-4 h-4 mr-2" />Iniciar Análise</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'analysis':
        return (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: `${BRAND.info}15` }}><Bot className="w-10 h-10" style={{ color: BRAND.info }} /></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{activeAgent} está processando...</h2>
            <p className="text-gray-500 mb-6">{analysisMessage}</p>
            <Progress value={analysisProgress} className="h-2" /><p className="text-sm text-gray-400 mt-2">{analysisProgress}%</p>
          </div>
        )

      case 'refinement':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6"><h2 className="text-xl font-bold text-gray-900">Revisão de Épicos</h2><p className="text-gray-500">Verifique as sugestões antes de aprovar.</p></div>
            <Card className="border shadow-sm">
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
                  <div className="col-span-1"><Checkbox checked={selectedEpics.length === epics.length} onCheckedChange={() => setSelectedEpics(selectedEpics.length === epics.length ? [] : epics.map(e => e.id))} /></div>
                  <div className="col-span-6">Épico</div><div className="col-span-3">Prioridade</div><div className="col-span-2">Estimativa</div>
                </div>
                {epics.length === 0 ? <div className="p-8 text-center text-gray-500">Nenhum épico encontrado</div> : epics.map(epic => (
                  <div key={epic.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b last:border-0 items-center hover:bg-gray-50">
                    <div className="col-span-1"><Checkbox checked={selectedEpics.includes(epic.id)} onCheckedChange={() => toggleEpicSelection(epic.id)} /></div>
                    <div className="col-span-6"><p className="font-medium text-gray-900">{epic.title}</p><p className="text-sm text-gray-500">{epic.description}</p></div>
                    <div className="col-span-3"><Badge variant="outline" className={epic.priority === 'Alta' ? 'text-red-600 border-red-200 bg-red-50' : epic.priority === 'Media' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 'text-green-600 border-green-200 bg-green-50'}>{epic.priority}</Badge></div>
                    <div className="col-span-2"><Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{epic.estimatedSprints} Sprints</Badge></div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowRefinementModal(true)} disabled={isRefining}>{isRefining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Edit className="w-4 h-4 mr-2" />}Refinamento</Button>
              <Button onClick={handleApproveEpics} disabled={selectedEpics.length === 0} className="text-white" style={{ background: BRAND.success }}><ThumbsUp className="w-4 h-4 mr-2" />Aprovar ({selectedEpics.length})</Button>
            </div>
          </div>
        )

      case 'actions':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6"><h2 className="text-xl font-bold text-gray-900">Épicos Aprovados</h2><p className="text-gray-500">Selecione uma ação para prosseguir.</p></div>
            <Card className="border shadow-sm mb-6">
              <CardContent className="p-4">
                {epics.filter(e => selectedEpics.includes(e.id)).map(epic => (
                  <div key={epic.id} className="flex items-center justify-between py-2 border-b last:border-0"><div><p className="font-medium">{epic.title}</p><p className="text-sm text-gray-500">{epic.description}</p></div><Badge variant="outline">{epic.estimatedSprints} Sprints</Badge></div>
                ))}
              </CardContent>
            </Card>
            <div className="grid grid-cols-3 gap-4">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md" onClick={() => setShowSaveModal(true)}>
                <CardContent className="p-5"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}><Save className="w-6 h-6" style={{ color: BRAND.info }} /></div><div className="flex-1"><p className="font-semibold text-gray-900">Salvar Épicos</p><p className="text-xs text-gray-500">Azure Blob</p></div><ChevronRight className="w-5 h-5 text-gray-300" /></div></CardContent>
              </Card>
              <Card className="border shadow-sm cursor-pointer hover:shadow-md" onClick={() => setShowPlanningModal(true)}>
                <CardContent className="p-5"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}><Calendar className="w-6 h-6" style={{ color: BRAND.info }} /></div><div className="flex-1"><p className="font-semibold text-gray-900">Criar Planejamento</p><p className="text-xs text-gray-500">Squads</p></div><ChevronRight className="w-5 h-5 text-gray-300" /></div></CardContent>
              </Card>
              <Card className="border shadow-sm cursor-pointer hover:shadow-md" onClick={() => setShowFeaturesModal(true)}>
                <CardContent className="p-5"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}><Layers className="w-6 h-6" style={{ color: BRAND.info }} /></div><div className="flex-1"><p className="font-semibold text-gray-900">Criar Features</p><p className="text-xs text-gray-500">Detalhamento</p></div><ChevronRight className="w-5 h-5 text-gray-300" /></div></CardContent>
              </Card>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setCurrentStep('actions')} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight className="w-5 h-5 text-gray-400 rotate-180" /></button>
              <div><h2 className="text-xl font-bold text-gray-900">Detalhamento de Features</h2><p className="text-gray-500">Features prontas para desenvolvimento.</p></div>
            </div>
            {epics.filter(e => selectedEpics.includes(e.id)).map(epic => {
              const epicFeatures = features.filter(f => f.epicId === epic.id)
              return (
                <Card key={epic.id} className="border shadow-sm mb-6">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div><Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 mb-1">{epicFeatures.length} Features</Badge><CardTitle className="text-base">{epic.title}</CardTitle></div>
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{epic.estimatedSprints} Sprints</Badge>
                    </div>
                  </CardHeader>
                  {epicFeatures.length > 0 && (
                    <CardContent><div className="grid grid-cols-3 gap-4">
                      {epicFeatures.map(feature => (
                        <Card key={feature.id} className="border bg-white"><CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3"><span className="text-xs text-gray-400">{feature.code}</span><Badge variant="outline" className="text-xs">{feature.days} Dias</Badge></div>
                          <h4 className="font-semibold text-gray-900 mb-2 text-sm">{feature.title}</h4><p className="text-xs text-gray-500">{feature.description}</p>
                        </CardContent></Card>
                      ))}
                    </div></CardContent>
                  )}
                </Card>
              )
            })}
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowRefinementModal(true)}><Edit className="w-4 h-4 mr-2" />Refinamento</Button>
              <Button className="text-white" style={{ background: BRAND.info }} onClick={() => setShowSaveModal(true)}><Save className="w-4 h-4 mr-2" />Salvar Features</Button>
            </div>
          </div>
        )

      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="novo-pipeline" user={{ name: user.name, email: user.email }} onLogout={logout} />
      <div className="ml-56">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">{projectName || 'Novo Pipeline'}</h1>
              {projectId && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{projectId.slice(0, 8)}...</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-500">Agente:</span><span className="text-sm font-semibold" style={{ color: BRAND.info }}>{activeAgent}</span>
            </div>
          </div>
        </header>
        <div className="bg-white border-b"><PipelineStepper currentStep={currentStep} completedSteps={completedSteps} /></div>
        <main className="p-8">{renderContent()}</main>
      </div>

      {/* MODALS */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent><DialogHeader><DialogTitle>Selecionar Projeto</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userProjects.map((project) => (
              <div key={project.project_id || project.nome_projeto} onClick={() => handleSelectProject(project)} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <FolderOpen className="w-5 h-5 text-indigo-500" /><div className="flex-1"><p className="font-medium">{project.nome_projeto}</p><p className="text-xs text-gray-500">{project.ultima_analysis_type || 'Sem análises'}</p></div>
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowProjectModal(false)}>Cancelar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRefinementModal} onOpenChange={setShowRefinementModal}>
        <DialogContent><DialogHeader><DialogTitle>{currentStep === 'features' ? 'Refinamento de Features' : 'Refinamento de Épicos'}</DialogTitle></DialogHeader>
          <Textarea placeholder="Descreva as alterações..." value={refinementText} onChange={(e) => setRefinementText(e.target.value)} rows={5} />
          <DialogFooter><Button variant="outline" onClick={() => setShowRefinementModal(false)}>Cancelar</Button><Button onClick={handleRefinement} disabled={!refinementText.trim()} className="text-white" style={{ background: BRAND.success }}><Play className="w-4 h-4 mr-2" />Refinar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlanningModal} onOpenChange={setShowPlanningModal}>
        <DialogContent><DialogHeader><DialogTitle>Criar Planejamento</DialogTitle></DialogHeader>
          <Textarea placeholder="Instruções (opcional)..." value={planningText} onChange={(e) => setPlanningText(e.target.value)} rows={4} />
          <DialogFooter><Button variant="outline" onClick={() => setShowPlanningModal(false)}>Cancelar</Button><Button onClick={handleCreatePlanning} className="text-white" style={{ background: BRAND.info }}><Play className="w-4 h-4 mr-2" />Criar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
        <DialogContent><DialogHeader><DialogTitle>Criar Features</DialogTitle></DialogHeader>
          <Textarea placeholder="Instruções (opcional)..." value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} rows={5} />
          <DialogFooter><Button variant="outline" onClick={() => setShowFeaturesModal(false)}>Cancelar</Button><Button onClick={startFeatureGeneration} className="text-white" style={{ background: BRAND.info }}><Play className="w-4 h-4 mr-2" />Criar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent><DialogHeader><DialogTitle>Salvar Projeto</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {['azure', 'jira', 'excel'].map(opt => (
              <div key={opt} onClick={() => setSaveDestination(opt)} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${saveDestination === opt ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}`}>
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">{opt === 'azure' ? 'A' : opt === 'jira' ? 'J' : 'E'}</div>
                <p className="font-medium">{opt === 'azure' ? 'Azure DevOps' : opt === 'jira' ? 'Jira' : 'Excel'}</p>
              </div>
            ))}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancelar</Button><Button onClick={handleSaveProject} className="text-white" style={{ background: BRAND.info }}>Confirmar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function NovoPipelinePage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}><PipelineContent /></Suspense>
}
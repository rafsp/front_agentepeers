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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { 
  codeAIService, 
  type ProjectSummary, 
  type EpicoItem, 
  type FeatureItem,
  ANALYSIS_TYPE_AGENTS, 
} from '@/lib/api/codeai-service'
import { BacklogEpicos, type EpicoFromAPI } from '@/components/epicos/backlog-epicos'
import { BacklogFeatures, type FeatureFromAPI } from '@/components/features/backlog-features'
import { GestaoRiscosPremissas, type PremissasRiscosFromAPI, type PremissaFromAPI, type RiscoFromAPI } from '@/components/riscos/gestao-riscos-premissas'
import { CronogramaExecutivo, type CronogramaFromAPI } from '@/components/cronograma/cronograma-executivo'
import { 
  Upload, FileText, CheckCircle, ArrowRight, Bot, X, Play, FolderOpen, Loader2, Zap,
  AlertTriangle, RefreshCw, Save, Calendar, Layers, ChevronRight, Shield, GanttChart, Plus
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

type PipelineStep = 'input' | 'analysis' | 'refinement' | 'actions' | 'planning' | 'features' | 'riscos' | 'cronograma'

const STEPS: { key: PipelineStep; label: string; icon: React.ElementType }[] = [
  { key: 'input', label: 'Input', icon: Upload },
  { key: 'analysis', label: 'Análise', icon: Bot },
  { key: 'refinement', label: 'Refinamento', icon: CheckCircle },
  { key: 'actions', label: 'Ações', icon: Zap },
  { key: 'planning', label: 'Planejamento', icon: Calendar },
  { key: 'features', label: 'Features', icon: Layers },
  { key: 'riscos', label: 'Riscos', icon: Shield },
  { key: 'cronograma', label: 'Cronograma', icon: GanttChart },
]

// ============================================================================
// HELPERS
// ============================================================================

function isMCPError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return msg.includes('mcp') || msg.includes('502') || msg.includes('503') || msg.includes('inteligência')
  }
  return false
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (isMCPError(error)) {
      return '⚠️ Servidor de IA temporariamente indisponível. Aguarde alguns minutos e tente novamente.'
    }
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return '🔌 Erro de conexão com o servidor. Verifique sua internet.'
    }
    if (error.message.includes('HTTP')) {
      return `❌ ${error.message}`
    }
    return error.message
  }
  return 'Erro desconhecido'
}

// Converte épico da API para o formato do componente BacklogEpicos
function mapApiEpicoToComponent(epico: any): EpicoFromAPI {
  return {
    id: String(epico.id),
    titulo: epico.titulo,
    descricao: epico.descricao,
    prioridade: epico.prioridade,
    estimativa_sprints: epico.estimativa_sprints,
    perfis: epico.perfis,
    resumo_valor: epico.resumo_valor,
    business_case: epico.business_case,
    entregaveis_macro: epico.entregaveis_macro,
    estimativa_semanas: epico.estimativa_semanas,
    prioridade_estrategica: epico.prioridade_estrategica,
    squad_sugerida: epico.squad_sugerida,
  }
}

// ============================================================================
// STEPPER COMPONENT
// ============================================================================

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
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'text-white shadow-lg scale-110' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-100 text-gray-400' : ''}`}
                style={isCurrent ? { background: BRAND.info } : {}}
              >
                {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 ${isPast || isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function PipelineContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  // Estados principais
  const [currentStep, setCurrentStep] = useState<PipelineStep>('input')
  const [completedSteps, setCompletedSteps] = useState<PipelineStep[]>([])
  const [userProjects, setUserProjects] = useState<ProjectSummary[]>([])
  const [projectName, setProjectName] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [activeAgent, setActiveAgent] = useState('Epic Generator Agent')
  const [loadingExistingProject, setLoadingExistingProject] = useState(false)
  
  // Estados de input
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [extraInstructions, setExtraInstructions] = useState('')
  
  // Estados de análise
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisMessage, setAnalysisMessage] = useState('')
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  
  // Estados de dados - ÉPICOS COMPLETOS DA API
  const [epicosFromAPI, setEpicosFromAPI] = useState<EpicoFromAPI[]>([])
  const [selectedEpicIds, setSelectedEpicIds] = useState<string[]>([])
  const [featuresFromAPI, setFeaturesFromAPI] = useState<FeatureFromAPI[]>([])
  const [premissasRiscosFromAPI, setPremissasRiscosFromAPI] = useState<PremissasRiscosFromAPI | null>(null)
  const [cronogramaFromAPI, setCronogramaFromAPI] = useState<CronogramaFromAPI | null>(null)
  
  // Estados de modais
  const [showRefinementModal, setShowRefinementModal] = useState(false)
  const [showFeaturesModal, setShowFeaturesModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showPlanningModal, setShowPlanningModal] = useState(false)
  const [showRiscosModal, setShowRiscosModal] = useState(false)
  const [showCronogramaModal, setShowCronogramaModal] = useState(false)
  
  // Estados de texto dos modais
  const [refinementText, setRefinementText] = useState('')
  const [featuresText, setFeaturesText] = useState('')
  const [planningText, setPlanningText] = useState('')
  const [riscosText, setRiscosText] = useState('')
  const [cronogramaText, setCronogramaText] = useState('')
  const [saveDestination, setSaveDestination] = useState('azure')
  
  // Estados de loading
  const [isRefining, setIsRefining] = useState(false)
  const [isCreatingPlanning, setIsCreatingPlanning] = useState(false)
  const [isCreatingRiscos, setIsCreatingRiscos] = useState(false)
  const [isCreatingCronograma, setIsCreatingCronograma] = useState(false)

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) initData()
  }, [isAuthenticated])

  // ============================================================================
  // INICIALIZAÇÃO
  // ============================================================================

  const initData = async () => {
    try {
      const response = await codeAIService.loginDev()
      setUserProjects(response.projects || [])
      
      const urlProjectName = searchParams.get('nome')
      const urlProjectId = searchParams.get('id')
      
      if (urlProjectName && urlProjectId) {
        setProjectName(urlProjectName)
        setProjectId(urlProjectId)
        // Passa o nome diretamente pois o state ainda não foi atualizado
        await loadExistingProject(urlProjectId, urlProjectName)
      }
    } catch (error) {
      console.error('Erro ao inicializar:', error)
    }
  }

  const loadExistingProject = async (id: string, nome?: string) => {
    setLoadingExistingProject(true)
    try {
      // Usa o nome passado ou o do state
      const projectNameToUse = nome || projectName
      
      // Primeiro tenta pelo ID (se tiver job_id em memória)
      let state = await codeAIService.getProjectReports(id)
      
      // Se não retornou dados, tenta pelo nome do projeto
      if (!state.epicos && !state.features && projectNameToUse) {
        console.log('📂 Tentando carregar projeto pelo nome:', projectNameToUse)
        state = await codeAIService.getProjectReportsByName(projectNameToUse)
      }
      
      console.log('📊 Estado carregado:', {
        epicos: state.epicos?.epicos_report?.length || 0,
        features: state.features?.features_report?.length || 0,
        premissas_riscos: state.premissas_riscos ? 'SIM' : 'NÃO',
        timeline: state.epicos_timeline ? 'SIM' : 'NÃO',
      })
      
      // ========== CARREGAR ÉPICOS ==========
      const epicosReport = state.epicos?.epicos_report
      let hasEpicos = false
      
      if (epicosReport && epicosReport.length > 0) {
        const mappedEpicos = epicosReport.map((e: any) => mapApiEpicoToComponent(e))
        setEpicosFromAPI(mappedEpicos)
        setSelectedEpicIds(mappedEpicos.map(e => e.id))
        setCompletedSteps(['input', 'analysis'])
        hasEpicos = true
        console.log('✅ Épicos carregados:', mappedEpicos.length)
      }
      
      // ========== CARREGAR FEATURES ==========
      const featuresReport = state.features?.features_report
      let hasFeatures = false
      
      if (featuresReport && featuresReport.length > 0) {
        setFeaturesFromAPI(featuresReport.map((f: any) => ({
          id: String(f.id),
          epic_id: String(f.epic_id),
          titulo: f.titulo,
          descricao: f.descricao,
          criterios_aceite: f.criterios_aceite || [],
          tipo: f.tipo,
          complexidade: f.complexidade,
        })))
        hasFeatures = true
        console.log('✅ Features carregadas:', featuresReport.length)
      }
      
      // ========== CARREGAR RISCOS E PREMISSAS ==========
      const premissasRiscosData = state.premissas_riscos as any
      let hasRiscos = false
      
      if (premissasRiscosData) {
        let premissasArray: any[] = []
        let riscosArray: any[] = []
        
        if (premissasRiscosData.premissas) {
          premissasArray = premissasRiscosData.premissas
          riscosArray = premissasRiscosData.riscos || []
        } else if (premissasRiscosData.premissas_riscos_report) {
          const report = premissasRiscosData.premissas_riscos_report[0] || {}
          premissasArray = report.premissas || []
          riscosArray = report.riscos || []
        } else if (Array.isArray(premissasRiscosData) && premissasRiscosData.length > 0) {
          const firstItem = premissasRiscosData[0]
          premissasArray = firstItem.premissas || []
          riscosArray = firstItem.riscos || []
        }
        
        if (premissasArray.length > 0 || riscosArray.length > 0) {
          setPremissasRiscosFromAPI({
            premissas: premissasArray.map((p: any) => ({
              id: String(p.id),
              descricao: p.descricao,
              impacto_se_falhar: p.impacto_se_falhar,
            })),
            riscos: riscosArray.map((r: any) => ({
              id: String(r.id),
              descricao: r.descricao,
              probabilidade: r.probabilidade as 'Alta' | 'Média' | 'Baixa',
              impacto: r.impacto as 'Crítico' | 'Alto' | 'Médio' | 'Baixo',
              plano_mitigacao: r.plano_mitigacao,
            })),
          })
          hasRiscos = true
          console.log('✅ Riscos carregados:', premissasArray.length, 'premissas,', riscosArray.length, 'riscos')
        }
      }
      
      // ========== CARREGAR CRONOGRAMA ==========
      const timelineData = state.epicos_timeline as any
      let hasCronograma = false
      
      if (timelineData) {
        let timelineReport: any[] = []
        
        if (timelineData.epicos_timeline_report) {
          timelineReport = timelineData.epicos_timeline_report
        } else if (Array.isArray(timelineData)) {
          timelineReport = timelineData
        }
        
        if (timelineReport.length > 0) {
          setCronogramaFromAPI({ epicos_timeline_report: timelineReport })
          hasCronograma = true
          console.log('✅ Cronograma carregado:', timelineReport.length, 'items')
        }
      }
      
      // ========== DEFINIR STEP INICIAL E STEPS COMPLETADOS ==========
      console.log('📋 Resumo:', { hasEpicos, hasFeatures, hasRiscos, hasCronograma })
      
      const completedStepsArr: PipelineStep[] = ['input', 'analysis']
      
      if (hasEpicos) {
        completedStepsArr.push('refinement')
      }
      if (hasFeatures) {
        completedStepsArr.push('actions', 'features')
      }
      if (hasRiscos) {
        completedStepsArr.push('riscos')
      }
      if (hasCronograma) {
        completedStepsArr.push('cronograma')
      }
      
      setCompletedSteps(completedStepsArr)
      
      // Definir step inicial - ir para o PRÓXIMO passo pendente
      let nextStep: PipelineStep = 'input'
      
      if (hasCronograma && hasRiscos && hasFeatures) {
        // Tudo completo - mostrar cronograma
        nextStep = 'cronograma'
      } else if (hasRiscos && hasFeatures) {
        // Tem riscos e features mas não cronograma - ir para actions para criar cronograma
        nextStep = 'actions'
      } else if (hasFeatures) {
        // Tem features mas não riscos - ir para actions para criar riscos
        nextStep = 'actions'
      } else if (hasEpicos) {
        // Tem épicos mas não features - ir para Actions para criar features
        nextStep = 'actions'
      }
      
      console.log('🎯 Próximo step:', nextStep)
      setCurrentStep(nextStep)
      
    } catch (error) {
      console.error('Erro ao carregar projeto:', error)
    } finally {
      setLoadingExistingProject(false)
    }
  }

  // ============================================================================
  // HANDLERS DE INPUT
  // ============================================================================

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.docx') || file.name.endsWith('.pdf') || file.name.endsWith('.txt'))) {
      setUploadedFile(file)
    }
  }

  const handleSelectProject = async (project: ProjectSummary) => {
    setProjectName(project.nome_projeto)
    setProjectId(project.project_id || null)
    setShowProjectModal(false)
    if (project.project_id) await loadExistingProject(project.project_id, project.nome_projeto)
  }

  // ============================================================================
  // HANDLERS DE ANÁLISE
  // ============================================================================

  const cancelAnalysis = () => {
    setIsAnalyzing(false)
    setAnalysisError(null)
    setAnalysisProgress(0)
    setAnalysisMessage('')
    setCurrentStep('input')
  }

  const startAnalysis = async () => {
    if (!uploadedFile || !projectName.trim()) { 
      alert('Por favor, insira o nome do projeto e faça upload de um arquivo.')
      return 
    }
    
    setIsAnalyzing(true)
    setAnalysisError(null)
    setCurrentStep('analysis')
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_epicos_azure_devops'])
    setAnalysisMessage('Enviando arquivo...')
    setAnalysisProgress(10)
    
    try {
      const response = await codeAIService.startAnalysis({ 
        nome_projeto: projectName, 
        analysis_type: 'criacao_epicos_azure_devops', 
        instrucoes_extras: extraInstructions || undefined, 
        arquivo_docx: uploadedFile 
      })
      
      setProjectId(response.project_id)
      setAnalysisProgress(30)
      setAnalysisMessage('Aguardando processamento da IA...')
      
      const epicosData = await codeAIService.pollForResults(
        response.project_id, 
        'epicos', 
        (msg) => { 
          setAnalysisMessage(msg)
          setAnalysisProgress(prev => Math.min(prev + 5, 90)) 
        },
        60,
        5000,
        projectName // Nome do projeto para fallback
      ) as EpicoItem[]
      
      const mappedEpicos = epicosData.map(e => mapApiEpicoToComponent(e))
      setEpicosFromAPI(mappedEpicos)
      setSelectedEpicIds(mappedEpicos.map(e => e.id))
      setCompletedSteps(['input', 'analysis'])
      setCurrentStep('refinement')
      setAnalysisProgress(100)
      
    } catch (error) {
      console.error('Erro na análise:', error)
      setAnalysisError(getErrorMessage(error))
    } finally {
      setIsAnalyzing(false)
    }
  }

  // ============================================================================
  // HANDLERS DE REFINAMENTO E AÇÕES
  // ============================================================================

  const handleRefinement = async () => {
    if (!projectId || !refinementText.trim()) { 
      alert('Descreva as alterações.')
      return 
    }
    
    setIsRefining(true)
    setShowRefinementModal(false)
    setCurrentStep('analysis')
    setAnalysisError(null)
    setActiveAgent(ANALYSIS_TYPE_AGENTS['refinamento_epicos_azure_devops'])
    setAnalysisMessage('Refinando épicos...')
    setAnalysisProgress(10)
    
    try {
      await codeAIService.startAnalysis({ 
        nome_projeto: projectName, 
        analysis_type: 'refinamento_epicos_azure_devops', 
        instrucoes_extras: refinementText 
      })
      setAnalysisProgress(30)
      
      const epicosData = await codeAIService.pollForResults(
        projectId, 
        'epicos', 
        (msg) => { 
          setAnalysisMessage(msg)
          setAnalysisProgress(prev => Math.min(prev + 5, 90)) 
        },
        60,
        5000,
        projectName
      ) as EpicoItem[]
      
      const mappedEpicos = epicosData.map(e => mapApiEpicoToComponent(e))
      setEpicosFromAPI(mappedEpicos)
      setSelectedEpicIds(mappedEpicos.map(e => e.id))
      setCurrentStep('refinement')
      setRefinementText('')
      
    } catch (error) { 
      console.error('Erro no refinamento:', error)
      setAnalysisError(getErrorMessage(error))
      setCurrentStep('refinement') 
    } finally { 
      setIsRefining(false) 
    }
  }

  const handleApproveEpics = () => { 
    setCompletedSteps(prev => [...prev.filter(s => s !== 'refinement'), 'refinement'])
    setCurrentStep('actions') 
  }

  const handleCreatePlanning = async () => {
    if (!projectId) return
    
    setIsCreatingPlanning(true)
    setShowPlanningModal(false)
    setCurrentStep('analysis')
    setAnalysisError(null)
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_times_azure_devops'])
    setAnalysisMessage('Criando planejamento...')
    setAnalysisProgress(10)
    
    try {
      await codeAIService.startAnalysis({ 
        nome_projeto: projectName, 
        analysis_type: 'criacao_times_azure_devops', 
        instrucoes_extras: planningText || undefined 
      })
      setAnalysisProgress(50)
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      setCompletedSteps(prev => [...prev.filter(s => s !== 'planning'), 'planning'])
      setCurrentStep('actions')
      setPlanningText('')
      alert('✅ Planejamento criado!')
      
    } catch (error) { 
      console.error('Erro no planejamento:', error)
      setAnalysisError(getErrorMessage(error))
      setCurrentStep('actions') 
    } finally { 
      setIsCreatingPlanning(false) 
    }
  }

  const startFeatureGeneration = async () => {
    if (!projectId) return
    
    setShowFeaturesModal(false)
    setIsAnalyzing(true)
    setCurrentStep('analysis')
    setAnalysisError(null)
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_features_azure_devops'])
    setAnalysisMessage('Criando features...')
    setAnalysisProgress(10)
    
    try {
      await codeAIService.startAnalysis({ 
        nome_projeto: projectName, 
        analysis_type: 'criacao_features_azure_devops', 
        instrucoes_extras: featuresText || undefined 
      })
      setAnalysisProgress(30)
      
      const featuresData = await codeAIService.pollForResults(
        projectId, 
        'features', 
        (msg) => { 
          setAnalysisMessage(msg)
          setAnalysisProgress(prev => Math.min(prev + 5, 90)) 
        },
        60,
        5000,
        projectName
      ) as any[]
      
      // API já retorna no formato correto, apenas garantir tipos
      setFeaturesFromAPI(featuresData.map((f: any) => ({
        id: String(f.id),
        epic_id: String(f.epic_id),
        titulo: f.titulo,
        descricao: f.descricao,
        criterios_aceite: f.criterios_aceite || [],
        tipo: f.tipo,
        complexidade: f.complexidade,
      })))
      setCompletedSteps(prev => [...prev.filter(s => !['actions', 'features'].includes(s)), 'actions', 'features'])
      setCurrentStep('features')
      
    } catch (error) { 
      console.error('Erro nas features:', error)
      setAnalysisError(getErrorMessage(error))
    } finally { 
      setIsAnalyzing(false) 
    }
  }

  // ==================== GERAÇÃO DE RISCOS E PREMISSAS ====================
  const startRiscosGeneration = async () => {
    if (!projectId) return
    
    setShowRiscosModal(false)
    setIsAnalyzing(true)
    setIsCreatingRiscos(true)
    setCurrentStep('analysis')
    setAnalysisError(null)
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_premissas_azure_devops'] || 'Risk Analysis Agent')
    setAnalysisMessage('Analisando riscos e premissas...')
    setAnalysisProgress(10)
    
    try {
      await codeAIService.startAnalysis({ 
        nome_projeto: projectName, 
        analysis_type: 'criacao_premissas_riscos', 
        instrucoes_extras: riscosText || undefined 
      })
      setAnalysisProgress(30)
      
      const riscosData = await codeAIService.pollForResults(
        projectId, 
        'premissas', 
        (msg) => { 
          setAnalysisMessage(msg)
          setAnalysisProgress(prev => Math.min(prev + 5, 90)) 
        },
        60,
        5000,
        projectName
      ) as any
      
      // A API retorna { premissas_riscos_report: [...] } ou diretamente { premissas: [...], riscos: [...] }
      // Precisamos tratar ambos os casos
      let premissasArray: any[] = []
      let riscosArray: any[] = []
      
      if (riscosData) {
        // Se veio como objeto direto com premissas e riscos
        if (riscosData.premissas) {
          premissasArray = riscosData.premissas
          riscosArray = riscosData.riscos || []
        }
        // Se veio como premissas_riscos_report (array)
        else if (riscosData.premissas_riscos_report) {
          const report = riscosData.premissas_riscos_report[0] || {}
          premissasArray = report.premissas || []
          riscosArray = report.riscos || []
        }
        // Se é um array direto
        else if (Array.isArray(riscosData) && riscosData.length > 0) {
          const firstItem = riscosData[0]
          premissasArray = firstItem.premissas || []
          riscosArray = firstItem.riscos || []
        }
      }
      
      // Mapear dados para o formato do componente
      const premissasRiscos: PremissasRiscosFromAPI = {
        premissas: premissasArray.map((p: any) => ({
          id: String(p.id),
          descricao: p.descricao,
          impacto_se_falhar: p.impacto_se_falhar,
        })),
        riscos: riscosArray.map((r: any) => ({
          id: String(r.id),
          descricao: r.descricao,
          probabilidade: r.probabilidade as 'Alta' | 'Média' | 'Baixa',
          impacto: r.impacto as 'Crítico' | 'Alto' | 'Médio' | 'Baixo',
          plano_mitigacao: r.plano_mitigacao,
        })),
      }
      
      setPremissasRiscosFromAPI(premissasRiscos)
      setCompletedSteps(prev => [...prev.filter(s => s !== 'riscos'), 'actions'])
      setCurrentStep('riscos')
      
    } catch (error) { 
      console.error('Erro nos riscos:', error)
      setAnalysisError(getErrorMessage(error))
      setCurrentStep('actions')
    } finally { 
      setIsAnalyzing(false)
      setIsCreatingRiscos(false)
    }
  }

  // ==================== GERAÇÃO DE CRONOGRAMA ====================
  const startCronogramaGeneration = async () => {
    if (!projectId) return
    
    setShowCronogramaModal(false)
    setIsAnalyzing(true)
    setIsCreatingCronograma(true)
    setCurrentStep('analysis')
    setAnalysisError(null)
    setActiveAgent(ANALYSIS_TYPE_AGENTS['criacao_epicos_timeline'] || 'Timeline Planner Agent')
    setAnalysisMessage('Gerando cronograma executivo...')
    setAnalysisProgress(10)
    
    try {
      await codeAIService.startAnalysis({ 
        nome_projeto: projectName, 
        analysis_type: 'criacao_epicos_timeline', 
        instrucoes_extras: cronogramaText || undefined 
      })
      setAnalysisProgress(30)
      
      const timelineData = await codeAIService.pollForResults(
        projectId, 
        'timeline', 
        (msg) => { 
          setAnalysisMessage(msg)
          setAnalysisProgress(prev => Math.min(prev + 5, 90)) 
        },
        60,
        5000,
        projectName
      ) as any
      
      // A API retorna { epicos_timeline_report: [...] } ou estrutura similar
      let timelineReport: any[] = []
      
      if (timelineData) {
        if (timelineData.epicos_timeline_report) {
          timelineReport = timelineData.epicos_timeline_report
        } else if (Array.isArray(timelineData)) {
          timelineReport = timelineData
        }
      }
      
      setCronogramaFromAPI({ epicos_timeline_report: timelineReport })
      setCompletedSteps(prev => [...prev.filter(s => s !== 'cronograma'), 'actions'])
      setCurrentStep('cronograma')
      
    } catch (error) { 
      console.error('Erro no cronograma:', error)
      setAnalysisError(getErrorMessage(error))
      setCurrentStep('actions')
    } finally { 
      setIsAnalyzing(false)
      setIsCreatingCronograma(false)
    }
  }

  const toggleEpicSelection = (id: string) => {
    setSelectedEpicIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const selectAllEpics = () => {
    setSelectedEpicIds(selectedEpicIds.length === epicosFromAPI.length ? [] : epicosFromAPI.map(e => e.id))
  }

  const handleSaveProject = async () => {
    if (!projectId) return
    try { 
      await codeAIService.saveProjectState(projectId)
      setShowSaveModal(false)
      alert('✅ Projeto salvo com sucesso!') 
    } catch (error) { 
      alert(`Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`) 
    }
  }

  const handleExportExcel = () => {
    alert('📊 Funcionalidade de exportação Excel em desenvolvimento')
  }

  // ============================================================================
  // RENDER - Loading
  // ============================================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // ============================================================================
  // RENDER - Content por Step
  // ============================================================================

  const renderContent = () => {
    if (loadingExistingProject) {
      return (
        <div className="max-w-md mx-auto text-center py-12">
          <Loader2 className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Carregando projeto...</h2>
        </div>
      )
    }

    switch (currentStep) {
      // ==================== INPUT ====================
      case 'input':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vamos começar o planejamento</h2>
              <p className="text-gray-500">Faça upload da transcrição (PDF, DOCX, TXT).</p>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="projectName">Nome do Projeto *</Label>
              <div className="flex gap-2 mt-1">
                <Input 
                  id="projectName" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  placeholder="Ex: Sistema de Gestão" 
                />
                {userProjects.length > 0 && (
                  <Button variant="outline" onClick={() => setShowProjectModal(true)} title="Projetos existentes">
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div 
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} 
              onDragLeave={() => setIsDragging(false)} 
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all 
                ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <input 
                id="file-upload" 
                type="file" 
                accept=".docx,.pdf,.txt" 
                onChange={(e) => e.target.files?.[0] && setUploadedFile(e.target.files[0])} 
                className="hidden" 
              />
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: BRAND.accent }}>
                <Upload className="w-8 h-8" style={{ color: BRAND.info }} />
              </div>
              <p className="text-gray-700 font-medium mb-1">Clique ou arraste o arquivo aqui</p>
              <p className="text-sm text-gray-400">Suporta PDF, DOCX ou TXT</p>
            </div>
            
            <div className="mt-6">
              <Label htmlFor="instructions">Instruções extras (opcional)</Label>
              <Textarea 
                id="instructions" 
                value={extraInstructions} 
                onChange={(e) => setExtraInstructions(e.target.value)} 
                placeholder="Ex: Foque em épicos de vendas, priorize módulos financeiros..." 
                rows={3} 
                className="mt-1" 
              />
            </div>
            
            {uploadedFile && (
              <div className="mt-6 p-4 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${BRAND.info}15` }}>
                      <FileText className="w-5 h-5" style={{ color: BRAND.info }} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-400">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                    <Button onClick={startAnalysis} disabled={!projectName.trim()} className="text-white" style={{ background: BRAND.info }}>
                      <ArrowRight className="w-4 h-4 mr-2" />Iniciar Análise
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      // ==================== ANALYSIS ====================
      case 'analysis':
        return (
          <div className="max-w-md mx-auto text-center py-12">
            {analysisError ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-100">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ background: `${BRAND.info}15` }}>
                <Bot className="w-10 h-10" style={{ color: BRAND.info }} />
              </div>
            )}
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {analysisError ? 'Erro no processamento' : `${activeAgent} está processando...`}
            </h2>
            
            {analysisError ? (
              <div className="mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-left mb-4">
                  <p className="text-red-700 text-sm">{analysisError}</p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={cancelAnalysis}>
                    <X className="w-4 h-4 mr-2" />Cancelar
                  </Button>
                  <Button onClick={() => { setAnalysisError(null); startAnalysis() }} className="text-white" style={{ background: BRAND.info }}>
                    <RefreshCw className="w-4 h-4 mr-2" />Tentar Novamente
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-500 mb-6">{analysisMessage}</p>
                <div className="w-64 mx-auto">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                </div>
                <Button variant="ghost" onClick={cancelAnalysis} className="mt-6 text-gray-500">
                  Cancelar
                </Button>
              </>
            )}
          </div>
        )

      // ==================== REFINEMENT - USA BACKLOG EPICOS ====================
      case 'refinement':
        return (
          <BacklogEpicos
            projectName={projectName}
            epicos={epicosFromAPI}
            selectedIds={selectedEpicIds}
            onToggleSelection={toggleEpicSelection}
            onSelectAll={selectAllEpics}
            onApprove={handleApproveEpics}
            onRefine={() => setShowRefinementModal(true)}
            onExportExcel={handleExportExcel}
            isLoading={isRefining}
          />
        )

      // ==================== ACTIONS ====================
      case 'actions':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Épicos Aprovados</h2>
              <p className="text-gray-500">Selecione uma ação para prosseguir.</p>
            </div>
            
            <Card className="border shadow-sm mb-6">
              <CardContent className="p-4 max-h-64 overflow-y-auto">
                {epicosFromAPI.filter(e => selectedEpicIds.includes(e.id)).map(epico => (
                  <div key={epico.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs font-mono">#{epico.id}</Badge>
                        <p className="font-medium text-gray-900 truncate">{epico.titulo}</p>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {epico.business_case || epico.resumo_valor || epico.descricao}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 flex-shrink-0">
                      {epico.estimativa_semanas || `${epico.estimativa_sprints || 2} Sprints`}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Seção: Artefatos Já Criados */}
            {(featuresFromAPI.length > 0 || premissasRiscosFromAPI || cronogramaFromAPI) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Artefatos Disponíveis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {featuresFromAPI.length > 0 && (
                    <Card 
                      className="border border-green-200 bg-green-50/50 cursor-pointer hover:bg-green-50 transition-colors"
                      onClick={() => setCurrentStep('features')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-green-800">Features</p>
                            <p className="text-xs text-green-600">{featuresFromAPI.length} criadas</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 border-green-200">Ver</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {premissasRiscosFromAPI && (
                    <Card 
                      className="border border-amber-200 bg-amber-50/50 cursor-pointer hover:bg-amber-50 transition-colors"
                      onClick={() => setCurrentStep('riscos')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-amber-800">Riscos & Premissas</p>
                            <p className="text-xs text-amber-600">
                              {premissasRiscosFromAPI.premissas.length} premissas, {premissasRiscosFromAPI.riscos.length} riscos
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">Ver</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {cronogramaFromAPI && cronogramaFromAPI.epicos_timeline_report?.length > 0 && (
                    <Card 
                      className="border border-emerald-200 bg-emerald-50/50 cursor-pointer hover:bg-emerald-50 transition-colors"
                      onClick={() => setCurrentStep('cronograma')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <GanttChart className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-emerald-800">Cronograma</p>
                            <p className="text-xs text-emerald-600">
                              {cronogramaFromAPI.epicos_timeline_report.length} épicos planejados
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Ver</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
            
            {/* Seção: Criar Novos Artefatos */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                Criar Artefatos
              </h3>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowSaveModal(true)}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}>
                      <Save className="w-6 h-6" style={{ color: BRAND.info }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Salvar Épicos</p>
                      <p className="text-xs text-gray-500">Azure Blob</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowPlanningModal(true)}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}>
                      <Calendar className="w-6 h-6" style={{ color: BRAND.info }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Criar Planejamento</p>
                      <p className="text-xs text-gray-500">Squads e Times</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${featuresFromAPI.length > 0 ? 'border-green-200' : ''}`}
                onClick={() => featuresFromAPI.length > 0 ? setCurrentStep('features') : setShowFeaturesModal(true)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: featuresFromAPI.length > 0 ? '#10b98115' : `${BRAND.info}15` }}>
                      <Layers className="w-6 h-6" style={{ color: featuresFromAPI.length > 0 ? '#10b981' : BRAND.info }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {featuresFromAPI.length > 0 ? 'Ver Features' : 'Criar Features'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {featuresFromAPI.length > 0 ? `${featuresFromAPI.length} features` : 'Detalhamento'}
                      </p>
                    </div>
                    {featuresFromAPI.length > 0 ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">✓</Badge>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${premissasRiscosFromAPI ? 'border-amber-200' : ''}`}
                onClick={() => premissasRiscosFromAPI ? setCurrentStep('riscos') : setShowRiscosModal(true)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: premissasRiscosFromAPI ? '#f59e0b15' : `${BRAND.warning}15` }}>
                      <Shield className="w-6 h-6" style={{ color: BRAND.warning }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {premissasRiscosFromAPI ? 'Ver Riscos' : 'Riscos & Premissas'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {premissasRiscosFromAPI ? `${premissasRiscosFromAPI.riscos.length} riscos` : 'Análise de Riscos'}
                      </p>
                    </div>
                    {premissasRiscosFromAPI ? (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">✓</Badge>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-shadow ${cronogramaFromAPI ? 'border-emerald-200' : ''}`}
                onClick={() => cronogramaFromAPI ? setCurrentStep('cronograma') : setShowCronogramaModal(true)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: cronogramaFromAPI ? '#10b98115' : `${BRAND.success}15` }}>
                      <GanttChart className="w-6 h-6" style={{ color: BRAND.success }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {cronogramaFromAPI ? 'Ver Cronograma' : 'Criar Cronograma'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {cronogramaFromAPI ? 'Timeline gerado' : 'Timeline Executivo'}
                      </p>
                    </div>
                    {cronogramaFromAPI ? (
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">✓</Badge>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      // ==================== FEATURES - USA BACKLOG FEATURES ====================
      case 'features':
        // Preparar lista de épicos resumidos para o seletor
        const epicosResumidos = epicosFromAPI
          .filter(e => selectedEpicIds.includes(e.id))
          .map(e => ({ id: e.id, titulo: e.titulo }))
        
        return (
          <BacklogFeatures
            projectName={projectName}
            epicos={epicosResumidos}
            features={featuresFromAPI}
            onBack={() => setCurrentStep('refinement')}
            onExportExcel={handleExportExcel}
            onSave={() => setShowSaveModal(true)}
          />
        )

      // ==================== RISCOS E PREMISSAS ====================
      case 'riscos':
        return (
          <GestaoRiscosPremissas
            projectName={projectName}
            data={premissasRiscosFromAPI}
            onBack={() => setCurrentStep('actions')}
            onExportExcel={handleExportExcel}
            onSave={() => setShowSaveModal(true)}
          />
        )

      // ==================== CRONOGRAMA EXECUTIVO ====================
      case 'cronograma':
        return (
          <CronogramaExecutivo
            projectName={projectName}
            data={cronogramaFromAPI}
            onBack={() => setCurrentStep('actions')}
            onExportImage={() => alert('📸 Exportação de imagem em desenvolvimento')}
            onExportCSV={() => alert('📊 Exportação CSV em desenvolvimento')}
          />
        )

      default: 
        return null
    }
  }

  // ============================================================================
  // RENDER - Layout Principal
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="novo-pipeline" user={{ name: user.name, email: user.email }} onLogout={logout} />
      
      <div className="ml-56">
        <header className="bg-white border-b px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-gray-900">{projectName || 'Novo Pipeline'}</h1>
              {projectId && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-mono text-xs">
                  {projectId.slice(0, 8)}...
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${analysisError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
              <span className="text-sm text-gray-500">Agente:</span>
              <span className="text-sm font-semibold" style={{ color: BRAND.info }}>{activeAgent}</span>
            </div>
          </div>
        </header>
        
        <div className="bg-white border-b">
          <PipelineStepper currentStep={currentStep} completedSteps={completedSteps} />
        </div>
        
        <main className="p-8">{renderContent()}</main>
      </div>

      {/* ==================== MODAIS ==================== */}
      
      {/* Modal Seleção de Projeto */}
      <Dialog open={showProjectModal} onOpenChange={setShowProjectModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Selecionar Projeto Existente</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userProjects.map((project) => (
              <div 
                key={project.project_id || project.nome_projeto} 
                onClick={() => handleSelectProject(project)} 
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                  <p className="font-medium">{project.nome_projeto}</p>
                  <p className="text-xs text-gray-500">{project.ultima_analysis_type || 'Sem análises'}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProjectModal(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Refinamento */}
      <Dialog open={showRefinementModal} onOpenChange={setShowRefinementModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentStep === 'features' ? 'Refinamento de Features' : 'Refinamento de Épicos'}</DialogTitle>
          </DialogHeader>
          <Textarea 
            placeholder="Descreva as alterações desejadas. Ex: Adicione um épico de relatórios, remova o módulo de chat..." 
            value={refinementText} 
            onChange={(e) => setRefinementText(e.target.value)} 
            rows={5} 
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefinementModal(false)}>Cancelar</Button>
            <Button onClick={handleRefinement} disabled={!refinementText.trim() || isRefining} className="text-white" style={{ background: BRAND.success }}>
              {isRefining ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Refinar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Planejamento */}
      <Dialog open={showPlanningModal} onOpenChange={setShowPlanningModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Criar Planejamento de Times</DialogTitle></DialogHeader>
          <Textarea 
            placeholder="Instruções para o planejamento (opcional). Ex: Considere 3 squads, priorize backend..." 
            value={planningText} 
            onChange={(e) => setPlanningText(e.target.value)} 
            rows={4} 
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanningModal(false)}>Cancelar</Button>
            <Button onClick={handleCreatePlanning} disabled={isCreatingPlanning} className="text-white" style={{ background: BRAND.info }}>
              {isCreatingPlanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Features */}
      <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Criar Features</DialogTitle></DialogHeader>
          <Textarea 
            placeholder="Instruções para geração de features (opcional). Ex: Detalhe mais os critérios de aceite..." 
            value={featuresText} 
            onChange={(e) => setFeaturesText(e.target.value)} 
            rows={5} 
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeaturesModal(false)}>Cancelar</Button>
            <Button onClick={startFeatureGeneration} className="text-white" style={{ background: BRAND.info }}>
              <Play className="w-4 h-4 mr-2" />Criar Features
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Riscos e Premissas */}
      <Dialog open={showRiscosModal} onOpenChange={setShowRiscosModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerar Riscos e Premissas</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Análise de Riscos e Premissas</p>
                  <p className="text-xs text-amber-700 mt-1">
                    O agente irá analisar os épicos aprovados e gerar uma lista de premissas 
                    críticas e riscos com probabilidade, impacto e planos de mitigação.
                  </p>
                </div>
              </div>
            </div>
            <Textarea 
              placeholder="Instruções adicionais (opcional). Ex: Considere riscos de integração com sistemas legados, foque em riscos técnicos..." 
              value={riscosText} 
              onChange={(e) => setRiscosText(e.target.value)} 
              rows={4} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRiscosModal(false)}>Cancelar</Button>
            <Button onClick={startRiscosGeneration} disabled={isCreatingRiscos} className="text-white" style={{ background: BRAND.warning }}>
              {isCreatingRiscos ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
              Gerar Análise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cronograma */}
      <Dialog open={showCronogramaModal} onOpenChange={setShowCronogramaModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerar Cronograma Executivo</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-start gap-3">
                <GanttChart className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-emerald-800">Timeline de Execução</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    O agente irá criar um cronograma detalhado com fases semanais, 
                    atividades focadas, progresso estimado e justificativas de agendamento.
                  </p>
                </div>
              </div>
            </div>
            <Textarea 
              placeholder="Instruções adicionais (opcional). Ex: Considere 14 semanas para MVP, inicie testes em paralelo, priorize infraestrutura..." 
              value={cronogramaText} 
              onChange={(e) => setCronogramaText(e.target.value)} 
              rows={4} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCronogramaModal(false)}>Cancelar</Button>
            <Button onClick={startCronogramaGeneration} disabled={isCreatingCronograma} className="text-white" style={{ background: BRAND.success }}>
              {isCreatingCronograma ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GanttChart className="w-4 h-4 mr-2" />}
              Gerar Cronograma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Salvar */}
      <Dialog open={showSaveModal} onOpenChange={setShowSaveModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Salvar Projeto</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { id: 'azure', label: 'Azure DevOps', icon: 'A', desc: 'Salvar no Azure Blob Storage' },
              { id: 'jira', label: 'Jira', icon: 'J', desc: 'Exportar para Jira (em breve)' },
              { id: 'excel', label: 'Excel', icon: 'E', desc: 'Download em planilha (em breve)' },
            ].map(opt => (
              <div 
                key={opt.id} 
                onClick={() => setSaveDestination(opt.id)} 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors 
                  ${saveDestination === opt.id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'}
                  ${opt.id !== 'azure' ? 'opacity-50' : ''}`}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  {opt.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveModal(false)}>Cancelar</Button>
            <Button onClick={handleSaveProject} disabled={saveDestination !== 'azure'} className="text-white" style={{ background: BRAND.info }}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// EXPORT
// ============================================================================

export default function NovoPipelinePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    }>
      <PipelineContent />
    </Suspense>
  )
}
// src/app/projeto/[id]/page.tsx
// Página de Detalhes do Projeto - Visualização Completa de Todos os Artefatos
"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { 
  codeAIService,
  type ProjectFullState,
  ANALYSIS_TYPE_LABELS,
} from '@/lib/api/codeai-service'
import { BacklogEpicos, type EpicoFromAPI } from '@/components/epicos/backlog-epicos'
import { BacklogFeatures, type FeatureFromAPI } from '@/components/features/backlog-features'
import { CronogramaExecutivo, type CronogramaFromAPI } from '@/components/cronograma/cronograma-executivo'
import { 
  ArrowLeft, Clock, FileText, Layers, AlertTriangle, 
  Loader2, RefreshCw, Play, GanttChart, Shield, CheckCircle,
  ChevronDown, ChevronUp
} from 'lucide-react'

// Tipos
type ViewStep = 'overview' | 'epicos' | 'features' | 'riscos' | 'cronograma'

interface PremissaItem {
  id: string
  descricao: string
  impacto_se_falhar: string
}

interface RiscoItem {
  id: string
  descricao: string
  probabilidade: 'Alta' | 'Média' | 'Baixa'
  impacto: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'
  plano_mitigacao: string
}

// Cores
const PROB_COLORS: Record<string, { bg: string; text: string }> = {
  'Alta': { bg: 'bg-red-100', text: 'text-red-700' },
  'Média': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Baixa': { bg: 'bg-green-100', text: 'text-green-700' },
}

const IMPACT_COLORS: Record<string, { bg: string; text: string }> = {
  'Crítico': { bg: 'bg-red-100', text: 'text-red-700' },
  'Alto': { bg: 'bg-orange-100', text: 'text-orange-700' },
  'Médio': { bg: 'bg-amber-100', text: 'text-amber-700' },
  'Baixo': { bg: 'bg-green-100', text: 'text-green-700' },
}

export default function ProjetoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  const [projectState, setProjectState] = useState<ProjectFullState | null>(null)
  const [projectName, setProjectName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<ViewStep>('overview')
  
  // Dados transformados
  const [epicos, setEpicos] = useState<EpicoFromAPI[]>([])
  const [features, setFeatures] = useState<FeatureFromAPI[]>([])
  const [premissas, setPremissas] = useState<PremissaItem[]>([])
  const [riscos, setRiscos] = useState<RiscoItem[]>([])
  const [cronograma, setCronograma] = useState<CronogramaFromAPI | null>(null)
  
  // Expanded states para riscos
  const [expandedRiscos, setExpandedRiscos] = useState<string[]>([])
  const [expandedPremissas, setExpandedPremissas] = useState<string[]>([])
  const [riscosTab, setRiscosTab] = useState<'premissas' | 'riscos'>('premissas')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && projectId) loadData()
  }, [isAuthenticated, projectId])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await codeAIService.loginDev()
      const project = response.projects.find(p => p.project_id === projectId)
      
      if (project) {
        setProjectName(project.nome_projeto)
        const state = await codeAIService.getProjectReportsByName(project.nome_projeto)
        setProjectState(state)
        transformData(state)
      } else {
        setError('Projeto não encontrado')
      }
    } catch (err) {
      console.error('Erro ao carregar projeto:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const transformData = (state: ProjectFullState) => {
    // Épicos
    const epicosReport = state.epicos?.epicos_report || []
    setEpicos(epicosReport.map((e: any) => ({
      id: String(e.id || e.codigo || ''),
      titulo: e.titulo || e.nome || '',
      descricao: e.descricao || e.business_case || '',
      business_case: e.business_case || e.descricao || '',
      resumo_valor: e.resumo_valor || '',
      entregaveis_macro: e.entregaveis_macro || e.entregaveis || [],
      squad_sugerida: e.squad_sugerida || e.perfis || [],
      perfis: e.squad_sugerida || e.perfis || [],
      estimativa_semanas: e.estimativa_semanas || '',
      estimativa_sprints: e.estimativa_sprints || 0,
      prioridade_estrategica: e.prioridade_estrategica || e.prioridade || 'Média',
      prioridade: e.prioridade_estrategica || e.prioridade || 'Média',
    })))

    // Features
    const featuresReport = state.features?.features_report || []
    setFeatures(featuresReport.map((f: any) => ({
      id: String(f.id),
      epic_id: String(f.epic_id || f.epico_id),
      titulo: f.titulo || f.nome || '',
      descricao: f.descricao || '',
      criterios_aceite: f.criterios_aceite || [],
      tipo: f.tipo || f.perfil || 'Backend',
      complexidade: f.complexidade || 'Média',
    })))

    // Premissas e Riscos
    const premissasRiscosData = state.premissas_riscos as any
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
        premissasArray = premissasRiscosData[0].premissas || []
        riscosArray = premissasRiscosData[0].riscos || []
      }
      
      setPremissas(premissasArray.map((p: any) => ({
        id: String(p.id),
        descricao: p.descricao,
        impacto_se_falhar: p.impacto_se_falhar,
      })))
      
      setRiscos(riscosArray.map((r: any) => ({
        id: String(r.id),
        descricao: r.descricao,
        probabilidade: r.probabilidade,
        impacto: r.impacto,
        plano_mitigacao: r.plano_mitigacao,
      })))
    }

    // Cronograma
    const timelineData = state.epicos_timeline as any
    if (timelineData) {
      let timelineReport: any[] = []
      if (timelineData.epicos_timeline_report) {
        timelineReport = timelineData.epicos_timeline_report
      } else if (Array.isArray(timelineData)) {
        timelineReport = timelineData
      }
      if (timelineReport.length > 0) {
        setCronograma({ epicos_timeline_report: timelineReport })
      }
    }
  }

  const handleContinuePipeline = () => {
    if (!projectName) return
    const urlParams = new URLSearchParams({ nome: projectName, id: projectId })
    router.push(`/novo-pipeline?${urlParams.toString()}`)
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  // Contadores
  const epicosCount = epicos.length
  const featuresCount = features.length
  const riscosCount = riscos.length
  const premissasCount = premissas.length
  const hasCronograma = cronograma !== null && cronograma.epicos_timeline_report?.length > 0

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md border border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-700 mb-2">Erro ao carregar projeto</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />Voltar
              </Button>
              <Button onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Renderiza Riscos View inline
  const renderRiscosView = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setCurrentView('overview')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{projectName} - Riscos & Premissas</h2>
            <p className="text-gray-500 text-sm">Análise de riscos e premissas do projeto</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{premissasCount}</p>
            <p className="text-xs text-gray-500">Premissas</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold text-red-700">
              {riscos.filter(r => r.probabilidade === 'Alta' || r.impacto === 'Crítico').length}
            </p>
            <p className="text-xs text-gray-500">Riscos Altos</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-amber-700">
              {riscos.filter(r => r.probabilidade === 'Média').length}
            </p>
            <p className="text-xs text-gray-500">Riscos Médios</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-700">
              {riscos.filter(r => r.probabilidade === 'Baixa').length}
            </p>
            <p className="text-xs text-gray-500">Riscos Baixos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={riscosTab === 'premissas' ? 'default' : 'outline'}
          onClick={() => setRiscosTab('premissas')}
          style={riscosTab === 'premissas' ? { background: BRAND.info } : {}}
          className={riscosTab === 'premissas' ? 'text-white' : ''}
        >
          <CheckCircle className="w-4 h-4 mr-2" />Premissas ({premissasCount})
        </Button>
        <Button
          variant={riscosTab === 'riscos' ? 'default' : 'outline'}
          onClick={() => setRiscosTab('riscos')}
          style={riscosTab === 'riscos' ? { background: '#f59e0b' } : {}}
          className={riscosTab === 'riscos' ? 'text-white' : ''}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />Riscos ({riscosCount})
        </Button>
      </div>

      {/* Content */}
      {riscosTab === 'premissas' ? (
        <div className="space-y-3">
          {premissas.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma premissa identificada</h3>
              </CardContent>
            </Card>
          ) : (
            premissas.map((premissa) => (
              <Card key={premissa.id} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpandedPremissas(prev => 
                      prev.includes(premissa.id) ? prev.filter(x => x !== premissa.id) : [...prev, premissa.id]
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">#{premissa.id}</Badge>
                        </div>
                        <p className="text-gray-700 text-sm">{premissa.descricao}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedPremissas.includes(premissa.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  {expandedPremissas.includes(premissa.id) && premissa.impacto_se_falhar && (
                    <div className="px-4 pb-4 pt-0">
                      <div className="ml-14 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Impacto se Falhar</p>
                        <p className="text-sm text-red-800">{premissa.impacto_se_falhar}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {riscos.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum risco identificado</h3>
              </CardContent>
            </Card>
          ) : (
            riscos.map((risco) => {
              const probColors = PROB_COLORS[risco.probabilidade] || PROB_COLORS['Média']
              const impactColors = IMPACT_COLORS[risco.impacto] || IMPACT_COLORS['Médio']
              return (
                <Card key={risco.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => setExpandedRiscos(prev => 
                        prev.includes(risco.id) ? prev.filter(x => x !== risco.id) : [...prev, risco.id]
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${probColors.bg}`}>
                          <AlertTriangle className={`w-5 h-5 ${probColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs font-mono">#{risco.id}</Badge>
                            <Badge className={`${probColors.bg} ${probColors.text}`}>Prob: {risco.probabilidade}</Badge>
                            <Badge className={`${impactColors.bg} ${impactColors.text}`}>Impacto: {risco.impacto}</Badge>
                          </div>
                          <p className="text-gray-700 text-sm">{risco.descricao}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {expandedRiscos.includes(risco.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                    {expandedRiscos.includes(risco.id) && risco.plano_mitigacao && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="ml-14 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-xs font-semibold text-emerald-700 mb-1">🛡️ Plano de Mitigação</p>
                          <p className="text-sm text-emerald-800">{risco.plano_mitigacao}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )

  // Renderiza conteúdo baseado na view
  const renderContent = () => {
    switch (currentView) {
      case 'epicos':
        return (
          <BacklogEpicos
            projectName={projectName}
            epicos={epicos}
            selectedIds={epicos.map(e => e.id)}
            onToggleSelection={() => {}}
            onSelectAll={() => {}}
            onApprove={() => setCurrentView('overview')}
            onRefine={() => {}}
            onExportExcel={() => alert('Exportação em desenvolvimento')}
            isLoading={false}
            readOnly={true}
          />
        )
      
      case 'features':
        return (
          <BacklogFeatures
            projectName={projectName}
            features={features}
            epicos={epicos}
            onBack={() => setCurrentView('overview')}
            onExportExcel={() => alert('Exportação em desenvolvimento')}
          />
        )
      
      case 'riscos':
        return renderRiscosView()
      
      case 'cronograma':
        return cronograma ? (
          <CronogramaExecutivo
            projectName={projectName}
            data={cronograma}
            onBack={() => setCurrentView('overview')}
            onExportImage={() => alert('Exportação em desenvolvimento')}
            onExportCSV={() => alert('Exportação em desenvolvimento')}
          />
        ) : (
          <Card className="border shadow-sm">
            <CardContent className="p-12 text-center">
              <GanttChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cronograma não gerado</h3>
              <p className="text-gray-500 mb-4">Este projeto ainda não possui um cronograma executivo.</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setCurrentView('overview')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />Voltar
                </Button>
                <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white">
                  <Play className="w-4 h-4 mr-2" />Criar no Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      
      // Overview
      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${epicosCount > 0 ? 'border-green-200 bg-green-50/50' : ''}`}
                onClick={() => { if (epicosCount > 0) setCurrentView('epicos') }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${epicosCount > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <FileText className={`w-6 h-6 ${epicosCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{epicosCount}</p>
                      <p className="text-sm text-gray-500">Épicos</p>
                    </div>
                    {epicosCount > 0 && <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${featuresCount > 0 ? 'border-blue-200 bg-blue-50/50' : ''}`}
                onClick={() => { if (featuresCount > 0) setCurrentView('features') }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${featuresCount > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Layers className={`w-6 h-6 ${featuresCount > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{featuresCount}</p>
                      <p className="text-sm text-gray-500">Features</p>
                    </div>
                    {featuresCount > 0 && <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${riscosCount > 0 ? 'border-amber-200 bg-amber-50/50' : ''}`}
                onClick={() => { if (riscosCount > 0 || premissasCount > 0) setCurrentView('riscos') }}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${riscosCount > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                      <Shield className={`w-6 h-6 ${riscosCount > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{riscosCount + premissasCount}</p>
                      <p className="text-sm text-gray-500">Riscos & Premissas</p>
                    </div>
                    {riscosCount > 0 && <CheckCircle className="w-5 h-5 text-amber-500 ml-auto" />}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${hasCronograma ? 'border-emerald-200 bg-emerald-50/50' : ''}`}
                onClick={() => setCurrentView('cronograma')}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${hasCronograma ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <GanttChart className={`w-6 h-6 ${hasCronograma ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{hasCronograma ? '✓' : '-'}</p>
                      <p className="text-sm text-gray-500">Cronograma</p>
                    </div>
                    {hasCronograma && <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Access */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Épicos */}
              <Card className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${epicosCount > 0 ? '' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Backlog de Épicos</h4>
                        {epicosCount > 0 && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">{epicosCount} épicos</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {epicosCount > 0 
                          ? 'Visualize business case, squad sugerida e entregáveis de cada épico.'
                          : 'Nenhum épico criado. Vá para o pipeline para criar.'
                        }
                      </p>
                      <Button 
                        variant={epicosCount > 0 ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          if (epicosCount > 0) {
                            setCurrentView('epicos')
                          } else {
                            handleContinuePipeline()
                          }
                        }}
                        style={epicosCount === 0 ? { background: BRAND.info } : {}}
                        className={epicosCount === 0 ? 'text-white' : ''}
                      >
                        {epicosCount > 0 ? 'Ver Épicos' : 'Criar no Pipeline'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${featuresCount > 0 ? '' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Layers className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Features por Épico</h4>
                        {featuresCount > 0 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">{featuresCount} features</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {featuresCount > 0 
                          ? 'Detalhamento técnico com critérios de aceite e complexidade.'
                          : 'Nenhuma feature criada. Vá para o pipeline para criar.'
                        }
                      </p>
                      <Button 
                        variant={featuresCount > 0 ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          if (featuresCount > 0) {
                            setCurrentView('features')
                          } else {
                            handleContinuePipeline()
                          }
                        }}
                        style={featuresCount === 0 ? { background: BRAND.info } : {}}
                        className={featuresCount === 0 ? 'text-white' : ''}
                      >
                        {featuresCount > 0 ? 'Ver Features' : 'Criar no Pipeline'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Riscos */}
              <Card className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${(riscosCount > 0 || premissasCount > 0) ? '' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-7 h-7 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Riscos & Premissas</h4>
                        {(riscosCount > 0 || premissasCount > 0) && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            {premissasCount} premissas, {riscosCount} riscos
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {(riscosCount > 0 || premissasCount > 0)
                          ? 'Matriz de riscos com probabilidade, impacto e plano de mitigação.'
                          : 'Nenhum risco ou premissa identificado. Vá para o pipeline para criar.'
                        }
                      </p>
                      <Button 
                        variant={(riscosCount > 0 || premissasCount > 0) ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          if (riscosCount > 0 || premissasCount > 0) {
                            setCurrentView('riscos')
                          } else {
                            handleContinuePipeline()
                          }
                        }}
                        style={(riscosCount === 0 && premissasCount === 0) ? { background: BRAND.info } : {}}
                        className={(riscosCount === 0 && premissasCount === 0) ? 'text-white' : ''}
                      >
                        {(riscosCount > 0 || premissasCount > 0) ? 'Ver Riscos' : 'Criar no Pipeline'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cronograma */}
              <Card className={`border shadow-sm cursor-pointer hover:shadow-md transition-all ${hasCronograma ? '' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <GanttChart className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Cronograma Executivo</h4>
                        {hasCronograma && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Gerado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {hasCronograma 
                          ? 'Timeline de execução com fases, semanas e progresso estimado.'
                          : 'Cronograma não gerado. Vá para o pipeline para criar.'
                        }
                      </p>
                      <Button 
                        variant={hasCronograma ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          if (hasCronograma) {
                            setCurrentView('cronograma')
                          } else {
                            handleContinuePipeline()
                          }
                        }}
                        style={!hasCronograma ? { background: BRAND.info } : {}}
                        className={!hasCronograma ? 'text-white' : ''}
                      >
                        {hasCronograma ? 'Ver Cronograma' : 'Criar no Pipeline'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="dashboard" user={{ name: user.name, email: user.email }} onLogout={logout} />

      <div className="ml-56">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => {
                if (currentView === 'overview') {
                  router.push('/dashboard')
                } else {
                  setCurrentView('overview')
                }
              }}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{projectName || 'Projeto'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {projectState?.resumo?.ultima_analysis_type && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      {ANALYSIS_TYPE_LABELS[projectState.resumo.ultima_analysis_type as keyof typeof ANALYSIS_TYPE_LABELS] || projectState.resumo.ultima_analysis_type}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(projectState?.resumo?.ultima_atualizacao)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />Atualizar
              </Button>
              <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white">
                <Play className="w-4 h-4 mr-2" />Continuar Pipeline
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
// src/app/relatorios/page.tsx
// Página de Relatórios - PEERS CodeAI - Layout Responsivo
'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { codeAIService, type ProjectSummary } from '@/lib/api/codeai-service'
import { 
  Loader2, FileText, Layers, AlertTriangle, GanttChart, 
  Search, X, FolderOpen, RefreshCw, ArrowRight,
  CheckCircle2, ChevronDown, Check
} from 'lucide-react'

// ============================================================================
// BRAND COLORS
// ============================================================================
const BRAND_COLORS = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
  primaryLight: '#677185',
}

// ============================================================================
// TIPOS DE RELATÓRIO
// ============================================================================
const REPORT_TYPES = [
  {
    id: 'epicos',
    title: 'Backlog de Épicos',
    description: 'Visão estratégica dos épicos com priorização',
    icon: FileText,
    color: '#6366f1',
    bgColor: '#eef2ff',
  },
  {
    id: 'features',
    title: 'Features por Épico',
    description: 'Detalhamento técnico de features',
    icon: Layers,
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
  },
  {
    id: 'cronograma',
    title: 'Cronograma Executivo',
    description: 'Timeline visual de entregas',
    icon: GanttChart,
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
  },
  {
    id: 'riscos',
    title: 'Premissas e Riscos',
    description: 'Matriz de riscos e mitigação',
    icon: AlertTriangle,
    color: '#f59e0b',
    bgColor: '#fffbeb',
  },
]

// ============================================================================
// COMPONENTE DE CARD DE RELATÓRIO - Responsivo
// ============================================================================
function ReportCard({ 
  report, 
  isAvailable, 
  itemCount = 0,
  onClick 
}: {
  report: typeof REPORT_TYPES[0]
  isAvailable: boolean
  itemCount?: number
  onClick: () => void
}): React.ReactElement {
  const Icon = report.icon
  
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={`
        w-full p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 text-left group
        ${isAvailable
          ? 'border-slate-200 hover:border-[#011334] hover:shadow-lg cursor-pointer bg-white'
          : 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-60'
        }
      `}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div 
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: report.bgColor }}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: report.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-slate-800 text-base sm:text-lg">{report.title}</h3>
            {itemCount > 0 && (
              <Badge 
                variant="secondary" 
                className="text-xs font-bold"
                style={{ backgroundColor: `${report.color}20`, color: report.color }}
              >
                {itemCount}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2">{report.description}</p>
        </div>
        {isAvailable && (
          <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0 transition-all group-hover:text-[#011334] group-hover:translate-x-1 hidden sm:block" />
        )}
      </div>
    </button>
  )
}

// ============================================================================
// COMPONENTE DROPDOWN DE PROJETOS COM BUSCA
// ============================================================================
function ProjectDropdown({
  projects,
  selectedProject,
  onSelect,
}: {
  projects: ProjectSummary[]
  selectedProject: ProjectSummary | null
  onSelect: (project: ProjectSummary) => void
}): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = useMemo(() => {
    if (!searchTerm) return projects
    return projects.filter(p => 
      p.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [projects, searchTerm])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border-2 border-slate-200 rounded-xl hover:border-[#011334] transition-colors w-full text-left"
        >
          <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
          <span className={`flex-1 truncate text-sm sm:text-base ${selectedProject ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
            {selectedProject ? selectedProject.nome_projeto : 'Selecione um projeto...'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-[calc(100vw-3rem)] sm:w-[400px] p-0" 
        align="start"
        sideOffset={4}
      >
        {/* Campo de busca */}
        <div className="p-2 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 border-slate-200 focus:border-[#011334]"
              onClick={(e) => e.stopPropagation()}
            />
            {searchTerm && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSearchTerm('')
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Lista de projetos */}
        <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto py-1">
          {filteredProjects.length === 0 ? (
            <div className="px-4 py-6 text-center text-slate-500 text-sm">
              Nenhum projeto encontrado
            </div>
          ) : (
            filteredProjects.map((project) => (
              <DropdownMenuItem
                key={project.project_id}
                onClick={() => {
                  onSelect(project)
                  setSearchTerm('')
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate text-sm">{project.nome_projeto}</p>
                  {project.ultima_analysis_type && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {project.ultima_analysis_type.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
                {selectedProject?.project_id === project.project_id && (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
function RelatoriosContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState({
    epicos: 0, features: 0, riscos: 0, cronogramaItems: 0
  })

  const projectIdFromParams = searchParams.get('projeto') || searchParams.get('projectId') || ''

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) loadProjects()
  }, [isAuthenticated])

  useEffect(() => {
    if (projectIdFromParams && projects.length > 0) {
      const project = projects.find(p => p.project_id === projectIdFromParams)
      if (project) setSelectedProject(project)
    }
  }, [projectIdFromParams, projects])

  useEffect(() => {
    if (selectedProject) {
      loadReportData(selectedProject)
    } else {
      setReportData({ epicos: 0, features: 0, riscos: 0, cronogramaItems: 0 })
    }
  }, [selectedProject])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const response = await codeAIService.loginDev()
      setProjects(response.projects || [])
    } catch (err) {
      console.error('Erro ao carregar projetos:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadReportData = async (project: ProjectSummary) => {
    try {
      const { state: fullState } = await codeAIService.checkProject(project.nome_projeto)
      if (!fullState) return

      const epicosData = fullState.epicos as any
      const featuresData = fullState.features as any
      const riscosData = fullState.premissas_riscos as any
      const cronogramaData = fullState.epicos_timeline as any

      let epicosCount = 0, featuresCount = 0, riscosCount = 0, cronogramaCount = 0

      if (epicosData) {
        if (Array.isArray(epicosData)) epicosCount = epicosData.length
        else if (epicosData.epicos_report) epicosCount = epicosData.epicos_report.length
        else if (epicosData.epicos) epicosCount = epicosData.epicos.length
      }

      if (featuresData) {
        if (Array.isArray(featuresData)) featuresCount = featuresData.length
        else if (featuresData.features_report) featuresCount = featuresData.features_report.length
        else if (featuresData.features) featuresCount = featuresData.features.length
      }

      if (riscosData) {
        if (Array.isArray(riscosData)) riscosCount = riscosData.length
        else if (riscosData.riscos) riscosCount = riscosData.riscos.length
        else if (riscosData.premissas_riscos_report) {
          const report = riscosData.premissas_riscos_report[0]
          riscosCount = (report?.riscos?.length || 0) + (report?.premissas?.length || 0)
        }
      }

      if (cronogramaData && Array.isArray(cronogramaData)) {
        cronogramaCount = cronogramaData.length
      }

      setReportData({
        epicos: epicosCount,
        features: featuresCount,
        riscos: riscosCount,
        cronogramaItems: cronogramaCount || epicosCount,
      })
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  const handleNavigateToReport = (reportType: string) => {
    if (!selectedProject) return
    router.push(`/relatorios/${reportType}?projeto=${selectedProject.project_id}`)
  }

  const totalItems = reportData.epicos + reportData.features + reportData.riscos

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: BRAND_COLORS.primary }} />
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Redirecionando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeItem="relatorios"
        user={{ name: user.name || 'Usuário', email: user.email || '' }}
        onLogout={logout}
      />

      {/* Main Content - flex-1 e ml-16 para responsividade */}
      <main className="flex-1 ml-16 min-w-0">
        {/* Header */}
        <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
                Central de Relatórios
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Visualize e exporte relatórios dos seus projetos
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={loadProjects} className="border-slate-200 w-full sm:w-auto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Seletor de Projeto */}
          <Card className="mb-6 border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="w-full lg:w-auto lg:flex-1 lg:max-w-md">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Selecione um projeto
                  </label>
                  <ProjectDropdown
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelect={setSelectedProject}
                  />
                </div>

                {selectedProject && (
                  <div 
                    className="px-4 py-3 rounded-lg border flex items-center gap-3 w-full lg:w-auto"
                    style={{ backgroundColor: `${BRAND_COLORS.secondary}15`, borderColor: `${BRAND_COLORS.secondary}50` }}
                  >
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: BRAND_COLORS.primary }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: BRAND_COLORS.primary }}>
                        {totalItems} itens disponíveis
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo */}
          {selectedProject ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[
                  { label: 'Épicos', value: reportData.epicos, icon: FileText, color: '#6366f1', bg: '#eef2ff' },
                  { label: 'Features', value: reportData.features, icon: Layers, color: '#8b5cf6', bg: '#f5f3ff' },
                  { label: 'Riscos', value: reportData.riscos, icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
                  { label: 'Cronograma', value: reportData.cronogramaItems, icon: GanttChart, color: '#0ea5e9', bg: '#f0f9ff' },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.label} className="p-3 sm:p-4 bg-white border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: stat.bg }}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xl sm:text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>{stat.value}</p>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">{stat.label}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Grid de Relatórios */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {REPORT_TYPES.map(report => {
                  let count = 0
                  switch (report.id) {
                    case 'epicos': count = reportData.epicos; break
                    case 'features': count = reportData.features; break
                    case 'riscos': count = reportData.riscos; break
                    case 'cronograma': count = reportData.cronogramaItems; break
                  }
                  return (
                    <ReportCard
                      key={report.id}
                      report={report}
                      isAvailable={count > 0}
                      itemCount={count}
                      onClick={() => handleNavigateToReport(report.id)}
                    />
                  )
                })}
              </div>
            </>
          ) : (
            <Card className="border-slate-200">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6" style={{ backgroundColor: BRAND_COLORS.accent }}>
                  <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: BRAND_COLORS.primary }}>
                  Selecione um Projeto
                </h2>
                <p className="text-slate-500 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                  Escolha um projeto no seletor acima para visualizar os relatórios disponíveis.
                </p>
                
                {projects.length === 0 ? (
                  <div className="p-4 sm:p-6 rounded-xl bg-amber-50 border border-amber-200 max-w-md mx-auto">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm text-amber-700 mb-4">
                      Nenhum projeto encontrado.
                    </p>
                    <Button onClick={() => router.push('/novo-pipeline')} className="text-white" style={{ backgroundColor: BRAND_COLORS.primary }}>
                      Criar Novo Pipeline
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
                    {REPORT_TYPES.map((type) => {
                      const Icon = type.icon
                      return (
                        <div key={type.id} className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-white">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3" style={{ backgroundColor: type.bgColor }}>
                            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: type.color }} />
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">{type.title}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-xs uppercase tracking-widest" style={{ color: BRAND_COLORS.primaryLight }}>
              PEERS Consulting + Technology • CodeAI Platform
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

// ============================================================================
// EXPORT
// ============================================================================
export default function RelatoriosPage(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#011334' }} />
      </div>
    }>
      <RelatoriosContent />
    </Suspense>
  )
}
// src/app/dashboard/page.tsx
"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { 
  codeAIService,
  type ProjectSummary,
  ANALYSIS_TYPE_LABELS,
} from '@/lib/api/codeai-service'
// ============================================================================
// IMPORTAR COMPONENTES DE ONBOARDING
// ============================================================================
import { 
  WelcomeModal, 
  EmptyStateGuide, 
  useOnboarding 
} from '@/components/onboarding/WelcomeModal'

import { 
  Search, Plus, FolderOpen, Clock, ChevronRight, Loader2, RefreshCw, Eye,
  FileText, Layers, AlertCircle, FolderKanban, FileBarChart2, Shield, GanttChart, 
  ChevronDown, ArrowUpDown, SortAsc, SortDesc, Type
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================
type SortOption = 'recent' | 'oldest' | 'name_asc' | 'name_desc'

const SORT_OPTIONS: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'recent', label: 'Mais recentes', icon: SortDesc },
  { value: 'oldest', label: 'Mais antigos', icon: SortAsc },
  { value: 'name_asc', label: 'Nome (A-Z)', icon: Type },
  { value: 'name_desc', label: 'Nome (Z-A)', icon: Type },
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  // ============================================================================
  // HOOK DE ONBOARDING - Controla welcome modal
  // ============================================================================
  const { showWelcome, setShowWelcome, completeOnboarding } = useOnboarding()
  
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await codeAIService.loginDev()
      setProjects(response.projects || [])
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar e ordenar projetos
  const filteredAndSortedProjects = useMemo(() => {
    let result = projects.filter(p =>
      p.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase())
    )

    result.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          const dateA = a.ultima_atualizacao && a.ultima_atualizacao !== 'N/A' 
            ? new Date(a.ultima_atualizacao).getTime() : 0
          const dateB = b.ultima_atualizacao && b.ultima_atualizacao !== 'N/A'
            ? new Date(b.ultima_atualizacao).getTime() : 0
          return dateB - dateA
        case 'oldest':
          const dateA2 = a.ultima_atualizacao && a.ultima_atualizacao !== 'N/A'
            ? new Date(a.ultima_atualizacao).getTime() : 0
          const dateB2 = b.ultima_atualizacao && b.ultima_atualizacao !== 'N/A'
            ? new Date(b.ultima_atualizacao).getTime() : 0
          return dateA2 - dateB2
        case 'name_asc':
          return a.nome_projeto.localeCompare(b.nome_projeto, 'pt-BR')
        case 'name_desc':
          return b.nome_projeto.localeCompare(a.nome_projeto, 'pt-BR')
        default:
          return 0
      }
    })

    return result
  }, [projects, searchTerm, sortBy])

  // Estatísticas
  const stats = useMemo(() => ({
    total: projects.length,
    comEpicos: projects.filter(p => 
      p.ultima_analysis_type?.toLowerCase().includes('epico')
    ).length,
    comFeatures: projects.filter(p => 
      p.ultima_analysis_type?.toLowerCase().includes('feature')
    ).length,
    recentes: projects.filter(p => {
      if (!p.ultima_atualizacao || p.ultima_atualizacao === 'N/A') return false
      const date = new Date(p.ultima_atualizacao)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7
    }).length,
  }), [projects])

  const getAnalysisLabel = (type: string | null | undefined) => {
    if (!type) return 'Sem análises'
    return ANALYSIS_TYPE_LABELS[type as keyof typeof ANALYSIS_TYPE_LABELS] || type.replace(/_/g, ' ')
  }

  const hasArtefatos = (project: ProjectSummary) => {
    const type = project.ultima_analysis_type?.toLowerCase() || ''
    return type.includes('epico') || type.includes('feature') || type.includes('timeline') || 
           type.includes('cronograma') || type.includes('premissa') || type.includes('risco')
  }

  const isProjectComplete = (project: ProjectSummary) => {
    const type = project.ultima_analysis_type?.toLowerCase() || ''
    return type.includes('premissa') || type.includes('risco') || type.includes('timeline') || type.includes('cronograma')
  }

  const currentSortOption = SORT_OPTIONS.find(opt => opt.value === sortBy)

  // ============================================================================
  // HANDLERS DE ONBOARDING
  // ============================================================================
  const handleWelcomeClose = () => {
    setShowWelcome(false)
  }

  const handleStartPipeline = () => {
    completeOnboarding()
    router.push('/novo-pipeline')
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ================================================================== */}
      {/* WELCOME MODAL - Aparece apenas no primeiro acesso                  */}
      {/* ================================================================== */}
      {showWelcome && (
        <WelcomeModal 
          onClose={handleWelcomeClose}
          onStartPipeline={handleStartPipeline}
        />
      )}

      {/* Sidebar */}
      <Sidebar activeItem="dashboard" user={{ name: user.name, email: user.email }} onLogout={logout} />

      {/* Main content */}
      <div className="flex-1 ml-16 min-w-0">
        {/* Header */}
        <header className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold" style={{ color: BRAND.primary }}>Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">Gerencie seus pipelines e projetos de IA</p>
            </div>
            <Button 
              onClick={() => router.push('/novo-pipeline')}
              className="text-white w-full sm:w-auto"
              style={{ background: BRAND.primary }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Pipeline
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards - Só mostra se tem projetos */}
          {projects.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {[
                { label: 'Total de Projetos', value: stats.total, icon: FolderKanban, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-500' },
                { label: 'Com Épicos', value: stats.comEpicos, icon: FileText, bgColor: 'bg-purple-50', iconColor: 'text-purple-500' },
                { label: 'Com Features', value: stats.comFeatures, icon: Layers, bgColor: 'bg-green-50', iconColor: 'text-green-500' },
                { label: 'Atualizados (7d)', value: stats.recentes, icon: Clock, bgColor: 'bg-amber-50', iconColor: 'text-amber-500' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="border-slate-200">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm text-gray-500 truncate">{stat.label}</p>
                          <p className="text-2xl sm:text-3xl font-bold" style={{ color: BRAND.primary }}>{stat.value}</p>
                        </div>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Search, Sort and Actions - Só mostra se tem projetos */}
          {projects.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 w-full"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <span className="truncate">{currentSortOption?.label || 'Ordenar'}</span>
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SORT_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={sortBy === option.value ? 'bg-slate-100' : ''}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {option.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" onClick={loadData} className="border-slate-200 w-full sm:w-auto">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          )}

          {/* Results count */}
          {searchTerm && projects.length > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              {filteredAndSortedProjects.length} projeto(s) encontrado(s)
            </p>
          )}

          {/* ================================================================== */}
          {/* CONTEÚDO PRINCIPAL                                                 */}
          {/* ================================================================== */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: BRAND.primary }} />
              <p className="text-gray-500">Carregando projetos...</p>
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-700">{error}</p>
                <Button variant="outline" onClick={loadData} className="mt-4">
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : projects.length === 0 ? (
            /* ================================================================== */
            /* EMPTY STATE COM ONBOARDING - Quando não tem projetos               */
            /* ================================================================== */
            <Card className="border-slate-200">
              <CardContent className="p-0">
                <EmptyStateGuide onCreatePipeline={() => router.push('/novo-pipeline')} />
              </CardContent>
            </Card>
          ) : filteredAndSortedProjects.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-8 sm:p-12 text-center">
                <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum projeto encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  Tente outra busca ou limpe os filtros
                </p>
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Lista de Projetos */
            <div className="space-y-3">
              {filteredAndSortedProjects.map((project) => (
                <Card key={project.project_id} className="border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Icon + Info */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 truncate">{project.nome_projeto}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getAnalysisLabel(project.ultima_analysis_type)}
                            </Badge>
                            {project.ultima_atualizacao && project.ultima_atualizacao !== 'N/A' && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(project.ultima_atualizacao).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        {hasArtefatos(project) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 flex-1 sm:flex-none">
                                <FileBarChart2 className="w-4 h-4 mr-1" />
                                <span className="hidden sm:inline">Relatórios</span>
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/epicos?projeto=${project.project_id}`)}>
                                <FileText className="w-4 h-4 mr-2" />
                                Backlog de Épicos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/features?projeto=${project.project_id}`)}>
                                <Layers className="w-4 h-4 mr-2" />
                                Features por Épico
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/cronograma?projeto=${project.project_id}`)}>
                                <GanttChart className="w-4 h-4 mr-2" />
                                Cronograma Executivo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/riscos?projeto=${project.project_id}`)}>
                                <Shield className="w-4 h-4 mr-2" />
                                Premissas e Riscos
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/projeto/${project.project_id}`)}
                          className="border-slate-200 flex-1 sm:flex-none"
                        >
                          <Eye className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Ver Detalhes</span>
                        </Button>

                        {!isProjectComplete(project) && (
                          <Button 
                            size="sm"
                            onClick={() => router.push(`/novo-pipeline?projeto=${project.project_id}`)}
                            style={{ background: BRAND.primary }}
                            className="text-white flex-1 sm:flex-none"
                          >
                            <span className="hidden sm:inline">Continuar</span>
                            <ChevronRight className="w-4 h-4 sm:ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
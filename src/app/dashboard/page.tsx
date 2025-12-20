// src/app/dashboard/page.tsx
"use client"

import { useState, useEffect } from 'react'
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
} from '@/components/ui/dropdown-menu'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { 
  codeAIService,
  type ProjectSummary,
  ANALYSIS_TYPE_LABELS,
} from '@/lib/api/codeai-service'
import { 
  Search, Plus, FolderOpen, Clock, ChevronRight, Loader2, RefreshCw, Eye,
  FileText, Layers, AlertCircle, FolderKanban, FileBarChart2, Shield, GanttChart, ChevronDown
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  const handleViewProject = (project: ProjectSummary) => {
    const projectId = project.project_id || encodeURIComponent(project.nome_projeto)
    router.push(`/projeto/${projectId}`)
  }

  const handleContinueProject = (project: ProjectSummary) => {
    const params = new URLSearchParams({ nome: project.nome_projeto, id: project.project_id || '' })
    router.push(`/novo-pipeline?${params.toString()}`)
  }

  const filteredProjects = projects.filter(p => 
    p.nome_projeto.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: projects.length,
    comEpicos: projects.filter(p => p.ultima_analysis_type?.toLowerCase().includes('epico')).length,
    comFeatures: projects.filter(p => p.ultima_analysis_type?.toLowerCase().includes('feature')).length,
    recentes: projects.filter(p => {
      if (!p.ultima_atualizacao) return false
      const diff = Date.now() - new Date(p.ultima_atualizacao).getTime()
      return diff < 7 * 24 * 60 * 60 * 1000
    }).length,
  }

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const getAnalysisLabel = (type?: string | null) => {
    if (!type) return 'Sem análises'
    return ANALYSIS_TYPE_LABELS[type as keyof typeof ANALYSIS_TYPE_LABELS] || type
  }

  // Verifica se projeto tem artefatos para mostrar botão de relatórios
  const hasArtefatos = (project: ProjectSummary) => {
    const type = project.ultima_analysis_type?.toLowerCase() || ''
    return (
      type.includes('epico') || 
      type.includes('feature') || 
      type.includes('timeline') ||
      type.includes('cronograma') ||
      type.includes('premissa') ||
      type.includes('risco') ||
      type.includes('criado')
    )
  }

  // Verifica se projeto está "completo" (já tem premissas/riscos ou cronograma)
  // Nesses casos não precisa mostrar botão "Continuar"
  const isProjectComplete = (project: ProjectSummary) => {
    const type = project.ultima_analysis_type?.toLowerCase() || ''
    return (
      type.includes('premissa') ||
      type.includes('risco') ||
      type.includes('criacao_premissas') ||
      type.includes('timeline') ||
      type.includes('cronograma')
    )
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="dashboard" user={{ name: user.name, email: user.email }} onLogout={logout} />

      <div className="ml-56">
        <header className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Gerencie seus pipelines e projetos de IA</p>
            </div>
            <Button onClick={() => router.push('/novo-pipeline')} className="text-white" style={{ background: BRAND.info }}>
              <Plus className="w-4 h-4 mr-2" />Novo Pipeline
            </Button>
          </div>
        </header>

        <main className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total de Projetos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}>
                    <FolderOpen className="w-6 h-6" style={{ color: BRAND.info }} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Com Épicos</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.comEpicos}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Com Features</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.comFeatures}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-100">
                    <Layers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Atualizados (7d)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.recentes}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-100">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center justify-between mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Buscar projetos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />Atualizar
            </Button>
          </div>

          {/* Projects */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-gray-500">Carregando projetos...</span>
            </div>
          ) : error ? (
            <Card className="border border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-700 font-medium">{error}</p>
                <Button variant="outline" onClick={loadData} className="mt-4">Tentar Novamente</Button>
              </CardContent>
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Tente buscar com outros termos' : 'Crie seu primeiro pipeline para começar'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push('/novo-pipeline')} style={{ background: BRAND.info }} className="text-white">
                    <Plus className="w-4 h-4 mr-2" />Criar Pipeline
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.project_id || project.nome_projeto} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.info}15` }}>
                          <FolderKanban className="w-6 h-6" style={{ color: BRAND.info }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{project.nome_projeto}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                              {getAnalysisLabel(project.ultima_analysis_type)}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{formatDate(project.ultima_atualizacao)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Dropdown de Relatórios - mostra opções disponíveis */}
                        {hasArtefatos(project) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              >
                                <FileBarChart2 className="w-4 h-4 mr-2" />
                                Relatórios
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/epicos?projeto=${project.project_id}`)}>
                                <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                                Backlog de Épicos
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/features?projeto=${project.project_id}`)}>
                                <Layers className="w-4 h-4 mr-2 text-violet-500" />
                                Features
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/riscos?projeto=${project.project_id}`)}>
                                <Shield className="w-4 h-4 mr-2 text-amber-500" />
                                Riscos e Premissas
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/relatorios/cronograma?projeto=${project.project_id}`)}>
                                <GanttChart className="w-4 h-4 mr-2 text-emerald-500" />
                                Cronograma
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button variant="outline" size="sm" onClick={() => handleViewProject(project)}>
                          <Eye className="w-4 h-4 mr-2" />Ver Detalhes
                        </Button>
                        {/* Botao Continuar - só mostra se projeto não está completo */}
                        {!isProjectComplete(project) && (
                          <Button size="sm" onClick={() => handleContinueProject(project)} style={{ background: BRAND.info }} className="text-white">
                            Continuar<ChevronRight className="w-4 h-4 ml-1" />
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
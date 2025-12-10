// src/app/projeto/[id]/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { 
  codeAIService,
  type ProjectFullState,
  type EpicoItem,
  type FeatureItem,
  ANALYSIS_TYPE_LABELS,
} from '@/lib/api/codeai-service'
import { 
  ArrowLeft, Clock, CheckCircle, FileText, Layers, Calendar, AlertTriangle, 
  Loader2, RefreshCw, Play, User, Users
} from 'lucide-react'

export default function ProjetoDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth()
  
  const [projectState, setProjectState] = useState<ProjectFullState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('epicos')

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
      const state = await codeAIService.getProjectReports(projectId)
      setProjectState(state)
    } catch (err) {
      console.error('Erro ao carregar projeto:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const handleContinuePipeline = () => {
    if (!projectState?.resumo) return
    const params = new URLSearchParams({ nome: projectState.resumo.nome_projeto, id: projectState.resumo.project_id })
    router.push(`/novo-pipeline?${params.toString()}`)
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  const epicosCount = projectState?.epicos?.epicos_report?.length || 0
  const featuresCount = projectState?.features?.features_report?.length || 0
  const hasTeams = projectState?.times_descricao !== null
  const hasAllocation = projectState?.alocacao_times !== null
  const hasPremissas = projectState?.premissas_riscos !== null

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
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
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard')}><ArrowLeft className="w-4 h-4 mr-2" />Voltar</Button>
              <Button onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" />Tentar Novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="" user={{ name: user.name, email: user.email }} onLogout={logout} />

      <div className="ml-56">
        <header className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}><ArrowLeft className="w-4 h-4" /></Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{projectState?.resumo?.nome_projeto || 'Projeto'}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">
                    {projectState?.resumo?.ultima_analysis_type ? ANALYSIS_TYPE_LABELS[projectState.resumo.ultima_analysis_type as keyof typeof ANALYSIS_TYPE_LABELS] : 'Sem análises'}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(projectState?.resumo?.ultima_atualizacao)}</span>
                  <span className="text-sm text-gray-500 flex items-center gap-1"><User className="w-3 h-3" />{projectState?.resumo?.usuario_executor}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
              <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white"><Play className="w-4 h-4 mr-2" />Continuar Pipeline</Button>
            </div>
          </div>
        </header>

        <main className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            <Card className={`border shadow-sm ${epicosCount > 0 ? 'border-green-200 bg-green-50' : ''}`}>
              <CardContent className="p-4 text-center">
                <FileText className={`w-8 h-8 mx-auto mb-2 ${epicosCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-2xl font-bold">{epicosCount}</p>
                <p className="text-xs text-gray-500">Épicos</p>
              </CardContent>
            </Card>
            <Card className={`border shadow-sm ${featuresCount > 0 ? 'border-green-200 bg-green-50' : ''}`}>
              <CardContent className="p-4 text-center">
                <Layers className={`w-8 h-8 mx-auto mb-2 ${featuresCount > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-2xl font-bold">{featuresCount}</p>
                <p className="text-xs text-gray-500">Features</p>
              </CardContent>
            </Card>
            <Card className={`border shadow-sm ${hasTeams ? 'border-green-200 bg-green-50' : ''}`}>
              <CardContent className="p-4 text-center">
                <Users className={`w-8 h-8 mx-auto mb-2 ${hasTeams ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-2xl font-bold">{hasTeams ? '✓' : '-'}</p>
                <p className="text-xs text-gray-500">Times</p>
              </CardContent>
            </Card>
            <Card className={`border shadow-sm ${hasAllocation ? 'border-green-200 bg-green-50' : ''}`}>
              <CardContent className="p-4 text-center">
                <Calendar className={`w-8 h-8 mx-auto mb-2 ${hasAllocation ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-2xl font-bold">{hasAllocation ? '✓' : '-'}</p>
                <p className="text-xs text-gray-500">Alocação</p>
              </CardContent>
            </Card>
            <Card className={`border shadow-sm ${hasPremissas ? 'border-green-200 bg-green-50' : ''}`}>
              <CardContent className="p-4 text-center">
                <AlertTriangle className={`w-8 h-8 mx-auto mb-2 ${hasPremissas ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-2xl font-bold">{hasPremissas ? '✓' : '-'}</p>
                <p className="text-xs text-gray-500">Premissas</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="epicos" className="flex items-center gap-2"><FileText className="w-4 h-4" />Épicos ({epicosCount})</TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2"><Layers className="w-4 h-4" />Features ({featuresCount})</TabsTrigger>
              <TabsTrigger value="times" className="flex items-center gap-2"><Users className="w-4 h-4" />Times</TabsTrigger>
              <TabsTrigger value="alocacao" className="flex items-center gap-2"><Calendar className="w-4 h-4" />Alocação</TabsTrigger>
              <TabsTrigger value="premissas" className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Premissas</TabsTrigger>
            </TabsList>

            <TabsContent value="epicos">
              {epicosCount === 0 ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum épico criado</h3>
                    <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white"><Play className="w-4 h-4 mr-2" />Ir para Pipeline</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {projectState?.epicos?.epicos_report?.map((epico: EpicoItem) => (
                    <Card key={epico.id} className="border shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="text-gray-500">#{epico.id}</Badge>
                              <Badge variant="outline" className={
                                epico.prioridade === 'Alta' ? 'text-red-600 border-red-200 bg-red-50' :
                                epico.prioridade === 'Media' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' :
                                'text-green-600 border-green-200 bg-green-50'
                              }>{epico.prioridade || 'Media'}</Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{epico.titulo}</h3>
                            <p className="text-gray-600">{epico.descricao}</p>
                          </div>
                          {epico.estimativa_sprints && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">{epico.estimativa_sprints} Sprints</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="features">
              {featuresCount === 0 ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma feature criada</h3>
                    <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white"><Play className="w-4 h-4 mr-2" />Ir para Pipeline</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {projectState?.features?.features_report?.map((feature: FeatureItem) => (
                    <Card key={feature.id} className="border shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-gray-500">F-{feature.id}</Badge>
                          <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50">Épico #{feature.epico_id}</Badge>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.nome}</h4>
                        <p className="text-sm text-gray-600 mb-3">{feature.descricao}</p>
                        {(feature['critério_de_aceite'] || feature.criterio_de_aceite) && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-semibold text-gray-500 mb-1">CRITÉRIO DE ACEITE</p>
                            <p className="text-sm text-gray-600 flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {feature['critério_de_aceite'] || feature.criterio_de_aceite}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="times">
              {!hasTeams ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum time definido</h3>
                    <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white"><Play className="w-4 h-4 mr-2" />Ir para Pipeline</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Estrutura de Times</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(projectState?.times_descricao, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="alocacao">
              {!hasAllocation ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma alocação definida</h3>
                    <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white"><Play className="w-4 h-4 mr-2" />Ir para Pipeline</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Alocação de Recursos</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(projectState?.alocacao_times, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="premissas">
              {!hasPremissas ? (
                <Card className="border shadow-sm">
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma premissa definida</h3>
                    <Button onClick={handleContinuePipeline} style={{ background: BRAND.info }} className="text-white"><Play className="w-4 h-4 mr-2" />Ir para Pipeline</Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Premissas e Riscos</h3>
                    <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">{JSON.stringify(projectState?.premissas_riscos, null, 2)}</pre>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
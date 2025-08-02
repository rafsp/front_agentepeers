// src/app/dashboard/new-analysis/page.tsx - VERSÃO COMPLETA

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GitBranch, Play, Loader2, Info, CheckCircle, Clock, Zap, Shield, Search, Filter } from 'lucide-react'
import { ConnectivityStatus } from '@/components/connectivity-status'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'

// Tipos de análise completos
interface AnalysisType {
  id: string
  name: string
  description: string
  icon: string
  category: 'analysis' | 'refactoring' | 'testing' | 'documentation' | 'security' | 'infrastructure'
  complexity: 'baixa' | 'moderada' | 'alta' | 'muito-alta'
  duration: string
  outputType: 'report' | 'code' | 'tests' | 'documentation' | 'commits'
  requiresApproval: boolean
  supportsBranches: boolean
  supportsCommits: boolean
}

const ANALYSIS_TYPES: Record<string, AnalysisType> = {
  // === ANÁLISES PRINCIPAIS ===
  design: {
    id: 'design',
    name: 'Análise de Design',
    description: 'Auditoria técnica profunda de arquitetura, qualidade de código e princípios SOLID',
    icon: '🏗️',
    category: 'analysis',
    complexity: 'alta',
    duration: '10-15 min',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  seguranca: {
    id: 'seguranca',
    name: 'Auditoria de Segurança',
    description: 'Análise detalhada de vulnerabilidades baseada no OWASP Top 10 e práticas de DevSecOps',
    icon: '🔒',
    category: 'security',
    complexity: 'muito-alta',
    duration: '15-25 min',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  pentest: {
    id: 'pentest',
    name: 'Plano de Pentest',
    description: 'Planejamento estratégico de testes de penetração usando metodologia PTES e MITRE ATT&CK',
    icon: '🎯',
    category: 'security',
    complexity: 'muito-alta',
    duration: '20-30 min',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  terraform: {
    id: 'terraform',
    name: 'Análise de Terraform',
    description: 'Auditoria completa de infraestrutura como código: segurança, custos e melhores práticas',
    icon: '☁️',
    category: 'infrastructure',
    complexity: 'alta',
    duration: '12-18 min',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  relatorio_teste_unitario: {
    id: 'relatorio_teste_unitario',
    name: 'Relatório de Testes',
    description: 'Análise de cobertura de testes e identificação de gaps de testabilidade',
    icon: '📊',
    category: 'testing',
    complexity: 'moderada',
    duration: '8-12 min',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  
  // === AÇÕES EXECUTÁVEIS ===
  refatoracao: {
    id: 'refatoracao',
    name: 'Refatoração de Código',
    description: 'Aplica refatorações automáticas baseadas em princípios de Clean Code e padrões',
    icon: '⚡',
    category: 'refactoring',
    complexity: 'alta',
    duration: '15-25 min',
    outputType: 'code',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  refatorador: {
    id: 'refatorador',
    name: 'Refatorador Automático',
    description: 'Ferramenta avançada de refatoração com detecção de code smells e aplicação de padrões',
    icon: '🔧',
    category: 'refactoring',
    complexity: 'muito-alta',
    duration: '20-35 min',
    outputType: 'code',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  escrever_testes: {
    id: 'escrever_testes',
    name: 'Criar Testes Unitários',
    description: 'Gera testes unitários abrangentes com base na análise do código existente',
    icon: '🧪',
    category: 'testing',
    complexity: 'alta',
    duration: '12-20 min',
    outputType: 'tests',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  agrupamento_testes: {
    id: 'agrupamento_testes',
    name: 'Agrupar Testes',
    description: 'Organiza e agrupa testes existentes em categorias lógicas e suítes temáticas',
    icon: '📦',
    category: 'testing',
    complexity: 'moderada',
    duration: '8-15 min',
    outputType: 'tests',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  agrupamento_design: {
    id: 'agrupamento_design',
    name: 'Agrupar Melhorias',
    description: 'Agrupa melhorias de design em commits temáticos e organizados',
    icon: '📋',
    category: 'refactoring',
    complexity: 'moderada',
    duration: '10-15 min',
    outputType: 'commits',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  docstring: {
    id: 'docstring',
    name: 'Documentação de Código',
    description: 'Gera docstrings detalhadas e documentação técnica para funções e classes',
    icon: '📚',
    category: 'documentation',
    complexity: 'baixa',
    duration: '5-10 min',
    outputType: 'documentation',
    requiresApproval: false,
    supportsBranches: true,
    supportsCommits: true
  }
}

const CATEGORIES = {
  analysis: { name: 'Análises', icon: '📊', color: 'blue' },
  security: { name: 'Segurança', icon: '🔒', color: 'red' },
  refactoring: { name: 'Refatoração', icon: '⚡', color: 'yellow' },
  testing: { name: 'Testes', icon: '🧪', color: 'green' },
  documentation: { name: 'Documentação', icon: '📚', color: 'purple' },
  infrastructure: { name: 'Infraestrutura', icon: '☁️', color: 'gray' }
}

const COMPLEXITY_COLORS = {
  'baixa': 'bg-green-100 text-green-800',
  'moderada': 'bg-yellow-100 text-yellow-800', 
  'alta': 'bg-orange-100 text-orange-800',
  'muito-alta': 'bg-red-100 text-red-800'
}

export default function NewAnalysisPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { startAnalysisJob } = useJobStore()
  
  // Estados do formulário
  const [repository, setRepository] = useState('')
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showOnlyExecutable, setShowOnlyExecutable] = useState(false)

  // Filtrar tipos de análise
  const filteredAnalysisTypes = Object.values(ANALYSIS_TYPES).filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || type.category === selectedCategory
    const matchesExecutable = !showOnlyExecutable || type.supportsCommits
    
    return matchesSearch && matchesCategory && matchesExecutable
  })

  // Agrupar por categoria
  const groupedTypes = filteredAnalysisTypes.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = []
    }
    acc[type.category].push(type)
    return acc
  }, {} as Record<string, AnalysisType[]>)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repository || !selectedAnalysisType) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Repositório e tipo de análise são obrigatórios.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const jobId = await startAnalysisJob({
        repo_name: repository,
        analysis_type: selectedAnalysisType,
        branch_name: branch || undefined,
        instrucoes_extras: instructions || undefined
      })

      const selectedType = ANALYSIS_TYPES[selectedAnalysisType]
      
      toast({
        title: 'Análise iniciada!',
        description: `${selectedType.name} foi iniciada para ${repository}`,
      })

      // Redirecionar baseado se requer aprovação
      if (selectedType.requiresApproval) {
        router.push(`/dashboard/jobs/${jobId}`)
      } else {
        router.push('/dashboard/jobs')
      }

    } catch (error) {
      toast({
        title: 'Erro ao iniciar análise',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">Nova Análise de Código</h1>
            <p className="text-muted-foreground">
              Configure uma análise inteligente para seu repositório
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status de conectividade */}
        <ConnectivityStatus className="mb-6" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Configuração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Repositório *
                  </label>
                  <Input
                    placeholder="ex: usuario/meu-repositorio"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: usuário/repositório
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Branch (opcional)
                  </label>
                  <Input
                    placeholder="main, develop, feature/..."
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Instruções Extras
                  </label>
                  <Textarea
                    placeholder="Contexto adicional, pontos de atenção..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Análise Selecionada */}
                {selectedAnalysisType && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{ANALYSIS_TYPES[selectedAnalysisType].icon}</span>
                      <span className="font-medium">{ANALYSIS_TYPES[selectedAnalysisType].name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {ANALYSIS_TYPES[selectedAnalysisType].description}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={COMPLEXITY_COLORS[ANALYSIS_TYPES[selectedAnalysisType].complexity]}>
                        {ANALYSIS_TYPES[selectedAnalysisType].complexity}
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {ANALYSIS_TYPES[selectedAnalysisType].duration}
                      </Badge>
                      {ANALYSIS_TYPES[selectedAnalysisType].supportsCommits && (
                        <Badge variant="outline">
                          <Zap className="h-3 w-3 mr-1" />
                          Executável
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleSubmit}
                  className="w-full" 
                  disabled={!repository || !selectedAnalysisType || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Análise
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Seletor de Análises */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Tipos de Análise Disponíveis
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  {/* Busca */}
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar análises..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Filtro por categoria */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">Todas categorias</option>
                    {Object.entries(CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Filtro executáveis */}
                  <Button
                    variant={showOnlyExecutable ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowOnlyExecutable(!showOnlyExecutable)}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Executáveis
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {Object.entries(groupedTypes).map(([categoryKey, types]) => {
                  const category = CATEGORIES[categoryKey as keyof typeof CATEGORIES]
                  
                  return (
                    <div key={categoryKey} className="mb-8 last:mb-0">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">{category.icon}</span>
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <Badge variant="outline">{types.length}</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        {types.map((type) => (
                          <div
                            key={type.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedAnalysisType === type.id
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedAnalysisType(type.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{type.icon}</span>
                                <h4 className="font-medium">{type.name}</h4>
                              </div>
                              {selectedAnalysisType === type.id && (
                                <CheckCircle className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {type.description}
                            </p>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Badge 
                                variant="secondary"
                                className={COMPLEXITY_COLORS[type.complexity]}
                              >
                                {type.complexity}
                              </Badge>
                              
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {type.duration}
                              </Badge>
                              
                              {type.requiresApproval && (
                                <Badge variant="outline" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Aprovação
                                </Badge>
                              )}
                              
                              {type.supportsCommits && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto-commit
                                </Badge>
                              )}
                              
                              <Badge variant="outline" className="text-xs">
                                {type.outputType === 'report' && '📄 Relatório'}
                                {type.outputType === 'code' && '💻 Código'}
                                {type.outputType === 'tests' && '🧪 Testes'}
                                {type.outputType === 'documentation' && '📚 Docs'}
                                {type.outputType === 'commits' && '📝 Commits'}
                              </Badge>
                            </div>
                            
                            {type.requiresApproval && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <Info className="h-3 w-3 inline mr-1" />
                                Requer aprovação antes da execução
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                
                {filteredAnalysisTypes.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma análise encontrada</h3>
                    <p className="text-muted-foreground">
                      Tente ajustar os filtros ou termo de busca
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">💡 Dicas</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• <strong>Análises:</strong> Geram relatórios detalhados</p>
                  <p>• <strong>Executáveis:</strong> Fazem mudanças no código</p>
                  <p>• <strong>Aprovação:</strong> Você revisa antes da execução</p>
                  <p>• <strong>Auto-commit:</strong> Aplica mudanças automaticamente</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">⚡ Fluxo</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>1. Configure repositório e tipo</p>
                  <p>2. Análise é executada pela IA</p>
                  <p>3. Revise o relatório gerado</p>
                  <p>4. Aprove mudanças (se aplicável)</p>
                  <p>5. Mudanças são aplicadas automaticamente</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
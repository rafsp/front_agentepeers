'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  GitBranch, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Github, 
  ExternalLink,
  Info,
  Zap,
  Shield,
  Code,
  Server,
  HelpCircle
} from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import { JobApprovalModal } from '@/components/job-approval-modal'

// Configuração dos tipos de análise
const analysisTypes = {
  design: {
    label: 'Análise de Design',
    description: 'Avalia arquitetura, padrões de design e qualidade do código',
    icon: Code,
    color: 'bg-blue-100 text-blue-800',
    examples: ['SOLID', 'Clean Architecture', 'Code Smells', 'Refatoração'],
    recommended: true
  },
  relatorio_teste_unitario: {
    label: 'Relatório de Testes',
    description: 'Identifica gaps de cobertura e sugere testes unitários',
    icon: Shield,
    color: 'bg-green-100 text-green-800',
    examples: ['Cobertura', 'Testes Unitários', 'Casos de Borda', 'Mocks'],
    recommended: false
  },
  security: {
    label: 'Análise de Segurança',
    description: 'Identifica vulnerabilidades baseado no OWASP Top 10',
    icon: Shield,
    color: 'bg-red-100 text-red-800',
    examples: ['OWASP Top 10', 'Injeção SQL', 'XSS', 'Autenticação'],
    recommended: false,
    comingSoon: true
  },
  pentest: {
    label: 'Pentest Automatizado',
    description: 'Simula ataques para identificar falhas de segurança',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-800',
    examples: ['Simulação de Ataques', 'Força Bruta', 'Bypass', 'Escalação'],
    recommended: false,
    comingSoon: true
  },
  terraform: {
    label: 'Infraestrutura (Terraform)',
    description: 'Avalia configurações de infraestrutura como código',
    icon: Server,
    color: 'bg-purple-100 text-purple-800',
    examples: ['IaC', 'Compliance', 'Best Practices', 'Custos'],
    recommended: false,
    comingSoon: true
  }
} as const

type AnalysisType = keyof typeof analysisTypes

export default function NewAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { startAnalysisJob, jobs, testConnection, isConnected } = useJobStore()
  
  // Estados do formulário
  const [repository, setRepository] = useState('')
  const [analysisType, setAnalysisType] = useState<AnalysisType>('design')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  
  // Estados de UI
  const [repositoryError, setRepositoryError] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Pré-preencher com parâmetros da URL
  useEffect(() => {
    const repoParam = searchParams.get('repo')
    if (repoParam) {
      setRepository(repoParam)
    }
  }, [searchParams])

  // Testar conexão ao carregar
  useEffect(() => {
    testConnection()
  }, [testConnection])

  // Validação do repositório
  const validateRepository = (repo: string) => {
    if (!repo) {
      setRepositoryError('Repositório é obrigatório')
      return false
    }

    // Remover URL completa se fornecida
    const cleanRepo = repo
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\.git$/, '')
      .replace(/\/$/, '')

    // Validar formato usuario/repo
    const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/
    if (!repoRegex.test(cleanRepo)) {
      setRepositoryError('Formato deve ser: usuario/repositorio')
      return false
    }

    setRepositoryError('')
    setRepository(cleanRepo)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    

    if (!validateRepository(repository)) {
      return
    }

    if (!analysisType) {
      toast({
        title: 'Erro',
        description: 'Selecione um tipo de análise',
        variant: 'destructive'
      })
      return
    }

    // Verificar se tipo está disponível
    if (analysisTypes[analysisType].comingSoon) {
      toast({
        title: 'Em breve',
        description: 'Este tipo de análise estará disponível em breve',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const jobId = await startAnalysisJob({
        repo_name: repository,
        analysis_type: analysisType,
        branch_name: branch || undefined,
        instrucoes_extras: instructions || undefined
      })

      setCreatedJobId(jobId)

      toast({
        title: 'Análise iniciada!',
        description: 'A análise foi criada e está sendo processada.',
      })

    } catch (error) {
      console.error('Erro ao iniciar análise:', error)
      toast({
        title: 'Erro ao iniciar análise',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createdJob = createdJobId ? jobs[createdJobId] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nova Análise</h1>
              <p className="text-sm text-muted-foreground">
                Configure uma nova análise de código com IA
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Formulário Principal */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Configuração da Análise
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={isConnected ? 'success' : 'destructive'}>
                    {isConnected ? 'Backend Conectado' : 'Backend Desconectado'}
                  </Badge>
                  {!isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection()}
                    >
                      Reconectar
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Repositório */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Repositório GitHub *
                    </label>
                    <Input
                      placeholder="ex: microsoft/vscode ou https://github.com/microsoft/vscode"
                      value={repository}
                      onChange={(e) => {
                        setRepository(e.target.value)
                        setRepositoryError('')
                      }}
                      onBlur={(e) => validateRepository(e.target.value)}
                      className={repositoryError ? 'border-red-500' : ''}
                    />
                    {repositoryError && (
                      <p className="text-xs text-red-600 mt-1">{repositoryError}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Cole a URL completa ou use o formato usuario/repositorio
                    </p>
                  </div>

                  {/* Tipo de Análise */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">
                      Tipo de Análise *
                    </label>
                    <div className="grid gap-3">
                      {Object.entries(analysisTypes).map(([key, config]) => {
                        const Icon = config.icon
                        const isSelected = analysisType === key
                        const isDisabled = config.comingSoon

                        return (
                          <div
                            key={key}
                            className={`
                              relative border rounded-lg p-4 cursor-pointer transition-all
                              ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                            onClick={() => !isDisabled && setAnalysisType(key as AnalysisType)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${config.color}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{config.label}</h3>
                                  {config.recommended && (
                                    <Badge variant="default" className="text-xs">Recomendado</Badge>
                                  )}
                                  {config.comingSoon && (
                                    <Badge variant="outline" className="text-xs">Em breve</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {config.description}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {config.examples.map((example) => (
                                    <Badge key={example} variant="secondary" className="text-xs">
                                      {example}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Configurações Avançadas */}
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="p-0 h-auto font-medium"
                    >
                      {showAdvanced ? 'Ocultar' : 'Mostrar'} configurações avançadas
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                      {/* Branch */}
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          Branch (opcional)
                        </label>
                        <Input
                          placeholder="ex: main, develop, feature/nova-funcionalidade"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Se não especificado, será usada a branch padrão do repositório
                        </p>
                      </div>

                      {/* Instruções Extras */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Instruções Extras (opcional)
                        </label>
                        <Textarea
                          placeholder="Instruções específicas para a análise, pontos de atenção, contexto adicional..."
                          value={instructions}
                          onChange={(e) => setInstructions(e.target.value)}
                          rows={4}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Estas instruções serão consideradas pelo agente de IA durante a análise
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botão de Submit */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={!repository || !analysisType || isLoading || !isConnected || analysisTypes[analysisType].comingSoon}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Iniciando Análise...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Análise
                      </>
                    )}
                  </Button>

                  {!isConnected && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Backend Desconectado</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Verifique se o backend está rodando em http://localhost:8000
                      </p>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar com Informações */}
          <div className="space-y-6">
            {/* Como Funciona */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Info className="h-4 w-4" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">1</div>
                  <div>
                    <p className="font-medium">Análise Inicial</p>
                    <p className="text-muted-foreground">IA lê e analisa seu código</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">2</div>
                  <div>
                    <p className="font-medium">Relatório Gerado</p>
                    <p className="text-muted-foreground">Apresenta achados e sugestões</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">3</div>
                  <div>
                    <p className="font-medium">Sua Aprovação</p>
                    <p className="text-muted-foreground">Revise e aprove as mudanças</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">4</div>
                  <div>
                    <p className="font-medium">Implementação</p>
                    <p className="text-muted-foreground">Aplica melhorias automaticamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-4 w-4" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">✨ Primeira vez?</p>
                  <p className="text-blue-800">Use a análise de <strong>Design</strong> para uma visão geral da qualidade do código.</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900">🎯 Para melhores resultados</p>
                  <p className="text-green-800">Adicione instruções específicas sobre áreas que deseja focar.</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-900">⚡ Repositórios grandes</p>
                  <p className="text-yellow-800">A análise pode levar alguns minutos para repositórios com muitos arquivos.</p>
                </div>
              </CardContent>
            </Card>

            {/* Exemplos de Repositórios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Github className="h-4 w-4" />
                  Exemplos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => setRepository('microsoft/vscode')}
                >
                  <div className="text-left">
                    <p className="font-medium">microsoft/vscode</p>
                    <p className="text-xs text-muted-foreground">Editor de código popular</p>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => setRepository('facebook/react')}
                >
                  <div className="text-left">
                    <p className="font-medium">facebook/react</p>
                    <p className="text-xs text-muted-foreground">Biblioteca JavaScript</p>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => setRepository('nodejs/node')}
                >
                  <div className="text-left">
                    <p className="font-medium">nodejs/node</p>
                    <p className="text-xs text-muted-foreground">Runtime JavaScript</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Aprovação - aparece automaticamente quando job é criado */}
      <JobApprovalModal
        job={createdJob}
        isOpen={!!createdJob && createdJob.status === 'pending_approval'}
        onClose={() => {
          setCreatedJobId(null)
          router.push('/dashboard/jobs')
        }}
      />
    </div>
  )
}
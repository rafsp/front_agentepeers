'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GitBranch, Play, Loader2, Github, Refresh, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useAuth } from '@/lib/auth/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { githubService, GitHubRepository, GitHubBranch } from '@/lib/services/github-service'
import { backendService } from '@/lib/services/backend-service'
import { useCompanyStore } from '@/stores/company-store'
import { useScheduledAnalysisStore } from '@/stores/scheduled-analysis-store'

export default function NewAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { addJob } = useJobStore()
  const { githubToken } = useAuth()
  const { activePolicyId, policies } = useCompanyStore()
  const { analyses: scheduledAnalyses } = useScheduledAnalysisStore()
  
  const [repository, setRepository] = useState('')
  const [analysisType, setAnalysisType] = useState('')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useBackend, setUseBackend] = useState(true) // Toggle entre backend real e simulação
  
  // GitHub integration
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [branches, setBranches] = useState<GitHubBranch[]>([])
  const [isLoadingRepos, setIsLoadingRepos] = useState(false)
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null)
  
  // URL params
  const preselectedRepo = searchParams.get('repo')
  const scheduledAnalysisId = searchParams.get('scheduled')

  useEffect(() => {
    if (preselectedRepo) {
      setRepository(preselectedRepo)
      loadRepositoryDetails(preselectedRepo)
    }
    
    if (scheduledAnalysisId && scheduledAnalyses[scheduledAnalysisId]) {
      const scheduled = scheduledAnalyses[scheduledAnalysisId]
      setRepository(scheduled.repository)
      setBranch(scheduled.branch)
      setAnalysisType(scheduled.analysisType)
      setInstructions(scheduled.instructions || '')
    }
    
    if (githubToken) {
      loadRepositories()
    }
  }, [preselectedRepo, scheduledAnalysisId, githubToken])

  const loadRepositories = async () => {
    if (!githubToken) return
    
    setIsLoadingRepos(true)
    try {
      const repos = await githubService.getUserRepositories(githubToken)
      setRepositories(repos)
    } catch (error) {
      toast({
        title: 'Erro ao carregar repositórios',
        description: 'Verifique sua configuração do GitHub.',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingRepos(false)
    }
  }

  const loadRepositoryDetails = async (repoFullName: string) => {
    if (!githubToken) return
    
    const [owner, repo] = repoFullName.split('/')
    if (!owner || !repo) return

    setIsLoadingBranches(true)
    try {
      const [repoDetails, branchList] = await Promise.all([
        repositories.find(r => r.full_name === repoFullName) || 
        githubService.getUserRepositories(githubToken).then(repos => 
          repos.find(r => r.full_name === repoFullName)
        ),
        githubService.getRepositoryBranches(githubToken, owner, repo)
      ])

      if (repoDetails) {
        setSelectedRepo(repoDetails as GitHubRepository)
        setBranch(repoDetails.default_branch)
      }
      setBranches(branchList)
    } catch (error) {
      toast({
        title: 'Erro ao carregar branches',
        description: 'Não foi possível carregar os detalhes do repositório.',
        variant: 'destructive'
      })
    } finally {
      setIsLoadingBranches(false)
    }
  }

  const handleRepositoryChange = (repoFullName: string) => {
    setRepository(repoFullName)
    setBranch('')
    setBranches([])
    setSelectedRepo(null)
    
    if (repoFullName && githubToken) {
      loadRepositoryDetails(repoFullName)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repository || !analysisType) return

    setIsLoading(true)

    try {
      const jobId = `job_${Date.now()}`
      
      if (useBackend) {
        // Tentar usar o backend real
        try {
          const response = await backendService.startAnalysis({
            repo_name: repository,
            analysis_type: analysisType as any,
            branch_name: branch || undefined,
            instrucoes_extras: instructions || undefined
          })

          const newJob = {
            id: response.job_id,
            title: `Análise de ${repository}`,
            status: 'pending' as const,
            progress: 0,
            message: 'Aguardando aprovação...',
            repository,
            analysisType,
            branch,
            instructions,
            report: response.report
          }

          addJob(newJob)

          toast({
            title: 'Análise iniciada!',
            description: `A análise do repositório ${repository} foi iniciada. Revise o relatório e aprove para continuar.`,
          })

          router.push(`/dashboard/jobs`)
        } catch (backendError) {
          // Se o backend falhar, usar simulação
          console.warn('Backend não disponível, usando simulação:', backendError)
          await simulateAnalysis(jobId)
        }
      } else {
        // Usar simulação diretamente
        await simulateAnalysis(jobId)
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao iniciar a análise. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAnalysis = async (jobId: string) => {
    const newJob = {
      id: jobId,
      title: `Análise de ${repository}`,
      status: 'running' as const,
      progress: 0,
      message: 'Iniciando análise...',
      repository,
      analysisType,
      branch,
      instructions,
    }

    addJob(newJob)
    simulateJobProgress(jobId)

    toast({
      title: 'Análise iniciada (modo simulação)',
      description: `A análise do repositório ${repository} foi iniciada em modo simulação.`,
    })

    router.push('/dashboard/jobs')
  }

  const simulateJobProgress = (jobId: string) => {
    const { updateJob } = useJobStore.getState()
    let progress = 0

    const interval = setInterval(() => {
      progress += Math.random() * 20
      
      if (progress >= 100) {
        progress = 100
        updateJob(jobId, {
          status: 'completed',
          progress: 100,
          message: 'Análise concluída com sucesso!',
          completedAt: new Date(),
          report: generateSampleReport()
        })
        clearInterval(interval)
      } else {
        updateJob(jobId, {
          progress: Math.min(progress, 99),
          message: getProgressMessage(progress),
        })
      }
    }, 2000)
  }

  const generateSampleReport = () => {
    const activePolicy = policies.find(p => p.id === activePolicyId)
    const policyInfo = activePolicy ? `\n\n**Política Aplicada:** ${activePolicy.name}\n${activePolicy.description}` : ''
    
    return `# Relatório de Análise

## Repositório: ${repository}
## Tipo: ${analysisType}
## Branch: ${branch || 'padrão'}

### Resumo
A análise foi concluída com sucesso. Foram identificados alguns pontos de melhoria no código.

### Principais Descobertas
- Qualidade do código: Boa
- Cobertura de testes: 85%
- Vulnerabilidades: 2 de baixo risco
- Performance: Satisfatória

### Recomendações
1. Adicionar mais testes unitários
2. Corrigir vulnerabilidades identificadas
3. Otimizar consultas ao banco de dados
4. Implementar práticas de Clean Code

${policyInfo}

### Instruções Específicas
${instructions || 'Nenhuma instrução específica fornecida.'}
`
  }

  const getProgressMessage = (progress: number) => {
    if (progress < 20) return 'Clonando repositório...'
    if (progress < 40) return 'Analisando estrutura do código...'
    if (progress < 60) return 'Executando análise estática...'
    if (progress < 80) return 'Verificando padrões e boas práticas...'
    return 'Gerando relatório...'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Nova Análise de Código</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros para iniciar uma nova análise
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* GitHub Connection Status */}
          {!githubToken && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      GitHub não configurado
                    </p>
                    <p className="text-sm text-yellow-700">
                      Configure sua integração com GitHub para acessar seus repositórios
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/settings/github')}
                  >
                    <Github className="h-4 w-4 mr-2" />
                    Configurar GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Configuração da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Repository Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Repositório *
                  </label>
                  
                  {githubToken && repositories.length > 0 ? (
                    <div className="space-y-2">
                      <Select value={repository} onValueChange={handleRepositoryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um repositório" />
                        </SelectTrigger>
                        <SelectContent>
                          {repositories.map((repo) => (
                            <SelectItem key={repo.id} value={repo.full_name}>
                              <div className="flex items-center gap-2">
                                <span>{repo.name}</span>
                                {repo.private && (
                                  <Badge variant="secondary" className="text-xs">
                                    Privado
                                  </Badge>
                                )}
                                {repo.language && (
                                  <Badge variant="outline" className="text-xs">
                                    {repo.language}
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {isLoadingRepos && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Carregando repositórios...
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadRepositories}
                          disabled={isLoadingRepos}
                        >
                          <Refresh className="h-4 w-4 mr-2" />
                          Atualizar Lista
                        </Button>
                        
                        {selectedRepo && (
                          <a
                            href={selectedRepo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Ver no GitHub
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Input
                      placeholder="ex: usuario/meu-repositorio"
                      value={repository}
                      onChange={(e) => setRepository(e.target.value)}
                      required
                    />
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {githubToken ? 
                      'Selecione um repositório da sua conta GitHub ou digite manualmente' :
                      'Digite o nome do repositório no formato: usuário/repositório'
                    }
                  </p>
                </div>

                {/* Repository Details */}
                {selectedRepo && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium">{selectedRepo.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedRepo.description || 'Sem descrição'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span>Atualizado: {new Date(selectedRepo.updated_at).toLocaleDateString('pt-BR')}</span>
                            <span>Branch padrão: {selectedRepo.default_branch}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {selectedRepo.private && (
                            <Badge variant="secondary">Privado</Badge>
                          )}
                          {selectedRepo.language && (
                            <Badge variant="outline">{selectedRepo.language}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Branch Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Branch (opcional)
                  </label>
                  
                  {branches.length > 0 ? (
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.name} value={b.name}>
                            <div className="flex items-center gap-2">
                              <span>{b.name}</span>
                              {b.name === selectedRepo?.default_branch && (
                                <Badge variant="outline" className="text-xs">
                                  padrão
                                </Badge>
                              )}
                              {b.protected && (
                                <Badge variant="secondary" className="text-xs">
                                  protegida
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="ex: main, develop, feature/nova-funcionalidade"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  )}
                  
                  {isLoadingBranches && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Carregando branches...
                    </div>
                  )}
                </div>

                {/* Analysis Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tipo de Análise *
                  </label>
                  <Select value={analysisType} onValueChange={setAnalysisType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de análise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Análise de Design</SelectItem>
                      <SelectItem value="relatorio_teste_unitario">Relatório de Testes Unitários</SelectItem>
                      <SelectItem value="security">Análise de Segurança</SelectItem>
                      <SelectItem value="performance">Análise de Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Instructions */}
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
                </div>

                {/* Active Policy Info */}
                {activePolicyId && (
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Política da empresa será aplicada
                          </p>
                          <p className="text-sm text-green-700">
                            {policies.find(p => p.id === activePolicyId)?.name}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Backend Toggle (Development) */}
                {process.env.NODE_ENV === 'development' && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Modo de Desenvolvimento
                          </p>
                          <p className="text-sm text-blue-700">
                            {useBackend ? 'Tentando usar backend real' : 'Usando simulação'}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setUseBackend(!useBackend)}
                        >
                          {useBackend ? 'Usar Simulação' : 'Usar Backend'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!repository || !analysisType || isLoading}
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
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Zap, 
  Code2, 
  Shield, 
  TestTube2, 
  GitBranch, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  Github,
  Cpu,
  Layers,
  Target,
  Rocket,
  Brain,
  Users,
  Star,
  TrendingUp
} from 'lucide-react'

// Tipos
interface AnalysisJob {
  job_id: string
  repo_name: string
  analysis_type: string
  status: string
  message: string
  progress: number
  report?: string
  created_at: number
}

// Componente principal
export default function HomePage() {
  const [activeJob, setActiveJob] = useState<AnalysisJob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    repo_name: '',
    analysis_type: '',
    branch_name: 'main',
    instrucoes_extras: ''
  })
  
  const { toast } = useToast()

  // Polling para status do job
  useEffect(() => {
    if (!activeJob || activeJob.status === 'completed' || activeJob.status === 'failed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8000/status/${activeJob.job_id}`)
        if (response.ok) {
          const jobStatus = await response.json()
          setActiveJob(prev => prev ? { ...prev, ...jobStatus } : null)
          
          if (jobStatus.status === 'completed') {
            toast({
              title: "✅ Análise Concluída!",
              description: "Implementação realizada com sucesso.",
              variant: "default"
            })
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [activeJob, toast])

  // Iniciar análise
  const handleStartAnalysis = async () => {
    if (!formData.repo_name || !formData.analysis_type) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Preencha o nome do repositório e tipo de análise",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/start-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setActiveJob({
          job_id: result.job_id,
          repo_name: formData.repo_name,
          analysis_type: formData.analysis_type,
          status: 'pending_approval',
          message: result.message,
          progress: 25,
          report: result.report,
          created_at: Date.now()
        })
        
        toast({
          title: "🚀 Análise Iniciada!",
          description: "Revise o relatório e aprove para continuar.",
          variant: "default"
        })
      } else {
        throw new Error('Falha na requisição')
      }
    } catch (error) {
      toast({
        title: "❌ Erro na análise",
        description: "Verifique se o backend está rodando",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Aprovar/Rejeitar análise
  const handleJobAction = async (action: 'approve' | 'reject') => {
    if (!activeJob) return

    try {
      const response = await fetch('http://localhost:8000/update-job-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: activeJob.job_id,
          action
        })
      })

      if (response.ok) {
        const result = await response.json()
        setActiveJob(prev => prev ? { ...prev, status: result.status, message: result.message } : null)
        
        toast({
          title: action === 'approve' ? "✅ Aprovado!" : "❌ Rejeitado",
          description: result.message,
          variant: action === 'approve' ? "default" : "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar status",
        variant: "destructive"
      })
    }
  }

  // Configuração dos tipos de análise
  const analysisTypes = [
    {
      id: 'design',
      title: 'Análise de Design',
      description: 'Arquitetura, padrões e qualidade do código',
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'relatorio_teste_unitario',
      title: 'Análise de Testes',
      description: 'Cobertura e qualidade dos testes',
      icon: TestTube2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'pentest',
      title: 'Análise de Segurança',
      description: 'Vulnerabilidades e boas práticas',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string }> = {
      'pending_approval': { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
      'approved': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
      'workflow_started': { icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
      'completed': { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
      'failed': { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
      'rejected': { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50' }
    }
    return configs[status] || configs['pending_approval']
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="peers-nav">
        <div className="peers-container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-peers-blue rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-peers-lime" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-peers-blue">PEERS</h1>
                <p className="text-xs text-gray-500">AI Code Analysis</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="peers-nav-link">Dashboard</a>
              <a href="#" className="peers-nav-link">Análises</a>
              <a href="#" className="peers-nav-link">Relatórios</a>
              <a href="#" className="peers-nav-link">Configurações</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="peers-container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-peers-lime/20 text-peers-blue px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powered by AI Multi-Agents</span>
          </div>
          
          <h1 className="peers-heading-xl text-peers-blue mb-6">
            Análise Inteligente de Código
            <span className="block text-peers-lime">com IA Avançada</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transforme seu código com análises automáticas de arquitetura, testes e segurança. 
            Nossa IA identifica problemas e implementa soluções automaticamente.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Code2, label: 'Repositórios Analisados', value: '2.5K+' },
              { icon: TrendingUp, label: 'Melhorias Aplicadas', value: '15K+' },
              { icon: Users, label: 'Desenvolvedores', value: '500+' },
              { icon: Star, label: 'Taxa de Satisfação', value: '98%' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-peers-blue/10 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-peers-blue" />
                </div>
                <div className="text-2xl font-bold text-peers-blue">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulário de Análise */}
          <div className="space-y-6">
            <div className="peers-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="w-5 h-5 text-peers-blue" />
                  <span>Nova Análise</span>
                </CardTitle>
                <CardDescription>
                  Configure sua análise de código personalizada
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Repositório */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repositório GitHub
                  </label>
                  <Input
                    placeholder="ex: usuario/repositorio ou https://github.com/usuario/repo"
                    value={formData.repo_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, repo_name: e.target.value }))}
                    className="peers-input"
                  />
                </div>

                {/* Tipo de Análise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Análise
                  </label>
                  <div className="grid gap-3">
                    {analysisTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.analysis_type === type.id
                            ? 'border-peers-lime bg-peers-lime/10'
                            : 'border-gray-200 hover:border-peers-blue/30'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, analysis_type: type.id }))}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${type.bgColor}`}>
                            <type.icon className={`w-5 h-5 ${type.color}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{type.title}</h3>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch
                    </label>
                    <Input
                      placeholder="main"
                      value={formData.branch_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch_name: e.target.value }))}
                      className="peers-input"
                    />
                  </div>
                </div>

                {/* Instruções Extras */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instruções Adicionais (Opcional)
                  </label>
                  <Textarea
                    placeholder="Foque em performance, ignore arquivos de teste, etc..."
                    rows={3}
                    value={formData.instrucoes_extras}
                    onChange={(e) => setFormData(prev => ({ ...prev, instrucoes_extras: e.target.value }))}
                    className="peers-textarea"
                  />
                </div>

                {/* Botão de Análise */}
                <Button
                  onClick={handleStartAnalysis}
                  disabled={isLoading || !formData.repo_name || !formData.analysis_type}
                  className="btn-peers-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Iniciando Análise...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Iniciar Análise
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </div>
          </div>

          {/* Status e Relatório */}
          <div className="space-y-6">
            {activeJob ? (
              <>
                {/* Status Card */}
                <div className="peers-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Target className="w-5 h-5 text-peers-blue" />
                        <span>Status da Análise</span>
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`${getStatusConfig(activeJob.status).bg} ${getStatusConfig(activeJob.status).color} border-current`}
                      >
                        {activeJob.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Github className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{activeJob.repo_name}</span>
                      <Badge variant="secondary">{activeJob.analysis_type}</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{activeJob.progress}%</span>
                      </div>
                      <div className="peers-progress">
                        <div 
                          className="peers-progress-bar"
                          style={{ width: `${activeJob.progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">{activeJob.message}</p>

                    {activeJob.status === 'pending_approval' && (
                      <div className="flex space-x-3 pt-4">
                        <Button
                          onClick={() => handleJobAction('approve')}
                          className="btn-peers-secondary flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleJobAction('reject')}
                          variant="outline"
                          className="flex-1"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* Relatório */}
                {activeJob.report && (
                  <div className="peers-card">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Cpu className="w-5 h-5 text-peers-blue" />
                        <span>Relatório de Análise</span>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                          {activeJob.report}
                        </pre>
                      </div>
                    </CardContent>
                  </div>
                )}
              </>
            ) : (
              <div className="peers-card text-center py-12">
                <div className="w-16 h-16 bg-peers-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-peers-blue" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pronto para Analisar
                </h3>
                <p className="text-gray-600">
                  Configure uma análise para começar a otimizar seu código
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="text-center mb-16">
            <h2 className="peers-heading-lg text-peers-blue mb-4">
              Por que escolher PEERS?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma combina inteligência artificial avançada com expertise em desenvolvimento
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'IA Multi-Agentes',
                description: 'Diferentes especialistas de IA analisam aspectos específicos do seu código'
              },
              {
                icon: Zap,
                title: 'Implementação Automática',
                description: 'Não apenas identificamos problemas, mas implementamos as soluções automaticamente'
              },
              {
                icon: Shield,
                title: 'Segurança Integrada',
                description: 'Análise de vulnerabilidades e aplicação de melhores práticas de segurança'
              }
            ].map((feature, index) => (
              <div key={index} className="peers-card text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-peers-lime/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-peers-lime/30 transition-colors">
                  <feature.icon className="w-8 h-8 text-peers-blue" />
                </div>
                <h3 className="text-xl font-semibold text-peers-blue mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
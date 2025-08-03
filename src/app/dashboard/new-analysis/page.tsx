'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Wifi, 
  WifiOff,
  Code2,
  RefreshCw,
  BookOpen,
  Shield,
  Bug,
  FileCheck,
  Beaker,
  Server,
  Clock,
  Info
} from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import { JobApprovalModal } from '@/components/job-approval-modal'
import { mapAnalysisForBackend, type FrontendAnalysisType } from '@/lib/analysis-mapper'

// Definição das categorias e tipos de análise
const analysisCategories = {
  'Código & Arquitetura': [
    {
      value: 'design' as const,
      label: 'Análise de Design',
      description: 'Arquitetura, padrões SOLID, estrutura do projeto',
      icon: Code2,
      color: 'blue',
      complexity: 'Médio'
    },
    {
      value: 'refatoracao' as const,
      label: 'Refatoração',
      description: 'Clean code, melhorias de performance, simplificação',
      icon: RefreshCw,
      color: 'green',
      complexity: 'Médio'
    },
    {
      value: 'docstring' as const,
      label: 'Documentação',
      description: 'Docstrings, comentários, documentação de APIs',
      icon: BookOpen,
      color: 'indigo',
      complexity: 'Baixo'
    },
    {
      value: 'terraform' as const,
      label: 'Terraform/IaC',
      description: 'Infrastructure as Code, compliance, custos',
      icon: Server,
      color: 'orange',
      complexity: 'Alto'
    }
  ],
  'Segurança': [
    {
      value: 'security' as const,
      label: 'Análise de Segurança',
      description: 'Vulnerabilidades, OWASP, práticas de segurança',
      icon: Shield,
      color: 'red',
      complexity: 'Alto'
    },
    {
      value: 'pentest' as const,
      label: 'Penetration Testing',
      description: 'SAST, vetores de ataque, análise avançada',
      icon: Bug,
      color: 'red',
      complexity: 'Muito Alto'
    }
  ],
  'Testes & Qualidade': [
    {
      value: 'relatorio_teste_unitario' as const,
      label: 'Relatório de Testes',
      description: 'Cobertura atual, casos de borda, qualidade',
      icon: FileCheck,
      color: 'purple',
      complexity: 'Baixo'
    },
    {
      value: 'escrever_testes' as const,
      label: 'Criação de Testes',
      description: 'Gerar testes unitários e de integração',
      icon: Beaker,
      color: 'cyan',
      complexity: 'Médio'
    }
  ]
}

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'Baixo': return 'bg-green-100 text-green-700 border-green-200'
    case 'Médio': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'Alto': return 'bg-orange-100 text-orange-700 border-orange-200'
    case 'Muito Alto': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getIconColor = (color: string, selected: boolean) => {
  const colors = {
    blue: selected ? 'text-blue-600 bg-blue-100' : 'text-blue-500 bg-blue-50',
    green: selected ? 'text-green-600 bg-green-100' : 'text-green-500 bg-green-50',
    indigo: selected ? 'text-indigo-600 bg-indigo-100' : 'text-indigo-500 bg-indigo-50',
    red: selected ? 'text-red-600 bg-red-100' : 'text-red-500 bg-red-50',
    purple: selected ? 'text-purple-600 bg-purple-100' : 'text-purple-500 bg-purple-50',
    cyan: selected ? 'text-cyan-600 bg-cyan-100' : 'text-cyan-500 bg-cyan-50',
    orange: selected ? 'text-orange-600 bg-orange-100' : 'text-orange-500 bg-orange-50'
  }
  return colors[color as keyof typeof colors] || colors.blue
}

export default function NewAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { startAnalysisJob, jobs } = useJobStore()
  
  const urlRepo = searchParams.get('repo')
  
  const [repository, setRepository] = useState(urlRepo || '')
  const [analysisType, setAnalysisType] = useState<FrontendAnalysisType>('design')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const [showMappingInfo, setShowMappingInfo] = useState(false)

  // Função para testar conexão
  const testBackendConnection = async (): Promise<boolean> => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.status === 'online'
      }
      return false
    } catch (error) {
      return false
    }
  }

  useEffect(() => {
    handleTestConnection()
  }, [])

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    try {
      const isConnected = await testBackendConnection()
      setConnectionStatus(isConnected ? 'connected' : 'disconnected')
    } catch (error) {
      setConnectionStatus('disconnected')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repository || !analysisType) return

    if (connectionStatus !== 'connected') {
      await handleTestConnection()
    }

    setIsLoading(true)

    try {
      // 🔄 USAR O MAPEADOR INTELIGENTE
      const mappedData = mapAnalysisForBackend(analysisType, instructions)
      
      console.log('🔄 Mapeamento:', {
        frontend: analysisType,
        backend: mappedData.analysis_type,
        instructions: mappedData.instrucoes_extras.substring(0, 100) + '...'
      })

      const jobId = await startAnalysisJob({
        repo_name: repository,
        analysis_type: mappedData.analysis_type,
        branch_name: branch || undefined,
        instrucoes_extras: mappedData.instrucoes_extras
      })

      setCreatedJobId(jobId)

      toast({
        title: 'Análise iniciada!',
        description: `A análise do repositório ${repository} foi iniciada com sucesso.`,
      })

    } catch (error) {
      console.error('Erro ao iniciar análise:', error)
      toast({
        title: 'Erro ao iniciar análise',
        description: error instanceof Error ? error.message : 'Falha ao iniciar a análise.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getConnectionIcon = () => {
    if (isTestingConnection) return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
    if (connectionStatus === 'connected') return <Wifi className="h-5 w-5 text-green-600" />
    if (connectionStatus === 'disconnected') return <WifiOff className="h-5 w-5 text-red-600" />
    return <AlertCircle className="h-5 w-5 text-yellow-600" />
  }

  const createdJob = createdJobId ? jobs[createdJobId] : null
  
  // Encontrar a opção selecionada
  const selectedOption = Object.values(analysisCategories)
    .flat()
    .find(opt => opt.value === analysisType)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Análise de Código</h1>
            <p className="text-gray-600 mt-1">
              Escolha o tipo de análise e configure os parâmetros
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Status da Conexão */}
          <Card className={`border-2 ${connectionStatus === 'connected' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getConnectionIcon()}
                  <div>
                    <h3 className="font-semibold">
                      {connectionStatus === 'connected' ? 'Backend Online' : 'Backend Offline'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {connectionStatus === 'connected' 
                        ? 'Pronto para análises' 
                        : 'Verifique se o servidor está rodando'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowMappingInfo(!showMappingInfo)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Como Funciona
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                  >
                    {isTestingConnection ? 'Testando...' : 'Testar'}
                  </Button>
                </div>
              </div>
              
              {/* Info sobre o mapeamento */}
              {showMappingInfo && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-2">🔄 Mapeamento Inteligente</h4>
                      <p className="text-sm text-blue-800 mb-3">
                        O frontend oferece 8 tipos organizados por categoria, mas o backend usa apenas 2 tipos. 
                        O sistema faz mapeamento automático com instruções específicas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Repositório */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Repositório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="ex: usuario/meu-repositorio"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    required
                    className="text-lg"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Formato: owner/repository-name
                  </p>
                </div>
                
                <div>
                  <Input
                    placeholder="ex: main, develop, feature/nova-funcionalidade"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Branch (opcional) - se não especificado, usará a branch padrão
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tipos de Análise por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Tipo de Análise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(analysisCategories).map(([categoryName, options]) => (
                  <div key={categoryName}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {categoryName}
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {options.map((option) => {
                        const Icon = option.icon
                        const isSelected = analysisType === option.value
                        return (
                          <Card
                            key={option.value}
                            className={`cursor-pointer border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50 shadow-md' 
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                            onClick={() => setAnalysisType(option.value)}
                          >
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className={`p-3 rounded-xl ${getIconColor(option.color, isSelected)}`}>
                                    <Icon className="h-6 w-6" />
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    {option.label}
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-3">
                                    {option.description}
                                  </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Badge className={getComplexityColor(option.complexity)}>
                                    {option.complexity}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Instruções Extras */}
            <Card>
              <CardHeader>
                <CardTitle>Instruções Extras (opcional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Instruções específicas adicionais para a análise..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  ℹ️ O sistema já adiciona instruções automáticas específicas para cada tipo. 
                  Use este campo apenas para requisitos adicionais.
                </p>
              </CardContent>
            </Card>

            {/* Botão de Submit */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold" 
              disabled={!repository || !analysisType || isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Iniciando Análise...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Análise Inteligente
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Modal de Aprovação */}
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
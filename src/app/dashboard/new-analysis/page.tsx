// app/dashboard/new-analysis/page.tsx - VERSÃO MELHORADA
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
import { LoadingOverlay } from '@/components/loading-overlay'

// Tipos
type FrontendAnalysisType = 
  | 'design' 
  | 'refatoracao'
  | 'docstring'
  | 'security'
  | 'pentest'
  | 'relatorio_teste_unitario'
  | 'escrever_testes'
  | 'terraform'
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
      color: 'purple',
      complexity: 'Muito Alto'
    }
  ],
  'Testes & Qualidade': [
    {
      value: 'relatorio_teste_unitario' as const,
      label: 'Relatório de Testes',
      description: 'Análise de cobertura e qualidade dos testes',
      icon: FileCheck,
      color: 'yellow',
      complexity: 'Baixo'
    },
    {
      value: 'escrever_testes' as const,
      label: 'Criação de Testes',
      description: 'Geração automática de testes unitários',
      icon: Beaker,
      color: 'teal',
      complexity: 'Médio'
    }
  ]
}

export default function NewAnalysisPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { createJob, jobs } = useJobStore()

  // Estados do formulário
  const [repository, setRepository] = useState('')
  const [branch, setBranch] = useState('main')
  const [analysisType, setAnalysisType] = useState<FrontendAnalysisType | ''>('')
  const [extraInstructions, setExtraInstructions] = useState('')
  
  // Estados de controle
  const [isLoading, setIsLoading] = useState(false)
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'error'>('unknown')

  // Job atual
  const createdJob = createdJobId ? jobs[createdJobId] : null

  // Controlar quando mostrar o loading overlay
  const showLoadingOverlay = isLoading && (!createdJob || createdJob.status === 'pending')
  
  // Controlar quando mostrar o modal de aprovação
  const showApprovalModal = !!createdJob && createdJob.status === 'pending_approval'

  // Pré-preencher do query params
  useEffect(() => {
    const repoParam = searchParams.get('repo')
    const branchParam = searchParams.get('branch') 
    const typeParam = searchParams.get('type')

    if (repoParam) setRepository(repoParam)
    if (branchParam) setBranch(branchParam)
    if (typeParam && isValidAnalysisType(typeParam)) {
      setAnalysisType(typeParam as FrontendAnalysisType)
    }
  }, [searchParams])

  // Verificar status do backend
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch('https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net/health')
        if (response.ok) {
          setBackendStatus('connected')
        } else {
          setBackendStatus('error')
        }
      } catch (error) {
        setBackendStatus('error')
      }
    }

    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 10000) // Verificar a cada 10s
    return () => clearInterval(interval)
  }, [])

  const isValidAnalysisType = (type: string): boolean => {
    return Object.values(analysisCategories)
      .flat()
      .some(option => option.value === type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repository || !analysisType) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Repositório e tipo de análise são obrigatórios.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      const jobId = await createJob({
        title: `Análise de ${analysisType} - ${repository}`,
        repository,
        branch,
        analysisType: analysisType as FrontendAnalysisType,
        extraInstructions
      })

      setCreatedJobId(jobId)
      
      toast({
        title: 'Análise iniciada!',
        description: 'Gerando relatório inicial para aprovação...',
      })

    } catch (error) {
      console.error('Erro ao criar job:', error)
      toast({
        title: 'Erro ao iniciar análise',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Baixo': return 'bg-green-100 text-green-800'
      case 'Médio': return 'bg-blue-100 text-blue-800'
      case 'Alto': return 'bg-orange-100 text-orange-800'
      case 'Muito Alto': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
      green: 'border-green-300 bg-green-50 hover:bg-green-100',
      indigo: 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100',
      orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
      red: 'border-red-300 bg-red-50 hover:bg-red-100',
      purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
      yellow: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100',
      teal: 'border-teal-300 bg-teal-50 hover:bg-teal-100'
    }
    return colorMap[color] || 'border-gray-300 bg-gray-50 hover:bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Loading Overlay */}
      <LoadingOverlay
        isVisible={showLoadingOverlay}
        title="Iniciando Análise Inteligente"
        currentStep={createdJob?.status || 'pending_approval'}
        progress={createdJob?.progress}
        message={createdJob?.message}
        repository={repository}
        analysisType={analysisType}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nova Análise</h1>
                <p className="text-gray-600">Configure uma análise inteligente de código</p>
              </div>
            </div>
            
            {/* Status do Backend */}
            <div className="flex items-center gap-2">
              {backendStatus === 'connected' ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Backend Conectado</span>
                </div>
              ) : backendStatus === 'error' ? (
                <div className="flex items-center gap-2 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-sm">Backend Desconectado</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Verificando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações do Repositório */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  Informações do Repositório
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repositório *
                    </label>
                    <Input
                      placeholder="ex: username/repository-name"
                      value={repository}
                      onChange={(e) => setRepository(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch
                    </label>
                    <Input
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Análise */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Análise *</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(analysisCategories).map(([category, options]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {options.map((option) => (
                          <label
                            key={option.value}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all block ${
                              analysisType === option.value 
                                ? 'border-blue-500 bg-blue-100 ring-2 ring-blue-200' 
                                : getTypeColor(option.color)
                            }`}
                          >
                            <input
                              type="radio"
                              name="analysisType"
                              value={option.value}
                              checked={analysisType === option.value}
                              onChange={(e) => {
                                console.log('Selecionado:', e.target.value)
                                setAnalysisType(e.target.value as FrontendAnalysisType)
                              }}
                              className="sr-only"
                            />
                            <div className="flex items-start gap-3">
                              <option.icon className={`h-5 w-5 mt-0.5 ${
                                analysisType === option.value ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{option.label}</span>
                                  <Badge className={`text-xs ${getComplexityColor(option.complexity)}`}>
                                    {option.complexity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">{option.description}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instruções Extras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Instruções Extras (opcional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Instruções específicas adicionais para a análise..."
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  O sistema já adiciona instruções automáticas específicas para cada tipo. Use este campo apenas para requisitos adicionais.
                </p>
              </CardContent>
            </Card>

            {/* Botão de Submit */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold" 
              disabled={!repository || !analysisType || isLoading || backendStatus === 'error'}
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
        isOpen={showApprovalModal}
        onClose={() => {
          setCreatedJobId(null)
          router.push('/dashboard/jobs')
        }}
      />
    </div>
  )
}
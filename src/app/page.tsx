'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Code, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  Github, 
  FileCode, 
  TestTube,
  GitBranch,
  Sparkles,
  Activity,
  TrendingUp,
  Shield,
  Layers,
  Rocket,
  Star,
  Users,
  BarChart3,
  AlertCircle,
  Loader2,
  XCircle,
  Eye,
  X,
  RefreshCw,
  Settings,
  Terminal,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Download,
  CheckCircle2
} from 'lucide-react'

// Configuração da API
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Hook para toast simples
const useToast = () => {
  const [toasts, setToasts] = useState<Array<{id: string, title: string, description?: string, variant?: 'default' | 'destructive' | 'success'}>>([])

  const toast = ({ title, description, variant = 'default' }: {
    title: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
  }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { id, title, description, variant }
    
    setToasts(prev => [...prev, newToast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg border max-w-sm ${
            toast.variant === 'destructive' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : toast.variant === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-80 mt-1">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )

  return { toast, ToastContainer }
}

// Service para API
const apiService = {
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.json()
  },

  async startAnalysis(data: {
    repo_name: string
    analysis_type: string
    branch_name?: string
    instrucoes_extras?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/start-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error)
    }
    
    return response.json()
  },

  async getJobStatus(jobId: string) {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`)
    return response.json()
  },

  async updateJobStatus(jobId: string, action: 'approve' | 'reject') {
    const response = await fetch(`${API_BASE_URL}/update-job-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, action })
    })
    return response.json()
  },

  async listJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`)
    return response.json()
  }
}

// Componente Modal de Aprovação
const JobApprovalModal = ({ 
  isOpen, 
  onClose, 
  job, 
  onApprove, 
  onReject 
}: {
  isOpen: boolean
  onClose: () => void
  job: any
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = async () => {
    setIsProcessing(true)
    setAction('approve')
    
    try {
      await onApprove()
      onClose()
    } catch (error) {
      console.error('Erro ao aprovar:', error)
    } finally {
      setIsProcessing(false)
      setAction(null)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    setAction('reject')
    
    try {
      await onReject()
      onClose()
    } catch (error) {
      console.error('Erro ao rejeitar:', error)
    } finally {
      setIsProcessing(false)
      setAction(null)
    }
  }

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white border rounded-lg shadow-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Aprovar Análise: {job.repo_name}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-white/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Job Info */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm"><strong>Repositório:</strong> {job.repo_name}</p>
              <p className="text-sm"><strong>Tipo:</strong> {job.analysis_type === 'design' ? 'Análise de Design' : 'Testes Unitários'}</p>
              {job.branch_name && <p className="text-sm"><strong>Branch:</strong> {job.branch_name}</p>}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-sm">Status:</strong>
                <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Aguardando Aprovação
                </Badge>
              </div>
              {job.instrucoes_extras && (
                <p className="text-sm mt-2">
                  <strong>Instruções:</strong> {job.instrucoes_extras}
                </p>
              )}
            </div>
          </div>

          {/* Report Content */}
          <div className="border rounded-lg">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Relatório de Análise Inicial
              </h3>
              <p className="text-sm text-gray-600">
                Revise o relatório abaixo e decida se deseja prosseguir com a aplicação das mudanças
              </p>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              {job.report ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 p-4 rounded">
                    {job.report}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum relatório disponível</p>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Importante</p>
              <p className="text-blue-700 mt-1">
                Ao aprovar, o sistema iniciará automaticamente a aplicação das mudanças sugeridas. 
                Este processo pode levar alguns minutos e criará commits organizados no seu repositório.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="transition-all duration-200"
          >
            Cancelar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
            className="border-red-200 text-red-700 hover:bg-red-50 transition-all duration-200"
          >
            {isProcessing && action === 'reject' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejeitando...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Rejeitar
              </>
            )}
          </Button>
          
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
          >
            {isProcessing && action === 'approve' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aprovando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprovar e Iniciar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente de Logs em Tempo Real
const LogsViewer = ({ jobId, isVisible }: { jobId: string, isVisible: boolean }) => {
  const [logs, setLogs] = useState<string[]>([])
  const [isAutoScroll, setIsAutoScroll] = useState(true)

  useEffect(() => {
    if (!isVisible || !jobId) return

    const pollLogs = async () => {
      try {
        const status = await apiService.getJobStatus(jobId)
        const newLog = `[${new Date().toLocaleTimeString()}] ${status.status}: ${status.message}`
        
        setLogs(prev => {
          const updated = [...prev, newLog]
          return updated.slice(-50) // Manter apenas últimos 50 logs
        })
      } catch (error) {
        console.error('Erro ao buscar logs:', error)
      }
    }

    const interval = setInterval(pollLogs, 2000)
    return () => clearInterval(interval)
  }, [jobId, isVisible])

  if (!isVisible) return null

  return (
    <div className="mt-4 border rounded-lg bg-gray-900 text-green-400 font-mono text-sm">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-white">Logs em Tempo Real</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAutoScroll(!isAutoScroll)}
            className="text-white hover:bg-gray-800"
          >
            {isAutoScroll ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isAutoScroll ? 'Pausar' : 'Seguir'}
          </Button>
        </div>
      </div>
      <div className="p-3 h-32 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="py-1">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500">Aguardando logs...</div>
        )}
      </div>
    </div>
  )
}

// Componente Principal
export default function HomePage() {
  const { toast, ToastContainer } = useToast()
  
  // Estados principais
  const [formData, setFormData] = useState({
    repo_name: '',
    analysis_type: '',
    branch_name: '',
    instrucoes_extras: ''
  })
  
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [pendingJob, setPendingJob] = useState<any>(null)
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [showPromptSelector, setShowPromptSelector] = useState(false)
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState<string[]>([])

  // Tipos de análise disponíveis
  const analysisTypes = [
    {
      value: 'design',
      label: 'Análise de Design',
      description: 'Refatoração e arquitetura',
      icon: Layers,
      color: 'text-blue-500'
    },
    {
      value: 'relatorio_teste_unitario',
      label: 'Testes Unitários',
      description: 'Geração automática de testes',
      icon: TestTube,
      color: 'text-green-500'
    }
  ]

  // Prompts disponíveis
  const availablePrompts = [
    { id: 'design', name: 'Análise de Design', description: 'Analisa arquitetura e padrões' },
    { id: 'refatoracao', name: 'Refatoração', description: 'Aplica melhorias no código' },
    { id: 'escrever_testes', name: 'Escrever Testes', description: 'Gera testes unitários' },
    { id: 'pentest', name: 'Pentest', description: 'Análise de segurança ofensiva' },
    { id: 'seguranca', name: 'Segurança', description: 'Análise de segurança defensiva' },
    { id: 'terraform', name: 'Terraform', description: 'Análise de Infrastructure as Code' },
    { id: 'agrupamento_design', name: 'Agrupamento Design', description: 'Organiza commits de design' },
    { id: 'agrupamento_testes', name: 'Agrupamento Testes', description: 'Organiza commits de testes' }
  ]

  // Verificar status do backend
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const status = await apiService.healthCheck()
        setBackendStatus(status)
      } catch (error) {
        console.error('Backend não disponível:', error)
      }
    }

    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  // Buscar jobs periodicamente
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiService.listJobs()
        setJobs(response.jobs || [])
        
        // Verificar se há jobs pendentes
        const pendingJobs = (response.jobs || []).filter((job: any) => job.status === 'pending_approval')
        if (pendingJobs.length > 0 && !showApprovalModal) {
          setPendingJob(pendingJobs[0])
          setShowApprovalModal(true)
        }
      } catch (error) {
        console.error('Erro ao buscar jobs:', error)
      }
    }

    fetchJobs()
    const interval = setInterval(fetchJobs, 3000)
    return () => clearInterval(interval)
  }, [showApprovalModal])

  const handleSubmit = async () => {
    if (!formData.repo_name || !formData.analysis_type) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome do repositório e o tipo de análise.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
    try {
      const response = await apiService.startAnalysis({
        repo_name: formData.repo_name,
        analysis_type: formData.analysis_type,
        branch_name: formData.branch_name || undefined,
        instrucoes_extras: formData.instrucoes_extras || undefined
      })

      toast({
        title: 'Análise iniciada!',
        description: 'Aguarde a geração do relatório para aprovação...',
        variant: 'success'
      })

      // Limpar formulário
      setFormData({
        repo_name: '',
        analysis_type: '',
        branch_name: '',
        instrucoes_extras: ''
      })
      
    } catch (error) {
      console.error('Erro ao iniciar análise:', error)
      toast({
        title: 'Erro ao iniciar análise',
        description: 'Verifique se o repositório existe e se o backend está funcionando.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!pendingJob) return
    
    try {
      await apiService.updateJobStatus(pendingJob.job_id, 'approve')
      toast({
        title: 'Análise aprovada!',
        description: 'O processamento foi iniciado. Acompanhe o progresso.',
        variant: 'success'
      })
      setShowApprovalModal(false)
      setPendingJob(null)
      
    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: 'Não foi possível aprovar a análise. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const handleReject = async () => {
    if (!pendingJob) return
    
    try {
      await apiService.updateJobStatus(pendingJob.job_id, 'reject')
      toast({
        title: 'Análise rejeitada',
        description: 'A análise foi cancelada.',
      })
      setShowApprovalModal(false)
      setPendingJob(null)
      
    } catch (error) {
      toast({
        title: 'Erro ao rejeitar',
        description: 'Não foi possível rejeitar a análise. Tente novamente.',
        variant: 'destructive'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval': return AlertCircle
      case 'completed': return CheckCircle2
      case 'failed': return XCircle
      case 'rejected': return XCircle
      default: return Clock
    }
  }

  const toggleLogs = (jobId: string) => {
    setShowLogs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <ToastContainer />
      
      {/* Modal de Aprovação */}
      <JobApprovalModal
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false)
          setPendingJob(null)
        }}
        job={pendingJob}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Peers</h1>
                <p className="text-sm text-gray-500">AI Code Analysis Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status do Backend */}
              {backendStatus && (
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${backendStatus.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-600">
                    {backendStatus.agents_available ? 'Agentes Reais' : 'Modo Simulação'}
                  </span>
                </div>
              )}
              
              <Button
                variant="outline"
                onClick={() => setShowPromptSelector(!showPromptSelector)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Prompts
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Seletor de Prompts */}
      {showPromptSelector && (
        <div className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h3 className="text-lg font-semibold mb-3">Prompts Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availablePrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedPrompts.includes(prompt.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedPrompts(prev =>
                      prev.includes(prompt.id)
                        ? prev.filter(id => id !== prompt.id)
                        : [...prev, prompt.id]
                    )
                  }}
                >
                  <div className="font-medium text-sm">{prompt.name}</div>
                  <div className="text-xs text-gray-500">{prompt.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Formulário de Análise */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Nova Análise de Código
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Nome do Repositório */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nome do Repositório *
                    </label>
                    <Input
                      placeholder="ex: usuario/meu-projeto"
                      value={formData.repo_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, repo_name: e.target.value }))}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Formato: proprietário/nome-do-repositório
                    </p>
                  </div>

                  {/* Tipo de Análise */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tipo de Análise *
                    </label>
                    <Select 
                      value={formData.analysis_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, analysis_type: value }))}
                    >
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Selecione o tipo de análise" />
                      </SelectTrigger>
                      <SelectContent>
                        {analysisTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className={`h-4 w-4 ${type.color}`} />
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-gray-500">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Branch (Opcional)
                    </label>
                    <Input
                      placeholder="main, develop, feature/nome..."
                      value={formData.branch_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch_name: e.target.value }))}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Instruções Extras */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Instruções Específicas (Opcional)
                    </label>
                    <Textarea
                      placeholder="Adicione contexto específico, áreas de foco ou requisitos especiais..."
                      value={formData.instrucoes_extras}
                      onChange={(e) => setFormData(prev => ({ ...prev, instrucoes_extras: e.target.value }))}
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Botão de Submit */}
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg py-6 group transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Iniciando Análise...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        Iniciar Análise Inteligente
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Jobs */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Análises em Andamento
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Atualizar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileCode className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium">Nenhuma análise encontrada</p>
                      <p className="text-sm">Inicie uma nova análise para ver o progresso aqui</p>
                    </div>
                  ) : (
                    jobs.map((job: any) => {
                      const StatusIcon = getStatusIcon(job.status)
                      const isLogsVisible = showLogs.includes(job.job_id)
                      
                      return (
                        <div key={job.job_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <Github className="h-5 w-5 text-gray-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{job.repo_name}</p>
                                  <p className="text-sm text-gray-600">{job.message}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center gap-4">
                                <Badge className={`flex items-center gap-1 ${getStatusColor(job.status)}`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {job.status === 'pending_approval' ? 'Aguardando Aprovação' :
                                   job.status === 'completed' ? 'Concluído' :
                                   job.status === 'failed' ? 'Falhou' :
                                   job.status === 'rejected' ? 'Rejeitado' : 
                                   'Processando'}
                                </Badge>
                                
                                <span className="text-sm text-gray-500">{job.progress || 0}%</span>
                                
                                <span className="text-xs text-gray-400">
                                  {job.analysis_type === 'design' ? 'Design' : 'Testes'}
                                </span>
                              </div>
                              
                              {job.progress > 0 && job.progress < 100 && (
                                <Progress 
                                  value={job.progress || 0} 
                                  className="mt-2 h-2"
                                />
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {job.status === 'pending_approval' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setPendingJob(job)
                                    setShowApprovalModal(true)
                                  }}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                                >
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Revisar
                                </Button>
                              )}
                              
                              {job.report && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const blob = new Blob([job.report], { type: 'text/markdown' })
                                    const url = URL.createObjectURL(blob)
                                    const a = document.createElement('a')
                                    a.href = url
                                    a.download = `analise-${job.repo_name.replace('/', '-')}-${job.job_id}.md`
                                    a.click()
                                    URL.revokeObjectURL(url)
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Relatório
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleLogs(job.job_id)}
                              >
                                <Terminal className="h-4 w-4 mr-1" />
                                {isLogsVisible ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Logs */}
                          <LogsViewer jobId={job.job_id} isVisible={isLogsVisible} />
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
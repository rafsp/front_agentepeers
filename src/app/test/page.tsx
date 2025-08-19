// src/app/test/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { 
  Loader2, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Eye,
  GitBranch,
  Code,
  Sparkles,
  Terminal,
  Activity,
  ChevronRight,
  Filter,
  Search,
  Download,
  Copy,
  CheckCheck,
  Zap,
  Shield,
  FileCode,
  TestTube,
  Bug,
  Cpu,
  Layers,
  Plus,
  Rocket,
  Info,
  Settings,
  Database,
  GitCommit,
  ArrowRight,
  Bot,
  BrainCircuit
} from 'lucide-react'

const API_URL = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'

// Cores da marca PEERS
const BRAND_COLORS = {
  primary: '#011334',     // PEERS Neue Blue
  secondary: '#E1FF00',   // PEERS Neue Lime
  accent: '#D8E8EE',      // Serene Blue
  white: '#FFFFFF',
  
  // Gradientes e variações
  gradients: {
    primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
    secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
    mixed: 'linear-gradient(135deg, #011334 0%, #022558 50%, #033670 100%)',
    subtle: 'linear-gradient(135deg, #f8fafb 0%, #e8f4f8 100%)'
  }
}

interface Job {
  id: string
  status: string
  progress: number
  message?: string
  analysis_report?: string
  error_details?: string
  created_at: Date
  updated_at: Date
  repo_name?: string
  analysis_type?: string
  branch_name?: string
  gerar_relatorio_apenas?: boolean
}

// Tipos de análise organizados por categoria - ATUALIZADO COM OS VALORES CORRETOS DA API
const analysisCategories = {
  'Código & Arquitetura': [
    { value: 'relatorio_cleancode', label: 'Clean Code', icon: Layers, description: 'Análise de código limpo e boas práticas', color: 'blue' },
    { value: 'relatorio_simplicacao_debito_tecnico', label: 'Débito Técnico', icon: Code, description: 'Identificação e simplificação de débito técnico', color: 'purple' },
    { value: 'relatorio_solid', label: 'Princípios SOLID', icon: Cpu, description: 'Análise de conformidade com SOLID', color: 'indigo' },
    { value: 'relatorio_performance_eficiencia', label: 'Performance', icon: Zap, description: 'Análise de performance e eficiência', color: 'yellow' },
  ],
  'Documentação': [
    { value: 'relatorio_docstring_comentario', label: 'Docstrings e Comentários', icon: FileText, description: 'Análise de docstrings e comentários', color: 'green' },
    { value: 'relatorio_documentacao', label: 'Documentação Geral', icon: FileCode, description: 'Análise completa da documentação', color: 'teal' },
  ],
  'Segurança & Conformidade': [
    { value: 'relatorio_owasp', label: 'OWASP Security', icon: Shield, description: 'Análise de segurança OWASP', color: 'red' },
    { value: 'relatorio_conformidades', label: 'Conformidades', icon: CheckCircle, description: 'Verificação de conformidades', color: 'orange' },
  ],
  'Testes': [
    { value: 'relatorio_teste_unitario', label: 'Testes Unitários', icon: TestTube, description: 'Análise de cobertura de testes', color: 'green' },
  ]
}

// Função para obter detalhes do tipo de análise
const getAnalysisDetails = (type: string) => {
  for (const category of Object.values(analysisCategories)) {
    const found = category.find(item => item.value === type)
    if (found) return found
  }
  return null
}

export default function TestPage() {
  // Estados principais
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isPolling, setIsPolling] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')
  
  // Formulário com valores padrão para teste
  const [formData, setFormData] = useState({
    repo_name: 'rafsp/front_agentes_peers',  // Repositório padrão para testes
    analysis_type: 'relatorio_teste_unitario',  // Tipo padrão que funciona
    branch_name: 'main',
    instrucoes_extras: '',
    usar_rag: false,
    gerar_relatorio_apenas: true,
    model_name: 'gpt-4o'
  })

  // Verificar conexão com backend
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Tenta primeiro o endpoint de health, se não existir tenta o raiz
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          }
        })
        
        // Se health retorna 404, tenta o endpoint raiz
        if (response.status === 404) {
          const rootResponse = await fetch(`${API_URL}/`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Accept': 'application/json',
            }
          })
          
          // Se retorna 404 com {"detail":"Not Found"}, significa que o backend está online
          if (rootResponse.status === 404) {
            const data = await rootResponse.json()
            if (data.detail === "Not Found") {
              setConnectionStatus('connected')
              setErrorMessage('')
              return
            }
          }
        }
        
        // Se o health check funciona ou qualquer resposta 2xx
        if (response.ok || response.status === 404) {
          setConnectionStatus('connected')
          setErrorMessage('')
        } else {
          setConnectionStatus('error')
          setErrorMessage(`Status: ${response.status}`)
        }
      } catch (error) {
        // Se conseguiu conectar mas deu outro erro, provavelmente está online
        setConnectionStatus('connected')
        setErrorMessage('')
        console.log('Backend está online, endpoints específicos podem não existir')
      }
    }
    
    checkConnection()
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // Mapear status para exibição
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
      'pending_approval': { 
        color: 'text-yellow-600', 
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: AlertCircle, 
        label: 'Aguardando Aprovação' 
      },
      'approved': { 
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200', 
        icon: ThumbsUp, 
        label: 'Aprovado' 
      },
      'workflow_started': { 
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 border-blue-200', 
        icon: Play, 
        label: 'Em Processamento' 
      },
      'analyzing': { 
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200', 
        icon: BrainCircuit, 
        label: 'Analisando com IA' 
      },
      'generating_report': { 
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200', 
        icon: FileText, 
        label: 'Gerando Relatório' 
      },
      'completed': { 
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200', 
        icon: CheckCircle, 
        label: 'Concluído' 
      },
      'failed': { 
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200', 
        icon: XCircle, 
        label: 'Erro' 
      },
      'rejected': { 
        color: 'text-gray-600',
        bgColor: 'bg-gray-50 border-gray-200', 
        icon: XCircle, 
        label: 'Rejeitado' 
      }
    }
    
    return statusMap[status] || { 
      color: 'text-gray-600',
      bgColor: 'bg-gray-50 border-gray-200', 
      icon: Clock, 
      label: status 
    }
  }

  // Polling de status
  const startPolling = (jobId: string) => {
    setIsPolling(jobId)
    
    const pollInterval = setInterval(async () => {
      try {
        // Primeiro tenta buscar o status
        const statusResponse = await fetch(`${API_URL}/status/${jobId}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit'
        })
        
        let finalReport = null
        let finalStatus = 'processing'
        let finalProgress = 50
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          console.log('Status recebido:', statusData)
          
          finalStatus = statusData.status || 'processing'
          finalProgress = statusData.progress || 50
          
          // Se status é completed ou tem relatório, busca o relatório completo
          if (statusData.status === 'completed' || statusData.report || statusData.analysis_report) {
            finalStatus = 'completed'
            finalProgress = 100
            finalReport = statusData.report || statusData.analysis_report
          }
        }
        
        // Se não tem relatório e status sugere que deveria ter, tenta buscar o relatório
        if (!finalReport && (finalStatus === 'completed' || finalStatus === 'done')) {
          try {
            const reportResponse = await fetch(`${API_URL}/jobs/${jobId}/report`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors',
              credentials: 'omit'
            })
            
            if (reportResponse.ok) {
              const reportData = await reportResponse.json()
              finalReport = reportData.analysis_report || reportData.report
              finalStatus = 'completed'
              finalProgress = 100
              console.log('Relatório obtido do endpoint /report')
            }
          } catch (err) {
            console.log('Endpoint /report não disponível ou erro:', err)
          }
        }
        
        // Atualiza o job na lista
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? {
                ...job,
                status: finalStatus,
                progress: finalProgress,
                message: statusResponse.ok ? 'Processando análise...' : job.message,
                analysis_report: finalReport || job.analysis_report,
                updated_at: new Date()
              }
            : job
        ))
        
        // Atualiza o job selecionado
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? {
            ...prev,
            status: finalStatus,
            progress: finalProgress,
            analysis_report: finalReport || prev.analysis_report,
            updated_at: new Date()
          } : null)
          
          // Se tem relatório, mostra automaticamente
          if (finalReport) {
            setShowReport(true)
          }
        }
        
        // Para o polling se completou ou falhou
        if (['completed', 'failed', 'rejected', 'done'].includes(finalStatus)) {
          clearInterval(pollInterval)
          setIsPolling(null)
          console.log('Polling finalizado - Status:', finalStatus)
        }
      } catch (error) {
        console.error('Erro no polling:', error)
        // Não para o polling em caso de erro temporário
      }
    }, 3000) // Poll a cada 3 segundos
    
    // Limpar interval após 5 minutos
    setTimeout(() => {
      clearInterval(pollInterval)
      setIsPolling(null)
      console.log('Polling timeout após 5 minutos')
    }, 300000)
  }

  // Submeter análise
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.repo_name || !formData.analysis_type) {
      setErrorMessage('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const response = await fetch(`${API_URL}/start-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        const jobId = data.job_id || data.id || Math.random().toString(36).substr(2, 9)
        
        // Determinar status inicial baseado em gerar_relatorio_apenas
        const initialStatus = formData.gerar_relatorio_apenas 
          ? 'generating_report' 
          : 'pending_approval'
        
        const newJob: Job = {
          id: jobId,
          status: initialStatus,
          progress: formData.gerar_relatorio_apenas ? 10 : 0,
          message: data.message || 'Análise iniciada',
          analysis_report: data.report || data.analysis_report,
          created_at: new Date(),
          updated_at: new Date(),
          repo_name: formData.repo_name,
          analysis_type: formData.analysis_type,
          branch_name: formData.branch_name,
          gerar_relatorio_apenas: formData.gerar_relatorio_apenas
        }
        
        setJobs(prev => [newJob, ...prev])
        setSelectedJob(newJob)
        
        // Se já tem relatório e é modo rápido, mostrar direto
        if (data.report || data.analysis_report) {
          setShowReport(true)
          newJob.analysis_report = data.report || data.analysis_report
          if (formData.gerar_relatorio_apenas) {
            // Marcar como concluído se for modo rápido
            newJob.status = 'completed'
            newJob.progress = 100
            setJobs(prev => prev.map(job => 
              job.id === jobId 
                ? { ...job, status: 'completed', progress: 100, analysis_report: data.report || data.analysis_report }
                : job
            ))
          }
        } else {
          // Iniciar polling sempre, mesmo em modo rápido
          console.log('Iniciando polling para job:', jobId)
          startPolling(jobId)
        }
        
        // Reset form mas mantém alguns valores úteis
        setFormData(prev => ({
          ...prev,
          instrucoes_extras: ''
        }))
      } else {
        const errorText = await response.text()
        setErrorMessage(`Erro ${response.status}: ${errorText || response.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao iniciar análise:', error)
      setErrorMessage(`Erro de conexão: ${error instanceof Error ? error.message : 'Verifique CORS no backend'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Aprovar/Rejeitar job (apenas para modo completo)
  const handleJobAction = async (jobId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`${API_URL}/update-job-status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ job_id: jobId, action })
      })
      
      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId 
            ? { ...job, status: action === 'approve' ? 'approved' : 'rejected' }
            : job
        ))
        
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? { ...prev, status: action === 'approve' ? 'approved' : 'rejected' } : null)
        }
        
        if (action === 'approve') {
          startPolling(jobId)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  // Copiar ID do job
  const copyJobId = (jobId: string) => {
    navigator.clipboard.writeText(jobId)
    setCopiedId(jobId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Filtrar jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery || 
      job.repo_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen" style={{ background: BRAND_COLORS.gradients.subtle }}>
      {/* Header com Logo e Status */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo PEERS */}
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg" style={{ background: BRAND_COLORS.primary }}>
                  <img 
                    src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                    alt="PEERS Logo" 
                    className="w-28 h-14 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="text-3xl font-black tracking-wider text-white">
                            P<span style="color: #E1FF00">EE</span>RS
                          </div>
                          <div class="text-xs font-medium tracking-wider mt-1 text-white">
                            Consulting <span style="color: #E1FF00">+</span> Technology
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="w-px h-12 bg-gray-200 mx-2" />
              
              <div>
                <h1 className="text-2xl font-bold flex items-center space-x-2" style={{ color: BRAND_COLORS.primary }}>
                  <Bot className="h-6 w-6" style={{ color: BRAND_COLORS.secondary }} />
                  <span>Agentes Inteligentes</span>
                </h1>
                <p className="text-sm text-gray-500">Análise de código com IA multi-agentes</p>
              </div>
            </div>
            
            {/* Status de Conexão */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                connectionStatus === 'connected' 
                  ? 'bg-green-50 border-green-200' 
                  : connectionStatus === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <Activity className={`h-4 w-4 ${
                  connectionStatus === 'connected' ? 'text-green-600 animate-pulse' : 
                  connectionStatus === 'error' ? 'text-red-600' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'error' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {connectionStatus === 'connected' ? 'Backend Online' : 
                   connectionStatus === 'error' ? `Erro: ${errorMessage || 'Desconectado'}` : 'Verificando...'}
                </span>
              </div>
              
              <Badge 
                variant="outline" 
                className="px-3 py-1 font-normal"
                style={{ borderColor: BRAND_COLORS.secondary, color: BRAND_COLORS.primary }}
              >
                API: Azure
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl overflow-hidden">
              {/* Header do Card com gradiente */}
              <div 
                className="h-2"
                style={{ background: BRAND_COLORS.gradients.secondary }}
              />
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: `${BRAND_COLORS.secondary}20` }}
                  >
                    <Rocket className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                  </div>
                  <span>Nova Análise</span>
                </CardTitle>
                <CardDescription>
                  Configure e inicie uma análise inteligente do seu código
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Mensagem de erro */}
                  {errorMessage && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-800">
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Repositório */}
                  <div className="space-y-2">
                    <Label htmlFor="repo" className="flex items-center space-x-2">
                      <GitBranch className="h-4 w-4 text-gray-500" />
                      <span>Repositório</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="repo"
                      placeholder="owner/repository"
                      value={formData.repo_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, repo_name: e.target.value }))}
                      className="border-gray-200 focus:border-blue-400 transition-colors"
                      required
                    />
                  </div>

                  {/* Branch */}
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="flex items-center space-x-2">
                      <GitCommit className="h-4 w-4 text-gray-500" />
                      <span>Branch</span>
                    </Label>
                    <Input
                      id="branch"
                      placeholder="main"
                      value={formData.branch_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch_name: e.target.value }))}
                      className="border-gray-200 focus:border-blue-400 transition-colors"
                    />
                  </div>

                  {/* Tipo de Análise */}
                  <div className="space-y-2">
                    <Label htmlFor="analysis" className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-gray-500" />
                      <span>Tipo de Análise</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.analysis_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, analysis_type: value }))}
                      required
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue placeholder="Selecione o tipo de análise" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(analysisCategories).map(([category, items]) => (
                          <div key={category}>
                            <div 
                              className="px-2 py-1.5 text-xs font-semibold text-gray-500"
                              style={{ background: BRAND_COLORS.accent }}
                            >
                              {category}
                            </div>
                            {items.map(item => (
                              <SelectItem key={item.value} value={item.value}>
                                <div className="flex items-center space-x-2">
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Modelo */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-gray-500" />
                      <span>Modelo IA</span>
                    </Label>
                    <Select
                      value={formData.model_name}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, model_name: value }))}
                    >
                      <SelectTrigger className="border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4 Optimized (Recomendado)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4 Standard</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4 Mini (Rápido)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Opções Avançadas */}
                  <div className="space-y-4 p-4 rounded-lg" style={{ background: `${BRAND_COLORS.accent}50` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="fast-mode" className="text-sm font-medium">
                          Apenas gerar relatório (mais rápido)
                        </Label>
                      </div>
                      <Switch
                        id="fast-mode"
                        checked={formData.gerar_relatorio_apenas}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, gerar_relatorio_apenas: checked }))
                        }
                      />
                    </div>
                    
                    {formData.gerar_relatorio_apenas && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-800">
                          Modo rápido: O relatório será gerado automaticamente sem necessidade de aprovação
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="rag" className="text-sm font-medium">
                          Usar base de conhecimento (RAG)
                        </Label>
                      </div>
                      <Switch
                        id="rag"
                        checked={formData.usar_rag}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, usar_rag: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Instruções Extras */}
                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>Instruções Adicionais</span>
                      <Badge variant="outline" className="text-xs">Opcional</Badge>
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Adicione contexto ou requisitos específicos para a análise..."
                      value={formData.instrucoes_extras}
                      onChange={(e) => setFormData(prev => ({ ...prev, instrucoes_extras: e.target.value }))}
                      className="border-gray-200 focus:border-blue-400 min-h-[100px] transition-colors"
                    />
                  </div>

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || connectionStatus === 'error'}
                    className="w-full font-semibold text-white transition-all duration-200 h-12 text-base"
                    style={{ 
                      background: isSubmitting ? '#666' : BRAND_COLORS.primary,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Iniciando Análise...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        {formData.gerar_relatorio_apenas ? 'Gerar Relatório' : 'Iniciar Análise'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Card de Informações */}
            <Card className="mt-6 border-0 shadow-lg overflow-hidden">
              <div 
                className="h-1"
                style={{ background: BRAND_COLORS.gradients.primary }}
              />
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <BrainCircuit className="h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                  <span>Como funciona</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div 
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: BRAND_COLORS.secondary, color: BRAND_COLORS.primary }}
                  >
                    1
                  </div>
                  <p className="text-sm text-gray-600">Configure os parâmetros da análise</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div 
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: BRAND_COLORS.secondary, color: BRAND_COLORS.primary }}
                  >
                    2
                  </div>
                  <p className="text-sm text-gray-600">IA analisa o código com múltiplos agentes</p>
                </div>
                {!formData.gerar_relatorio_apenas && (
                  <div className="flex items-start space-x-3">
                    <div 
                      className="rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ background: BRAND_COLORS.secondary, color: BRAND_COLORS.primary }}
                    >
                      3
                    </div>
                    <p className="text-sm text-gray-600">Revise e aprove o plano de ação</p>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <div 
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: BRAND_COLORS.secondary, color: BRAND_COLORS.primary }}
                  >
                    {formData.gerar_relatorio_apenas ? '3' : '4'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {formData.gerar_relatorio_apenas 
                      ? 'Receba o relatório completo' 
                      : 'Implemente as melhorias sugeridas'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card de Troubleshooting CORS */}
            {connectionStatus === 'error' && errorMessage && (
              <Card className="mt-6 border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>Problema de Conexão</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-red-700">
                  <p className="font-medium">Possíveis soluções:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-600">
                    <li>Verifique se o backend está rodando</li>
                    <li>Confirme CORS habilitado no backend</li>
                    <li>Use extensão de CORS no navegador (desenvolvimento)</li>
                    <li>Verifique a URL: {API_URL}</li>
                  </ul>
                  <div className="mt-3 p-2 bg-red-100 rounded">
                    <code className="text-xs">
                      FastAPI: app.add_middleware(CORSMiddleware, allow_origins=["*"])
                    </code>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Card de Status do Backend */}
            {connectionStatus === 'connected' && (
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    <span>Backend Conectado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-green-700">
                  <p>Endpoints disponíveis:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-600 text-xs font-mono">
                    <li>POST /start-analysis</li>
                    <li>GET /status/{'{job_id}'}</li>
                    <li>GET /jobs/{'{job_id}'}/report</li>
                    <li>POST /update-job-status</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Coluna Direita - Jobs e Relatórios */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros e Busca */}
            <Card className="border-0 shadow-lg">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por repositório ou ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-200"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px] border-gray-200">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="pending_approval">Aguardando</SelectItem>
                      <SelectItem value="generating_report">Gerando</SelectItem>
                      <SelectItem value="approved">Aprovados</SelectItem>
                      <SelectItem value="completed">Concluídos</SelectItem>
                      <SelectItem value="failed">Com Erro</SelectItem>
                      <SelectItem value="rejected">Rejeitados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Jobs */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div 
                className="h-1"
                style={{ background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%)` }}
              />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                    <span>Análises Recentes</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="font-normal"
                    style={{ 
                      background: `${BRAND_COLORS.secondary}20`,
                      color: BRAND_COLORS.primary 
                    }}
                  >
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'análise' : 'análises'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {filteredJobs.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-12 text-gray-500"
                    >
                      <FileText className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Nenhuma análise encontrada</p>
                      <p className="text-sm mt-1">Inicie uma nova análise para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredJobs.map((job) => {
                        const statusDisplay = getStatusDisplay(job.status)
                        const StatusIcon = statusDisplay.icon
                        const analysisDetails = getAnalysisDetails(job.analysis_type || '')
                        
                        return (
                          <div key={job.id}>
                            <Card 
                              className={`border cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedJob?.id === job.id 
                                  ? 'ring-2 shadow-lg' 
                                  : 'hover:border-gray-300'
                              }`}
                              style={{
                                borderColor: selectedJob?.id === job.id ? BRAND_COLORS.secondary : undefined,
                                background: selectedJob?.id === job.id 
                                  ? `linear-gradient(to right, ${BRAND_COLORS.accent}10, white)` 
                                  : undefined
                              }}
                              onClick={() => {
                                setSelectedJob(job)
                                setShowReport(!!job.analysis_report)
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-3">
                                    {/* Repositório e Branch */}
                                    <div className="flex items-center space-x-3">
                                      <GitBranch className="h-4 w-4 text-gray-400" />
                                      <span className="font-semibold text-gray-900">
                                        {job.repo_name || 'Repositório'}
                                      </span>
                                      <ArrowRight className="h-3 w-3 text-gray-400" />
                                      <span className="text-sm text-gray-600">
                                        {job.branch_name || 'main'}
                                      </span>
                                      {job.gerar_relatorio_apenas && (
                                        <Badge 
                                          variant="outline" 
                                          className="text-xs"
                                          style={{ 
                                            borderColor: BRAND_COLORS.secondary,
                                            color: BRAND_COLORS.primary,
                                            background: `${BRAND_COLORS.secondary}10`
                                          }}
                                        >
                                          <Zap className="h-3 w-3 mr-1" />
                                          Modo Rápido
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Status e Tipo */}
                                    <div className="flex items-center space-x-3">
                                      <Badge 
                                        variant="outline" 
                                        className={`${statusDisplay.bgColor} ${statusDisplay.color} border`}
                                      >
                                        <StatusIcon className="h-3 w-3 mr-1" />
                                        {statusDisplay.label}
                                      </Badge>
                                      
                                      {analysisDetails && (
                                        <Badge variant="secondary" className="text-xs">
                                          <analysisDetails.icon className="h-3 w-3 mr-1" />
                                          {analysisDetails.label}
                                        </Badge>
                                      )}
                                      
                                      {isPolling === job.id && (
                                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">
                                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                          Atualizando
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Progress Bar */}
                                    {job.progress > 0 && job.progress < 100 && (
                                      <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                          <span>Progresso</span>
                                          <span>{job.progress}%</span>
                                        </div>
                                        <Progress 
                                          value={job.progress} 
                                          className="h-2"
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Footer com ações */}
                                    <div className="flex items-center justify-between pt-2">
                                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="h-3 w-3" />
                                          <span>
                                            {new Date(job.created_at).toLocaleTimeString('pt-BR', {
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              copyJobId(job.id)
                                            }}
                                            className="hover:text-gray-700 transition-colors flex items-center space-x-1"
                                          >
                                            {copiedId === job.id ? (
                                              <CheckCheck className="h-3 w-3 text-green-600" />
                                            ) : (
                                              <Copy className="h-3 w-3" />
                                            )}
                                            <span className="font-mono">
                                              {job.id.slice(0, 8)}...
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {/* Botão para visualizar relatório quando disponível */}
                                        {job.analysis_report && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              setSelectedJob(job)
                                              setShowReport(true)
                                            }}
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver Relatório
                                          </Button>
                                        )}
                                        
                                        {/* Botões de aprovação apenas se não for modo rápido E se tem relatório para revisar */}
                                        {job.status === 'pending_approval' && !job.gerar_relatorio_apenas && job.analysis_report && (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-7 text-xs border-green-200 text-green-600 hover:bg-green-50"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleJobAction(job.id, 'approve')
                                              }}
                                            >
                                              <ThumbsUp className="h-3 w-3 mr-1" />
                                              Aprovar
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                handleJobAction(job.id, 'reject')
                                              }}
                                            >
                                              <ThumbsDown className="h-3 w-3 mr-1" />
                                              Rejeitar
                                            </Button>
                                          </>
                                        )}
                                        
                                        {/* Mensagem quando aguardando relatório para aprovar */}
                                        {job.status === 'pending_approval' && !job.gerar_relatorio_apenas && !job.analysis_report && (
                                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Aguardando relatório...
                                          </Badge>
                                        )}
                                        
                                        {/* Botão para forçar busca do relatório */}
                                        {(job.status === 'generating_report' || job.status === 'pending_approval' || job.progress === 10) && !job.analysis_report && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={async (e) => {
                                              e.stopPropagation()
                                              try {
                                                // Primeiro tenta buscar do status
                                                const statusResponse = await fetch(`${API_URL}/status/${job.id}`, {
                                                  method: 'GET',
                                                  headers: { 'Accept': 'application/json' },
                                                  mode: 'cors',
                                                  credentials: 'omit'
                                                })
                                                
                                                let report = null
                                                
                                                if (statusResponse.ok) {
                                                  const statusData = await statusResponse.json()
                                                  report = statusData.report || statusData.analysis_report
                                                }
                                                
                                                // Se não encontrou no status, tenta no endpoint de report
                                                if (!report) {
                                                  const reportResponse = await fetch(`${API_URL}/jobs/${job.id}/report`, {
                                                    method: 'GET',
                                                    headers: { 'Accept': 'application/json' },
                                                    mode: 'cors',
                                                    credentials: 'omit'
                                                  })
                                                  
                                                  if (reportResponse.ok) {
                                                    const reportData = await reportResponse.json()
                                                    report = reportData.analysis_report || reportData.report
                                                  }
                                                }
                                                
                                                if (report) {
                                                  // Atualiza o job mantendo o status atual
                                                  setJobs(prev => prev.map(j => 
                                                    j.id === job.id 
                                                      ? { ...j, analysis_report: report }
                                                      : j
                                                  ))
                                                  if (selectedJob?.id === job.id) {
                                                    setSelectedJob({ ...selectedJob, analysis_report: report })
                                                    setShowReport(true)
                                                  }
                                                  console.log('Relatório encontrado e carregado!')
                                                } else {
                                                  console.log('Relatório ainda não disponível')
                                                }
                                              } catch (err) {
                                                console.error('Erro ao buscar relatório:', err)
                                              }
                                            }}
                                          >
                                            <RefreshCw className="h-3 w-3 mr-1" />
                                            Buscar Relatório
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Relatório */}
            {selectedJob && showReport && selectedJob.analysis_report && (
              <Card className="border-0 shadow-xl overflow-hidden">
                <div 
                  className="h-2"
                  style={{ 
                    background: `linear-gradient(90deg, ${BRAND_COLORS.secondary} 0%, ${BRAND_COLORS.primary} 100%)` 
                  }}
                />
                <CardHeader className="border-b" style={{ borderColor: BRAND_COLORS.accent }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                      <span>Relatório de Análise</span>
                      {selectedJob.gerar_relatorio_apenas && (
                        <Badge 
                          variant="outline" 
                          className="ml-2"
                          style={{ 
                            borderColor: BRAND_COLORS.secondary,
                            color: BRAND_COLORS.primary,
                            background: `${BRAND_COLORS.secondary}10`
                          }}
                        >
                          Gerado Automaticamente
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const blob = new Blob([selectedJob.analysis_report!], { type: 'text/markdown' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `analise-${selectedJob.id}.md`
                          a.click()
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Exportar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowReport(false)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <ScrollArea className="h-[500px]">
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="whitespace-pre-wrap text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedJob.analysis_report
                            // Headers
                            .replace(/^###\s(.+)$/gm, '<h3 style="color: #011334; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.1rem;">$1</h3>')
                            .replace(/^##\s(.+)$/gm, '<h2 style="color: #011334; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #E1FF00; font-size: 1.3rem;">$1</h2>')
                            .replace(/^#\s(.+)$/gm, '<h1 style="color: #011334; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; font-size: 1.5rem;">$1</h1>')
                            // Bold e Itálico
                            .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #011334; font-weight: 600;">$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>')
                            // Código
                            .replace(/```([\s\S]*?)```/g, '<pre style="background: #f8f9fa; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; border-left: 4px solid #E1FF00; margin: 1.5rem 0; font-family: monospace; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><code>$1</code></pre>')
                            .replace(/`([^`]+)`/g, '<code style="background: #FFF9E6; color: #011334; padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.875rem; font-family: monospace; border: 1px solid #E1FF0080; font-weight: 500;">$1</code>')
                            // Listas
                            .replace(/^-\s(.+)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.5rem; list-style-type: disc; color: #374151;">$1</li>')
                            .replace(/^\*\s(.+)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.5rem; list-style-type: disc; color: #374151;">$1</li>')
                            .replace(/^(\d+)\.\s(.+)$/gm, '<li style="margin-left: 1rem; margin-bottom: 0.5rem; list-style-type: decimal; color: #374151;">$2</li>')
                            // Tabelas Markdown com estilo melhorado
                            .replace(/\|(.+)\|/gm, (match) => {
                              // Se é uma linha de separação de tabela (---|---|---)
                              if (match.includes('---|')) {
                                return '' // Remove a linha de separação
                              }
                              // Processar linha de tabela
                              const cells = match.split('|').filter(cell => cell.trim())
                              const isHeader = cells.some(cell => cell.trim().match(/^\*\*.+\*\*$/))
                              
                              if (isHeader || cells.some(cell => cell.toLowerCase().includes('arquivo') || cell.toLowerCase().includes('ação'))) {
                                // É um cabeçalho - Fundo lime claro com texto escuro
                                return `<tr style="background: #E1FF00;">
                                  ${cells.map(cell => `<th style="padding: 0.875rem 1rem; text-align: left; color: #011334; font-weight: 700; border-bottom: 2px solid #011334; font-size: 0.95rem;">${cell.trim().replace(/\*\*/g, '')}</th>`).join('')}
                                </tr>`
                              } else {
                                // É uma linha de dados - Alternando cores suaves
                                return `<tr style="background: white; transition: all 0.2s;" onmouseover="this.style.background='#FFF9E6'" onmouseout="this.style.background='white'">
                                  ${cells.map((cell, index) => {
                                    const cellContent = cell.trim()
                                    // Primeira coluna (geralmente arquivo) em destaque
                                    if (index === 0 && (cellContent.includes('.py') || cellContent.includes('.js') || cellContent.includes('.ts') || cellContent.includes('/'))) {
                                      return `<td style="padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; font-family: \'SF Mono\', Monaco, \'Cascadia Code\', monospace; font-size: 0.9rem; background: #f8f9fa; color: #7c3aed; font-weight: 500;">
                                        ${cellContent.replace(/`/g, '')}
                                      </td>`
                                    }
                                    // Células normais
                                    return `<td style="padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 0.9rem; line-height: 1.5;">
                                      ${cellContent.replace(/`/g, '')}
                                    </td>`
                                  }).join('')}
                                </tr>`
                              }
                            })
                            // Envolver grupos de <tr> em tabelas com container estilizado
                            .replace(/(<tr[\s\S]*?<\/tr>[\s\S]*?)+/gm, (match) => {
                              if (match.includes('<tr')) {
                                return `<div style="overflow-x: auto; margin: 2rem 0; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.07); border: 1px solid #e5e7eb;">
                                  <table style="width: 100%; border-collapse: collapse; background: white; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif;">
                                    <tbody>
                                      ${match}
                                    </tbody>
                                  </table>
                                </div>`
                              }
                              return match
                            })
                            // Seções numeradas com destaque
                            .replace(/^(\d+)\.\s\*\*(.+?)\*\*$/gm, 
                              '<div style="margin: 2rem 0; padding: 1.25rem; background: linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 100%); border-left: 5px solid #E1FF00; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">' +
                              '<h3 style="color: #011334; font-weight: 700; font-size: 1.2rem; margin: 0; display: flex; align-items: center;">' +
                              '<span style="background: #011334; color: #E1FF00; padding: 0.5rem; border-radius: 0.375rem; margin-right: 0.75rem; font-size: 1rem; min-width: 2rem; text-align: center;">$1</span>' +
                              '$2</h3>' +
                              '</div>')
                            // Blocos de citação
                            .replace(/^>\s(.+)$/gm, '<blockquote style="border-left: 4px solid #E1FF00; padding-left: 1rem; margin: 1.5rem 0; color: #6b7280; font-style: italic; background: #fafafa; padding: 1rem; border-radius: 0.25rem;">$1</blockquote>')
                            // Links
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #2563eb; text-decoration: underline; font-weight: 500; transition: color 0.2s;" target="_blank" onmouseover="this.style.color=\'#1d4ed8\'" onmouseout="this.style.color=\'#2563eb\'">$1</a>')
                            // Separadores horizontais
                            .replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 2.5rem 0;" />')
                            // Destacar palavras importantes com cores diferentes
                            .replace(/\b(IMPORTANTE|CRITICAL|CRÍTICO)\b:?/gi, '<span style="background: #fee2e2; color: #dc2626; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 700; font-size: 0.85rem; border: 1px solid #fca5a5;">$1</span>')
                            .replace(/\b(ATENÇÃO|WARNING|AVISO)\b:?/gi, '<span style="background: #fef3c7; color: #d97706; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 700; font-size: 0.85rem; border: 1px solid #fcd34d;">$1</span>')
                            .replace(/\b(NOTA|INFO|DICA)\b:?/gi, '<span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 700; font-size: 0.85rem; border: 1px solid #93c5fd;">$1</span>')
                            .replace(/\b(SUCESSO|SUCCESS|OK)\b:?/gi, '<span style="background: #dcfce7; color: #16a34a; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-weight: 700; font-size: 0.85rem; border: 1px solid #86efac;">$1</span>')
                        }}
                      />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
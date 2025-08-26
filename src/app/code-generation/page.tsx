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
  BrainCircuit,
  Menu,
  X,
  ChevronLeft,
  ChevronDown,
  Upload,
  Folder,
  BookOpen,
  Key,
  Moon,
  Sun,
  Globe,
  Bell,
  FileUp,
  History,
  Archive,
  Palette,
  Users,
  FolderOpen,
  FileJson,
  Package,
  Building,
  Save,
  Trash2,
  Edit,
  ExternalLink,
  HelpCircle,
  LogOut,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Wand2,
  ShoppingCart,
  Server
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

// Templates de código predefinidos
const CODE_TEMPLATES = {
  crm: {
    name: 'Sistema CRM Completo',
    icon: Package,
    description: 'Sistema de gestão de clientes para seguradora',
    color: 'blue',
    requirements: `Documento de Requisitos: Sistema de Gestão de Clientes para Seguradora

1. OBJETIVO
Desenvolver um sistema web completo para gerenciamento de clientes de uma seguradora, permitindo cadastro, consulta, edição e exclusão de clientes, gestão de apólices, sinistros e comissões, com integração a banco de dados PostgreSQL e APIs externas.

2. REQUISITOS FUNCIONAIS

2.1 Gestão de Clientes
RF1: O sistema deve permitir o cadastro de clientes com os campos obrigatórios: nome completo, CPF/CNPJ, RG, data de nascimento, sexo, estado civil, e-mail, telefone principal, telefone secundário, endereço completo (CEP, logradouro, número, complemento, bairro, cidade, estado).
RF2: O sistema deve validar CPF/CNPJ utilizando algoritmo oficial e verificar duplicidade no banco de dados.
RF3: O sistema deve permitir busca de clientes por: nome, CPF/CNPJ, e-mail, telefone, número da apólice.
RF4: O sistema deve manter histórico de alterações dos dados dos clientes com data, hora e usuário responsável.
RF5: O sistema deve permitir anexar documentos aos clientes (PDF, JPG, PNG) com limite de 5MB por arquivo.
RF6: O sistema deve permitir categorização de clientes (VIP, Regular, Novo) com regras de negócio automatizadas.

3. REQUISITOS NÃO-FUNCIONAIS

RNF1: Backend desenvolvido em Python com FastAPI 0.104+
RNF2: Frontend em React 18+ com TypeScript e Tailwind CSS
RNF3: Banco de dados PostgreSQL 15+ com SQLAlchemy ORM
RNF4: Autenticação OAuth2 com JWT
RNF5: Cache com Redis para otimização de performance`
  },
  ecommerce: {
    name: 'E-commerce B2C',
    icon: ShoppingCart,
    description: 'Plataforma completa de vendas online',
    color: 'green',
    requirements: `Documento de Requisitos: Plataforma E-commerce B2C

1. OBJETIVO
Desenvolver uma plataforma de e-commerce completa para vendas B2C, com catálogo de produtos, carrinho de compras, checkout, pagamento integrado, gestão de pedidos e painel administrativo.

2. REQUISITOS FUNCIONAIS

2.1 Catálogo de Produtos
RF1: Sistema deve exibir produtos com: nome, descrição, preço, imagens, variações (cor, tamanho), estoque, avaliações
RF2: Filtros por categoria, preço, marca, avaliação, disponibilidade
RF3: Busca com autocomplete e sugestões
RF4: Produtos relacionados e recomendações personalizadas
RF5: Wishlist (lista de desejos) por usuário

3. REQUISITOS NÃO-FUNCIONAIS
RNF1: Backend em Node.js com Express ou NestJS
RNF2: Frontend em Next.js com TypeScript
RNF3: Banco MongoDB para catálogo, PostgreSQL para transações`
  },
  api: {
    name: 'API REST Microserviços',
    icon: Server,
    description: 'Arquitetura de microserviços com API Gateway',
    color: 'purple',
    requirements: `Documento de Requisitos: API REST com Arquitetura de Microserviços

1. OBJETIVO
Desenvolver uma arquitetura de microserviços com API Gateway, service discovery, mensageria assíncrona e observabilidade completa para um sistema de gestão empresarial.

2. REQUISITOS FUNCIONAIS

2.1 API Gateway
RF1: Roteamento inteligente de requisições
RF2: Rate limiting por cliente/IP
RF3: Autenticação e autorização centralizada
RF4: Cache de respostas
RF5: Circuit breaker e retry policies

3. REQUISITOS NÃO-FUNCIONAIS

RNF1: Cada microserviço em container Docker independente
RNF2: Orquestração com Kubernetes
RNF3: Service mesh com Istio`
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
  code_type?: string
}

// Interfaces para configurações
interface LLMConfig {
  model: string
  apiKey: string
  maxTokens: number
}

interface VersionFile {
  id: string
  name: string
  version: string
  uploadDate: Date
  size: number
  description?: string
}

interface KnowledgeDoc {
  id: string
  name: string
  type: 'documentation' | 'policy' | 'guide' | 'other'
  uploadDate: Date
  size: number
  content?: string
}

interface Project {
  id: string
  name: string
  description?: string
  created: Date
  lastModified: Date
  templates: string[]
  settings?: any
}

// Modal de Aprovação
const ApprovalModal = ({ job, onApprove, onReject, onClose }: any) => {
  if (!job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, white 100%)` }}>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
            Código Gerado - Aguardando Aprovação
          </h2>
          <p className="text-gray-600 mt-1">Revise o código gerado antes de prosseguir</p>
        </div>
        
        <ScrollArea className="h-[60vh] p-6">
          <div className="prose max-w-none">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <code>{job.analysis_report || 'Gerando código...'}</code>
            </pre>
          </div>
        </ScrollArea>
        
        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            variant="outline" 
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => {
              onReject(job.id, 'reject')
              onClose()
            }}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
          <Button 
            className="text-white"
            style={{ background: BRAND_COLORS.primary }}
            onClick={() => {
            onApprove(job.id, 'approve')
            onClose()
          }}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar e Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}

// Sidebar Component
const Sidebar = ({ 
  isOpen, 
  onClose, 
  llmConfig, 
  setLlmConfig,
  versions,
  knowledgeDocs,
  projects,
  currentProject,
  setCurrentProject,
  theme,
  setTheme,
  language,
  setLanguage,
  notifications,
  setNotifications
}: any) => {
  const [activeSection, setActiveSection] = useState<string>('llm')
  const [expandedSections, setExpandedSections] = useState<string[]>(['llm'])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const sidebarSections = [
    {
      id: 'llm',
      title: 'Configuração LLM',
      icon: BrainCircuit,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-600">Modelo</Label>
            <Select value={llmConfig.model} onValueChange={(value) => setLlmConfig({ ...llmConfig, model: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Mais Inteligente)</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4 Standard</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-600">API Key</Label>
            <div className="relative mt-1">
              <Input 
                type="password" 
                value={llmConfig.apiKey}
                onChange={(e) => setLlmConfig({ ...llmConfig, apiKey: e.target.value })}
                placeholder="sk-..."
                className="pr-10"
              />
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-600">Max Tokens</Label>
            <Input 
              type="number" 
              value={llmConfig.maxTokens}
              onChange={(e) => setLlmConfig({ ...llmConfig, maxTokens: parseInt(e.target.value) })}
              min="100"
              max="8000"
              className="mt-1"
            />
          </div>
          
          <Alert className="mt-3">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Configurações avançadas do modelo de IA para geração de código
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'Projetos',
      icon: Folder,
      content: (
        <div className="space-y-3">
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
          
          <div className="space-y-2">
            {projects.map((project: Project) => (
              <div
                key={project.id}
                onClick={() => setCurrentProject(project)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  currentProject?.id === project.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{project.name}</p>
                    <p className="text-xs text-gray-500">
                      {project.templates.length} templates
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'knowledge',
      title: 'Base de Conhecimento',
      icon: BookOpen,
      content: (
        <div className="space-y-3">
          <Button 
            className="w-full justify-start" 
            variant="outline" 
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carregar Documento
          </Button>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {knowledgeDocs.map((doc: KnowledgeDoc) => (
              <div key={doc.id} className="p-2 rounded border border-gray-200 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {(doc.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Preferências',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Tema</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-1" />
                Claro
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-1" />
                Escuro
              </Button>
              <Button
                variant={theme === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('auto')}
              >
                Auto
              </Button>
            </div>
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-600">Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (BR)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 block">Notificações</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Análise concluída</span>
                <Switch 
                  checked={notifications.analysisComplete}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, analysisComplete: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Erros</span>
                <Switch 
                  checked={notifications.errors}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, errors: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <div className={`fixed right-0 top-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } w-80`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold" style={{ color: BRAND_COLORS.primary }}>
            Configurações
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100vh-73px)]">
          <div className="p-4 space-y-2">
            {sidebarSections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections.includes(section.id)
              
              return (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      setActiveSection(section.id)
                      toggleSection(section.id)
                    }}
                    className={`w-full p-3 flex items-center justify-between transition-colors ${
                      activeSection === section.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    <ChevronDown 
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  
                  {isExpanded && (
                    <div className="p-4 border-t bg-gray-50">
                      {section.content}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

export default function CodeGenerationPage() {
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
  
  // Estados específicos para geração de código
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof CODE_TEMPLATES | null>(null)
  const [customRequirements, setCustomRequirements] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-4o')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  
  // Estados do Menu Lateral
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    model: 'gpt-4o',
    apiKey: '',
    maxTokens: 4096
  })
  const [versions, setVersions] = useState<VersionFile[]>([])
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDoc[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light')
  const [language, setLanguage] = useState('pt-BR')
  const [notifications, setNotifications] = useState({
    analysisComplete: true,
    errors: true,
    updates: false
  })

  // Verificar conexão com backend
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
      'generating_code': { 
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 border-purple-200', 
        icon: Wand2, 
        label: 'Gerando Código' 
      },
      'generating_report': { 
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50 border-indigo-200', 
        icon: FileText, 
        label: 'Preparando Código' 
      },
      'completed': { 
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200', 
        icon: CheckCircle, 
        label: 'Código Gerado' 
      },
      'failed': { 
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200', 
        icon: XCircle, 
        label: 'Erro na Geração' 
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
        const statusResponse = await fetch(`${API_URL}/status/${jobId}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors',
          credentials: 'omit'
        })
        
        let finalStatus = 'generating_code'
        let finalProgress = 50
        let finalReport = null
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          finalStatus = statusData.status || 'generating_code'
          finalProgress = statusData.progress || 50
          finalReport = statusData.analysis_report
        }
        
        const reportResponse = await fetch(`${API_URL}/jobs/${jobId}/report`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors',
          credentials: 'omit'
        })
        
        if (reportResponse.ok) {
          const reportData = await reportResponse.json()
          finalReport = reportData.report || reportData.analysis_report || finalReport
        }
        
        setJobs(prev => prev.map(job =>
          job.id === jobId
            ? {
                ...job,
                status: finalStatus,
                progress: finalProgress,
                message: statusResponse.ok ? 'Gerando código...' : job.message,
                analysis_report: finalReport || job.analysis_report,
                updated_at: new Date()
              }
            : job
        ))
        
        if (selectedJob?.id === jobId) {
          setSelectedJob(prev => prev ? {
            ...prev,
            status: finalStatus,
            progress: finalProgress,
            analysis_report: finalReport || prev.analysis_report,
            updated_at: new Date()
          } : null)
          
          if (finalReport) {
            setShowReport(true)
          }
        }
        
        if (['completed', 'failed', 'rejected', 'done'].includes(finalStatus)) {
          clearInterval(pollInterval)
          setIsPolling(null)
        }
      } catch (error) {
        console.error('Erro no polling:', error)
      }
    }, 3000)
    
    setTimeout(() => {
      clearInterval(pollInterval)
      setIsPolling(null)
    }, 300000)
  }

  // Submeter geração de código
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedTemplate && !customRequirements) {
      setErrorMessage('Selecione um template ou forneça requisitos personalizados')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const requirements = selectedTemplate 
        ? CODE_TEMPLATES[selectedTemplate].requirements 
        : customRequirements

      const requestBody = {
        repo_name: "LucioFlavioRosa/projeto_refinado",
        analysis_type: "geracao_codigo_a_partir_de_reuniao",
        branch_name: "main",
        instrucoes_extras: requirements,
        usar_rag: false,
        gerar_relatorio_apenas: false,
        model_name: selectedModel
      }

      const response = await fetch(`${API_URL}/start-analysis`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const data = await response.json()
        const jobId = data.job_id || data.id || Math.random().toString(36).substr(2, 9)
        
        const newJob: Job = {
          id: jobId,
          status: 'generating_code',
          progress: 10,
          message: data.message || 'Geração de código iniciada',
          analysis_report: data.report || data.analysis_report,
          created_at: new Date(),
          updated_at: new Date(),
          repo_name: 'projeto_refinado',
          analysis_type: 'geracao_codigo_a_partir_de_reuniao',
          branch_name: 'main',
          gerar_relatorio_apenas: false,
          code_type: selectedTemplate || 'custom'
        }
        
        setJobs(prev => [newJob, ...prev])
        setSelectedJob(newJob)
        
        if (data.report || data.analysis_report) {
          setShowReport(true)
          setShowApprovalModal(true)
        } else {
          startPolling(jobId)
        }
        
        setSelectedTemplate(null)
        setCustomRequirements('')
      } else {
        const errorText = await response.text()
        setErrorMessage(`Erro ${response.status}: ${errorText || response.statusText}`)
      }
    } catch (error) {
      console.error('Erro ao iniciar geração:', error)
      setErrorMessage(`Erro de conexão: ${error instanceof Error ? error.message : 'Verifique o backend'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Aprovar/Rejeitar job
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

  // Download do relatório
  const downloadReport = (job: Job) => {
    if (job.analysis_report) {
      const blob = new Blob([job.analysis_report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `codigo-gerado-${job.id}.md`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Filtrar jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.id.includes(searchQuery) || 
                         job.repo_name?.includes(searchQuery) ||
                         job.code_type?.includes(searchQuery)
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Logo e Status */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Botão Menu */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
              </Button>
              
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex items-center gap-2"
                style={{ borderColor: BRAND_COLORS.accent }}
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>

              {currentProject && (
                <Badge 
                  variant="outline"
                  className="hidden sm:flex items-center gap-1"
                  style={{ borderColor: BRAND_COLORS.secondary }}
                >
                  <Folder className="h-3 w-3" />
                  {currentProject.name}
                </Badge>
              )}

              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                connectionStatus === 'connected' 
                  ? 'bg-green-50 border-green-200' 
                  : connectionStatus === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className={`h-2 w-2 rounded-full ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-500' 
                    : connectionStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-yellow-500 animate-pulse'
                }`} />
                <span className="text-xs font-medium">
                  {connectionStatus === 'connected' 
                    ? 'Conectado' 
                    : connectionStatus === 'error'
                    ? 'Erro de Conexão'
                    : 'Verificando...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Formulário de Geração */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card do Formulário */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, white 100%)` }}>
                <CardTitle className="text-2xl font-bold flex items-center" style={{ color: BRAND_COLORS.primary }}>
                  <Sparkles className="mr-3 h-7 w-7" style={{ color: BRAND_COLORS.secondary }} />
                  Gerar Código com IA
                </CardTitle>
                <CardDescription>
                  Escolha um template ou forneça requisitos personalizados para gerar código completo
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Templates de Código */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold flex items-center">
                      <Package className="h-5 w-5 mr-2 text-gray-500" />
                      Escolha um Template
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(CODE_TEMPLATES).map(([key, template]) => {
                        const Icon = template.icon
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(key as keyof typeof CODE_TEMPLATES)
                              setCustomRequirements('')
                            }}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedTemplate === key 
                                ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className={`h-8 w-8 mb-2 ${
                              selectedTemplate === key ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                            <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                            <p className="text-xs text-gray-500">{template.description}</p>
                            {selectedTemplate === key && (
                              <div className="mt-2 flex justify-center">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OU</span>
                    </div>
                  </div>

                  {/* Requisitos Personalizados */}
                  <div className="space-y-2">
                    <Label htmlFor="requirements" className="text-base font-semibold flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-500" />
                      Requisitos do Projeto
                      {!selectedTemplate && <Badge variant="outline" className="ml-2">Personalizado</Badge>}
                    </Label>
                    
                    {selectedTemplate ? (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">
                            Template: {CODE_TEMPLATES[selectedTemplate].name}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTemplate(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <ScrollArea className="h-32">
                          <pre className="text-xs text-blue-800 whitespace-pre-wrap">
                            {CODE_TEMPLATES[selectedTemplate].requirements.substring(0, 500)}...
                          </pre>
                        </ScrollArea>
                      </div>
                    ) : (
                      <Textarea
                        id="requirements"
                        placeholder={`Digite os requisitos completos do seu projeto...

Exemplo:
- Sistema de gestão de tarefas
- Autenticação com JWT
- CRUD completo de tarefas
- Dashboard com gráficos
- API REST em Python/FastAPI
- Frontend em React com TypeScript
- Banco de dados PostgreSQL
- Testes automatizados`}
                        value={customRequirements}
                        onChange={(e) => setCustomRequirements(e.target.value)}
                        className="min-h-[400px] font-mono text-sm border-gray-200 focus:border-blue-400"
                      />
                    )}
                  </div>

                  {/* Modelo de IA */}
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-base font-semibold flex items-center">
                      <Cpu className="h-5 w-5 mr-2 text-gray-500" />
                      Modelo de IA
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">
                          <div className="flex items-center justify-between w-full">
                            <span>GPT-4o</span>
                            <Badge variant="outline" className="ml-2">Mais Inteligente</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt-4-turbo">
                          <div className="flex items-center justify-between w-full">
                            <span>GPT-4 Turbo</span>
                            <Badge variant="outline" className="ml-2">Rápido</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt-4">
                          <div className="flex items-center justify-between w-full">
                            <span>GPT-4</span>
                            <Badge variant="outline" className="ml-2">Padrão</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mensagem de Erro */}
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  {/* Botão Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || connectionStatus === 'error' || (!selectedTemplate && !customRequirements)}
                    className="w-full font-semibold text-white transition-all duration-200 h-12 text-base"
                    style={{ 
                      background: isSubmitting ? '#666' : BRAND_COLORS.primary,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Gerando Código...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Gerar Código com IA
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Histórico de Gerações */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <History className="mr-2 h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                    Histórico de Gerações
                  </CardTitle>
                  <Badge variant="outline">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'geração' : 'gerações'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Filtros */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar por ID ou tipo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="generating_code">Gerando</SelectItem>
                      <SelectItem value="pending_approval">Aguardando</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="failed">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Jobs */}
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {filteredJobs.length === 0 ? (
                      <div className="text-center py-12">
                        <Code className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Nenhuma geração encontrada</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Comece gerando seu primeiro código
                        </p>
                      </div>
                    ) : (
                      filteredJobs.map((job) => {
                        const statusInfo = getStatusDisplay(job.status)
                        const StatusIcon = statusInfo.icon
                        const templateInfo = job.code_type && job.code_type !== 'custom' 
                          ? CODE_TEMPLATES[job.code_type as keyof typeof CODE_TEMPLATES]
                          : null
                        const TemplateIcon = templateInfo?.icon || FileCode
                        
                        return (
                          <div
                            key={job.id}
                            onClick={() => {
                              setSelectedJob(job)
                              setShowApprovalModal(true) // Sempre abrir
                            }}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                              selectedJob?.id === job.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : `${statusInfo.bgColor} hover:shadow-sm`
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
                                  <span className={`font-semibold ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                  {isPolling === job.id && (
                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center gap-1">
                                    <TemplateIcon className="h-4 w-4" />
                                    <span>{templateInfo?.name || 'Personalizado'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{new Date(job.created_at).toLocaleTimeString()}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {job.id}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyJobId(job.id)
                                    }}
                                  >
                                    {copiedId === job.id ? (
                                      <CheckCheck className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                                
                                {job.progress > 0 && job.progress < 100 && (
                                  <Progress value={job.progress} className="h-1 mt-3" />
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-2 ml-4">
                                {job.analysis_report && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedJob(job)
                                        setShowReport(true)
                                        setShowApprovalModal(true)
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Ver
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        downloadReport(job)
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-1" />
                                      Baixar
                                    </Button>
                                  </>
                                )}
                                
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
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Estatísticas */}
          <div className="space-y-6">
            {/* Card de Estatísticas */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Total de Gerações</span>
                      <span className="font-semibold">{jobs.length}</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Taxa de Sucesso</span>
                      <span className="font-semibold">
                        {jobs.length > 0 
                          ? Math.round((jobs.filter((j: Job) => j.status === 'completed').length / jobs.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={jobs.length > 0 
                        ? (jobs.filter((j: Job) => j.status === 'completed').length / jobs.length) * 100
                        : 0} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-sm mb-3">Por Template</h4>
                    <div className="space-y-2">
                      {Object.entries(CODE_TEMPLATES).map(([key, template]) => {
                        const Icon = template.icon
                        const count = jobs.filter((j: Job) => j.code_type === key).length
                        
                        return (
                          <div key={key} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{template.name}</span>
                            </div>
                            <Badge variant="outline">{count}</Badge>
                          </div>
                        )
                      })}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">Personalizado</span>
                        </div>
                        <Badge variant="outline">
                          {jobs.filter((j: Job) => j.code_type === 'custom' || !j.code_type).length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Ajuda */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HelpCircle className="mr-2 h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Escolha um Template</p>
                      <p className="text-xs text-gray-500">
                        Selecione um dos templates predefinidos ou forneça requisitos personalizados
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Selecione o Modelo</p>
                      <p className="text-xs text-gray-500">
                        Escolha o modelo de IA mais adequado para seu projeto
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Gere o Código</p>
                      <p className="text-xs text-gray-500">
                        A IA criará o código completo baseado nos requisitos fornecidos
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Revise e Baixe</p>
                      <p className="text-xs text-gray-500">
                        Aprove o código gerado e baixe os arquivos do projeto
                      </p>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Os agentes de IA analisam os requisitos e geram código production-ready seguindo as melhores práticas
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Card de Dicas */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="mr-2 h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                  Dicas para Melhores Resultados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Seja específico nos requisitos técnicos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Defina claramente as tecnologias desejadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Inclua exemplos de funcionalidades esperadas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Especifique padrões de arquitetura preferidos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Use GPT-4o para projetos mais complexos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        llmConfig={llmConfig}
        setLlmConfig={setLlmConfig}
        versions={versions}
        knowledgeDocs={knowledgeDocs}
        projects={projects}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* Modal de Aprovação */}
      {showApprovalModal && selectedJob && (
        <ApprovalModal
          job={selectedJob}
          onApprove={handleJobAction}
          onReject={handleJobAction}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedJob(null)
          }}
        />
      )}
    </div>
  )
}
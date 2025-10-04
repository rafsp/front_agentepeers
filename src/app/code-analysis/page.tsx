"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import CodeGenerationWidget from '@/components/CodeGenerationWidget'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import { GitHubFilePicker } from '@/components/GitHubFilePicker'
import remarkGfm from 'remark-gfm'
import { azureBlobService, AzureProject } from '@/lib/azure-storage'
import { fetchAzureProjects } from '@/lib/azure-direct'
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
  Cloud,
  ExternalLink,
  HelpCircle,
  LogOut,
  BarChart3,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react'

//const API_URL = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'

const API_URL = 'https://poc-agent-revisor-teste-c8c2cucda0hcdxbj.centralus-01.azurewebsites.net'

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

// ADICIONAR estas constantes depois de BRAND_COLORS:

// Lista pré-definida de repositórios
const REPOSITORY_LIST = [
  {
    value: 'rafsp/front_agentes_peers',
    label: 'Front Agentes PEERS',
    branch: 'main',
    description: 'Frontend do sistema de agentes'
  },
  {
    value: 'rafsp/backend_agent_revisor',
    label: 'Backend Agent Revisor',
    branch: 'main',
    description: 'API backend dos agentes'
  },
  {
    value: 'rafsp/LegadoAnalise/tree/main/SistemaAvaliacao',
    label: 'Sistema Peers - Avaliação de Desempenho',
    branch: 'main',
    description: 'Sistema de avaliação de desempenho'
  },
  {
    value: 'LucioFlavioRosa/teste_agent',
    label: 'Sistema POC Porto',
    branch: 'main',
    description: 'Sistema de análise de código POC Porto'
  },
  {
    value: 'custom',
    label: 'Outro repositório...',
    branch: '',
    description: 'Inserir repositório personalizado'
  }
]

// Branches disponíveis
const BRANCH_LIST = [
  { value: 'main', label: 'main' },
  { value: 'master', label: 'master' },
  { value: 'develop', label: 'develop' },
  { value: 'staging', label: 'staging' },
  { value: 'custom', label: 'Outra branch...' }
]

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
  source?: 'azure' | 'local'  
}




// Funções para gerenciar localStorage
const STORAGE_KEYS = {
  LLM_CONFIG: 'llm_config',
  SELECTED_REPO: 'selected_repository',
  SELECTED_BRANCH: 'selected_branch',
  ANALYSIS_TYPE: 'selected_analysis',
  MODEL_NAME: 'selected_model',
  USE_RAG: 'use_rag',
  FAST_MODE: 'fast_mode',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications'
}

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return defaultValue
  }
}

// Tipos de análise organizados por categoria - ATUALIZADO COM OS VALORES CORRETOS DA API
// Tipos de análise organizados por categoria - ATUALIZADO COM YAML
const analysisCategories = {
  '🚀 Geração e Implementação': [
    { 
      value: 'geracao_codigo_a_partir_de_reuniao', 
      label: 'Geração de Código', 
      icon: Code, 
      description: 'Gerar código a partir de requisitos', 
      color: 'yellow' 
    },
    { 
      value: 'relatorio_implentacao_feature', 
      label: 'Implementação de Features', 
      icon: Plus, 
      description: 'Plano de implementação técnico detalhado', 
      color: 'green' 
    },
    {
      value: 'relatorio_implentacao_feature_azure',
      label: 'Implementação Azure',
      icon: Cloud,
      description: 'Plano de implementação na Azure',
      color: 'blue'
    },
    {
      value: 'relatorio_modernizacao_asp_net',
      label: 'Modernização ASP.NET',
      icon: Layers,
      description: 'Migração para ASP.NET Core 8',
      color: 'indigo'
    },
    {
      value: 'relatorio_erros_migracao',
      label: 'Correção de Migração',
      icon: Bug,
      description: 'Correção de erros de migração',
      color: 'red'
    },
  ],
  
  '🔍 Análise e Qualidade': [
    { 
      value: 'relatorio_avaliacao_terraform', 
      label: 'Avaliação Terraform', 
      icon: Layers, 
      description: 'Auditoria técnica em código Terraform', 
      color: 'purple' 
    },
    { 
      value: 'relatorio_cleancode', 
      label: 'Clean Code', 
      icon: Sparkles, 
      description: 'Identificar violações dos princípios SOLID', 
      color: 'green' 
    },
    { 
      value: 'relatorio_conformidades', 
      label: 'Conformidades', 
      icon: CheckCircle, 
      description: 'Identificar inconsistências funcionais', 
      color: 'orange' 
    },
    { 
      value: 'relatorio_simplicacao', 
      label: 'Simplificação de Código', 
      icon: Zap, 
      description: 'Princípios DRY, YAGNI e KISS', 
      color: 'cyan' 
    },
  ],
  
  '📚 Documentação': [
    { 
      value: 'relatorio_docstring', 
      label: 'Docstrings', 
      icon: FileText, 
      description: 'Análise de docstrings e comentários', 
      color: 'blue' 
    },
    { 
      value: 'relatorio_documentacao', 
      label: 'Documentação Geral', 
      icon: FileCode, 
      description: 'Arquivos essenciais de documentação', 
      color: 'indigo' 
    },
  ],
  
  '🔒 Segurança': [
    { 
      value: 'relatorio_owasp', 
      label: 'Avaliação OWASP', 
      icon: Shield, 
      description: 'Auditoria de segurança aprofundada', 
      color: 'red' 
    },
    { 
      value: 'relatorio_pentest', 
      label: 'Pentest', 
      icon: Bug, 
      description: 'Simular teste de invasão', 
      color: 'pink' 
    },
    { 
      value: 'relatorio_sast', 
      label: 'SAST Analysis', 
      icon: FileCode, 
      description: 'Análise estática de segurança', 
      color: 'purple' 
    },
  ],
  
  '⚡ Performance': [
    { 
      value: 'relatorio_performance_eficiencia', 
      label: 'Performance e Eficiência', 
      icon: Activity, 
      description: 'Identificar gargalos e ineficiências', 
      color: 'orange' 
    },
  ],
  
  '🧪 Testes': [
    { 
      value: 'relatorio_teste_integracao', 
      label: 'Testes de Integração', 
      icon: GitBranch, 
      description: 'Auditoria de testes de integração', 
      color: 'teal' 
    },
    { 
      value: 'relatorio_teste_unitario', 
      label: 'Testes Unitários', 
      icon: TestTube, 
      description: 'Análise de cobertura e qualidade', 
      color: 'green' 
    },
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

// Componente do Menu Lateral
const Sidebar = ({ 
  isOpen, 
  onClose,
  llmConfig,
  setLlmConfig,
  versions,
  setVersions,
  knowledgeDocs,
  setKnowledgeDocs,
  projects,
  setProjects,
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
    // Função para carregar projetos do Azure
    const loadAzureProjects = async () => {
      try {
        const sasToken = localStorage.getItem('azure_sas_token') || 
          'sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2025-10-04T06:55:14Z&st=2025-10-03T22:40:14Z&spr=https&sig=cuRKL4IfTDj%2Bm7I6CLEwx6QmoUzdyBMzV5IL0icXkY4%3D'
        
        const url = `https://reportsagentpeers.blob.core.windows.net/reports?restype=container&comp=list&${sasToken}`
        
        const response = await fetch(url)
        const text = await response.text()
        
        const nameRegex = /<Name>([^<]+)<\/Name>/g
        let match
        const projectsSet = new Set<string>()
        
        while ((match = nameRegex.exec(text)) !== null) {
          const fullPath = match[1]
          
          if (fullPath.includes('/')) {
            const folderName = fullPath.split('/')[0]
            projectsSet.add(folderName)
          } else if (!fullPath.includes('.')) {
            projectsSet.add(fullPath)
          }
        }
        
        const projectsList = Array.from(projectsSet).map((name: string) => ({
          id: name,
          name: name
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
          source: 'azure' as const,
          created: new Date(),
          lastModified: new Date(),
          templates: [] as string[]
        }))
        
        if (projectsList.length > 0) {
          setProjects(projectsList)
          console.log('Projetos carregados automaticamente:', projectsList.length)
        }
      } catch (error) {
        console.log('Usando lista offline devido a erro:', error)
        
        // Fallback para lista fixa
        const fallbackProjects = [
          'AnaliseAgentes',
          'atualizacao_sistema_legado',
          'evolucao_agente',
          'insercao_contexto',
          'legado_avaliacao',
          'melhoria_codigo'
        ].map((name: string) => ({
          id: name,
          name: name
            .replace(/_/g, ' ')
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' '),
          source: 'azure' as const,
          created: new Date(),
          lastModified: new Date(),
          templates: [] as string[]
        }))
        
        setProjects(fallbackProjects)
      }
    }

    // Carregar projetos apenas se ainda não foram carregados
    if (projects.length === 0) {
      loadAzureProjects()
    }
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'version' | 'knowledge') => {
    const file = event.target.files?.[0]
    if (file) {
      if (type === 'version') {
        const newVersion: VersionFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          version: '1.0.0',
          uploadDate: new Date(),
          size: file.size
        }
        setVersions([...versions, newVersion])
      } else {
        const newDoc: KnowledgeDoc = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'documentation',
          uploadDate: new Date(),
          size: file.size
        }
        setKnowledgeDocs([...knowledgeDocs, newDoc])
      }
    }
  }

  

  const menuSections = [
    {
      id: 'llm',
      title: 'Configuração LLM',
      icon: BrainCircuit,
      content: (
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-700">Modelo</Label>
            <Select value={llmConfig.model} onValueChange={(v) => setLlmConfig({...llmConfig, model: v})}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">gpt-5</SelectItem>
                <SelectItem value="claude-3-haiku-20240307">Claude 3</SelectItem>
                <SelectItem value="claude-3-5-haiku-20241022">Claude 3</SelectItem>
                <SelectItem value="claude-sonnet-4-20250514">Claude 3</SelectItem>
                <SelectItem value="claude-opus-4-20250514">Claude 3</SelectItem>

              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700">API Key</Label>
            <Input 
              type="password"
              value={llmConfig.apiKey}
              onChange={(e) => setLlmConfig({...llmConfig, apiKey: e.target.value})}
              placeholder="sk-..."
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-700">Max Tokens</Label>
            <Input 
              type="number"
              value={llmConfig.maxTokens}
              onChange={(e) => setLlmConfig({...llmConfig, maxTokens: parseInt(e.target.value)})}
              className="mt-1"
            />
          </div>

            <Button 
              className="w-full"
              style={{ backgroundColor: BRAND_COLORS.primary }}
              onClick={() => {
                // Salvar todas as configurações
                saveToStorage(STORAGE_KEYS.LLM_CONFIG, llmConfig)
                
                // Mostrar notificação de sucesso
                const successDiv = document.createElement('div')
                successDiv.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'
                successDiv.innerHTML = `
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Configurações salvas com sucesso!
                `
                document.body.appendChild(successDiv)
                setTimeout(() => successDiv.remove(), 3000)
              }}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
        </div>
      )
    },
    {
      id: 'versions',
      title: 'Controle de Versões',
      icon: GitBranch,
      content: (
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'version')}
          />
          
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload de Versão
          </Button>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">Versões Carregadas</Label>
            <ScrollArea className="h-32 border rounded-lg p-2">
              {versions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Nenhuma versão disponível</p>
              ) : (
                versions.map((version: VersionFile) => (
                  <div key={version.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium">{version.name}</p>
                        <p className="text-xs text-gray-500">v{version.version}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setVersions(versions.filter((v: VersionFile) => v.id !== version.id))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      )
    },
    {
      id: 'knowledge',
      title: 'Base de Conhecimento',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <input
            ref={docInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileUpload(e, 'knowledge')}
          />
          
          <Button 
            className="w-full"
            variant="outline"
            onClick={() => docInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>

          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">Documentos RAG</Label>
            <ScrollArea className="h-32 border rounded-lg p-2">
              {knowledgeDocs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Nenhum documento disponível</p>
              ) : (
                knowledgeDocs.map((doc: KnowledgeDoc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setKnowledgeDocs(knowledgeDocs.filter((d: KnowledgeDoc) => d.id !== doc.id))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          <div className="pt-2 border-t">
            <Label className="text-xs font-medium text-gray-700 mb-2">Configurações RAG</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Chunking Size</span>
                <Input type="number" defaultValue="512" className="w-20 h-7 text-xs" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Overlap</span>
                <Input type="number" defaultValue="50" className="w-20 h-7 text-xs" />
              </div>
            </div>
          </div>
        </div>
      )
    },
    // Adicione este import no topo do arquivo

// No componente Sidebar, atualize a seção de projetos:
          {
            id: 'projects',
            title: 'Projetos',
            icon: Folder,
            content: (
              <div className="space-y-4">
                {/* Campo para configurar o SAS Token */}
               <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">Projetos do Azure</Label>
                <ScrollArea className="h-48 border rounded-lg p-2">
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <Cloud className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">Nenhum projeto carregado</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Clique em "Carregar do Azure" para buscar
                      </p>
                    </div>
                  ) : (
                    projects.map((project: Project) => (
                      <div 
                        key={project.id} 
                        className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                          currentProject?.id === project.id 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => setCurrentProject(project)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {project.source === 'azure' ? (
                              <Cloud className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FolderOpen className="h-4 w-4 text-gray-500" />
                            )}
                            <div>
                              <p className="text-xs font-medium">{project.name}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(project.lastModified).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </div>

              {/* Botão para atualizar lista */}
              <Button 
                variant="outline"
                className="w-full"
                onClick={async () => {
                  const azureProjects = await azureBlobService.listProjects()
                  setProjects(azureProjects.map(p => ({
                    id: p.id,
                    name: p.name,
                    created: p.lastModified,
                    lastModified: p.lastModified,
                    templates: [],
                    source: 'azure'
                  })))
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Lista
              </Button>
            </div>
          )
        },
    {
      id: 'settings',
      title: 'Configurações Gerais',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Claro
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Escuro
                  </div>
                </SelectItem>
                <SelectItem value="auto">Auto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 border-t">
            <Label className="text-sm font-medium mb-3">Notificações</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs">Análise Completa</span>
                <Switch 
                  checked={notifications.analysisComplete}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, analysisComplete: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Erros</span>
                <Switch 
                  checked={notifications.errors}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, errors: checked})
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Atualizações</span>
                <Switch 
                  checked={notifications.updates}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, updates: checked})
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
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-80
      `}>
        {/* Header */}
        <div className="p-4 border-b" style={{ backgroundColor: BRAND_COLORS.accent + '30' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold" style={{ color: BRAND_COLORS.primary }}>
              Configurações
            </h2>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-2">
            {menuSections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections.includes(section.id)
              
              return (
                <div key={section.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`
                      w-full px-4 py-3 flex items-center justify-between transition-colors
                      ${activeSection === section.id 
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


// Modal de Aprovação com Instruções Extras
  const ApprovalModal = ({ job, onApprove, onReject, onClose }: any) => {
  const [instrucoes, setInstrucoes] = useState('')
  
  if (!job) return null

  const handleApprove = () => {
    onApprove(job.id, 'approve', instrucoes)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, white 100%)` }}>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
            Relatório Gerado - Aguardando Aprovação
          </h2>
          <p className="text-gray-600 mt-1">Revise o relatório antes de prosseguir com as mudanças</p>
        </div>
        
        <ScrollArea className="h-[50vh] p-6">
          <div className="prose max-w-none">
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
              <code>{job.analysis_report || 'Processando análise...'}</code>
            </pre>
          </div>
        </ScrollArea>
        
        {/* Campo de Instruções Extras */}
        <div className="p-6 border-t bg-gray-50">
          <Label htmlFor="instrucoes" className="text-sm font-medium mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Instruções Adicionais para os Agentes (Opcional)
          </Label>
          <Textarea
            id="instrucoes"
            placeholder="Ex: Focar em melhorias de performance, adicionar testes unitários, seguir padrão da empresa..."
            value={instrucoes}
            onChange={(e) => setInstrucoes(e.target.value)}
            className="w-full min-h-[100px] border-gray-200"
          />
          <p className="text-xs text-gray-500 mt-2">
            Estas instruções serão enviadas aos agentes junto com a aprovação
          </p>
        </div>
        
        <div className="p-6 border-t flex justify-end space-x-3">
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
            onClick={handleApprove}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Aprovar e Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function TestPage() {
  // Estados principais (mantendo todos os existentes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isPolling, setIsPolling] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [showFilePicker, setShowFilePicker] = useState(false)

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')


  // ADICIONAR estes estados junto com os outros useState:
const [selectedRepository, setSelectedRepository] = useState(() => 
  loadFromStorage(STORAGE_KEYS.SELECTED_REPO, '')
)




const [customRepository, setCustomRepository] = useState('')
const [selectedBranch, setSelectedBranch] = useState(() => 
  loadFromStorage(STORAGE_KEYS.SELECTED_BRANCH, 'main')
)
const [customBranch, setCustomBranch] = useState('')
  
  // Estados do Menu Lateral
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    model: 'gpt-4-turbo',
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
  
  // Formulário com valores padrão para teste
const [formData, setFormData] = useState({
  repo_name: 'rafsp/LegadoAnalise',
  analysis_type: 'relatorio_documentacao',
  branch_name: 'main',
  repository_type: 'github', // NOVO
  analysis_name: '', // NOVO
  arquivos_especificos: '', // NOVO
  retornar_lista_arquivos: false, // NOVO
  instrucoes_extras: '',
  usar_rag: false,
  gerar_relatorio_apenas: true,
  model_name: 'gpt-4o'
})


//const nova para modal

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [jobToApprove, setJobToApprove] = useState<Job | null>(null)




  // Carregar projetos do Azure automaticamente
useEffect(() => {
  const loadAzureProjects = async () => {
    try {
      const azureProjects = await azureBlobService.listProjects()
      
      if (azureProjects.length > 0) {
        setProjects(azureProjects.map(p => ({
          id: p.id,
          name: p.name,
          created: p.lastModified,
          lastModified: p.lastModified,
          templates: [],
          source: 'azure'
        })))
        
        console.log(`${azureProjects.length} projetos carregados do Azure`)
      }
    } catch (error) {
      console.error('Erro ao carregar projetos do Azure:', error)
    }
  }
  
  loadAzureProjects()
}, [])

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('llmConfig')
    if (savedConfig) {
      setLlmConfig(JSON.parse(savedConfig))
    }

    const savedProjects = localStorage.getItem('projects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }

    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark' | 'auto')
    }
  }, [])

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
  

  // Salvar configurações automaticamente quando mudarem
useEffect(() => {
  if (selectedRepository) {
    saveToStorage(STORAGE_KEYS.SELECTED_REPO, selectedRepository)
  }
}, [selectedRepository])

useEffect(() => {
  if (selectedBranch) {
    saveToStorage(STORAGE_KEYS.SELECTED_BRANCH, selectedBranch)
  }
}, [selectedBranch])

useEffect(() => {
  if (formData.analysis_type) {
    saveToStorage(STORAGE_KEYS.ANALYSIS_TYPE, formData.analysis_type)
  }
}, [formData.analysis_type])

useEffect(() => {
  if (formData.model_name) {
    saveToStorage(STORAGE_KEYS.MODEL_NAME, formData.model_name)
  }
}, [formData.model_name])

useEffect(() => {
  saveToStorage(STORAGE_KEYS.USE_RAG, formData.usar_rag)
}, [formData.usar_rag])

useEffect(() => {
  saveToStorage(STORAGE_KEYS.FAST_MODE, formData.gerar_relatorio_apenas)
}, [formData.gerar_relatorio_apenas])

useEffect(() => {
  saveToStorage(STORAGE_KEYS.LLM_CONFIG, llmConfig)
}, [llmConfig])

   //  ADICIONAR o novo useEffect AQUI (dentro do componente!)
  useEffect(() => {
    if (selectedRepository && selectedRepository !== 'custom') {
      const repo = REPOSITORY_LIST.find(r => r.value === selectedRepository)
      if (repo && repo.branch) {
        setSelectedBranch(repo.branch)
      }
    }
  }, [selectedRepository])


  

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

  // Determinar o repositório e branch finais
  const finalRepo = selectedRepository === 'custom' ? customRepository : selectedRepository
  const finalBranch = selectedBranch === 'custom' ? customBranch : selectedBranch

  setIsSubmitting(true)
  setErrorMessage('')
  
  try {
    // CRIAR PAYLOAD COM OS NOVOS CAMPOS DA API
const requestPayload = {
      repo_name_modernizado: finalRepo,
      branch_name_modernizado: finalBranch,
      repository_type: formData.repository_type || "github",  // ← USA O CAMPO DO FORM
      projeto: formData.analysis_name || "AnaliseAgentes",  // ← USA NOME DA ANÁLISE
      analysis_type: formData.analysis_type,
      instrucoes_extras: formData.instrucoes_extras || '',
      usar_rag: formData.usar_rag,
      gerar_relatorio_apenas: formData.gerar_relatorio_apenas,
      retornar_lista_arquivos: formData.retornar_lista_arquivos || false,  // ← NOVO
      model_name: formData.model_name || 'gpt-4o',
      arquivos_especificos: formData.arquivos_especificos  // ← CONVERTE STRING PARA ARRAY
        ? formData.arquivos_especificos.split('\n').filter(f => f.trim())
        : []
    }

    const response = await fetch(`${API_URL}/start-analysis`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(requestPayload)  // USA O NOVO PAYLOAD
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
        repo_name: finalRepo,
        analysis_type: formData.analysis_type,
        branch_name: finalBranch,
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

 // Aprovar/Rejeitar job com instruções extras
const handleJobAction = async (jobId: string, action: 'approve' | 'reject', instrucoes_extras?: string) => {
  try {
    const payload: any = {
      job_id: jobId,
      action: action
    }
    
    // Adicionar instruções extras se fornecidas
    if (instrucoes_extras && instrucoes_extras.trim()) {
      payload.instrucoes_extras = instrucoes_extras
    }
    
    console.log('Enviando aprovação com payload:', payload)
    
    const response = await fetch(`${API_URL}/update-job-status`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(payload)
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
        
        // Mostrar notificação de sucesso
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
        successDiv.innerHTML = `✓ ${instrucoes_extras ? 'Aprovado com instruções!' : 'Aprovado com sucesso!'}`
        document.body.appendChild(successDiv)
        setTimeout(() => successDiv.remove(), 3000)
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
      {/* Menu Lateral */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        llmConfig={llmConfig}
        setLlmConfig={setLlmConfig}
        versions={versions}
        setVersions={setVersions}
        knowledgeDocs={knowledgeDocs}
        setKnowledgeDocs={setKnowledgeDocs}
        projects={projects}
        setProjects={setProjects}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        theme={theme}
        setTheme={setTheme}
        language={language}
        setLanguage={setLanguage}
        notifications={notifications}
        setNotifications={setNotifications}
      />

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
                  <span>Code .IA</span>
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

      {/* RESTO DO CÓDIGO CONTINUA EXATAMENTE IGUAL */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda - Formulário (mantém exatamente igual) */}
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

                                    {/* Dropdown de Repositório */}
<div className="space-y-2">
  <Label htmlFor="repository" className="flex items-center space-x-2">
    <Folder className="h-4 w-4" style={{ color: BRAND_COLORS.secondary }} />
    <span>Repositório</span>
  </Label>
  <Select value={selectedRepository} onValueChange={setSelectedRepository}>
    <SelectTrigger>
      <SelectValue placeholder="Selecione um repositório" />
    </SelectTrigger>
    <SelectContent>
      {REPOSITORY_LIST.map((repo) => (
        <SelectItem key={repo.value} value={repo.value}>
          <div className="flex flex-col">
            <span className="font-medium">{repo.label}</span>
            {repo.description && (
              <span className="text-xs text-gray-500">{repo.description}</span>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  
  {/* Input customizado se selecionou "Outro" */}
  {selectedRepository === 'custom' && (
    <Input
      placeholder="ex: owner/repository"
      value={customRepository}
      onChange={(e) => setCustomRepository(e.target.value)}
      className="mt-2"
      style={{ borderColor: BRAND_COLORS.accent }}
    />
  )}
</div>

                    {/* Dropdown de Branch */}
                    <div className="space-y-2">
                      <Label htmlFor="branch" className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4" style={{ color: BRAND_COLORS.secondary }} />
                        <span>Branch</span>
                      </Label>
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANCH_LIST.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Input customizado se selecionou "Outra" */}
                      {selectedBranch === 'custom' && (
                        <Input
                          placeholder="Nome da branch"
                          value={customBranch}
                          onChange={(e) => setCustomBranch(e.target.value)}
                          className="mt-2"
                          style={{ borderColor: BRAND_COLORS.accent }}
                        />
                      )}
                    </div>

                                      {/* NOVO: Nome da Análise */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Nome da Análise</span>
                      <Badge variant="outline" className="text-xs">Opcional</Badge>
                    </Label>
                    <Input
                      placeholder="Ex: Análise Frontend v2.0"
                      value={formData.analysis_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, analysis_name: e.target.value }))}
                    />
                  </div>

                  {/* NOVO: Tipo de Repositório */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Database className="h-4 w-4" />
                      <span>Tipo de Repositório</span>
                    </Label>
                    <Select 
                      value={formData.repository_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, repository_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="gitlab">GitLab</SelectItem>
                        <SelectItem value="azure">Azure DevOps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                {/* Arquivos Específicos com Seletor */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <FileCode className="h-4 w-4" />
                    <span>Arquivos Específicos</span>
                    <Badge variant="outline" className="text-xs">Opcional</Badge>
                  </Label>
                  
                  <div className="space-y-2">
                    {/* Botão para abrir o seletor */}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                                        console.log('Abrindo file picker...')
                                        setShowFilePicker(true)
                                      }}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Selecionar Arquivos do Repositório
                    </Button>
                    
                    {/* Textarea para edição manual */}
                    <Textarea
                      placeholder="Ou digite os caminhos manualmente (um por linha)"
                      value={formData.arquivos_especificos || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, arquivos_especificos: e.target.value }))}
                      className="font-mono text-sm min-h-[80px]"
                    />
                    
                    {/* Mostrar arquivos selecionados */}
                    {formData.arquivos_especificos && (
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Arquivos selecionados:</p>
                        <div className="text-xs font-mono">
                          {formData.arquivos_especificos.split('\n').filter(f => f).length} arquivo(s)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                

                  {/* File Picker Modal */}
                  <GitHubFilePicker
                    isOpen={showFilePicker}
                    onClose={() => setShowFilePicker(false)}
                    onSelect={(files) => {
                      console.log('Arquivos selecionados:', files)
                      setFormData(prev => ({
                        ...prev,
                        arquivos_especificos: files.join('\n')
                      }))
                    }}
                    repository={selectedRepository === 'custom' ? customRepository : selectedRepository}
                    branch={selectedBranch === 'custom' ? customBranch : selectedBranch}
                  />

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
                  {/* <div className="space-y-2">
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
                        <SelectItem value="gpt-4o">GPT-5 Optimized (Recomendado)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4 Standard</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4 Mini (Rápido)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">gpt-5</SelectItem>
                        <SelectItem value="claude-3-haiku-20240307">Claude 3 haiku</SelectItem>
                        <SelectItem value="claude-3-5-haiku-20241022">Claude 3-5 haiku</SelectItem>
                        <SelectItem value="claude-sonnet-4-20250514">Claude sonnet-4</SelectItem>
                        <SelectItem value="claude-opus-4-20250514">Claude OPUS-4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div> */}

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

                   {/* NOVO: Retornar Lista de Arquivos */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="list-files" className="text-sm font-medium">
                          Apenas listar arquivos (sem analisar conteúdo)
                        </Label>
                      </div>
                      <Switch
                        id="list-files"
                        checked={formData.retornar_lista_arquivos || false}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, retornar_lista_arquivos: checked }))
                        }
                      />
                    </div>
                  {/* Fim das opções avançadas */}

                  {/* Instruções Extras */}
                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-700" />
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
                        {formData.retornar_lista_arquivos 
                          ? 'Listar Arquivos' 
                          : formData.gerar_relatorio_apenas 
                          ? 'Gerar Relatório' 
                          : 'Iniciar Análise'}
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

          {/* Coluna Direita - Jobs e Relatórios (mantém exatamente igual) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros e Busca */}
            <Card className="border-0 shadow-lg">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por repositório ou ID do job..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={async (e) => {
                        // Se pressionar Enter e tiver um valor que parece ser um UUID
                        if (e.key === 'Enter' && searchQuery.length > 30) {
                          try {
                            // Buscar job pelo ID diretamente na API
                            const response = await fetch(`${API_URL}/status/${searchQuery.trim()}`, {
                              method: 'GET',
                              headers: { 'Accept': 'application/json' },
                              mode: 'cors',
                              credentials: 'omit'
                            })
                            
                            if (response.ok) {
                              const data = await response.json()
                              console.log('Job encontrado:', data)
                              
                              // Criar um objeto job a partir dos dados retornados
                              const fetchedJob: Job = {
                                id: data.job_id || searchQuery.trim(),
                                status: data.status || 'completed',
                                progress: data.status === 'completed' ? 100 : 50,
                                message: 'Job carregado da API',
                                analysis_report: data.analysis_report,
                                created_at: new Date(),
                                updated_at: new Date(),
                                repo_name: data.repo_name || 'Repositório',
                                analysis_type: data.analysis_type || 'relatorio_teste_unitario',
                                branch_name: data.branch_name || 'main',
                               // summary: data.summary
                              }
                              
                              // Adicionar o job à lista se não existir
                              const existingJob = jobs.find(j => j.id === fetchedJob.id)
                              if (!existingJob) {
                                setJobs(prev => [fetchedJob, ...prev])
                              } else {
                                // Atualizar o job existente
                                setJobs(prev => prev.map(j => 
                                  j.id === fetchedJob.id ? { ...j, ...fetchedJob } : j
                                ))
                              }
                              
                              // Selecionar o job e mostrar o relatório
                              setSelectedJob(fetchedJob)
                              setShowReport(!!fetchedJob.analysis_report)
                              
                              // Limpar a busca
                              setSearchQuery('')
                              
                              // Mostrar mensagem de sucesso
                              const successBadge = document.createElement('div')
                              successBadge.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'
                              successBadge.innerHTML = `
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Job carregado com sucesso!
                              `
                              document.body.appendChild(successBadge)
                              setTimeout(() => successBadge.remove(), 3000)
                            } else {
                              // Mostrar erro se não encontrar
                              const errorBadge = document.createElement('div')
                              errorBadge.className = 'fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'
                              errorBadge.innerHTML = `
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Job não encontrado!
                              `
                              document.body.appendChild(errorBadge)
                              setTimeout(() => errorBadge.remove(), 3000)
                            }
                          } catch (error) {
                            console.error('Erro ao buscar job:', error)
                          }
                        }
                      }}
                      className="pl-10 border-gray-200"
                    />
                    {/* Indicador de dica */}
                    {searchQuery.length === 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        Pressione Enter para buscar por ID
                      </div>
                    )}
                  </div>
                  
                  {/* Botão de busca direta */}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (searchQuery.length > 30) {
                        // Simular o evento de Enter para buscar
                        const event = new KeyboardEvent('keypress', { key: 'Enter' })
                        const input = document.querySelector('input[placeholder*="repositório"]') as HTMLInputElement
                        if (input) {
                          input.dispatchEvent(event)
                        }
                      }
                    }}
                    disabled={searchQuery.length < 30}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Job
                  </Button>
                  
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
                
                {/* Card de ajuda para busca por ID */}
                {searchQuery.length > 0 && searchQuery.length < 30 && (
                  <Alert className="mt-4 border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800">
                      Para buscar um job pelo ID, cole o ID completo (ex: f5c110bb-1b55-4871-9af7-0cd6c4a3cb45) e pressione Enter
                    </AlertDescription>
                  </Alert>
                )}
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
                                        {/* {job.analysis_report && (
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
                                            
                                            
                                          </Button>
                                        )} */}

                                        {/* Botão forçado para jobs concluídos sem relatório visível */}
{/* Botão para recuperar e exibir relatório */}
{(job.status === 'completed' || job.status === 'failed'  || job.status === 'Concluído') && (
  <Button
    size="sm"
    variant="outline"
    className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
    onClick={async (e) => {
      e.stopPropagation()
      
      // Indicador de loading
      const button = e.currentTarget as HTMLButtonElement
      const originalContent = button.innerHTML
      button.innerHTML = '<svg class="animate-spin h-3 w-3 mr-1 inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Carregando...'
      button.disabled = true
      
      try {
        // Tentar primeiro o endpoint /report
        const reportUrl = `${API_URL}/jobs/${job.id}/report`
        console.log('Tentando buscar relatório em:', reportUrl)
        
        let report = null
        let response = await fetch(reportUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors',
          credentials: 'omit'
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Resposta do /report:', data)
          
          // Verificar vários campos possíveis
          if (typeof data === 'string') {
            report = data
          } else {
            report = data.report || 
                    data.analysis_report || 
                    data.result || 
                    data.content ||
                    data.data ||
                    data.markdown ||
                    data.text
          }
        }
        
        // Se não encontrou, tentar o endpoint /status
        if (!report) {
          console.log('Tentando endpoint /status...')
          response = await fetch(`${API_URL}/status/${job.id}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors',
            credentials: 'omit'
          })
          
          if (response.ok) {
            const statusData = await response.json()
            console.log('Resposta do /status:', statusData)
            report = statusData.analysis_report || 
                    statusData.report || 
                    statusData.result
          }
        }
        
        // Se encontrou o relatório, atualizar e exibir
        if (report) {
          console.log('Relatório encontrado! Tamanho:', report.length, 'caracteres')
          
          // Atualizar o job com o relatório
          const updatedJob = { ...job, analysis_report: report }
          
          // Atualizar a lista de jobs
          setJobs(prev => {
            const newJobs = prev.map(j => 
              j.id === job.id ? updatedJob : j
            )
            console.log('Jobs atualizados')
            return newJobs
          })
          
          // Selecionar o job e mostrar o relatório imediatamente
          setSelectedJob(updatedJob)
          setShowReport(true)
          
          // Forçar re-render (às vezes necessário)
          setTimeout(() => {
            setSelectedJob(updatedJob)
            setShowReport(true)
          }, 100)
          
          // Mostrar notificação de sucesso
          const successDiv = document.createElement('div')
          successDiv.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
          successDiv.innerHTML = '✓ Relatório carregado com sucesso!'
          document.body.appendChild(successDiv)
          setTimeout(() => successDiv.remove(), 3000)
          
        } else {
          // Se não encontrou relatório
          console.error('Nenhum relatório encontrado nas respostas')
          
          // Mostrar erro
          const errorDiv = document.createElement('div')
          errorDiv.className = 'fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg'
          errorDiv.innerHTML = '✗ Relatório não encontrado. Tente novamente em alguns segundos.'
          document.body.appendChild(errorDiv)
          setTimeout(() => errorDiv.remove(), 4000)
        }
      } catch (error) {
        console.error('Erro ao buscar relatório:', error)
        
        // Mostrar erro de conexão
        const errorDiv = document.createElement('div')
        errorDiv.className = 'fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg'
        errorDiv.innerHTML = '✗ Erro de conexão. Verifique o console.'
        document.body.appendChild(errorDiv)
        setTimeout(() => errorDiv.remove(), 4000)
      } finally {
        // Restaurar botão
        button.innerHTML = originalContent
        button.disabled = false
      }
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
                                                  setJobToApprove(job)
                                                  setShowApprovalModal(true)
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
                
                  <CardContent className="p-4">
                    <div style={{ 
                      maxHeight: '80vh',
                      overflowY: 'auto',
                      overflowX: 'auto',
                      width: '100%'
                    }}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Headers com estilo PEERS
                          h1: ({children}) => (
                            <h1 className="text-2xl font-bold mb-4 mt-6 pb-2 border-b-2"
                                style={{ 
                                  color: BRAND_COLORS.primary,
                                  borderColor: BRAND_COLORS.secondary 
                                }}>
                              {children}
                            </h1>
                          ),
                          h2: ({children}) => (
                            <h2 className="text-xl font-bold mb-3 mt-5 flex items-center gap-2">
                              <div className="w-1 h-6 rounded" 
                                  style={{ background: BRAND_COLORS.secondary }}/>
                              <span style={{ color: BRAND_COLORS.primary }}>{children}</span>
                            </h2>
                          ),
                          h3: ({children}) => (
                            <h3 className="text-lg font-semibold mb-2 mt-4"
                                style={{ color: BRAND_COLORS.primary }}>
                              {children}
                            </h3>
                          ),
                          
                          // Parágrafos
                          p: ({children}) => (
                            <p className="mb-4 text-gray-700 leading-relaxed">
                              {children}
                            </p>
                          ),
                          
                          // Tabelas com estilo profissional
                          table: ({children}) => (
                            <div className="my-6 w-full" style={{ overflowX: 'auto' }}>
                              <table className="w-full" style={{ 
                                minWidth: '1000px',  // Força largura mínima
                                tableLayout: 'fixed'  // Layout fixo para controlar melhor as colunas
                              }}>
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({children}) => (
                            <thead style={{ 
                              background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #022558 100%)` 
                            }}>
                              {children}
                            </thead>
                          ),
                            th: ({children}) => (
                              <th className="px-4 py-3 text-left text-white font-semibold text-sm border-b-2"
                                  style={{ 
                                    borderColor: BRAND_COLORS.secondary,
                                    minWidth: '250px',  // Aumenta largura mínima
                                    maxWidth: '500px',  // Define largura máxima
                                    whiteSpace: 'normal',  // Permite quebra de linha
                                    wordBreak: 'break-word'  // Quebra palavras longas
                                  }}>
                                {children}
                              </th>
                            ),
                          tbody: ({children}) => (
                            <tbody className="bg-white">
                              {children}
                            </tbody>
                          ),
                          tr: ({children}) => (
                            <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                              {children}
                            </tr>
                          ),
                          td: ({children}) => (
                            <td className="px-4 py-3 text-sm text-gray-700"
                                style={{
                                  minWidth: '250px',  // Aumenta largura mínima
                                  maxWidth: '500px',  // Define largura máxima
                                  whiteSpace: 'normal',  // Permite quebra de linha
                                  wordBreak: 'break-word',  // Quebra palavras longas
                                  wordWrap: 'break-word'  // Garante quebra de texto
                                }}>
                              {children}
                            </td>
                          ),
                          
                          // Listas
                          ul: ({children}) => (
                            <ul className="mb-4 ml-6 space-y-2">
                              {children}
                            </ul>
                          ),
                          ol: ({children}) => (
                            <ol className="mb-4 ml-6 space-y-2">
                              {children}
                            </ol>
                          ),
                          li: ({children}) => (
                            <li className="text-gray-700 leading-relaxed flex items-start">
                              <span className="mr-2 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: BRAND_COLORS.secondary }}/>
                              <span>{children}</span>
                            </li>
                          ),
                          
                            code: ({className, children}) => {
                              // Detectar linguagem do código
                              const match = /language-(\w+)/.exec(className || '')
                              const isInline = !className
                              
                              if (!isInline && match) {
                                // Bloco de código com linguagem
                                return (
                                  <div className="relative my-4">
                                    <div className="absolute top-0 right-0 px-2 py-1 text-xs font-mono rounded-bl"
                                        style={{ 
                                          background: BRAND_COLORS.secondary,
                                          color: BRAND_COLORS.primary 
                                        }}>
                                      {match[1]}
                                    </div>
                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                                      <code className="text-sm font-mono">
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                )
                              }
                              
                              if (!isInline) {
                                // Bloco de código sem linguagem
                                return (
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border-l-4"
                                      style={{ borderColor: BRAND_COLORS.secondary }}>
                                    <code className="text-sm font-mono">
                                      {children}
                                    </code>
                                  </pre>
                                )
                              }
                              
                              // Código inline
                              return (
                                <code className="px-2 py-0.5 rounded text-sm font-mono mx-1"
                                      style={{ 
                                        background: `${BRAND_COLORS.secondary}20`,
                                        color: BRAND_COLORS.primary,
                                        border: `1px solid ${BRAND_COLORS.secondary}50`
                                      }}>
                                  {children}
                                </code>
                              )
                            },
                          
                          // Blockquotes
                          blockquote: ({children}) => (
                            <blockquote className="border-l-4 pl-4 my-4 italic"
                                      style={{ 
                                        borderColor: BRAND_COLORS.secondary,
                                        background: `${BRAND_COLORS.secondary}05`
                                      }}>
                              <p className="text-gray-600">{children}</p>
                            </blockquote>
                          ),
                          
                          // Links
                          a: ({href, children}) => (
                            <a href={href} 
                              className="font-medium hover:underline"
                              style={{ color: BRAND_COLORS.primary }}
                              target="_blank" 
                              rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                          
                          // Linha horizontal
                          hr: () => (
                            <hr className="my-6 border-t-2" 
                                style={{ borderColor: `${BRAND_COLORS.secondary}50` }}/>
                          ),
                          
                          // Strong/Bold
                          strong: ({children}) => (
                            <strong className="font-bold" 
                                    style={{ color: BRAND_COLORS.primary }}>
                              {children}
                            </strong>
                          ),
                          
                          // Emphasis/Italic
                          em: ({children}) => (
                            <em className="italic text-gray-600">
                              {children}
                            </em>
                          ),
                          
                          // Imagens (caso tenha)
                          img: ({src, alt}) => (
                            <img src={src} 
                                alt={alt} 
                                className="rounded-lg shadow-md my-4 max-w-full h-auto"/>
                          )
                        }}
                      >
                        {/* Limpar o relatório antes de processar */}
                        {selectedJob.analysis_report
                          .replace(/\*\*\*/g, '**')  // Corrigir bold triplo
                          .replace(/```json\n/g, '```json\n')  // Manter linguagem
                          .replace(/```python\n/g, '```python\n')  // Manter linguagem
                          .replace(/\n{3,}/g, '\n\n')  // Limpar espaços extras
                        }
                      </ReactMarkdown>
                    </div>
                </CardContent>
              </Card>
            )}

            {/* Relatório de Execução - Aparece quando status é completed e tem summary com PRs */}
            {selectedJob && selectedJob.status === 'completed' && (
              <Card className="border-0 shadow-xl overflow-hidden mt-6">
                <div 
                  className="h-2"
                  style={{ 
                    background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%)` 
                  }}
                />
                <CardHeader className="border-b" style={{ borderColor: BRAND_COLORS.accent }}>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                    <span>Relatório de Execução</span>
                    <Badge 
                      className="ml-2"
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white'
                      }}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Concluído com Sucesso
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Pull Requests criados e arquivos modificados
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Buscar e exibir informações de execução */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        try {
                          const response = await fetch(`${API_URL}/status/${selectedJob.id}`, {
                            method: 'GET',
                            headers: { 'Accept': 'application/json' },
                            mode: 'cors',
                            credentials: 'omit'
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            console.log('Dados de execução:', data)
                            
                            // Atualizar o job com o summary
                            if (data.summary) {
                              setJobs(prev => prev.map(j => 
                                j.id === selectedJob.id 
                                  ? { ...j, summary: data.summary }
                                  : j
                              ))
                              setSelectedJob(prev => prev ? { ...prev, summary: data.summary } : null)
                            }
                          }
                        } catch (error) {
                          console.error('Erro ao buscar relatório de execução:', error)
                        }
                      }}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Carregar Relatório de Execução
                    </Button>

                    {/* Exibir PRs se existirem */}
                    {(selectedJob as any).summary && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge 
                            variant="outline"
                            style={{ 
                              borderColor: BRAND_COLORS.secondary,
                              color: BRAND_COLORS.primary
                            }}
                          >
                            {(selectedJob as any).summary.length} Pull Request{(selectedJob as any).summary.length > 1 ? 's' : ''} Criado{(selectedJob as any).summary.length > 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {(selectedJob as any).summary.map((pr: any, index: number) => (
                          <Card 
                            key={index}
                            className="border hover:shadow-lg transition-all"
                            style={{ borderColor: BRAND_COLORS.accent }}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* PR Header */}
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="p-2 rounded-lg"
                                      style={{ 
                                        background: `${BRAND_COLORS.secondary}20`,
                                        border: `1px solid ${BRAND_COLORS.secondary}50`
                                      }}
                                    >
                                      <GitBranch className="h-4 w-4" style={{ color: BRAND_COLORS.primary }} />
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm" style={{ color: BRAND_COLORS.primary }}>
                                        Pull Request #{index + 1}
                                      </h4>
                                      <p className="text-xs text-gray-600 mt-1">
                                        Branch: <code className="px-1 py-0.5 bg-gray-100 rounded">{pr.branch_name}</code>
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs"
                                    onClick={() => window.open(pr.pull_request_url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Ver no GitHub
                                  </Button>
                                </div>

                                {/* PR URL */}
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                  <a 
                                    href={pr.pull_request_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 underline font-mono flex-1 truncate"
                                  >
                                    {pr.pull_request_url}
                                  </a>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => {
                                      navigator.clipboard.writeText(pr.pull_request_url)
                                    }}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Arquivos Modificados */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <FileCode className="h-4 w-4 text-gray-500" />
                                    <span className="text-xs font-medium text-gray-700">
                                      Arquivos Modificados ({pr.arquivos_modificados?.length || 0})
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-1 ml-6">
                                    {pr.arquivos_modificados?.map((arquivo: string, fileIndex: number) => (
                                      <div 
                                        key={fileIndex}
                                        className="flex items-center gap-2 p-1.5 bg-gray-50 rounded text-xs hover:bg-gray-100 transition-colors"
                                      >
                                        <div className={`w-2 h-2 rounded-full ${
                                          arquivo.includes('.md') ? 'bg-blue-500' :
                                          arquivo.includes('.env') ? 'bg-green-500' :
                                          arquivo.includes('.github') ? 'bg-purple-500' :
                                          'bg-gray-500'
                                        }`} />
                                        <code className="font-mono text-gray-700">{arquivo}</code>
                                        {arquivo.includes('README') && (
                                          <Badge variant="outline" className="text-xs scale-90">Documentação</Badge>
                                        )}
                                        {arquivo.includes('.env') && (
                                          <Badge variant="outline" className="text-xs scale-90">Configuração</Badge>
                                        )}
                                        {arquivo.includes('ISSUE_TEMPLATE') && (
                                          <Badge variant="outline" className="text-xs scale-90">Template</Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        

                        {/* Resumo da Execução */}
                        <Card className="border-2" style={{ borderColor: BRAND_COLORS.secondary + '50' }}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="p-3 rounded-lg"
                                style={{ background: BRAND_COLORS.secondary }}
                              >
                                <CheckCircle className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold" style={{ color: BRAND_COLORS.primary }}>
                                  Execução Completa
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  Todas as alterações foram aplicadas com sucesso no repositório
                                </p>
                              </div>
                              <Badge 
                                className="text-xs"
                                style={{ 
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white'
                                }}
                              >
                                Sucesso
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modal de Aprovação */}
              {showApprovalModal && jobToApprove && (
                <ApprovalModal
                  job={jobToApprove}
                  onApprove={handleJobAction}
                  onReject={handleJobAction}
                  onClose={() => {
                    setShowApprovalModal(false)
                    setJobToApprove(null)
                  }}
                />
              )}


            
          </div>
        </div>
      </div>
    </div>
  )
}
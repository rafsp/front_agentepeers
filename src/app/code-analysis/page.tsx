"use client"

import { redirect } from "next/navigation"
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
import { useMsal, useIsAuthenticated } from '@azure/msal-react'



import { 
  Loader2, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  FileText,
  Clock,
  Gauge,
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
  FileSearch,
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
  PanelLeft,

} from 'lucide-react'

//const API_URL = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'

const API_URL = 'https://poc-agent-revisor-poc-agente-revisor-rbac-c6d4gqcubbgqebfc.centralus-01.azurewebsites.net'
const AZURE_PAT = process.env.NEXT_PUBLIC_AZURE_PAT || ''

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
    description: 'Frontend sistema de agentes',
    type: 'github'
  },
  {
    value: 'rafsp/backend_agent_revisor',
    label: 'Backend Agent Revisor',
    branch: 'main',
    description: 'API backend dos agentes',
    type: 'github'
  },
  {
    value: 'peersconsulting/FIOP%20-%20Avaliação%20Desempenho/FIOP-Avaliacao%20Legado',
    label: 'Sistema Peers - Avaliação de Desempenho',
    branch: 'main',
    description: 'Sistema de avaliação de desempenho',
    type: 'azure'
  },
    {
    value: 'peersconsulting/AvaliacaoDesempenho/AvaliacaoLegado',
    label: 'Peers - Avaliação de Desempenho Legado - Lucio',
    branch: 'main',
    description: 'Sis. de avali. de desempenho Legado',
    type: 'azure'
  },
      {
    value: 'peersconsulting/AvaliacaoDesempenho/AvaliacaoNET9',
    label: 'Peers - Avaliação de Desempenho - Avali. .NET9',
    branch: 'main',
    description: 'Sis. de avali. de desem. - Avali .NET9',
    type: 'azure'
  },
  {
    value: 'LucioFlavioRosa/teste_agent',
    label: 'Sistema POC Porto',
    branch: 'main',
    description: 'Sistema de análise de código POC Porto',
    type : 'github'
  },
  {
    value: 'LucioFlavioRosa/referencias_layout_html',
    label: 'Criação de Protótipo',
    branch: 'main',
    description: 'Criação de protótipos',
    type : 'github'
  },
  {
    value: 'br-openinsurance/n2-teste-ova',
    label: 'Sistema Opin Vulnerability Analyzer',
    branch: 'main',
    description: 'Opin Vulnerability Analyzer',
    type : 'github'
  },
  {
    value: 'br-openinsurance/n2-teste-opingpt',
    label: 'Sistema Opin GPT',
    branch: 'main',
    description: 'Opin GPT',
    type : 'github'
  },
    {
    value: 'br-openinsurance/n2-teste-adp',
    label: 'Sistema OPIN Area do participante',
    branch: 'main',
    description: 'Opin area do participante',
    type : 'github'
  },
  {
    value: 'custom',
    label: 'Outro repositório...',
    branch: '',
    description: 'Inserir repositório personalizado',
    type: 'github'
  }
]

// Branches disponíveis
const BRANCH_LIST = [
  { value: 'main', label: 'main' },
  { value: 'master', label: 'master' },
  { value: 'develop', label: 'develop' },
  { value: 'staging', label: 'staging' },
  { value: 'custom-', label: 'Outra branch...' }
]




const fetchAzureBranches = async (repoPath: string) => {
  try {
    const parts = repoPath.split('/')
    if (parts.length < 3) return []
    
    const organization = parts[0]
    const project = parts[1].replace(/ /g, '%20')
    const repository = parts[2].replace(/ /g, '%20')
    
    const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}/refs?filter=heads&api-version=6.0`
    
    // ADICIONAR AUTENTICAÇÃO
    const response = await fetch(url, {
      headers: {
        'Authorization': `Basic ${btoa(`:${AZURE_PAT}`)}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      console.log('Usando branches padrão para Azure')
      return [
        { value: 'main', label: 'main' },
        { value: 'master', label: 'master' },
        { value: 'develop', label: 'develop' }
      ]
    }


    
    const data = await response.json()
    return data.value.map((ref: any) => ({
      value: ref.name.replace('refs/heads/', ''),
      label: ref.name.replace('refs/heads/', '')
    }))
  } catch (error) {
    console.error('Erro ao buscar branches do Azure:', error)
    return [
      { value: 'main', label: 'main' },
      { value: 'master', label: 'master' },
      { value: 'develop', label: 'develop' }
    ]
  }
}

const fetchGitHubBranches = async (repoPath: string, repoType: string = 'github') => {
  try {

    // Extrair owner e repo do path
    const parts_ = repoPath.split('/')
    if (parts_.length < 2) return []
    
    const owner = parts_[0]
    const repo = parts_[1]
    //alert(repoType);
    if(repoType === 'azure')
    {
          try {
        
              const parts = repoPath.split('/')
              if (parts.length < 3) return []
              
              const organization = parts[0]
              const project = parts[1].replace(/ /g, '%20')
              const repository = parts[2].replace(/ /g, '%20')
              
              const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${repository}/refs?filter=heads&api-version=6.0`
              
              //alert(`Basic ${btoa(`:${AZURE_PAT}`)}`);

              const response = await fetch(url, {
                headers: {
                 'Authorization': `Basic ${btoa(`:${AZURE_PAT}`)}`,
                 'Content-Type': 'application/json'
               }
              })
              // ADICIONAR AUTENTICAÇÃO
            //   const response = await fetch(url) //, {
            //     headers: {
            //   //    'Authorization': `Basic ${btoa(`:${AZURE_PAT}`)}`,
            //  //     'Content-Type': 'application/json'
            //   //  }
            //   })

              console.log(response);              
              if (!response.ok) {
                console.log('Usando branches padrão para Azure')
                return [
                  { value: 'main', label: 'main' },
                  { value: 'master', label: 'master' },
                  { value: 'develop', label: 'develop' }
                ]
              }
              //alert('teste;')
              const data = await response.json()
              return data.value.map((ref: any) => ({
                value: ref.name.replace('refs/heads/', ''),
                label: ref.name.replace('refs/heads/', '')
              }))
            } catch (error) {
              console.error('Erro ao buscar branches do Azure:', error)
              return [
                { value: 'main', label: 'main' },
                { value: 'master', label: 'master' },
                { value: 'develop', label: 'develop' }
              ]
            }
    }
    else
    {
      //alert(repoType);
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`)
    
    if (!response.ok) return []
    
    const branches = await response.json()
    return branches.map((b: any) => ({
      value: b.name,
      label: b.name
    }))
  } catch (error) {
    console.error('Erro ao buscar branches:', error)
    return []
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
      description: 'Geração de código a partir de um descritivo de requisitos',
      quickInfo: 'Transforma requisitos em código',
      tags: ['Automação', 'Produtividade'],
      complexity: 'Médio',
      timeEstimate: '5-10 min',
      color: 'yellow',
      useCases: [
        '📝 Reuniões de requisitos',
        '🎯 Prototipagem rápida',
        '⚡ MVPs e POCs'
      ]
    },
    { 
      value: 'relatorio_implentacao_feature', 
      label: 'Implementação de Features', 
      icon: Plus,
      description: 'Melhorias e correções de erros gerais em códigos',
      quickInfo: 'Adiciona funcionalidades e corrige bugs',
      tags: ['Melhoria', 'Correção'],
      complexity: 'Baixo',
      timeEstimate: '3-8 min',
      color: 'green',
      useCases: [
        '🐛 Correção de bugs',
        '✨ Novas features',
        '🔧 Refatoração'
      ]
    },
    {
      value: 'suporte_dot_net',
      label: 'Suporte .NET',
      icon: Code,
      description: 'Melhorias e correções de erros gerais em códigos .NET 9.0',
      quickInfo: 'Especialista em .NET 9.0',
      tags: ['.NET', 'C#', 'Framework'],
      complexity: 'Médio',
      timeEstimate: '5-10 min',
      color: 'blue',
      useCases: [
        '🎯 Otimização .NET',
        '🔄 Migração de versões',
        '⚡ Performance tuning'
      ]
    },
    {
      value: 'relatorio_implentacao_feature_azure',
      label: 'Implementação Azure',
      icon: Cloud,
      description: 'Plano de desenvolvimento de infraestrutura na AZURE',
      quickInfo: 'Arquitetura cloud Azure',
      tags: ['Cloud', 'Azure', 'DevOps'],
      complexity: 'Alto',
      timeEstimate: '10-15 min',
      color: 'blue',
      useCases: [
        '☁️ Migração para cloud',
        '🏗️ Infraestrutura como código',
        '📊 Escalabilidade'
      ]
    },
    {
      value: 'relatorio_modernizacao_asp_net',
      label: 'Modernização ASP.NET',
      icon: Layers,
      description: 'Migração de .NET 4.0 para .NET 9.0',
      quickInfo: 'Moderniza aplicações legadas',
      tags: ['Migração', 'Modernização', 'Legacy'],
      complexity: 'Alto',
      timeEstimate: '10-20 min',
      color: 'indigo',
      useCases: [
        '🔄 Legacy para moderno',
        '⚡ Ganho de performance',
        '🛡️ Segurança atualizada'
      ]
    },
    {
      value: 'relatorio_erros_migracao',
      label: 'Correção de Migração',
      icon: Bug,
      description: 'Correção de erros devido a migração .NET 4.0 para 9.0',
      quickInfo: 'Resolve problemas pós-migração',
      tags: ['Troubleshooting', 'Migration', 'Fix'],
      complexity: 'Médio',
      timeEstimate: '5-10 min',
      color: 'red',
      useCases: [
        '🚨 Erros de compatibilidade',
        '🔧 Breaking changes',
        '📦 Dependências quebradas'
      ]
    },
  ],
  
  '🔍 Análise e Qualidade': [
    { 
      value: 'relatorio_avaliacao_terraform', 
      label: 'Avaliação Terraform', 
      icon: Layers,
      description: 'Auditoria técnica aprofundada no código Terraform fornecido',
      quickInfo: 'Valida infraestrutura como código',
      tags: ['IaC', 'DevOps', 'Audit'],
      complexity: 'Médio',
      timeEstimate: '5-10 min',
      color: 'purple',
      useCases: [
        '🏗️ Validação de IaC',
        '🔒 Segurança de infra',
        '💰 Otimização de custos'
      ]
    },
    { 
      value: 'relatorio_cleancode', 
      label: 'Clean Code', 
      icon: Sparkles,
      description: 'Identificação de violações claras dos 5 princípios SOLID',
      quickInfo: 'Melhora qualidade do código',
      tags: ['SOLID', 'Best Practices', 'Quality'],
      complexity: 'Médio',
      timeEstimate: '5-10 min',
      color: 'green',
      useCases: [
        '📚 Princípios SOLID',
        '🎨 Code patterns',
        '📏 Padrões de projeto'
      ]
    },
    { 
      value: 'relatorio_conformidades', 
      label: 'Conformidades', 
      icon: CheckCircle,
      description: 'Identificação de inconsistências funcionais (Linter)',
      quickInfo: 'Verifica padrões e convenções',
      tags: ['Linting', 'Standards', 'Compliance'],
      complexity: 'Baixo',
      timeEstimate: '3-5 min',
      color: 'orange',
      useCases: [
        '✅ Code standards',
        '📋 Style guide',
        '🔍 Code review'
      ]
    },
    { 
      value: 'relatorio_simplicacao', 
      label: 'Simplificação de Código', 
      icon: Zap,
      description: 'Identificar violações dos princípios DRY, YAGNI e KISS',
      quickInfo: 'Torna código mais simples',
      tags: ['DRY', 'KISS', 'YAGNI'],
      complexity: 'Médio',
      timeEstimate: '5-8 min',
      color: 'cyan',
      useCases: [
        '🔄 Remove duplicação',
        '✂️ Elimina código morto',
        '🎯 Simplifica lógica'
      ]
    },
  ],
  
  '📚 Documentação': [
    { 
      value: 'relatorio_docstring', 
      label: 'Docstrings', 
      icon: FileText,
      description: 'Escrita de docstrings para explicar os códigos fornecidos',
      quickInfo: 'Documenta funções e classes',
      tags: ['Docs', 'Comments', 'API'],
      complexity: 'Baixo',
      timeEstimate: '3-5 min',
      color: 'blue',
      useCases: [
        '📝 Documentação de API',
        '💡 Explicação de código',
        '📚 Geração de docs'
      ]
    },
    { 
      value: 'relatorio_documentacao', 
      label: 'Documentação Geral', 
      icon: FileCode,
      description: 'Escrita documentação e configuração na raiz do repositório',
      quickInfo: 'README e docs do projeto',
      tags: ['README', 'Setup', 'Guide'],
      complexity: 'Médio',
      timeEstimate: '10-15 min',
      color: 'indigo',
      useCases: [
        '📖 README completo',
        '🚀 Setup guide',
        '👥 Contribuição guide'
      ]
    },
        { 
      value: 'criacao_prototipo', 
      label: 'Criação de Protótipos', 
      icon: FileCode,
      description: 'Criação de Protótipos fácies e executáveis',
      quickInfo: 'README e docs do projeto',
      tags: ['README', 'Setup', 'Guide'],
      complexity: 'Médio',
      timeEstimate: '10-15 min',
      color: 'indigo',
      useCases: [
        '📖 README completo',
        '🚀 Criação de Protótipos',
        '👥 Contribuição guide'
      ]
    },
  ],
  
  '🔒 Segurança': [
    { 
      value: 'relatorio_owasp', 
      label: 'Avaliação OWASP', 
      icon: Shield,
      description: 'Mitigação de vulnerabilidades com base nos frameworks OWASP Top 10',
      quickInfo: 'Segurança nível enterprise',
      tags: ['Security', 'OWASP', 'Top10'],
      complexity: 'Alto',
      timeEstimate: '10-15 min',
      color: 'red',
      useCases: [
        '🛡️ OWASP Top 10',
        '🔐 Vulnerabilidades',
        '📊 Security report'
      ]
    },
    { 
      value: 'relatorio_pentest', 
      label: 'Pentest', 
      icon: Bug,
      description: 'Simular um teste de invasão',
      quickInfo: 'Teste de penetração simulado',
      tags: ['Pentest', 'Hacking', 'Security'],
      complexity: 'Alto',
      timeEstimate: '15-20 min',
      color: 'pink',
      useCases: [
        '🎯 Attack vectors',
        '🔓 Exploit testing',
        '📝 Security gaps'
      ]
    },
    { 
      value: 'relatorio_sast', 
      label: 'SAST Analysis', 
      icon: FileSearch,
      description: 'Identificar vetores de ataque exploráveis diretamente no código-fonte',
      quickInfo: 'Análise estática de segurança',
      tags: ['SAST', 'Static Analysis', 'Security'],
      complexity: 'Alto',
      timeEstimate: '10-15 min',
      color: 'purple',
      useCases: [
        '🔍 Code vulnerabilities',
        '💉 SQL Injection',
        '🔐 XSS prevention'
      ]
    },
  ],
  
  '⚡ Performance': [
    { 
      value: 'relatorio_performance_eficiencia', 
      label: 'Performance e Eficiência', 
      icon: Activity,
      description: 'Otimização de performance e design de sistemas de alta eficiência',
      quickInfo: 'Otimiza velocidade e recursos',
      tags: ['Performance', 'Optimization', 'Speed'],
      complexity: 'Alto',
      timeEstimate: '10-15 min',
      color: 'orange',
      useCases: [
        '⚡ Bottlenecks',
        '📊 Profiling',
        '🚀 Optimization'
      ]
    },
  ],
  
  '🧪 Testes': [
    { 
      value: 'relatorio_teste_integracao', 
      label: 'Testes de Integração', 
      icon: GitBranch,
      description: 'Análises de componentes para que colaborem de forma correta',
      quickInfo: 'Valida integração entre sistemas',
      tags: ['Integration', 'E2E', 'Testing'],
      complexity: 'Médio',
      timeEstimate: '8-12 min',
      color: 'teal',
      useCases: [
        '🔗 API testing',
        '💾 Database tests',
        '🌐 Service integration'
      ]
    },
    { 
      value: 'relatorio_teste_unitario', 
      label: 'Testes Unitários', 
      icon: TestTube,
      description: 'TDD (Test-Driven Development) e Design de Código Testável',
      quickInfo: 'Cria testes unitários',
      tags: ['TDD', 'Unit Tests', 'Coverage'],
      complexity: 'Médio',
      timeEstimate: '5-10 min',
      color: 'green',
      useCases: [
        '✅ Unit tests',
        '📊 Coverage',
        '🎯 TDD approach'
      ]
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

// Modal de Seleção de Projeto
const ProjectSelectionModal = ({ 
  isOpen, 
  onClose, 
  projects, 
  onSelect,
  onCreateNew 
}: any) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Folder className="h-5 w-5 text-blue-600" />
            Selecione um Projeto
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Escolha o projeto para contextualizar a análise
          </p>
        </div>
        
        <ScrollArea className="h-96 p-6">
          <div className="space-y-2">
            {projects.map((project: any) => (
              <button
                key={project.id}
                onClick={() => onSelect(project)}
                className="w-full p-4 text-left rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">ID: {project.id}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </button>
            ))}
            
            <button
              onClick={onCreateNew}
              className="w-full p-4 text-left rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-700">Criar Novo Projeto</p>
                  <p className="text-xs text-gray-500">Definir um novo contexto de análise</p>
                </div>
              </div>
            </button>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// Componente de Histórico de Análises com Cache e Paginação
const AnalysisHistoryModal = ({ 
  isOpen, 
  onClose, 
  currentProject,
  onSelectAnalysis 
}: any) => {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date')
  const [cachedAnalyses, setCachedAnalyses] = useState<Record<string, any>>({})
  
  useEffect(() => {
    if (isOpen && currentProject) {
      loadAnalysisHistory()
    }
  }, [isOpen, currentProject])
  
  const loadAnalysisHistory = async () => {
    setLoading(true)
    
    // Verificar cache primeiro
    //const cacheKey = `analyses_${currentProject?.id}`
    //const cached = localStorage.getItem(cacheKey)
    
    // if (cached) {
    //   const parsedCache = JSON.parse(cached)
    //   if (Date.now() - parsedCache.timestamp < 300000) { // 5 minutos de cache
    //     setAnalyses(parsedCache.data)
    //     setLoading(false)
    //     return
    //   }
    // }
    
    try {
      // Simular estrutura baseada no que vimos no Azure
   
      

    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const filteredAnalyses = analyses.filter(a => 
    a.id.toLowerCase().includes(filter.toLowerCase()) ||
    a.type.toLowerCase().includes(filter.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    return a.type.localeCompare(b.type)
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Histórico de Análises - {currentProject?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Visualize e reutilize análises anteriores
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 border-b bg-gray-50">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar análises..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (Mais recente)</SelectItem>
                <SelectItem value="type">Tipo de Análise</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={loadAnalysisHistory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[500px] p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Nenhuma análise encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnalyses.map((analysis) => {
                const analysisType = getAnalysisDetails(analysis.type)
                const TypeIcon = analysisType?.icon || FileText
                
                return (
                  <Card 
                    key={analysis.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => onSelectAnalysis(analysis)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            backgroundColor: `${BRAND_COLORS.secondary}20`,
                            color: BRAND_COLORS.primary
                          }}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{analysis.id}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {analysisType?.label || analysis.type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {analysis.size}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {analysis.date}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredAnalyses.length} análise(s) encontrada(s)
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar Lista
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
          'sv=2024-11-04&ss=b&srt=co&sp=rltfx&se=2027-01-10T00:20:40Z&st=2025-10-05T16:05:40Z&spr=https,http&sig=oFZQm01IJ3%2B92ySNjSY7FiHperFHqJJOcRBg2dlawtE%3D'
        
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
                <Label className="text-xs font-medium text-gray-700">Projetos</Label>
                <ScrollArea className="h-48 border rounded-lg p-2">
                  {projects.length === 0 ? (
                    <div className="text-center py-8">
                      <Cloud className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                      <p className="text-xs text-gray-500">Nenhum projeto carregado</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Clique em "Carregar" para buscar
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
// Modal de Aprovação com Instruções Extras
const ApprovalModal = ({ job, onApprove, onReject, onClose }: any) => {
  const [instrucoes, setInstrucoes] = useState('')
  
  if (!job) return null

  const handleApprove = () => {
    onApprove(job.id, 'approve', instrucoes)
    onClose()
  }

  const handleReject = () => {
    onReject(job.id, 'reject')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full my-8 flex flex-col max-h-[85vh]">
        <div className="p-6 border-b" style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, white 100%)` }}>
          <h2 className="text-2xl font-bold" style={{ color: BRAND_COLORS.primary }}>
            Relatório Gerado - Aguardando Aprovação
          </h2>
          <p className="text-gray-600 mt-1">Revise o relatório antes de prosseguir com as mudanças</p>
        </div>
        
        <div className="overflow-y-auto flex-1 p-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({children}) => (
                <div className="my-4 w-full overflow-x-auto">
                  <table className="w-full min-w-full border-collapse">
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
                <th className="px-3 py-2 text-left text-white text-xs font-semibold border-b"
                    style={{ borderColor: BRAND_COLORS.secondary }}>
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td className="px-3 py-2 text-xs text-gray-700 border-b border-gray-100">
                  {children}
                </td>
              ),
              tr: ({children}) => (
                <tr className="hover:bg-gray-50">
                  {children}
                </tr>
              ),
              tbody: ({children}) => (
                <tbody className="bg-white">
                  {children}
                </tbody>
              ),
              p: ({children}) => (
                <p className="mb-3 text-sm text-gray-700">
                  {children}
                </p>
              ),
              h1: ({children}) => (
                <h1 className="text-xl font-bold mb-3 mt-4" style={{ color: BRAND_COLORS.primary }}>
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className="text-lg font-bold mb-2 mt-4" style={{ color: BRAND_COLORS.primary }}>
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className="text-base font-semibold mb-2 mt-3" style={{ color: BRAND_COLORS.primary }}>
                  {children}
                </h3>
              ),
              ul: ({children}) => (
                <ul className="mb-3 ml-4 space-y-1">
                  {children}
                </ul>
              ),
              li: ({children}) => (
                <li className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2 mt-1">•</span>
                  <span>{children}</span>
                </li>
              ),
              code: ({className, children}) => {
                const isInline = !className
                if (isInline) {
                  return (
                    <code className="px-1 py-0.5 rounded text-xs font-mono mx-1"
                          style={{ 
                            background: `${BRAND_COLORS.secondary}20`,
                            color: BRAND_COLORS.primary
                          }}>
                      {children}
                    </code>
                  )
                }
                return (
                  <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-3">
                    <code className="text-xs font-mono">
                      {children}
                    </code>
                  </pre>
                )
              },
              strong: ({children}) => (
                <strong className="font-bold" style={{ color: BRAND_COLORS.primary }}>
                  {children}
                </strong>
              ),
              em: ({children}) => (
                <em className="italic text-gray-600">
                  {children}
                </em>
              )
            }}
          >
            {job.analysis_report || 'Processando análise...'}
          </ReactMarkdown>
        </div>
        
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
            onClick={handleReject}
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

    if (typeof window !== 'undefined') {
    const isAuth = document.cookie.includes('peers_authenticated=true')
    if (!isAuth) {
    //  window.location.href = '/login'
      //return null
    }
  }


const { instance, accounts } = useMsal()
const isAuthenticated = useIsAuthenticated()
const currentAccount = accounts[0]

// No header (linha ~1500), substituir userName por:
const [userName1, setUserName1] = useState(() => {
  if (currentAccount?.name) return currentAccount.name
  return typeof window !== 'undefined' ? localStorage.getItem('user_name') || 'Usuário' : 'Usuário'

})


   const AZURE_PAT = process.env.AZURE_PAT;
     console.log('AZURE_PAT:', AZURE_PAT);

  //alert(AZURE_PAT)

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

const [dynamicBranches, setDynamicBranches] = useState<{value: string, label: string}[]>([])
const [loadingBranches, setLoadingBranches] = useState(false)

// Buscar branches quando mudar o repositório
useEffect(() => {
  const loadBranches = async () => {
    if (!selectedRepository || selectedRepository === 'custom') {
      setDynamicBranches([])
      return
    }
    
    setLoadingBranches(true)
    const repoConfig = REPOSITORY_LIST.find(r => r.value === selectedRepository)
    const branches = await fetchGitHubBranches(selectedRepository, repoConfig?.type)
    
    if (branches.length > 0) {
      setDynamicBranches(branches)
      // Se a branch atual não existe, selecionar a primeira
      const branchExists = branches.find((b: any) => b.value === selectedBranch)
      if (!branchExists && branches[0]) {
        setSelectedBranch(branches[0].value)
      }
    } else {
      // Fallback para branches padrão se não conseguir buscar
      setDynamicBranches(BRANCH_LIST)
    }
    
    setLoadingBranches(false)
  }
  
  loadBranches()
}, [selectedRepository])


const [customRepository, setCustomRepository] = useState('')

const [typeRepository, setTypeRepository] = useState('')

const [selectedBranch, setSelectedBranch] = useState(() => 
  loadFromStorage(STORAGE_KEYS.SELECTED_BRANCH, 'main')
)
const [customBranch, setCustomBranch] = useState('')

  // Função de logout
const handleLogout = () => {
  // Limpar cookies
  document.cookie = 'peers_authenticated=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  document.cookie = 'user_name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  document.cookie = 'microsoft_login=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  
  // Limpar localStorage
  if (typeof window !== 'undefined')
  {
    localStorage.removeItem('peers_authenticated')
    localStorage.removeItem('user_name')
  }
  
  // Redirecionar para login
  window.location.href = '/login'
}
  
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
  retornar_lista_arquivos: true, // NOVO
  instrucoes_extras: '',
  usar_rag: true,
  gerar_relatorio_apenas: false,
  model_name: 'gpt-4o'
})


//const nova para modal

  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [jobToApprove, setJobToApprove] = useState<Job | null>(null)


const [showProjectModal, setShowProjectModal] = useState(false)
const [userName, setUserName] = useState(() => {
  if (typeof window !== 'undefined') {
    return typeof window !== 'undefined' ? localStorage.getItem('user_name') || 'Usuário' : 'Usuário'

  }
  return 'Usuário'
})

// Função para carregar análises históricas
const loadHistoricalAnalyses = async () => {
  if (!currentProject) return
  
  // ADICIONE ESTA VERIFICAÇÃO
  if (activeTab !== 'history') {
    console.log('Não carregando histórico - não está na aba history')
    return
  }
  
  setLoadingHistory(true)



  
  try {
    const projectId = currentProject.id
    console.log('Buscando análises no Azure Blob para projeto:', projectId)
    
    // Buscar do Azure Blob Storage
    const sasToken = localStorage.getItem('azure_sas_token') || 
      'sv=2024-11-04&ss=b&srt=co&sp=rltfx&se=2027-01-10T00:20:40Z&st=2025-10-05T16:05:40Z&spr=https,http&sig=oFZQm01IJ3%2B92ySNjSY7FiHperFHqJJOcRBg2dlawtE%3D'
    
    const containerUrl = `https://reportsagentpeers.blob.core.windows.net/reports?restype=container&comp=list&prefix=${projectId}/&${sasToken}`
    
    const response = await fetch(containerUrl)
    const text = await response.text()
    
    // Parse XML response
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(text, "text/xml")
    const blobs = xmlDoc.getElementsByTagName("Blob")
    
    const analyses: any[] = []
    
    for (let i = 0; i < blobs.length; i++) {
      const nameElement = blobs[i].getElementsByTagName("Name")[0]
      const propertiesElement = blobs[i].getElementsByTagName("Properties")[0]
      
      if (nameElement && propertiesElement) {
        const fullPath = nameElement.textContent || ''
        const lastModified = propertiesElement.getElementsByTagName("Last-Modified")[0]?.textContent || ''
        const contentLength = propertiesElement.getElementsByTagName("Content-Length")[0]?.textContent || '0'
        
        // Extrair nome do arquivo e tipo de análise
        const pathParts = fullPath.split('/')
        const fileName = pathParts[pathParts.length - 1]
        
        // Pular se não for um arquivo de análise
        if (!fileName.includes('.md') && !fileName.includes('.json')) continue
        
        // Extrair tipo de análise do nome do arquivo
        let analysisType = 'relatorio_documentacao'
        if (fileName.includes('cleancode')) analysisType = 'relatorio_cleancode'
        else if (fileName.includes('teste_unitario')) analysisType = 'relatorio_teste_unitario'
        else if (fileName.includes('owasp')) analysisType = 'relatorio_owasp'
        else if (fileName.includes('performance')) analysisType = 'relatorio_performance_eficiencia'
        else if (fileName.includes('conformidades')) analysisType = 'relatorio_conformidades'
        
        // Buscar conteúdo do arquivo
        let reportContent = ''
        try {
          const fileUrl = `https://reportsagentpeers.blob.core.windows.net/reports/${fullPath}?${sasToken}`
          const fileResponse = await fetch(fileUrl)
          if (fileResponse.ok) {
            reportContent = await fileResponse.text()
          }
        } catch (err) {
          console.log('Erro ao buscar conteúdo do arquivo:', err)
        }
        
        analyses.push({
          id: fileName.replace('.md', '').replace('.json', ''),
          date: new Date(lastModified).toLocaleString('pt-BR'),
          type: analysisType,
          size: `${(parseInt(contentLength) / 1024).toFixed(2)} KB`,
          report: reportContent || `# Relatório\n\nArquivo: ${fileName}\nProjeto: ${currentProject.name}`,
          fullPath: fullPath
        })
      }
    }
    
    // Ordenar por data mais recente
    analyses.sort((a, b) => {
      const dateA = new Date(a.date.split(' ')[0].split('/').reverse().join('-'))
      const dateB = new Date(b.date.split(' ')[0].split('/').reverse().join('-'))
      return dateB.getTime() - dateA.getTime()
    })
    
    console.log(`Encontradas ${analyses.length} análises no Azure Blob`)
    setHistoricalAnalyses(analyses)
    
    // Salvar em cache local
    if (analyses.length > 0) {
      const cacheKey = `analyses_${projectId}`
      localStorage.setItem(cacheKey, JSON.stringify({
        data: analyses,
        timestamp: Date.now()
      }))
    }
    
  } catch (error) {
    console.error('Erro ao carregar histórico do Azure Blob:', error)
    
    // Tentar carregar do cache se falhar
   // const cacheKey = `analyses_${currentProject.id}`
    // const cached = localStorage.getItem(cacheKey)
    
    // if (cached) {
    //   const parsedCache = JSON.parse(cached)
    //   setHistoricalAnalyses(parsedCache.data || [])
    //   console.log('Usando cache local')
    // } else {
    //   setHistoricalAnalyses([])
    // }
  } finally {
    setLoadingHistory(false)
  }
}


const [showAgentInfo, setShowAgentInfo] = useState(false)
const [selectedAgent, setSelectedAgent] = useState<any>(null)

// Componente do Popup de Informação
const AgentInfoPopup = () => {
  if (!showAgentInfo || !selectedAgent) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedAgent.icon && <selectedAgent.icon className="h-5 w-5 text-blue-600" />}
              <h3 className="font-semibold text-lg">{selectedAgent.label}</h3>
            </div>
            <button
              onClick={() => {
                setShowAgentInfo(false)
                setSelectedAgent(null)
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Descrição */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Descrição</h4>
            <p className="text-sm text-gray-600">{selectedAgent.description}</p>
          </div>
          
          {/* Quick Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Resumo Rápido</h4>
            <p className="text-sm text-gray-600">{selectedAgent.quickInfo}</p>
          </div>
          
          {/* Métricas */}
          <div className="flex gap-4">
            <div className="flex-1 bg-blue-50 rounded p-3">
              <p className="text-xs text-gray-500 mb-1">Tempo Estimado</p>
              <p className="text-sm font-semibold text-blue-700">
                ⏱️ {selectedAgent.timeEstimate}
              </p>
            </div>
            <div className="flex-1 bg-green-50 rounded p-3">
              <p className="text-xs text-gray-500 mb-1">Complexidade</p>
              <p className="text-sm font-semibold text-green-700">
                📊 {selectedAgent.complexity}
              </p>
            </div>
          </div>
          
          {/* Use Cases */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">🎯 Casos de Uso</h4>
            <div className="space-y-2">
              {selectedAgent.useCases?.map((useCase: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-xs mt-0.5">•</span>
                  <p className="text-sm text-gray-600">{useCase}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">🏷️ Tags</h4>
            <div className="flex flex-wrap gap-2">
              {selectedAgent.tags?.map((tag: string, idx: number) => (
                <span 
                  key={idx}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t p-4">
          <button
            onClick={() => {
              setShowAgentInfo(false)
              setSelectedAgent(null)
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}


const [activeTab, setActiveTab] = useState<'recent' | 'history'>('recent')
const [historicalAnalyses, setHistoricalAnalyses] = useState<any[]>([])
const [loadingHistory, setLoadingHistory] = useState(false)

const [showHistoryModal, setShowHistoryModal] = useState(false)
const [selectedHistoryAnalysis, setSelectedHistoryAnalysis] = useState<any>(null)



useEffect(() => {
  setHistoricalAnalyses([]) // sempre limpa
  
  if (activeTab === 'history' && currentProject) {
    setTimeout(() => loadHistoricalAnalyses(), 200) // carrega só se for history
  }
}, [activeTab, currentProject?.id])


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
         setTypeRepository(repo.type)
      }
    }
  }, [selectedRepository])


  // Limpar seleção ao mudar de aba
useEffect(() => {
  if (activeTab === 'history') {
    // Limpar job selecionado das análises recentes
    if (selectedJob && !selectedJob.id.startsWith('history_')) {
      setSelectedJob(null)
      setShowReport(false)
    }
  } else {
          setHistoricalAnalyses([])
    // Limpar job histórico ao voltar para recentes
    if (selectedJob && selectedJob.id.startsWith('history_')) {
      setSelectedJob(null)
      setShowReport(false)
    }
  }
}, [activeTab])

  

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


          // Definir progresso baseado no status
          if (statusData.status === 'completed' || statusData.status === 'done') {
            finalProgress = 100
          } else if (statusData.status === 'failed' || statusData.status === 'rejected' || statusData.status === 'Erro') {
            finalProgress = 100  // Também 100% para erros e rejeitados
          } else if (statusData.status === 'pending_approval') {
            finalProgress = 100  // 100% quando aguardando aprovação
          } else if (statusData.status === 'approved') {
            finalProgress = 25
          } else if (statusData.status === 'analyzing') {
            finalProgress = 50
          } else if (statusData.status === 'generating_report') {
            finalProgress = 75
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
  
  // Validar se tem projeto selecionado
  if (!currentProject) {
    setShowProjectModal(true)
    
    // Mostrar alerta
    const alertBadge = document.createElement('div')
    alertBadge.className = 'fixed top-20 right-4 z-50 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2'
    alertBadge.innerHTML = `
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      Selecione um projeto antes de continuar
    `
    document.body.appendChild(alertBadge)
    setTimeout(() => alertBadge.remove(), 3000)
    return
  }
  
  if (!formData.repo_name || !formData.analysis_type) {
    setErrorMessage('Preencha todos os campos obrigatórios')
    return
  }

  


  // Determinar o repositório e branch finais
  const finalRepo = selectedRepository === 'custom' ? customRepository : selectedRepository
  const finalBranch = selectedBranch === 'custom' ? customBranch : selectedBranch

  const selectedRepoConfig = REPOSITORY_LIST.find(r => r.value === selectedRepository)
  const repoType = selectedRepoConfig?.type || formData.repository_type || 'github'

 // alert(selectedRepoConfig?.type)
  setIsSubmitting(true)
  setErrorMessage('')
  
  try {
    // CRIAR PAYLOAD COM OS NOVOS CAMPOS DA API
const requestPayload = {
      repo_name_modernizado: finalRepo,
      branch_name_modernizado: finalBranch,
      analysis_type: formData.analysis_type,
      instrucoes_extras: formData.instrucoes_extras || '',
      arquivos_especificos: formData.arquivos_especificos  // ← CONVERTE STRING PARA ARRAY
        ? formData.arquivos_especificos.split('\n').filter(f => f.trim())
        : [],
      projeto: currentProject.id, // USA O PROJETO SELECIONADO
      usar_rag: formData.usar_rag,
      gerar_novo_relatorio: !formData.usar_rag,
      repository_type: selectedRepoConfig?.type || "github",  // ← USA O CAMPO DO FORM
      analysis_name: formData.analysis_name || `${currentProject.name} - ${new Date().toLocaleDateString()}`,
      gerar_relatorio_apenas: formData.gerar_relatorio_apenas,
      retornar_lista_arquivos: formData.retornar_lista_arquivos || false,
      modo_adicao_incremental: formData.retornar_lista_arquivos,
      usuario_executor: userName

        // ← NOVO
     // model_name: formData.model_name || 'gpt-4o',

    }

    console.log(requestPayload);

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

              {/* Botão de Logout */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>

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

  {/* Projeto Selecionado */}
<div className="space-y-2 mb-4">
  <Label className="flex items-center space-x-2">
    <Folder className="h-4 w-4" style={{ color: BRAND_COLORS.secondary }} />
    <span>Projeto</span>
    <span className="text-red-500">*</span>
  </Label>
  
  {currentProject ? (
    <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{currentProject.name}</p>
            <p className="text-xs text-gray-600">ID: {currentProject.id}</p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setShowProjectModal(true)}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  ) : (
    <Button
      type="button"
      variant="outline"
      className="w-full justify-start"
      onClick={() => setShowProjectModal(true)}
    >
      <FolderOpen className="h-4 w-4 mr-2" />
      Selecionar Projeto do Azure
    </Button>
  )}
</div>

{/* Botão para ver histórico */}
{/* {currentProject && (
  <Button
    type="button"
    variant="outline"
    className="w-full mb-4"
    onClick={() => setShowHistoryModal(true)}
  >
    <History className="h-4 w-4 mr-2" />
    Ver Análises Anteriores deste Projeto
  </Button>
)} */}

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
                      {loadingBranches && (
                        <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
                      )}
                    </Label>
                    <Select 
                      value={selectedBranch} 
                      onValueChange={setSelectedBranch}
                      disabled={loadingBranches}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBranches ? "Carregando branches..." : "Selecione a branch"} />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicBranches.length > 0 ? (
                          dynamicBranches.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.label}
                            </SelectItem>
                          ))
                        ) : (
                          // Fallback para branches padrão
                          BRANCH_LIST.map((branch) => (
                            <SelectItem key={branch.value} value={branch.value}>
                              {branch.label}
                            </SelectItem>
                          ))
                        )}
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2">
                            <Edit className="h-3 w-3" />
                            Outra branch...
                          </div>
                        </SelectItem>
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
                      <Badge variant="outline" className="text-xs"></Badge>
                    </Label>
                    <Input
                      placeholder="Ex: Análise Frontend v2.0"
                      value={formData.analysis_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, analysis_name: e.target.value }))}
                    />
                  </div>

                  {/* NOVO: Tipo de Repositório */}
                  {/* <div className="space-y-2">
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
                  </div> */}

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
                    type={typeRepository}
                  />

                    {/* Tipo de Análise */}
                    <div className="space-y-2">
                      <Label htmlFor="analysis" className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-gray-500" />
                        <span>Agente Assistente</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      
                      <Select
                        value={formData.analysis_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, analysis_type: value }))}
                        required
                      >
                        <SelectTrigger className="border-gray-200">
                          <SelectValue placeholder="Selecione o tipo de agente" />
                        </SelectTrigger>
                        
                        <SelectContent className="max-w-lg">
                          {Object.entries(analysisCategories).map(([category, items]) => (
                            <div key={category}>
                              <div 
                                className="px-2 py-1.5 text-xs font-semibold text-gray-600"
                                style={{ backgroundColor: `${BRAND_COLORS.accent}15` }}
                              >
                                {category}
                              </div>
                              
                              {items.map(item => (
                                <div key={item.value} className="relative group">
                                  <SelectItem value={item.value}>
                                    <div className="flex items-center justify-between w-full pr-8">
                                      <div className="flex items-center space-x-2">
                                        <item.icon className="h-4 w-4" />
                                        <span>{item.label}</span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                  
                                  {/* Botão de Info - posicionado absolutamente */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setSelectedAgent(item)
                                      setShowAgentInfo(true)
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-blue-100 rounded-full transition-colors"
                                  >
                                    <Info className="h-4 w-4 text-blue-600" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Renderizar o popup */}
                      <AgentInfoPopup />
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
                       {/* NOVO: Retornar Lista de Arquivos */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FolderOpen className="h-4 w-4 text-gray-500" />
                        <Label htmlFor="list-files" className="text-sm font-medium">
                          Listar arquivos (sem analisar conteúdo)
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


                  </div>

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
                          ? 'Iniciar Análise' 
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
            {/* Card com Abas */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div 
                className="h-1"
                style={{ background: `linear-gradient(90deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%)` }}
              />
              
              {/* Header com Abas */}
              <div className="border-b">
                <div className="flex items-center justify-between px-6 pt-4">
                  <div className="flex items-center space-x-6">
              {/* Botão Status da análise atual */}
              <button
                onClick={() => {

                    
                          const projectBackup = currentProject
                          
                          setCurrentProject({ 
                            id: 'PROJETO_INEXISTENTE_LIMPAR_CACHE_999', 
                            name: 'Limpando...', 
                            source: 'azure' as const,
                            created: new Date(),
                            lastModified: new Date(),
                            templates: []
                          })
                          
                          // 2. Muda para history para forçar busca (que vai falhar e limpar)
                          setActiveTab('history')
                          
                          // 3. Depois volta tudo ao normal
                          setTimeout(() => {
                            setHistoricalAnalyses([]) // Garante limpeza
                            setCurrentProject(projectBackup) // Restaura projeto real
                            setActiveTab('recent') // Volta pra recent
                          }, 200)
                        }}
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'recent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Terminal className="h-4 w-4" />
                  <span>Status da análise atual</span>
                  <Badge variant="secondary" className="ml-1">
                    {filteredJobs.filter(job => !job.id.startsWith('history_')).length}
                  </Badge>
                </div>
              </button>

                {/* Botão Histórico do Projeto */}
                <button
                  onClick={() => {
                    if (!currentProject) return
                    
                    // PRIMEIRO limpa tudo de recentes
                    setSelectedJob(null)
                    setShowReport(false)
                    
                    // DEPOIS muda a aba
                    setActiveTab('history')
                  }}
                  className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  disabled={!currentProject}
                >
                  <div className="flex items-center space-x-2">
                    <History className="h-4 w-4" />
                    <span>Histórico do Projeto</span>
                    {currentProject && (
                      <Badge variant="outline" className="ml-1">
                        {activeTab === 'history' ? historicalAnalyses.length : 0}
                      </Badge>
                    )}
                  </div>
                </button>
                  </div>
                  
                  <div className="flex items-center space-x-2 pb-3">
                    {activeTab === 'history' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={loadHistoricalAnalyses}
                        disabled={loadingHistory}
                      >
                        <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Filtros - Mantendo a lógica original */}
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por repositório ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={async (e) => {
                        // MANTER TODA A LÓGICA ORIGINAL DE BUSCA
                        if (e.key === 'Enter' && searchQuery.length > 30) {
                          try {
                            const response = await fetch(`${API_URL}/status/${searchQuery.trim()}`, {
                              method: 'GET',
                              headers: { 'Accept': 'application/json' },
                              mode: 'cors',
                              credentials: 'omit'
                            })
                            
                            if (response.ok) {
                              const data = await response.json()
                              console.log('Job encontrado:', data)
                              
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
                              }
                              
                              const existingJob = jobs.find(j => j.id === fetchedJob.id)
                              if (!existingJob) {
                                setJobs(prev => [fetchedJob, ...prev])
                              } else {
                                setJobs(prev => prev.map(j => 
                                  j.id === fetchedJob.id ? { ...j, ...fetchedJob } : j
                                ))
                              }
                              
                              setSelectedJob(fetchedJob)
                              setShowReport(!!fetchedJob.analysis_report)
                              setSearchQuery('')
                              
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
                    {searchQuery.length === 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                        Pressione Enter para buscar por ID
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={async () => {
                      if (searchQuery.length > 30) {
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
                      <span>{activeTab === 'recent' ? 'Análises Recentes' : 'Histórico do Projeto'}</span>
                    </div>
                  <Badge 
                    variant="secondary" 
                    className="font-normal"
                    style={{ 
                      background: `${BRAND_COLORS.secondary}20`,
                      color: BRAND_COLORS.primary 
                    }}
                  >
                    {activeTab === 'recent' 
                      ? `${filteredJobs.filter(job => !job.id.startsWith('history_')).length} ${filteredJobs.filter(job => !job.id.startsWith('history_')).length === 1 ? 'análise' : 'análises'}`
                      : activeTab === 'history' 
                        ? `${historicalAnalyses.length} ${historicalAnalyses.length === 1 ? 'registro' : 'registros'}`
                        : '0 registros'
                    }
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                  <ScrollArea className="h-[600px]">
                    {/* FORÇA RENDERIZAÇÃO CONDICIONAL ESTRITA */}
                    {activeTab === 'recent' ? (
                      // Renderizar APENAS jobs recentes
                      filteredJobs.filter(job => !job.id.startsWith('history_')).length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                          <FileText className="h-12 w-12 mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Nenhuma análise encontrada</p>
                          <p className="text-sm mt-1">Inicie uma nova análise para começar</p>
                        </div>
                      ) : (
                      <div className="space-y-4" style={{ display: activeTab === 'recent' ? 'block' : 'none' }}>
                      {filteredJobs
                        .filter(job => !job.id.startsWith('history_')) // IMPORTANTE: filtrar histórico
                        .map((job) => {
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
                                setHistoricalAnalyses([])

                                setSelectedJob(job)
                                setShowReport(!!job.analysis_report)
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-3">
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
                                        {(job.status === 'completed' || job.status === 'failed' || job.status === 'Concluído') && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={async (e) => {
                                              e.stopPropagation()
                                              
                                              const button = e.currentTarget as HTMLButtonElement
                                              const originalContent = button.innerHTML
                                              button.innerHTML = '<svg class="animate-spin h-3 w-3 mr-1 inline" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Carregando...'
                                              button.disabled = true
                                              
                                              try {
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
                                                
                                                if (report) {
                                                  console.log('Relatório encontrado! Tamanho:', report.length, 'caracteres')
                                                  
                                                  const updatedJob = { ...job, analysis_report: report }
                                                  
                                                  setJobs(prev => {
                                                    const newJobs = prev.map(j => 
                                                      j.id === job.id ? updatedJob : j
                                                    )
                                                    console.log('Jobs atualizados')
                                                    return newJobs
                                                  })
                                                  
                                                  setSelectedJob(updatedJob)
                                                  setShowReport(true)
                                                  
                                                  setTimeout(() => {
                                                    setSelectedJob(updatedJob)
                                                    setShowReport(true)
                                                  }, 100)
                                                  
                                                  const successDiv = document.createElement('div')
                                                  successDiv.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
                                                  successDiv.innerHTML = '✓ Relatório carregado com sucesso!'
                                                  document.body.appendChild(successDiv)
                                                  setTimeout(() => successDiv.remove(), 3000)
                                                  
                                                } else {
                                                  console.error('Nenhum relatório encontrado nas respostas')
                                                  
                                                  const errorDiv = document.createElement('div')
                                                  errorDiv.className = 'fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg'
                                                  errorDiv.innerHTML = '✗ Relatório não encontrado. Tente novamente em alguns segundos.'
                                                  document.body.appendChild(errorDiv)
                                                  setTimeout(() => errorDiv.remove(), 4000)
                                                }
                                              } catch (error) {
                                                console.error('Erro ao buscar relatório:', error)
                                                
                                                const errorDiv = document.createElement('div')
                                                errorDiv.className = 'fixed top-20 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg'
                                                errorDiv.innerHTML = '✗ Erro de conexão. Verifique o console.'
                                                document.body.appendChild(errorDiv)
                                                setTimeout(() => errorDiv.remove(), 4000)
                                              } finally {
                                                button.innerHTML = originalContent
                                                button.disabled = false
                                              }
                                            }}
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver Relatório
                                          </Button>
                                        )}
                                        
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
                                        
                                        {job.status === 'pending_approval' && !job.gerar_relatorio_apenas && !job.analysis_report && (
                                          <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Aguardando relatório...
                                          </Badge>
                                        )}
                                        
                                        {(job.status === 'generating_report' || job.status === 'pending_approval' || job.progress === 10) && !job.analysis_report && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                            onClick={async (e) => {
                                              e.stopPropagation()
                                              try {
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
                                            Relatório
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
                  )
                )  : (activeTab === 'history' && historicalAnalyses.length > 0) ? (
                  // HISTÓRICO DO PROJETO
                  !currentProject ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Folder className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Selecione um projeto</p>
                      <p className="text-sm mt-1">Escolha um projeto para ver o histórico</p>
                    </div>
                  ) : loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : historicalAnalyses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                      <Archive className="h-12 w-12 mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Sem histórico disponível</p>
                      <p className="text-sm mt-1">Nenhuma análise anterior encontrada para {currentProject.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-4" style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
                      {historicalAnalyses.map((analysis) => {
                        const analysisType = getAnalysisDetails(analysis.type)
                        const TypeIcon = analysisType?.icon || FileText
                        
                      return (
                        <Card 
                          key={analysis.id}
                          className="border cursor-pointer transition-all duration-200 hover:shadow-lg"
                          onClick={() => {
                            // Criar job temporário apenas para visualização, não adicionar à lista
                            const tempJob: Job = {
                              id: `history_${analysis.id}`,  // ID único para histórico
                              status: 'completed',
                              progress: 100,
                              message: 'Análise histórica',
                              analysis_report: analysis.report || `# Relatório Histórico\n\nProjeto: ${currentProject.name}\nData: ${analysis.date}`,
                              created_at: new Date(),
                              updated_at: new Date(),
                              repo_name: currentProject?.name,
                              analysis_type: analysis.type,
                              branch_name: 'main'
                            }
                            
                            // Apenas selecionar e mostrar, não adicionar aos jobs
                            setSelectedJob(tempJob)
                            setShowReport(true)
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-3">
                                {/* Nome do arquivo */}
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="font-semibold text-gray-900">
                                    {analysis.id}
                                  </span>
                                </div>
                                
                                {/* Caminho completo no blob */}
                                <div className="flex items-center space-x-2">
                                  <FolderOpen className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500 font-mono">
                                    {analysis.fullPath || `${currentProject.id}/${analysis.id}.md`}
                                  </span>
                                </div>
                                
                                {/* Status e tipo */}
                                <div className="flex items-center space-x-3">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-green-50 text-green-600 border-green-200"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Concluído
                                  </Badge>
                                  
                                  {analysisType && (
                                    <Badge variant="secondary" className="text-xs">
                                      <TypeIcon className="h-3 w-3 mr-1" />
                                      {analysisType.label}
                                    </Badge>
                                  )}
                                  
                                  <Badge variant="outline" className="text-xs">
                                    {analysis.size}
                                  </Badge>
                                </div>
                                
                                {/* Data e botão ver */}
                                <div className="flex items-center justify-between pt-2">
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>{analysis.date}</span>
                                  </div>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Ver
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                      })}
                    </div>
                  )
                ): null}
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

            {/* Modal de Histórico */}
      {showHistoryModal && (
        <AnalysisHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          currentProject={currentProject}
          onSelectAnalysis={async (analysis: any) => {
            try {
              // Simular carregamento de análise histórica
              const historicalJob: Job = {
                id: analysis.id,
                status: 'completed',
                progress: 100,
                message: 'Análise histórica carregada',
                analysis_report: `# Relatório Histórico: ${analysis.id}\n\nData: ${analysis.date}\nTipo: ${analysis.type}\n\n## Conteúdo\n\nEste é um relatório histórico recuperado do Azure Blob Storage.`,
                created_at: new Date(analysis.date),
                updated_at: new Date(analysis.date),
                repo_name: currentProject?.name,
                analysis_type: analysis.type,
                branch_name: 'main'
              }
              
              //setJobs(prev => [historicalJob, ...prev])
               
               setShowReport(true)
              setSelectedJob(historicalJob)
              setShowReport(true)
              setShowHistoryModal(false)
              
              // Notificação
              const badge = document.createElement('div')
              badge.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
              badge.innerHTML = `✓ Análise histórica carregada`
              document.body.appendChild(badge)
              setTimeout(() => badge.remove(), 3000)
            } catch (error) {
              console.error('Erro ao carregar análise:', error)
            }
          }}
        />
      )}
            
            {/* Modal de Seleção de Projeto */}
      {showProjectModal && (
        <ProjectSelectionModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          projects={projects}
          onSelect={(project: Project) => {
            setCurrentProject(project)
            setShowProjectModal(false)
            
            // Notificação
            const badge = document.createElement('div')
            badge.className = 'fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg'
            badge.innerHTML = `✓ Projeto "${project.name}" selecionado`
            document.body.appendChild(badge)
            setTimeout(() => badge.remove(), 2000)
          }}
          onCreateNew={() => {
            const name = prompt('Nome do novo projeto:')
            if (name) {
              const newProject = {
                id: name.toLowerCase().replace(/ /g, '_'),
                name,
                source: 'local' as const,
                created: new Date(),
                lastModified: new Date(),
                templates: []
              }
              setProjects([...projects, newProject])
              setCurrentProject(newProject)
              setShowProjectModal(false)
            }
          }}
        />
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
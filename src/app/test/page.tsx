"use client"

import { useState, useEffect, useRef } from 'react'
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
  Loader2, Play, CheckCircle, XCircle, AlertCircle, RefreshCw, FileText,
  Clock, ThumbsUp, ThumbsDown, Eye, GitBranch, Code, Sparkles, Terminal,
  Activity, ChevronRight, Filter, Search, Download, Copy, CheckCheck,
  Zap, Shield, FileCode, TestTube, Bug, Cpu, Layers, Plus, Rocket,
  Info, Settings, Database, GitCommit, ArrowRight, Bot, BrainCircuit,
  Menu, X, ChevronLeft, ChevronDown, Upload, Folder, BookOpen, Key,
  Moon, Sun, Globe, Bell, FileUp, History, Archive, Palette, Users,
  FolderOpen, FileJson, Package, Building, Save, Trash2, Edit,
  ExternalLink, HelpCircle, LogOut, BarChart3, PanelLeftClose, PanelLeft
} from 'lucide-react'

const API_URL = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'

// Cores da marca PEERS conforme brandbook
const BRAND_COLORS = {
  primary: '#011334',     // PEERS Neue Blue
  secondary: '#E1FF00',   // PEERS Neue Lime  
  accent: '#D8E8EE',      // Serene Blue
  white: '#FFFFFF',
  
  // Variações da paleta secundária
  blue: {
    100: '#EFF6F8',  // Serene Blue 03
    200: '#E8F1F5',  // Serene Blue 02
    300: '#D8E8EE',  // Serene Blue
    400: '#CCD0D6',  // Neue Blue 04
    500: '#99A1AE',  // Neue Blue 03
    600: '#677185',  // Neue Blue 02
    700: '#011334',  // Neue Blue (primary)
  },
  lime: {
    100: '#F9FFCC',  // Neue Lime 03
    200: '#F3FF99',  // Neue Lime 02
    300: '#E1FF00',  // Neue Lime (secondary)
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
    secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
    mixed: 'linear-gradient(135deg, #011334 0%, #033670 100%)',
    subtle: 'linear-gradient(135deg, #f8fafb 0%, #e8f4f8 100%)'
  }
}

// Interface para configurações
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

// Tipos de análise
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

// Componente para renderizar o relatório de forma bonita
const ReportViewer = ({ content, analysisType, getAnalysisDetails }: { 
  content: string, 
  analysisType?: string,
  getAnalysisDetails: (type: string) => any
}) => {
  // Função para obter ícone e cor baseado na severidade
  const getSeverityConfig = (severity: string) => {
    const severityLower = severity.toLowerCase()
    if (severityLower.includes('severo') || severityLower.includes('crítico')) {
      return { icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800' }
    }
    if (severityLower.includes('moderado') || severityLower.includes('médio')) {
      return { icon: Info, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' }
    }
    if (severityLower.includes('baixo') || severityLower.includes('leve')) {
      return { icon: CheckCircle, color: 'text-green-600 bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' }
    }
    return { icon: Info, color: 'text-blue-600 bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' }
  }

  // Processar o conteúdo Markdown
  const processContent = () => {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let currentTable: string[] = []
    let inTable = false
    let tableKey = 0

    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold mb-4 mt-6 text-gray-900 flex items-center gap-2">
            <FileText className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
            {line.substring(2)}
          </h1>
        )
      } else if (line.startsWith('## ')) {
        const sectionNumber = line.match(/^\#\# (\d+)\./)?.[1]
        elements.push(
          <h2 key={index} className="text-xl font-semibold mb-3 mt-5 text-gray-800 flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" 
                  style={{ backgroundColor: BRAND_COLORS.secondary, color: BRAND_COLORS.primary }}>
              {sectionNumber || '#'}
            </span>
            {line.substring(3)}
          </h2>
        )
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="text-lg font-semibold mb-2 mt-4 text-gray-700">
            {line.substring(4)}
          </h3>
        )
      }
      // Bold text with severity
      else if (line.includes('**Severidade:**')) {
        const severity = line.match(/\*\*Severidade:\*\* (.+)/)?.[1] || ''
        const config = getSeverityConfig(severity)
        const Icon = config.icon
        elements.push(
          <div key={index} className={`flex items-center gap-2 p-3 rounded-lg border mb-3 ${config.color}`}>
            <Icon className="h-5 w-5" />
            <span className="font-semibold">Severidade:</span>
            <Badge className={config.badge}>{severity}</Badge>
          </div>
        )
      }
      // Lists
      else if (line.startsWith('- ')) {
        const listItem = line.substring(2)
        // Check if it contains code blocks
        const processedItem = listItem.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">$1</code>')
        
        elements.push(
          <li key={index} className="flex items-start gap-2 mb-2">
            <ChevronRight className="h-4 w-4 mt-1 flex-shrink-0" style={{ color: BRAND_COLORS.secondary }} />
            <span dangerouslySetInnerHTML={{ __html: processedItem }} className="text-gray-700" />
          </li>
        )
      }
      // Table handling
      else if (line.includes('|')) {
        if (!inTable) {
          inTable = true
          currentTable = []
        }
        currentTable.push(line)
      } else if (inTable && !line.includes('|')) {
        // End of table, render it
        if (currentTable.length > 0) {
          elements.push(renderTable(currentTable, tableKey++))
          currentTable = []
          inTable = false
        }
      }
      // Regular text
      else if (line.trim() && !line.startsWith('#')) {
        const processedLine = line
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">$1</code>')
        
        elements.push(
          <p key={index} className="text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />
        )
      }
    })

    // Handle any remaining table
    if (currentTable.length > 0) {
      elements.push(renderTable(currentTable, tableKey))
    }

    return elements
  }

  // Renderizar tabela
  const renderTable = (tableLines: string[], key: number) => {
    const rows = tableLines.filter(line => !line.match(/^\|[\s\-:|]+\|$/))
    if (rows.length === 0) return null

    const headers = rows[0].split('|').filter(cell => cell.trim())
    const dataRows = rows.slice(1).map(row => row.split('|').filter(cell => cell.trim()))

    return (
      <div key={`table-${key}`} className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {header.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {row.map((cell, cellIndex) => {
                  const cellContent = cell.trim()
                  let processedContent = cellContent
                  
                  // Check for severity in the cell
                  if (cellContent.includes('Severo') || cellContent.includes('Moderado') || cellContent.includes('Baixo')) {
                    const config = getSeverityConfig(cellContent)
                    processedContent = `<span class="${config.badge} px-2 py-1 rounded-full text-xs font-semibold">${cellContent}</span>`
                  }
                  // Check for code blocks
                  else if (cellContent.includes('`')) {
                    processedContent = cellContent.replace(
                      /`([^`]+)`/g, 
                      '<code class="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-sm font-mono">$1</code>'
                    )
                  }
                  // Check for CRIAR/ATUALIZAR actions
                  else if (cellContent.includes('**CRIAR**') || cellContent.includes('**ATUALIZAR**')) {
                    processedContent = cellContent
                      .replace(/\*\*CRIAR\*\*/g, '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-800">CRIAR</span>')
                      .replace(/\*\*ATUALIZAR\*\*/g, '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">ATUALIZAR</span>')
                  }
                  
                  return (
                    <td key={cellIndex} className="px-4 py-3 text-sm text-gray-700">
                      <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const analysisTypeDetails = getAnalysisDetails(analysisType || '')
  const AnalysisIcon = analysisTypeDetails?.icon || FileText

  return (
    <div className="max-w-none">
      {/* Header do tipo de análise */}
      <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: BRAND_COLORS.accent + '20', borderColor: BRAND_COLORS.accent }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND_COLORS.secondary }}>
            <AnalysisIcon className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg" style={{ color: BRAND_COLORS.primary }}>
              {analysisTypeDetails?.label || analysisType}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {analysisTypeDetails?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo processado */}
      <div className="prose prose-sm max-w-none">
        {processContent()}
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

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'version' | 'knowledge') => {
    const file = event.target.files?.[0]
    if (!file) return

    if (type === 'version') {
      const newVersion: VersionFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        version: `v${versions.length + 1}.0.0`,
        uploadDate: new Date(),
        size: file.size,
      }
      setVersions([...versions, newVersion])
    } else {
      const newDoc: KnowledgeDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'documentation',
        uploadDate: new Date(),
        size: file.size,
      }
      setKnowledgeDocs([...knowledgeDocs, newDoc])
    }
  }

  const menuSections = [
    {
      id: 'llm',
      title: 'Configurações de LLM',
      icon: BrainCircuit,
      content: (
        <div className="space-y-4">
          {/* Modelo */}
          <div>
            <Label className="text-xs font-medium text-gray-700">Modelo</Label>
            <Select value={llmConfig.model} onValueChange={(value) => setLlmConfig({...llmConfig, model: value})}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key */}
          <div>
            <Label className="text-xs font-medium text-gray-700">API Key</Label>
            <div className="relative mt-1">
              <Input 
                type="password"
                value={llmConfig.apiKey}
                onChange={(e) => setLlmConfig({...llmConfig, apiKey: e.target.value})}
                placeholder="sk-..."
                className="pr-8"
              />
              <Key className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <Label className="text-xs font-medium text-gray-700">Limite de Tokens</Label>
            <Input 
              type="number"
              value={llmConfig.maxTokens}
              onChange={(e) => setLlmConfig({...llmConfig, maxTokens: parseInt(e.target.value)})}
              min={1}
              max={32000}
              className="mt-1"
            />
          </div>

          {/* Botão Salvar */}
          <Button 
            className="w-full mt-4"
            style={{ 
              backgroundColor: BRAND_COLORS.secondary,
              color: BRAND_COLORS.primary
            }}
            onClick={() => {
              localStorage.setItem('llmConfig', JSON.stringify(llmConfig))
              alert('Configurações de LLM salvas!')
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      )
    },
    {
      id: 'versioning',
      title: 'Versionamento',
      icon: GitBranch,
      content: (
        <div className="space-y-4">
          {/* Upload de Versão */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".json,.yaml,.yml"
              onChange={(e) => handleFileUpload(e, 'version')}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload de Versão
            </Button>
          </div>

          {/* Lista de Versões */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">Histórico de Versões</Label>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {versions.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Nenhuma versão disponível</p>
              ) : (
                versions.map((version: VersionFile) => (
                  <div key={version.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium">{version.name}</p>
                        <p className="text-xs text-gray-500">{version.version} • {(version.size / 1024).toFixed(1)}KB</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Comparação de Versões */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2">Comparar Versões</Label>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Versão 1" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v: VersionFile) => (
                    <SelectItem key={v.id} value={v.id}>{v.version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Versão 2" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v: VersionFile) => (
                    <SelectItem key={v.id} value={v.id}>{v.version}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full mt-2" variant="outline" size="sm">
              <GitCommit className="h-3 w-3 mr-2" />
              Comparar
            </Button>
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
          {/* Upload de Documentos */}
          <div>
            <input
              ref={docInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.md,.txt,.doc,.docx"
              onChange={(e) => handleFileUpload(e, 'knowledge')}
            />
            <Button 
              onClick={() => docInputRef.current?.click()}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload de Documento
            </Button>
          </div>

          {/* Categorias de Documentos */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2">Categorias</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <FileText className="h-3 w-3 mr-1" />
                Docs ({knowledgeDocs.filter((d: KnowledgeDoc) => d.type === 'documentation').length})
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Shield className="h-3 w-3 mr-1" />
                Políticas ({knowledgeDocs.filter((d: KnowledgeDoc) => d.type === 'policy').length})
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <BookOpen className="h-3 w-3 mr-1" />
                Guias ({knowledgeDocs.filter((d: KnowledgeDoc) => d.type === 'guide').length})
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <FileCode className="h-3 w-3 mr-1" />
                Outros ({knowledgeDocs.filter((d: KnowledgeDoc) => d.type === 'other').length})
              </Button>
            </div>
          </div>

          {/* Lista de Documentos */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-gray-700">Documentos</Label>
              <span className="text-xs text-gray-500">{knowledgeDocs.length} itens</span>
            </div>
            <ScrollArea className="h-48 border rounded-lg p-2">
              {knowledgeDocs.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Nenhum documento disponível</p>
              ) : (
                knowledgeDocs.map((doc: KnowledgeDoc) => (
                  <div key={doc.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded group">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-xs font-medium truncate max-w-[150px]">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(doc.uploadDate).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)}KB
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Configurações RAG */}
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
              <div className="flex items-center justify-between">
                <span className="text-xs">Embedding Model</span>
                <Select defaultValue="ada-002">
                  <SelectTrigger className="w-32 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ada-002">Ada 002</SelectItem>
                    <SelectItem value="curie">Curie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      title: 'Projetos',
      icon: Folder,
      content: (
        <div className="space-y-4">
          {/* Criar Novo Projeto */}
          <Button 
            className="w-full"
            style={{ 
              backgroundColor: BRAND_COLORS.primary,
              color: BRAND_COLORS.white
            }}
            onClick={() => {
              const name = prompt('Nome do novo projeto:')
              if (name) {
                const newProject: Project = {
                  id: Math.random().toString(36).substr(2, 9),
                  name,
                  created: new Date(),
                  lastModified: new Date(),
                  templates: []
                }
                setProjects([...projects, newProject])
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>

          {/* Lista de Projetos */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">Projetos Ativos</Label>
            <ScrollArea className="h-64 border rounded-lg p-2">
              {projects.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">Nenhum projeto disponível</p>
              ) : (
                projects.map((project: Project) => (
                  <div 
                    key={project.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      currentProject?.id === project.id 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => setCurrentProject(project)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <FolderOpen className={`h-4 w-4 mt-0.5 ${
                          currentProject?.id === project.id ? 'text-blue-500' : 'text-gray-400'
                        }`} />
                        <div>
                          <p className="text-xs font-medium">{project.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {project.templates.length} templates
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Modificado: {new Date(project.lastModified).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Templates de Análise */}
          {currentProject && (
            <div className="pt-2 border-t">
              <Label className="text-xs font-medium text-gray-700 mb-2">
                Templates - {currentProject.name}
              </Label>
              <div className="space-y-1">
                {Object.entries(analysisCategories).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs text-gray-500 mt-2 mb-1">{category}</p>
                    {items.map(item => (
                      <label key={item.value} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded">
                        <input 
                          type="checkbox" 
                          className="h-3 w-3"
                          checked={currentProject.templates.includes(item.value)}
                          onChange={(e) => {
                            const updatedTemplates = e.target.checked
                              ? [...currentProject.templates, item.value]
                              : currentProject.templates.filter((t: string) => t !== item.value)
                            
                            setProjects(projects.map((p: Project) => 
                              p.id === currentProject.id 
                                ? { ...p, templates: updatedTemplates, lastModified: new Date() }
                                : p
                            ))
                            setCurrentProject({...currentProject, templates: updatedTemplates})
                          }}
                        />
                        <span className="text-xs">{item.label}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Configurações Gerais',
      icon: Settings,
      content: (
        <div className="space-y-4">
          {/* Notificações */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2">Notificações</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Análise Concluída</span>
                <Switch 
                  checked={notifications.analysisComplete}
                  onCheckedChange={(checked) => setNotifications({...notifications, analysisComplete: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Erros e Alertas</span>
                <Switch 
                  checked={notifications.errors}
                  onCheckedChange={(checked) => setNotifications({...notifications, errors: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs">Atualizações do Sistema</span>
                <Switch 
                  checked={notifications.updates}
                  onCheckedChange={(checked) => setNotifications({...notifications, updates: checked})}
                />
              </div>
            </div>
          </div>

          {/* Tema */}
          <div>
            <Label className="text-xs font-medium text-gray-700 mb-2">Tema</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="justify-center"
              >
                <Sun className="h-3 w-3 mr-1" />
                Claro
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="justify-center"
              >
                <Moon className="h-3 w-3 mr-1" />
                Escuro
              </Button>
              <Button 
                variant={theme === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('auto')}
                className="justify-center"
              >
                <Palette className="h-3 w-3 mr-1" />
                Auto
              </Button>
            </div>
          </div>

          {/* Idioma */}
          <div>
            <Label className="text-xs font-medium text-gray-700">Idioma</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    Português (BR)
                  </div>
                </SelectItem>
                <SelectItem value="en-US">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    English (US)
                  </div>
                </SelectItem>
                <SelectItem value="es">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    Español
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Exportação de Dados */}
          <div className="pt-2 border-t">
            <Label className="text-xs font-medium text-gray-700 mb-2">Exportação de Dados</Label>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Download className="h-3 w-3 mr-2" />
                Exportar Configurações
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileJson className="h-3 w-3 mr-2" />
                Exportar Análises
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Archive className="h-3 w-3 mr-2" />
                Backup Completo
              </Button>
            </div>
          </div>

          {/* Ações da Conta */}
          <div className="pt-2 border-t">
            <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:bg-red-50">
              <LogOut className="h-3 w-3 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      )
    }
  ]

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Menu Lateral */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderRight: `2px solid ${BRAND_COLORS.accent}` }}
      >
        {/* Header do Menu */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            background: BRAND_COLORS.gradients.primary,
            borderBottom: `2px solid ${BRAND_COLORS.secondary}`
          }}
        >
          <div className="flex items-center gap-2">
            <img 
              src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
              alt="PEERS" 
              className="h-8 brightness-0 invert"
            />
            <span className="font-medium text-white"></span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo do Menu */}
        <ScrollArea className="h-[calc(100vh-64px)]">
          <div className="p-4">
            {menuSections.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections.includes(section.id)
              
              return (
                <div key={section.id} className="mb-4">
                  <button
                    onClick={() => {
                      setActiveSection(section.id)
                      toggleSection(section.id)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
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
                    <div className="mt-3 px-3">
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

// Componente Principal
export default function TestPage() {
  // Estados existentes
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isPolling, setIsPolling] = useState<string | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null)
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    repo_name: '',
    branch_name: 'main',
    analysis_type: '',
    instrucoes_extras: '',
    gerar_relatorio_apenas: false,
  })

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
      setTheme(savedTheme as any)
    }
  }, [])

  // Salvar alterações no localStorage
  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])

  // Função para obter detalhes do tipo de análise
  const getAnalysisDetails = (type: string) => {
    for (const category of Object.values(analysisCategories)) {
      const found = category.find(item => item.value === type)
      if (found) return found
    }
    return null
  }

  // Polling function melhorada
  const startPolling = (jobId: string) => {
    if (isPolling) return
    
    setIsPolling(jobId)
    console.log('Iniciando polling para job:', jobId)
    
    let attempts = 0
    const maxAttempts = 100 // 5 minutos máximo
    
    const pollInterval = setInterval(async () => {
      attempts++
      
      try {
        // Primeiro tenta buscar o relatório diretamente
        const reportResponse = await fetch(`${API_URL}/jobs/${jobId}/report`)
        if (reportResponse.ok) {
          const reportData = await reportResponse.json()
          if (reportData.report) {
            // Encontrou o relatório!
            setJobs(prev => prev.map(job => 
              job.id === jobId 
                ? {
                    ...job,
                    status: 'completed',
                    progress: 100,
                    analysis_report: reportData.report,
                    updated_at: new Date()
                  }
                : job
            ))
            
            if (selectedJob?.id === jobId) {
              setSelectedJob(prev => prev ? {
                ...prev,
                status: 'completed',
                progress: 100,
                analysis_report: reportData.report,
                updated_at: new Date()
              } : null)
              setShowReport(true)
            }
            
            clearInterval(pollInterval)
            setIsPolling(null)
            console.log('Relatório encontrado!')
            
            // Notificação se habilitada
            if (notifications.analysisComplete) {
              alert('Análise concluída com sucesso!')
            }
            return
          }
        }
        
        // Se não encontrou relatório, verifica o status
        const statusResponse = await fetch(`${API_URL}/status/${jobId}`)
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          
          // Atualiza o progresso
          const progress = statusData.progress || Math.min(10 + (attempts * 2), 90)
          
          setJobs(prev => prev.map(job => 
            job.id === jobId 
              ? {
                  ...job,
                  status: statusData.status || 'processing',
                  progress: progress,
                  message: statusData.message || 'Processando análise...',
                  updated_at: new Date()
                }
              : job
          ))
          
          if (selectedJob?.id === jobId) {
            setSelectedJob(prev => prev ? {
              ...prev,
              status: statusData.status || 'processing',
              progress: progress,
              message: statusData.message || 'Processando análise...',
              updated_at: new Date()
            } : null)
          }
          
          // Se o status indica conclusão mas não tem relatório, para
          if (['completed', 'failed', 'rejected'].includes(statusData.status)) {
            clearInterval(pollInterval)
            setIsPolling(null)
            
            if (statusData.status === 'completed') {
              // Marcar como concluído mesmo sem relatório
              setJobs(prev => prev.map(job => 
                job.id === jobId 
                  ? { ...job, status: 'completed', progress: 100 }
                  : job
              ))
            }
          }
        }
        
        // Timeout após muitas tentativas
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
          setIsPolling(null)
          console.log('Polling timeout')
          
          // Marcar como concluído mesmo sem relatório
          setJobs(prev => prev.map(job => 
            job.id === jobId 
              ? { ...job, status: 'completed', progress: 100 }
              : job
          ))
        }
      } catch (error) {
        console.error('Erro no polling:', error)
      }
    }, 3000) // Poll a cada 3 segundos
  }

  // Submit handler
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
        
        const initialStatus = formData.gerar_relatorio_apenas 
          ? 'processing' 
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
        
        if (data.report || data.analysis_report) {
          setShowReport(true)
          newJob.analysis_report = data.report || data.analysis_report
          newJob.status = 'completed'
          newJob.progress = 100
        } else if (formData.gerar_relatorio_apenas) {
          // Se é modo rápido, inicia polling imediatamente
          startPolling(jobId)
        }
        
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
      
      if (!response.ok) {
        console.warn('Não foi possível atualizar no backend, atualizando localmente')
      }
      
      const newStatus = action === 'approve' ? 'processing' : 'rejected'
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus, progress: action === 'approve' ? 10 : 0, updated_at: new Date() }
          : job
      ))
      
      if (selectedJob?.id === jobId) {
        setSelectedJob(prev => prev ? { 
          ...prev, 
          status: newStatus,
          progress: action === 'approve' ? 10 : 0,
          updated_at: new Date()
        } : null)
        
        if (action === 'approve') {
          startPolling(jobId)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      const newStatus = action === 'approve' ? 'processing' : 'rejected'
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: newStatus, progress: action === 'approve' ? 10 : 0 }
          : job
      ))
      
      if (action === 'approve') {
        startPolling(jobId)
      }
    }
  }

  // Função para buscar relatório
  const fetchReport = async (jobId: string) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/report`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.report) {
          setJobs(prev => prev.map(job => 
            job.id === jobId 
              ? { ...job, analysis_report: data.report, status: 'completed', progress: 100 }
              : job
          ))
          if (selectedJob?.id === jobId) {
            setSelectedJob(prev => prev ? { 
              ...prev, 
              analysis_report: data.report,
              status: 'completed',
              progress: 100 
            } : null)
            setShowReport(true)
          }
          return
        }
      }
      
      const statusResponse = await fetch(`${API_URL}/status/${jobId}`)
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        if (statusData.analysis_report || statusData.report) {
          const report = statusData.analysis_report || statusData.report
          setJobs(prev => prev.map(job => 
            job.id === jobId 
              ? { ...job, analysis_report: report, status: 'completed', progress: 100 }
              : job
          ))
          if (selectedJob?.id === jobId) {
            setSelectedJob(prev => prev ? { 
              ...prev, 
              analysis_report: report,
              status: 'completed',
              progress: 100 
            } : null)
            setShowReport(true)
          }
        } else {
          alert('Relatório ainda não disponível. Tente novamente em alguns segundos.')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
      alert('Erro ao buscar relatório. Verifique a conexão com o servidor.')
    }
  }

  // Copiar relatório
  const copyReport = async (report: string, jobId: string) => {
    try {
      await navigator.clipboard.writeText(report)
      setCopiedReportId(jobId)
      setTimeout(() => setCopiedReportId(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  // Copiar ID do job
  const copyJobId = async (jobId: string) => {
    try {
      await navigator.clipboard.writeText(jobId)
      setCopiedJobId(jobId)
      setTimeout(() => setCopiedJobId(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar ID:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

      {/* Header Principal */}
      <header 
        className="sticky top-0 z-30 bg-white shadow-md border-b-2"
        style={{ borderColor: BRAND_COLORS.secondary }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {/* Botão Menu */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
              </Button>
              
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img 
                  src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                  alt="PEERS" 
                  className="h-10"
                />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold" style={{ color: BRAND_COLORS.primary }}>
                    Agentes Peers
                  </h1>
                  <p className="text-xs text-gray-600">Plataforma de Análise com IA</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Botão Menu Desktop */}
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

              {/* Status Indicador */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Backend Online</span>
              </div>

              {/* Projeto Atual */}
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Análise */}
          <Card className="h-fit shadow-xl">
            <CardHeader 
              className="text-white"
              style={{ background: BRAND_COLORS.gradients.primary }}
            >
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Nova Análise Inteligente
              </CardTitle>
              <CardDescription className="text-gray-200">
                Configure e inicie uma análise automatizada do seu código
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Repositório */}
                <div>
                  <Label htmlFor="repo">Repositório *</Label>
                  <Input
                    id="repo"
                    placeholder="Ex: owner/repository"
                    value={formData.repo_name}
                    onChange={(e) => setFormData({...formData, repo_name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>

                {/* Branch */}
                <div>
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    placeholder="main"
                    value={formData.branch_name}
                    onChange={(e) => setFormData({...formData, branch_name: e.target.value})}
                    className="mt-1"
                  />
                </div>

                {/* Tipo de Análise */}
                <div>
                  <Label htmlFor="analysis">Tipo de Análise *</Label>
                  <Select 
                    value={formData.analysis_type}
                    onValueChange={(value) => setFormData({...formData, analysis_type: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo de análise" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(analysisCategories).map(([category, items]) => (
                        <div key={category}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                            {category}
                          </div>
                          {items.map(item => {
                            const Icon = item.icon
                            return (
                              <SelectItem key={item.value} value={item.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <span>{item.label}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Instruções Extras */}
                <div>
                  <Label htmlFor="instructions">Instruções Adicionais</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Adicione contexto ou requisitos específicos..."
                    value={formData.instrucoes_extras}
                    onChange={(e) => setFormData({...formData, instrucoes_extras: e.target.value})}
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                {/* Modo Rápido */}
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <div>
                      <Label htmlFor="quick-mode" className="text-sm font-medium cursor-pointer">
                        Modo Rápido
                      </Label>
                      <p className="text-xs text-gray-600">Gera somente análise</p>
                    </div>
                  </div>
                  <Switch
                    id="quick-mode"
                    checked={formData.gerar_relatorio_apenas}
                    onCheckedChange={(checked) => setFormData({...formData, gerar_relatorio_apenas: checked})}
                  />
                </div>

                {/* Erro */}
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Botões */}
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1"
                    style={{ 
                      backgroundColor: BRAND_COLORS.primary,
                      color: BRAND_COLORS.white
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Análise
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      repo_name: '',
                      branch_name: 'main',
                      analysis_type: '',
                      instrucoes_extras: '',
                      gerar_relatorio_apenas: false,
                    })}
                  >
                    Limpar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Jobs */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Análises Recentes
                </span>
                <Badge variant="outline">{jobs.length} jobs</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhuma análise iniciada</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Preencha o formulário ao lado para começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => {
                      const analysisDetails = getAnalysisDetails(job.analysis_type || '')
                      const Icon = analysisDetails?.icon || FileText
                      
                      return (
                        <div
                          key={job.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedJob?.id === job.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            setSelectedJob(job)
                            if (job.analysis_report) {
                              setShowReport(true)
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ backgroundColor: `${BRAND_COLORS.accent}` }}
                              >
                                <Icon className="h-4 w-4" style={{ color: BRAND_COLORS.primary }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm">{job.repo_name}</p>
                                  {job.branch_name && (
                                    <Badge variant="outline" className="text-xs">
                                      <GitBranch className="h-3 w-3 mr-1" />
                                      {job.branch_name}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {analysisDetails?.label || job.analysis_type}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <button
                                    className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyJobId(job.id)
                                    }}
                                  >
                                    {copiedJobId === job.id ? (
                                      <>
                                        <CheckCheck className="h-3 w-3 text-green-600" />
                                        Copiado!
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="h-3 w-3" />
                                        ID: {job.id.substring(0, 8)}
                                      </>
                                    )}
                                  </button>
                                  <span className="text-xs text-gray-400">
                                    {new Date(job.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              {/* Status Badge */}
                              <Badge 
                                variant={
                                  job.status === 'completed' ? 'default' :
                                  job.status === 'failed' ? 'destructive' :
                                  job.status === 'pending_approval' ? 'secondary' :
                                  'outline'
                                }
                              >
                                {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {job.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                {job.status === 'pending_approval' && <Clock className="h-3 w-3 mr-1" />}
                                {['processing', 'generating_report'].includes(job.status) && 
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                }
                                {job.status}
                              </Badge>
                              
                              {/* Progress Bar */}
                              {job.status !== 'completed' && job.status !== 'failed' && (
                                <Progress value={job.progress} className="w-24 h-2" />
                              )}
                              
                              {/* Ações */}
                              {job.status === 'processing' && job.id === isPolling && (
                                <Badge variant="outline" className="text-xs">
                                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                  Atualizando...
                                </Badge>
                              )}
                              
                              {/* Botão Buscar Relatório */}
                              {(job.status === 'processing' || job.status === 'generating_report') && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    fetchReport(job.id)
                                  }}
                                  className="mt-1"
                                >
                                  <Search className="h-3 w-3 mr-1" />
                                  Buscar Relatório
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Modal de Aprovação */}
        {selectedJob && selectedJob.status === 'pending_approval' && !selectedJob.gerar_relatorio_apenas && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    Aprovação Necessária
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedJob(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>
                  Revise e aprove a análise para continuar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm">
                      Ao aprovar, o sistema iniciará a análise completa do código.
                      Este processo pode levar alguns minutos.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Repositório:</p>
                    <p className="text-sm text-gray-600">{selectedJob.repo_name}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Tipo de Análise:</p>
                    <p className="text-sm text-gray-600">
                      {getAnalysisDetails(selectedJob.analysis_type || '')?.label || selectedJob.analysis_type}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {getAnalysisDetails(selectedJob.analysis_type || '')?.description}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Branch:</p>
                    <p className="text-sm text-gray-600">{selectedJob.branch_name || 'main'}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Job ID:</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedJob.id)
                          setCopiedJobId(selectedJob.id)
                          setTimeout(() => setCopiedJobId(null), 2000)
                        }}
                      >
                        {copiedJobId === selectedJob.id ? (
                          <>
                            <CheckCheck className="h-3 w-3 mr-1 text-green-600" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 mr-1" />
                            {selectedJob.id.substring(0, 8)}...
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    className="flex-1"
                    variant="default"
                    onClick={() => handleJobAction(selectedJob.id, 'approve')}
                    style={{ 
                      backgroundColor: BRAND_COLORS.primary,
                      color: BRAND_COLORS.white
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Aprovar e Iniciar
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleJobAction(selectedJob.id, 'reject')}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Relatório */}
        {selectedJob && showReport && selectedJob.analysis_report && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
              <CardHeader className="flex-shrink-0 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Relatório de Análise
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyReport(selectedJob.analysis_report!, selectedJob.id)}
                    >
                      {copiedReportId === selectedJob.id ? (
                        <>
                          <CheckCheck className="h-4 w-4 mr-2 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const blob = new Blob([selectedJob.analysis_report!], { type: 'text/markdown' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `relatorio-${selectedJob.repo_name}-${selectedJob.id}.md`
                        a.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReport(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {selectedJob.repo_name} • {selectedJob.analysis_type} • {new Date(selectedJob.created_at).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-6">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{selectedJob.analysis_report}</pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
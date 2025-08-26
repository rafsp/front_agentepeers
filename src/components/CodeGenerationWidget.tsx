// src/components/CodeGenerationWidget.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Loader2,
  Sparkles,
  Code,
  Package,
  ShoppingCart,
  Server,
  FileCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Wand2,
  BookTemplate,
  Rocket,
  Copy,
  CheckCheck,
  History,
  Download,
  RefreshCw,
  Trash2,
  FileText,
  GitBranch,
  Database,
  Shield,
  Users,
  CreditCard,
  Search as SearchIcon,
  ShoppingBag,
  Star,
  Package2,
  Layers,
  Cloud,
  Lock,
  Activity,
  Zap,
  Cpu,
  Folder,
  BarChart3
} from 'lucide-react'

// Cores da marca PEERS - exatamente as mesmas da página test
const BRAND_COLORS = {
  primary: '#011334',     // PEERS Neue Blue
  secondary: '#E1FF00',   // PEERS Neue Lime
  accent: '#D8E8EE',      // Serene Blue
  white: '#FFFFFF',
  
  gradients: {
    primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
    secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
    mixed: 'linear-gradient(135deg, #011334 0%, #022558 50%, #033670 100%)',
    subtle: 'linear-gradient(135deg, #f8fafb 0%, #e8f4f8 100%)'
  }
}

// Templates predefinidos com requisitos completos
const CODE_TEMPLATES = {
  crm: {
    id: 'crm',
    name: 'Sistema CRM Completo',
    icon: Package,
    description: 'Sistema de gestão de clientes para seguradora',
    requirements: `Documento de Requisitos: Sistema de Gestão de Clientes

1. Objetivo
Desenvolver um sistema web para gerenciamento de clientes para uma seguradora, permitindo cadastro, consulta, edição e exclusão de clientes, com integração a um banco de dados PostgreSQL.

2. Requisitos Funcionais
RF1: O sistema deve permitir o cadastro de clientes com os campos: nome, CPF, e-mail, telefone e data de nascimento.
RF2: O sistema deve listar todos os clientes em uma tabela com opções de filtro por nome ou CPF.
RF3: O sistema deve permitir edição e exclusão de clientes.
RF4: O sistema deve validar o formato de CPF e e-mail antes de salvar.
RF5: O sistema deve ser acessível apenas por usuários autenticados.

3. Requisitos Não-Funcionais
RNF1: O sistema deve ser desenvolvido em Python (backend com FastAPI) e React (frontend).
RNF2: O banco de dados deve ser PostgreSQL.
RNF3: O sistema deve ser responsivo e seguir padrões de acessibilidade WCAG 2.1.
RNF4: O tempo de resposta das APIs deve ser inferior a 1 segundo para 95% das requisições.
RNF5: O código deve seguir as diretrizes PEP 8 para Python e ESLint para JavaScript.

4. Histórias de Usuário
HU1: Como administrador, quero cadastrar um cliente com nome, CPF, e-mail, telefone e data de nascimento.
HU2: Como administrador, quero visualizar uma lista de clientes com filtros.
HU3: Como administrador, quero editar ou excluir clientes.
HU4: Como usuário, quero me autenticar com login e senha.

5. Critérios de Aceitação
CA1: O formulário de cadastro deve validar CPF e e-mail.
CA2: A lista deve carregar em menos de 2 segundos.
CA3: Edição e exclusão devem refletir no banco em tempo real.
CA4: Autenticação deve usar JWT e senhas criptografadas.

6. Tecnologias
Backend: FastAPI, Python 3.9+, PostgreSQL, SQLAlchemy
Frontend: React 18, TypeScript, Tailwind CSS
Autenticação: JWT
Deploy: Docker, Azure`
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce B2C',
    icon: ShoppingCart,
    description: 'Plataforma de vendas online com carrinho e pagamento',
    requirements: `Documento de Requisitos: Sistema E-commerce

1. Objetivo
Criar uma plataforma de e-commerce B2C para venda de produtos eletrônicos, com carrinho de compras, pagamento integrado e gestão de pedidos.

2. Requisitos Funcionais
RF1: Catálogo de produtos com busca, filtros e categorias.
RF2: Carrinho de compras persistente com cálculo de frete.
RF3: Sistema de checkout com múltiplas formas de pagamento.
RF4: Gestão de pedidos com acompanhamento de status.
RF5: Sistema de avaliações e comentários de produtos.
RF6: Painel administrativo para gestão de produtos e pedidos.
RF7: Sistema de cupons de desconto e promoções.
RF8: Wishlist (lista de desejos) para usuários cadastrados.
RF9: Sistema de recomendação de produtos baseado em histórico.
RF10: Notificações por e-mail para status de pedidos.

3. Requisitos Não-Funcionais
RNF1: Aplicação deve ser desenvolvida em Node.js (NestJS) e Next.js 14.
RNF2: Banco de dados PostgreSQL com Redis para cache.
RNF3: Integração com gateway de pagamento (Stripe/MercadoPago).
RNF4: Performance: carregamento de páginas < 3s.
RNF5: Suportar 1000 usuários simultâneos.
RNF6: SEO otimizado com SSR/SSG.
RNF7: PWA com suporte offline para catálogo.

4. Histórias de Usuário
HU1: Como cliente, quero buscar produtos por nome ou categoria.
HU2: Como cliente, quero adicionar produtos ao carrinho.
HU3: Como cliente, quero finalizar compra com cartão de crédito.
HU4: Como administrador, quero gerenciar o catálogo de produtos.
HU5: Como cliente, quero acompanhar status do meu pedido.
HU6: Como cliente, quero salvar produtos na lista de desejos.
HU7: Como administrador, quero criar cupons de desconto.

5. Critérios de Aceitação
CA1: Busca deve retornar resultados em menos de 500ms.
CA2: Carrinho deve persistir por 30 dias.
CA3: Pagamento deve ser processado de forma segura (PCI DSS).
CA4: Sistema deve enviar e-mails de confirmação.
CA5: Mobile-first com design responsivo.

6. Tecnologias
Backend: NestJS, TypeORM, PostgreSQL, Redis, Bull (filas)
Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand
Pagamento: Stripe API
E-mail: SendGrid
CDN: Cloudflare
Deploy: Vercel (frontend), Railway (backend)`
  },
  api: {
    id: 'api',
    name: 'API REST Microserviços',
    icon: Server,
    description: 'API REST com arquitetura de microserviços',
    requirements: `Documento de Requisitos: API REST de Microserviços

1. Objetivo
Desenvolver uma API REST com arquitetura de microserviços para sistema de gestão empresarial, com serviços de autenticação, usuários, produtos e pedidos.

2. Requisitos Funcionais
RF1: Serviço de autenticação com JWT e refresh tokens.
RF2: CRUD completo para usuários com níveis de permissão.
RF3: Gestão de produtos com controle de estoque.
RF4: Processamento de pedidos com fila de mensagens.
RF5: Sistema de notificações em tempo real.
RF6: API Gateway para roteamento e rate limiting.
RF7: Serviço de relatórios com geração de PDFs.
RF8: Webhook system para integrações externas.
RF9: Sistema de logs centralizados.
RF10: Health checks e monitoring endpoints.

3. Requisitos Não-Funcionais
RNF1: Arquitetura de microserviços com Docker e Kubernetes.
RNF2: Comunicação entre serviços via RabbitMQ/Kafka.
RNF3: Documentação com OpenAPI/Swagger.
RNF4: Testes automatizados com cobertura > 80%.
RNF5: Monitoramento com Prometheus e Grafana.
RNF6: Circuit breaker pattern para resiliência.
RNF7: Cache distribuído com Redis.
RNF8: Rate limiting por IP e por usuário.

4. Endpoints Principais
AUTH SERVICE:
- POST /auth/login - Autenticação
- POST /auth/refresh - Renovar token
- POST /auth/logout - Logout
- POST /auth/forgot-password - Recuperar senha

USER SERVICE:
- GET /users - Listar usuários (paginado)
- GET /users/{id} - Buscar usuário
- POST /users - Criar usuário
- PUT /users/{id} - Atualizar usuário
- DELETE /users/{id} - Deletar usuário

PRODUCT SERVICE:
- GET /products - Listar produtos
- GET /products/{id} - Buscar produto
- POST /products - Criar produto
- PUT /products/{id} - Atualizar produto
- DELETE /products/{id} - Deletar produto
- POST /products/{id}/stock - Atualizar estoque

ORDER SERVICE:
- POST /orders - Criar pedido
- GET /orders/{id} - Buscar pedido
- GET /orders/{id}/status - Status do pedido
- PUT /orders/{id}/status - Atualizar status

5. Critérios de Aceitação
CA1: APIs devem responder em menos de 200ms (p95).
CA2: Sistema deve suportar 10.000 req/s.
CA3: Disponibilidade de 99.9% (SLA).
CA4: Logs estruturados com rastreamento distribuído.
CA5: Rollback automático em caso de falhas.

6. Tecnologias
Linguagem: Go (Golang) com Gin Framework
Banco: PostgreSQL, MongoDB, Redis
Mensageria: RabbitMQ
Containers: Docker, Kubernetes
API Gateway: Kong
Observabilidade: Prometheus, Grafana, Jaeger
CI/CD: GitLab CI, ArgoCD
Testes: Testify, Mockery`
  }
}

interface CodeGenJob {
  id: string
  status: 'pending' | 'waiting_approval' | 'processing' | 'completed' | 'failed'
  repo_name: string
  template?: string
  requirements: string
  model_name: string
  created_at: Date
  updated_at?: Date
  initial_plan?: string
  final_report?: string
  error?: string
  progress?: number
}

interface CodeGenerationWidgetProps {
  apiUrl: string
  onJobCreated?: (job: CodeGenJob) => void
}

export default function CodeGenerationWidget({ 
  apiUrl, 
  onJobCreated 
}: CodeGenerationWidgetProps) {
  // Estados principais
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customRequirements, setCustomRequirements] = useState('')
  const [modelName, setModelName] = useState('gpt-4o')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobs, setJobs] = useState<CodeGenJob[]>([])
  const [activeJob, setActiveJob] = useState<CodeGenJob | null>(null)
  const [pollingJobId, setPollingJobId] = useState<string | null>(null)
  
  // Estados dos modais
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [approvalPlan, setApprovalPlan] = useState<string>('')
  const [showResultModal, setShowResultModal] = useState(false)
  const [selectedJobForView, setSelectedJobForView] = useState<CodeGenJob | null>(null)
  
  // Estados auxiliares
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  // Carregar jobs do localStorage ao montar
  useEffect(() => {
    const savedJobs = localStorage.getItem('codeGenJobs')
    if (savedJobs) {
      try {
        const parsed = JSON.parse(savedJobs)
        setJobs(parsed.map((job: any) => ({
          ...job,
          created_at: new Date(job.created_at),
          updated_at: job.updated_at ? new Date(job.updated_at) : undefined
        })))
      } catch (error) {
        console.error('Erro ao carregar histórico:', error)
      }
    }
  }, [])

  // Salvar jobs no localStorage quando mudarem
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('codeGenJobs', JSON.stringify(jobs))
    }
  }, [jobs])

  // Polling de status
  useEffect(() => {
    if (!pollingJobId) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${apiUrl}/status/${pollingJobId}`)
        const data = await response.json()

        // Mapear status do backend para o frontend
        let mappedStatus = data.status
        if (data.status === 'aguardando_aprovacao') {
          mappedStatus = 'waiting_approval'
        } else if (['iniciando_relatorio', 'lendo_codigos', 'validando_praticas', 'gerando_codigo'].includes(data.status)) {
          mappedStatus = 'processing'
        }

        // Calcular progresso baseado no status
        let progress = 10
        if (data.status === 'lendo_codigos') progress = 30
        if (data.status === 'validando_praticas') progress = 50
        if (data.status === 'gerando_codigo') progress = 70
        if (data.status === 'completed') progress = 100

        // Atualizar job na lista
        setJobs(prev => prev.map(job => 
          job.id === pollingJobId 
            ? { ...job, status: mappedStatus, progress }
            : job
        ))

        // Se aguardando aprovação, mostrar modal
        if (data.status === 'aguardando_aprovacao' && data.analysis_report) {
          setApprovalPlan(data.analysis_report)
          setShowApprovalModal(true)
          setPollingJobId(null) // Parar polling
        }

        // Se completado ou falhou, parar polling
        if (data.status === 'completed' || data.status === 'failed') {
          if (data.status === 'completed') {
            // Buscar relatório final
            const reportResponse = await fetch(`${apiUrl}/job-report/${pollingJobId}`)
            const reportData = await reportResponse.json()
            
            setJobs(prev => prev.map(job => 
              job.id === pollingJobId 
                ? { ...job, status: 'completed', final_report: reportData.report, progress: 100 }
                : job
            ))
          }
          
          setPollingJobId(null)
        }
      } catch (error) {
        console.error('Erro no polling:', error)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [pollingJobId, apiUrl])

  // Função para aplicar template
  const applyTemplate = (templateId: string) => {
    const template = CODE_TEMPLATES[templateId as keyof typeof CODE_TEMPLATES]
    if (template) {
      setSelectedTemplate(templateId)
      setCustomRequirements(template.requirements)
    }
  }

  // Função para submeter job
  const handleSubmit = async () => {
    if (!customRequirements.trim()) {
      alert('Por favor, adicione os requisitos do projeto')
      return
    }

    setIsSubmitting(true)
    
    try {
      const requestBody = {
        repo_name: "LucioFlavioRosa/projeto_refinado", // Repo padrão
        analysis_type: "geracao_codigo_a_partir_de_reuniao", // SEMPRE este tipo
        branch_name: "main",
        instrucoes_extras: customRequirements,
        usar_rag: false,
        gerar_relatorio_apenas: false,
        model_name: modelName
      }

      const response = await fetch(`${apiUrl}/start-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (data.job_id) {
        const newJob: CodeGenJob = {
          id: data.job_id,
          status: 'pending',
          repo_name: requestBody.repo_name,
          template: selectedTemplate,
          requirements: customRequirements,
          model_name: modelName,
          created_at: new Date(),
          initial_plan: data.report || data.analysis_report,
          progress: 10
        }

        setJobs(prev => [newJob, ...prev])
        setActiveJob(newJob)
        setPollingJobId(data.job_id)
        
        if (onJobCreated) {
          onJobCreated(newJob)
        }

        // Se já tem plano inicial, mostrar modal de aprovação
        if (data.report || data.analysis_report) {
          setApprovalPlan(data.report || data.analysis_report)
          setShowApprovalModal(true)
        }

        // Limpar formulário após sucesso
        setCustomRequirements('')
        setSelectedTemplate('')
      }
    } catch (error) {
      console.error('Erro ao iniciar geração:', error)
      alert('Erro ao iniciar geração de código. Verifique a conexão com o servidor.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para aprovar/rejeitar
  const handleApprovalDecision = async (action: 'approve' | 'reject') => {
    if (!activeJob) return

    try {
      const response = await fetch(`${apiUrl}/update-job-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_id: activeJob.id,
          action: action
        })
      })

      if (response.ok) {
        setShowApprovalModal(false)
        
        if (action === 'approve') {
          // Retomar polling para acompanhar progresso
          setPollingJobId(activeJob.id)
          
          setJobs(prev => prev.map(job => 
            job.id === activeJob.id 
              ? { ...job, status: 'processing', progress: 30 }
              : job
          ))
        } else {
          // Job rejeitado
          setJobs(prev => prev.map(job => 
            job.id === activeJob.id 
              ? { ...job, status: 'failed', error: 'Rejeitado pelo usuário' }
              : job
          ))
          setActiveJob(null)
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao processar decisão. Tente novamente.')
    }
  }

  // Função para copiar ID
  const copyJobId = (jobId: string) => {
    navigator.clipboard.writeText(jobId)
    setCopiedJobId(jobId)
    setTimeout(() => setCopiedJobId(null), 2000)
  }

  // Função para limpar histórico
  const clearHistory = () => {
    if (confirm('Tem certeza que deseja limpar todo o histórico de gerações?')) {
      setJobs([])
      localStorage.removeItem('codeGenJobs')
    }
  }

  // Função para download do código
  const downloadCode = (job: CodeGenJob) => {
    if (!job.final_report) return
    
    const blob = new Blob([job.final_report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `codigo-gerado-${job.template || 'custom'}-${job.id.substring(0, 8)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Função para obter ícone de status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'waiting_approval': return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'waiting_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Função para obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'failed': return 'Falhou'
      case 'processing': return 'Processando'
      case 'waiting_approval': return 'Aguardando Aprovação'
      default: return 'Pendente'
    }
  }

  // Toggle seção expandida
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Card Principal de Geração */}
      <Card className="border-gray-200 shadow-xl overflow-hidden">
        <CardHeader 
          className="text-white relative"
          style={{ background: BRAND_COLORS.gradients.primary }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <Wand2 className="w-full h-full" />
          </div>
          <CardTitle className="flex items-center gap-3 text-2xl relative z-10">
            <div className="p-2 rounded-lg" style={{ background: BRAND_COLORS.secondary }}>
              <Wand2 className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
            </div>
            <span>Geração Inteligente de Código</span>
          </CardTitle>
          <CardDescription className="text-gray-200 mt-2 relative z-10">
            Transforme requisitos em código completo usando IA multi-agentes especializada
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Templates Predefinidos */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <BookTemplate className="h-4 w-4" style={{ color: BRAND_COLORS.primary }} />
              Escolha um Template ou Crie do Zero
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(CODE_TEMPLATES).map(([key, template]) => {
                const Icon = template.icon
                const isSelected = selectedTemplate === key
                
                return (
                  <button
                    key={key}
                    className={`relative group p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected 
                        ? 'shadow-lg transform -translate-y-1' 
                        : 'hover:shadow-md hover:transform hover:-translate-y-0.5'
                    }`}
                    style={{
                      borderColor: isSelected ? BRAND_COLORS.secondary : '#e5e7eb',
                      background: isSelected 
                        ? `linear-gradient(135deg, ${BRAND_COLORS.primary}15 0%, ${BRAND_COLORS.secondary}10 100%)`
                        : 'white'
                    }}
                    onClick={() => applyTemplate(key)}
                  >
                    {isSelected && (
                      <div 
                        className="absolute top-0 right-0 w-20 h-20 opacity-20"
                        style={{ 
                          background: BRAND_COLORS.secondary,
                          clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
                        }}
                      />
                    )}
                    
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-start justify-between">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ 
                            background: isSelected ? BRAND_COLORS.secondary : `${BRAND_COLORS.primary}10`
                          }}
                        >
                          <Icon 
                            className="h-5 w-5" 
                            style={{ 
                              color: isSelected ? BRAND_COLORS.primary : BRAND_COLORS.primary 
                            }} 
                          />
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5" style={{ color: BRAND_COLORS.secondary }} />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {template.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Área de Requisitos Customizados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FileCode className="h-4 w-4" style={{ color: BRAND_COLORS.primary }} />
                Requisitos Detalhados do Projeto
              </Label>
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: customRequirements.length > 0 ? BRAND_COLORS.secondary : undefined,
                  background: customRequirements.length > 0 ? `${BRAND_COLORS.secondary}10` : undefined
                }}
              >
                {customRequirements.length} / 10000 caracteres
              </Badge>
            </div>
            
            <Textarea
              placeholder="Digite ou cole aqui os requisitos detalhados do seu projeto...

Exemplo de estrutura recomendada:
━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REQUISITOS FUNCIONAIS:
• Sistema de autenticação com JWT
• CRUD completo de produtos
• Carrinho de compras persistente
• Integração com gateway de pagamento

🔧 REQUISITOS TÉCNICOS:
• Backend: Node.js + Express
• Frontend: React + TypeScript
• Banco de dados: PostgreSQL
• Deploy: Docker + AWS

📊 REGRAS DE NEGÓCIO:
• Desconto de 10% para compras acima de R$ 500
• Frete grátis para pedidos acima de R$ 200
• Sistema de pontos de fidelidade

✅ CRITÉRIOS DE ACEITAÇÃO:
• Tempo de resposta < 2 segundos
• Cobertura de testes > 80%
• Documentação completa da API"
              value={customRequirements}
              onChange={(e) => setCustomRequirements(e.target.value)}
              className="min-h-[350px] font-mono text-sm border-2 transition-colors p-4"
              style={{ 
                borderColor: customRequirements ? BRAND_COLORS.accent : '#e5e7eb',
                background: customRequirements ? '#fafbfc' : 'white'
              }}
            />
            
            {customRequirements.length > 8000 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm">
                  Requisitos muito longos podem afetar a qualidade da geração. Considere ser mais conciso.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Configurações e Botão de Submit */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="model" className="text-sm font-medium text-gray-700">
                Modelo de IA
              </Label>
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger id="model" className="h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">GPT-4o</span>
                      <Badge variant="outline" className="text-xs ml-2">Mais Rápido</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4-turbo">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">GPT-4 Turbo</span>
                      <Badge variant="outline" className="text-xs ml-2">Balanceado</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="font-medium">GPT-4</span>
                      <Badge variant="outline" className="text-xs ml-2">Mais Preciso</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !customRequirements.trim()}
              className="h-12 px-8 font-semibold text-white shadow-lg transition-all duration-200 sm:self-end"
              style={{ 
                background: isSubmitting || !customRequirements.trim() 
                  ? '#94a3b8' 
                  : BRAND_COLORS.primary,
                opacity: isSubmitting || !customRequirements.trim() ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Preparando Geração...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  Gerar Código Agora
                </>
              )}
            </Button>
          </div>

          {/* Indicador de Processo Ativo */}
          {jobs.some(job => job.status === 'processing') && (
            <Alert 
              className="border-2 shadow-md"
              style={{ 
                borderColor: BRAND_COLORS.secondary,
                background: `linear-gradient(135deg, ${BRAND_COLORS.secondary}10 0%, white 100%)`
              }}
            >
              <AlertDescription className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: BRAND_COLORS.primary }} />
                    <div className="absolute inset-0 animate-ping">
                      <Loader2 className="h-5 w-5 opacity-30" style={{ color: BRAND_COLORS.secondary }} />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Gerando código com IA...</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Os agentes estão trabalhando no seu projeto. Isso pode levar alguns minutos.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Progress 
                    value={jobs.find(j => j.status === 'processing')?.progress || 0} 
                    className="w-32 h-2"
                  />
                  <span className="text-xs text-gray-500">
                    {jobs.find(j => j.status === 'processing')?.progress || 0}%
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card de Histórico */}
      {jobs.length > 0 && (
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <History className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <div>
                  <CardTitle className="text-lg">Histórico de Gerações</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    {jobs.length} {jobs.length === 1 ? 'geração' : 'gerações'} realizadas
                  </CardDescription>
                </div>
              </div>
              {jobs.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              <div className="p-4 space-y-3">
                {jobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`border-2 rounded-lg transition-all duration-200 overflow-hidden ${
                      job.status === 'processing' 
                        ? 'border-blue-200 bg-blue-50/50 shadow-md' 
                        : 'border-gray-200 hover:shadow-md hover:border-gray-300'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Header do Job */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {getStatusIcon(job.status)}
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                              #{job.id.substring(0, 8)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyJobId(job.id)}
                              className="h-6 px-2"
                            >
                              {copiedJobId === job.id ? (
                                <CheckCheck className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            <Badge 
                              variant="secondary"
                              className={`text-xs ${getStatusColor(job.status)}`}
                            >
                              {getStatusText(job.status)}
                            </Badge>
                            {job.template && (
                              <Badge variant="outline" className="text-xs">
                                {CODE_TEMPLATES[job.template as keyof typeof CODE_TEMPLATES]?.name}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Informações do Job */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(job.created_at).toLocaleString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" />
                              {job.model_name}
                            </div>
                          </div>
                          
                          {/* Progress Bar para jobs em processamento */}
                          {job.status === 'processing' && (
                            <div className="space-y-1">
                              <Progress 
                                value={job.progress || 0} 
                                className="h-2"
                              />
                              <p className="text-xs text-gray-600">
                                Processando... {job.progress}% concluído
                              </p>
                            </div>
                          )}
                          
                          {/* Mensagem de erro */}
                          {job.status === 'failed' && job.error && (
                            <Alert className="border-red-200 bg-red-50">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription className="text-sm text-red-800">
                                {job.error}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                        
                        {/* Ações do Job */}
                        <div className="flex gap-2">
                          {job.status === 'completed' && job.final_report && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedJobForView(job)
                                  setShowResultModal(true)
                                }}
                                className="border-2"
                                style={{ borderColor: BRAND_COLORS.accent }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Visualizar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadCode(job)}
                                className="border-2"
                                style={{ borderColor: BRAND_COLORS.secondary }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Modal de Aprovação do Plano */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader 
            className="pb-4 border-b"
            style={{ borderColor: BRAND_COLORS.accent }}
          >
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.secondary}20` }}>
                <AlertCircle className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
              </div>
              <span>Revisão do Plano de Desenvolvimento</span>
            </DialogTitle>
            <DialogDescription className="mt-2">
              Os agentes criaram um plano detalhado. Revise e aprove para iniciar a geração do código.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 my-4">
            <div className="border-2 rounded-lg p-6 bg-gray-50" style={{ borderColor: BRAND_COLORS.accent }}>
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
                {approvalPlan || 'Carregando plano...'}
              </pre>
            </div>
          </ScrollArea>
          
          <DialogFooter className="pt-4 border-t flex gap-3" style={{ borderColor: BRAND_COLORS.accent }}>
            <Button
              variant="outline"
              onClick={() => handleApprovalDecision('reject')}
              className="flex-1 sm:flex-initial border-2"
              style={{ borderColor: '#ef4444' }}
            >
              <ThumbsDown className="h-4 w-4 mr-2 text-red-500" />
              Rejeitar Plano
            </Button>
            <Button
              onClick={() => handleApprovalDecision('approve')}
              className="flex-1 sm:flex-initial text-white font-semibold shadow-lg"
              style={{ background: BRAND_COLORS.primary }}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Aprovar e Gerar Código
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização do Código Gerado */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader 
            className="pb-4 border-b"
            style={{ borderColor: BRAND_COLORS.accent }}
          >
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg" style={{ background: `${BRAND_COLORS.secondary}20` }}>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span>Código Gerado com Sucesso</span>
            </DialogTitle>
            <DialogDescription className="mt-2">
              {selectedJobForView?.template && (
                <Badge variant="outline" className="mr-2">
                  {CODE_TEMPLATES[selectedJobForView.template as keyof typeof CODE_TEMPLATES]?.name}
                </Badge>
              )}
              Job #{selectedJobForView?.id.substring(0, 8)} • {selectedJobForView?.model_name}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="code" className="flex-1 overflow-hidden mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Código Fonte
              </TabsTrigger>
              <TabsTrigger value="structure" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Estrutura
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Instruções
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 mt-4">
              <ScrollArea className="h-[450px] border-2 rounded-lg bg-gray-900 p-4">
                <pre className="text-green-400 font-mono text-xs leading-relaxed">
                  {selectedJobForView?.final_report || 'Código não disponível'}
                </pre>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="structure" className="flex-1 mt-4">
              <ScrollArea className="h-[450px] border-2 rounded-lg bg-gray-50 p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Estrutura do Projeto
                  </h3>
                  <div className="font-mono text-sm text-gray-700 space-y-2">
                    <div>📁 src/</div>
                    <div className="ml-4">📁 components/</div>
                    <div className="ml-4">📁 services/</div>
                    <div className="ml-4">📁 utils/</div>
                    <div className="ml-4">📄 index.ts</div>
                    <div>📁 tests/</div>
                    <div>📄 package.json</div>
                    <div>📄 README.md</div>
                    <div>📄 .env.example</div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="instructions" className="flex-1 mt-4">
              <ScrollArea className="h-[450px] border-2 rounded-lg bg-gray-50 p-6">
                <div className="prose prose-sm max-w-none">
                  <h3 className="font-semibold text-gray-900 mb-4">Como usar este código:</h3>
                  <ol className="space-y-3 text-gray-700">
                    <li>Faça o download do código usando o botão abaixo</li>
                    <li>Extraia os arquivos em uma pasta do seu projeto</li>
                    <li>Instale as dependências: <code className="bg-gray-200 px-2 py-1 rounded">npm install</code></li>
                    <li>Configure as variáveis de ambiente no arquivo <code>.env</code></li>
                    <li>Execute o projeto: <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code></li>
                  </ol>
                  
                  <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> O código gerado é um ponto de partida. 
                      Revise e ajuste conforme necessário para seu caso específico.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="pt-4 border-t gap-3" style={{ borderColor: BRAND_COLORS.accent }}>
            <Button
              variant="outline"
              onClick={() => setShowResultModal(false)}
            >
              Fechar
            </Button>
            <Button
              onClick={() => selectedJobForView && downloadCode(selectedJobForView)}
              className="text-white font-semibold shadow-lg"
              style={{ background: BRAND_COLORS.primary }}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar Código Completo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
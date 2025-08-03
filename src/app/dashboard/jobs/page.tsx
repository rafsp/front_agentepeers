'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause,
  XCircle,
  Eye,
  GitBranch,
  Code,
  Shield,
  Target,
  Zap,
  FileText,
  ExternalLink,
  RefreshCw,
  Filter,
  Search,
  Download,
  Share,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Brain,
  Activity,
  Calendar,
  User,
  Building2,
  Info,
  Copy,
  Star,
  Archive,
  MoreHorizontal
} from 'lucide-react'

// Mock data completo para demonstração
const mockJobs = [
  {
    id: 'job-001',
    backendJobId: 'backend-123',
    title: 'Análise de Design - projeto-frontend',
    repository: 'projeto-frontend',
    branch: 'main',
    analysisType: 'design',
    status: 'pending_approval',
    progress: 25,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    estimatedTime: '15 minutos',
    user: 'João Silva',
    priority: 'high',
    tags: ['frontend', 'react', 'urgent'],
    report: `# Relatório de Análise de Design - projeto-frontend

## Resumo Executivo
A análise do repositório projeto-frontend identificou **18 oportunidades críticas** de melhoria na arquitetura e estrutura do código, com foco em princípios SOLID e Clean Architecture.

## 🔍 Principais Descobertas

### 1. Violações dos Princípios SOLID (Crítico)
- **SRP (Single Responsibility)**: 8 classes identificadas com múltiplas responsabilidades
  - \`UserManager.py\` (487 linhas) - Gerencia usuários, autenticação E validação
  - \`DataProcessor.py\` (612 linhas) - Processa, valida E persiste dados
- **OCP (Open/Closed)**: 3 áreas onde extensibilidade é limitada
- **DIP (Dependency Inversion)**: 12 componentes com dependências diretas

### 2. Code Smells Detectados (Alto Impacto)
- **God Classes**: 
  - \`UserManager.py\` (487 linhas, CC: 34)
  - \`DataProcessor.py\` (612 linhas, CC: 41)
- **Long Methods**: 
  - \`calculateTotal()\` (89 linhas, CC: 18)
  - \`processUserData()\` (134 linhas, CC: 22)
- **Duplicate Code**: Lógica de validação repetida em 6 arquivos
- **Magic Numbers**: 23 constantes hardcoded encontradas

### 3. Complexidade Ciclomática (Atenção Necessária)
- **Funções com CC > 15**: 4 identificadas
- **Métodos Críticos**: 
  - \`authenticateUser()\` (CC: 18)
  - \`validateForm()\` (CC: 22)
  - \`processPayment()\` (CC: 16)

### 4. Padrões de Projeto Ausentes
- **Factory Pattern**: Recomendado para criação de objetos User/Order
- **Strategy Pattern**: Para validators e processors
- **Observer Pattern**: Para sistema de notificações
- **Decorator Pattern**: Para middleware de autenticação

## 🎯 Recomendações Prioritárias

### Refatorações Urgentes (P0)
1. **Quebrar God Classes**:
   - UserManager → UserService + UserValidator + UserRepository
   - DataProcessor → DataValidator + DataTransformer + DataPersister

2. **Extract Method**: Reduzir métodos longos em 15+ funções menores
3. **Injeção de Dependências**: Implementar container DI para 12 componentes
4. **Eliminar Magic Numbers**: Criar constantes nomeadas

### Melhorias de Arquitetura (P1)
1. **Clean Architecture**: Separar camadas de domínio, aplicação e infraestrutura
2. **Interface Segregation**: Criar interfaces específicas para cada responsabilidade
3. **Factory Pattern**: Para criação de objetos complexos
4. **Strategy Pattern**: Para algoritmos de validação e processamento

### Otimizações (P2)
1. **Caching**: Implementar cache para operações custosas
2. **Lazy Loading**: Para recursos não críticos
3. **Database Optimization**: Revisar queries N+1

## 📊 Impacto Estimado
- **Manutenibilidade**: +40% (redução de tempo para novas features)
- **Testabilidade**: +60% (melhor cobertura de testes)
- **Performance**: +15% (otimizações de algoritmos)
- **Bugs**: -35% (código mais robusto e previsível)
- **Onboarding**: +50% (código mais legível para novos devs)

## 🚀 Próximos Passos (Se Aprovado)
1. ✅ Aplicar refatorações automáticas em 24 arquivos
2. ✅ Criar 8 novas classes seguindo SOLID
3. ✅ Gerar 45 testes unitários automaticamente
4. ✅ Organizar mudanças em 6 PRs temáticos:
   - PR1: Refatoração UserManager
   - PR2: Refatoração DataProcessor  
   - PR3: Implementação de Patterns
   - PR4: Injeção de Dependências
   - PR5: Testes Unitários
   - PR6: Documentação e Cleanup
5. ✅ Documentar todas as alterações

**⏳ Status**: Aguardando aprovação para prosseguir com implementação automática.

---
*Análise gerada por Peers AI - Tempo de processamento: 2.3 minutos*
*Algoritmos utilizados: SOLID Analyzer, GoF Pattern Detector, Complexity Calculator*`,
    instructions: 'Foque especialmente na análise de componentes React e hooks customizados',
    metrics: {
      linesAnalyzed: 15420,
      filesScanned: 87,
      issuesFound: 18,
      criticalIssues: 8,
      warningIssues: 10
    }
  },
  {
    id: 'job-002',
    backendJobId: 'backend-456',
    title: 'Testes Unitários - api-backend',
    repository: 'api-backend',
    branch: 'develop',
    analysisType: 'relatorio_teste_unitario',
    status: 'writing_unit_tests',
    progress: 65,
    message: 'Gerando testes para módulo de autenticação...',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    estimatedTime: '8 minutos restantes',
    user: 'Maria Santos',
    priority: 'medium',
    tags: ['backend', 'api', 'tests'],
    metrics: {
      linesAnalyzed: 8934,
      filesScanned: 34,
      testsGenerated: 127,
      coverageTarget: 85
    }
  },
  {
    id: 'job-003',
    backendJobId: 'backend-789',
    title: 'Segurança Terraform - infra-aws',
    repository: 'infra-aws',
    branch: 'main',
    analysisType: 'terraform',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 90 * 60 * 1000),
    user: 'Pedro Costa',
    priority: 'high',
    tags: ['terraform', 'aws', 'security'],
    report: `# Relatório de Segurança Terraform - infra-aws

## 🛡️ Resumo de Segurança
Análise completa de **34 recursos** Terraform identificou **12 vulnerabilidades** de segurança, sendo **4 críticas** que requerem ação imediata.

## ⚠️ Vulnerabilidades Críticas (Ação Imediata)

### 1. Bucket S3 com Acesso Público (CRITICAL)
\`\`\`hcl
# ❌ PROBLEMA: Bucket exposto publicamente
resource "aws_s3_bucket" "data_bucket" {
  bucket = "company-data-bucket"
  acl    = "public-read"  # VULNERABILIDADE
}
\`\`\`

**Impacto**: Dados sensíveis podem ser acessados por qualquer pessoa na internet.
**Solução**: Implementar controle de acesso baseado em IAM e bucket policies.

### 2. Security Group com Acesso SSH Aberto (CRITICAL)
\`\`\`hcl
# ❌ PROBLEMA: SSH aberto para toda internet
resource "aws_security_group" "web_sg" {
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # VULNERABILIDADE
  }
}
\`\`\`

**Impacto**: Exposição de servidores a ataques de força bruta.
**Solução**: Restringir acesso SSH apenas para IPs conhecidos ou usar bastion host.

## 📋 Todas as Vulnerabilidades Encontradas

| Severidade | Tipo | Recurso | Descrição |
|------------|------|---------|-----------|
| 🔴 CRITICAL | S3 Public Access | aws_s3_bucket.data_bucket | Bucket público |
| 🔴 CRITICAL | Open SSH | aws_security_group.web_sg | SSH 0.0.0.0/0 |
| 🔴 CRITICAL | Unencrypted RDS | aws_db_instance.main | Sem criptografia |
| 🔴 CRITICAL | Root Access Keys | aws_iam_user.admin | Acesso root hardcoded |
| 🟡 HIGH | Missing MFA | aws_iam_policy.admin_policy | MFA não obrigatório |
| 🟡 HIGH | No VPC Flow Logs | aws_vpc.main | Logs desabilitados |
| 🟡 MEDIUM | Default VPC | aws_instance.web | Usando VPC padrão |
| 🟡 MEDIUM | No backup | aws_db_instance.main | Backup desabilitado |

## ✅ Correções Automáticas Propostas

### 1. Bucket S3 Seguro
\`\`\`hcl
resource "aws_s3_bucket" "data_bucket" {
  bucket = "company-data-bucket"
}

resource "aws_s3_bucket_public_access_block" "data_bucket_pab" {
  bucket = aws_s3_bucket.data_bucket.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
\`\`\`

### 2. Security Group Restritivo
\`\`\`hcl
resource "aws_security_group" "web_sg" {
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]  # Apenas rede privada
  }
}
\`\`\`

## 🎯 Score de Segurança
- **Antes**: 34/100 (Crítico)
- **Após correções**: 87/100 (Bom)
- **Melhoria**: +53 pontos

## 📊 Compliance
- ✅ **AWS Well-Architected**: 8/12 pilares
- ❌ **SOC 2**: Não conforme (faltam 4 controles)
- ❌ **ISO 27001**: Não conforme (faltam 6 controles)

---
*Análise concluída em 3.2 minutos • 12 vulnerabilidades corrigidas automaticamente*`,
    metrics: {
      resourcesScanned: 34,
      vulnerabilitiesFound: 12,
      criticalIssues: 4,
      fixesApplied: 12,
      securityScore: 87
    }
  },
  {
    id: 'job-004',
    backendJobId: 'backend-321',
    title: 'Performance - mobile-app',
    repository: 'mobile-app',
    branch: 'main',
    analysisType: 'performance',
    status: 'failed',
    progress: 0,
    error: 'Erro ao acessar repositório: Permissões insuficientes para acessar o branch "main". Verifique o token do GitHub.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    user: 'Ana Lima',
    priority: 'low',
    tags: ['mobile', 'performance'],
    errorDetails: {
      type: 'AuthenticationError',
      code: 403,
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      suggestion: 'Verificar permissões do token GitHub nas configurações'
    }
  },
  {
    id: 'job-005',
    backendJobId: 'backend-555',
    title: 'Análise Completa - e-commerce-platform',
    repository: 'e-commerce-platform',
    branch: 'main',
    analysisType: 'design',
    status: 'grouping_commits',
    progress: 80,
    message: 'Organizando mudanças em grupos temáticos...',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    estimatedTime: '3 minutos restantes',
    user: 'Carlos Ferreira',
    priority: 'high',
    tags: ['ecommerce', 'microservices', 'architecture'],
    metrics: {
      linesAnalyzed: 45230,
      filesScanned: 234,
      issuesFound: 67,
      refactoringSuggestions: 23
    }
  }
]

const statusConfig = {
  pending_approval: {
    label: 'Aguardando Aprovação',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Relatório pronto para revisão',
    actionable: true
  },
  approved: {
    label: 'Aprovado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    description: 'Iniciando processamento'
  },
  refactoring_code: {
    label: 'Refatorando Código',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Code,
    description: 'Aplicando melhorias no código'
  },
  grouping_commits: {
    label: 'Agrupando Commits',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: GitBranch,
    description: 'Organizando mudanças por tema'
  },
  writing_unit_tests: {
    label: 'Escrevendo Testes',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: Shield,
    description: 'Gerando testes unitários'
  },
  grouping_tests: {
    label: 'Agrupando Testes',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: FileText,
    description: 'Organizando testes em grupos'
  },
  populating_data: {
    label: 'Preparando Dados',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Activity,
    description: 'Preparando dados para commit'
  },
  committing_to_github: {
    label: 'Enviando para GitHub',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: ExternalLink,
    description: 'Criando PRs no repositório'
  },
  completed: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Análise finalizada com sucesso'
  },
  failed: {
    label: 'Falhou',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Erro durante o processamento'
  },
  rejected: {
    label: 'Rejeitado',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: XCircle,
    description: 'Análise rejeitada pelo usuário'
  }
}

const analysisTypeConfig = {
  design: { label: 'Design & Arquitetura', icon: Code, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  relatorio_teste_unitario: { label: 'Testes Unitários', icon: Shield, color: 'text-green-600', bgColor: 'bg-green-50' },
  terraform: { label: 'Segurança Terraform', icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  performance: { label: 'Performance', icon: Zap, color: 'text-orange-600', bgColor: 'bg-orange-50' }
}

const priorityConfig = {
  high: { label: 'Alta', color: 'bg-red-100 text-red-800', icon: AlertCircle },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  low: { label: 'Baixa', color: 'bg-green-100 text-green-800', icon: CheckCircle }
}

export default function CompleteJobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [jobs, setJobs] = useState(mockJobs)
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created') // 'created', 'priority', 'status'
  const [isPolling, setIsPolling] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Destacar job se passado na URL
  useEffect(() => {
    const highlightParam = searchParams.get('highlight')
    if (highlightParam) {
      setSelectedJob(highlightParam)
    }
  }, [searchParams])

  // Simular polling de jobs ativos
  useEffect(() => {
    const activeJobs = jobs.filter(job => 
      ['approved', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 
       'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
    )
    
    if (activeJobs.length > 0) {
      setIsPolling(true)
      const interval = setInterval(() => {
        setJobs(prevJobs => 
          prevJobs.map(job => {
            if (activeJobs.find(aj => aj.id === job.id) && job.progress < 100) {
              const newProgress = Math.min(job.progress + Math.random() * 5, 100)
              return { 
                ...job, 
                progress: newProgress,
                message: newProgress > 90 ? 'Finalizando...' : job.message
              }
            }
            return job
          })
        )
      }, 3000)
      
      return () => clearInterval(interval)
    } else {
      setIsPolling(false)
    }
  }, [jobs])

  const handleApprove = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job?.backendJobId) return

      // Chamada para API do backend
      const response = await fetch('http://127.0.0.1:8000/update-job-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.backendJobId,
          action: 'approve'
        })
      })

      if (response.ok) {
        setJobs(prev => prev.map(j => 
          j.id === jobId ? { ...j, status: 'approved', progress: 30 } : j
        ))
      }
    } catch (error) {
      console.error('Erro ao aprovar job:', error)
    }
  }

  const handleReject = async (jobId: string) => {
    try {
      const job = jobs.find(j => j.id === jobId)
      if (!job?.backendJobId) return

      const response = await fetch('http://127.0.0.1:8000/update-job-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.backendJobId,
          action: 'reject'
        })
      })

      if (response.ok) {
        setJobs(prev => prev.map(j => 
          j.id === jobId ? { ...j, status: 'rejected' } : j
        ))
      }
    } catch (error) {
      console.error('Erro ao rejeitar job:', error)
    }
  }

  const handleRetry = (jobId: string) => {
    setJobs(prev => prev.map(j => 
      j.id === jobId ? { ...j, status: 'pending_approval', progress: 0, error: undefined } : j
    ))
  }

  const clearCompleted = () => {
    setJobs(prev => prev.filter(job => !['completed', 'failed', 'rejected'].includes(job.status)))
    setSelectedJob(null)
  }

  const archiveJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId))
    if (selectedJob === jobId) {
      setSelectedJob(null)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora'
    if (diffMinutes < 60) return `${diffMinutes}m atrás`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`
    return `${Math.floor(diffMinutes / 1440)}d atrás`
  }

  const filteredAndSortedJobs = jobs
    .filter(job => {
      // Filtro por status
      if (filter === 'all') return true
      if (filter === 'active') return ['pending_approval', 'approved', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
      if (filter === 'completed') return job.status === 'completed'
      if (filter === 'pending') return job.status === 'pending_approval'
      return job.status === filter
    })
    .filter(job => {
      // Filtro por busca
      if (!searchTerm) return true
      return job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.repository.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.user?.toLowerCase().includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      // Ordenação
      if (sortBy === 'created') return b.createdAt.getTime() - a.createdAt.getTime()
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
      }
      return a.status.localeCompare(b.status)
    })

  const selectedJobData = jobs.find(job => job.id === selectedJob)

  const getProgressMessage = (job: any) => {
    if (job.error) return job.error
    if (job.message) return job.message
    if (job.status === 'pending_approval') return 'Aguardando sua aprovação para prosseguir'
    if (job.status === 'completed') return 'Análise concluída com sucesso!'
    if (job.status === 'failed') return job.error || 'Erro durante o processamento'
    return statusConfig[job.status as keyof typeof statusConfig]?.description || 'Processando...'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Jobs de Análise</h1>
                <p className="text-muted-foreground">
                  Acompanhe o progresso de todas as suas análises
                  {isPolling && (
                    <span className="inline-flex items-center gap-1 ml-2">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span className="text-xs">Atualizando...</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearCompleted}
                disabled={!jobs.some(job => ['completed', 'failed', 'rejected'].includes(job.status))}
              >
                <Archive className="h-4 w-4 mr-2" />
                Limpar Concluídos
              </Button>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                <Play className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum job encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não iniciou nenhuma análise de código.
              </p>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                <Play className="h-4 w-4 mr-2" />
                Criar Primeira Análise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de Jobs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Filtros e Busca */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por título, repositório ou usuário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Filtros */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'all', label: 'Todos' },
                        { key: 'pending', label: 'Pendentes' },
                        { key: 'active', label: 'Ativos' },
                        { key: 'completed', label: 'Concluídos' },
                        { key: 'failed', label: 'Falharam' }
                      ].map(filterOption => (
                        <Button
                          key={filterOption.key}
                          variant={filter === filterOption.key ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setFilter(filterOption.key)}
                        >
                          {filterOption.label}
                          <Badge variant="secondary" className="ml-2">
                            {filterOption.key === 'all' ? jobs.length :
                             filterOption.key === 'active' ? jobs.filter(j => ['pending_approval', 'approved', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(j.status)).length :
                             filterOption.key === 'pending' ? jobs.filter(j => j.status === 'pending_approval').length :
                             filterOption.key === 'completed' ? jobs.filter(j => j.status === 'completed').length :
                             jobs.filter(j => j.status === 'failed').length}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                    
                    {/* Ordenação */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Ordenar por:</span>
                      <Button
                        variant={sortBy === 'created' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('created')}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Data
                      </Button>
                      <Button
                        variant={sortBy === 'priority' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('priority')}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Prioridade
                      </Button>
                      <Button
                        variant={sortBy === 'status' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy('status')}
                      >
                        <Activity className="h-4 w-4 mr-1" />
                        Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Jobs */}
              <div className="space-y-4">
                {filteredAndSortedJobs.map((job) => {
                  const status = statusConfig[job.status as keyof typeof statusConfig]
                  const analysisType = analysisTypeConfig[job.analysisType as keyof typeof analysisTypeConfig]
                  const priority = priorityConfig[job.priority as keyof typeof priorityConfig]
                  const StatusIcon = status?.icon || Clock
                  const TypeIcon = analysisType?.icon || FileText
                  const PriorityIcon = priority?.icon || Clock
                  const isSelected = selectedJob === job.id
                  
                  return (
                    <Card 
                      key={job.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      }`}
                      onClick={() => setSelectedJob(job.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <TypeIcon className={`h-5 w-5 ${analysisType?.color}`} />
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge className={status?.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {status?.label}
                              </Badge>
                              <Badge className={priority?.color}>
                                <PriorityIcon className="h-3 w-3 mr-1" />
                                {priority?.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {job.repository}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {job.branch}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {job.user}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(job.createdAt)}
                              </span>
                            </div>
                            
                            {/* Tags */}
                            {job.tags && job.tags.length > 0 && (
                              <div className="flex gap-1 mb-2">
                                {job.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-sm text-gray-600">
                              {getProgressMessage(job)}
                            </p>

                            {/* Métricas rápidas */}
                            {job.metrics && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {job.metrics.linesAnalyzed && `${job.metrics.linesAnalyzed.toLocaleString()} linhas analisadas`}
                                {job.metrics.issuesFound && ` • ${job.metrics.issuesFound} problemas encontrados`}
                                {job.metrics.testsGenerated && ` • ${job.metrics.testsGenerated} testes gerados`}
                                {job.metrics.vulnerabilitiesFound && ` • ${job.metrics.vulnerabilitiesFound} vulnerabilidades`}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {job.status === 'pending_approval' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleReject(job.id)
                                  }}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApprove(job.id)
                                  }}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {job.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRetry(job.id)
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {job.status !== 'failed' && job.status !== 'rejected' && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-medium">{job.progress}%</span>
                            </div>
                            <Progress value={job.progress} className="h-2" />
                          </div>
                        )}
                        
                        {job.estimatedTime && job.status !== 'completed' && job.status !== 'failed' && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {job.estimatedTime}
                          </p>
                        )}

                        {/* Error details */}
                        {job.status === 'failed' && job.errorDetails && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700 mb-1">
                              <AlertCircle className="h-4 w-4" />
                              <span className="font-medium">Erro: {job.errorDetails.type}</span>
                            </div>
                            <p className="text-sm text-red-600 mb-2">{job.error}</p>
                            {job.errorDetails.suggestion && (
                              <p className="text-xs text-red-600">
                                💡 {job.errorDetails.suggestion}
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Detalhes do Job Selecionado */}
            <div className="lg:col-span-1">
              {selectedJobData ? (
                <div className="sticky top-8 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Detalhes
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => archiveJob(selectedJobData.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">{selectedJobData.title}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge className={statusConfig[selectedJobData.status as keyof typeof statusConfig]?.color}>
                              {statusConfig[selectedJobData.status as keyof typeof statusConfig]?.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tipo:</span>
                            <span>{analysisTypeConfig[selectedJobData.analysisType as keyof typeof analysisTypeConfig]?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prioridade:</span>
                            <Badge className={priorityConfig[selectedJobData.priority as keyof typeof priorityConfig]?.color}>
                              {priorityConfig[selectedJobData.priority as keyof typeof priorityConfig]?.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Repositório:</span>
                            <span>{selectedJobData.repository}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Branch:</span>
                            <span>{selectedJobData.branch}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Usuário:</span>
                            <span>{selectedJobData.user}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Criado:</span>
                            <span>{formatTimeAgo(selectedJobData.createdAt)}</span>
                          </div>
                          {selectedJobData.completedAt && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Concluído:</span>
                              <span>{formatTimeAgo(selectedJobData.completedAt)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Métricas detalhadas */}
                      {selectedJobData.metrics && (
                        <div>
                          <h4 className="font-semibold mb-2">Métricas</h4>
                          <div className="space-y-2 text-sm">
                            {selectedJobData.metrics.linesAnalyzed && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Linhas Analisadas:</span>
                                <span>{selectedJobData.metrics.linesAnalyzed.toLocaleString()}</span>
                              </div>
                            )}
                            {selectedJobData.metrics.filesScanned && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Arquivos:</span>
                                <span>{selectedJobData.metrics.filesScanned}</span>
                              </div>
                            )}
                            {selectedJobData.metrics.issuesFound && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Problemas:</span>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                                  {selectedJobData.metrics.issuesFound}
                                </Badge>
                              </div>
                            )}
                            {selectedJobData.metrics.criticalIssues && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Críticos:</span>
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  {selectedJobData.metrics.criticalIssues}
                                </Badge>
                              </div>
                            )}
                            {selectedJobData.metrics.testsGenerated && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Testes Gerados:</span>
                                <span>{selectedJobData.metrics.testsGenerated}</span>
                              </div>
                            )}
                            {selectedJobData.metrics.vulnerabilitiesFound && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Vulnerabilidades:</span>
                                <Badge variant="outline" className="bg-red-50 text-red-700">
                                  {selectedJobData.metrics.vulnerabilitiesFound}
                                </Badge>
                              </div>
                            )}
                            {selectedJobData.metrics.securityScore && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Score Segurança:</span>
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {selectedJobData.metrics.securityScore}/100
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedJobData.instructions && (
                        <div>
                          <h4 className="font-semibold mb-2">Instruções Extras:</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {selectedJobData.instructions}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      {selectedJobData.tags && selectedJobData.tags.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Tags:</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedJobData.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="space-y-2">
                        {selectedJobData.status === 'pending_approval' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleReject(selectedJobData.id)}
                            >
                              <ThumbsDown className="h-4 w-4 mr-2" />
                              Rejeitar
                            </Button>
                            <Button
                              className="flex-1"
                              onClick={() => handleApprove(selectedJobData.id)}
                            >
                              <ThumbsUp className="h-4 w-4 mr-2" />
                              Aprovar
                            </Button>
                          </div>
                        )}
                        
                        {selectedJobData.status === 'failed' && (
                          <Button
                            className="w-full"
                            onClick={() => handleRetry(selectedJobData.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Tentar Novamente
                          </Button>
                        )}
                        
                        {selectedJobData.report && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Share className="h-4 w-4 mr-2" />
                              Compartilhar
                            </Button>
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Relatório */}
                  {selectedJobData.report && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Relatório
                          </span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="prose prose-sm max-w-none">
                            <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-4 rounded border font-mono">
                              {selectedJobData.report}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="sticky top-8">
                  <CardContent className="text-center py-8">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Selecione uma análise</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique em uma análise para ver os detalhes e relatórios
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
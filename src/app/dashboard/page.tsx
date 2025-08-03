'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth/auth-context'
import { 
  LogOut, 
  Plus, 
  Clock, 
  CheckCircle, 
  Play, 
  BarChart3,
  Code,
  Shield,
  Target,
  Github,
  Building2,
  Settings,
  Calendar,
  Activity,
  Brain,
  ArrowRight,
  ExternalLink,
  Bell,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

// Mock data
const mockJobs = [
  {
    id: '1',
    title: 'Análise de Design - projeto-frontend',
    status: 'completed',
    progress: 100,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'design',
    repository: 'projeto-frontend'
  },
  {
    id: '2', 
    title: 'Testes Unitários - api-backend',
    status: 'running',
    progress: 65,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    type: 'relatorio_teste_unitario',
    repository: 'api-backend'
  },
  {
    id: '3',
    title: 'Segurança Terraform - infra-aws',
    status: 'pending_approval',
    progress: 25,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    type: 'terraform',
    repository: 'infra-aws'
  }
]

export default function ChatGPTStyleDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [jobs] = useState(mockJobs)

  // Estatísticas
  const stats = [
    {
      title: 'Análises Concluídas',
      value: '127',
      change: '+12%',
      icon: CheckCircle,
    },
    {
      title: 'Em Andamento',
      value: '3',
      change: 'Ativo',
      icon: Activity,
    },
    {
      title: 'Repositórios',
      value: '24',
      change: '+2 novos',
      icon: Github,
    },
    {
      title: 'Economia de Tempo',
      value: '48h',
      change: 'Este mês',
      icon: TrendingUp,
    },
  ]

  const analysisTypes = [
    {
      type: 'design',
      title: 'Análise de Design',
      description: 'Auditoria de arquitetura e qualidade',
      icon: Code,
      count: jobs.filter(j => j.type === 'design').length
    },
    {
      type: 'relatorio_teste_unitario',
      title: 'Testes Unitários',
      description: 'Geração automática de testes',
      icon: Shield,
      count: jobs.filter(j => j.type === 'relatorio_teste_unitario').length
    },
    {
      type: 'terraform',
      title: 'Segurança Terraform',
      description: 'Análise de segurança para IaC',
      icon: Target,
      count: jobs.filter(j => j.type === 'terraform').length
    }
  ]

  const getStatusBadge = (status: string) => {
    const configs = {
      'completed': { class: 'status-success', label: 'Concluído' },
      'running': { class: 'status-info', label: 'Em Andamento' },
      'pending_approval': { class: 'status-warning', label: 'Aguardando Aprovação' },
      'failed': { class: 'status-error', label: 'Falhou' }
    }
    return configs[status as keyof typeof configs] || { class: 'status-neutral', label: status }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) return `${diffMinutes}m atrás`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`
    return `${Math.floor(diffMinutes / 1440)}d atrás`
  }

  return (
    <div className="min-h-screen main-bg">
      {/* Header estilo ChatGPT */}
      <header className="header-bg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#10a37f] rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl heading-primary font-semibold">Peers AI</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-4 w-4 text-gray-600" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium heading-primary">{user?.name}</p>
                  <p className="text-xs text-secondary">{user?.email}</p>
                </div>
                {user?.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </div>
              
              <button 
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold heading-primary mb-2">
            Bem-vindo de volta, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-secondary">
            Aqui está um resumo das suas análises de código
          </p>
        </div>

        {/* Stats Grid - Estilo ChatGPT */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="chatgpt-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary">{stat.title}</p>
                    <p className="text-2xl font-semibold heading-primary mt-1">{stat.value}</p>
                    <p className="text-sm mt-1 text-[#10a37f]">{stat.change}</p>
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions - Estilo ChatGPT */}
            <div className="chatgpt-card">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold heading-primary">Iniciar Nova Análise</h3>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {analysisTypes.map((analysis) => {
                    const Icon = analysis.icon
                    return (
                      <div
                        key={analysis.type}
                        className="p-4 border border-gray-200 rounded-lg hover:border-[#10a37f] hover:bg-gray-50 cursor-pointer transition-all group"
                        onClick={() => router.push(`/dashboard/new-analysis?type=${analysis.type}`)}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-[#10a37f] group-hover:text-white transition-colors">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-medium heading-primary">{analysis.title}</h4>
                            <p className="text-xs text-secondary">{analysis.count} análises</p>
                          </div>
                        </div>
                        <p className="text-sm text-secondary mb-3">{analysis.description}</p>
                        <button className="chatgpt-button text-sm w-full">
                          <Plus className="h-4 w-4 mr-2 inline" />
                          Iniciar
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Recent Jobs - Estilo ChatGPT */}
            <div className="chatgpt-card">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold heading-primary">Análises Recentes</h3>
                <button 
                  onClick={() => router.push('/dashboard/jobs')}
                  className="text-sm text-[#10a37f] hover:underline flex items-center"
                >
                  Ver todas
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {jobs.map((job, index) => {
                    const statusConfig = getStatusBadge(job.status)
                    return (
                      <div key={job.id} className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${index !== jobs.length - 1 ? 'border-b border-gray-200' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium heading-primary">{job.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-sm text-secondary">
                              {job.repository} • {formatTimeAgo(job.createdAt)}
                            </p>
                            {job.status === 'running' && (
                              <div className="mt-3 max-w-xs">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-secondary">Progresso</span>
                                  <span className="font-medium">{job.progress}%</span>
                                </div>
                                <div className="progress-bar h-2">
                                  <div 
                                    className="progress-fill" 
                                    style={{ width: `${job.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => router.push(`/dashboard/jobs?highlight=${job.id}`)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Estilo ChatGPT */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="chatgpt-card">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold heading-primary">Resumo</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">GitHub conectado</span>
                  <span className="status-success px-2 py-1 rounded-full text-xs font-medium">Ativo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Análises agendadas</span>
                  <span className="status-info px-2 py-1 rounded-full text-xs font-medium">2 ativas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary">Políticas</span>
                  <span className="status-neutral px-2 py-1 rounded-full text-xs font-medium">3 carregadas</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="chatgpt-card">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold heading-primary">Ações Rápidas</h3>
              </div>
              <div className="p-6 space-y-2">
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <Settings className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm text-secondary">Configurações</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/settings/github')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <Github className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm text-secondary">Repositórios</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/settings/scheduled')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <Calendar className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm text-secondary">Análises Agendadas</span>
                </button>
                <button 
                  onClick={() => router.push('/dashboard/jobs')}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                >
                  <BarChart3 className="h-4 w-4 mr-3 text-gray-600" />
                  <span className="text-sm text-secondary">Relatórios</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="chatgpt-card">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold heading-primary">Status do Sistema</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">API Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#10a37f] rounded-full"></div>
                      <span className="text-sm font-medium heading-primary">Operacional</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Tempo de Resposta</span>
                    <span className="text-sm font-medium heading-primary">245ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary">Uptime</span>
                    <span className="text-sm font-medium heading-primary">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
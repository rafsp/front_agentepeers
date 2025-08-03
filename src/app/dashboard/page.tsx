'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  FileText, 
  Activity, 
  Settings, 
  Github, 
  BarChart3,
  Code2,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Folder,
  Zap
} from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useCompanyStore } from '@/stores/company-store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const router = useRouter()
  const { jobs } = useJobStore()
  const { githubToken } = useCompanyStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const jobsList = Object.values(jobs)
  const runningJobs = jobsList.filter(job => 
    ['running', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests', 'populating_data', 'committing_to_github'].includes(job.status)
  )
  const completedJobs = jobsList.filter(job => job.status === 'completed')
  const pendingJobs = jobsList.filter(job => job.status === 'pending_approval')

  const stats = [
    {
      label: 'Análises Executando',
      value: runningJobs.length,
      icon: Activity,
      color: 'blue',
      description: 'Em andamento agora'
    },
    {
      label: 'Relatórios Gerados',
      value: completedJobs.length,
      icon: FileText,
      color: 'green',
      description: 'Prontos para visualização'
    },
    {
      label: 'Aguardando Aprovação',
      value: pendingJobs.length,
      icon: AlertCircle,
      color: 'amber',
      description: 'Necessitam sua decisão'
    },
    {
      label: 'Total de Jobs',
      value: jobsList.length,
      icon: BarChart3,
      color: 'purple',
      description: 'Histórico completo'
    }
  ]

  const quickActions = [
    {
      title: 'Nova Análise',
      description: 'Inicie uma análise de código em seus repositórios',
      icon: Code2,
      color: 'blue',
      href: '/dashboard/new-analysis'
    },
    {
      title: 'Jobs Ativos',
      description: 'Acompanhe o progresso das análises',
      icon: Activity,
      color: 'green',
      href: '/dashboard/jobs',
      badge: runningJobs.length > 0 ? `${runningJobs.length}` : null
    },
    {
      title: 'Relatórios',
      description: 'Visualize e baixe relatórios concluídos',
      icon: FileText,
      color: 'purple',
      href: '/dashboard/reports',
      badge: completedJobs.length > 0 ? `${completedJobs.length}` : null
    },
    {
      title: 'Configurações',
      description: 'Configure integrações e automações',
      icon: Settings,
      color: 'gray',
      href: '/dashboard/settings'
    }
  ]

  const getStatColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      amber: 'text-amber-600 bg-amber-50 border-amber-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getActionColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      gray: 'bg-gray-500 hover:bg-gray-600'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="main-container">
      {/* Header */}
      <header className="page-header">
        <div className="content-container !py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Bem-vindo à sua plataforma de análise de código com IA
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-lg font-mono text-gray-700">
                {currentTime.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="content-container">
        {/* Status do GitHub */}
        {!githubToken && (
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Github className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Configure sua integração com o GitHub
                  </h3>
                  <p className="text-amber-700 text-sm">
                    Para começar a usar a plataforma, você precisa configurar seu token do GitHub
                  </p>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard/settings/github')}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Configurar Agora
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="card-modern hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl border ${getStatColor(stat.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {stat.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {stat.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Card 
                  key={index} 
                  className="card-modern card-interactive group"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl text-white transition-colors duration-200 ${getActionColor(action.color)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {action.badge && (
                        <Badge className="bg-red-500 text-white">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Jobs Recentes */}
        {jobsList.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Jobs Recentes</h2>
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/jobs')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Ver Todos
              </Button>
            </div>
            
            <div className="space-y-4">
              {jobsList.slice(0, 5).map((job) => {
                const getStatusColor = (status: string) => {
                  if (['completed'].includes(status)) return 'badge-success'
                  if (['failed', 'rejected'].includes(status)) return 'badge-error'
                  if (['pending_approval'].includes(status)) return 'badge-warning'
                  return 'badge-info'
                }

                const getStatusIcon = (status: string) => {
                  if (['completed'].includes(status)) return CheckCircle
                  if (['failed', 'rejected'].includes(status)) return AlertCircle
                  if (['pending_approval'].includes(status)) return Clock
                  return Activity
                }

                const StatusIcon = getStatusIcon(job.status)
                
                return (
                  <Card key={job.id} className="card-modern">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <StatusIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {job.repository}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {formatDistanceToNow(job.createdAt, { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(job.status)}>
                            {job.status === 'completed' && 'Concluído'}
                            {job.status === 'running' && 'Executando'}
                            {job.status === 'pending_approval' && 'Aguardando'}
                            {job.status === 'failed' && 'Falhou'}
                            {job.status === 'rejected' && 'Rejeitado'}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/dashboard/jobs?job=${job.id}`)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {jobsList.length === 0 && githubToken && (
          <Card className="card-modern">
            <CardContent className="empty-state">
              <div className="empty-state-icon">
                <Zap className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="empty-state-title">
                Pronto para começar!
              </h3>
              <p className="empty-state-description mb-6">
                Sua plataforma está configurada. Inicie sua primeira análise de código
                selecionando um repositório do GitHub.
              </p>
              <Button 
                onClick={() => router.push('/dashboard/new-analysis')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                <Code2 className="h-4 w-4 mr-2" />
                Criar Primeira Análise
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
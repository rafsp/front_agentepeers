'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  LogOut, 
  Plus, 
  Activity, 
  FileText, 
  Clock, 
  CheckCircle, 
  Play, 
  BarChart3,
  Calendar,
  Settings,
  Github,
  Building2,
  Upload
} from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useScheduledAnalysisStats } from '@/stores/scheduled-analysis-store'
import { useCompanyStore } from '@/stores/company-store'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, githubToken } = useAuth()
  const { jobs } = useJobStore()
  const scheduledStats = useScheduledAnalysisStats()
  const { policies, activePolicyId } = useCompanyStore()

  const jobsList = Object.values(jobs || {})
  const runningJobs = jobsList.filter(job => job.status === 'running')
  const completedJobs = jobsList.filter(job => job.status === 'completed')
  const pendingJobs = jobsList.filter(job => job.status === 'pending')

  // Recent jobs (últimos 5)
  const recentJobs = jobsList
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    {
      title: 'Jobs Ativos',
      value: runningJobs.length,
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Concluídos',
      value: completedJobs.length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pendentes',
      value: pendingJobs.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Total',
      value: jobsList.length,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Peers - AI Code Analysis Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user?.name || 'Usuario'}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo à plataforma de análise de código com IA. Acompanhe suas análises e visualize relatórios.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/new-analysis')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Nova Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Inicie uma nova análise de código em seus repositórios
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/jobs')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Jobs Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Acompanhe o progresso das análises em andamento
              </p>
              {runningJobs.length > 0 && (
                <Badge variant="default" className="mt-2">
                  {runningJobs.length} executando
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/reports')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize e baixe relatórios de análises concluídas
              </p>
              {completedJobs.length > 0 && (
                <Badge variant="success" className="mt-2">
                  {completedJobs.length} disponíveis
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration & Automation Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Configurações</h3>
            
            {/* GitHub Integration */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/settings/github')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-gray-800" />
                  Integração GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure seu token do GitHub para acessar repositórios
                </p>
                <Badge variant={githubToken ? 'success' : 'secondary'}>
                  {githubToken ? 'Conectado' : 'Não configurado'}
                </Badge>
              </CardContent>
            </Card>

            {/* Company Policies */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/settings')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Políticas da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure políticas específicas da sua empresa
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {policies.length} políticas
                  </Badge>
                  {activePolicyId && (
                    <Badge variant="success" className="text-xs">
                      Ativa
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/settings')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configurações da empresa, logo e preferências
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Automation */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Automação</h3>
            
            {/* Scheduled Analyses */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/settings/scheduled')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Análises Agendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Configure análises automáticas para seus repositórios
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {scheduledStats.total} total
                  </Badge>
                  <Badge variant="success">
                    {scheduledStats.active} ativas
                  </Badge>
                  {scheduledStats.due > 0 && (
                    <Badge variant="warning">
                      {scheduledStats.due} pendentes
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Scheduled Analysis */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/dashboard/settings/scheduled')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  Nova Análise Agendada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure uma nova análise automática recorrente
                </p>
              </CardContent>
            </Card>

            {/* Next Scheduled */}
            {scheduledStats.nextDue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    Próxima Execução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-1">{scheduledStats.nextDue.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(scheduledStats.nextDue.nextRun).toLocaleDateString('pt-BR')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Atividade Recente</CardTitle>
            {jobsList.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/dashboard/jobs')}
              >
                Ver Todos
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Nenhuma atividade recente. Inicie sua primeira análise!
                </p>
                <Button onClick={() => router.push('/dashboard/new-analysis')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Análise
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{job.title}</h4>
                        <Badge 
                          variant={
                            job.status === 'completed' ? 'success' :
                            job.status === 'running' ? 'default' :
                            job.status === 'failed' ? 'destructive' : 'warning'
                          }
                        >
                          {job.status === 'completed' ? 'Concluído' :
                           job.status === 'running' ? 'Executando' :
                           job.status === 'failed' ? 'Falhou' : 'Pendente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {job.repository} • {job.analysisType}
                      </p>
                      {job.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <Progress value={job.progress || 0} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">
                            {job.progress || 0}%
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {job.status === 'completed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/reports/${job.id}`)}
                        >
                          Ver Relatório
                        </Button>
                      )}
                      {job.status === 'running' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push('/dashboard/jobs')}
                        >
                          Acompanhar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
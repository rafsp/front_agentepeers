// src/app/dashboard/page.tsx - VERSÃO CORRIGIDA

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Activity, 
  CheckCircle, 
  Clock, 
  Play,
  BarChart3,
  Settings,
  Zap,
  FileText,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { ConnectivityStatus } from '@/components/connectivity-status'
import { formatJobDate } from '@/lib/utils/date-utils'
import { 
  useJobs, 
  useJobStatistics, 
  useRecentJobs, 
  useActiveJobs 
} from '@/hooks/use-jobs'
import { backendService, type BackendSystemInfo } from '@/lib/services/backend-service'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Hooks customizados
  const { jobsList, isConnected, testConnection } = useJobs()
  const jobStats = useJobStatistics()
  const recentJobs = useRecentJobs(5)
  const { activeJobs, hasActiveJobs, pendingApproval, running } = useActiveJobs()
  
  // Estados locais
  const [systemInfo, setSystemInfo] = useState<BackendSystemInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Carregar dados do sistema
  useEffect(() => {
    const loadSystemData = async () => {
      try {
        setIsLoading(true)
        
        // Testar conectividade primeiro
        await testConnection()
        
        // Carregar informações do sistema
        const info = await backendService.getSystemInfo()
        setSystemInfo(info)
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSystemData()
  }, [testConnection])

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'pending_approval': AlertCircle,
      'running': Play,
      'analyzing_code': Activity,
      'ready_for_commit': CheckCircle,
      'completed': CheckCircle,
      'failed': AlertCircle,
      'rejected': AlertCircle,
    }
    return icons[status] || Clock
  }

  const getStatusColor = (status: string): 'default' | 'success' | 'warning' | 'destructive' => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      'pending_approval': 'warning',
      'running': 'default',
      'analyzing_code': 'default',
      'ready_for_commit': 'success',
      'completed': 'success',
      'failed': 'destructive',
      'rejected': 'destructive',
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending_approval': 'Aguardando Aprovação',
      'running': 'Executando',
      'analyzing_code': 'Analisando Código',
      'ready_for_commit': 'Pronto para Commit',
      'completed': 'Concluído',
      'failed': 'Falhou',
      'rejected': 'Rejeitado',
    }
    return labels[status] || status
  }

  // Estatísticas para os cards principais
  const stats = [
    {
      title: 'Jobs Ativos',
      value: running.length,
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: hasActiveJobs ? 'Em execução' : 'Nenhum ativo'
    },
    {
      title: 'Concluídos',
      value: jobStats.byStatus['completed'] || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: `${jobStats.successRate.toFixed(1)}% sucesso`
    },
    {
      title: 'Aguardando',
      value: pendingApproval.length,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      trend: pendingApproval.length > 0 ? 'Requer ação' : 'Nenhum pendente'
    },
    {
      title: 'Total',
      value: jobStats.total,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'Todas análises'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Bem-vindo de volta, {user?.name || 'Usuário'}!
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Análise
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status de conectividade */}
        <ConnectivityStatus className="mb-6" />

        {/* Sistema Info */}
        {systemInfo && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Sistema v{systemInfo.version}</span>
                  </div>
                  <Badge variant={systemInfo.agentes_disponivel ? "default" : "warning"}>
                    {systemInfo.agentes_disponivel ? "Agentes Ativos" : "Modo Simulado"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {systemInfo.total_analysis_types} tipos de análise disponíveis
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.trend}
                      </p>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Jobs Recentes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Jobs Recentes</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard/jobs')}
                  >
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum job ainda</h3>
                    <p className="text-muted-foreground mb-4">
                      Comece criando sua primeira análise de código.
                    </p>
                    <Button onClick={() => router.push('/dashboard/new-analysis')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Primeira Análise
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentJobs.map((job) => {
                      const StatusIcon = getStatusIcon(job.status)
                      return (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{job.title}</span>
                                <Badge variant={getStatusColor(job.status)}>
                                  {getStatusLabel(job.status)}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {job.repository} • {formatJobDate(job.createdAt)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {(['running', 'analyzing_code'].includes(job.status)) && job.progress && (
                              <div className="flex items-center gap-2 min-w-24">
                                <Progress value={job.progress} className="w-16 h-2" />
                                <span className="text-xs text-muted-foreground">
                                  {job.progress}%
                                </span>
                              </div>
                            )}
                            {job.status === 'ready_for_commit' && (
                              <Badge variant="default">
                                <Zap className="h-3 w-3 mr-1" />
                                Pronto
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estatísticas por Categoria */}
            {jobStats.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Análises por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(jobStats.byCategory).map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/new-analysis')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Análise
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/jobs')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ver Todos os Jobs
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/reports')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </CardContent>
            </Card>

            {/* Status do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Backend</span>
                    <Badge variant={isConnected ? "default" : "destructive"}>
                      {isConnected ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Agentes IA</span>
                    <Badge variant={systemInfo?.agentes_disponivel ? "default" : "warning"}>
                      {systemInfo?.agentes_disponivel ? "Ativo" : "Simulado"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Sucesso</span>
                    <span className="font-medium">
                      {jobStats.successRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
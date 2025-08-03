'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Activity, 
  FileText, 
  Clock, 
  CheckCircle, 
  Play, 
  BarChart3,
  Settings,
  Github,
  Building2,
  Calendar,
  TrendingUp,
  Zap,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  // Dados mockados - substituir pelos reais depois
  const stats = [
    {
      title: 'Jobs Ativos',
      value: 0,
      icon: Play,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Concluídos',
      value: 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      title: 'Pendentes',
      value: 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      title: 'Total',
      value: 0,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ]

  return (
    <div className="h-full">
      {/* Header com gradiente sutil */}
      <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Bem-vindo, Usuário! Acompanhe suas análises e visualize relatórios.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards - Design melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className={`border-2 ${stat.borderColor} hover:shadow-lg transition-all duration-200 bg-white`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${stat.bgColor} shadow-sm`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions - Layout em grid melhorado */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Nova Análise - Destaque principal */}
          <Card className="lg:col-span-1 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => router.push('/dashboard/new-analysis')}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="p-2 bg-blue-500 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                Nova Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-800">
                Inicie uma nova análise de código para seu repositório
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 group-hover:scale-105 transition-transform">
                <Zap className="h-4 w-4 mr-2" />
                Começar Análise
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Jobs Ativos */}
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200"
                onClick={() => router.push('/dashboard/jobs')}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-green-500 rounded-lg shadow-sm">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Jobs Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Nenhuma análise em execução
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-gray-50">
                  0 ativas
                </Badge>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          {/* Relatórios */}
          <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200"
                onClick={() => router.push('/dashboard/reports')}>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Relatórios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Nenhum relatório ainda
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-gray-50">
                  0 concluídos
                </Badge>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section inferior - Configurações e Atividade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Atividade Recente */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-gray-700" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma atividade recente</h3>
                <p className="text-gray-500">
                  Suas análises aparecerão aqui quando iniciadas
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuração Rápida */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-gray-700" />
                Configuração Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* GitHub Status */}
              <div className="flex items-center justify-between p-4 border-2 border-orange-200 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Github className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">GitHub</p>
                    <p className="text-sm text-gray-600">Não configurado</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  onClick={() => router.push('/dashboard/settings/github')}
                >
                  Configurar
                </Button>
              </div>

              {/* Políticas da Empresa */}
              <div className="flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Políticas da Empresa</p>
                    <p className="text-sm text-gray-600">Nenhuma política configurada</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  Gerenciar
                </Button>
              </div>

              {/* Análises Agendadas */}
              <div className="flex items-center justify-between p-4 border-2 border-purple-200 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Análises Agendadas</p>
                    <p className="text-sm text-gray-600">0 análises ativas</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
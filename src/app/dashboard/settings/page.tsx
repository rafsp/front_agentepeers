'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Github, 
  Building2, 
  Zap, 
  Clock,
  Shield,
  Database,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings as SettingsIcon
} from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { useCompanyStore } from '@/stores/company-store'

export default function SettingsPage() {
  const router = useRouter()
  const { githubToken } = useCompanyStore()

  const integrations = [
    {
      title: 'GitHub',
      description: 'Configure seu token do GitHub para acessar repositórios',
      icon: Github,
      connected: !!githubToken,
      href: '/dashboard/settings/github',
      color: 'gray'
    },
    {
      title: 'Webhook Automático',
      description: 'Configure webhooks para análises automáticas',
      icon: Zap,
      connected: false,
      href: '/dashboard/settings/webhooks',
      color: 'yellow'
    },
    {
      title: 'Agendamentos',
      description: 'Configure análises automáticas por agenda',
      icon: Clock,
      connected: false,
      href: '/dashboard/settings/schedule',
      color: 'blue'
    }
  ]

  const systemSettings = [
    {
      title: 'Configurações da Empresa',
      description: 'Informações básicas, logo e preferências',
      icon: Building2,
      href: '/dashboard/settings/company',
      color: 'purple'
    },
    {
      title: 'Segurança',
      description: 'Tokens, permissões e auditoria',
      icon: Shield,
      href: '/dashboard/settings/security',
      color: 'red'
    },
    {
      title: 'Base de Dados',
      description: 'Backup, exportação e limpeza',
      icon: Database,
      href: '/dashboard/settings/database',
      color: 'green'
    }
  ]

  const getIconColor = (color: string, connected?: boolean) => {
    if (connected === false) return 'text-gray-400 bg-gray-100'
    if (connected === true) return 'text-green-600 bg-green-100'
    
    const colors = {
      gray: 'text-gray-600 bg-gray-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      red: 'text-red-600 bg-red-100',
      green: 'text-green-600 bg-green-100'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getStatusBadge = (connected: boolean) => {
    return connected ? (
      <Badge className="bg-green-100 text-green-700 border-green-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Conectado
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Não configurado
      </Badge>
    )
  }

  return (
    <DashboardLayout
      title="Configurações"
      subtitle="Configure sua empresa, integrações e análises automáticas"
      showBackButton
    >
      <div className="content-container">
        {/* Integrações */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Integrações</h2>
              <p className="text-sm text-gray-600">Configure suas integrações externas</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {integrations.map((integration, index) => {
              const Icon = integration.icon
              return (
                <Card 
                  key={index}
                  className="card-modern card-interactive group"
                  onClick={() => router.push(integration.href)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl ${getIconColor(integration.color, integration.connected)}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {getStatusBadge(integration.connected)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {integration.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {integration.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      {integration.connected ? 'Configurar' : 'Conectar'}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Configurações do Sistema */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <SettingsIcon className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sistema</h2>
              <p className="text-sm text-gray-600">Configurações gerais da plataforma</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {systemSettings.map((setting, index) => {
              const Icon = setting.icon
              return (
                <Card 
                  key={index}
                  className="card-modern card-interactive group"
                  onClick={() => router.push(setting.href)}
                >
                  <CardHeader className="pb-3">
                    <div className={`p-3 rounded-xl w-fit ${getIconColor(setting.color)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {setting.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {setting.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      Configurar
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Status geral */}
        <section className="mt-10">
          <Card className="border-2 border-dashed border-gray-200 bg-gray-50/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SettingsIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Configuração da Plataforma
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Configure todas as integrações necessárias para aproveitar ao máximo 
                a análise de código com IA multi-agentes.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  {githubToken ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  )}
                  <span className="text-sm text-gray-700">GitHub</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-gray-700">Webhooks</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-gray-700">Agendamentos</span>
                </div>
              </div>
              
              {!githubToken && (
                <Button 
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push('/dashboard/settings/github')}
                >
                  Começar Configuração
                </Button>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  )
}
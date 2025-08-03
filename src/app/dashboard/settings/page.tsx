'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from '@/components/ui/file-upload'
import { Badge } from '@/components/ui/badge'

import { 
  ArrowLeft, 
  Building2, 
  Upload, 
  Settings, 
  Trash2, 
  Github,
  Calendar,
  ExternalLink,
  FileText,
  CheckCircle,
  User,
  Bell,
  Shield,
  Code,
  Database,
  Webhook,
  ChevronRight,
  Users
} from 'lucide-react'
import { useCompanyStore } from '@/stores/company-store'
import { useAuth } from '@/lib/auth/auth-context'
import { useScheduledAnalysisStats } from '@/stores/scheduled-analysis-store'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const settingsMenuItems = [
  {
    id: 'general',
    label: 'Informações Gerais',
    icon: Building2,
    description: 'Configurações básicas da empresa'
  },
  {
    id: 'integrations',
    label: 'Integrações',
    icon: Code,
    description: 'GitHub, Webhooks e outras integrações'
  },
  {
    id: 'policies',
    label: 'Políticas da Empresa',
    icon: FileText,
    description: 'Documentos e políticas personalizadas'
  },
  {
    id: 'scheduled',
    label: 'Análises Agendadas',
    icon: Calendar,
    description: 'Configurar análises automáticas'
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: Bell,
    description: 'Preferências de notificação'
  },
  {
    id: 'security',
    label: 'Segurança',
    icon: Shield,
    description: 'Configurações de segurança'
  },
  {
    id: 'team',
    label: 'Equipe',
    icon: Users,
    description: 'Gerenciar usuários e permissões'
  }
]

export default function EnhancedSettingsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { githubToken } = useAuth()
  const {
    policies,
    activePolicyId,
    companySettings,
    addPolicy,
    removePolicy,
    setActivePolicy,
    updateCompanySettings
  } = useCompanyStore()
  const scheduledStats = useScheduledAnalysisStats()

  const [activeSection, setActiveSection] = useState('general')
  const [companyName, setCompanyName] = useState(companySettings.name)
  const [developmentPhase, setDevelopmentPhase] = useState(companySettings.developmentPhase)
  const [newPolicyName, setNewPolicyName] = useState('')
  const [newPolicyDescription, setNewPolicyDescription] = useState('')

  const handleSaveSettings = () => {
    updateCompanySettings({
      name: companyName,
      developmentPhase
    })
    
    toast({
      title: 'Configurações salvas',
      description: 'As configurações da empresa foram atualizadas com sucesso.',
    })
  }

  const handlePolicyUpload = (files: File[]) => {
    files.forEach(file => {
      if (newPolicyName) {
        addPolicy({
          name: newPolicyName,
          description: newPolicyDescription,
          file
        })
        
        toast({
          title: 'Política adicionada',
          description: `A política "${newPolicyName}" foi carregada com sucesso.`,
        })
        
        setNewPolicyName('')
        setNewPolicyDescription('')
      } else {
        toast({
          title: 'Nome obrigatório',
          description: 'Por favor, defina um nome para a política antes de fazer upload.',
          variant: 'destructive'
        })
      }
    })
  }

  const handleLogoUpload = (files: File[]) => {
    const logoFile = files[0]
    if (logoFile) {
      const logoUrl = URL.createObjectURL(logoFile)
      updateCompanySettings({ logo: logoUrl })
      
      toast({
        title: 'Logo atualizado',
        description: 'O logo da empresa foi atualizado com sucesso.',
      })
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informações da Empresa</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Dados Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome da Empresa
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ex: Peers Technology"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fase de Desenvolvimento Atual
                </label>
                <Select value={developmentPhase} onValueChange={setDevelopmentPhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fase atual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estrategia">Estratégia e Planejamento</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="construcao">Construção e Testes</SelectItem>
                    <SelectItem value="implantacao">Implantação e Sustentação</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta configuração ajuda a personalizar as análises conforme sua fase atual
                </p>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {companySettings.logo && (
                <div className="mb-4 p-4 border rounded-lg text-center">
                  <img 
                    src={companySettings.logo} 
                    alt="Logo da empresa" 
                    className="h-20 mx-auto object-contain"
                  />
                </div>
              )}
              <FileUpload
                onFilesSelected={handleLogoUpload}
                acceptedTypes=".png,.jpg,.jpeg,.svg"
                multiple={false}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Formatos aceitos: PNG, JPG, JPEG, SVG (max. 2MB)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Integrações Externas</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/dashboard/settings/github')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5 text-gray-800" />
                GitHub
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Configure seu token do GitHub para acessar repositórios
              </p>
              <div className="flex items-center justify-between">
                <Badge variant={githubToken ? 'success' : 'secondary'}>
                  {githubToken ? 'Conectado' : 'Não configurado'}
                </Badge>
                {githubToken && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-gray-600" />
                Webhooks
                <Badge variant="outline" className="ml-auto text-xs">Em breve</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure webhooks para receber notificações automáticas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderPoliciesSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Políticas da Empresa</h3>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gerenciar Políticas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome da Política
                </label>
                <Input
                  value={newPolicyName}
                  onChange={(e) => setNewPolicyName(e.target.value)}
                  placeholder="ex: Padrões de Código Python"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrição
                </label>
                <Input
                  value={newPolicyDescription}
                  onChange={(e) => setNewPolicyDescription(e.target.value)}
                  placeholder="Descrição da política..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Arquivo da Política
              </label>
              <FileUpload
                onFilesSelected={handlePolicyUpload}
                acceptedTypes=".pdf,.doc,.docx,.txt,.md"
                multiple={true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formatos aceitos: PDF, DOC, DOCX, TXT, MD
              </p>
            </div>

            {policies.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Políticas Ativas</h4>
                <div className="space-y-2">
                  {policies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{policy.name}</p>
                          <p className="text-xs text-muted-foreground">{policy.description}</p>
                        </div>
                        {activePolicyId === policy.id && (
                          <Badge variant="success" className="ml-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Ativa
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {activePolicyId !== policy.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActivePolicy(policy.id)}
                          >
                            Ativar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removePolicy(policy.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderScheduledSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Análises Agendadas</h3>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/dashboard/settings/scheduled')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Gerenciar Agendamentos
              <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Configure análises automáticas para seus repositórios
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {scheduledStats.total} agendadas
                </Badge>
                <Badge variant="success">
                  {scheduledStats.active} ativas
                </Badge>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferências de Notificação</h3>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configurações de Notificação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Análises Concluídas</p>
                  <p className="text-sm text-muted-foreground">Receber notificação quando uma análise for concluída</p>
                </div>
                <div className="text-muted-foreground">
                  <Badge variant="outline">Em breve</Badge>
                </div>
              </div>
              
              <div className="border-t" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Falhas de Análise</p>
                  <p className="text-sm text-muted-foreground">Receber notificação quando uma análise falhar</p>
                </div>
                <div className="text-muted-foreground">
                  <Badge variant="outline">Em breve</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Configurações de Segurança</h3>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança da Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticação de Dois Fatores</p>
                  <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <div className="text-muted-foreground">
                  <Badge variant="outline">Em breve</Badge>
                </div>
              </div>
              
              <div className="border-t" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Logs de Atividade</p>
                  <p className="text-sm text-muted-foreground">Visualizar histórico de atividades da conta</p>
                </div>
                <div className="text-muted-foreground">
                  <Badge variant="outline">Em breve</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTeamSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Gerenciamento de Equipe</h3>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Funcionalidade em Desenvolvimento</h4>
              <p className="text-sm text-muted-foreground mb-4">
                O gerenciamento de equipe será disponibilizado em breve
              </p>
              <Badge variant="outline">Em breve</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'integrations':
        return renderIntegrationsSettings()
      case 'policies':
        return renderPoliciesSettings()
      case 'scheduled':
        return renderScheduledSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'security':
        return renderSecuritySettings()
      case 'team':
        return renderTeamSettings()
      default:
        return renderGeneralSettings()
    }
  }

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Configure sua empresa, integrações e análises automáticas
        </p>
      </div>

      {/* Settings Menu */}
      <div className="mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {settingsMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap',
                  isActive 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl">
        {renderActiveSection()}
      </div>
    </div>
  )
}
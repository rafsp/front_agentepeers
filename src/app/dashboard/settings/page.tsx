'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  CheckCircle
} from 'lucide-react'
import { useCompanyStore } from '@/stores/company-store'
import { useAuth } from '@/lib/auth/auth-context'
import { useScheduledAnalysisStats } from '@/stores/scheduled-analysis-store'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const router = useRouter()
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Configurações</h1>
          </div>
          <p className="text-muted-foreground">
            Configure sua empresa, integrações e análises automáticas
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
              <div className="flex items-center justify-between">
                <Badge variant={githubToken ? 'success' : 'secondary'}>
                  {githubToken ? 'Conectado' : 'Não configurado'}
                </Badge>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

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
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {scheduledStats.total} total
                  </Badge>
                  <Badge variant="success">
                    {scheduledStats.active} ativas
                  </Badge>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {/* Company Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Políticas da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Configure políticas específicas da sua empresa
              </p>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  {policies.length} políticas
                </Badge>
                {activePolicyId && (
                  <Badge variant="success" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Ativa
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configurações Gerais */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Informações Gerais
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

            {/* Logo da Empresa */}
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
                      className="h-20 mx-auto"
                    />
                  </div>
                )}
                <FileUpload
                  onFilesSelected={handleLogoUpload}
                  acceptedTypes=".png,.jpg,.jpeg,.svg"
                  multiple={false}
                />
              </CardContent>
            </Card>
          </div>

          {/* Políticas da Empresa */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Adicionar Nova Política
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nome da Política
                  </label>
                  <Input
                    value={newPolicyName}
                    onChange={(e) => setNewPolicyName(e.target.value)}
                    placeholder="ex: Política de Desenvolvimento"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Descrição
                  </label>
                  <Input
                    value={newPolicyDescription}
                    onChange={(e) => setNewPolicyDescription(e.target.value)}
                    placeholder="Breve descrição da política"
                  />
                </div>

                <FileUpload
                  onFilesSelected={handlePolicyUpload}
                  multiple={false}
                />
              </CardContent>
            </Card>

            {/* Políticas Existentes */}
            {policies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Políticas Carregadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {policies.map((policy) => (
                      <div 
                        key={policy.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          activePolicyId === policy.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => setActivePolicy(policy.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{policy.name}</h4>
                              {activePolicyId === policy.id && (
                                <Badge variant="success" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativa
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {policy.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Carregado em {policy.uploadedAt.toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removePolicy(policy.id)
                              toast({
                                title: 'Política removida',
                                description: `"${policy.name}" foi removida.`,
                              })
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
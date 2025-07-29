'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, GitBranch, Play, Loader2, AlertCircle } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import { analysisService, type StartAnalysisRequest } from '@/lib/api/analysis-service'

const analysisTypes = [
  { value: 'design', label: 'Análise de Design', description: 'Análise da arquitetura e padrões de design do código' },
  { value: 'relatorio_teste_unitario', label: 'Relatório de Testes Unitários', description: 'Análise da cobertura e qualidade dos testes' },
  { value: 'security', label: 'Análise de Segurança', description: 'Detecção de vulnerabilidades e problemas de segurança' },
  { value: 'performance', label: 'Análise de Performance', description: 'Identificação de gargalos e otimizações' }
]

export default function NewAnalysisPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { addJob, startPolling } = useJobStore()
  
  const [repository, setRepository] = useState('')
  const [analysisType, setAnalysisType] = useState('')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!repository) {
      setError('Repositório é obrigatório')
      return false
    }
    
    if (!analysisType) {
      setError('Tipo de análise é obrigatório')
      return false
    }

    // Validar formato do repositório (usuario/repo)
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
    if (!repoPattern.test(repository)) {
      setError('Formato do repositório deve ser: usuário/repositório')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      const request: StartAnalysisRequest = {
        repo_name: repository,
        analysis_type: analysisType as any,
        branch_name: branch || undefined,
        instrucoes_extras: instructions || undefined,
      }

      const response = await analysisService.startAnalysis(request)
      
      const newJob = {
        id: response.job_id,
        title: `Análise de ${repository}`,
        status: 'pending_approval' as const,
        progress: 10,
        message: 'Aguardando aprovação do relatório',
        repository,
        analysisType: analysisTypes.find(t => t.value === analysisType)?.label || analysisType,
        branch,
        instructions,
        report: response.report,
        requiresApproval: true,
      }

      addJob(newJob)

      toast({
        title: 'Análise iniciada!',
        description: `A análise do repositório ${repository} foi criada. Revise o relatório para prosseguir.`,
      })

      router.push(`/dashboard/jobs/${response.job_id}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(errorMessage)
      
      toast({
        title: 'Erro ao iniciar análise',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAnalysisType = analysisTypes.find(t => t.value === analysisType)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Nova Análise de Código</h1>
          <p className="text-muted-foreground">
            Configure os parâmetros para iniciar uma nova análise com IA
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Configuração da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Repositório *
                </label>
                <Input
                  placeholder="ex: LucioFlavioRosa/meu-repositorio"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o nome do repositório no formato: usuário/repositório
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tipo de Análise *
                </label>
                <Select value={analysisType} onValueChange={setAnalysisType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de análise" />
                  </SelectTrigger>
                  <SelectContent>
                    {analysisTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedAnalysisType && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedAnalysisType.description}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Branch (opcional)
                </label>
                <Input
                  placeholder="ex: main, develop, feature/nova-funcionalidade"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deixe vazio para usar a branch padrão do repositório
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Instruções Extras (opcional)
                </label>
                <Textarea
                  placeholder="Instruções específicas para a análise, pontos de atenção, contexto adicional..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Forneça contexto adicional para melhorar a qualidade da análise
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!repository || !analysisType || isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando Análise...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Análise
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>⚡ A análise inicial será gerada em poucos minutos</p>
                <p>📋 Você receberá um relatório para aprovação antes do processamento final</p>
                <p>🤖 Nossos agentes de IA irão analisar seu código automaticamente</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
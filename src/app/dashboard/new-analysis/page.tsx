// src/app/dashboard/new-analysis/page.tsx - VERSÃO FINAL
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Play, Bot, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { ConnectionStatus, useConnectionStatus } from '@/components/connection-status'
import { AnalysisLoading } from '@/components/analysis-loading'
import { JobApprovalModal } from '@/components/job-approval-modal'
import { useAnalysisProgress } from '@/hooks/use-analysis-progress'

export default function NewAnalysisPage() {
  const router = useRouter()
  const { toast } = useToast()
  const connectionStatus = useConnectionStatus()
  const { progress, startAnalysis, resetProgress } = useAnalysisProgress()

  // Form state
  const [repository, setRepository] = useState('')
  const [analysisType, setAnalysisType] = useState<'design' | 'relatorio_teste_unitario'>('design')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')

  // UI state
  const [createdJob, setCreatedJob] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repository || !analysisType) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o repositório e tipo de análise.',
        variant: 'destructive',
      })
      return
    }

    if (!connectionStatus.isConnected) {
      toast({
        title: 'Backend desconectado',
        description: 'Verifique a conexão com o backend antes de iniciar a análise.',
        variant: 'destructive',
      })
      return
    }

    try {
      console.log('🚀 Iniciando análise:', { repository, analysisType, branch, instructions })

      const result = await startAnalysis({
        repository,
        analysisType,
        branch: branch || undefined,
        instructions: instructions || undefined,
      })

      console.log('✅ Análise completada:', result)
      setCreatedJob(result)

      toast({
        title: 'Análise concluída!',
        description: `Relatório gerado para ${repository}. Revise e aprove para continuar.`,
      })

    } catch (error) {
      console.error('❌ Erro ao criar análise:', error)
      
      toast({
        title: 'Erro ao iniciar análise',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      })
    }
  }

  const handleApprovalClose = () => {
    setCreatedJob(null)
    resetProgress()
    
    // Resetar form
    setRepository('')
    setBranch('')
    setInstructions('')
    
    // Ir para dashboard de jobs
    router.push('/dashboard/jobs')
  }

  const isLoading = progress.phase === 'starting' || progress.phase === 'analyzing'
  const showAnalysisLoading = isLoading
  const showApprovalModal = progress.phase === 'completed' && createdJob

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
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Nova Análise de Código</h1>
              <p className="text-muted-foreground">
                Inicie uma análise inteligente com IA para seu repositório
              </p>
            </div>
            
            {/* Status de Conexão Compacto */}
            <ConnectionStatus compact />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Card Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configurar Análise
                {isLoading && <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Progress Indicator quando carregando */}
              {isLoading && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-blue-600 animate-pulse" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {progress.currentStep}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          {Math.round(progress.progress)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  {progress.timeElapsed > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      {Math.floor(progress.timeElapsed / 60)}m {progress.timeElapsed % 60}s decorridos
                    </p>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Repositório */}
                <div>
                  <Label htmlFor="repository" className="text-sm font-medium mb-2 block">
                    Repositório GitHub *
                  </Label>
                  <Input
                    id="repository"
                    placeholder="ex: usuario/nome-do-repositorio"
                    value={repository}
                    onChange={(e) => setRepository(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Formato: owner/repository-name
                  </p>
                </div>

                {/* Tipo de Análise */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Tipo de Análise *
                  </Label>
                  <Select 
                    value={analysisType} 
                    onValueChange={(value: 'design' | 'relatorio_teste_unitario') => setAnalysisType(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de análise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">
                        <div className="flex flex-col items-start">
                          <span>Análise de Design</span>
                          <span className="text-xs text-muted-foreground">
                            Arquitetura, padrões SOLID, refatoração
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="relatorio_teste_unitario">
                        <div className="flex flex-col items-start">
                          <span>Relatório de Testes Unitários</span>
                          <span className="text-xs text-muted-foreground">
                            Cobertura, gaps, geração de testes
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div>
                  <Label htmlFor="branch" className="text-sm font-medium mb-2 block">
                    Branch (opcional)
                  </Label>
                  <Input
                    id="branch"
                    placeholder="ex: main, develop, feature/nova-funcionalidade"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Se não especificado, será usada a branch padrão do repositório
                  </p>
                </div>

                {/* Instruções Extras */}
                <div>
                  <Label htmlFor="instructions" className="text-sm font-medium mb-2 block">
                    Instruções Extras (opcional)
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Instruções específicas para a análise, pontos de atenção, contexto adicional..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Estas instruções serão consideradas pelo agente de IA durante a análise
                  </p>
                </div>

                {/* Status de Conexão */}
                {!connectionStatus.isConnected && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Backend desconectado</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Verifique se o servidor backend está rodando antes de iniciar a análise.
                    </p>
                  </div>
                )}

                {/* Error state */}
                {progress.phase === 'error' && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Erro na análise</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {progress.error}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={resetProgress}
                      className="mt-2"
                    >
                      Tentar Novamente
                    </Button>
                  </div>
                )}

                {/* Botão de Submit */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!repository || !analysisType || isLoading || !connectionStatus.isConnected}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Bot className="h-4 w-4 mr-2 animate-pulse" />
                      Análise em Andamento...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Análise Inteligente
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview do que vai acontecer */}
          {progress.phase === 'idle' && (
            <Card className="mt-6">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  O que vai acontecer:
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>IA vai conectar ao GitHub e ler seu código</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>
                      {analysisType === 'design' 
                        ? 'Análise de arquitetura, padrões SOLID e oportunidades de refatoração'
                        : 'Identificação de gaps de cobertura e geração de testes unitários'
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Relatório detalhado será gerado para sua aprovação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Após aprovação, mudanças serão aplicadas automaticamente</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Loading de Análise Detalhado */}
      <AnalysisLoading
        analysisType={analysisType}
        repository={repository}
        branch={branch}
        isVisible={showAnalysisLoading}
        onComplete={() => {}}
      />

      {/* Modal de Aprovação */}
      {showApprovalModal && (
        <JobApprovalModal
          job={createdJob}
          isOpen={true}
          onClose={handleApprovalClose}
        />
      )}
    </div>
  )
}
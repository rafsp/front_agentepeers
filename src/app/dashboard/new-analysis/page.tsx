// src/app/dashboard/new-analysis/page.tsx - CORRIGIDO
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, GitBranch, Play, Loader2, CheckCircle, AlertCircle, Github, ExternalLink } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import { JobApprovalModal } from '@/components/job-approval-modal'

export default function NewAnalysisPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { startAnalysisJob, jobs, testConnection } = useJobStore()
  
  const [repository, setRepository] = useState('')
  const [analysisType, setAnalysisType] = useState<'design' | 'relatorio_teste_unitario' | 'escrever_testes'>('escrever_testes')
  const [branch, setBranch] = useState('')
  const [instructions, setInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [createdJobId, setCreatedJobId] = useState<string | null>(null)

  // Testar conexão com backend
  const handleTestConnection = async () => {
    try {
      const isConnected = await testConnection()
      setConnectionStatus(isConnected ? 'connected' : 'disconnected')
      if (isConnected) {
        toast({
          title: 'Conexão OK!',
          description: 'Backend está funcionando corretamente.',
        })
      } else {
        toast({
          title: 'Erro de Conexão',
          description: 'Não foi possível conectar com o backend.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      toast({
        title: 'Erro de Conexão',
        description: 'Backend não está disponível. Verifique se está rodando.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repository || !analysisType) return

    setIsLoading(true)

    try {
      const jobId = await startAnalysisJob({
        repo_name: repository,
        analysis_type: analysisType as "design" | "relatorio_teste_unitario" | "seguranca" | "pentest" | "terraform",
        branch_name: branch || undefined,
        instrucoes_extras: instructions || undefined
      })

      // Definir o job criado para abrir o modal automaticamente
      setCreatedJobId(jobId)

      toast({
        title: 'Análise iniciada!',
        description: 'A análise foi criada e está aguardando aprovação.',
      })

      // Redirecionar para a página de jobs após um breve delay
      setTimeout(() => {
        router.push('/dashboard/jobs')
      }, 1500)

    } catch (error) {
      console.error('Erro ao iniciar análise:', error)
      toast({
        title: 'Erro ao iniciar análise',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createdJob = createdJobId ? jobs[createdJobId] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Nova Análise de Código</h1>
      </div>

      {/* Status de Conexão */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm">
                Backend: {
                  connectionStatus === 'connected' ? 'Conectado' :
                  connectionStatus === 'disconnected' ? 'Desconectado' : 'Verificando...'
                }
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
            >
              Testar Conexão
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              Configuração da Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Repositório */}
              <div className="space-y-2">
                <label htmlFor="repository" className="text-sm font-medium">
                  Repositório *
                </label>
                <Input
                  id="repository"
                  placeholder="ex: usuario/repositorio ou github.com/usuario/repositorio"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Formato: owner/repo ou URL completa do GitHub
                </p>
              </div>

              {/* Tipo de Análise */}
              <div className="space-y-2">
                <label htmlFor="analysisType" className="text-sm font-medium">
                  Tipo de Análise *
                </label>
                <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de análise" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="escrever_testes">
                      <div className="flex flex-col items-start">
                        <span>Criar Testes Unitários</span>
                        <span className="text-xs text-muted-foreground">
                          Gera testes automaticamente para o código
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="design">
                      <div className="flex flex-col items-start">
                        <span>Análise de Design</span>
                        <span className="text-xs text-muted-foreground">
                          Revisa padrões e arquitetura do código
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="relatorio_teste_unitario">
                      <div className="flex flex-col items-start">
                        <span>Relatório de Testes</span>
                        <span className="text-xs text-muted-foreground">
                          Analisa cobertura e qualidade dos testes
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <label htmlFor="branch" className="text-sm font-medium">
                  Branch
                </label>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="branch"
                    placeholder="main (padrão)"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para usar a branch padrão (main/master)
                </p>
              </div>

              {/* Instruções Extras */}
              <div className="space-y-2">
                <label htmlFor="instructions" className="text-sm font-medium">
                  Instruções Extras
                </label>
                <Textarea
                  id="instructions"
                  placeholder="Instruções específicas para a análise (opcional)"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Botão Submit */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !repository || connectionStatus === 'disconnected'}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando Análise...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Análise
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Análise Inicial</h4>
                  <p className="text-sm text-muted-foreground">
                    O sistema analisa o repositório e gera um relatório inicial
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Aprovação</h4>
                  <p className="text-sm text-muted-foreground">
                    Você revisa e aprova as mudanças sugeridas
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Aplicação</h4>
                  <p className="text-sm text-muted-foreground">
                    As mudanças são aplicadas automaticamente no repositório
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status de Conexão Detalhado */}
          {connectionStatus === 'disconnected' && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  Backend Indisponível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>O backend não está acessível. Verifique se:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>O servidor backend está rodando</li>
                    <li>A URL está correta (localhost:8000)</li>
                    <li>Não há problemas de CORS</li>
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    className="mt-2"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Aprovação */}
      {createdJob && (
        <JobApprovalModal
          job={createdJob}
          isOpen={!!createdJob && createdJob.status === 'pending_approval'}
          onClose={() => setCreatedJobId(null)}
        />
      )}
    </div>
  )
}
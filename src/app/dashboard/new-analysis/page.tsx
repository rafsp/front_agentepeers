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
  const [analysisType, setAnalysisType] = useState<'design' | 'relatorio_teste_unitario'>('design')
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
        analysis_type: analysisType,
        branch_name: branch || undefined,
        instrucoes_extras: instructions || undefined
      })

      // Definir o job criado para abrir o modal automaticamente
      setCreatedJobId(jobId)

      toast({
        title: 'Análise iniciada!',
        description: `A análise do repositório ${repository} foi iniciada com sucesso.`,
      })

      // Não redirecionar imediatamente, deixar o modal aparecer primeiro
      // router.push(`/dashboard/jobs?highlight=${jobId}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Falha ao iniciar a análise. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Pegar o job criado para o modal
  const createdJob = createdJobId ? jobs[createdJobId] : null

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
            Configure os parâmetros para iniciar uma nova análise
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Status da Conexão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                Status da Conexão Backend
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Conectado</span>
                  </>
                )}
                {connectionStatus === 'disconnected' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Desconectado</span>
                  </>
                )}
                {connectionStatus === 'unknown' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-yellow-600">Não testado</span>
                  </>
                )}
              </div>
              <Button variant="outline" onClick={handleTestConnection}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Testar Conexão
              </Button>
            </CardContent>
          </Card>

          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Configuração da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Repositório *
                  </label>
                  <Input
                    placeholder="ex: usuario/meu-repositorio"
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
                  <Select 
                    value={analysisType} 
                    onValueChange={(value: 'design' | 'relatorio_teste_unitario') => setAnalysisType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de análise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Análise de Design</SelectItem>
                      <SelectItem value="relatorio_teste_unitario">Relatório de Testes Unitários</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Outros tipos de análise serão adicionados em breve
                  </p>
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
                    Se não especificado, será usada a branch padrão do repositório
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
                    Estas instruções serão consideradas pelo agente de IA durante a análise
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={!repository || !analysisType || isLoading || connectionStatus === 'disconnected'}
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

                {connectionStatus === 'disconnected' && (
                  <p className="text-sm text-red-600 text-center">
                    ⚠️ Backend desconectado. Teste a conexão antes de iniciar a análise.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Aprovação - aparece automaticamente quando job é criado */}
      <JobApprovalModal
        job={createdJob}
        isOpen={!!createdJob && createdJob.status === 'pending_approval'}
        onClose={() => {
          setCreatedJobId(null)
          router.push('/dashboard/jobs')
        }}
      />
    </div>
  )
}
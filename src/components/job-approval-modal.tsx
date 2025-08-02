// src/components/job-approval-modal.tsx - MODAL DE APROVAÇÃO

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  GitBranch, 
  AlertCircle,
  Clock,
  Eye,
  Download,
  Settings
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { backendService } from '@/lib/services/backend-service'
import type { Job } from '@/stores/job-store'

interface JobApprovalModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
  onApprove?: (jobId: string) => void
  onReject?: (jobId: string) => void
}

export function JobApprovalModal({ 
  job, 
  isOpen, 
  onClose, 
  onApprove, 
  onReject 
}: JobApprovalModalProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [createBranch, setCreateBranch] = useState(false)
  const [branchName, setBranchName] = useState('')

  if (!isOpen || !job) return null

  const isExecutableAnalysis = job.analysisType && [
    'refatoracao', 'refatorador', 'escrever_testes', 
    'agrupamento_testes', 'agrupamento_design', 'docstring'
  ].includes(job.analysisType)

  const handleApprove = async () => {
    if (!job.backendJobId) {
      toast({
        title: 'Erro',
        description: 'Job ID do backend não encontrado',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      await backendService.updateJobStatus({
        job_id: job.backendJobId,
        action: 'approve'
      })

      toast({
        title: 'Análise aprovada!',
        description: isExecutableAnalysis 
          ? 'As mudanças serão aplicadas automaticamente'
          : 'Relatório aprovado com sucesso'
      })

      onApprove?.(job.id)
      onClose()

    } catch (error) {
      toast({
        title: 'Erro ao aprovar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!job.backendJobId) {
      toast({
        title: 'Erro',
        description: 'Job ID do backend não encontrado',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      await backendService.updateJobStatus({
        job_id: job.backendJobId,
        action: 'reject'
      })

      toast({
        title: 'Análise rejeitada',
        description: 'A análise foi cancelada'
      })

      onReject?.(job.id)
      onClose()

    } catch (error) {
      toast({
        title: 'Erro ao rejeitar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCommit = async () => {
    if (!job.backendJobId) {
      toast({
        title: 'Erro',
        description: 'Job ID do backend não encontrado',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    try {
      await backendService.updateJobStatus({
        job_id: job.backendJobId,
        action: 'commit',
        commit_message: commitMessage || undefined,
        create_branch: createBranch
      })

      toast({
        title: 'Commit iniciado!',
        description: createBranch 
          ? `Criando nova branch e aplicando mudanças`
          : 'Aplicando mudanças na branch atual'
      })

      onClose()

    } catch (error) {
      toast({
        title: 'Erro no commit',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadReport = () => {
    if (job.report || job.initialReport) {
      const reportContent = job.report || job.initialReport || ''
      const blob = new Blob([reportContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analise-${job.repository.replace('/', '-')}-${job.id}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const getAnalysisTypeInfo = (type: string) => {
    const types: Record<string, { name: string; icon: string; description: string }> = {
      'design': { 
        name: 'Análise de Design', 
        icon: '🏗️', 
        description: 'Auditoria de arquitetura e qualidade' 
      },
      'seguranca': { 
        name: 'Auditoria de Segurança', 
        icon: '🔒', 
        description: 'Análise de vulnerabilidades OWASP' 
      },
      'pentest': { 
        name: 'Plano de Pentest', 
        icon: '🎯', 
        description: 'Planejamento de testes de penetração' 
      },
      'terraform': { 
        name: 'Análise de Terraform', 
        icon: '☁️', 
        description: 'Auditoria de infraestrutura' 
      },
      'relatorio_teste_unitario': { 
        name: 'Relatório de Testes', 
        icon: '📊', 
        description: 'Análise de cobertura de testes' 
      },
      'refatoracao': { 
        name: 'Refatoração', 
        icon: '⚡', 
        description: 'Aplicação de melhorias automáticas' 
      },
      'refatorador': { 
        name: 'Refatorador Avançado', 
        icon: '🔧', 
        description: 'Refatoração com padrões' 
      },
      'escrever_testes': { 
        name: 'Criar Testes', 
        icon: '🧪', 
        description: 'Geração de testes unitários' 
      },
      'agrupamento_testes': { 
        name: 'Agrupar Testes', 
        icon: '📦', 
        description: 'Organização de testes' 
      },
      'agrupamento_design': { 
        name: 'Agrupar Melhorias', 
        icon: '📋', 
        description: 'Organização de commits' 
      },
      'docstring': { 
        name: 'Documentação', 
        icon: '📚', 
        description: 'Geração de documentação' 
      }
    }
    return types[type] || { name: type, icon: '📄', description: 'Análise de código' }
  }

  const typeInfo = getAnalysisTypeInfo(job.analysisType)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{typeInfo.icon}</span>
              <div>
                <CardTitle className="text-xl">{typeInfo.name}</CardTitle>
                <p className="text-muted-foreground">{typeInfo.description}</p>
              </div>
            </div>
            <Badge variant="warning" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Aguardando Aprovação
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações do Job */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium mb-2">Repositório</h4>
              <p className="text-sm text-muted-foreground">{job.repository}</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Branch</h4>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {job.branch || 'main'}
              </p>
            </div>
            {job.instructions && (
              <div className="md:col-span-2">
                <h4 className="font-medium mb-2">Instruções Específicas</h4>
                <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                  {job.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Relatório */}
          {(job.report || job.initialReport) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Relatório da Análise
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadReport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg max-h-96 overflow-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {job.report || job.initialReport}
                </pre>
              </div>
            </div>
          )}

          {/* Opções de Commit (para análises executáveis) */}
          {isExecutableAnalysis && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4" />
                <h4 className="font-medium">Opções de Commit</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Mensagem do Commit (opcional)
                  </label>
                  <Input
                    placeholder="ex: Refatoração automática baseada em análise de design"
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-branch"
                    checked={createBranch}
                    onCheckedChange={setCreateBranch}
                  />
                  <label htmlFor="create-branch" className="text-sm">
                    Criar nova branch para as mudanças
                  </label>
                </div>

                {createBranch && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nome da Nova Branch
                    </label>
                    <Input
                      placeholder="ex: feature/refactoring-improvements"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rejeitar
            </Button>

            {isExecutableAnalysis ? (
              <Button
                onClick={handleCommit}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Aprovar e Implementar'}
              </Button>
            ) : (
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Aprovar Relatório'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
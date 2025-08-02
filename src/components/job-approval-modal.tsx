// src/components/job-approval-modal.tsx - CORRIGIDO
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, FileText, Loader2, AlertCircle, X } from 'lucide-react'
import { Job, useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'

interface JobApprovalModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

export const JobApprovalModal: React.FC<JobApprovalModalProps> = ({
  job,
  isOpen,
  onClose
}) => {
  const { toast } = useToast()
  const { approveJob, rejectJob } = useJobStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  // 🔧 CORREÇÃO: Debug para verificar se o modal está sendo renderizado
  useEffect(() => {
    console.log('🎭 JobApprovalModal render:', { 
      isOpen, 
      hasJob: !!job, 
      jobId: job?.id, 
      jobStatus: job?.status 
    })
  }, [isOpen, job])

  // 🔧 CORREÇÃO: Garantir que o modal feche quando o status mudar
  useEffect(() => {
    if (job && job.status !== 'pending_approval') {
      console.log('✅ Job não está mais pendente de aprovação, fechando modal')
      onClose()
    }
  }, [job?.status, onClose])

  const handleApprove = async () => {
    if (!job) {
      console.error('❌ Tentativa de aprovar job nulo')
      return
    }
    
    console.log('✅ Iniciando aprovação do job:', job.id)
    setIsProcessing(true)
    setAction('approve')
    
    try {
      await approveJob(job.id)
      toast({
        title: 'Análise aprovada!',
        description: 'O processo de refatoração foi iniciado.',
      })
      onClose()
    } catch (error) {
      console.error('❌ Erro ao aprovar job:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao aprovar análise',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
      setAction(null)
    }
  }

  const handleReject = async () => {
    if (!job) {
      console.error('❌ Tentativa de rejeitar job nulo')
      return
    }
    
    console.log('❌ Iniciando rejeição do job:', job.id)
    setIsProcessing(true)
    setAction('reject')
    
    try {
      await rejectJob(job.id)
      toast({
        title: 'Análise rejeitada',
        description: 'A análise foi rejeitada e não será processada.',
      })
      onClose()
    } catch (error) {
      console.error('❌ Erro ao rejeitar job:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao rejeitar análise',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
      setAction(null)
    }
  }

  // 🔧 CORREÇÃO: Não renderizar se não está aberto ou não tem job
  if (!isOpen || !job) {
    console.log('🚫 Modal não renderizado:', { isOpen, hasJob: !!job })
    return null
  }

  console.log('✅ Renderizando modal para job:', job.id)

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="relative bg-background border rounded-lg shadow-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-yellow-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h2 className="text-lg font-semibold">Aprovação Necessária: {job.title}</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Job Info */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm"><strong>Repositório:</strong> {job.repository}</p>
                <p className="text-sm"><strong>Tipo:</strong> {job.analysisType}</p>
                {job.branch && <p className="text-sm"><strong>Branch:</strong> {job.branch}</p>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-sm">Status:</strong>
                  <Badge variant="warning" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Aguardando Aprovação
                  </Badge>
                </div>
                {job.instructions && (
                  <p className="text-sm mt-2">
                    <strong>Instruções:</strong> {job.instructions}
                  </p>
                )}
              </div>
            </div>

            {/* Report Content */}
            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <h3 className="font-semibold">Relatório de Análise Inicial</h3>
                <p className="text-sm text-muted-foreground">
                  Revise o relatório abaixo e decida se deseja prosseguir com a aplicação das mudanças
                </p>
              </div>
              
              <div className="p-4 max-h-80 overflow-y-auto">
                {job.initialReport || job.report ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded">
                      {job.initialReport || job.report}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Relatório não disponível ou ainda sendo gerado...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-800">Atenção</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Ao aprovar, as mudanças sugeridas serão aplicadas automaticamente ao repositório. 
                    Certifique-se de revisar o relatório cuidadosamente antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-6 border-t bg-muted/20">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancelar
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing && action === 'reject' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              Rejeitar
            </Button>
            
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isProcessing && action === 'approve' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Aprovar e Continuar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
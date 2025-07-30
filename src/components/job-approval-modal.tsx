'use client'

import React, { useState } from 'react'
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

  const handleApprove = async () => {
    if (!job) return
    
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
    if (!job) return
    
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

  if (!isOpen || !job) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-background border rounded-lg shadow-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Aprovar Análise: {job.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
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
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
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
            className="flex-1"
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
  )
}
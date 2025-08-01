'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, FileText, Loader2, AlertCircle, X, RefreshCw, Download, Eye } from 'lucide-react'
import { Job, useJobStore } from '@/stores/job-store'
import { useToast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'

interface JobApprovalModalProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

interface AnalysisResult {
  report: string
  status: string
  analysis_completed: boolean
  ai_tokens_used?: number
  report_length?: number
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
  const [actualReport, setActualReport] = useState<string>('')
  const [isLoadingReport, setIsLoadingReport] = useState(false)
  const [reportMetadata, setReportMetadata] = useState<{
    isAiGenerated: boolean
    tokensUsed?: number
    reportLength: number
    lastUpdated?: string
  }>({
    isAiGenerated: false,
    reportLength: 0
  })

  // Função para buscar o resultado real da API
  const fetchActualReport = useCallback(async (jobId: string) => {
    if (!jobId) return

    setIsLoadingReport(true)
    try {
      console.log(`🔍 Buscando resultado real para job: ${jobId}`)
      
      // Tentar buscar status completo primeiro
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/status/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('📊 Dados recebidos da API:', {
        status: data.status,
        hasResult: !!data.result,
        hasReport: !!data.report,
        reportLength: data.report?.length || 0
      })

      // Priorizar resultado da IA sobre template inicial
      let finalReport = ''
      let isAiGenerated = false
      let tokensUsed = undefined

      if (data.result?.resultado && data.result.resultado.length > 1000) {
        // Resultado da IA (geralmente > 1000 caracteres)
        finalReport = data.result.resultado
        isAiGenerated = true
        tokensUsed = data.result.tokens_used
        console.log('✅ Usando resultado da IA')
      } else if (data.report && data.report.length > 1000) {
        // Report principal
        finalReport = data.report
        isAiGenerated = !data.report.includes('Aguardando aprovação')
        console.log('✅ Usando report principal')
      } else {
        // Fallback para template inicial
        finalReport = data.report || job?.initialReport || 'Nenhum relatório disponível'
        isAiGenerated = false
        console.log('⚠️ Usando template inicial')
      }

      setActualReport(finalReport)
      setReportMetadata({
        isAiGenerated,
        tokensUsed,
        reportLength: finalReport.length,
        lastUpdated: new Date().toISOString()
      })

    } catch (error) {
      console.error('❌ Erro ao buscar resultado:', error)
      toast({
        title: "Erro ao carregar relatório",
        description: "Não foi possível carregar o resultado da análise. Usando dados locais.",
        variant: "destructive"
      })
      
      // Fallback para dados locais
      const fallbackReport = job?.report || job?.initialReport || 'Relatório não disponível'
      setActualReport(fallbackReport)
      setReportMetadata({
        isAiGenerated: false,
        reportLength: fallbackReport.length
      })
    } finally {
      setIsLoadingReport(false)
    }
  }, [job, toast])

  // Buscar relatório quando modal abrir
  useEffect(() => {
    if (isOpen && job?.id) {
      console.log('🚀 Modal aberto para job:', job.id)
      fetchActualReport(job.id)
    }
  }, [isOpen, job?.id, fetchActualReport])

  // Auto-refresh para jobs em processamento
  useEffect(() => {
    if (!isOpen || !job?.id) return

    // Se job ainda está sendo processado, fazer polling
    if (['pending_approval', 'workflow_started', 'running'].includes(job.status)) {
      const interval = setInterval(() => {
        fetchActualReport(job.id)
      }, 5000) // A cada 5 segundos

      return () => clearInterval(interval)
    }
  }, [isOpen, job?.status, job?.id, fetchActualReport])

  const handleApprove = async () => {
    if (!job) return
    
    setIsProcessing(true)
    setAction('approve')
    
    try {
      await approveJob(job.id)
      toast({
        title: 'Análise aprovada!',
        description: reportMetadata.isAiGenerated 
          ? 'A análise foi aprovada e está sendo processada.'
          : 'A análise foi aprovada. O processo completo será iniciado.',
      })
      onClose()
    } catch (error) {
      console.error('Erro ao aprovar:', error)
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
      console.error('Erro ao rejeitar:', error)
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

  const handleDownload = () => {
    if (!actualReport || !job) return

    const blob = new Blob([actualReport], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analise-${job.repository?.replace('/', '-') || 'repo'}-${job.id.slice(0, 8)}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Download iniciado',
      description: 'O relatório está sendo baixado.',
    })
  }

  const handleRefresh = () => {
    if (job?.id) {
      fetchActualReport(job.id)
    }
  }

  if (!isOpen || !job) return null

  const displayReport = actualReport || job.report || job.initialReport || 'Carregando relatório...'
  const isTemplate = displayReport.includes('Aguardando aprovação') || 
                    displayReport.includes('Analisando...') ||
                    displayReport.includes('Calculando...')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-background border rounded-lg shadow-lg max-w-5xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div>
              <h2 className="text-lg font-semibold">
                Análise: {job.title || job.repository}
              </h2>
              <p className="text-sm text-muted-foreground">
                {job.analysisType} • {job.repository}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingReport}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingReport ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status e Metadata */}
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant={job.status === 'completed' ? 'success' : 'warning'} className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {job.status === 'pending_approval' ? 'Aguardando Aprovação' : job.status}
              </Badge>
              
              {reportMetadata.isAiGenerated && (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Análise IA Completa
                </Badge>
              )}
              
              {isTemplate && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Template Inicial
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {reportMetadata.tokensUsed && (
                <span>🤖 {reportMetadata.tokensUsed} tokens</span>
              )}
              <span>📝 {reportMetadata.reportLength.toLocaleString()} chars</span>
              {reportMetadata.lastUpdated && (
                <span>🕒 {new Date(reportMetadata.lastUpdated).toLocaleTimeString()}</span>
              )}
            </div>
          </div>
        </div>

        {/* Job Info */}
        <div className="p-4 bg-muted/10 border-b">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Repositório:</strong> {job.repository}
            </div>
            <div>
              <strong>Tipo:</strong> {job.analysisType}
            </div>
            <div>
              <strong>Branch:</strong> {job.branch || 'padrão'}
            </div>
          </div>
          {job.instructions && (
            <div className="mt-2 text-sm">
              <strong>Instruções extras:</strong> {job.instructions}
            </div>
          )}
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-hidden">
          {isLoadingReport ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Carregando resultado da análise...</p>
              </div>
            </div>
          ) : (
            <div className="h-96 overflow-y-auto">
              <div className="p-6">
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown className="text-sm leading-relaxed">
                    {displayReport}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/10">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!displayReport || isLoadingReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Fechar
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
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
              disabled={isProcessing || isLoadingReport}
            >
              {isProcessing && action === 'approve' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {reportMetadata.isAiGenerated ? 'Aprovar Análise' : 'Aprovar e Executar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
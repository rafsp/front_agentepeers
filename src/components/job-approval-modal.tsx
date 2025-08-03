'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  ThumbsUp, 
  ThumbsDown,
  ExternalLink,
  Copy,
  Download
} from 'lucide-react'

interface JobData {
  id: string
  title: string
  repository: string
  branch: string
  analysisType: string
  status: string
  report?: string
  createdAt: Date
  estimatedTime?: string
  metrics?: {
    linesAnalyzed?: number
    filesScanned?: number
    issuesFound?: number
    criticalIssues?: number
  }
}

interface JobApprovalModalProps {
  job: JobData | null
  isOpen: boolean
  onClose: () => void
  onApprove: (jobId: string) => void
  onReject: (jobId: string) => void
  isLoading?: boolean
}

export function JobApprovalModal({
  job,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading = false
}: JobApprovalModalProps) {
  
  if (!isOpen || !job) return null

  const analysisTypeLabels = {
    design: 'Análise de Design',
    relatorio_teste_unitario: 'Testes Unitários',
    terraform: 'Segurança Terraform',
    performance: 'Performance'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffMinutes < 60) return `${diffMinutes}m atrás`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`
    return `${Math.floor(diffMinutes / 1440)}d atrás`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Análise Concluída - Aguardando Aprovação
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Revise os resultados antes de prosseguir com as implementações
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar com informações do job */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            <div className="p-6 space-y-6">
              
              {/* Job Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Detalhes da Análise</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <p className="font-medium">
                      {analysisTypeLabels[job.analysisType as keyof typeof analysisTypeLabels] || job.analysisType}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Repositório:</span>
                    <p className="font-medium">{job.repository}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <p className="font-medium">{job.branch}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Criado:</span>
                    <p className="font-medium">{formatTimeAgo(job.createdAt)}</p>
                  </div>
                  {job.estimatedTime && (
                    <div>
                      <span className="text-gray-600">Tempo estimado:</span>
                      <p className="font-medium">{job.estimatedTime}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              {job.metrics && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Métricas</h3>
                  <div className="space-y-2 text-sm">
                    {job.metrics.linesAnalyzed && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Linhas analisadas:</span>
                        <span className="font-medium">{job.metrics.linesAnalyzed.toLocaleString()}</span>
                      </div>
                    )}
                    {job.metrics.filesScanned && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Arquivos:</span>
                        <span className="font-medium">{job.metrics.filesScanned}</span>
                      </div>
                    )}
                    {job.metrics.issuesFound && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Problemas:</span>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {job.metrics.issuesFound}
                        </Badge>
                      </div>
                    )}
                    {job.metrics.criticalIssues && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Críticos:</span>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          {job.metrics.criticalIssues}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ações</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Relatório
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver no GitHub
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main content - Report */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Relatório de Análise</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {job.report ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border font-mono">
                    {job.report}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Relatório não disponível</p>
                </div>
              )}
            </div>

            {/* Footer with approval buttons */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>
                    {job.status === 'pending_approval' 
                      ? 'Aguardando sua aprovação para prosseguir'
                      : 'Análise processada'
                    }
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => onReject(job.id)}
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => onApprove(job.id)}
                    disabled={isLoading}
                    className="min-w-[100px] bg-[#10a37f] hover:bg-[#0d8566]"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Aprovando...
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Aprovar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText, Download, Eye, Calendar } from 'lucide-react'
import { useJobStore } from '@/stores/job-store'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ReportsPage() {
  const router = useRouter()
  const { jobs } = useJobStore()

  const completedJobs = Object.values(jobs)
    .filter(job => job.status === 'completed' && job.report)
    .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))

  const handleViewReport = (jobId: string) => {
    router.push(`/dashboard/reports/${jobId}`)
  }

  const handleDownloadReport = (jobId: string) => {
    const job = jobs[jobId]
    if (job?.report) {
      const blob = new Blob([job.report], { type: 'text/markdown' })
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
              <h1 className="text-2xl font-bold">Relatórios de Análise</h1>
              <p className="text-muted-foreground">
                Visualize e baixe relatórios de análises concluídas
              </p>
            </div>
            
            <Button onClick={() => router.push('/dashboard/new-analysis')}>
              Nova Análise
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {completedJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum relatório disponível</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não possui análises concluídas com relatórios.
              </p>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                Iniciar Primeira Análise
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {completedJobs.map((job) => (
              <Card key={job.id} className="w-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="truncate">{job.title}</span>
                    </div>
                    <Badge variant="success">Concluído</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Job Info */}
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <p><strong>Repositório:</strong> {job.repository}</p>
                      <p><strong>Tipo de Análise:</strong> {job.analysisType}</p>
                      {job.branch && <p><strong>Branch:</strong> {job.branch}</p>}
                    </div>
                    <div>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <strong>Concluído:</strong> {job.completedAt && formatDistanceToNow(job.completedAt, { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Report Preview */}
                  {job.report && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground mb-2">Prévia do relatório:</p>
                      <p className="text-sm line-clamp-3">
                        {job.report.split('\n').slice(0, 3).join(' ').substring(0, 200)}...
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => handleViewReport(job.id)} 
                      variant="default" 
                      size="sm"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Relatório Completo
                    </Button>
                    <Button 
                      onClick={() => handleDownloadReport(job.id)} 
                      variant="outline" 
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download (.md)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
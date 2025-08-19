// src/components/jobs/job-manager.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'

interface Job {
  id: string
  repository: string
  analysisType: string
  status: string
  progress: number
  createdAt: Date
}

export function JobManager() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isHealthy, setIsHealthy] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Verificar saúde do backend
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net/docs', {
          method: 'HEAD'
        })
        setIsHealthy(true)
      } catch {
        setIsHealthy(false)
      }
    }
    checkHealth()
    
    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [])

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'default'
      case 'failed': return 'destructive'
      case 'in_progress': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      default: return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Status do Backend */}
      <Alert className={isHealthy ? 'border-green-500' : 'border-red-500'}>
        <AlertDescription className="flex items-center gap-2">
          {isHealthy ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <span>Backend Azure: {isHealthy ? 'Online' : 'Offline'}</span>
        </AlertDescription>
      </Alert>

      {/* Lista de Jobs */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Nenhum job em execução</p>
            <p className="text-sm mt-2">Use o formulário ao lado para criar uma análise</p>
          </CardContent>
        </Card>
      ) : (
        jobs.map(job => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{job.repository}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  <Badge variant={getStatusColor(job.status) as any}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={job.progress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {job.analysisType} • Criado: {job.createdAt.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
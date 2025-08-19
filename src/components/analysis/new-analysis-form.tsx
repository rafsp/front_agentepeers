"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
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
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'in_progress': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'in_progress': return <Loader2 className="h-4 w-4 animate-spin" />
      default: return <AlertCircle className="h-4 w-4" />
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
          Backend: {isHealthy ? 'Online' : 'Offline'}
        </AlertDescription>
      </Alert>

      {/* Lista de Jobs */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Nenhum job em execução
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
                  <Badge className={getStatusColor(job.status)}>
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
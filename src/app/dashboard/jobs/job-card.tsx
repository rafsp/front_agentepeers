// ========== src/app/dashboard/jobs/job-card.tsx ==========
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface JobCardProps {
  job: {
    id: string
    repository: string
    analysisType: string
    status: string
    progress: number
    createdAt: Date
  }
}

export function JobCard({ job }: JobCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{job.repository}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(job.status)}
            <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
          </div>
        </div>
        <CardDescription>{job.analysisType}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={job.progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">
          Criado em: {job.createdAt.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  )
}
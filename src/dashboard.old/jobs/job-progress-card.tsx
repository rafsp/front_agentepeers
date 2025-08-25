// ========== src/app/dashboard/jobs/job-progress-card.tsx ==========
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface JobProgressCardProps {
  title: string
  progress: number
  status: string
}

export function JobProgressCard({ title, progress, status }: JobProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground">Status: {status}</p>
      </CardContent>
    </Card>
  )
}
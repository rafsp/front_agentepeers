// src/app/relatorios/features/page.tsx
'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft, RefreshCw, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { FeaturesReport } from '@/components/report'
import { reportsService } from '@/lib/api/reports-service'
import type { FeaturesReportData } from '@/types/reports'

function FeaturesContent(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, isAuthenticated } = useAuth()
  
  const [data, setData] = useState<FeaturesReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const projectId = searchParams.get('projeto') || searchParams.get('projectId') || ''

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const loadData = async (): Promise<void> => {
    if (!projectId) {
      setError('Nenhum projeto selecionado')
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await reportsService.getFeatures(projectId)
      setData(response)
    } catch (err) {
      console.error('Erro ao carregar features:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && projectId) {
      loadData()
    } else if (isAuthenticated && !projectId) {
      setLoading(false)
      setError('Nenhum projeto selecionado')
    }
  }, [isAuthenticated, projectId])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#011334] mx-auto mb-4" />
          <p className="text-slate-500">Carregando relatorio de features...</p>
        </div>
      </div>
    )
  }

  if (!projectId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <FolderOpen className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum projeto selecionado</h2>
          <p className="text-slate-500 mb-4">Selecione um projeto na pagina de relatorios para visualizar as features.</p>
          <Button onClick={() => router.push('/relatorios')}>
            <ArrowLeft size={16} className="mr-2" />Voltar para Relatorios
          </Button>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/relatorios')}><ArrowLeft size={16} className="mr-2" />Voltar</Button>
            <Button onClick={loadData}><RefreshCw size={16} className="mr-2" />Tentar novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => router.push('/relatorios')} className="fixed top-24 left-4 z-30 bg-white shadow-md">
        <ArrowLeft size={16} className="mr-2" />Voltar
      </Button>
      <FeaturesReport data={data} />
    </div>
  )
}

export default function FeaturesPage(): React.ReactElement {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#011334] mx-auto mb-4" />
          <p className="text-slate-500">Carregando...</p>
        </div>
      </div>
    }>
      <FeaturesContent />
    </Suspense>
  )
}
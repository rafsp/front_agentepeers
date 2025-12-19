// src/app/relatorios/page.tsx
// Pagina de Relatorios - redireciona para epicos ou mostra menu se projeto selecionado

'use client'

import React, { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Layers, ListTodo, KanbanSquare, ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'

const REPORT_TYPES = [
  { id: 'epicos', title: 'Backlog de Épicos', description: 'Business case, squad e entregáveis', icon: Layers, color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'features', title: 'Features por Épico', description: 'Detalhamento técnico', icon: ListTodo, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'cronograma', title: 'Cronograma', description: 'Timeline de execução', icon: KanbanSquare, color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'riscos', title: 'Riscos e Premissas', description: 'Matriz de riscos', icon: ShieldAlert, color: '#ef4444', bgColor: '#fef2f2' },
]

export default function RelatoriosPage(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, isAuthenticated } = useAuth()
  
  const projectId = searchParams.get('projeto') || searchParams.get('projectId') || ''

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Se tem projeto, redireciona para epicos automaticamente
  useEffect(() => {
    if (isAuthenticated && projectId) {
      router.replace(`/relatorios/epicos?projeto=${projectId}`)
    }
  }, [isAuthenticated, projectId, router])

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#011334]" />
      </div>
    )
  }

  // Se tem projeto, mostra loading enquanto redireciona
  if (projectId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#011334] mx-auto mb-4" />
          <p className="text-slate-500">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  // Se não tem projeto, mostra mensagem para selecionar no dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Nenhum projeto selecionado</h2>
          <p className="text-slate-500 mb-6">
            Para visualizar relatórios, selecione um projeto no Dashboard e clique no botão "Relatórios".
          </p>
          <Button onClick={() => router.push('/dashboard')} className="text-white" style={{ backgroundColor: '#011334' }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ir para Dashboard
          </Button>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-400 mb-4">Tipos de relatório disponíveis:</p>
            <div className="grid grid-cols-2 gap-3">
              {REPORT_TYPES.map((type) => {
                const Icon = type.icon
                return (
                  <div key={type.id} className="p-3 rounded-lg border border-slate-200 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: type.bgColor }}>
                        <Icon size={14} style={{ color: type.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{type.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 ml-8">{type.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
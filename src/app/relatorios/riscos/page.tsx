// src/app/relatorios/riscos/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { PremissasRiscosReport } from '@/components/report'
import { reportsService } from '@/lib/api/reports-service'
import type { PremissasRiscosReportData } from '@/types/reports'

const MOCK_DATA: PremissasRiscosReportData = {
  project_name: 'Projeto Demo',
  premissas: [
    { id: 'P01', descricao: 'Cliente fornecera acessos aos ERPs ate a Semana 2 do projeto.', impacto_se_falhar: 'Atraso de 2-3 semanas no inicio do desenvolvimento das integracoes.' },
    { id: 'P02', descricao: 'Documentacao tecnica das APIs dos ERPs esta disponivel e atualizada.', impacto_se_falhar: 'Necessidade de engenharia reversa, aumentando estimativa em 40%.' },
    { id: 'P03', descricao: 'Ambiente de homologacao sera disponibilizado pelo cliente ate a Semana 4.', impacto_se_falhar: 'Testes de integracao serao realizados apenas em producao, aumentando risco.' },
    { id: 'P04', descricao: 'Stakeholders do cliente terao disponibilidade para validacoes semanais.', impacto_se_falhar: 'Decisoes de produto podem atrasar, impactando cronograma geral.' },
    { id: 'P05', descricao: 'Infraestrutura cloud ja esta provisionada e acessivel pela equipe.', impacto_se_falhar: 'Delay de 1-2 semanas para setup de ambiente.' },
    { id: 'P06', descricao: 'Time alocado estara 100% dedicado ao projeto durante o periodo de execucao.', impacto_se_falhar: 'Reducao de velocidade de entrega proporcional a alocacao reduzida.' },
  ],
  riscos: [
    { id: 'R01', descricao: 'Complexidade tecnica das APIs dos ERPs maior que estimado.', probabilidade: 'Media', impacto: 'Alto', plano_mitigacao: 'Realizar spike tecnico de 3 dias na Semana 5 para validar viabilidade.' },
    { id: 'R02', descricao: 'Paralelismo agressivo de 4 epicos criticos entre Semanas 6-9 com time enxuto.', probabilidade: 'Alta', impacto: 'Critico', plano_mitigacao: 'Monitoramento diario de progresso. Priorizar E02 e E07. Se necessario, negociar extensao de 1 semana.' },
    { id: 'R03', descricao: 'Instabilidade das APIs dos ERPs legados.', probabilidade: 'Media', impacto: 'Alto', plano_mitigacao: 'Realizar Spike tecnico de 2 dias na Semana 5 para validar viabilidade das integracoes.' },
    { id: 'R04', descricao: 'Atraso do cliente em fornecer acessos, documentacao ou validacoes.', probabilidade: 'Alta', impacto: 'Critico', plano_mitigacao: 'Enviar checklist de premissas para cliente na Semana 0 com datas-limite claras.' },
    { id: 'R05', descricao: 'Sobreposicao de QA integrado com finalizacao de E05. QA Engineer pode ficar sobrecarregado.', probabilidade: 'Media', impacto: 'Alto', plano_mitigacao: 'Alocar QA Engineer adicional nas Semanas 10-11 para suporte em testes integrados.' },
    { id: 'R06', descricao: 'Complexidade subestimada do motor de cotacao.', probabilidade: 'Media', impacto: 'Alto', plano_mitigacao: 'Validar regras de negocio detalhadas com cliente na Semana 6. Simplificar algoritmo para MVP se necessario.' },
    { id: 'R07', descricao: 'Rotatividade de profissionais durante projeto.', probabilidade: 'Baixa', impacto: 'Alto', plano_mitigacao: 'Garantir documentacao tecnica incremental. Pair programming em epicos criticos.' },
    { id: 'R08', descricao: 'Falha em testes de carga na Semana 11.', probabilidade: 'Baixa', impacto: 'Critico', plano_mitigacao: 'Executar testes de carga preliminares na Semana 4. Reservar buffer de 3 dias na Semana 11.' },
  ],
}

export default function RiscosPage(): React.ReactElement {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, isAuthenticated } = useAuth()
  
  const [data, setData] = useState<PremissasRiscosReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMock, setUsingMock] = useState(false)

  const projectId = searchParams.get('projeto') || searchParams.get('projectId') || ''

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const loadData = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    setUsingMock(false)
    
    try {
      if (projectId) {
        const response = await reportsService.getPremissasRiscos(projectId)
        setData(response)
      } else {
        setData(MOCK_DATA)
        setUsingMock(true)
      }
    } catch (err) {
      console.error('Erro ao carregar premissas/riscos:', err)
      setData(MOCK_DATA)
      setUsingMock(true)
      setError('API indisponivel. Exibindo dados de exemplo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, projectId])

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#011334] mx-auto mb-4" />
          <p className="text-slate-500">Carregando premissas e riscos...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()}><ArrowLeft size={16} className="mr-2" />Voltar</Button>
            <Button onClick={loadData}><RefreshCw size={16} className="mr-2" />Tentar novamente</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {usingMock && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-sm text-amber-700">
          <AlertCircle size={14} className="inline mr-2" />Exibindo dados de exemplo.
        </div>
      )}
      <Button variant="outline" size="sm" onClick={() => router.push('/relatorios')} className="fixed top-24 left-4 z-30 bg-white shadow-md">
        <ArrowLeft size={16} className="mr-2" />Voltar
      </Button>
      <PremissasRiscosReport data={data} />
    </div>
  )
}
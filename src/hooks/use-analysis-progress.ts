// 2. CORRIGIR: src/hooks/use-analysis-progress.ts - VERSÃO CORRIGIDA
'use client'

import { useState, useEffect, useCallback } from 'react'
import { backendService } from '@/lib/services/backend-service'

type AnalysisPhase = 'idle' | 'starting' | 'analyzing' | 'completed' | 'error'

interface AnalysisProgress {
  phase: AnalysisPhase
  currentStep: string
  progress: number
  timeElapsed: number
  estimatedTimeRemaining?: number
  job?: any
  error?: string
}

export function useAnalysisProgress() {
  const [progress, setProgress] = useState<AnalysisProgress>({
    phase: 'idle',
    currentStep: '',
    progress: 0,
    timeElapsed: 0
  })

  const [startTime, setStartTime] = useState<number | null>(null)

  // Timer para atualizar tempo decorrido
  useEffect(() => {
    if (progress.phase === 'starting' || progress.phase === 'analyzing') {
      const timer = setInterval(() => {
        if (startTime) {
          const elapsed = Math.floor((Date.now() - startTime) / 1000)
          setProgress(prev => ({ ...prev, timeElapsed: elapsed }))
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [progress.phase, startTime])

  const startAnalysis = useCallback(async (params: {
    repository: string
    analysisType: 'design' | 'relatorio_teste_unitario'
    branch?: string
    instructions?: string
  }) => {
    try {
      setStartTime(Date.now())
      setProgress({
        phase: 'starting',
        currentStep: 'Conectando ao backend...',
        progress: 5,
        timeElapsed: 0
      })

      // Testar conexão primeiro
      const connectionTest = await backendService.testConnection()
      if (!connectionTest.success) {
        throw new Error(connectionTest.error || 'Falha na conexão com o backend')
      }

      setProgress(prev => ({
        ...prev,
        currentStep: 'Enviando requisição de análise...',
        progress: 10
      }))

      // Iniciar análise
      const response = await backendService.startAnalysis({
        repo_name: params.repository,
        analysis_type: params.analysisType,
        branch_name: params.branch,
        instrucoes_extras: params.instructions
      })

      setProgress(prev => ({
        ...prev,
        phase: 'analyzing',
        currentStep: 'Análise iniciada, aguardando IA...',
        progress: 25,
        job: response
      }))

      // Monitorar progresso usando polling
      let attempts = 0
      const maxAttempts = 60 // 2 minutos de timeout

      const pollProgress = async (): Promise<any> => {
        try {
          attempts++
          
          const jobStatus = await backendService.getJobStatus(response.job_id)
          
          // Atualizar progresso baseado no status
          let currentProgress = 25
          let currentStep = 'Processando...'
          
          // ✅ CORREÇÃO: Usar type assertion para resolver o erro de comparação
          const status = jobStatus.status as string
          
          if (status === 'pending_approval') {
            currentProgress = 100
            currentStep = 'Relatório gerado com sucesso!'
            setProgress(prev => ({
              ...prev,
              phase: 'completed',
              currentStep,
              progress: currentProgress,
              job: { ...response, ...jobStatus }
            }))
            return { ...response, ...jobStatus }
          } else if (['workflow_started', 'refactoring_code', 'grouping_commits', 'writing_unit_tests', 'grouping_tests'].includes(status)) {
            currentProgress = Math.min(95, 25 + (attempts * 2))
            currentStep = getStepDescription(status)
          } else if (status === 'failed') {
            throw new Error(jobStatus.error_details || 'Análise falhou')
          } else if (status === 'rejected') {
            throw new Error('Análise foi rejeitada')
          }

          setProgress(prev => ({
            ...prev,
            currentStep,
            progress: currentProgress,
            job: { ...response, ...jobStatus }
          }))

          // Se ainda não terminou e não atingiu o limite, continuar polling
          if (status === 'pending_approval') {
            return { ...response, ...jobStatus }
          } else if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000))
            return pollProgress()
          } else {
            throw new Error('Timeout: análise demorou mais que o esperado')
          }
        } catch (error) {
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 3000))
            return pollProgress()
          } else {
            throw error
          }
        }
      }

      return await pollProgress()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      
      setProgress({
        phase: 'error',
        currentStep: `Erro: ${errorMessage}`,
        progress: 0,
        timeElapsed: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        error: errorMessage
      })
      
      throw error
    }
  }, [startTime])

  const resetProgress = useCallback(() => {
    setProgress({
      phase: 'idle',
      currentStep: '',
      progress: 0,
      timeElapsed: 0
    })
    setStartTime(null)
  }, [])

  return {
    progress,
    startAnalysis,
    resetProgress
  }
}

function getStepDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'workflow_started': 'Iniciando processamento...',
    'refactoring_code': 'IA refatorando código...',
    'grouping_commits': 'Agrupando mudanças por tema...',
    'writing_unit_tests': 'Gerando testes unitários...',
    'grouping_tests': 'Organizando testes...',
    'populating_data': 'Preparando dados...',
    'committing_to_github': 'Enviando para GitHub...'
  }
  
  return descriptions[status] || 'Processando...'
}
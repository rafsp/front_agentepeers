// src/hooks/useAnalysis.ts
import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api/api-service'
import { toast } from '@/components/ui/use-toast'

export interface AnalysisState {
  jobId: string | null
  status: string
  progress: number
  message: string
  result: string | null
  error: string | null
  isPolling: boolean
  repository: string
  analysisType: string
}

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    jobId: null,
    status: 'idle',
    progress: 0,
    message: '',
    result: null,
    error: null,
    isPolling: false,
    repository: '',
    analysisType: ''
  })

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  // Limpar polling quando componente desmontar
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const startAnalysis = async (
    repository: string,
    analysisType: string,
    branch?: string,
    instructions?: string
  ) => {
    try {
      // Reset state
      setState(prev => ({
        ...prev,
        status: 'starting',
        error: null,
        result: null,
        repository,
        analysisType
      }))

      // Iniciar análise
      const response = await apiService.startAnalysis({
        repo_name: repository,
        analysis_type: analysisType as any,
        branch_name: branch,
        instrucoes_extras: instructions
      })

      // Atualizar state com resposta inicial
      setState(prev => ({
        ...prev,
        jobId: response.job_id,
        status: response.status || 'pending_approval',
        message: 'Análise criada com sucesso'
      }))

      // Iniciar polling
      startPolling(response.job_id)

      toast({
        title: 'Análise iniciada',
        description: 'A análise foi criada e está aguardando aprovação.'
      })

      return response.job_id
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao iniciar análise'
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage
      }))
      
      toast({
        title: 'Erro ao iniciar análise',
        description: errorMessage,
        variant: 'destructive'
      })
      
      throw error
    }
  }

  const startPolling = (jobId: string) => {
    setState(prev => ({ ...prev, isPolling: true }))

    const interval = setInterval(async () => {
      try {
        const status = await apiService.getJobStatus(jobId)
        
        setState(prev => ({
          ...prev,
          status: status.status,
          progress: status.progress || 0,
          message: status.message || '',
          repository: status.repo_name || prev.repository,
          analysisType: status.analysis_type || prev.analysisType
        }))

        // Se tiver resultado da análise, salvar
        if (status.analysis_result) {
          setState(prev => ({
            ...prev,
            result: status.analysis_result
          }))
        }

        // Se tiver erro, salvar
        if (status.error_details) {
          setState(prev => ({
            ...prev,
            error: status.error_details
          }))
        }

        // Parar polling se status final
        if (['completed', 'failed', 'rejected'].includes(status.status)) {
          clearInterval(interval)
          setState(prev => ({ ...prev, isPolling: false }))

          // Notificar usuário
          if (status.status === 'completed') {
            toast({
              title: 'Análise concluída!',
              description: 'A análise foi finalizada com sucesso.'
            })
          } else if (status.status === 'failed') {
            toast({
              title: 'Análise falhou',
              description: status.error_details || 'Ocorreu um erro durante a análise.',
              variant: 'destructive'
            })
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error)
      }
    }, 2000) // Poll a cada 2 segundos

    setPollingInterval(interval)
  }

  const approveAnalysis = async () => {
    if (!state.jobId) return

    try {
      await apiService.updateJobStatus({
        job_id: state.jobId,
        action: 'approve'
      })

      setState(prev => ({
        ...prev,
        status: 'approved',
        message: 'Análise aprovada! Processando...'
      }))

      toast({
        title: 'Análise aprovada',
        description: 'O processamento foi iniciado.'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao aprovar análise'
      toast({
        title: 'Erro ao aprovar',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  const rejectAnalysis = async () => {
    if (!state.jobId) return

    try {
      await apiService.updateJobStatus({
        job_id: state.jobId,
        action: 'reject'
      })

      setState(prev => ({
        ...prev,
        status: 'rejected',
        message: 'Análise rejeitada'
      }))

      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
      }

      toast({
        title: 'Análise rejeitada',
        description: 'A análise foi cancelada.'
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao rejeitar análise'
      toast({
        title: 'Erro ao rejeitar',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  }

  const reset = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }

    setState({
      jobId: null,
      status: 'idle',
      progress: 0,
      message: '',
      result: null,
      error: null,
      isPolling: false,
      repository: '',
      analysisType: ''
    })
  }

  return {
    ...state,
    startAnalysis,
    approveAnalysis,
    rejectAnalysis,
    reset
  }
}
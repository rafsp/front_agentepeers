// src/lib/api/agent-service.ts
// Configurado para usar o backend Azure por padrão

// URL do Backend Azure (publicado)
const AZURE_API_ENDPOINT = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'
const LOCAL_API_ENDPOINT = 'http://localhost:8000'

// Usar variável de ambiente ou Azure por padrão
const API_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || AZURE_API_ENDPOINT

// Função para obter a URL da API
const getApiUrl = () => {
  // Se tiver variável de ambiente, usar ela
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // Por padrão, usar Azure
  return AZURE_API_ENDPOINT
}

// Tipos de análise disponíveis
export type AnalysisType = 
  | 'design'
  | 'refatoracao'
  | 'docstring'
  | 'seguranca'
  | 'pentest'
  | 'terraform'
  | 'relatorio_teste_unitario'
  | 'criar_testes_unitarios'
  | 'escrever_testes'

// Modelos OpenAI disponíveis
export type OpenAIModel = 
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-5'

// Interface para requisição de análise
export interface StartAnalysisRequest {
  repo_name: string
  analysis_type: AnalysisType
  branch_name?: string
  instrucoes_extras?: string
  usar_rag?: boolean
  gerar_relatorio_apenas?: boolean
  model_name?: OpenAIModel
}

// Interface para resposta da análise
export interface StartAnalysisResponse {
  job_id: string
  message?: string
  status?: string
}

// Interface para status do job
export interface JobStatus {
  job_id: string
  status: string
  message?: string
  progress?: number
  error_details?: string
  last_updated?: number
  analysis_report?: string
  report?: string
}

// Interface para relatório do job
export interface JobReport {
  job_id: string
  analysis_report: string
  metadata?: any
}

// Interface para atualização de job
export interface UpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject'
  observacoes?: string
}

// Classe principal do serviço
export class AgentPeersAPI {
  private apiUrl: string
  private headers: HeadersInit

  constructor() {
    this.apiUrl = getApiUrl()
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
    
    console.log('🔗 API configurada para:', this.apiUrl)
  }

  // Verificar saúde do backend
  async checkHealth(): Promise<boolean> {
    try {
      console.log('🔍 Verificando backend em:', this.apiUrl)
      
      const response = await fetch(`${this.apiUrl}/`, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Backend online:', data)
        return true
      } else {
        console.warn('⚠️ Backend respondeu com status:', response.status)
        return false
      }
    } catch (error) {
      console.error('❌ Erro ao verificar backend:', error)
      return false
    }
  }

  // 1. Iniciar análise
  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const url = `${this.apiUrl}/start-analysis`
    
    const payload = {
      repo_name: request.repo_name,
      analysis_type: request.analysis_type,
      branch_name: request.branch_name || 'main',
      instrucoes_extras: request.instrucoes_extras || ' ',
      usar_rag: request.usar_rag ?? false,
      gerar_relatorio_apenas: request.gerar_relatorio_apenas ?? false,
      model_name: request.model_name || 'gpt-4o'
    }

    console.log('📤 Enviando análise:', payload)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Análise iniciada:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao iniciar análise:', error)
      throw error
    }
  }

  // 2. Obter status do job
  async getJobStatus(jobId: string): Promise<JobStatus> {
    const url = `${this.apiUrl}/status/${jobId}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao obter status:', error)
      throw error
    }
  }

  // 3. Obter relatório do job
  async getJobReport(jobId: string): Promise<JobReport> {
    const url = `${this.apiUrl}/jobs/${jobId}/report`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao obter relatório:', error)
      throw error
    }
  }

  // 4. Atualizar status do job
  async updateJobStatus(request: UpdateJobRequest): Promise<any> {
    const url = `${this.apiUrl}/update-job-status`
    
    const payload = {
      job_id: request.job_id,
      action: request.action,
      observacoes: request.observacoes || (
        request.action === 'approve' ? 'Plano aprovado.' : 'Plano rejeitado.'
      )
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        mode: 'cors',
        credentials: 'omit'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Status atualizado:', data)
      return data
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }
  }

  // 5. Polling automático
  async pollJobStatus(
    jobId: string, 
    onStatusUpdate?: (status: JobStatus) => void,
    intervalMs: number = 10000
  ): Promise<JobStatus> {
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        try {
          const status = await this.getJobStatus(jobId)
          
          if (onStatusUpdate) {
            onStatusUpdate(status)
          }

          console.log(`Status: ${status.status}`)

          // Estados finais
          if (['completed', 'failed', 'rejected'].includes(status.status)) {
            resolve(status)
            return
          }

          // Continuar polling
          setTimeout(checkStatus, intervalMs)
        } catch (error) {
          reject(error)
        }
      }

      checkStatus()
    })
  }
}

// Exportar instância única
export const agentPeersAPI = new AgentPeersAPI()

// Hook para React
import { useState, useEffect } from 'react'

export function useAgentPeers() {
  const [isHealthy, setIsHealthy] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState<boolean>(true)

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true)
      try {
        const healthy = await agentPeersAPI.checkHealth()
        setIsHealthy(healthy)
      } catch (error) {
        console.error('Erro ao verificar backend:', error)
        setIsHealthy(false)
      } finally {
        setIsChecking(false)
      }
    }

    // Verificar imediatamente
    checkHealth()
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    api: agentPeersAPI,
    isHealthy,
    isChecking
  }
}
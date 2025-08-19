// src/lib/api/api-service.ts
export interface StartAnalysisRequest {
  repo_name: string
  analysis_type: 'design' | 'relatorio_teste_unitario'
  branch_name?: string
  instrucoes_extras?: string
}

export interface StartAnalysisResponse {
  job_id: string
  report: string
  status: string
}

export interface UpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject'
}

export interface JobStatusResponse {
  job_id: string
  status: string
  error_details?: string
  repo_name?: string
  analysis_type?: string
}

export interface UpdateJobResponse {
  job_id: string
  status: string
  message: string
}

class ApiService {
  private baseUrl: string

  constructor() {
  this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.error || errorMessage
        } catch {
          // Se não conseguir parsear o JSON do erro, usa a mensagem padrão
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`✅ API Response:`, data)
      return data
    } catch (error) {
      console.error(`❌ API Error:`, error)
      if (error instanceof Error) {
        // Se o erro for de rede (backend não disponível)
        if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
          throw new Error('Backend não disponível. Verifique se o servidor está rodando em ' + this.baseUrl)
        }
        throw error
      }
      throw new Error('Erro desconhecido na comunicação com a API')
    }
  }

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    console.log('🚀 Iniciando análise:', request)
    return this.request<StartAnalysisResponse>('/start-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async updateJobStatus(request: UpdateJobRequest): Promise<UpdateJobResponse> {
    console.log('🔄 Atualizando status do job:', request)
    return this.request<UpdateJobResponse>('/update-job-status', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.request<JobStatusResponse>(`/status/${jobId}`)
  }

  async getAllJobs(): Promise<{total: number, jobs: Record<string, any>}> {
    return this.request<{total: number, jobs: Record<string, any>}>('/jobs')
  }

  async checkHealth(): Promise<{status: string, message: string}> {
    return this.request<{status: string, message: string}>('/health')
  }

  async testConnection(): Promise<{message: string, timestamp: string, total_jobs: number}> {
    return this.request<{message: string, timestamp: string, total_jobs: number}>('/test')
  }

  // Método para polling do status do job
  startPolling(
    jobId: string, 
    onStatusUpdate: (status: JobStatusResponse) => void,
    onError: (error: Error) => void,
    intervalMs: number = 3000,
    maxAttempts: number = 200 // ~10 minutos
  ): () => void {
    let attempts = 0
    let timeoutId: NodeJS.Timeout
    
    const poll = async () => {
      try {
        const status = await this.getJobStatus(jobId)
        onStatusUpdate(status)
        
        // Se o job foi concluído, parar o polling
        if (['completed', 'failed', 'rejected', 'approved'].includes(status.status)) {
          console.log(`🏁 Polling finalizado para job ${jobId}: ${status.status}`)
          return
        }
        
        attempts++
        if (attempts >= maxAttempts) {
          onError(new Error('Timeout: Job não foi concluído no tempo esperado'))
          return
        }
        
        // Continuar polling
        timeoutId = setTimeout(poll, intervalMs)
      } catch (error) {
        console.error('Erro no polling:', error)
        onError(error instanceof Error ? error : new Error('Erro desconhecido no polling'))
      }
    }
    
    // Iniciar polling
    poll()
    
    // Retornar função para cancelar polling
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }
}

export const apiService = new ApiService()
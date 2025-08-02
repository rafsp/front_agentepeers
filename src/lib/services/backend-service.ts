// src/lib/services/backend-service.ts - VERSÃO CORRIGIDA SEM CONFLITOS

// Interfaces específicas do backend service
export interface BackendStartAnalysisRequest {
  repo_name: string
  analysis_type: string
  branch_name?: string
  instrucoes_extras?: string
  codigo?: string
}

export interface BackendStartAnalysisResponse {
  job_id: string
  status: string
  message: string
  report?: string
  config: BackendAnalysisConfig
}

export interface BackendAnalysisConfig {
  name: string
  description: string
  icon: string
  category: string
  complexity: string
  requires_approval: boolean
  supports_commits: boolean
  supports_branches: boolean
  output_type: string
}

export interface BackendJobStatusResponse {
  job_id: string
  status: string
  message?: string
  progress?: number
  repo_name: string
  analysis_type: string
  config: BackendAnalysisConfig
  last_updated?: string
  error?: string
  commit_ready?: boolean
}

export interface BackendUpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject' | 'commit'
  commit_message?: string
  create_branch?: boolean
}

export interface BackendCommitRequest {
  job_id: string
  commit_message?: string
  create_branch?: boolean
  branch_name?: string
}

export interface BackendAnalysisTypesResponse {
  types: Record<string, BackendAnalysisConfig>
  categories: string[]
}

export interface BackendHealthResponse {
  status: string
  message: string
  agentes_disponivel: boolean
  jobs_count?: number
  policies_count?: number
}

export interface BackendSystemInfo {
  version: string
  agentes_disponivel: boolean
  total_analysis_types: number
}

export interface BackendJobsResponse {
  total: number
  jobs: any[]
  by_status: Record<string, number>
}

export interface BackendPolicyUploadRequest {
  name: string
  description: string
  file: File
}

export interface BackendPolicy {
  id: string
  name: string
  description: string
  uploaded_at: string
}

class BackendService {
  private baseUrl: string
  private timeout: number = 30000
  
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch {
          // Se não conseguir parsear JSON, usar mensagem padrão
        }
        
        throw new Error(errorMessage)
      }

      return response.json()
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Timeout: A análise demorou muito para responder.')
        }
        
        if (error.message.includes('fetch')) {
          throw new Error('Erro de conexão: Não foi possível conectar ao backend em ' + this.baseUrl)
        }
        
        throw error
      }
      
      throw new Error('Erro desconhecido ao conectar com o backend')
    }
  }

  // === ANÁLISES ===

  async getAnalysisTypes(): Promise<BackendAnalysisTypesResponse> {
    try {
      console.log('📋 Buscando tipos de análise...')
      const response = await this.makeRequest<BackendAnalysisTypesResponse>('/analysis-types')
      console.log('✅ Tipos carregados:', Object.keys(response.types).length)
      return response
    } catch (error) {
      console.error('❌ Erro ao buscar tipos:', error)
      throw error
    }
  }

  async startAnalysis(request: BackendStartAnalysisRequest): Promise<BackendStartAnalysisResponse> {
    console.log('🚀 Iniciando análise:', request)
    
    try {
      const response = await this.makeRequest<BackendStartAnalysisResponse>('/start-analysis', {
        method: 'POST',
        body: JSON.stringify(request),
      })
      
      console.log('✅ Análise iniciada:', response.job_id)
      return response
      
    } catch (error) {
      console.error('❌ Erro ao iniciar análise:', error)
      throw error
    }
  }

  async getJobStatus(jobId: string): Promise<BackendJobStatusResponse> {
    try {
      return await this.makeRequest<BackendJobStatusResponse>(`/status/${jobId}`)
    } catch (error) {
      console.error(`❌ Erro status job ${jobId}:`, error)
      throw error
    }
  }

  async updateJobStatus(request: BackendUpdateJobRequest): Promise<{ job_id: string; status: string; message: string }> {
    console.log(`🔄 Atualizando job ${request.job_id}:`, request.action)
    
    try {
      const response = await this.makeRequest<{ job_id: string; status: string; message: string }>('/update-job-status', {
        method: 'POST',
        body: JSON.stringify(request),
      })
      
      console.log(`✅ Job atualizado:`, response.status)
      return response
      
    } catch (error) {
      console.error(`❌ Erro ao atualizar job:`, error)
      throw error
    }
  }

  // === OPERAÇÕES ESPECÍFICAS ===

  async approveJob(jobId: string): Promise<void> {
    await this.updateJobStatus({ job_id: jobId, action: 'approve' })
  }

  async rejectJob(jobId: string): Promise<void> {
    await this.updateJobStatus({ job_id: jobId, action: 'reject' })
  }

  async commitJob(request: BackendCommitRequest): Promise<void> {
    const updateRequest: BackendUpdateJobRequest = {
      job_id: request.job_id,
      action: 'commit',
      commit_message: request.commit_message,
      create_branch: request.create_branch
    }
    
    await this.updateJobStatus(updateRequest)
  }

  // === JOBS ===

  async getAllJobs(): Promise<BackendJobsResponse> {
    try {
      return await this.makeRequest<BackendJobsResponse>('/jobs')
    } catch (error) {
      console.error('❌ Erro ao buscar jobs:', error)
      throw error
    }
  }

  async deleteJob(jobId: string): Promise<void> {
    try {
      await this.makeRequest(`/jobs/${jobId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('❌ Erro ao remover job:', error)
      throw error
    }
  }

  // === POLÍTICAS ===

  async getPolicies(): Promise<BackendPolicy[]> {
    try {
      return await this.makeRequest<BackendPolicy[]>('/policies')
    } catch (error) {
      console.error('❌ Erro ao buscar políticas:', error)
      throw error
    }
  }

  async uploadPolicy(request: BackendPolicyUploadRequest): Promise<{ id: string; message: string }> {
    const formData = new FormData()
    formData.append('name', request.name)
    formData.append('description', request.description)
    formData.append('file', request.file)

    try {
      const response = await fetch(`${this.baseUrl}/upload-policy`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload falhou: ${response.status} - ${errorText}`)
      }

      return response.json()
      
    } catch (error) {
      console.error('❌ Erro ao enviar política:', error)
      throw error
    }
  }

  async deletePolicy(policyId: string): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>(`/policies/${policyId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('❌ Erro ao remover política:', error)
      throw error
    }
  }

  // === CONECTIVIDADE ===

  async healthCheck(): Promise<BackendHealthResponse> {
    try {
      const response = await this.makeRequest<BackendHealthResponse>('/health')
      return response
    } catch (error) {
      console.warn('❌ Health check falhou:', error)
      throw error
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      await this.healthCheck()
      return true
    } catch {
      return false
    }
  }

  async getSystemInfo(): Promise<BackendSystemInfo> {
    try {
      return await this.makeRequest<BackendSystemInfo>('/')
    } catch (error) {
      console.error('❌ Erro info sistema:', error)
      throw error
    }
  }

  // === POLLING ===

  createJobPoller(
    jobId: string, 
    callback: (status: BackendJobStatusResponse) => void, 
    interval: number = 3000
  ): () => void {
    const poll = async () => {
      try {
        const status = await this.getJobStatus(jobId)
        callback(status)
        
        const finalStatuses = ['completed', 'failed', 'rejected']
        if (finalStatuses.includes(status.status)) {
          clearInterval(pollInterval)
        }
        
      } catch (error) {
        console.error(`❌ Polling error ${jobId}:`, error)
        clearInterval(pollInterval)
      }
    }
    
    const pollInterval = setInterval(poll, interval)
    poll() // Primeira execução
    
    return () => clearInterval(pollInterval)
  }
}

export const backendService = new BackendService()
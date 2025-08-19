export interface StartAnalysisRequest {
  repo_name: string
  analysis_type: 'design' | 'relatorio_teste_unitario' | 'security' | 'performance'
  branch_name?: string
  instrucoes_extras?: string
}

export interface StartAnalysisResponse {
  job_id: string
  report: string
}

export interface JobStatusResponse {
  job_id: string
  status: 'pending_approval' | 'workflow_started' | 'refactoring_code' | 'grouping_commits' | 
          'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 'committing_to_github' | 
          'completed' | 'failed' | 'rejected'
  message?: string
  progress?: number
  error_details?: string
  last_updated?: number
  report?: string  // ✅ Adicionar campo report
}

export interface UpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject'
}

export interface UpdateJobResponse {
  job_id: string
  status: string
  message: string
}

export interface HealthCheckResponse {
  status: string
  message: string
  agents_available: boolean
  active_jobs?: number
  workflows?: string[]
}

export interface JobListResponse {
  jobs: Array<{
    job_id: string
    status: string
    message?: string
    progress?: number
    repo_name: string
    analysis_type: string
    branch_name?: string
    created_at?: number
    last_updated?: number
    report?: string        // ✅ Adicionar campo report
    instructions?: string  // ✅ Adicionar campo instructions
  }>
}

// Tipos de erro customizados
export class BackendConnectionError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message)
    this.name = 'BackendConnectionError'
  }
}

export class BackendAPIError extends Error {
  constructor(
    message: string, 
    public readonly status: number,
    public readonly statusText: string
  ) {
    super(message)
    this.name = 'BackendAPIError'
  }
}

class BackendService {
  private baseUrl: string
  private isConnected: boolean = false
  private lastHealthCheck: number = 0
  private readonly HEALTH_CHECK_INTERVAL = 30000 // 30 segundos
  
  constructor() {
    // Usar variável de ambiente ou URL padrão
  this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'
    
    // Verificar conexão inicial
    this.checkConnection()
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    retries: number = 3
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Adicionar timeout padrão
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
    
    const requestOptions: RequestInit = {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    let lastError: Error | null = null

    // Tentar a requisição com retry
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        console.log(`🌐 [Tentativa ${attempt + 1}/${retries}] ${options.method || 'GET'} ${endpoint}`)
        
        const response = await fetch(url, requestOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          
          // Se for erro 5xx, tentar novamente
          if (response.status >= 500 && attempt < retries - 1) {
            console.warn(`⚠️ Erro ${response.status}, tentando novamente...`)
            await this.delay(1000 * (attempt + 1)) // Backoff exponencial
            continue
          }
          
          throw new BackendAPIError(
            `Backend API error: ${response.status} ${response.statusText} - ${errorText}`,
            response.status,
            response.statusText
          )
        }

        this.isConnected = true
        const result = await response.json()
        console.log(`✅ Requisição bem-sucedida: ${endpoint}`)
        return result

      } catch (error) {
        lastError = error as Error
        console.error(`❌ Erro na tentativa ${attempt + 1}:`, error)
        
        // Se for erro de rede e ainda há tentativas
        if (this.isNetworkError(error) && attempt < retries - 1) {
          console.log(`🔄 Tentando novamente em ${(attempt + 1) * 1000}ms...`)
          await this.delay(1000 * (attempt + 1))
          continue
        }
        
        // Se chegou aqui, não há mais tentativas
        break
      } finally {
        clearTimeout(timeoutId)
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    this.isConnected = false
    
    if (this.isNetworkError(lastError)) {
      throw new BackendConnectionError(
        `Não foi possível conectar com o backend em ${this.baseUrl}. Verifique se o servidor está rodando.`,
        lastError || undefined
      )
    }
    
    throw lastError || new Error('Erro desconhecido na requisição')
  }

  private isNetworkError(error: any): boolean {
    return (
      error?.name === 'AbortError' ||
      error?.name === 'TypeError' ||
      error?.message?.includes('fetch') ||
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('Failed to fetch')
    )
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Verificar conexão com o backend
  async checkConnection(): Promise<boolean> {
    const now = Date.now()
    
    // Evitar verificações muito frequentes
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL) {
      return this.isConnected
    }
    
    try {
      console.log('🔍 Verificando conexão com backend...')
      await this.getHealth()
      this.isConnected = true
      this.lastHealthCheck = now
      console.log('✅ Backend conectado')
      return true
    } catch (error) {
      this.isConnected = false
      this.lastHealthCheck = now
      console.warn('⚠️ Backend desconectado:', error)
      return false
    }
  }

  // Status da conexão
  getConnectionStatus(): { 
    isConnected: boolean
    baseUrl: string
    lastCheck: number 
  } {
    return {
      isConnected: this.isConnected,
      baseUrl: this.baseUrl,
      lastCheck: this.lastHealthCheck
    }
  }

  // Health check
  async getHealth(): Promise<HealthCheckResponse> {
    return this.makeRequest<HealthCheckResponse>('/health')
  }

  // Análises de código
  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    return this.makeRequest<StartAnalysisResponse>('/start-analysis', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    return this.makeRequest<JobStatusResponse>(`/status/${jobId}`)
  }

  async updateJobStatus(request: UpdateJobRequest): Promise<UpdateJobResponse> {
    return this.makeRequest<UpdateJobResponse>('/update-job-status', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Listar todos os jobs
  async listJobs(): Promise<JobListResponse> {
    return this.makeRequest<JobListResponse>('/jobs')
  }

  // Deletar job
  async deleteJob(jobId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/jobs/${jobId}`, {
      method: 'DELETE',
    })
  }

  // Métodos de conveniência para análise específica
  async analyzeDesign(repoName: string, branchName?: string, instructions?: string): Promise<StartAnalysisResponse> {
    return this.startAnalysis({
      repo_name: repoName,
      analysis_type: 'design',
      branch_name: branchName,
      instrucoes_extras: instructions
    })
  }

  async analyzeTests(repoName: string, branchName?: string, instructions?: string): Promise<StartAnalysisResponse> {
    return this.startAnalysis({
      repo_name: repoName,
      analysis_type: 'relatorio_teste_unitario',
      branch_name: branchName,
      instrucoes_extras: instructions
    })
  }

  // Polling para status do job
  async pollJobStatus(
    jobId: string, 
    onUpdate?: (status: JobStatusResponse) => void,
    interval: number = 2000
  ): Promise<JobStatusResponse> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getJobStatus(jobId)
          
          if (onUpdate) {
            onUpdate(status)
          }
          
          // Jobs finalizados
          if (['completed', 'failed', 'rejected'].includes(status.status)) {
            resolve(status)
            return
          }
          
          // Continuar polling
          setTimeout(poll, interval)
          
        } catch (error) {
          reject(error)
        }
      }
      
      poll()
    })
  }

  // Método para testar conectividade
  async testConnection(): Promise<{
    success: boolean
    latency?: number
    error?: string
    details?: HealthCheckResponse
  }> {
    const startTime = Date.now()
    
    try {
      const health = await this.getHealth()
      const latency = Date.now() - startTime
      
      return {
        success: true,
        latency,
        details: health
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Testar acesso a repositório GitHub
  async testGitHubAccess(repoName: string, branchName: string = 'main'): Promise<{
    success: boolean
    error?: string
    repo_name: string
    branch_name: string
    code_size?: number
    github_error?: string
  }> {
    return this.makeRequest(`/test-github/${encodeURIComponent(repoName)}?branch_name=${encodeURIComponent(branchName)}`)
  }
}

// Instância singleton
export const backendService = new BackendService()

// Hook para React (opcional)
export function useBackendService() {
  return backendService
}
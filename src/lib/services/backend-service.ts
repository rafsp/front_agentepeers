// src/lib/services/backend-service.ts - Service Atualizado para Nova API

// 🔗 Interfaces e Tipos
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

export interface JobStatusResponse {
  job_id: string
  status: 'pending_approval' | 'approved' | 'running' | 'refactoring_code' | 'grouping_commits' | 
          'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 'committing_to_github' | 
          'completed' | 'failed' | 'rejected'
  message: string
  progress: number
  error_details?: string
  last_updated: number
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

export interface Job {
  job_id: string
  repo_name: string
  analysis_type: string
  branch_name?: string
  instrucoes_extras?: string
  status: string
  message: string
  progress: number
  report?: string
  created_at: number
  last_updated: number
  error_details?: string
}

export interface ListJobsResponse {
  jobs: Job[]
  total: number
}

export interface PolicyUploadRequest {
  name: string
  description: string
  file: File
}

export interface Policy {
  id: string
  name: string
  description: string
  uploaded_at: string
}

// 🚀 Configuração do Service
class BackendService {
  private baseUrl: string
  private timeout: number

  constructor() {
    // Usar variável de ambiente ou URL padrão
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    this.timeout = 30000 // 30 segundos
  }

  /**
   * Método genérico para fazer requisições HTTP
   */
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Configurar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
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
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
          }
        }
        
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Tempo limite da requisição excedido')
        }
        throw error
      }
      
      throw new Error('Erro desconhecido na requisição')
    }
  }

  /**
   * Verificar se o backend está funcionando
   */
  async healthCheck(): Promise<{ status: string; message: string; agents_status?: string }> {
    try {
      return await this.makeRequest<{ status: string; message: string; agents_status?: string }>('/health')
    } catch (error) {
      console.error('Health check failed:', error)
      throw new Error('Backend não está respondendo. Verifique se o servidor está rodando.')
    }
  }

  /**
   * Obter informações do sistema
   */
  async getSystemInfo(): Promise<{ version: string; agents_available: boolean }> {
    return this.makeRequest<{ version: string; agents_available: boolean }>('/')
  }

  // 🧪 Métodos para Análises de Código

  /**
   * Iniciar nova análise de código
   */
  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    // Validação local
    if (!request.repo_name?.trim()) {
      throw new Error('Nome do repositório é obrigatório')
    }
    
    if (!request.analysis_type) {
      throw new Error('Tipo de análise é obrigatório')
    }

    // Limpar dados
    const cleanRequest = {
      repo_name: request.repo_name.trim(),
      analysis_type: request.analysis_type,
      branch_name: request.branch_name?.trim() || undefined,
      instrucoes_extras: request.instrucoes_extras?.trim() || undefined
    }

    try {
      const response = await this.makeRequest<StartAnalysisResponse>('/start-analysis', {
        method: 'POST',
        body: JSON.stringify(cleanRequest),
      })

      console.log('✅ Análise iniciada:', response.job_id)
      return response
    } catch (error) {
      console.error('❌ Erro ao iniciar análise:', error)
      throw error
    }
  }

  /**
   * Obter status de um job específico
   */
  async getJobStatus(jobId: string): Promise<JobStatusResponse> {
    if (!jobId?.trim()) {
      throw new Error('ID do job é obrigatório')
    }

    try {
      return await this.makeRequest<JobStatusResponse>(`/status/${jobId.trim()}`)
    } catch (error) {
      console.error(`❌ Erro ao obter status do job ${jobId}:`, error)
      throw error
    }
  }

  /**
   * Aprovar ou rejeitar um job
   */
  async updateJobStatus(request: UpdateJobRequest): Promise<UpdateJobResponse> {
    if (!request.job_id?.trim()) {
      throw new Error('ID do job é obrigatório')
    }

    if (!['approve', 'reject'].includes(request.action)) {
      throw new Error('Ação deve ser "approve" ou "reject"')
    }

    try {
      const response = await this.makeRequest<UpdateJobResponse>('/update-job-status', {
        method: 'POST',
        body: JSON.stringify({
          job_id: request.job_id.trim(),
          action: request.action
        }),
      })

      console.log(`✅ Job ${request.action === 'approve' ? 'aprovado' : 'rejeitado'}:`, response.job_id)
      return response
    } catch (error) {
      console.error(`❌ Erro ao ${request.action === 'approve' ? 'aprovar' : 'rejeitar'} job:`, error)
      throw error
    }
  }

  /**
   * Listar todos os jobs
   */
  async listJobs(): Promise<ListJobsResponse> {
    try {
      return await this.makeRequest<ListJobsResponse>('/jobs')
    } catch (error) {
      console.error('❌ Erro ao listar jobs:', error)
      throw error
    }
  }

  /**
   * Remover um job
   */
  async deleteJob(jobId: string): Promise<{ message: string }> {
    if (!jobId?.trim()) {
      throw new Error('ID do job é obrigatório')
    }

    try {
      const response = await this.makeRequest<{ message: string }>(`/jobs/${jobId.trim()}`, {
        method: 'DELETE'
      })

      console.log('✅ Job removido:', jobId)
      return response
    } catch (error) {
      console.error(`❌ Erro ao remover job ${jobId}:`, error)
      throw error
    }
  }

  // 📄 Métodos para Políticas da Empresa

  /**
   * Upload de nova política
   */
  async uploadPolicy(request: PolicyUploadRequest): Promise<{ id: string; message: string }> {
    if (!request.name?.trim()) {
      throw new Error('Nome da política é obrigatório')
    }

    if (!request.file) {
      throw new Error('Arquivo é obrigatório')
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedTypes.includes(request.file.type)) {
      throw new Error('Tipo de arquivo não suportado. Use PDF, TXT ou DOC/DOCX.')
    }

    // Validar tamanho (máximo 10MB)
    if (request.file.size > 10 * 1024 * 1024) {
      throw new Error('Arquivo muito grande. Máximo permitido: 10MB.')
    }

    const formData = new FormData()
    formData.append('name', request.name.trim())
    formData.append('description', request.description?.trim() || '')
    formData.append('file', request.file)

    try {
      const response = await fetch(`${this.baseUrl}/upload-policy`, {
        method: 'POST',
        body: formData, // Não definir Content-Type para FormData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload falhou: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Política enviada:', result.id)
      return result
    } catch (error) {
      console.error('❌ Erro no upload de política:', error)
      throw error
    }
  }

  /**
   * Listar políticas da empresa
   */
  async getPolicies(): Promise<Policy[]> {
    try {
      return await this.makeRequest<Policy[]>('/policies')
    } catch (error) {
      console.error('❌ Erro ao obter políticas:', error)
      throw error
    }
  }

  /**
   * Remover política
   */
  async deletePolicy(policyId: string): Promise<{ message: string }> {
    if (!policyId?.trim()) {
      throw new Error('ID da política é obrigatório')
    }

    try {
      const response = await this.makeRequest<{ message: string }>(`/policies/${policyId.trim()}`, {
        method: 'DELETE',
      })

      console.log('✅ Política removida:', policyId)
      return response
    } catch (error) {
      console.error(`❌ Erro ao remover política ${policyId}:`, error)
      throw error
    }
  }

  // 📅 Métodos para Análises Agendadas

  /**
   * Criar análise agendada
   */
  async createScheduledAnalysis(analysis: {
    name: string
    repository: string
    branch: string
    analysis_type: string
    frequency: string
    custom_frequency?: string
    next_run?: string
  }): Promise<{ id: string; message: string }> {
    // Validações
    if (!analysis.name?.trim()) {
      throw new Error('Nome da análise é obrigatório')
    }

    if (!analysis.repository?.trim()) {
      throw new Error('Repositório é obrigatório')
    }

    try {
      return await this.makeRequest<{ id: string; message: string }>('/scheduled-analyses', {
        method: 'POST',
        body: JSON.stringify(analysis),
      })
    } catch (error) {
      console.error('❌ Erro ao criar análise agendada:', error)
      throw error
    }
  }

  /**
   * Listar análises agendadas
   */
  async getScheduledAnalyses(): Promise<Array<{
    id: string
    name: string
    repository: string
    branch: string
    analysis_type: string
    frequency: string
    custom_frequency?: string
    next_run: string
    last_run?: string
    status: string
    created_at: string
  }>> {
    try {
      return await this.makeRequest('/scheduled-analyses')
    } catch (error) {
      console.error('❌ Erro ao obter análises agendadas:', error)
      throw error
    }
  }

  /**
   * Atualizar análise agendada
   */
  async updateScheduledAnalysis(
    id: string, 
    updates: Partial<{
      name: string
      repository: string
      branch: string
      analysis_type: string
      frequency: string
      custom_frequency?: string
      status: string
    }>
  ): Promise<{ message: string }> {
    if (!id?.trim()) {
      throw new Error('ID da análise é obrigatório')
    }

    try {
      return await this.makeRequest<{ message: string }>(`/scheduled-analyses/${id.trim()}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      })
    } catch (error) {
      console.error(`❌ Erro ao atualizar análise agendada ${id}:`, error)
      throw error
    }
  }

  /**
   * Remover análise agendada
   */
  async deleteScheduledAnalysis(id: string): Promise<{ message: string }> {
    if (!id?.trim()) {
      throw new Error('ID da análise é obrigatório')
    }

    try {
      return await this.makeRequest<{ message: string }>(`/scheduled-analyses/${id.trim()}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error(`❌ Erro ao remover análise agendada ${id}:`, error)
      throw error
    }
  }

  // 🔧 Métodos Utilitários

  /**
   * Polling automático para status de job
   */
  async pollJobStatus(
    jobId: string, 
    callback: (status: JobStatusResponse) => void,
    interval: number = 2000
  ): Promise<() => void> {
    let isPolling = true
    
    const poll = async () => {
      while (isPolling) {
        try {
          const status = await this.getJobStatus(jobId)
          callback(status)
          
          // Parar polling se job completou, falhou ou foi rejeitado
          if (['completed', 'failed', 'rejected'].includes(status.status)) {
            break
          }
          
          await new Promise(resolve => setTimeout(resolve, interval))
        } catch (error) {
          console.error('Erro no polling:', error)
          // Continuar tentando em caso de erro temporário
          await new Promise(resolve => setTimeout(resolve, interval * 2))
        }
      }
    }

    poll()

    // Retornar função para parar o polling
    return () => {
      isPolling = false
    }
  }

  /**
   * Validar URL do repositório GitHub
   */
  isValidGitHubRepo(repoName: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
    return regex.test(repoName.trim())
  }

  /**
   * Formatar nome do repositório
   */
  formatRepoName(input: string): string {
    // Remover https://github.com/ se presente
    const cleaned = input.replace(/^https?:\/\/github\.com\//, '')
    // Remover trailing slash e .git
    return cleaned.replace(/\/+$/, '').replace(/\.git$/, '')
  }
}

// 🏭 Instância singleton do service
const backendService = new BackendService()

export default backendService

// 🔗 Export nomeado para conveniência
export { backendService }
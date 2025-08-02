// src/lib/services/backend-service.ts - Atualizado para agentes_peers

export interface StartAnalysisRequest {
  repo_name: string
  analysis_type: "design" | "relatorio_teste_unitario" | "seguranca" | "pentest" | "terraform"  // MUDANÇA AQUI
  branch_name?: string
  instrucoes_extras?: string
}

export interface StartAnalysisResponse {
  job_id: string
  report: string
  status: string
  mode?: string
}

export interface JobStatusResponse {
  job_id: string
  status: 'pending_approval' | 'approved' | 'workflow_started' | 'refactoring_code' | 'grouping_commits' | 
          'writing_unit_tests' | 'grouping_tests' | 'populating_data' | 'committing_to_github' | 
          'completed' | 'failed' | 'rejected' | 'reading_repository' | 'analyzing_code'
  repo_name?: string
  analysis_type?: string
  message?: string
  progress?: number
  real_mode?: boolean
  error_details?: string
  last_updated?: number
}

export interface UpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject'
}

export interface AnalysisType {
  key: string
  label: string
  description: string
  icon?: string
}

export interface PolicyUploadRequest {
  name: string
  description: string
  file: File
}

export interface ScheduledAnalysisRequest {
  name: string
  repository: string
  branch: string
  analysis_type: string
  frequency: string
  custom_frequency?: number
  enabled: boolean
}

class BackendService {
  private baseUrl: string
  
  constructor() {
    // Usar variável de ambiente ou URL padrão
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `Backend API error: ${response.status} ${response.statusText}`
        
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.detail) {
            errorMessage += ` - ${errorJson.detail}`
          }
        } catch {
          errorMessage += ` - ${errorText}`
        }
        
        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Não foi possível conectar ao backend em ${this.baseUrl}. Verifique se o servidor está rodando.`)
      }
      throw error
    }
  }

  // Health check do backend
  async healthCheck(): Promise<{ status: string; agente_revisor: string; timestamp: number }> {
    return this.makeRequest<{ status: string; agente_revisor: string; timestamp: number }>('/health')
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

  async updateJobStatus(request: UpdateJobRequest): Promise<{ job_id: string; status: string; message: string }> {
    return this.makeRequest('/update-job-status', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async listJobs(): Promise<{ jobs: JobStatusResponse[]; total: number }> {
    return this.makeRequest<{ jobs: JobStatusResponse[]; total: number }>('/jobs')
  }

  async deleteJob(jobId: string): Promise<{ message: string }> {
    return this.makeRequest(`/jobs/${jobId}`, {
      method: 'DELETE',
    })
  }

  // Tipos de análise disponíveis
  async getAnalysisTypes(): Promise<{ available_types: string[]; mapping: Record<string, string> }> {
    return this.makeRequest<{ available_types: string[]; mapping: Record<string, string> }>('/analysis-types')
  }

  // Retorna lista formatada de tipos de análise para UI
  getAnalysisTypesForUI(): AnalysisType[] {
    return [
      {
        key: 'design',
        label: 'Análise de Design',
        description: 'Avalia arquitetura, padrões de projeto e qualidade do código',
        icon: '🏗️'
      },
      {
        key: 'security',
        label: 'Análise de Segurança',
        description: 'Identifica vulnerabilidades de segurança no código',
        icon: '🔒'
      },
      {
        key: 'pentest',
        label: 'Teste de Penetração',
        description: 'Simula ataques para encontrar falhas de segurança',
        icon: '🎯'
      },
      {
        key: 'terraform',
        label: 'Análise de Terraform',
        description: 'Revisa configurações de infraestrutura como código',
        icon: '🏗️'
      },
      {
        key: 'relatorio_teste_unitario',
        label: 'Relatório de Testes',
        description: 'Analisa cobertura e qualidade dos testes unitários',
        icon: '🧪'
      }
    ]
  }

  // Mapeamento de status para mensagens amigáveis
  getStatusMessage(status: string): string {
    const statusMessages: Record<string, string> = {
      'pending_approval': 'Aguardando aprovação',
      'workflow_started': 'Workflow iniciado',
      'analyzing': 'Analisando código',
      'generating_report': 'Gerando relatório',
      'preparing_recommendations': 'Preparando recomendações',
      'refactoring_code': 'Aplicando refatorações',
      'grouping_commits': 'Agrupando commits',
      'writing_unit_tests': 'Escrevendo testes unitários',
      'grouping_tests': 'Organizando testes',
      'populating_data': 'Preparando dados',
      'committing_to_github': 'Enviando para GitHub',
      'completed': 'Concluído',
      'failed': 'Falhou',
      'rejected': 'Rejeitado'
    }
    
    return statusMessages[status] || status
  }

  // Verifica se um job está em andamento
  isJobInProgress(status: string): boolean {
    const inProgressStatuses = [
      'pending_approval',
      'workflow_started',
      'analyzing',
      'generating_report',
      'preparing_recommendations',
      'refactoring_code',
      'grouping_commits',
      'writing_unit_tests',
      'grouping_tests',
      'populating_data',
      'committing_to_github'
    ]
    
    return inProgressStatuses.includes(status)
  }

  // Verifica se um job foi concluído
  isJobCompleted(status: string): boolean {
    return ['completed', 'failed', 'rejected'].includes(status)
  }

  // Upload de políticas da empresa (placeholder)
  async uploadPolicy(request: PolicyUploadRequest): Promise<{ id: string; message: string }> {
    const formData = new FormData()
    formData.append('name', request.name)
    formData.append('description', request.description)
    formData.append('file', request.file)

    const response = await fetch(`${this.baseUrl}/upload-policy`, {
      method: 'POST',
      body: formData, // Não definir Content-Type para FormData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
  }

  // Políticas da empresa (placeholder)
  async getPolicies(): Promise<Array<{ id: string; name: string; description: string; uploaded_at: string }>> {
    return this.makeRequest<Array<{ id: string; name: string; description: string; uploaded_at: string }>>('/policies')
  }

  async deletePolicy(policyId: string): Promise<{ message: string }> {
    return this.makeRequest(`/policies/${policyId}`, {
      method: 'DELETE',
    })
  }

  // Análises agendadas (placeholder)
  async createScheduledAnalysis(analysis: ScheduledAnalysisRequest): Promise<{ id: string; message: string }> {
    return this.makeRequest('/scheduled-analysis', {
      method: 'POST',
      body: JSON.stringify(analysis),
    })
  }

  async getScheduledAnalyses(): Promise<Array<any>> {
    return this.makeRequest<Array<any>>('/scheduled-analysis')
  }

  async deleteScheduledAnalysis(analysisId: string): Promise<{ message: string }> {
    return this.makeRequest(`/scheduled-analysis/${analysisId}`, {
      method: 'DELETE',
    })
  }

  // Utilitários para formatação
  formatProgress(progress: number): string {
    return `${Math.round(progress)}%`
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('pt-BR')
  }

  // Valida se um repositório tem formato válido
  validateRepositoryFormat(repo: string): boolean {
    // Formato: username/repository ou org/repository
    const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/
    return repoPattern.test(repo)
  }

  // Extrai informações do repositório
  parseRepository(repo: string): { owner: string; name: string } | null {
    if (!this.validateRepositoryFormat(repo)) {
      return null
    }
    
    const [owner, name] = repo.split('/')
    return { owner, name }
  }
}

// Exportar instância singleton
export const backendService = new BackendService()

// Exportar classe para testes
export default BackendService
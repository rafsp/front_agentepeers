// src/lib/services/backend-service.ts

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
  error_details?: string
}

export interface UpdateJobRequest {
  job_id: string
  action: 'approve' | 'reject'
}

export interface PolicyUploadRequest {
  name: string
  description: string
  file: File
}

class BackendService {
  private baseUrl: string
  
  constructor() {
    // Usar variável de ambiente ou URL padrão
    this.baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Backend API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response.json()
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

  // Upload de políticas da empresa
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

  // Políticas da empresa
  async getPolicies(): Promise<Array<{ id: string; name: string; description: string; uploaded_at: string }>> {
    return this.makeRequest<Array<{ id: string; name: string; description: string; uploaded_at: string }>>('/policies')
  }

  async deletePolicy(policyId: string): Promise<{ message: string }> {
    return this.makeRequest(`/policies/${policyId}`, {
      method: 'DELETE',
    })
  }

  // Análises agendadas
  async createScheduledAnalysis(analysis: {
    name: string
    repository: string
    branch: string
    analysis_type: string
    frequency: string
    custom_frequency?: number
    attached_policies: string[]
  }): Promise<{ id: string; message: string }> {
    return this.makeRequest('/scheduled-analyses', {
      method: 'POST',
      body: JSON.stringify(analysis),
    })
  }

  async getScheduledAnalyses(): Promise<Array<{
    id: string
    name: string
    repository: string
    branch: string
    analysis_type: string
    frequency: string
    is_active: boolean
    next_run: string
    last_run?: string
  }>> {
    return this.makeRequest('/scheduled-analyses')
  }

  async updateScheduledAnalysis(id: string, updates: Partial<{
    is_active: boolean
    frequency: string
    custom_frequency?: number
  }>): Promise<{ message: string }> {
    return this.makeRequest(`/scheduled-analyses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  }

  async deleteScheduledAnalysis(id: string): Promise<{ message: string }> {
    return this.makeRequest(`/scheduled-analyses/${id}`, {
      method: 'DELETE',
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      return await this.makeRequest('/health')
    } catch (error) {
      return { status: 'error', message: 'Backend não está acessível' }
    }
  }
}

export const backendService = new BackendService()
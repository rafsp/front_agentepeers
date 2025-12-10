// src/lib/api/codeai-service.ts
// Serviço para integração com o novo backend CodeAI

const CODEAI_API_URL = process.env.NEXT_PUBLIC_CODEAI_API_URL || 
  'https://app-codeai-backend-dev-usc-fngga4fkbkewewdz.centralus-01.azurewebsites.net'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthConfigResponse {
  client_id: string
  tenant_id: string
  authority: string
  redirect_uri: string
  scope: string
}

export interface AuthLoginResponse {
  user_info: Record<string, unknown>
  projects: ProjectListItem[]
}

export interface ProjectListItem {
  nome_projeto: string
  ultima_analysis_type?: string
  created_at?: string
  last_saved_to_blob?: string
  project_id?: string
}

export interface StartAnalysisRequest {
  nome_projeto: string
  analysis_type: string
  comentario_extra?: string
  arquivo_docx?: File
}

export interface StartAnalysisResponse {
  message: string
  project_id: string
  nome_projeto?: string
}

export interface ReportState {
  status?: 'pending' | 'in_progress' | 'done' | 'error'
  progress?: number
  data?: Record<string, unknown>
  error?: string
}

export interface MCPWebhookPayload {
  job_id: string
  status: 'in_progress' | 'done' | 'error'
  progress?: number
  report_data?: Record<string, unknown>
  error_type?: string
  error_message?: string
  project_id?: string
}

// ============================================================================
// SERVICE
// ============================================================================

class CodeAIService {
  private baseUrl: string

  constructor() {
    this.baseUrl = CODEAI_API_URL
  }

  async getAuthConfig(): Promise<AuthConfigResponse> {
    const res = await fetch(`${this.baseUrl}/auth/config`)
    if (!res.ok) throw new Error(`Auth config error: ${res.status}`)
    return res.json()
  }

  async login(): Promise<AuthLoginResponse> {
    const res = await fetch(`${this.baseUrl}/auth/login`, { method: 'POST' })
    if (!res.ok) throw new Error(`Login error: ${res.status}`)
    return res.json()
  }

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const formData = new FormData()
    formData.append('nome_projeto', request.nome_projeto)
    formData.append('analysis_type', request.analysis_type)
    if (request.comentario_extra) formData.append('comentario_extra', request.comentario_extra)
    if (request.arquivo_docx) formData.append('arquivo_docx', request.arquivo_docx)

    const res = await fetch(`${this.baseUrl}/analysis/start`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error(`Analysis error: ${res.status}`)
    return res.json()
  }

  async listProjects(): Promise<ProjectListItem[]> {
    const res = await fetch(`${this.baseUrl}/projects/list`)
    if (!res.ok) throw new Error(`Projects error: ${res.status}`)
    return res.json()
  }

  async checkProject(nomeProjeto: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/projects/check?nome_projeto=${encodeURIComponent(nomeProjeto)}`)
    return res.ok
  }

  async getProjectReports(projectId: string): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.baseUrl}/session/project/${projectId}/reports`)
    if (!res.ok) throw new Error(`Reports error: ${res.status}`)
    return res.json()
  }

  async getProjectReportState(projectId: string, reportType: string): Promise<ReportState> {
    const res = await fetch(`${this.baseUrl}/session/project/${projectId}/report/${reportType}`)
    if (!res.ok) throw new Error(`Report state error: ${res.status}`)
    return res.json()
  }

  async updateProjectReport(projectId: string, reportData: Record<string, unknown>): Promise<void> {
    const res = await fetch(`${this.baseUrl}/session/project/${projectId}/report`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_data: reportData }),
    })
    if (!res.ok) throw new Error(`Update report error: ${res.status}`)
  }

  async saveProjectState(projectId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/session/project/${projectId}/save-state`, { method: 'POST' })
    if (!res.ok) throw new Error(`Save state error: ${res.status}`)
  }

  async getProjectDocxFiles(projectId: string): Promise<string[]> {
    const res = await fetch(`${this.baseUrl}/session/project/${projectId}/docx-files`)
    if (!res.ok) throw new Error(`Docx files error: ${res.status}`)
    return res.json()
  }
}

export const codeAIService = new CodeAIService()
// src/lib/api/codeai-service.ts
// Serviço para comunicação com o backend CodeAI - PEERS

// ============================================================================
// CONFIGURAÇÃO DA API
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_CODEAI_API_URL || 
  process.env.NEXT_PUBLIC_API_URL || 
  'https://app-codeai-backend-dev-usc-fngga4fkbkewewdz.centralus-01.azurewebsites.net'

// ============================================================================
// TIPOS
// ============================================================================

export interface UserContext {
  name: string
  email: string
}

export interface ProjectSummary {
  project_id: string
  nome_projeto: string
  ultima_analysis_type?: string
  ultima_atualizacao?: string
  usuario_executor?: string
}

export interface EpicoItem {
  id: string | number
  titulo: string
  descricao: string
  prioridade?: string
  estimativa_sprints?: number
  perfis?: string[]
}

export interface FeatureItem {
  id: string | number
  epico_id: string | number
  nome: string
  descricao: string
  criterio_de_aceite?: string
  'critério_de_aceite'?: string
  estimativa_dias?: number
  perfil?: string
}

export interface EpicosReport {
  epicos_report: EpicoItem[]
  metadata?: Record<string, unknown>
}

export interface FeaturesReport {
  features_report: FeatureItem[]
  metadata?: Record<string, unknown>
}

export interface ProjectFullState {
  resumo: ProjectSummary | null
  epicos: EpicosReport | null
  features: FeaturesReport | null
  times_descricao: unknown | null
  alocacao_times: unknown | null
  premissas_riscos: unknown | null
}

export interface StartAnalysisRequest {
  nome_projeto: string
  analysis_type: string
  instrucoes_extras?: string
  arquivo_docx?: File
}

export interface StartAnalysisResponse {
  project_id: string
  message?: string
  status?: string
}

export interface LoginResponse {
  user_info: {
    nome: string
    email: string
  }
  projects: ProjectSummary[]
}

// ============================================================================
// LABELS E CONSTANTES
// ============================================================================

export const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  'criacao_epicos_azure_devops': 'Épicos Criados',
  'refinamento_epicos_azure_devops': 'Épicos Refinados',
  'criacao_features_azure_devops': 'Features Criadas',
  'refinamento_features_azure_devops': 'Features Refinadas',
  'criacao_times_azure_devops': 'Times Criados',
  'criacao_alocacao_azure_devops': 'Alocação Criada',
  'criacao_premissas_azure_devops': 'Premissas Criadas',
}

export const ANALYSIS_TYPE_AGENTS: Record<string, string> = {
  'criacao_epicos_azure_devops': 'Epic Generator Agent',
  'refinamento_epicos_azure_devops': 'Epic Refiner Agent',
  'criacao_features_azure_devops': 'Feature Generator Agent',
  'refinamento_features_azure_devops': 'Feature Refiner Agent',
  'criacao_times_azure_devops': 'Team Planner Agent',
  'criacao_alocacao_azure_devops': 'Resource Allocator Agent',
  'criacao_premissas_azure_devops': 'Risk Analyzer Agent',
}

// ============================================================================
// HELPERS - MAPPERS
// ============================================================================

export function mapEpicoToFrontend(epico: EpicoItem) {
  return {
    id: String(epico.id),
    title: epico.titulo,
    description: epico.descricao,
    priority: epico.prioridade || 'Media',
    estimatedSprints: epico.estimativa_sprints || 2,
    profiles: epico.perfis || [],
    selected: false,
  }
}

export function mapFeatureToFrontend(feature: FeatureItem) {
  return {
    id: String(feature.id),
    epicId: String(feature.epico_id),
    code: `F-${feature.id}`,
    title: feature.nome,
    description: feature.descricao,
    profile: feature.perfil || 'Dev',
    days: feature.estimativa_dias || 5,
    acceptanceCriteria: [feature.criterio_de_aceite || feature['critério_de_aceite'] || ''],
  }
}

// ============================================================================
// HELPER - OBTER USUÁRIO LOGADO
// ============================================================================

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
  return null
}

function getLoggedUser(): UserContext {
  let name = getCookie('peers_user_name')
  let email = getCookie('peers_user_email')
  
  if (typeof localStorage !== 'undefined') {
    if (!name) name = localStorage.getItem('peers_user_name')
    if (!email) email = localStorage.getItem('peers_user_email')
  }
  
  return {
    name: name || 'Usuário',
    email: email || 'usuario@peers.com.br',
  }
}

// ============================================================================
// SERVIÇO PRINCIPAL
// ============================================================================

class CodeAIService {
  private apiUrl: string
  private userContext: UserContext | null = null

  constructor() {
    this.apiUrl = API_BASE_URL
    console.log('🚀 CodeAI Service - API URL:', this.apiUrl)
  }

  getApiUrl(): string {
    return this.apiUrl
  }

  setUserContext(user: UserContext) {
    this.userContext = user
  }

  private getCurrentUser(): UserContext {
    if (this.userContext) return this.userContext
    return getLoggedUser()
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/`, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
      })
      return response.ok
    } catch {
      return false
    }
  }

  // ============================================================================
  // LOGIN / PROJETOS
  // ============================================================================

  async loginDev(): Promise<LoginResponse> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/login-dev`
    
    console.log('🔐 POST', url, '| Usuário:', user.email)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          usuario_executor: user.email,
          nome_usuario: user.name,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      return {
        user_info: { nome: user.name, email: user.email },
        projects: data.projects || data.projetos || [],
      }
    } catch (error) {
      console.error('❌ Erro login:', error)
      return {
        user_info: { nome: user.name, email: user.email },
        projects: [],
      }
    }
  }

  async getProjects(): Promise<ProjectSummary[]> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/projetos?usuario=${encodeURIComponent(user.email)}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return data.projects || data.projetos || data || []
    } catch (error) {
      console.error('❌ Erro projetos:', error)
      return []
    }
  }

  // ============================================================================
  // ANÁLISES
  // ============================================================================

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const user = this.getCurrentUser()

    if (request.arquivo_docx) {
      const formData = new FormData()
      formData.append('nome_projeto', request.nome_projeto)
      formData.append('analysis_type', request.analysis_type)
      formData.append('usuario_executor', user.email)
      formData.append('nome_usuario', user.name)
      if (request.instrucoes_extras) formData.append('instrucoes_extras', request.instrucoes_extras)
      formData.append('arquivo_docx', request.arquivo_docx)

      const response = await fetch(`${this.apiUrl}/start-analysis-upload`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      return await response.json()
    }

    const payload = {
      nome_projeto: request.nome_projeto,
      analysis_type: request.analysis_type,
      instrucoes_extras: request.instrucoes_extras || '',
      usuario_executor: user.email,
      nome_usuario: user.name,
    }

    const response = await fetch(`${this.apiUrl}/start-analysis`, {
      method: 'POST',
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    return await response.json()
  }

  // ============================================================================
  // RELATÓRIOS DO PROJETO
  // ============================================================================

  async getProjectReports(projectId: string): Promise<ProjectFullState> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/project-reports/${encodeURIComponent(projectId)}?usuario=${encodeURIComponent(user.email)}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      console.error('❌ Erro relatórios:', error)
      return {
        resumo: null,
        epicos: null,
        features: null,
        times_descricao: null,
        alocacao_times: null,
        premissas_riscos: null,
      }
    }
  }

  // ============================================================================
  // POLLING
  // ============================================================================

  async pollForResults(
    projectId: string,
    reportType: 'epicos' | 'features' | 'times' | 'alocacao' | 'premissas',
    onProgress?: (message: string) => void,
    maxAttempts: number = 60,
    intervalMs: number = 3000
  ): Promise<EpicoItem[] | FeatureItem[] | unknown> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      onProgress?.(`Aguardando ${reportType}... (${attempt + 1}/${maxAttempts})`)

      try {
        const state = await this.getProjectReports(projectId)

        if (reportType === 'epicos' && state.epicos?.epicos_report?.length) {
          onProgress?.('✅ Épicos recebidos!')
          return state.epicos.epicos_report
        }
        if (reportType === 'features' && state.features?.features_report?.length) {
          onProgress?.('✅ Features recebidas!')
          return state.features.features_report
        }
        if (reportType === 'times' && state.times_descricao) {
          onProgress?.('✅ Times recebidos!')
          return state.times_descricao
        }
        if (reportType === 'alocacao' && state.alocacao_times) {
          onProgress?.('✅ Alocação recebida!')
          return state.alocacao_times
        }
        if (reportType === 'premissas' && state.premissas_riscos) {
          onProgress?.('✅ Premissas recebidas!')
          return state.premissas_riscos
        }
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt + 1} falhou`)
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    throw new Error(`Timeout aguardando ${reportType}`)
  }

  // ============================================================================
  // SALVAR
  // ============================================================================

  async saveProjectState(projectId: string): Promise<void> {
    const user = this.getCurrentUser()

    const response = await fetch(`${this.apiUrl}/save-project`, {
      method: 'POST',
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        project_id: projectId,
        usuario_executor: user.email,
        nome_usuario: user.name,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  }

  logout() {
    this.userContext = null
  }
}

export const codeAIService = new CodeAIService()
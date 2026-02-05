// src/lib/api/codeai-service.ts
// Serviço para comunicação com o backend CodeAI - PEERS
// Endpoints baseados no Swagger: /docs

// ============================================================================
// CONFIGURAÇÃO DA API
// ============================================================================

const API_BASE_URL = 'https://app-codeai-backend-dev-usc-fngga4fkbkewewdz.centralus-01.azurewebsites.net'

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
  epicos_timeline: unknown | null
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
  job_id?: string
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
  'criacao_epicos_timeline': 'Cronograma Criado',
}

export const ANALYSIS_TYPE_AGENTS: Record<string, string> = {
  'criacao_epicos_azure_devops': 'Epic Generator Agent',
  'refinamento_epicos_azure_devops': 'Epic Refiner Agent',
  'criacao_features_azure_devops': 'Feature Generator Agent',
  'refinamento_features_azure_devops': 'Feature Refiner Agent',
  'criacao_times_azure_devops': 'Team Planner Agent',
  'criacao_alocacao_azure_devops': 'Resource Allocator Agent',
  'criacao_premissas_azure_devops': 'Risk Analyzer Agent',
  'criacao_premissas_riscos': 'Risk Analysis Agent',
  'criacao_epicos_timeline': 'Timeline Planner Agent',
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
  private currentJobId: string | null = null // Armazena o job_id da última análise

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
  // AUTH - POST /auth/login
  // ============================================================================

  async loginDev(): Promise<LoginResponse> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/auth/login`
    
    console.log('🔐 POST', url, '| Usuário:', user.email)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          email: user.email,
          nome: user.name,
        }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      console.log('✅ Login response:', data)
      
      return {
        user_info: { nome: user.name, email: user.email },
        projects: data.projects || data.projetos || [],
      }
    } catch (error) {
      console.error('❌ Erro login:', error)
      const projects = await this.getProjects()
      return {
        user_info: { nome: user.name, email: user.email },
        projects,
      }
    }
  }

  // ============================================================================
  // PROJECTS - GET /projects/list
  // ============================================================================

  async getProjects(): Promise<ProjectSummary[]> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/projects/list?email=${encodeURIComponent(user.email)}`

    console.log('📂 GET', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.log('✅ Projects response:', data)
      return data.projects || data.projetos || data || []
    } catch (error) {
      console.error('❌ Erro projetos:', error)
      return []
    }
  }

  // ============================================================================
  // ANALYSIS - POST /analysis/start
  // IMPORTANTE: Backend SEMPRE espera FormData, não JSON
  // ============================================================================

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/analysis/start`

    console.log('🚀 POST', url, '| Tipo:', request.analysis_type)

const formData = new FormData()
formData.append('nome_projeto', request.nome_projeto)
formData.append('analysis_type', request.analysis_type)
formData.append('email', user.email)
formData.append('nome', user.name)

    // ✅ CORREÇÃO: Campo é "comentario_extra" (como no Colab)
    if (request.instrucoes_extras) {
      formData.append('comentario_extra', request.instrucoes_extras)
    }

    // ✅ CORREÇÃO: Campo é "arquivo_docx" (como no Colab)
    if (request.arquivo_docx) {
      formData.append('arquivo_docx', request.arquivo_docx)
    }

    console.log('📦 FormData:', {
      nome_projeto: request.nome_projeto,
      analysis_type: request.analysis_type,
      email: user.email,
      nome: user.name,
      instrucoes_extras: request.instrucoes_extras || '',
      arquivo: request.arquivo_docx?.name || 'N/A'
    })

    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
      const data = await response.json()
      console.log('✅ Analysis response:', data)
      console.log('   - project_id:', data.project_id)
      console.log('   - job_id:', data.job_id)

      // CRÍTICO: Armazena o job_id para polling (OBRIGATÓRIO)
      if (data.job_id) {
        this.currentJobId = data.job_id
        console.log('📌 Job ID capturado e armazenado:', this.currentJobId)
      } else {
        console.error('❌ ALERTA: Backend não retornou job_id!')
        console.error('   Campos recebidos:', Object.keys(data))
      }

      return data
  }

  // ============================================================================
  // CHECK PROJECT - GET /projects/check?nome_projeto=X
  // Retorna estado completo incluindo last_job_id
  // ============================================================================

  async checkProject(projectName: string): Promise<{ exists: boolean; state: ProjectFullState | null; lastJobId: string | null }> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/projects/check?nome_projeto=${encodeURIComponent(projectName)}`

    console.log('🔎 GET (check project)', url)

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        console.warn('⚠️ Check project failed:', response.status)
        return { exists: false, state: null, lastJobId: null }
      }

      const data = await response.json()
      console.log('✅ Check project response:', data)

      const lastJobId = data.state?.resumo?.last_job_id || data.state?.last_job_id || null
      
      return {
        exists: data.exists || false,
        state: data.state || null,
        lastJobId,
      }
    } catch (error) {
      console.error('❌ Erro check project:', error)
      return { exists: false, state: null, lastJobId: null }
    }
  }

  // ============================================================================
  // REPORTS - GET /session/project/{project_id}/{job_id}/reports
  // Endpoint correto conforme Swagger
  // ============================================================================

  async getProjectReports(projectId: string, jobId?: string): Promise<ProjectFullState> {
  const user = this.getCurrentUser()
  const effectiveJobId = jobId || this.currentJobId
  
  // OBRIGATÓRIO: job_id é necessário (como no notebook)
  if (!effectiveJobId) {
    console.error('❌ job_id não disponível para polling!')
    console.error('   projectId:', projectId)
    console.error('   this.currentJobId:', this.currentJobId)
    throw new Error('job_id é obrigatório para buscar reports. Verifique se startAnalysis retornou job_id.')
  }
  
  // URL CORRETA: /session/project/{project_id}/{job_id}/reports
  // Igual ao notebook: endpoint_report = f"{BASE_URL}/session/project/{project_id_global}/{job_id_global}/reports"
  const url = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/${encodeURIComponent(effectiveJobId)}/reports?email=${encodeURIComponent(user.email)}`
  
  console.log('📊 GET (com job_id)', url)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'omit',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro no polling:', response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ Reports response:', data)
    return data
  } catch (error) {
    console.error('❌ Erro relatórios:', error)
    throw error  // Propagar erro ao invés de retornar vazio
  }
}

  // ============================================================================
  // REPORTS BY NAME - usa /projects/check para obter state direto
  // Alternativa quando não temos job_id
  // ============================================================================

  async getProjectReportsByName(projectName: string): Promise<ProjectFullState> {
    const { exists, state } = await this.checkProject(projectName)
    
    if (!exists || !state) {
      console.warn('⚠️ Projeto não encontrado:', projectName)
      return {
        resumo: null,
        epicos: null,
        epicos_timeline: null,
        features: null,
        times_descricao: null,
        alocacao_times: null,
        premissas_riscos: null,
      }
    }
    
    console.log('✅ Reports via check project:', state)
    return state as ProjectFullState
  }

  // ============================================================================
  // REPORT BY TYPE - GET /session/project/{project_id}/report/{report_type}
  // ============================================================================

  async getProjectReportByType(projectId: string, reportType: string): Promise<unknown> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/report/${reportType}?email=${encodeURIComponent(user.email)}`

    console.log('📊 GET', url)

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
      console.error('❌ Erro report type:', error)
      return null
    }
  }

  // ============================================================================
  // SAVE STATE - POST /session/project/{project_id}/save-state
  // ============================================================================

  async saveProjectState(projectId: string): Promise<void> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/save-state`

    console.log('💾 POST', url)

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        email: user.email,
        nome: user.name,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    console.log('✅ Save state OK')
  }

  // ============================================================================
  // UPDATE REPORT - PUT /session/project/{project_id}/report
  // ============================================================================

  async updateProjectReport(projectId: string, reportData: unknown): Promise<void> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/report`

    console.log('📝 PUT', url)

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        email: user.email,
        nome: user.name,
        report: reportData,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    console.log('✅ Update report OK')
  }

  // ============================================================================
  // POLLING - Aguarda resultados com retry
  // ============================================================================

  async pollForResults(
    projectId: string,
    reportType: 'epicos' | 'features' | 'times' | 'alocacao' | 'premissas' | 'timeline',
    onProgress?: (message: string) => void,
    maxAttempts: number = 60,
    intervalMs: number = 5000, // 5 segundos entre tentativas
    projectName?: string // Nome do projeto para fallback
  ): Promise<EpicoItem[] | FeatureItem[] | unknown> {
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      onProgress?.(`Aguardando ${reportType}... (${attempt + 1}/${maxAttempts})`)

      try {
        let state: ProjectFullState | null = null
        
        // PRIMEIRO: Tenta pelo endpoint /reports com o currentJobId (job atual)
        // Este é o endpoint que retorna o resultado do processamento em andamento
        if (this.currentJobId) {
          try {
            state = await this.getProjectReports(projectId, this.currentJobId)
            console.log(`📊 Polling via /reports (job: ${this.currentJobId.slice(0,8)}...)`)
          } catch (e) {
            console.warn('⚠️ /reports falhou, tentando /projects/check')
          }
        }
        
        // FALLBACK: Se /reports não funcionou, tenta /projects/check
        // Útil para dados já persistidos
        if (!state && projectName) {
          try {
            state = await this.getProjectReportsByName(projectName)
            console.log(`📊 Polling via /projects/check`)
          } catch (e) {
            console.warn('⚠️ /projects/check também falhou')
          }
        }
        
        // Se ainda não tem state, tenta getProjectReports sem job específico
        if (!state) {
          state = await this.getProjectReports(projectId)
        }

        // Verifica se o reportType solicitado está disponível
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
        if (reportType === 'timeline' && state.epicos_timeline) {
          onProgress?.('✅ Cronograma recebido!')
          return state.epicos_timeline
        }
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt + 1} falhou:`, error)
      }

      // Aguarda antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    throw new Error(`Timeout aguardando ${reportType} após ${maxAttempts} tentativas`)
  }

  // ============================================================================
  // LOGOUT
  // ============================================================================

  logout() {
    this.userContext = null
    this.currentJobId = null
  }
}

export const codeAIService = new CodeAIService()
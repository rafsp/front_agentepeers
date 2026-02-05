// src/lib/api/codeai-service.ts
// Serviço para comunicação com o backend CodeAI - PEERS
// Endpoints baseados no Swagger: /docs
// ⚠️ CORRIGIDO: Alinhado 100% com o notebook teste_inicial_do_backend.ipynb

// ============================================================================
// CONFIGURAÇÃO DA API
// ============================================================================

const API_BASE_URL = 'https://app-codeai-backend-dev-usc-fngga4fkbkewewdz.centralus-01.azurewebsites.net'

// ============================================================================
// MOCK USER HEADER - Exatamente como no notebook
// ============================================================================

const MOCK_USER_HEADER = {
  sub: 'user-frontend-dev',
  usuario_executor: 'dev@peers.com.br',
  name: 'Frontend Developer',
  email: 'dev@peers.com.br',
  roles: ['admin'],
}

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
  [key: string]: ProjectSummary | EpicosReport | FeaturesReport | unknown | null
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
  'criacao_premissas_riscos': 'Premissas e Riscos',
  'criacao_epicos_timeline': 'Cronograma Criado',
  'refinamento_epicos_timeline': 'Cronograma Refinado',
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
  'refinamento_epicos_timeline': 'Timeline Refiner Agent',
}

// ============================================================================
// MAPEAMENTO: analysis_type → seção do report e chave do relatório
// Extraído diretamente do notebook (cells 8,10,12,14,16,18)
// ============================================================================

const REPORT_SECTION_MAP: Record<string, { section: string; reportKey: string }> = {
  // Épicos
  'criacao_epicos_azure_devops':     { section: 'epicos',           reportKey: 'epicos_report' },
  'refinamento_epicos_azure_devops': { section: 'epicos',           reportKey: 'epicos_report' },
  // Features
  'criacao_features_azure_devops':   { section: 'features',         reportKey: 'features_report' },
  'refinamento_features_azure_devops': { section: 'features',       reportKey: 'features_report' },
  // Timeline
  'criacao_epicos_timeline':         { section: 'epicos_timeline',  reportKey: 'epicos_timeline_report' },
  'refinamento_epicos_timeline':     { section: 'epicos_timeline',  reportKey: 'epicos_timeline_report' },
  // Premissas e Riscos
  'criacao_premissas_riscos':        { section: 'premissas_riscos', reportKey: 'premissas_riscos_report' },
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
  private currentJobId: string | null = null
  private lastAnalysisType: string | null = null // [FIX-6] Rastrear tipo para polling inteligente

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

  // ==========================================================================
  // [FIX-1] HEADERS - Agora inclui Authorization e X-Test-User-Json
  // EXATAMENTE como o notebook faz em TODAS as requisições
  // ==========================================================================

  private getHeaders(): HeadersInit {
    const user = this.getCurrentUser()
    const mockHeader = {
      ...MOCK_USER_HEADER,
      usuario_executor: user.email,
      name: user.name,
      email: user.email,
    }

    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer token_mock',
      'X-Test-User-Json': JSON.stringify(mockHeader),
    }
  }

  // Headers para FormData (sem Content-Type, browser define automaticamente)
  private getFormDataHeaders(): HeadersInit {
    const user = this.getCurrentUser()
    const mockHeader = {
      ...MOCK_USER_HEADER,
      usuario_executor: user.email,
      name: user.name,
      email: user.email,
    }

    return {
      'Accept': 'application/json',
      'Authorization': 'Bearer token_mock',
      'X-Test-User-Json': JSON.stringify(mockHeader),
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
  //
  // [FIX-2] Campo 'instrucoes_extras' → 'comentario_extra' (como notebook)
  // [FIX-3] Campo 'arquivo' → 'arquivo_docx' (como notebook)
  // [FIX-1] Agora envia headers de auth (como notebook)
  // ============================================================================

  async startAnalysis(request: StartAnalysisRequest): Promise<StartAnalysisResponse> {
    const user = this.getCurrentUser()
    const url = `${this.apiUrl}/analysis/start`

    console.log('🚀 POST', url, '| Tipo:', request.analysis_type)

    // SEMPRE usar FormData (backend espera multipart/form-data)
    const formData = new FormData()
    formData.append('nome_projeto', request.nome_projeto)
    formData.append('analysis_type', request.analysis_type)

    // [FIX-2] CAMPO CORRETO: 'comentario_extra' (NÃO 'instrucoes_extras')
    formData.append('comentario_extra', request.instrucoes_extras || '')

    // [FIX-3] CAMPO CORRETO: 'arquivo_docx' (NÃO 'arquivo')
    if (request.arquivo_docx) {
      formData.append('arquivo_docx', request.arquivo_docx)
    }

    console.log('📦 FormData:', {
      nome_projeto: request.nome_projeto,
      analysis_type: request.analysis_type,
      comentario_extra: request.instrucoes_extras || '(vazio)',
      arquivo_docx: request.arquivo_docx?.name || 'N/A',
    })

    // [FIX-1] Envia headers de auth (como notebook: headers_upload)
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getFormDataHeaders(),
      mode: 'cors',
      credentials: 'omit',
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erro startAnalysis:', response.status, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ Analysis response:', data)

    // Armazena o job_id e analysis_type para polling
    if (data.job_id) {
      this.currentJobId = data.job_id
      console.log('📌 Job ID armazenado:', this.currentJobId)
    }

    // [FIX-6] Armazena o tipo para polling inteligente
    this.lastAnalysisType = request.analysis_type

    return data
  }

  // ============================================================================
  // CHECK PROJECT - GET /projects/check?nome_projeto=X
  // ============================================================================

  async checkProject(
    projectName: string
  ): Promise<{ exists: boolean; state: ProjectFullState | null; lastJobId: string | null }> {
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
  //
  // [FIX-4] SEMPRE usa job_id no path (como notebook)
  // [FIX-1] Envia auth headers (como notebook: headers_get)
  // ============================================================================

  async getProjectReports(projectId: string, jobId?: string): Promise<ProjectFullState> {
    const effectiveJobId = jobId || this.currentJobId

    // [FIX-4] Endpoint SEMPRE com job_id (como notebook)
    if (effectiveJobId) {
      const url = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/${encodeURIComponent(effectiveJobId)}/reports`
      console.log('📊 GET (with job_id)', url)

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders(),
          mode: 'cors',
          credentials: 'omit',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Reports response (with job_id):', Object.keys(data))
          return data
        } else {
          console.warn('⚠️ Reports com job_id retornou:', response.status)
        }
      } catch (error) {
        console.warn('⚠️ Erro com job_id:', error)
      }
    }

    // Fallback: tenta sem job_id (endpoint pode não existir em todos os backends)
    const fallbackUrl = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/reports`
    console.log('📊 GET (fallback sem job_id)', fallbackUrl)

    try {
      const response = await fetch(fallbackUrl, {
        method: 'GET',
        headers: this.getHeaders(),
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      console.log('✅ Reports response (fallback):', Object.keys(data))
      return data
    } catch (error) {
      console.error('❌ Erro relatórios:', error)
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
  }

  // ============================================================================
  // REPORTS BY NAME - usa /projects/check para obter state
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

    console.log('✅ Reports via check project:', Object.keys(state))
    return state as ProjectFullState
  }

  // ============================================================================
  // REPORT BY TYPE - GET /session/project/{project_id}/report/{report_type}
  // ============================================================================

  async getProjectReportByType(projectId: string, reportType: string): Promise<unknown> {
    const url = `${this.apiUrl}/session/project/${encodeURIComponent(projectId)}/report/${reportType}`

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
  //
  // [FIX-5] Verificação correta por seção + reportKey (como notebook)
  //         Notebook: estado_secao.get(tipo_relatorio, []) → verifica se lista não vazia
  //         Antes: checava apenas se a seção existia (truthy), não se tinha conteúdo
  // ============================================================================

  async pollForResults(
    projectId: string,
    reportType: 'epicos' | 'features' | 'times' | 'alocacao' | 'premissas' | 'timeline',
    onProgress?: (message: string) => void,
    maxAttempts: number = 60,
    intervalMs: number = 5000,
    projectName?: string
  ): Promise<EpicoItem[] | FeatureItem[] | unknown> {

    // [FIX-5] Mapear reportType para section/reportKey corretos
    const sectionMap: Record<string, { section: string; reportKey: string }> = {
      'epicos':    { section: 'epicos',           reportKey: 'epicos_report' },
      'features':  { section: 'features',         reportKey: 'features_report' },
      'timeline':  { section: 'epicos_timeline',  reportKey: 'epicos_timeline_report' },
      'premissas': { section: 'premissas_riscos', reportKey: 'premissas_riscos_report' },
      'times':     { section: 'times_descricao',  reportKey: 'times_descricao_report' },
      'alocacao':  { section: 'alocacao_times',   reportKey: 'alocacao_times_report' },
    }

    const mapping = sectionMap[reportType]
    if (!mapping) {
      throw new Error(`Tipo de relatório desconhecido: ${reportType}`)
    }

    console.log(`🔄 Polling iniciado: tipo=${reportType}, seção=${mapping.section}, chave=${mapping.reportKey}`)

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      onProgress?.(`Aguardando ${reportType}... (${attempt + 1}/${maxAttempts})`)

      try {
        let state: ProjectFullState | null = null

        // PRIMEIRO: Tenta pelo endpoint /reports com o currentJobId
        if (this.currentJobId) {
          try {
            state = await this.getProjectReports(projectId, this.currentJobId)
            console.log(`📊 Polling via /reports (job: ${this.currentJobId.slice(0, 8)}...)`)
          } catch (e) {
            console.warn('⚠️ /reports falhou, tentando /projects/check')
          }
        }

        // FALLBACK: Se /reports não funcionou, tenta /projects/check
        if (!state && projectName) {
          try {
            state = await this.getProjectReportsByName(projectName)
            console.log('📊 Polling via /projects/check')
          } catch (e) {
            console.warn('⚠️ /projects/check também falhou')
          }
        }

        // Se ainda não tem state, tenta getProjectReports sem job específico
        if (!state) {
          state = await this.getProjectReports(projectId)
        }

        // [FIX-5] Verificação CORRETA: seção → reportKey → conteúdo não vazio
        // Exatamente como notebook: estado_secao = full_state.get(chave_principal) or {}
        //                           conteudo = estado_secao.get(tipo_relatorio, [])
        const sectionData = (state as Record<string, unknown>)[mapping.section]
        if (sectionData && typeof sectionData === 'object') {
          const reportContent = (sectionData as Record<string, unknown>)[mapping.reportKey]

          if (Array.isArray(reportContent) && reportContent.length > 0) {
            onProgress?.(`✅ ${reportType} recebidos! (${reportContent.length} itens)`)
            console.log(`✅ ${reportType}: ${reportContent.length} itens encontrados na seção '${mapping.section}.${mapping.reportKey}'`)
            return reportContent
          }

          // Para premissas_riscos, o conteúdo pode ser um objeto (não array)
          if (reportType === 'premissas' && reportContent && typeof reportContent === 'object' && !Array.isArray(reportContent)) {
            onProgress?.('✅ Premissas e Riscos recebidos!')
            console.log('✅ premissas_riscos: objeto recebido')
            return reportContent
          }

          // Fallback: se a seção existe mas reportKey não tem dados,
          // talvez o backend retorne direto na seção (sem wrapper)
          if (!reportContent && sectionData) {
            // Checkar se a própria seção tem dados úteis (ex: array direto)
            if (Array.isArray(sectionData) && sectionData.length > 0) {
              onProgress?.(`✅ ${reportType} recebidos! (${sectionData.length} itens, formato direto)`)
              return sectionData
            }
            // Para premissas, pode vir como { premissas: [...], riscos: [...] } direto
            if (reportType === 'premissas') {
              const sd = sectionData as Record<string, unknown>
              if (sd.premissas || sd.riscos) {
                onProgress?.('✅ Premissas e Riscos recebidos!')
                return sectionData
              }
            }
          }
        }

        console.log(`⏳ Tentativa ${attempt + 1}: '${mapping.section}.${mapping.reportKey}' ainda vazio`)

      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt + 1} falhou:`, error)
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs))
    }

    throw new Error(`Timeout aguardando ${reportType} após ${maxAttempts} tentativas`)
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  logout(): void {
    this.userContext = null
    this.currentJobId = null
    this.lastAnalysisType = null
  }

  getUser(): UserContext | null {
    return this.userContext
  }

  getCurrentJobId(): string | null {
    return this.currentJobId
  }

  isDevMode(): boolean {
    return true
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const codeAIService = new CodeAIService()
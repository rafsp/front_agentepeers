// lib/api.ts
import type { FrontendAnalysisType } from '@/lib/analysis-mapper'

//const API_BASE_URL = 'https://poc-agent-revisor-b8cca2f2g2h8f4b5.centralus-01.azurewebsites.net'

const API_BASE_URL = 'https://poc-agent-revisor-teste-c8c2cucda0hcdxbj.centralus-01.azurewebsites.net'
// Tipos para as APIs
export interface StartAnalysisRequest {
  repository: string
  branch: string
  analysisType: FrontendAnalysisType
  extraInstructions?: string
}

export interface StartAnalysisResponse {
  job_id: string
  report: string
}

export interface JobStatusResponse {
  job_id: string
  status: string
  message?: string
  progress?: number
  error_details?: string
  last_updated?: number
  report?: string
}

export interface UpdateJobStatusRequest {
  job_id: string
  action: 'approve' | 'reject'
}

// Mapeamento de tipos frontend -> backend
const mapAnalysisTypeToBackend = (frontendType: FrontendAnalysisType): string => {
  const typeMap: Record<FrontendAnalysisType, string> = {
    'design': 'design',
    'refatoracao': 'design',
    'docstring': 'design', 
    'security': 'design',
    'pentest': 'design',
    'relatorio_teste_unitario': 'relatorio_teste_unitario',
    'escrever_testes': 'relatorio_teste_unitario',
    'terraform': 'design'
  }
  
  return typeMap[frontendType] || 'design'
}

// Funções da API
export const startAnalysis = async (params: StartAnalysisRequest): Promise<StartAnalysisResponse> => {
  const response = await fetch(`${API_BASE_URL}/start-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo_name: params.repository,
      branch_name: params.branch,
      analysis_type: mapAnalysisTypeToBackend(params.analysisType),
      instrucoes_extras: params.extraInstructions
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Erro de comunicação' }))
    throw new Error(errorData.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

export const updateJobStatus = async (jobId: string, action: 'approve' | 'reject'): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/update-job-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_id: jobId,
      action
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Erro de comunicação' }))
    throw new Error(errorData.detail || `HTTP ${response.status}`)
  }
}

export const getJobStatus = async (jobId: string): Promise<JobStatusResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status/${jobId}`)
    
    if (!response.ok) {
      console.warn(`Erro ao buscar status do job ${jobId}: HTTP ${response.status}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.warn(`Erro de rede ao buscar status do job ${jobId}:`, error)
    return null
  }
}

export const listJobs = async (): Promise<{ jobs: Record<string, any> }> => {
  // Esta função não existe no backend atual, então retornamos um objeto vazio
  // Pode ser implementada futuramente se necessário
  return { jobs: {} }
}

export const checkBackendHealth = async (): Promise<{ status: string; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    throw new Error('Backend não está respondendo')
  }
}

export const testGithubAccess = async (repoName: string, branchName: string = 'main') => {
  try {
    const response = await fetch(`${API_BASE_URL}/test-github/${repoName}?branch_name=${branchName}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    throw new Error('Erro ao testar acesso ao repositório')
  }
}
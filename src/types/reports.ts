// src/types/reports.ts
// Tipos TypeScript para o modulo de relatorios - PEERS CodeAI

// ============================================================================
// EPICOS
// ============================================================================

export type PrioridadeEstrategica = 'Critica' | 'Alta' | 'Media' | 'Baixa'

export interface Epico {
  id: string
  titulo: string
  business_case: string
  entregaveis_macro: string[]
  squad_sugerida: string[]
  estimativa_semanas: string
  prioridade_estrategica: PrioridadeEstrategica
}

export interface EpicosReportData {
  project_name: string
  epicos: Epico[]
  metadata?: {
    generated_at?: string
    total_epicos?: number
    criticos?: number
  }
}

// ============================================================================
// FEATURES
// ============================================================================

export type TipoFeature = 'Backend' | 'Frontend' | 'Infra' | 'Dados' | 'Design' | 'QA'
export type ComplexidadeFeature = 'Alta' | 'Media' | 'Baixa'

export interface Feature {
  id: string
  epic_id: string
  titulo: string
  tipo: TipoFeature | string
  complexidade: ComplexidadeFeature
  descricao: string
  criterios_aceite: string[]
}

export interface FeaturesReportData {
  project_name: string
  features: Feature[]
  epic_titles?: Record<string, string>
  metadata?: {
    generated_at?: string
    total_features?: number
    por_tipo?: Record<string, number>
    por_complexidade?: Record<string, number>
  }
}

// ============================================================================
// CRONOGRAMA
// ============================================================================

export interface CronogramaStep {
  semana: number
  fase: string
  atividades_focadas: string
  progresso_estimado: string
  justificativa_agendamento?: string
}

export interface CronogramaEpico {
  epic_id: string
  epic_name: string
  steps: CronogramaStep[]
}

export interface CronogramaReportData {
  project_name: string
  cronograma: CronogramaEpico[]
  max_semanas?: number
  metadata?: {
    generated_at?: string
    duracao_total?: string
  }
}

// ============================================================================
// PREMISSAS E RISCOS
// ============================================================================

export interface Premissa {
  id: string
  descricao: string
  impacto_se_falhar: string
}

export type ProbabilidadeRisco = 'Alta' | 'Media' | 'Baixa'
export type ImpactoRisco = 'Critico' | 'Alto' | 'Medio' | 'Baixo'

export interface Risco {
  id: string
  descricao: string
  probabilidade: ProbabilidadeRisco
  impacto: ImpactoRisco
  plano_mitigacao: string
}

export interface PremissasRiscosReportData {
  project_name: string
  premissas: Premissa[]
  riscos: Risco[]
  metadata?: {
    generated_at?: string
    total_premissas?: number
    total_riscos?: number
    riscos_criticos?: number
    riscos_prob_alta?: number
  }
}

// ============================================================================
// TIPOS UTILITARIOS
// ============================================================================

export type ReportType = 'epicos' | 'features' | 'cronograma' | 'premissas-riscos'

export interface ReportExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'image'
  filename?: string
  includeMetadata?: boolean
}

export interface ReportLoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface BaseReportProps {
  projectId: string
  projectName?: string
  onExport?: (options: ReportExportOptions) => void
  className?: string
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const PRIORIDADE_COLORS: Record<PrioridadeEstrategica, string> = {
  'Critica': '#ef4444',
  'Alta': '#f97316',
  'Media': '#eab308',
  'Baixa': '#22c55e',
}

export const COMPLEXIDADE_COLORS: Record<ComplexidadeFeature, string> = {
  'Alta': '#ef4444',
  'Media': '#f59e0b',
  'Baixa': '#10b981',
}

export const TIPO_FEATURE_COLORS: Record<string, string> = {
  'Backend': '#6366f1',
  'Frontend': '#8b5cf6',
  'Infra': '#f97316',
  'Dados': '#06b6d4',
  'Design': '#ec4899',
  'QA': '#14b8a6',
}

export const PROBABILIDADE_ORDER: Record<ProbabilidadeRisco, number> = {
  'Alta': 3,
  'Media': 2,
  'Baixa': 1,
}

export const IMPACTO_ORDER: Record<ImpactoRisco, number> = {
  'Critico': 4,
  'Alto': 3,
  'Medio': 2,
  'Baixo': 1,
}
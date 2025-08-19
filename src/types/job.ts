// types/job.ts - Tipos atualizados para os novos status
export type JobStatus = 
  | 'pending'
  | 'iniciando_relatorio' 
  | 'lendo_codigos'
  | 'validando_praticas'
  | 'pending_approval'
  | 'approved'
  | 'running'
  | 'refactoring_code'
  | 'grouping_commits'
  | 'writing_unit_tests'
  | 'grouping_tests'
  | 'populating_data'
  | 'committing_to_github'
  | 'completed'
  | 'failed'
  | 'rejected'

export type FrontendAnalysisType = 
  | 'design'
  | 'pentest'
  | 'seguranca'
  | 'terraform'
  | 'refatoracao'
  | 'relatorio_teste_unitario'
  | 'escrever_testes'
  | 'agrupamento_testes'
  | 'docstring'
  | 'agrupamento_design'

export interface Job {
  id: string
  backendJobId?: string
  repository: string
  branch: string
  analysisType: FrontendAnalysisType
  status: JobStatus
  message?: string
  progress?: number
  createdAt: Date
  completedAt?: Date
  initialReport?: string
  report?: string
  instructions?: string
  lastUpdated?: number
}

export interface CreateJobRequest {
  repository: string
  branch?: string
  analysis_type: FrontendAnalysisType
  extra_instructions?: string
}

export interface JobResponse {
  job_id: string
  status: JobStatus
  message?: string
  progress?: number
  repository: string
  analysis_type: FrontendAnalysisType
  branch?: string
  report?: string
}

// Mapeamento de status para progresso (usado no loading-overlay)
export const statusProgressMap: Record<JobStatus, number> = {
  'pending': 5,
  'iniciando_relatorio': 15,
  'lendo_codigos': 25,
  'validando_praticas': 35,
  'pending_approval': 40,
  'approved': 45,
  'running': 50,
  'refactoring_code': 55,
  'grouping_commits': 65,
  'writing_unit_tests': 75,
  'grouping_tests': 85,
  'populating_data': 90,
  'committing_to_github': 95,
  'completed': 100,
  'failed': 0,
  'rejected': 0
}

// Labels em português para os status
export const statusLabelsMap: Record<JobStatus, string> = {
  'pending': 'Pendente',
  'iniciando_relatorio': 'Iniciando Relatório de Análise',
  'lendo_codigos': 'Lendo Códigos',
  'validando_praticas': 'Validando Melhores Práticas',
  'pending_approval': 'Aguardando Aprovação',
  'approved': 'Aprovado',
  'running': 'Executando',
  'refactoring_code': 'Refatorando Código',
  'grouping_commits': 'Agrupando Commits',
  'writing_unit_tests': 'Escrevendo Testes',
  'grouping_tests': 'Organizando Testes',
  'populating_data': 'Preparando Dados',
  'committing_to_github': 'Enviando para GitHub',
  'completed': 'Concluído',
  'failed': 'Falhou',
  'rejected': 'Rejeitado'
}

// Descrições detalhadas para cada status
export const statusDescriptionsMap: Record<JobStatus, string> = {
  'pending': 'Iniciando processamento...',
  'iniciando_relatorio': 'Iniciando processo de análise e preparando relatório detalhado...',
  'lendo_codigos': 'Examinando estrutura de arquivos e padrões de código...',
  'validando_praticas': 'Verificando conformidade com melhores práticas de desenvolvimento...',
  'pending_approval': 'Relatório gerado! Aguardando sua aprovação.',
  'approved': 'Relatório aprovado, iniciando processamento...',
  'running': 'Processamento em andamento...',
  'refactoring_code': 'Aplicando melhorias e boas práticas no código...',
  'grouping_commits': 'Organizando mudanças por categoria...',
  'writing_unit_tests': 'Criando testes unitários automatizados...',
  'grouping_tests': 'Estruturando suíte de testes...',
  'populating_data': 'Finalizando estruturas de dados...',
  'committing_to_github': 'Criando branches e pull requests...',
  'completed': 'Processo finalizado com sucesso!',
  'failed': 'Ocorreu um erro durante o processamento.',
  'rejected': 'Relatório rejeitado pelo usuário.'
}
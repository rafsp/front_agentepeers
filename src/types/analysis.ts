// src/types/analysis.ts - TIPOS COMPLETOS DE ANÁLISE

export interface AnalysisType {
  id: string
  name: string
  description: string
  icon: string
  category: 'analysis' | 'refactoring' | 'testing' | 'documentation' | 'security' | 'infrastructure'
  complexity: 'baixa' | 'moderada' | 'alta' | 'muito-alta'
  duration: string
  outputType: 'report' | 'code' | 'tests' | 'documentation' | 'commits'
  requiresApproval: boolean
  supportsBranches: boolean
  supportsCommits: boolean
}

export const ANALYSIS_TYPES: Record<string, AnalysisType> = {
  // === ANÁLISES PRINCIPAIS ===
  design: {
    id: 'design',
    name: 'Análise de Design',
    description: 'Auditoria técnica profunda de arquitetura, qualidade de código e princípios SOLID',
    icon: '🏗️',
    category: 'analysis',
    complexity: 'alta',
    duration: '10-15 minutos',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  
  seguranca: {
    id: 'seguranca',
    name: 'Auditoria de Segurança',
    description: 'Análise detalhada de vulnerabilidades baseada no OWASP Top 10 e práticas de DevSecOps',
    icon: '🔒',
    category: 'security',
    complexity: 'muito-alta',
    duration: '15-25 minutos',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  
  pentest: {
    id: 'pentest',
    name: 'Plano de Pentest',
    description: 'Planejamento estratégico de testes de penetração usando metodologia PTES e MITRE ATT&CK',
    icon: '🎯',
    category: 'security',
    complexity: 'muito-alta',
    duration: '20-30 minutos',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  
  terraform: {
    id: 'terraform',
    name: 'Análise de Terraform',
    description: 'Auditoria completa de infraestrutura como código: segurança, custos e melhores práticas',
    icon: '☁️',
    category: 'infrastructure',
    complexity: 'alta',
    duration: '12-18 minutos',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  
  relatorio_teste_unitario: {
    id: 'relatorio_teste_unitario',
    name: 'Relatório de Testes',
    description: 'Análise de cobertura de testes e identificação de gaps de testabilidade',
    icon: '📊',
    category: 'testing',
    complexity: 'moderada',
    duration: '8-12 minutos',
    outputType: 'report',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: false
  },
  
  // === AÇÕES EXECUTÁVEIS ===
  refatoracao: {
    id: 'refatoracao',
    name: 'Refatoração de Código',
    description: 'Aplica refatorações automáticas baseadas em princípios de Clean Code e padrões',
    icon: '⚡',
    category: 'refactoring',
    complexity: 'alta',
    duration: '15-25 minutos',
    outputType: 'code',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  
  refatorador: {
    id: 'refatorador',
    name: 'Refatorador Automático',
    description: 'Ferramenta avançada de refatoração com detecção de code smells e aplicação de padrões',
    icon: '🔧',
    category: 'refactoring',
    complexity: 'muito-alta',
    duration: '20-35 minutos',
    outputType: 'code',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  
  escrever_testes: {
    id: 'escrever_testes',
    name: 'Criar Testes Unitários',
    description: 'Gera testes unitários abrangentes com base na análise do código existente',
    icon: '🧪',
    category: 'testing',
    complexity: 'alta',
    duration: '12-20 minutos',
    outputType: 'tests',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  
  agrupamento_testes: {
    id: 'agrupamento_testes',
    name: 'Agrupar Testes',
    description: 'Organiza e agrupa testes existentes em categorias lógicas e suítes temáticas',
    icon: '📦',
    category: 'testing',
    complexity: 'moderada',
    duration: '8-15 minutos',
    outputType: 'tests',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  
  agrupamento_design: {
    id: 'agrupamento_design',
    name: 'Agrupar Melhorias',
    description: 'Agrupa melhorias de design em commits temáticos e organizados',
    icon: '📋',
    category: 'refactoring',
    complexity: 'moderada',
    duration: '10-15 minutos',
    outputType: 'commits',
    requiresApproval: true,
    supportsBranches: true,
    supportsCommits: true
  },
  
  docstring: {
    id: 'docstring',
    name: 'Documentação de Código',
    description: 'Gera docstrings detalhadas e documentação técnica para funções e classes',
    icon: '📚',
    category: 'documentation',
    complexity: 'baixa',
    duration: '5-10 minutos',
    outputType: 'documentation',
    requiresApproval: false,
    supportsBranches: true,
    supportsCommits: true
  }
}

export const ANALYSIS_CATEGORIES = {
  analysis: {
    name: 'Análises',
    description: 'Relatórios e auditorias de código',
    icon: '📊',
    color: 'blue'
  },
  security: {
    name: 'Segurança',
    description: 'Análises de segurança e vulnerabilidades',
    icon: '🔒',
    color: 'red'
  },
  refactoring: {
    name: 'Refatoração',
    description: 'Melhorias e reestruturação de código',
    icon: '⚡',
    color: 'yellow'
  },
  testing: {
    name: 'Testes',
    description: 'Criação e organização de testes',
    icon: '🧪',
    color: 'green'
  },
  documentation: {
    name: 'Documentação',
    description: 'Geração de documentação e docstrings',
    icon: '📚',
    color: 'purple'
  },
  infrastructure: {
    name: 'Infraestrutura',
    description: 'Análise de infraestrutura como código',
    icon: '☁️',
    color: 'gray'
  }
} as const

// Funções utilitárias
export function getAnalysisTypesByCategory(category: keyof typeof ANALYSIS_CATEGORIES) {
  return Object.values(ANALYSIS_TYPES).filter(type => type.category === category)
}

export function getAnalysisTypeById(id: string): AnalysisType | undefined {
  return ANALYSIS_TYPES[id]
}

export function getExecutableAnalysisTypes() {
  return Object.values(ANALYSIS_TYPES).filter(type => 
    type.outputType !== 'report' || type.supportsCommits
  )
}

export function getReportAnalysisTypes() {
  return Object.values(ANALYSIS_TYPES).filter(type => type.outputType === 'report')
}
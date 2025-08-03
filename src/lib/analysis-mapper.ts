// src/lib/analysis-mapper.ts
// Mapeamento inteligente dos tipos de análise do frontend para backend

export type FrontendAnalysisType = 
  | 'design' 
  | 'refatoracao'
  | 'docstring'
  | 'security'
  | 'pentest'
  | 'relatorio_teste_unitario'
  | 'escrever_testes'
  | 'terraform'

export type BackendAnalysisType = 'design' | 'relatorio_teste_unitario'

interface AnalysisMapping {
  backendType: BackendAnalysisType
  autoInstructions: string
}

// Mapeamento dos tipos frontend -> backend com instruções automáticas
const analysisTypeMapping: Record<FrontendAnalysisType, AnalysisMapping> = {
  // CATEGORIA: CÓDIGO & ARQUITETURA -> 'design'
  design: {
    backendType: 'design',
    autoInstructions: `Realize uma análise completa de DESIGN E ARQUITETURA do código, focando em:
- Padrões de design (SOLID, DRY, KISS)
- Arquitetura e estrutura do projeto
- Qualidade do código e refatorações necessárias
- Melhores práticas de desenvolvimento
- Organização de arquivos e módulos
- Separação de responsabilidades`
  },
  
  refatoracao: {
    backendType: 'design',
    autoInstructions: `Foque especificamente em REFATORAÇÃO e melhoria do código existente:
- Código duplicado (DRY violations)
- Métodos/funções muito longos
- Classes com muitas responsabilidades
- Código complexo que pode ser simplificado
- Nomes de variáveis e funções pouco descritivos
- Estruturas condicionais complexas
- Performance e otimizações
- Padrões de design que podem ser aplicados`
  },

  docstring: {
    backendType: 'design',
    autoInstructions: `Analise a DOCUMENTAÇÃO do código, focando em:
- Docstrings ausentes ou inadequadas
- Comentários de código necessários
- Documentação de APIs e interfaces
- README e documentação do projeto
- Exemplos de uso
- Documentação de configuração
- Changelog e versionamento
- Documentação de arquitetura`
  },

  // CATEGORIA: SEGURANÇA -> 'design'
  security: {
    backendType: 'design',
    autoInstructions: `Realize uma análise focada em SEGURANÇA do código, priorizando:
- Vulnerabilidades de segurança (SQL injection, XSS, CSRF)
- Secrets hardcoded no código
- Validação inadequada de inputs
- Autenticação e autorização
- Gerenciamento de sessões e tokens
- Dependências com vulnerabilidades conhecidas
- Práticas de segurança em APIs
- Configurações inseguras
- OWASP Top 10`
  },

  pentest: {
    backendType: 'design',
    autoInstructions: `Realize uma análise de PENETRATION TESTING focada em segurança avançada:
- Análise estática de segurança (SAST)
- Vetores de ataque potenciais
- Vulnerabilidades OWASP Top 10
- Análise de dependências vulneráveis
- Injeção de código (SQL, NoSQL, LDAP, etc.)
- Cross-site scripting (XSS) e CSRF
- Deserialização insegura
- Exposição de dados sensíveis
- Configurações de segurança inadequadas
- Business logic flaws
- Bypass de autenticação/autorização`
  },

  // CATEGORIA: TESTES & QUALIDADE -> 'relatorio_teste_unitario'
  relatorio_teste_unitario: {
    backendType: 'relatorio_teste_unitario',
    autoInstructions: `Gere um relatório completo sobre TESTES UNITÁRIOS, analisando:
- Cobertura atual de testes
- Funções e métodos que precisam de testes
- Casos de borda não cobertos
- Qualidade dos testes existentes
- Sugestões de melhoria na estratégia de testes
- Testes de integração necessários`
  },

  escrever_testes: {
    backendType: 'relatorio_teste_unitario',
    autoInstructions: `Foque na CRIAÇÃO e GERAÇÃO de novos testes, analisando:
- Funções que precisam de testes unitários
- Casos de teste específicos para cada função
- Testes de integração necessários
- Mocking e fixtures apropriados
- Estrutura de testes recomendada
- Cobertura de casos de borda
- Testes de performance quando necessário
- Estratégias de teste automatizado`
  },

  // CATEGORIA: INFRAESTRUTURA -> 'design'
  terraform: {
    backendType: 'design',
    autoInstructions: `Realize uma auditoria completa de INFRASTRUCTURE AS CODE (Terraform/IaC), analisando:
- Segurança da infraestrutura (IAM, Security Groups, etc.)
- Compliance e governança
- Otimização de custos
- Práticas de versionamento e módulos
- Gestão de estado remoto
- Recursos desnecessários ou superdimensionados
- Configurações de alta disponibilidade
- Backup e disaster recovery
- Tags e organização de recursos`
  }
}

// Função principal para mapear e preparar dados para o backend
export function mapAnalysisForBackend(
  frontendType: FrontendAnalysisType,
  userInstructions: string = ''
): {
  analysis_type: BackendAnalysisType
  instrucoes_extras: string
} {
  const mapping = analysisTypeMapping[frontendType]
  
  // Combinar instruções automáticas com instruções do usuário
  let combinedInstructions = mapping.autoInstructions
  
  if (userInstructions.trim()) {
    combinedInstructions += `\n\n--- INSTRUÇÕES ADICIONAIS DO USUÁRIO ---\n${userInstructions.trim()}`
  }

  return {
    analysis_type: mapping.backendType,
    instrucoes_extras: combinedInstructions
  }
}
// src/lib/api/reports-service.ts
// Servico de Relatorios - usa o codeAIService existente

import { codeAIService } from '@/lib/api/codeai-service'
import type {
  EpicosReportData,
  FeaturesReportData,
  CronogramaReportData,
  PremissasRiscosReportData,
  Epico,
  Feature,
  CronogramaEpico,
  CronogramaStep,
  Premissa,
  Risco,
} from '@/types/reports'

// Tipos internos para dados da API
interface ApiEpico {
  id?: string | number
  codigo?: string
  titulo?: string
  nome?: string
  descricao?: string
  business_case?: string
  entregaveis?: string[]
  perfis?: string[]
  estimativa_sprints?: number
  prioridade?: string
}

interface ApiFeature {
  id?: string | number
  codigo?: string
  epico_id?: string | number
  epic_id?: string | number
  nome?: string
  titulo?: string
  perfil?: string
  tipo?: string
  complexidade?: string
  descricao?: string
  criterio_de_aceite?: string | string[]
  'critério_de_aceite'?: string | string[]
  criterios_aceite?: string[]
}

interface ApiPremissa {
  id?: string
  descricao?: string
  impacto_se_falhar?: string
  impacto?: string
}

interface ApiRisco {
  id?: string
  descricao?: string
  probabilidade?: string
  impacto?: string
  plano_mitigacao?: string
  mitigacao?: string
}

class ReportsService {

  // Helper para obter estado do projeto com fallback por nome
  private async getFullState(projectId: string): Promise<any> {
    // Primeiro tenta pelo ID
    let fullState = await codeAIService.getProjectReports(projectId)
    
    // Se não retornou dados, busca o nome do projeto na lista
    if (!fullState.epicos && !fullState.features && !fullState.resumo) {
      const response = await codeAIService.loginDev()
      const project = response.projects.find(p => p.project_id === projectId)
      
      if (project) {
        console.log('📂 Reports service: fallback por nome:', project.nome_projeto)
        fullState = await codeAIService.getProjectReportsByName(project.nome_projeto)
      }
    }
    
    return fullState
  }

  async checkHealth(): Promise<boolean> {
    // Usa o mesmo health check do codeAIService
    try {
      await codeAIService.loginDev()
      return true
    } catch {
      return false
    }
  }

  async getEpicos(projectId: string): Promise<EpicosReportData> {
    // Usa helper com fallback
    const fullState = await this.getFullState(projectId)
    
    const rawEpicos = (fullState.epicos?.epicos_report || []) as ApiEpico[]
    const epicos: Epico[] = rawEpicos.map((e: ApiEpico) => ({
      id: String(e.id || e.codigo || ''),
      titulo: String(e.titulo || e.nome || ''),
      business_case: String(e.descricao || e.business_case || ''),
      entregaveis_macro: Array.isArray(e.entregaveis) ? e.entregaveis : [],
      squad_sugerida: Array.isArray(e.perfis) ? e.perfis : [],
      estimativa_semanas: e.estimativa_sprints ? `${e.estimativa_sprints} sprints` : 'A definir',
      prioridade_estrategica: (e.prioridade as 'Critica' | 'Alta' | 'Media' | 'Baixa') || 'Media',
    }))

    return {
      project_name: fullState.resumo?.nome_projeto || projectId,
      epicos,
      metadata: {
        generated_at: new Date().toISOString(),
        total_epicos: epicos.length,
        criticos: epicos.filter((ep: Epico) => ep.prioridade_estrategica === 'Critica').length,
      },
    }
  }

  async getFeatures(projectId: string): Promise<FeaturesReportData> {
    const fullState = await this.getFullState(projectId)
    
    const epicTitles: Record<string, string> = {}
    const rawEpicos = (fullState.epicos?.epicos_report || []) as ApiEpico[]
    rawEpicos.forEach((e: ApiEpico) => {
      const id = String(e.id || e.codigo || '')
      epicTitles[id] = String(e.titulo || e.nome || '')
    })

    const rawFeatures = (fullState.features?.features_report || []) as ApiFeature[]
    const features: Feature[] = rawFeatures.map((f: ApiFeature) => {
      const ca = f.criterio_de_aceite || f['critério_de_aceite'] || f.criterios_aceite || ''
      let criteriosArray: string[] = []
      if (Array.isArray(ca)) {
        criteriosArray = ca as string[]
      } else if (typeof ca === 'string' && ca) {
        criteriosArray = ca.split('\n').filter(Boolean)
      }

      return {
        id: String(f.id || f.codigo || ''),
        epic_id: String(f.epico_id || f.epic_id || ''),
        titulo: String(f.nome || f.titulo || ''),
        tipo: String(f.perfil || f.tipo || 'Backend'),
        complexidade: (f.complexidade as 'Alta' | 'Media' | 'Baixa') || 'Media',
        descricao: String(f.descricao || ''),
        criterios_aceite: criteriosArray,
      }
    })

    return {
      project_name: fullState.resumo?.nome_projeto || projectId,
      features,
      epic_titles: epicTitles,
      metadata: {
        generated_at: new Date().toISOString(),
        total_features: features.length,
      },
    }
  }

  async getCronograma(projectId: string): Promise<CronogramaReportData> {
    const fullState = await this.getFullState(projectId)
    
    // Verificar se há dados de timeline reais da API
    const timelineData = fullState.epicos_timeline as any
    
    if (timelineData) {
      // Usar dados reais de timeline
      let timelineReport: any[] = []
      
      if (timelineData.epicos_timeline_report) {
        timelineReport = timelineData.epicos_timeline_report
      } else if (Array.isArray(timelineData)) {
        timelineReport = timelineData
      }
      
      if (timelineReport.length > 0) {
        const cronograma: CronogramaEpico[] = timelineReport.map((item: any) => {
          const epicName = Object.keys(item)[0]
          const weekSteps = item[epicName] || []
          
          const steps: CronogramaStep[] = weekSteps.map((step: any) => ({
            semana: step.semana,
            fase: step.fase,
            atividades_focadas: step.atividades_focadas,
            progresso_estimado: step.progresso_estimado,
            justificativa: step.justificativa_agendamento,
          }))
          
          return {
            epic_id: epicName,
            epic_name: epicName,
            steps,
          }
        })
        
        const allWeeks = cronograma.flatMap((c: CronogramaEpico) => c.steps.map((s: CronogramaStep) => s.semana))
        const maxSemana = allWeeks.length > 0 ? Math.max(...allWeeks) : 0
        
        return {
          project_name: fullState.resumo?.nome_projeto || projectId,
          cronograma,
          max_semanas: maxSemana,
          metadata: {
            generated_at: new Date().toISOString(),
            duracao_total: `${maxSemana} semanas`,
          },
        }
      }
    }
    
    // Fallback: gerar dados estimados a partir dos épicos
    let semanaAtual = 1
    const rawEpicos = (fullState.epicos?.epicos_report || []) as ApiEpico[]
    
    const cronograma: CronogramaEpico[] = rawEpicos.map((e: ApiEpico) => {
      const sprints = Number(e.estimativa_sprints) || 4
      const semanas = sprints * 2
      
      const steps: CronogramaStep[] = []
      const fases = ['Discovery', 'Desenvolvimento', 'Desenvolvimento', 'Testes', 'Deploy']
      
      for (let i = 0; i < semanas && i < fases.length; i++) {
        const progresso = Math.round(((i + 1) / semanas) * 100)
        steps.push({
          semana: semanaAtual + i,
          fase: fases[Math.min(i, fases.length - 1)],
          atividades_focadas: `${fases[Math.min(i, fases.length - 1)]} do épico`,
          progresso_estimado: `${progresso}%`,
        })
      }
      
      semanaAtual += Math.ceil(semanas * 0.7)
      
      return {
        epic_id: String(e.id || e.codigo || ''),
        epic_name: String(e.titulo || e.nome || ''),
        steps,
      }
    })

    const allWeeks = cronograma.flatMap((c: CronogramaEpico) => c.steps.map((s: CronogramaStep) => s.semana))
    const maxSemana = allWeeks.length > 0 ? Math.max(...allWeeks) : 0

    return {
      project_name: fullState.resumo?.nome_projeto || projectId,
      cronograma,
      max_semanas: maxSemana,
      metadata: {
        generated_at: new Date().toISOString(),
        duracao_total: `${maxSemana} semanas`,
      },
    }
  }

  async getPremissasRiscos(projectId: string): Promise<PremissasRiscosReportData> {
    const fullState = await this.getFullState(projectId)
    
    // Extrair dados de premissas e riscos da estrutura da API
    const premissasRiscosData = fullState.premissas_riscos as any
    
    let premissasArray: ApiPremissa[] = []
    let riscosArray: ApiRisco[] = []
    
    if (premissasRiscosData) {
      // Tentar diferentes estruturas que a API pode retornar
      if (premissasRiscosData.premissas) {
        premissasArray = premissasRiscosData.premissas
        riscosArray = premissasRiscosData.riscos || []
      } else if (premissasRiscosData.premissas_riscos_report) {
        const report = premissasRiscosData.premissas_riscos_report[0] || {}
        premissasArray = report.premissas || []
        riscosArray = report.riscos || []
      } else if (Array.isArray(premissasRiscosData) && premissasRiscosData.length > 0) {
        const firstItem = premissasRiscosData[0]
        premissasArray = firstItem.premissas || []
        riscosArray = firstItem.riscos || []
      }
    }
    
    const premissas: Premissa[] = premissasArray.map((p: ApiPremissa, idx: number) => ({
      id: String(p.id || `P${String(idx + 1).padStart(2, '0')}`),
      descricao: String(p.descricao || ''),
      impacto_se_falhar: String(p.impacto_se_falhar || p.impacto || ''),
    }))

    const riscos: Risco[] = riscosArray.map((r: ApiRisco, idx: number) => ({
      id: String(r.id || `R${String(idx + 1).padStart(2, '0')}`),
      descricao: String(r.descricao || ''),
      probabilidade: (r.probabilidade as 'Alta' | 'Media' | 'Baixa') || 'Media',
      impacto: (r.impacto as 'Critico' | 'Alto' | 'Medio' | 'Baixo') || 'Medio',
      plano_mitigacao: String(r.plano_mitigacao || r.mitigacao || ''),
    }))

    return {
      project_name: fullState.resumo?.nome_projeto || projectId,
      premissas,
      riscos,
      metadata: {
        generated_at: new Date().toISOString(),
        total_premissas: premissas.length,
        total_riscos: riscos.length,
        riscos_criticos: riscos.filter((r: Risco) => r.impacto === 'Critico').length,
        riscos_prob_alta: riscos.filter((r: Risco) => r.probabilidade === 'Alta').length,
      },
    }
  }
}

export const reportsService = new ReportsService()
export { ReportsService }
export default reportsService
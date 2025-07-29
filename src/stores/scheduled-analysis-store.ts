// src/stores/scheduled-analysis-store.ts

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface ScheduledAnalysis {
  id: string
  name: string
  repository: string
  branch: string
  analysisType: 'design' | 'relatorio_teste_unitario' | 'security' | 'performance'
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  customFrequency?: number // Em dias, apenas para frequency = 'custom'
  isActive: boolean
  nextRun: Date
  lastRun?: Date
  createdAt: Date
  attachedPolicies: string[] // IDs das políticas anexadas
  instructions?: string
  githubToken?: string // Token específico para este repositório, se necessário
}

interface ScheduledAnalysisState {
  analyses: Record<string, ScheduledAnalysis>
  
  // Actions
  addScheduledAnalysis: (analysis: Omit<ScheduledAnalysis, 'id' | 'createdAt' | 'nextRun'>) => void
  updateScheduledAnalysis: (id: string, updates: Partial<ScheduledAnalysis>) => void
  deleteScheduledAnalysis: (id: string) => void
  toggleAnalysisStatus: (id: string) => void
  getActiveAnalyses: () => ScheduledAnalysis[]
  getAnalysesDueForExecution: () => ScheduledAnalysis[]
  calculateNextRun: (frequency: ScheduledAnalysis['frequency'], customFrequency?: number, fromDate?: Date) => Date
}

// Função auxiliar para calcular próxima execução
const calculateNextRunDate = (
  frequency: ScheduledAnalysis['frequency'], 
  customFrequency?: number, 
  fromDate = new Date()
): Date => {
  const nextRun = new Date(fromDate)
  
  switch (frequency) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1)
      break
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7)
      break
    case 'biweekly':
      nextRun.setDate(nextRun.getDate() + 14)
      break
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1)
      break
    case 'quarterly':
      nextRun.setMonth(nextRun.getMonth() + 3)
      break
    case 'yearly':
      nextRun.setFullYear(nextRun.getFullYear() + 1)
      break
    case 'custom':
      if (customFrequency && customFrequency > 0) {
        nextRun.setDate(nextRun.getDate() + customFrequency)
      } else {
        // Default para 7 dias se customFrequency inválido
        nextRun.setDate(nextRun.getDate() + 7)
      }
      break
  }
  
  return nextRun
}

export const useScheduledAnalysisStore = create<ScheduledAnalysisState>()(
  devtools(
    persist(
      (set, get) => ({
        analyses: {},

        addScheduledAnalysis: (analysis) =>
          set((state) => {
            const id = `scheduled_${Date.now()}`
            const createdAt = new Date()
            const nextRun = calculateNextRunDate(analysis.frequency, analysis.customFrequency)
            
            const newAnalysis: ScheduledAnalysis = {
              ...analysis,
              id,
              createdAt,
              nextRun,
            }
            
            return {
              analyses: { ...state.analyses, [id]: newAnalysis },
            }
          }),

        updateScheduledAnalysis: (id, updates) =>
          set((state) => {
            const currentAnalysis = state.analyses[id]
            if (!currentAnalysis) return state

            let updatedAnalysis = { ...currentAnalysis, ...updates }

            // Recalcular nextRun se frequency ou customFrequency mudaram
            if (updates.frequency || updates.customFrequency) {
              updatedAnalysis.nextRun = calculateNextRunDate(
                updatedAnalysis.frequency,
                updatedAnalysis.customFrequency
              )
            }

            return {
              analyses: { ...state.analyses, [id]: updatedAnalysis },
            }
          }),

        deleteScheduledAnalysis: (id) =>
          set((state) => {
            const { [id]: deleted, ...remaining } = state.analyses
            return { analyses: remaining }
          }),

        toggleAnalysisStatus: (id) =>
          set((state) => {
            const analysis = state.analyses[id]
            if (!analysis) return state

            return {
              analyses: {
                ...state.analyses,
                [id]: { ...analysis, isActive: !analysis.isActive },
              },
            }
          }),

        getActiveAnalyses: () =>
          Object.values(get().analyses).filter(analysis => analysis.isActive),

        getAnalysesDueForExecution: () => {
          const now = new Date()
          return Object.values(get().analyses).filter(
            analysis => analysis.isActive && analysis.nextRun <= now
          )
        },

        calculateNextRun: calculateNextRunDate,
      }),
      { 
        name: 'scheduled-analysis-store',
        // Apenas persistir dados básicos, não funções
        partialize: (state) => ({ analyses: state.analyses })
      }
    ),
    { name: 'scheduled-analysis-store' }
  )
)

// Hook personalizado para obter estatísticas
export const useScheduledAnalysisStats = () => {
  const { analyses } = useScheduledAnalysisStore()
  
  const analysesList = Object.values(analyses)
  const activeCount = analysesList.filter(a => a.isActive).length
  const inactiveCount = analysesList.filter(a => !a.isActive).length
  const dueCount = analysesList.filter(a => a.isActive && a.nextRun <= new Date()).length
  
  return {
    total: analysesList.length,
    active: activeCount,
    inactive: inactiveCount,
    due: dueCount,
    nextDue: analysesList
      .filter(a => a.isActive)
      .sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime())[0]
  }
}
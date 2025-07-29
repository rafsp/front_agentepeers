import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface CompanyPolicy {
  id: string
  name: string
  description: string
  file?: File
  uploadedAt: Date
  content?: string
}

export interface AnalysisModel {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  category: 'estrategia' | 'design' | 'construcao' | 'implantacao'
  isActive: boolean
  developmentPhase: string
}

export interface AutomatedAnalysis {
  id: string
  name: string
  repository: string
  branch: string
  modelId: string
  frequency: 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'personalizado'
  customFrequency?: number
  isActive: boolean
  nextRun: Date
  lastRun?: Date
  createdAt: Date
  attachedFiles: string[]
}

interface CompanyState {
  policies: CompanyPolicy[]
  activePolicyId?: string
  analysisModels: AnalysisModel[]
  automatedAnalyses: AutomatedAnalysis[]
  companySettings: {
    name: string
    logo?: string
    developmentPhase: 'estrategia' | 'design' | 'construcao' | 'implantacao'
    repositories: string[]
  }
  
  // Actions
  addPolicy: (policy: Omit<CompanyPolicy, 'id' | 'uploadedAt'>) => void
  removePolicy: (id: string) => void
  setActivePolicy: (id: string) => void
  addAutomatedAnalysis: (analysis: Omit<AutomatedAnalysis, 'id' | 'createdAt'>) => void
  updateAutomatedAnalysis: (id: string, updates: Partial<AutomatedAnalysis>) => void
  removeAutomatedAnalysis: (id: string) => void
  updateCompanySettings: (settings: Partial<CompanyState['companySettings']>) => void
}

export const useCompanyStore = create<CompanyState>()(
  devtools(
    persist(
      (set, get) => ({
        policies: [],
        analysisModels: [
          {
            id: 'estrategia-basic',
            name: 'Análise Estratégica Básica',
            description: 'Análise de dados históricos e definição de estratégia',
            price: 299,
            features: ['Análise de mercado', 'Definição de requisitos', 'Roadmap básico'],
            category: 'estrategia',
            isActive: true,
            developmentPhase: 'Estratégia e planejamento'
          },
          {
            id: 'design-advanced',
            name: 'Design e Arquitetura Avançada',
            description: 'Análise completa de design e priorização',
            price: 499,
            features: ['Design patterns', 'Arquitetura de sistema', 'Critérios de aceite'],
            category: 'design',
            isActive: true,
            developmentPhase: 'Design'
          },
          {
            id: 'construcao-full',
            name: 'Análise de Construção Completa',
            description: 'Desenvolvimento, testes e integração',
            price: 799,
            features: ['Code review', 'Testes automatizados', 'CI/CD', 'Merge analysis'],
            category: 'construcao',
            isActive: true,
            developmentPhase: 'Construção e testes'
          },
          {
            id: 'implantacao-enterprise',
            name: 'Implantação Enterprise',
            description: 'Deploy, monitoramento e suporte',
            price: 999,
            features: ['Deploy automation', 'Performance monitoring', 'Support 24/7'],
            category: 'implantacao',
            isActive: true,
            developmentPhase: 'Implantação e sustentação'
          }
        ],
        automatedAnalyses: [],
        companySettings: {
          name: 'Peers',
          repositories: []
        },

        addPolicy: (policy) =>
          set((state) => ({
            policies: [
              ...state.policies,
              { ...policy, id: `policy_${Date.now()}`, uploadedAt: new Date() }
            ]
          })),

        removePolicy: (id) =>
          set((state) => ({
            policies: state.policies.filter(p => p.id !== id)
          })),

        setActivePolicy: (id) =>
          set({ activePolicyId: id }),

        addAutomatedAnalysis: (analysis) =>
          set((state) => ({
            automatedAnalyses: [
              ...state.automatedAnalyses,
              { ...analysis, id: `auto_${Date.now()}`, createdAt: new Date() }
            ]
          })),

        updateAutomatedAnalysis: (id, updates) =>
          set((state) => ({
            automatedAnalyses: state.automatedAnalyses.map(a =>
              a.id === id ? { ...a, ...updates } : a
            )
          })),

        removeAutomatedAnalysis: (id) =>
          set((state) => ({
            automatedAnalyses: state.automatedAnalyses.filter(a => a.id !== id)
          })),

        updateCompanySettings: (settings) =>
          set((state) => ({
            companySettings: { ...state.companySettings, ...settings }
          }))
      }),
      { name: 'company-store' }
    )
  )
)
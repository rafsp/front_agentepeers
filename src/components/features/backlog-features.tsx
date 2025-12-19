// src/components/features/backlog-features.tsx
// Componente de Backlog de Features por Épico com design profissional
// Baseado no design do Projeto Plurix
"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileSpreadsheet, CheckCircle2, ListTodo, Filter, ChevronLeft, Save
} from 'lucide-react'

// Cores da marca (fallback local)
const BRAND_COLORS = {
  primary: '#011334',
  info: '#4f46e5',
  success: '#10b981',
}

// ============================================================================
// TIPOS - Baseados na resposta da API
// ============================================================================

export interface FeatureFromAPI {
  id: string
  epic_id: string
  titulo: string
  nome?: string
  descricao: string
  criterios_aceite?: string[]
  criterio_de_aceite?: string
  'critério_de_aceite'?: string
  tipo?: string          // Backend, Frontend, Infra, Dados, Design
  disciplina?: string
  complexidade?: string  // Alta, Média, Baixa
  prioridade?: string
  estimativa_dias?: number
  perfil?: string
}

export interface EpicoResumido {
  id: string
  titulo: string
}

interface BacklogFeaturesProps {
  projectName: string
  epicos: EpicoResumido[]
  features: FeatureFromAPI[]
  onBack?: () => void
  onExportExcel?: () => void
  onSave?: () => void
}

// ============================================================================
// CONFIGURAÇÕES DE ESTILO
// ============================================================================

const DISCIPLINA_STYLES: Record<string, { bg: string; text: string }> = {
  'Backend': { bg: 'bg-slate-700', text: 'text-white' },
  'BACKEND': { bg: 'bg-slate-700', text: 'text-white' },
  'backend': { bg: 'bg-slate-700', text: 'text-white' },
  'Frontend': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'FRONTEND': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'frontend': { bg: 'bg-purple-100', text: 'text-purple-700' },
  'Infra': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'INFRA': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'infra': { bg: 'bg-blue-100', text: 'text-blue-700' },
  'Dados': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'DADOS': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'dados': { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  'Design': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'DESIGN': { bg: 'bg-pink-100', text: 'text-pink-700' },
  'design': { bg: 'bg-pink-100', text: 'text-pink-700' },
}

const COMPLEXIDADE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Alta': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500' },
  'ALTA': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500' },
  'alta': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-l-red-500' },
  'Média': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-l-orange-400' },
  'MÉDIA': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-l-orange-400' },
  'Media': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-l-orange-400' },
  'media': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-l-orange-400' },
  'Baixa': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-l-green-500' },
  'BAIXA': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-l-green-500' },
  'baixa': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-l-green-500' },
}

const DEFAULT_DISCIPLINA = { bg: 'bg-gray-100', text: 'text-gray-700' }
const DEFAULT_COMPLEXIDADE = { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-l-gray-300' }

const FILTER_OPTIONS = ['Todas', 'Backend', 'Frontend', 'Infra', 'Dados', 'Design']

// ============================================================================
// HELPERS
// ============================================================================

function getDisciplinaStyle(tipo?: string) {
  if (!tipo) return DEFAULT_DISCIPLINA
  return DISCIPLINA_STYLES[tipo] || DEFAULT_DISCIPLINA
}

function getComplexidadeStyle(complexidade?: string) {
  if (!complexidade) return DEFAULT_COMPLEXIDADE
  return COMPLEXIDADE_STYLES[complexidade] || DEFAULT_COMPLEXIDADE
}

function getCriteriosAceite(feature: FeatureFromAPI): string[] {
  if (feature.criterios_aceite?.length) return feature.criterios_aceite
  if (feature.criterio_de_aceite) return [feature.criterio_de_aceite]
  if (feature['critério_de_aceite']) return [feature['critério_de_aceite']]
  return []
}

function getTipo(feature: FeatureFromAPI): string {
  return feature.tipo || feature.disciplina || feature.perfil || 'Backend'
}

function getComplexidade(feature: FeatureFromAPI): string {
  return feature.complexidade || feature.prioridade || 'Média'
}

function getTitulo(feature: FeatureFromAPI): string {
  return feature.titulo || feature.nome || 'Feature sem título'
}

// ============================================================================
// COMPONENTE CARD DE FEATURE
// ============================================================================

function FeatureCard({ feature }: { feature: FeatureFromAPI }) {
  const tipo = getTipo(feature)
  const complexidade = getComplexidade(feature)
  const titulo = getTitulo(feature)
  const criterios = getCriteriosAceite(feature)
  
  const disciplinaStyle = getDisciplinaStyle(tipo)
  const complexidadeStyle = getComplexidadeStyle(complexidade)

  return (
    <Card className={`
      bg-white border border-slate-200 rounded-xl overflow-hidden
      transition-all duration-200 hover:shadow-lg hover:-translate-y-1
      border-l-4 ${complexidadeStyle.border}
    `}>
      <div className="p-5">
        {/* Header com ID e Badges */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-mono text-slate-400">{feature.id}</span>
          <div className="flex gap-2">
            <Badge className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 ${disciplinaStyle.bg} ${disciplinaStyle.text}`}>
              {tipo}
            </Badge>
            <Badge className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 ${complexidadeStyle.bg} ${complexidadeStyle.text}`}>
              {complexidade}
            </Badge>
          </div>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-slate-800 mb-2 leading-tight text-sm">
          {titulo}
        </h3>

        {/* Descrição */}
        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
          {feature.descricao}
        </p>

        {/* Critérios de Aceite */}
        {criterios.length > 0 && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3 h-3" />
              CRITÉRIOS DE ACEITE
            </div>
            <ul className="space-y-1.5">
              {criterios.slice(0, 3).map((criterio, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-slate-300 mt-0.5">•</span>
                  <span className="line-clamp-1">{criterio}</span>
                </li>
              ))}
              {criterios.length > 3 && (
                <li className="text-xs text-slate-400 italic">
                  +{criterios.length - 3} critério(s)
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL - BACKLOG DE FEATURES
// ============================================================================

export function BacklogFeatures({
  projectName,
  epicos,
  features,
  onBack,
  onExportExcel,
  onSave,
}: BacklogFeaturesProps) {
  const [selectedEpicoId, setSelectedEpicoId] = useState<string>(epicos[0]?.id || '')
  const [filterDisciplina, setFilterDisciplina] = useState<string>('Todas')

  // Features do épico selecionado
  const epicFeatures = useMemo(() => {
    return features.filter(f => f.epic_id === selectedEpicoId)
  }, [features, selectedEpicoId])

  // Features filtradas por disciplina
  const filteredFeatures = useMemo(() => {
    if (filterDisciplina === 'Todas') return epicFeatures
    return epicFeatures.filter(f => {
      const tipo = getTipo(f).toLowerCase()
      return tipo === filterDisciplina.toLowerCase()
    })
  }, [epicFeatures, filterDisciplina])

  // Stats
  const highComplexityCount = epicFeatures.filter(f => {
    const c = getComplexidade(f).toLowerCase()
    return c === 'alta'
  }).length

  const selectedEpico = epicos.find(e => e.id === selectedEpicoId)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[98%] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
            )}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md" style={{ background: BRAND_COLORS.primary }}>
              <ListTodo className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{projectName}</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                BACKLOG DE FEATURES POR ÉPICO
              </p>
            </div>
          </div>
          
          {onExportExcel && (
            <Button 
              variant="outline" 
              onClick={onExportExcel}
              className="gap-2 hover:text-green-700 hover:border-green-600"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[98%] mx-auto px-6 py-8">
        
        {/* Epic Tabs Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              SELECIONE O ÉPICO
            </h3>
            <span className="text-xs text-slate-400">
              {features.length} features • {epicos.length} épicos
            </span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {epicos.map(epico => (
              <button
                key={epico.id}
                onClick={() => setSelectedEpicoId(epico.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap
                  transition-all duration-200 border
                  ${selectedEpicoId === epico.id 
                    ? 'text-white border-transparent shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }
                `}
                style={selectedEpicoId === epico.id ? { background: BRAND_COLORS.primary } : {}}
              >
                {epico.id}
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Stats */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          
          {/* Context Title */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span 
                className="text-white text-xs px-2 py-1 rounded font-mono"
                style={{ background: BRAND_COLORS.primary }}
              >
                {selectedEpicoId}
              </span>
              <span>Features do Épico</span>
            </h2>
            {selectedEpico && (
              <p className="text-sm text-slate-600 mt-1 font-medium">{selectedEpico.titulo}</p>
            )}
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>{epicFeatures.length} features</span>
              <span className="text-slate-300">|</span>
              <span className="text-red-600 font-medium">{highComplexityCount} alta complexidade</span>
            </div>
          </div>

          {/* Discipline Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide mr-2">
              DISCIPLINA:
            </span>
            {FILTER_OPTIONS.map(option => (
              <button
                key={option}
                onClick={() => setFilterDisciplina(option)}
                className={`
                  px-3 py-1.5 text-xs font-bold rounded-full
                  transition-all duration-200 border
                  ${filterDisciplina === option
                    ? 'text-white border-transparent shadow-sm'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }
                `}
                style={filterDisciplina === option ? { background: BRAND_COLORS.primary } : {}}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        {filteredFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFeatures.map(feature => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
              <Filter className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhuma feature encontrada</h3>
            <p className="text-slate-500 mt-1">
              {epicFeatures.length === 0 
                ? 'Este épico ainda não possui features.' 
                : 'Tente selecionar outra disciplina no filtro acima.'
              }
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {onSave && (
          <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-slate-200">
            <Button 
              onClick={onSave}
              className="gap-2 px-8 text-white"
              style={{ background: BRAND_COLORS.info }}
            >
              <Save className="w-4 h-4" />
              Salvar Features
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            Documento Técnico • Peers Consulting
          </p>
        </div>
      </main>
    </div>
  )
}

export default BacklogFeatures
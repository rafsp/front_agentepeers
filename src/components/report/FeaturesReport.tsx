// src/components/report/FeaturesReport.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { ListTodo, CheckSquare, FilterX } from 'lucide-react'
import type { Feature, FeaturesReportData, ComplexidadeFeature } from '@/types/reports'
import { ReportHeader } from './ReportHeader'
import { ExportButton, exportToCSV } from './ExportButtons'

const BRAND = { primary: '#011334' }

interface FeaturesReportProps {
  data: FeaturesReportData
  className?: string
}

type FilterType = 'all' | string

function getTypeBadgeColor(tipo: string): string {
  const colors: Record<string, string> = {
    'Backend': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Frontend': 'bg-violet-100 text-violet-700 border-violet-200',
    'Infra': 'bg-orange-100 text-orange-700 border-orange-200',
    'Dados': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Design': 'bg-pink-100 text-pink-700 border-pink-200',
    'QA': 'bg-teal-100 text-teal-700 border-teal-200',
  }
  return colors[tipo] || 'bg-slate-100 text-slate-700 border-slate-200'
}

function getComplexityBadgeColor(complexidade: ComplexidadeFeature): string {
  const colors: Record<ComplexidadeFeature, string> = {
    'Alta': 'bg-red-100 text-red-700 border-red-200',
    'Media': 'bg-amber-100 text-amber-700 border-amber-200',
    'Baixa': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return colors[complexidade] || 'bg-slate-100 text-slate-700 border-slate-200'
}

function getComplexityBorder(complexidade: ComplexidadeFeature): string {
  const borders: Record<ComplexidadeFeature, string> = {
    'Alta': 'border-l-red-500',
    'Media': 'border-l-amber-500',
    'Baixa': 'border-l-emerald-500',
  }
  return borders[complexidade] || 'border-l-slate-300'
}

interface FeatureCardProps {
  feature: Feature
}

function FeatureCard({ feature }: FeatureCardProps): React.ReactElement {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-5 flex flex-col h-full border-l-4 ${getComplexityBorder(feature.complexidade)} transition-all duration-200 ease-in-out hover:translate-y-[-2px] hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider font-mono">{feature.id}</span>
        <div className="flex gap-1">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getTypeBadgeColor(feature.tipo)}`}>{feature.tipo}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getComplexityBadgeColor(feature.complexidade)}`}>{feature.complexidade}</span>
        </div>
      </div>
      <h4 className="font-bold text-slate-800 text-sm mb-2 leading-snug line-clamp-2" title={feature.titulo}>{feature.titulo}</h4>
      <p className="text-xs text-slate-600 mb-4 flex-grow leading-relaxed">{feature.descricao}</p>
      <div className="mt-auto pt-4 border-t border-slate-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><CheckSquare size={10} />Criterios de Aceite</p>
        <ul className="space-y-1.5">
          {feature.criterios_aceite.slice(0, 4).map((criterio: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-700">
              <div className="mt-0.5 w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
              <span className="line-clamp-2">{criterio}</span>
            </li>
          ))}
          {feature.criterios_aceite.length > 4 && <li className="text-[10px] text-slate-400 italic">+{feature.criterios_aceite.length - 4} mais...</li>}
        </ul>
      </div>
    </div>
  )
}

interface EpicTabsProps {
  epics: string[]
  activeEpic: string
  onSelect: (epic: string) => void
  epicTitles?: Record<string, string>
}

function EpicTabs({ epics, activeEpic, onSelect, epicTitles }: EpicTabsProps): React.ReactElement {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
      {epics.map((epicId: string) => (
        <button
          key={epicId}
          onClick={() => onSelect(epicId)}
          className={`px-4 py-2 rounded-lg text-xs font-bold border whitespace-nowrap transition-all duration-200 ${activeEpic === epicId ? 'bg-[#011334] text-white border-[#011334]' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-[#011334]'}`}
          title={epicTitles?.[epicId] || `Epico ${epicId}`}
        >
          {epicId}
        </button>
      ))}
    </div>
  )
}

interface FilterButtonsProps {
  activeFilter: FilterType
  onFilter: (filter: FilterType) => void
  availableTypes: string[]
}

function FilterButtons({ activeFilter, onFilter, availableTypes }: FilterButtonsProps): React.ReactElement {
  const allFilters: FilterType[] = ['all', ...availableTypes]
  const getLabel = (filter: FilterType): string => filter === 'all' ? 'Todas' : filter
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wide self-center">Disciplina:</span>
      {allFilters.map((filter: FilterType) => (
        <button
          key={filter}
          onClick={() => onFilter(filter)}
          className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${activeFilter === filter ? 'bg-[#011334] text-white border-[#011334] shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
        >
          {getLabel(filter)}
        </button>
      ))}
    </div>
  )
}

export function FeaturesReport({ data, className = '' }: FeaturesReportProps): React.ReactElement {
  const epicIds = useMemo(() => {
    const ids = Array.from(new Set(data.features.map((f: Feature) => f.epic_id))).sort()
    return ids
  }, [data.features])

  const [activeEpic, setActiveEpic] = useState<string>(epicIds[0] || '')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(data.features.map((f: Feature) => f.tipo)))
    return types.sort()
  }, [data.features])

  const filteredFeatures = useMemo(() => {
    let filtered = data.features.filter((f: Feature) => f.epic_id === activeEpic)
    if (activeFilter !== 'all') {
      filtered = filtered.filter((f: Feature) => f.tipo === activeFilter)
    }
    return filtered
  }, [data.features, activeEpic, activeFilter])

  const stats = useMemo(() => {
    const epicFeatures = data.features.filter((f: Feature) => f.epic_id === activeEpic)
    return {
      total: filteredFeatures.length,
      epicTotal: epicFeatures.length,
      highComplexity: epicFeatures.filter((f: Feature) => f.complexidade === 'Alta').length,
    }
  }, [data.features, activeEpic, filteredFeatures])

  const handleExportCSV = (): void => {
    const csvData = data.features.map((feature: Feature) => ({
      ID: feature.id,
      'Epic ID': feature.epic_id,
      Titulo: feature.titulo,
      Tipo: feature.tipo,
      Complexidade: feature.complexidade,
      Descricao: feature.descricao,
      'Criterios de Aceite': feature.criterios_aceite.join(' | '),
    }))
    exportToCSV(csvData, ['ID', 'Epic ID', 'Titulo', 'Tipo', 'Complexidade', 'Descricao', 'Criterios de Aceite'], `Features_${data.project_name.replace(/\s+/g, '_')}.csv`)
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 pb-24 flex flex-col ${className}`}>
      <ReportHeader icon={ListTodo} projectName={data.project_name} reportTitle="Backlog de Features por Epico" actions={<ExportButton format="csv" onClick={handleExportCSV} />} />
      <main className="max-w-[98%] mx-auto px-6 py-8 flex-grow">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selecione o Epico</h3>
            <span className="text-xs text-slate-400">{data.features.length} features no total</span>
          </div>
          <EpicTabs epics={epicIds} activeEpic={activeEpic} onSelect={setActiveEpic} epicTitles={data.epic_titles} />
        </div>
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 mb-6 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="text-white text-xs px-2 py-1 rounded tracking-wider font-mono" style={{ backgroundColor: BRAND.primary }}>{activeEpic}</span>
              <span>Features do Epico</span>
            </h2>
            <div className="flex gap-3 mt-2 text-xs text-slate-500">
              <span>{stats.total} features</span>
              <span className="text-slate-300">|</span>
              <span className="text-red-600 font-medium">{stats.highComplexity} alta complexidade</span>
            </div>
          </div>
          <FilterButtons activeFilter={activeFilter} onFilter={setActiveFilter} availableTypes={availableTypes} />
        </div>
        {filteredFeatures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFeatures.map((feature: Feature) => <FeatureCard key={feature.id} feature={feature} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4"><FilterX className="text-slate-400 w-8 h-8" /></div>
            <h3 className="text-lg font-medium text-slate-900">Nenhuma feature encontrada</h3>
            <p className="text-slate-500 mt-1">Tente selecionar outra disciplina no filtro acima.</p>
          </div>
        )}
        <div className="mt-12 text-center"><p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Documento Tecnico - Peers Consulting</p></div>
      </main>
    </div>
  )
}

export default FeaturesReport
// src/components/report/EpicosReport.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { 
  Layers, FileStack, AlertCircle, Clock, Hash, FileText, Timer,
  ChevronDown, Target, Users, PackageCheck,
} from 'lucide-react'
import type { Epico, EpicosReportData, PrioridadeEstrategica } from '@/types/reports'
import { ReportHeader } from './ReportHeader'
import { ReportStats, STAT_COLORS } from './ReportStats'
import { ExportButton, exportToCSV } from './ExportButtons'

const BRAND = { primary: '#011334' }

interface EpicosReportProps {
  data: EpicosReportData
  className?: string
}

function getPriorityBadge(prioridade: PrioridadeEstrategica): React.ReactElement {
  const configs: Record<PrioridadeEstrategica, { bg: string; text: string; border: string }> = {
    'Critica': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    'Alta': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    'Media': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    'Baixa': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  }
  const config = configs[prioridade] || configs['Media']
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${config.bg} ${config.text} ${config.border}`}>
      {prioridade}
    </span>
  )
}

interface EpicRowProps {
  epic: Epico
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function EpicRow({ epic, isExpanded, onToggle }: EpicRowProps): React.ReactElement {
  return (
    <div className="group border-b border-slate-100 last:border-b-0">
      <div onClick={onToggle} className="cursor-pointer px-6 py-5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50/50 transition-colors">
        <div className="col-span-12 md:col-span-5 flex items-start gap-4">
          <div className={`mt-1 p-1.5 rounded-full transition-all duration-300 ${isExpanded ? 'bg-[#011334] text-white rotate-180' : 'bg-slate-100 text-slate-400 group-hover:bg-[#011334] group-hover:text-white'}`}>
            <ChevronDown size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 tracking-wider font-mono">#{epic.id}</span>
              {getPriorityBadge(epic.prioridade_estrategica)}
            </div>
            <h3 className="font-bold text-slate-800 leading-tight text-base group-hover:text-[#011334] transition-colors">{epic.titulo}</h3>
          </div>
        </div>
        <div className="hidden md:block col-span-5 text-sm text-slate-500 font-medium line-clamp-2 pr-4 leading-relaxed">{epic.business_case}</div>
        <div className="col-span-12 md:col-span-2 flex items-center justify-between md:justify-end gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm whitespace-nowrap">
            <Clock size={14} className="text-indigo-500" />
            {epic.estimativa_semanas}
          </div>
        </div>
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 pb-6 pt-0 pl-[4.5rem] grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 border-t border-dashed border-slate-200 rounded-b-lg mx-6 mb-4">
          <div className="space-y-6 pt-6">
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <Target size={14} />Objetivo de Negocio
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-lg border border-slate-200 shadow-sm">{epic.business_case}</p>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                <Users size={14} />Squad Sugerida
              </h4>
              <div className="flex flex-wrap gap-2">
                {epic.squad_sugerida.map((role: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">{role}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6 pt-6">
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <PackageCheck size={14} />Entregaveis Macro
              </h4>
              <ul className="space-y-2">
                {epic.entregaveis_macro.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EpicosReport({ data, className = '' }: EpicosReportProps): React.ReactElement {
  const [expandedIndexes, setExpandedIndexes] = useState<Set<number>>(new Set())

  const stats = useMemo(() => {
    const total = data.epicos.length
    const criticos = data.epicos.filter((e: Epico) => e.prioridade_estrategica === 'Critica').length
    return { total, criticos }
  }, [data.epicos])

  const toggleAccordion = (index: number): void => {
    setExpandedIndexes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const handleExportCSV = (): void => {
    const csvData = data.epicos.map((epic: Epico) => ({
      ID: epic.id,
      Titulo: epic.titulo,
      Prioridade: epic.prioridade_estrategica,
      Estimativa: epic.estimativa_semanas,
      'Business Case': epic.business_case,
      Squad: epic.squad_sugerida.join(', '),
      Entregaveis: epic.entregaveis_macro.join(' | '),
    }))
    exportToCSV(csvData, ['ID', 'Titulo', 'Prioridade', 'Estimativa', 'Business Case', 'Squad', 'Entregaveis'], `Epicos_${data.project_name.replace(/\s+/g, '_')}.csv`)
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 pb-24 ${className}`}>
      <ReportHeader icon={Layers} projectName={data.project_name} reportTitle="Backlog de Epicos" actions={<ExportButton format="csv" onClick={handleExportCSV} />} />
      <main className="max-w-[98%] mx-auto px-6 py-8">
        <ReportStats columns={3} stats={[
          { icon: FileStack, label: 'Total de Epicos', value: stats.total, ...STAT_COLORS.info },
          { icon: AlertCircle, label: 'Prioridade Critica', value: stats.criticos, ...STAT_COLORS.error },
          { icon: Clock, label: 'Ciclo Estimado', value: '~6-7 Meses', ...STAT_COLORS.success },
        ]} />
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs font-bold text-white uppercase tracking-wider" style={{ backgroundColor: BRAND.primary }}>
            <div className="col-span-12 md:col-span-5 flex items-center gap-2"><Hash size={14} className="text-indigo-200" />Epico</div>
            <div className="hidden md:flex md:col-span-5 items-center gap-2"><FileText size={14} className="text-indigo-200" />Business Case (Resumo)</div>
            <div className="hidden md:flex md:col-span-2 justify-end items-center gap-2"><Timer size={14} className="text-indigo-200" />Estimativa</div>
          </div>
          <div className="divide-y divide-slate-100">
            {data.epicos.map((epic: Epico, index: number) => (
              <EpicRow key={epic.id} epic={epic} index={index} isExpanded={expandedIndexes.has(index)} onToggle={() => toggleAccordion(index)} />
            ))}
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-slate-400 mb-8"><p>Confidencial - Uso Interno</p></div>
      </main>
    </div>
  )
}

export default EpicosReport
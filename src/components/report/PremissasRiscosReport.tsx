// src/components/report/PremissasRiscosReport.tsx
'use client'

import React, { useState, useMemo } from 'react'
import { ShieldAlert, FileCheck, AlertTriangle, Siren, ShieldCheck, FileCheck2, LayoutGrid, CheckCircle2, AlertOctagon, X } from 'lucide-react'
import type { PremissasRiscosReportData, Premissa, Risco, ProbabilidadeRisco, ImpactoRisco } from '@/types/reports'
import { ReportHeader } from './ReportHeader'
import { ReportStats, STAT_COLORS } from './ReportStats'
import { ExportButton, exportToCSV } from './ExportButtons'

const BRAND = { primary: '#011334' }

interface PremissasRiscosReportProps {
  data: PremissasRiscosReportData
  className?: string
}

type TabType = 'premissas' | 'riscos'

function getMatrixCoords(risco: Risco): { row: number; col: number } {
  const probMap: Record<ProbabilidadeRisco, number> = { 'Alta': 1, 'Media': 2, 'Baixa': 3 }
  const impMap: Record<ImpactoRisco, number> = { 'Critico': 3, 'Alto': 3, 'Medio': 2, 'Baixo': 1 }
  const probNorm = risco.probabilidade.normalize('NFD').replace(/[\u0300-\u036f]/g, '') as ProbabilidadeRisco
  const impNorm = risco.impacto.normalize('NFD').replace(/[\u0300-\u036f]/g, '') as ImpactoRisco
  return { row: probMap[probNorm] || probMap[risco.probabilidade] || 2, col: impMap[impNorm] || impMap[risco.impacto] || 2 }
}

function getCellColor(row: number, col: number): string {
  const colors: Record<string, string> = {
    '1-3': BRAND.primary, '1-2': '#4f46e5', '1-1': '#6366f1',
    '2-3': '#6366f1', '2-2': '#a5b4fc', '2-1': '#c7d2fe',
    '3-3': '#a5b4fc', '3-2': '#e0e7ff', '3-1': '#eef2ff',
  }
  return colors[`${row}-${col}`] || '#f1f5f9'
}

interface PremissaCardProps { premissa: Premissa }

function PremissaCard({ premissa }: PremissaCardProps): React.ReactElement {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 tracking-wider font-mono">{premissa.id}</span>
        <div className="p-1.5 rounded-full" style={{ backgroundColor: `${BRAND.primary}10` }}><CheckCircle2 size={16} style={{ color: BRAND.primary }} /></div>
      </div>
      <p className="text-sm text-slate-700 font-medium leading-relaxed mb-6 flex-grow">{premissa.descricao}</p>
      <div className="bg-red-50 rounded-lg p-3 border border-red-100 mt-auto">
        <p className="text-[10px] uppercase font-bold text-red-700 mb-1 flex items-center gap-1"><AlertOctagon size={12} />Impacto se falhar</p>
        <p className="text-xs text-red-900 leading-snug">{premissa.impacto_se_falhar}</p>
      </div>
    </div>
  )
}

interface RiskMatrixProps { riscos: Risco[]; onRiskClick: (risco: Risco) => void }

function RiskMatrix({ riscos, onRiskClick }: RiskMatrixProps): React.ReactElement {
  const risksByCell = useMemo(() => {
    const map = new Map<string, Risco[]>()
    riscos.forEach((risco: Risco) => {
      const { row, col } = getMatrixCoords(risco)
      const key = `${row}-${col}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(risco)
    })
    return map
  }, [riscos])

  const renderCell = (row: number, col: number): React.ReactElement => {
    const key = `${row}-${col}`
    const cellRisks = risksByCell.get(key) || []
    return (
      <div key={key} className="p-4 rounded-md min-h-[140px] relative transition-all hover:brightness-95" style={{ backgroundColor: getCellColor(row, col) }}>
        <div className="flex flex-wrap gap-1">
          {cellRisks.map((risco: Risco) => (
            <button key={risco.id} onClick={() => onRiskClick(risco)} className="inline-block text-[10px] font-bold bg-white border border-slate-300 rounded px-1.5 py-0.5 shadow-sm hover:shadow-md text-slate-700 transition-transform hover:scale-105">{risco.id}</button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Matriz de Probabilidade x Impacto</h3>
        <p className="text-xs text-slate-500">Clique em um risco para ver detalhes</p>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr', gridTemplateRows: 'auto 1fr 1fr 1fr' }}>
        <div className="p-3" />
        <div className="p-3 text-center text-xs font-bold text-slate-500 uppercase">Baixo</div>
        <div className="p-3 text-center text-xs font-bold text-slate-500 uppercase">Medio</div>
        <div className="p-3 text-center text-xs font-bold text-slate-500 uppercase">Critico/Alto</div>
        <div className="p-3 text-right text-xs font-bold text-slate-500 uppercase flex items-center justify-end">Alta</div>
        {[1, 2, 3].map((col) => renderCell(1, col))}
        <div className="p-3 text-right text-xs font-bold text-slate-500 uppercase flex items-center justify-end">Media</div>
        {[1, 2, 3].map((col) => renderCell(2, col))}
        <div className="p-3 text-right text-xs font-bold text-slate-500 uppercase flex items-center justify-end">Baixa</div>
        {[1, 2, 3].map((col) => renderCell(3, col))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-slate-500">
        <span className="font-bold uppercase tracking-wider">Impacto</span><span>→</span><span className="font-bold uppercase tracking-wider">Probabilidade</span><span>↓</span>
      </div>
    </div>
  )
}

interface RiskModalProps { risco: Risco | null; onClose: () => void }

function RiskModal({ risco, onClose }: RiskModalProps): React.ReactElement | null {
  if (!risco) return null
  const getSeverity = (): { label: string; bg: string; text: string } => {
    const isHighProb = risco.probabilidade.toLowerCase().includes('alta')
    const isCritical = risco.impacto.toLowerCase().includes('crit')
    if (isHighProb && isCritical) return { label: 'EXTREMO', bg: BRAND.primary, text: 'white' }
    if (isHighProb || isCritical) return { label: 'ALTO', bg: '#4f46e5', text: 'white' }
    return { label: 'MODERADO', bg: '#e0e7ff', text: '#312e81' }
  }
  const severity = getSeverity()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 transition-colors"><X size={20} className="text-slate-400" /></button>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold px-3 py-1 rounded" style={{ backgroundColor: BRAND.primary, color: 'white' }}>{risco.id}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border" style={{ backgroundColor: severity.bg, color: severity.text, borderColor: severity.bg }}>{severity.label}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Descricao do Risco</p><p className="text-sm text-slate-700 leading-relaxed">{risco.descricao}</p></div>
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Probabilidade</p><p className="text-sm font-semibold text-slate-800">{risco.probabilidade}</p></div>
            <div className="flex-1 bg-slate-50 p-3 rounded-lg"><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impacto</p><p className="text-sm font-semibold text-slate-800">{risco.impacto}</p></div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
            <p className="text-[10px] font-bold text-emerald-700 uppercase mb-2 flex items-center gap-1"><ShieldCheck size={12} />Plano de Mitigacao</p>
            <p className="text-sm text-emerald-900 leading-relaxed">{risco.plano_mitigacao}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PremissasRiscosReport({ data, className = '' }: PremissasRiscosReportProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabType>('premissas')
  const [selectedRisk, setSelectedRisk] = useState<Risco | null>(null)

  const stats = useMemo(() => ({
    totalPremissas: data.premissas.length,
    totalRiscos: data.riscos.length,
    riscosCriticos: data.riscos.filter((r: Risco) => r.impacto.toLowerCase().includes('crit')).length,
    probAlta: data.riscos.filter((r: Risco) => r.probabilidade.toLowerCase().includes('alta')).length,
  }), [data])

  const handleExportCSV = (): void => {
    if (activeTab === 'premissas') {
      const csvData = data.premissas.map((p: Premissa) => ({ ID: p.id, Descricao: p.descricao, 'Impacto se Falhar': p.impacto_se_falhar }))
      exportToCSV(csvData, ['ID', 'Descricao', 'Impacto se Falhar'], `Premissas_${data.project_name.replace(/\s+/g, '_')}.csv`)
    } else {
      const csvData = data.riscos.map((r: Risco) => ({ ID: r.id, Probabilidade: r.probabilidade, Impacto: r.impacto, Descricao: r.descricao, 'Plano de Mitigacao': r.plano_mitigacao }))
      exportToCSV(csvData, ['ID', 'Probabilidade', 'Impacto', 'Descricao', 'Plano de Mitigacao'], `Riscos_${data.project_name.replace(/\s+/g, '_')}.csv`)
    }
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 pb-24 flex flex-col ${className}`}>
      <ReportHeader icon={ShieldAlert} projectName={data.project_name} reportTitle="Gestao de Riscos e Premissas" actions={<ExportButton format="csv" onClick={handleExportCSV} />} />
      <main className="max-w-[98%] mx-auto px-6 py-8 flex-grow">
        <ReportStats columns={4} stats={[
          { icon: FileCheck, label: 'Total Premissas', value: stats.totalPremissas, ...STAT_COLORS.blue },
          { icon: AlertTriangle, label: 'Total Riscos', value: stats.totalRiscos, ...STAT_COLORS.warning },
          { icon: Siren, label: 'Riscos Criticos', value: stats.riscosCriticos, ...STAT_COLORS.error },
          { icon: ShieldCheck, label: 'Probabilidade Alta', value: stats.probAlta, ...STAT_COLORS.info },
        ]} />
        <div className="flex items-center gap-1 mb-8 border-b border-slate-200">
          <button onClick={() => setActiveTab('premissas')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'premissas' ? 'text-[#011334] border-[#011334]' : 'text-slate-500 border-transparent hover:text-[#011334]'}`}><FileCheck2 size={18} />Premissas</button>
          <button onClick={() => setActiveTab('riscos')} className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'riscos' ? 'text-[#011334] border-[#011334]' : 'text-slate-500 border-transparent hover:text-[#011334]'}`}><LayoutGrid size={18} />Matriz de Riscos (Heatmap)</button>
        </div>
        <div className="animate-in fade-in duration-300">
          {activeTab === 'premissas' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.premissas.map((premissa: Premissa) => <PremissaCard key={premissa.id} premissa={premissa} />)}
            </div>
          ) : (
            <RiskMatrix riscos={data.riscos} onRiskClick={setSelectedRisk} />
          )}
        </div>
        <div className="mt-12 text-center"><p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Documento Tecnico - Peers Consulting</p></div>
      </main>
      <RiskModal risco={selectedRisk} onClose={() => setSelectedRisk(null)} />
    </div>
  )
}

export default PremissasRiscosReport
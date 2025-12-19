// src/components/report/CronogramaReport.tsx
'use client'

import React, { useState, useMemo, useRef } from 'react'
import { KanbanSquare, Layers, Camera, Download, Loader2 } from 'lucide-react'
import type { CronogramaReportData, CronogramaStep, CronogramaEpico } from '@/types/reports'
import { ReportHeader } from './ReportHeader'
import { exportToCSV } from './ExportButtons'
import { Button } from '@/components/ui/button'

const BRAND = { primary: '#011334' }

interface CronogramaReportProps {
  data: CronogramaReportData
  className?: string
}

interface TooltipData {
  show: boolean
  x: number
  y: number
  week: string
  phase: string
  progress: string
  activity: string
  justification?: string
}

function getProgressColor(progressStr: string): string {
  const progress = parseInt(progressStr.replace('%', ''), 10) || 0
  if (progress >= 90) return BRAND.primary
  if (progress >= 70) return '#022558'
  if (progress >= 50) return '#033670'
  if (progress >= 30) return '#0447a0'
  if (progress >= 10) return '#3b82f6'
  return '#dbeafe'
}

function getTextColor(progressStr: string): string {
  const progress = parseInt(progressStr.replace('%', ''), 10) || 0
  return progress >= 40 ? 'white' : '#1e293b'
}

interface TooltipProps {
  data: TooltipData
}

function Tooltip({ data }: TooltipProps): React.ReactElement | null {
  if (!data.show) return null
  const bgColor = getProgressColor(data.progress)
  const textColor = getTextColor(data.progress)
  return (
    <div
      className="fixed z-50 bg-white text-slate-800 text-xs rounded-lg shadow-xl border border-slate-200 p-4 max-w-[350px] transition-opacity duration-150"
      style={{ left: Math.min(data.x + 15, typeof window !== 'undefined' ? window.innerWidth - 380 : 800), top: data.y + 15, opacity: data.show ? 1 : 0, pointerEvents: 'none' }}
    >
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
        <div>
          <span className="font-bold uppercase tracking-wide block" style={{ color: BRAND.primary }}>{data.phase}</span>
          <span className="text-[10px] text-slate-400">{data.week}</span>
        </div>
        <span className="font-bold px-2 py-1 rounded text-[10px] border border-slate-200" style={{ backgroundColor: bgColor, color: textColor }}>{data.progress}</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Atividades</p>
          <p className="text-sm leading-snug font-medium text-slate-700">{data.activity}</p>
        </div>
        {data.justification && (
          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase mb-0.5">Estrategia</p>
            <p className="text-xs leading-snug text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">{data.justification}</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProgressBarProps {
  step: CronogramaStep
  onMouseEnter: (e: React.MouseEvent, step: CronogramaStep) => void
  onMouseLeave: () => void
  onMouseMove: (e: React.MouseEvent) => void
}

function ProgressBar({ step, onMouseEnter, onMouseLeave, onMouseMove }: ProgressBarProps): React.ReactElement {
  const bgColor = getProgressColor(step.progresso_estimado)
  return (
    <div
      className="h-7 relative z-10 transition-all duration-200 cursor-default hover:brightness-110 hover:scale-y-110 hover:z-20 hover:shadow-md rounded-sm"
      style={{ backgroundColor: bgColor }}
      onMouseEnter={(e) => onMouseEnter(e, step)}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
    />
  )
}

export function CronogramaReport({ data, className = '' }: CronogramaReportProps): React.ReactElement {
  const matrixRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipData>({ show: false, x: 0, y: 0, week: '', phase: '', progress: '', activity: '', justification: undefined })

  const maxWeek = useMemo(() => {
    let max = 0
    data.cronograma.forEach((epic: CronogramaEpico) => {
      epic.steps.forEach((step: CronogramaStep) => {
        if (step.semana > max) max = step.semana
      })
    })
    return max
  }, [data.cronograma])

  const weeks = useMemo(() => Array.from({ length: maxWeek }, (_, i) => i + 1), [maxWeek])

  const handleMouseEnter = (e: React.MouseEvent, step: CronogramaStep): void => {
    setTooltip({ show: true, x: e.clientX, y: e.clientY, week: `Semana ${step.semana}`, phase: step.fase, progress: step.progresso_estimado, activity: step.atividades_focadas, justification: step.justificativa_agendamento })
  }
  const handleMouseLeave = (): void => { setTooltip((prev) => ({ ...prev, show: false })) }
  const handleMouseMove = (e: React.MouseEvent): void => { setTooltip((prev) => ({ ...prev, x: e.clientX, y: e.clientY })) }

  const handleExportCSV = (): void => {
    const csvData: Record<string, unknown>[] = []
    data.cronograma.forEach((epic: CronogramaEpico) => {
      epic.steps.forEach((step: CronogramaStep) => {
        csvData.push({ Epico: epic.epic_name, Fase: step.fase, Atividade: step.atividades_focadas, Progresso: step.progresso_estimado, Semana: step.semana, Justificativa: step.justificativa_agendamento || '' })
      })
    })
    exportToCSV(csvData, ['Epico', 'Fase', 'Atividade', 'Progresso', 'Semana', 'Justificativa'], `Cronograma_${data.project_name.replace(/\s+/g, '_')}.csv`)
  }

  const handleExportImage = async (): Promise<void> => {
    if (!matrixRef.current) return
    setIsExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(matrixRef.current, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true })
      const link = document.createElement('a')
      link.download = `Cronograma_${data.project_name.replace(/\s+/g, '_')}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Erro ao exportar imagem:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 pb-24 relative ${className}`}>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[98%] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md" style={{ backgroundColor: BRAND.primary }}><KanbanSquare size={22} /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">{data.project_name}</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Timeline de Execucao Detalhada</p>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-end gap-1.5 mr-8">
            <div className="flex justify-between w-64 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><span>Inicio (0%)</span><span>Concluido (100%)</span></div>
            <div className="w-64 h-2 rounded-full relative bg-slate-100 border border-slate-200 overflow-hidden">
              <div className="absolute inset-0" style={{ background: `linear-gradient(to right, hsl(219, 100%, 95%), ${BRAND.primary})` }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="default" onClick={handleExportImage} disabled={isExporting} className="group flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium transition-all shadow-sm">
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              <span className="hidden sm:inline">{isExporting ? 'Gerando...' : 'Salvar Imagem'}</span>
            </Button>
            <Button variant="outline" size="icon" onClick={handleExportCSV} title="Baixar CSV" className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-all shadow-sm"><Download size={20} /></Button>
          </div>
        </div>
      </header>
      <main className="max-w-[98%] mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div><h2 className="text-xl font-bold text-slate-800 mb-1">Roteiro de Entregas</h2><p className="text-sm text-slate-500">Visualizacao semanal de fases e progresso estimado.</p></div>
          <div className="text-right"><p className="text-3xl font-bold text-slate-800">{data.cronograma.length}</p><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Epicos Planejados</p></div>
        </div>
        <div ref={matrixRef} className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead className="text-xs font-bold text-slate-300 uppercase tracking-wider sticky top-0 z-40 shadow-md" style={{ backgroundColor: BRAND.primary }}>
                <tr>
                  <th className="p-5 min-w-[350px] border-b border-slate-700 sticky left-0 z-50" style={{ backgroundColor: BRAND.primary }}>
                    <div className="flex items-center gap-2 text-white"><Layers size={14} className="text-indigo-200" />Epico / Iniciativa</div>
                  </th>
                  {weeks.map((week: number) => <th key={week} className="p-3 min-w-[60px] text-center border-b border-l border-slate-700 text-white">S{week}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {data.cronograma.map((epic: CronogramaEpico, epicIdx: number) => {
                  const weekMap = new Map<number, CronogramaStep>()
                  epic.steps.forEach((step: CronogramaStep) => { weekMap.set(step.semana, step) })
                  return (
                    <tr key={epicIdx} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-800 sticky left-0 bg-white border-r border-slate-200 z-30">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: BRAND.primary }}>{epic.epic_id}</span>
                          <span className="whitespace-normal leading-tight">{epic.epic_name}</span>
                        </div>
                      </td>
                      {weeks.map((week: number) => {
                        const step = weekMap.get(week)
                        return <td key={week} className="p-1 border-l border-slate-100">{step && <ProgressBar step={step} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove} />}</td>
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 text-center"><p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Confidencial - Uso Interno</p></div>
      </main>
      <Tooltip data={tooltip} />
    </div>
  )
}

export default CronogramaReport
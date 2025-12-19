// src/components/cronograma/cronograma-executivo.tsx
// Componente de Cronograma Executivo com Gantt Chart interativo
// Baseado no design do Projeto Plurix
"use client"

import { useState, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, Download, Camera, Layers, X
} from 'lucide-react'

// ============================================================================
// TIPOS
// ============================================================================

export interface SemanaAtividade {
  semana: number
  fase: string
  atividades_focadas: string
  progresso_estimado: string
  justificativa_agendamento: string
}

export interface EpicoTimeline {
  nome: string
  semanas: SemanaAtividade[]
}

export interface CronogramaFromAPI {
  epicos_timeline_report: Array<Record<string, SemanaAtividade[]>>
}

interface CronogramaExecutivoProps {
  projectName: string
  data: CronogramaFromAPI | null
  onBack?: () => void
  onExportImage?: () => void
  onExportCSV?: () => void
}

// ============================================================================
// CONSTANTES DE CORES
// ============================================================================

const BRAND_COLORS = {
  primary: '#011334',
  info: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
}

// Gradiente de cores para as barras (do mais claro ao mais escuro)
const getBarColor = (progress: number): string => {
  if (progress <= 20) return '#bfdbfe'      // blue-200
  if (progress <= 40) return '#93c5fd'      // blue-300
  if (progress <= 60) return '#60a5fa'      // blue-400
  if (progress <= 80) return '#3b82f6'      // blue-500
  return '#1e40af'                           // blue-800
}

// ============================================================================
// COMPONENTE: Tooltip Flutuante
// ============================================================================

interface TooltipData {
  fase: string
  semana: number
  progresso: string
  atividades: string
  estrategia: string
  x: number
  y: number
}

function FloatingTooltip({ data, onClose }: { data: TooltipData | null; onClose: () => void }) {
  if (!data) return null

  return (
    <div 
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 max-w-[380px]"
      style={{ 
        left: Math.min(data.x, window.innerWidth - 400), 
        top: Math.min(data.y + 10, window.innerHeight - 300),
      }}
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div>
          <span className="font-bold text-slate-800 uppercase tracking-wide block text-sm">
            {data.fase}
          </span>
          <span className="text-[10px] text-slate-400">Semana {data.semana}</span>
        </div>
        <Badge 
          className="text-[10px] font-bold"
          style={{ 
            backgroundColor: getBarColor(parseInt(data.progresso) || 0) + '30',
            color: getBarColor(parseInt(data.progresso) || 0),
            border: `1px solid ${getBarColor(parseInt(data.progresso) || 0)}40`
          }}
        >
          {data.progresso}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Atividades</p>
          <p className="text-sm leading-relaxed text-slate-700">{data.atividades}</p>
        </div>
        
        {data.estrategia && data.estrategia !== 'N/A' && (
          <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-600 uppercase mb-1">Estratégia</p>
            <p className="text-xs leading-relaxed text-slate-600 italic">{data.estrategia}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: Barra de Progresso Segmentada
// ============================================================================

interface GanttBarProps {
  semanas: SemanaAtividade[]
  startWeek: number
  totalWeeks: number
  onHover: (data: TooltipData | null) => void
}

function GanttBar({ semanas, startWeek, totalWeeks, onHover }: GanttBarProps) {
  const handleMouseEnter = (semana: SemanaAtividade, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    onHover({
      fase: semana.fase,
      semana: semana.semana,
      progresso: semana.progresso_estimado,
      atividades: semana.atividades_focadas,
      estrategia: semana.justificativa_agendamento,
      x: rect.left,
      y: rect.bottom,
    })
  }

  return (
    <>
      {semanas.map((semana, idx) => {
        const progress = parseInt(semana.progresso_estimado) || 0
        const colStart = semana.semana - startWeek + 2 // +2 porque col 1 é o nome do épico
        
        return (
          <div
            key={idx}
            className="h-7 rounded cursor-pointer transition-all duration-200 hover:scale-y-110 hover:shadow-lg hover:z-20 relative"
            style={{ 
              backgroundColor: getBarColor(progress),
              gridColumn: colStart,
            }}
            onMouseEnter={(e) => handleMouseEnter(semana, e)}
            onMouseLeave={() => onHover(null)}
          />
        )
      })}
    </>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CronogramaExecutivo({
  projectName,
  data,
  onBack,
  onExportImage,
  onExportCSV,
}: CronogramaExecutivoProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Processar dados da API
  const { epicos, maxWeek, minWeek } = useMemo(() => {
    if (!data?.epicos_timeline_report) {
      return { epicos: [], maxWeek: 14, minWeek: 1 }
    }

    let max = 0
    let min = Infinity
    
    const parsed = data.epicos_timeline_report.map(obj => {
      const epicName = Object.keys(obj)[0]
      const weekSteps = obj[epicName] || []
      
      weekSteps.forEach(w => {
        if (w.semana > max) max = w.semana
        if (w.semana < min) min = w.semana
      })

      return {
        nome: epicName,
        semanas: weekSteps,
      }
    })

    return { 
      epicos: parsed, 
      maxWeek: Math.max(max, 14), 
      minWeek: Math.min(min, 1) 
    }
  }, [data])

  // Gerar array de semanas para o header
  const weeks = useMemo(() => {
    const arr = []
    for (let i = minWeek; i <= maxWeek; i++) {
      arr.push(i)
    }
    return arr
  }, [minWeek, maxWeek])

  const totalEpicos = epicos.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-[98%] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 text-slate-600 hover:text-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                style={{ background: BRAND_COLORS.primary }}
              >
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">{projectName} - Cronograma Executivo</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                  Timeline de Execução Detalhada
                </p>
              </div>
            </div>
          </div>
          
          {/* Legenda de Progresso */}
          <div className="hidden lg:flex flex-col items-end gap-1.5 mr-8">
            <div className="flex justify-between w-64 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span>Início (0%)</span>
              <span>Concluído (100%)</span>
            </div>
            <div className="w-64 h-2 rounded-full relative bg-slate-100 border border-slate-200 overflow-hidden">
              <div 
                className="absolute inset-0" 
                style={{ background: 'linear-gradient(to right, #bfdbfe, #1e40af)' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onExportImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportImage}
                className="gap-2"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Salvar Imagem</span>
              </Button>
            )}
            {onExportCSV && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[98%] mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Roteiro de Entregas</h2>
            <p className="text-sm text-slate-500">Visualização semanal de fases e progresso estimado.</p>
          </div>
          
          <div className="text-right">
            <p className="text-3xl font-bold text-slate-800">{totalEpicos}</p>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Épicos Planejados</p>
          </div>
        </div>

        {/* Matrix Container */}
        <div 
          ref={containerRef}
          className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Header */}
              <thead 
                className="text-xs font-bold text-slate-300 uppercase tracking-wider sticky top-0 z-30"
                style={{ backgroundColor: BRAND_COLORS.primary }}
              >
                <tr>
                  <th 
                    className="p-5 min-w-[400px] border-b border-slate-700 sticky left-0 z-40"
                    style={{ backgroundColor: BRAND_COLORS.primary }}
                  >
                    <div className="flex items-center gap-2 text-white">
                      <Layers className="w-4 h-4 text-indigo-200" />
                      Épico / Iniciativa
                    </div>
                  </th>
                  {weeks.map(week => (
                    <th 
                      key={week} 
                      className="p-3 text-center min-w-[70px] border-b border-slate-700 text-white"
                    >
                      S{week}
                    </th>
                  ))}
                </tr>
              </thead>
              
              {/* Body */}
              <tbody className="divide-y divide-slate-100 text-sm bg-white">
                {epicos.length > 0 ? (
                  epicos.map((epico, idx) => {
                    // Verificar se é uma linha de separação de fase
                    const isFaseHeader = epico.nome.startsWith('FASE') || epico.nome.startsWith('ONDA')
                    
                    return (
                      <tr 
                        key={idx} 
                        className={`
                          hover:bg-slate-50 transition-colors
                          ${isFaseHeader ? 'bg-slate-100 font-semibold' : ''}
                        `}
                      >
                        <td 
                          className={`
                            p-4 min-w-[400px] sticky left-0 z-20 border-r border-slate-200
                            ${isFaseHeader ? 'bg-slate-100 text-slate-700 italic' : 'bg-white text-slate-800'}
                          `}
                        >
                          <span className={isFaseHeader ? '' : 'hover:text-indigo-600 cursor-default'}>
                            {epico.nome}
                          </span>
                        </td>
                        
                        {weeks.map(week => {
                          const semanaAtividade = epico.semanas.find(s => s.semana === week)
                          
                          if (semanaAtividade) {
                            const progress = parseInt(semanaAtividade.progresso_estimado) || 0
                            
                            return (
                              <td key={week} className="p-1.5 relative">
                                <div
                                  className="h-7 rounded cursor-pointer transition-all duration-200 hover:scale-y-125 hover:shadow-lg hover:z-20"
                                  style={{ backgroundColor: getBarColor(progress) }}
                                  onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setTooltipData({
                                      fase: semanaAtividade.fase,
                                      semana: semanaAtividade.semana,
                                      progresso: semanaAtividade.progresso_estimado,
                                      atividades: semanaAtividade.atividades_focadas,
                                      estrategia: semanaAtividade.justificativa_agendamento,
                                      x: rect.left,
                                      y: rect.bottom,
                                    })
                                  }}
                                  onMouseLeave={() => setTooltipData(null)}
                                />
                              </td>
                            )
                          }
                          
                          return <td key={week} className="p-1.5" />
                        })}
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={weeks.length + 1} className="p-12 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
                        <Layers className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Nenhum cronograma encontrado</h3>
                      <p className="text-slate-500 mt-1">
                        O cronograma do projeto ainda não foi gerado.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            Confidencial • Uso Interno
          </p>
        </div>
      </main>

      {/* Tooltip Flutuante */}
      <FloatingTooltip data={tooltipData} onClose={() => setTooltipData(null)} />
    </div>
  )
}

export default CronogramaExecutivo
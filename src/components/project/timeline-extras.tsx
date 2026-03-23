// src/components/project/timeline-extras.tsx
// FEATURE 5: Rich tooltip for timeline cells
// FEATURE 12: Dedicated Timeline CSV export
// FEATURE 17: Fade-in animation class
'use client'

import React, { useState, useRef, useCallback } from 'react'
import { BRAND } from '@/components/layout/sidebar'
import { showToast } from '@/components/project/toast'

type Rec = Record<string, unknown>

// ── FEATURE 5: Timeline Tooltip ──────────────────────────────────────────
// Instead of a modal, shows a floating tooltip that follows the mouse

interface TooltipData {
  fase: string
  semana: string
  progresso: string
  atividades: string
  justificativa: string
}

export function TimelineTooltip({ data, position }: { data: TooltipData | null; position: { x: number; y: number } }) {
  if (!data) return null
  return (
    <div className="fixed z-[9999] pointer-events-none transition-opacity duration-150"
      style={{ left: position.x + 16, top: position.y - 10, opacity: data ? 1 : 0 }}>
      <div className="bg-white border border-gray-200 shadow-2xl rounded-xl p-4 max-w-[320px]">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
          <div>
            <span className="font-bold text-xs uppercase tracking-widest block" style={{ color: BRAND.primary }}>{data.fase}</span>
            <span className="text-[10px] text-gray-400 font-bold">Semana {data.semana}</span>
          </div>
          <span className="font-bold px-2 py-1 rounded text-[10px] border border-gray-200 bg-gray-50" style={{ color: BRAND.primary }}>{data.progresso}</span>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Atividades</p>
            <p className="text-xs text-gray-600 leading-relaxed">{data.atividades}</p>
          </div>
          {data.justificativa ? (
            <div>
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Estratégia</p>
              <p className="text-[10px] text-emerald-600 leading-relaxed italic bg-emerald-50 p-2 rounded-lg border border-emerald-200">{data.justificativa}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Hook for tooltip state management
export function useTimelineTooltip() {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const showTooltip = useCallback((e: React.MouseEvent, step: Rec) => {
    setTooltipData({
      fase: String(step.fase || ''),
      semana: String(step.semana || ''),
      progresso: String(step.progresso_estimado || ''),
      atividades: String(step.atividades_focadas || ''),
      justificativa: String(step.justificativa_agendamento || ''),
    })
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  const moveTooltip = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY })
  }, [])

  const hideTooltip = useCallback(() => {
    setTooltipData(null)
  }, [])

  return { tooltipData, tooltipPos, showTooltip, moveTooltip, hideTooltip }
}

// ── FEATURE 12: Timeline CSV Export ──────────────────────────────────────

export function exportTimelineCSV(data: unknown, projectName?: string) {
  function extractItems(d: unknown): Rec[] {
    if (Array.isArray(d)) return d as Rec[]
    if (typeof d === 'object' && d !== null) {
      for (const k of Object.keys(d as Rec)) { if (Array.isArray((d as Rec)[k])) return (d as Rec)[k] as Rec[] }
    }
    return []
  }

  const items = extractItems(data)
  if (!items.length) { showToast('Nenhum dado para exportar', 'error'); return }

  let csv = 'Épico;Semana;Fase;Atividades;Progresso;Justificativa\n'
  items.forEach(obj => {
    const name = Object.keys(obj)[0]
    const steps = Array.isArray(obj[name]) ? obj[name] as Rec[] : []
    steps.forEach(s => {
      csv += `"${name}";"${s.semana}";"${s.fase}";"${String(s.atividades_focadas || '').replace(/"/g, '""')}";"${s.progresso_estimado}";"${String(s.justificativa_agendamento || '').replace(/"/g, '""')}"\n`
    })
  })

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `timeline_${projectName?.replace(/[^a-z0-9]/gi, '_') || 'project'}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  showToast('Timeline CSV exportado!', 'success')
}

// ── FEATURE 17: Fade-in animation ───────────────────────────────────────
// Add this to your globals.css or tailwind config:
// @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
// .animate-fade-in { animation: fadeIn 0.4s ease-in; }

// CSS to add to globals.css:
export const FADE_IN_CSS = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.4s ease-in;
}
`

// Tailwind class to use:
export const fadeInClass = 'animate-fade-in'
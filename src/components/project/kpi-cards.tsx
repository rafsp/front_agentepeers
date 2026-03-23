// src/components/project/kpi-cards.tsx
'use client'

import React from 'react'
import { BRAND } from '@/components/layout/sidebar'
import { Layers, Activity, Calendar, AlertTriangle, AlertOctagon, FileText, Shield, Target } from 'lucide-react'

type Rec = Record<string, unknown>

function extractItems(data: unknown): Rec[] {
  if (Array.isArray(data)) return data as Rec[]
  if (typeof data === 'object' && data !== null) {
    for (const k of Object.keys(data as Rec)) {
      if (Array.isArray((data as Rec)[k])) return (data as Rec)[k] as Rec[]
    }
  }
  return []
}

interface KPIItem {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
}

function KPICard({ item }: { item: KPIItem }) {
  const Icon = item.icon
  return (
    <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex items-center gap-3 min-w-[140px]">
      <div className="p-2 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
        <p className="text-xl font-bold" style={{ color: BRAND.primary }}>{item.value}</p>
      </div>
    </div>
  )
}

export function EpicsKPIs({ data }: { data: unknown }) {
  const items = extractItems(data)
  const total = items.length
  const critical = items.filter(e => {
    const p = String(e.prioridade_estrategica || '').toLowerCase()
    return p.includes('crítica') || p.includes('critica')
  }).length
  const totalWeeks = items.reduce((sum, e) => sum + (Number(e.estimativa_semanas) || 0), 0)

  return (
    <div className="flex gap-3 mb-5 overflow-x-auto">
      <KPICard item={{ label: 'Total Épicos', value: total, icon: Layers, color: '#4f46e5' }} />
      <KPICard item={{ label: 'Prioridade Crítica', value: critical, icon: AlertOctagon, color: '#e11d48' }} />
      <KPICard item={{ label: 'Semanas Estimadas', value: totalWeeks, icon: Calendar, color: '#0ea5e9' }} />
    </div>
  )
}

export function FeaturesKPIs({ data }: { data: unknown }) {
  const items = extractItems(data)
  const total = items.length
  const alta = items.filter(f => String(f.complexidade || '').toLowerCase() === 'alta').length
  const types = new Set(items.map(f => String(f.tipo || '')).filter(Boolean))

  return (
    <div className="flex gap-3 mb-5 overflow-x-auto">
      <KPICard item={{ label: 'Total Features', value: total, icon: Activity, color: '#8b5cf6' }} />
      <KPICard item={{ label: 'Alta Complexidade', value: alta, icon: AlertTriangle, color: '#e11d48' }} />
      <KPICard item={{ label: 'Tipos', value: types.size, icon: Target, color: '#059669' }} />
    </div>
  )
}

export function TimelineKPIs({ data }: { data: unknown }) {
  const items = extractItems(data)
  let maxWeek = 0
  let totalEpics = 0
  items.forEach(obj => {
    const n = Object.keys(obj)[0]
    const steps = Array.isArray(obj[n]) ? obj[n] as Rec[] : []
    if (steps.length > 0) totalEpics++
    steps.forEach(s => { const w = Number(s.semana) || 0; if (w > maxWeek) maxWeek = w })
  })

  return (
    <div className="flex gap-3 mb-5 overflow-x-auto">
      <KPICard item={{ label: 'Semanas', value: maxWeek, icon: Calendar, color: '#0ea5e9' }} />
      <KPICard item={{ label: 'Épicos Planejados', value: totalEpics, icon: Layers, color: '#059669' }} />
    </div>
  )
}

export function RisksKPIs({ premissas, riscos }: { premissas: number; riscos: number; critical?: number; highProb?: number }) {
  return (
    <div className="flex gap-3 mb-5 overflow-x-auto">
      <KPICard item={{ label: 'Premissas', value: premissas, icon: FileText, color: '#4f46e5' }} />
      <KPICard item={{ label: 'Riscos', value: riscos, icon: AlertTriangle, color: '#f59e0b' }} />
    </div>
  )
}
// src/components/project/feature-type-filter.tsx
// FEATURE 8: Filtro por tipo de feature (Backend/Frontend/Infra/Dados)
// USO: Adicionar na FeaturesView, ao lado dos filtros de epic_id
'use client'

import React from 'react'

const TYPES = [
  { key: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-600 border-gray-200' },
  { key: 'backend', label: 'Backend', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { key: 'frontend', label: 'Frontend', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { key: 'infra', label: 'Infra', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  { key: 'dados', label: 'Dados', color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
]

interface FeatureTypeFilterProps {
  current: string
  onChange: (type: string) => void
}

export function FeatureTypeFilter({ current, onChange }: FeatureTypeFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {TYPES.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${
            current === t.key ? 'bg-[#011334] text-white border-[#011334]' : `${t.color} hover:opacity-80`
          }`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

// Helper: filter items by type
export function filterByType(items: Record<string, unknown>[], typeFilter: string): Record<string, unknown>[] {
  if (typeFilter === 'all') return items
  return items.filter(f => {
    const tipo = String(f.tipo || '').toLowerCase()
    return tipo.includes(typeFilter.toLowerCase())
  })
}
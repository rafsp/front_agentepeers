// src/components/project/badges.tsx
'use client'

import React from 'react'

export function PriorityBadge({ level }: { level: string }) {
  const l = (level || '').toLowerCase()
  const cls = l.includes('crítica') || l.includes('critica')
    ? 'bg-red-50 text-red-600 border-red-200'
    : l.includes('alta')
    ? 'bg-orange-50 text-orange-600 border-orange-200'
    : l.includes('média') || l.includes('media')
    ? 'bg-blue-50 text-blue-600 border-blue-200'
    : 'bg-gray-50 text-gray-500 border-gray-200'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-widest ${cls}`}>{level || 'N/A'}</span>
}

export function ComplexityBadge({ level }: { level: string }) {
  const l = (level || '').toLowerCase()
  const cls = l === 'alta'
    ? 'bg-red-50 text-red-500 border-red-200 border-l-4 border-l-red-500'
    : l === 'média' || l === 'media'
    ? 'bg-orange-50 text-orange-500 border-orange-200 border-l-4 border-l-orange-500'
    : 'bg-emerald-50 text-emerald-500 border-emerald-200 border-l-4 border-l-emerald-500'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border ${cls}`}>{level || 'N/A'}</span>
}

export function TypeBadge({ type }: { type: string }) {
  const t = (type || '').toLowerCase()
  const cls = t.includes('backend')
    ? 'bg-blue-50 text-blue-600 border-blue-200'
    : t.includes('frontend')
    ? 'bg-purple-50 text-purple-600 border-purple-200'
    : t.includes('infra') || t.includes('devops')
    ? 'bg-slate-50 text-slate-600 border-slate-200'
    : t.includes('dados') || t.includes('data')
    ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
    : 'bg-gray-50 text-gray-500 border-gray-200'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-widest ${cls}`}>{type || 'N/A'}</span>
}

export function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  const cls = s.includes('ativo') || s.includes('done')
    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
    : s.includes('beta') || s.includes('process')
    ? 'bg-blue-50 text-blue-600 border-blue-200'
    : s.includes('dev') || s.includes('gerando')
    ? 'bg-purple-50 text-purple-600 border-purple-200'
    : 'bg-gray-50 text-gray-500 border-gray-200'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${cls}`}>{status || 'N/A'}</span>
}
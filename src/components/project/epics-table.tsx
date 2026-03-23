// src/components/project/epics-table.tsx
// FEATURE 13: Épicos como tabela (grid 12 colunas com accordion)
'use client'

import React, { useState } from 'react'
import { BRAND } from '@/components/layout/sidebar'
import { PriorityBadge } from '@/components/project/badges'
import { EpicPrototypeInline, type EpicProtoState } from '@/components/project/epic-prototype'
import { ChevronDown, ChevronUp, Layers, Timer, Target } from 'lucide-react'

type Rec = Record<string, unknown>

interface EpicsTableProps {
  items: Rec[]
  projectId: string
  projectName?: string
  userEmail?: string
  epicPrototypes?: Record<string, EpicProtoState>
  onGeneratePrototype?: (epicId: string) => void
  onDownloadPrototype?: (epicId: string) => void
}

export function EpicsTable({ items, projectId, projectName, userEmail, epicPrototypes, onGeneratePrototype, onDownloadPrototype }: EpicsTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!items.length) return <p className="text-gray-400 text-sm">Nenhum épico.</p>

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200">
        <div className="col-span-5 flex items-center gap-2"><Layers className="w-3.5 h-3.5" /> Épico</div>
        <div className="col-span-5 hidden md:block">Resumo de Valor</div>
        <div className="col-span-2 text-right hidden md:flex justify-end items-center gap-1"><Timer className="w-3.5 h-3.5" /> Estimativa</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 max-h-[60vh] overflow-y-auto">
        {items.map((item, index) => {
          const id = String(item.id || index + 1)
          const isExp = expanded === id

          return (
            <div key={id}>
              <button onClick={() => setExpanded(isExp ? null : id)}
                className="w-full grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left group">
                <div className="col-span-12 md:col-span-5">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: BRAND.primary }}>{id}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: BRAND.primary }}>{String(item.titulo || item.title || '')}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.prioridade_estrategica ? <PriorityBadge level={String(item.prioridade_estrategica)} /> : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-span-5 hidden md:flex items-center">
                  <p className="text-xs text-gray-500 line-clamp-2">{String(item.resumo_valor || '')}</p>
                </div>
                <div className="col-span-2 hidden md:flex items-center justify-end gap-2">
                  {item.estimativa_semanas ? <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{String(item.estimativa_semanas)} sem</span> : null}
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {isExp ? (
                <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {item.resumo_valor ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs">
                        <p className="font-bold text-emerald-700 mb-1">Valor</p>
                        <p className="text-emerald-600">{String(item.resumo_valor)}</p>
                      </div>
                    ) : null}
                    {item.business_case ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs">
                        <p className="font-bold text-blue-700 mb-1">Business Case</p>
                        <p className="text-blue-600">{String(item.business_case)}</p>
                      </div>
                    ) : null}
                  </div>
                  {Array.isArray(item.squad_sugerida) ? (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Squad</p>
                      <div className="flex flex-wrap gap-1">{(item.squad_sugerida as string[]).map((s, j) => <span key={j} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{s}</span>)}</div>
                    </div>
                  ) : null}
                  {/* Epic Prototype */}
                  {onGeneratePrototype && onDownloadPrototype && epicPrototypes ? (
                    <EpicPrototypeInline
                      epicId={id}
                      projectId={projectId}
                      projectName={projectName}
                      userEmail={userEmail}
                      state={epicPrototypes[id]}
                      onGenerate={onGeneratePrototype}
                      onDownload={onDownloadPrototype}
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

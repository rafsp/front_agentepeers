// src/components/project/risk-matrix.tsx
'use client'

import React, { useState } from 'react'
import { BRAND } from '@/components/layout/sidebar'
import { Shield, AlertTriangle, ShieldCheck, X, AlertOctagon } from 'lucide-react'

type Rec = Record<string, unknown>

interface RiskMatrixProps {
  premissas: Rec[]
  riscos: Rec[]
}

export function RiskMatrix({ premissas, riscos }: RiskMatrixProps) {
  const [tab, setTab] = useState<'premissas' | 'matriz'>('premissas')
  const [selectedRisk, setSelectedRisk] = useState<Rec | null>(null)

  // Classify risks into matrix cells
  const cells: Record<string, Rec[]> = {}
  for (let r = 1; r <= 3; r++) { for (let c = 1; c <= 3; c++) { cells[`${r}-${c}`] = [] } }

  riscos.forEach(r => {
    const probStr = String(r.probabilidade || '').toLowerCase()
    const impStr = String(r.impacto || '').toLowerCase()
    const prob = probStr.includes('alta') ? 3 : probStr.includes('média') || probStr.includes('media') ? 2 : 1
    const imp = impStr.includes('crítico') || impStr.includes('critico') ? 3 : impStr.includes('alto') ? 2 : 1
    cells[`${prob}-${imp}`].push(r)
  })

  const totalCritical = riscos.filter(r => String(r.impacto || '').toLowerCase().includes('crít')).length
  const totalHighProb = riscos.filter(r => String(r.probabilidade || '').toLowerCase().includes('alta')).length

  const cellColor = (prob: number, imp: number) => {
    const score = prob * imp
    if (score >= 9) return 'bg-red-50 border-red-200'
    if (score >= 6) return 'bg-orange-50 border-orange-200'
    if (score >= 4) return 'bg-amber-50 border-amber-200'
    if (score >= 2) return 'bg-blue-50 border-blue-200'
    return 'bg-gray-50 border-gray-200'
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab('premissas')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'premissas' ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`} style={tab === 'premissas' ? { background: BRAND.primary } : {}}>
          Premissas ({premissas.length})
        </button>
        <button onClick={() => setTab('matriz')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'matriz' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          Matriz de Riscos ({riscos.length})
        </button>
      </div>

      {/* Premissas Tab */}
      {tab === 'premissas' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-2">
          {premissas.map((p, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded uppercase">{String(p.id || `P${i+1}`)}</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs font-medium leading-relaxed flex-grow" style={{ color: BRAND.primary }}>{String(p.descricao || '')}</p>
              {p.impacto_se_falhar ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 mt-3">
                  <p className="text-[9px] font-bold text-red-500 uppercase mb-0.5">Impacto se falhar</p>
                  <p className="text-[11px] text-red-600 leading-relaxed">{String(p.impacto_se_falhar)}</p>
                </div>
              ) : null}
            </div>
          ))}
          {!premissas.length ? <p className="text-gray-400 text-sm col-span-full text-center py-8">Nenhuma premissa.</p> : null}
        </div>
      ) : (
        /* Risk Matrix Tab */
        <div>
          {/* Stats */}
          <div className="flex gap-3 mb-5">
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-center">
              <p className="text-[9px] text-red-400 font-bold uppercase">Impacto Crítico</p>
              <p className="text-xl font-bold text-red-600">{totalCritical}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-center">
              <p className="text-[9px] text-amber-500 font-bold uppercase">Prob. Alta</p>
              <p className="text-xl font-bold text-amber-600">{totalHighProb}</p>
            </div>
          </div>

          {/* Matrix Grid 3x3 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
            <div className="grid gap-1" style={{ gridTemplateColumns: 'auto 1fr 1fr 1fr', gridTemplateRows: 'auto 1fr 1fr 1fr' }}>
              {/* Header row */}
              <div />
              <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest py-2">Imp. Baixo</div>
              <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest py-2">Imp. Alto</div>
              <div className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest py-2">Imp. Crítico</div>

              {/* Row 3: Prob Alta */}
              <div className="flex items-center pr-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>P. Alta</div>
              <MatrixCell risks={cells['3-1']} color={cellColor(3, 1)} onClick={setSelectedRisk} />
              <MatrixCell risks={cells['3-2']} color={cellColor(3, 2)} onClick={setSelectedRisk} />
              <MatrixCell risks={cells['3-3']} color={cellColor(3, 3)} onClick={setSelectedRisk} />

              {/* Row 2: Prob Média */}
              <div className="flex items-center pr-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>P. Média</div>
              <MatrixCell risks={cells['2-1']} color={cellColor(2, 1)} onClick={setSelectedRisk} />
              <MatrixCell risks={cells['2-2']} color={cellColor(2, 2)} onClick={setSelectedRisk} />
              <MatrixCell risks={cells['2-3']} color={cellColor(2, 3)} onClick={setSelectedRisk} />

              {/* Row 1: Prob Baixa */}
              <div className="flex items-center pr-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>P. Baixa</div>
              <MatrixCell risks={cells['1-1']} color={cellColor(1, 1)} onClick={setSelectedRisk} />
              <MatrixCell risks={cells['1-2']} color={cellColor(1, 2)} onClick={setSelectedRisk} />
              <MatrixCell risks={cells['1-3']} color={cellColor(1, 3)} onClick={setSelectedRisk} />
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-50 border border-red-200 rounded" /> Extremo</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-50 border border-orange-200 rounded" /> Alto</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-50 border border-amber-200 rounded" /> Moderado</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-50 border border-gray-200 rounded" /> Baixo</div>
            </div>
          </div>

          {/* Risk list below matrix */}
          <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-2">
            {riscos.map((r, i) => {
              const isHi = String(r.probabilidade || '').toLowerCase().includes('alt') || String(r.impacto || '').toLowerCase().includes('crít')
              return (
                <div key={i} onClick={() => setSelectedRisk(r)} className={`border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all ${isHi ? 'border-red-200 bg-red-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-500">{String(r.id || `R${i+1}`)}</span>
                    <div className="flex gap-1.5">
                      {r.probabilidade ? <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-600">Prob: {String(r.probabilidade)}</span> : null}
                      {r.impacto ? <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${isHi ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>Imp: {String(r.impacto)}</span> : null}
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: BRAND.primary }}>{String(r.descricao || '')}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Risk Detail Modal */}
      {selectedRisk ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRisk(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{String(selectedRisk.id || 'R')}</span>
                <h3 className="text-base font-bold" style={{ color: BRAND.primary }}>Detalhes do Risco</h3>
              </div>
              <button onClick={() => setSelectedRisk(null)} className="p-2 hover:bg-gray-200 rounded-xl"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed mb-5">{String(selectedRisk.descricao || '')}</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Probabilidade</p>
                  <p className="text-sm font-bold" style={{ color: BRAND.primary }}>{String(selectedRisk.probabilidade || 'N/A')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-widest mb-1">Impacto</p>
                  <p className="text-sm font-bold" style={{ color: BRAND.primary }}>{String(selectedRisk.impacto || 'N/A')}</p>
                </div>
              </div>
              {selectedRisk.plano_mitigacao ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Plano de Mitigação</p>
                  </div>
                  <p className="text-sm text-emerald-700 leading-relaxed">{String(selectedRisk.plano_mitigacao)}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function MatrixCell({ risks, color, onClick }: { risks: Rec[]; color: string; onClick: (r: Rec) => void }) {
  return (
    <div className={`${color} border rounded-xl p-2 min-h-[80px] flex flex-wrap gap-1 content-start`}>
      {risks.map((r, i) => (
        <button key={i} onClick={() => onClick(r)}
          className="inline-flex items-center px-2 py-1 bg-white/80 hover:bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600 hover:shadow-sm transition-all">
          <AlertTriangle className="w-3 h-3 mr-1 opacity-60" />
          {String(r.id || `R${i+1}`)}
        </button>
      ))}
    </div>
  )
}
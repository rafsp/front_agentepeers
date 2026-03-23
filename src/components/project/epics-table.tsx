// src/app/project/[id]/page.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type ProjectSummary, type HistoryItem } from '@/lib/api/unified-service'
import { getApiUrl } from '@/lib/config'
import { extractTextFromFiles, buildCommentExtra, type ExtractedFile } from '@/lib/utils/file-extractor'
import {
  ArrowLeft, Layers, Activity, Calendar, AlertTriangle, LayoutTemplate, GitMerge, Loader2,
  Settings, Wand2, Play, History, Download, FileX, Sparkles, Upload, X, CheckCircle,
  Monitor, ChevronDown, ChevronUp, Shield, RefreshCw, Camera, Eye as EyeIcon, Share2, Copy, Check,
  File as FileIcon, Trash2, Plus, FileSpreadsheet,
} from 'lucide-react'
// ── NEW: Component imports ────────────────────────────────────────────────
import { showToast } from '@/components/project/toast'
import { EpicsKPIs, FeaturesKPIs, TimelineKPIs, RisksKPIs } from '@/components/project/kpi-cards'
import { PriorityBadge, ComplexityBadge, TypeBadge } from '@/components/project/badges'
import { RiskMatrix } from '@/components/project/risk-matrix'
import { EpicPrototypeModal, EpicPrototypeInline, pollEpicPrototype as pollEpicProto } from '@/components/project/epic-prototype'
import { FeatureTypeFilter, filterByType } from '@/components/project/feature-type-filter'
import { ErrorBoundary } from '@/components/project/error-boundary'
import { exportTimelineCSV } from '@/components/project/timeline-extras'

type Cat = 'epics' | 'features' | 'timeline' | 'risks' | 'prototype' | 'tree'
interface Tab { key: Cat; label: string; icon: React.ElementType }
const ORG_TABS: Tab[] = [{ key: 'epics', label: 'Épicos', icon: Layers }, { key: 'features', label: 'Features', icon: Activity }, { key: 'timeline', label: 'Timeline', icon: Calendar }, { key: 'risks', label: 'Riscos', icon: AlertTriangle }, { key: 'tree', label: 'Árvore', icon: GitMerge }]
const PROTO_TABS: Tab[] = [{ key: 'prototype', label: 'Protótipos', icon: LayoutTemplate }, { key: 'tree', label: 'Árvore', icon: GitMerge }]

type Rec = Record<string, unknown>
function extractItems(data: unknown): Rec[] {
  if (Array.isArray(data)) return data as Rec[]
  if (typeof data === 'object' && data !== null) { for (const k of Object.keys(data as Rec)) { if (Array.isArray((data as Rec)[k])) return (data as Rec)[k] as Rec[] } }
  return []
}

// ── Markdown simples ──────────────────────────────────────────────────────
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n'); const elements: React.ReactNode[] = []
  let inTable = false; let tableRows: string[][] = []
  const strip = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '$1')
  const flushTable = () => { if (!tableRows.length) return; elements.push(<div key={`t${elements.length}`} className="overflow-x-auto my-4"><table className="w-full text-xs border-collapse"><thead><tr className="border-b-2 border-gray-200">{tableRows[0].map((h, i) => <th key={i} className="text-left p-2 font-bold text-gray-600 bg-gray-50">{strip(h)}</th>)}</tr></thead><tbody>{tableRows.slice(2).map((row, ri) => <tr key={ri} className="border-b border-gray-100 hover:bg-gray-50">{row.map((c, ci) => <td key={ci} className="p-2 text-gray-600">{strip(c)}</td>)}</tr>)}</tbody></table></div>); tableRows = []; inTable = false }
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (l.includes('|') && l.trim().startsWith('|')) { if (!inTable) { flushTable(); inTable = true }; tableRows.push(l.split('|').map(c => c.trim()).filter(Boolean)); continue }
    if (inTable) flushTable()
    if (l.startsWith('# ')) elements.push(<h1 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: BRAND.primary }}>{l.replace(/^#+\s*/, '').replace(/[📊📋🎯📅👥🎨⚠️📈🚀✅💰📞📚]/g, '').trim()}</h1>)
    else if (l.startsWith('## ')) elements.push(<h2 key={i} className="text-lg font-bold mt-5 mb-2 pb-1 border-b border-gray-100" style={{ color: BRAND.primary }}>{l.replace(/^#+\s*/, '').replace(/[📊📋🎯📅👥🎨⚠️📈🚀✅💰📞📚]/g, '').trim()}</h2>)
    else if (l.startsWith('### ')) elements.push(<h3 key={i} className="text-sm font-bold mt-4 mb-1.5 text-gray-700">{l.replace(/^#+\s*/, '').trim()}</h3>)
    else if (l.startsWith('- ') || l.startsWith('* ')) elements.push(<div key={i} className="flex items-start gap-2 ml-4 my-0.5"><span className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0" /><span className="text-xs text-gray-600">{strip(l.replace(/^[-*]\s*/, ''))}</span></div>)
    else if (l.startsWith('---')) elements.push(<hr key={i} className="my-4 border-gray-100" />)
    else if (l.trim() === '') elements.push(<div key={i} className="h-2" />)
    else if (!l.startsWith('```')) elements.push(<p key={i} className="text-xs text-gray-600 leading-relaxed my-0.5">{strip(l)}</p>)
  }
  if (inTable) flushTable()
  return <div className="max-h-[65vh] overflow-y-auto pr-2">{elements}</div>
}

function AgentProgress({ step, pct }: { step: string; pct: number }) {
  return <div className="flex flex-col items-center justify-center h-96">
    <div className="relative w-24 h-24 mb-6"><svg className="w-full h-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" /><circle cx="50" cy="50" r="42" fill="none" stroke={BRAND.primary} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*42}`} strokeDashoffset={`${2*Math.PI*42*(1-pct/100)}`} className="transition-all duration-1000" /></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold" style={{ color: BRAND.primary }}>{pct}%</span></div></div>
    <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>{step}</p>
    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Agentes trabalhando</p>
  </div>
}

function MultiFileUpload({ files, setFiles }: { files: File[]; setFiles: (f: File[]) => void }) {
  const addFiles = (fl: FileList | null) => { if (!fl) return; const arr = Array.from(fl).filter(f => f.name.match(/\.(docx|pdf|txt)$/i)); const existing = new Set(files.map(f => f.name + f.size)); const unique = arr.filter(f => !existing.has(f.name + f.size)); setFiles([...files, ...unique]) }
  const remove = (idx: number) => setFiles(files.filter((_, i) => i !== idx))
  return <div>
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Documentos (opcional)</label>
    {files.length > 0 ? <div className="space-y-1.5 mb-2.5">{files.map((f, i) => <div key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700"><FileIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /><span className="font-medium truncate flex-1">{f.name}</span><span className="text-emerald-400 text-[10px]">{(f.size / 1024).toFixed(0)} KB</span><button onClick={() => remove(i)} className="text-emerald-400 hover:text-red-500 p-0.5"><Trash2 className="w-3 h-3" /></button></div>)}</div> : null}
    <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-fit">{files.length > 0 ? <Plus className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}{files.length > 0 ? 'Adicionar mais' : 'Anexar documentos (.docx, .pdf, .txt)'}<input type="file" accept=".docx,.pdf,.txt" multiple onChange={e => { addFiles(e.target.files); e.target.value = '' }} className="hidden" /></label>
  </div>
}

// ── Views ──────────────────────────────────────────────────────────────────

function EpicsView({ data, epicPrototypes, onGenerateProto, onDownloadProto }: {
  data: unknown
  epicPrototypes: Record<string, { jobId: string; status: 'loading' | 'done' | 'error'; content?: string }>
  onGenerateProto: (epicId: string) => void
  onDownloadProto: (epicId: string) => void
}) {
  const items = extractItems(data); const [exp, setExp] = useState<string | null>(null)
  if (!items.length) return <p className="text-gray-400 text-sm">Nenhum épico.</p>
  return <div>
    <EpicsKPIs data={data} />
    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">{items.map((e, i) => {
    const id = String(e.id || i + 1); const isExp = exp === id
    return <div key={id} className="border border-gray-200 rounded-xl overflow-hidden animate-fade-in">
      <button onClick={() => setExp(isExp ? null : id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: BRAND.primary }}>{id}</span>
          <div className="min-w-0"><p className="font-bold text-sm truncate" style={{ color: BRAND.primary }}>{String(e.titulo || e.title || `Épico ${i + 1}`)}</p>
            {e.prioridade_estrategica ? <PriorityBadge level={String(e.prioridade_estrategica)} /> : null}</div>
        </div>
        <div className="flex items-center gap-2">{e.estimativa_semanas ? <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{String(e.estimativa_semanas)} sem</span> : null}{isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}</div>
      </button>
      {isExp ? <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {e.resumo_valor ? <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs"><p className="font-bold text-emerald-700 mb-1">Valor</p><p className="text-emerald-600">{String(e.resumo_valor)}</p></div> : null}
          {e.business_case ? <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs"><p className="font-bold text-blue-700 mb-1">Business Case</p><p className="text-blue-600">{String(e.business_case)}</p></div> : null}
        </div>
        {Array.isArray(e.squad_sugerida) ? <div className="mt-3"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Squad</p><div className="flex flex-wrap gap-1">{(e.squad_sugerida as string[]).map((s, j) => <span key={j} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{s}</span>)}</div></div> : null}
        {Array.isArray(e.entregaveis_macro) ? <div className="mt-3"><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Entregáveis</p><div className="flex flex-wrap gap-1">{(e.entregaveis_macro as string[]).map((s, j) => <span key={j} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>)}</div></div> : null}
        {/* NEW: Epic Prototype Inline */}
        <EpicPrototypeInline epicId={id} state={epicPrototypes[id]} onGenerate={onGenerateProto} onDownload={onDownloadProto} />
      </div> : null}
    </div>
  })}</div></div>
}

function FeaturesView({ data }: { data: unknown }) {
  const items = extractItems(data)
  const [epicFilter, setEpicFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedCrit, setExpandedCrit] = useState<string | null>(null)
  if (!items.length) return <p className="text-gray-400 text-sm">Nenhuma feature.</p>
  const epicMap: Record<string, boolean> = {}; items.forEach(f => { if (f.epic_id) epicMap[String(f.epic_id)] = true })
  const epics = Object.keys(epicMap).sort()
  let filtered = epicFilter === 'all' ? items : items.filter(f => String(f.epic_id) === epicFilter)
  filtered = filterByType(filtered, typeFilter)
  return <div>
    <FeaturesKPIs data={data} />
    {/* Epic filter tabs */}
    <div className="flex gap-1.5 overflow-x-auto mb-3">{[{ key: 'all', label: 'Todas' }, ...epics.map(e => ({ key: e, label: e }))].map(t =>
      <button key={t.key} onClick={() => setEpicFilter(t.key)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${epicFilter === t.key ? 'bg-[#011334] text-white border-[#011334]' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}>{t.label}</button>)}</div>
    {/* NEW: Type filter */}
    <div className="mb-4"><FeatureTypeFilter current={typeFilter} onChange={setTypeFilter} /></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-2">{filtered.map((f, i) => {
      const fid = String(f.id || i); const crits = Array.isArray(f.criterios_aceite) ? f.criterios_aceite as string[] : []
      const isExpanded = expandedCrit === fid; const showAll = isExpanded || crits.length <= 2
      return <div key={fid} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 animate-fade-in">
        <div className="flex items-start justify-between mb-2">
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{String(f.id || i + 1)}</span>
          <div className="flex gap-1">{f.tipo ? <TypeBadge type={String(f.tipo)} /> : null}{f.complexidade ? <ComplexityBadge level={String(f.complexidade)} /> : null}</div>
        </div>
        <h4 className="font-bold text-sm mb-1" style={{ color: BRAND.primary }}>{String(f.titulo || f.name || `Feature ${i + 1}`)}</h4>
        {f.descricao ? <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{String(f.descricao)}</p> : null}
        {crits.length > 0 ? <div className="pt-2 border-t border-gray-100">
          <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Critérios de Aceite</p>
          {(showAll ? crits : crits.slice(0, 2)).map((c, j) => <p key={j} className="text-[10px] text-gray-500 flex items-start gap-1 mb-0.5"><span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />{c}</p>)}
          {crits.length > 2 ? <button onClick={() => setExpandedCrit(isExpanded ? null : fid)} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 mt-1">{isExpanded ? '▲ Recolher' : `+${crits.length - 2} critério${crits.length - 2 > 1 ? 's' : ''}`}</button> : null}
        </div> : null}
      </div>
    })}</div>
  </div>
}

function TimelineView({ data, onCellClick }: { data: unknown; onCellClick: (d: Rec) => void }) {
  const raw = extractItems(data)
  if (!raw.length) return <p className="text-gray-400 text-sm">Nenhum dado de timeline.</p>
  let maxW = 0
  const epics = raw.map(obj => {
    const n = Object.keys(obj)[0]; const val = obj[n]
    const st: Rec[] = Array.isArray(val) ? val as Rec[] : []
    st.forEach(s => { const w = Number(s.semana) || 0; if (w > maxW) maxW = w })
    return { name: n, steps: st }
  }).filter(e => e.steps.length > 0)
  if (!epics.length) return <p className="text-gray-400 text-sm">Formato de timeline não reconhecido.</p>
  const weeks = Array.from({ length: maxW }, (_, i) => i + 1)
  return <div>
    <TimelineKPIs data={data} />
    <div id="timeline-container" className="overflow-x-auto bg-white"><table className="w-full text-left text-xs">
    <thead><tr className="border-b border-gray-200"><th className="sticky left-0 bg-white z-10 px-3 py-2 font-bold text-gray-500 uppercase tracking-widest text-[10px] min-w-[260px]">Épico</th>{weeks.map(w => <th key={w} className="px-1 py-2 text-center font-bold text-gray-400 text-[9px] min-w-[40px]">S{w}</th>)}</tr></thead>
    <tbody>{epics.map((ep, i) => <tr key={i} className="border-b border-gray-100">
      <td className="sticky left-0 bg-white z-10 px-3 py-2 font-bold text-xs min-w-[260px] max-w-[320px]" style={{ color: BRAND.primary }}><span className="block whitespace-normal leading-tight">{ep.name}</span></td>
      {weeks.map(w => {
        const s = ep.steps.find(st => Number(st.semana) === w)
        if (!s) return <td key={w} className="px-0.5 py-1" />
        const prog = parseInt(String(s.progresso_estimado || '0').replace('%', '')); const l = 30 + (prog * 0.4)
        return <td key={w} className="px-0.5 py-1"><div onClick={() => onCellClick(s)} className="h-7 rounded cursor-pointer hover:scale-y-125 hover:brightness-110 transition-all hover:ring-2 hover:ring-blue-400" style={{ backgroundColor: `hsl(219,96%,${l}%)` }} /></td>
      })}
    </tr>)}</tbody>
  </table></div></div>
}

// NEW: RisksView using RiskMatrix component
function RisksViewWrapper({ data }: { data: unknown }) {
  let prem: Rec[] = [], risk: Rec[] = []
  const obj = data as Rec; const keys = Object.keys(obj)
  const rootKey = keys.find(k => Array.isArray(obj[k]))
  let rawData: unknown = rootKey ? obj[rootKey] : (Array.isArray(data) ? data : data)
  if (Array.isArray(rawData) && rawData.length > 0 && ('premissas' in (rawData[0] as Rec) || 'riscos' in (rawData[0] as Rec))) rawData = rawData[0]
  const container = rawData as Rec
  if (Array.isArray(container.premissas)) prem = container.premissas as Rec[]
  if (Array.isArray(container.riscos)) risk = container.riscos as Rec[]
  if (!prem.length && !risk.length) { if (Array.isArray(obj.premissas)) prem = obj.premissas as Rec[]; if (Array.isArray(obj.riscos)) risk = obj.riscos as Rec[] }
  return <div className="animate-fade-in">
    <RisksKPIs premissas={prem.length} riscos={risk.length} />
    <RiskMatrix premissas={prem} riscos={risk} />
  </div>
}

function TreeView({ projectId, project }: { projectId: string; project: ProjectSummary }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true); setError(null)
      const lineage = await unifiedService.getLineage(projectId)
      if (cancelled) return
      if (!lineage?.nodes?.length) { setError('Projeto sem histórico de versões.'); setLoading(false); return }
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(window as any).vis) {
          await new Promise<void>((res, rej) => { const s = document.createElement('script'); s.src = 'https://unpkg.com/vis-network/standalone/umd/vis-network.min.js'; s.onload = () => res(); s.onerror = () => rej(new Error('CDN falhou')); const t = setTimeout(() => rej(new Error('Timeout')), 8000); s.addEventListener('load', () => clearTimeout(t)); document.head.appendChild(s) })
        }
      } catch { if (!cancelled) { setError('Falha ao carregar vis-network.'); setLoading(false); return } }
      if (cancelled) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vis = (window as any).vis
      if (!vis || !containerRef.current) { setError('vis-network indisponível.'); setLoading(false); return }
      const nodes = lineage.nodes.map((n: Rec) => ({ id: n.job_id, label: `${n.category || 'unknown'}\nv${n.version || '?'}`, shape: 'box', color: { background: n.status === 'done' ? '#d1fae5' : '#fef3c7', border: n.status === 'done' ? '#059669' : '#d97706' }, font: { size: 11, face: 'Inter' } }))
      const edges = (lineage.edges || []).map((e: Rec) => ({ from: e.from, to: e.to, arrows: 'to', color: { color: '#9ca3af' } }))
      const network = new vis.Network(containerRef.current, { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) }, { layout: { hierarchical: { direction: 'LR', sortMethod: 'directed', levelSeparation: 200 } }, physics: false, interaction: { zoomView: true, dragView: true } })
      setTimeout(() => { network.fit() }, 300)
      setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [projectId])
  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>
  if (error) return <div className="text-center py-12"><AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-3" /><p className="text-sm text-gray-500">{error}</p></div>
  return <div ref={containerRef} className="w-full h-[500px] border border-gray-200 rounded-2xl bg-white" />
}

// ── Main Component ────────────────────────────────────────────────────────
export default function ProjectDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { user, loading: authLoading, logout } = useAuth()

  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [projectType, setProjectType] = useState<'prototype' | 'organization'>('organization')
  const [activeCat, setActiveCat] = useState<Cat>('epics')
  const [reportLoading, setReportLoading] = useState(false)
  const [progressStep, setProgressStep] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [reportJSON, setReportJSON] = useState<unknown>(null)
  const [reportRaw, setReportRaw] = useState<string | null>(null)
  const [reportErr, setReportErr] = useState<string | null>(null)
  const [pendingCats, setPendingCats] = useState<Set<string>>(new Set())
  const [bgStatus, setBgStatus] = useState<Record<string, string>>({})
  const [previewingJid, setPreviewingJid] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showRefine, setShowRefine] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [modalText, setModalText] = useState('')
  const [modalFiles, setModalFiles] = useState<File[]>([])
  const [refineStrategy, setRefineStrategy] = useState<'checkout' | 'rebase'>('checkout')
  const [submitting, setSubmitting] = useState(false)
  const [timelineDetail, setTimelineDetail] = useState<Rec | null>(null)
  const [historyData, setHistoryData] = useState<HistoryItem[] | null>(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  // NEW: Epic prototype states
  const [epicPrototypes, setEpicPrototypes] = useState<Record<string, { jobId: string; status: 'loading' | 'done' | 'error'; content?: string }>>({})
  const [showEpicProtoModal, setShowEpicProtoModal] = useState(false)
  const [targetEpicId, setTargetEpicId] = useState<string | null>(null)

  const hasLoaded = useRef(false)
  const activeCatRef = useRef(activeCat); activeCatRef.current = activeCat

  const savePendingJob = (cat: string, jid: string) => { try { localStorage.setItem(`codeai_pending_${projectId}_${cat}`, jid) } catch {}; setPendingCats(prev => new Set(prev).add(cat)) }
  const clearPendingJob = (cat: string) => { try { localStorage.removeItem(`codeai_pending_${projectId}_${cat}`) } catch {}; setPendingCats(prev => { const n = new Set(prev); n.delete(cat); return n }); setBgStatus(prev => { const n = { ...prev }; delete n[cat]; return n }) }
  const getPendingJob = (cat: string): string | null => { try { return localStorage.getItem(`codeai_pending_${projectId}_${cat}`) } catch { return null } }

  const handleShareLink = () => {
    const url = window.location.href
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(url).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000) }) } else { prompt('Copie o link:', url) }
  }

  useEffect(() => {
    if (authLoading) return; if (!user?.email) { router.push('/login'); return }; if (hasLoaded.current) return; hasLoaded.current = true
    const stored = sessionStorage.getItem('selected_project')
    if (stored) { try { const p = JSON.parse(stored) as ProjectSummary; if (p.id === projectId) { initProject(p); return } } catch {} }
    loadFromAPI()
  }, [projectId, user?.email, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const initProject = (p: ProjectSummary) => { setProject(p); const t = unifiedService.detectProjectType(p); setProjectType(t); setActiveCat(t === 'prototype' ? 'prototype' : 'epics') }
  const loadFromAPI = async () => { try { const all = await unifiedService.getProjects(); const f = all.find((p: ProjectSummary) => p.id === projectId); if (f) initProject(f); else router.push('/dashboard') } catch { router.push('/dashboard') } }

  useEffect(() => { if (!project) return; const cats = unifiedService.getCategories(unifiedService.detectProjectType(project)); const found = new Set<string>(); cats.forEach(cat => { const jid = getPendingJob(cat); if (jid) { found.add(cat); pollBackground(jid, cat) } }); if (found.size > 0) setPendingCats(found) }, [project?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const pollBackground = async (jid: string, cat: string) => {
    setBgStatus(prev => ({ ...prev, [cat]: 'Processando...' }))
    try {
      const r = await unifiedService.pollReport(projectId, jid, cat, (step: string) => { setBgStatus(prev => ({ ...prev, [cat]: step })) })
      if (project) { const up = { ...project, latest_reports: { ...project.latest_reports, [cat]: jid } }; setProject(up); sessionStorage.setItem('selected_project', JSON.stringify(up)) }
      clearPendingJob(cat); if (activeCatRef.current === cat) { if (r.isRaw) setReportRaw(r.data as string); else setReportJSON(r.data); setReportLoading(false) }
    } catch { clearPendingJob(cat) }
  }

  useEffect(() => { if (!project || activeCat === 'tree') return; setPreviewingJid(null); const jid = project.latest_reports?.[activeCat]; if (jid) fetchReport(jid, activeCat); else { setReportJSON(null); setReportRaw(null); setReportErr(null) } }, [activeCat, project?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReport = useCallback(async (jid: string, cat: string) => {
    setReportLoading(true); setReportJSON(null); setReportRaw(null); setReportErr(null); setProgressStep('Conectando...'); setProgressPct(0)
    try { const r = await unifiedService.pollReport(projectId, jid, cat, (step: string, pct: number) => { if (activeCatRef.current === cat) { setProgressStep(step); setProgressPct(pct) } }); if (activeCatRef.current !== cat) return; if (r.isRaw) setReportRaw(r.data as string); else setReportJSON(r.data); clearPendingJob(cat) }
    catch (e) { if (activeCatRef.current === cat) setReportErr(e instanceof Error ? e.message : 'Erro') }
    finally { if (activeCatRef.current === cat) setReportLoading(false) }
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateProject = (cat: string, jid: string) => { if (!project) return; const up = { ...project, latest_reports: { ...project.latest_reports, [cat]: jid } }; setProject(up); sessionStorage.setItem('selected_project', JSON.stringify(up)) }

  const handleCreate = async () => {
    if (!project || !user) return; setSubmitting(true)
    try {
      let finalComment = modalText || ''; const firstDocx = modalFiles.find(f => f.name.endsWith('.docx'))
      if (modalFiles.length > 0) { try { const { combinedText } = await extractTextFromFiles(modalFiles); if (combinedText.trim()) finalComment = buildCommentExtra(combinedText, modalText); else { const fn = modalFiles.map(f => f.name).join(', '); finalComment = buildCommentExtra(`[DOCS: ${fn}]`, modalText) } } catch {} }
      const res = await unifiedService.startAnalysis({ email: user.email, nome_projeto: project.name, category: activeCat, action: 'generator', strategy: 'checkout', comentario_extra: finalComment || undefined, arquivo_docx: firstDocx || undefined })
      updateProject(activeCat, res.job_id); savePendingJob(activeCat, res.job_id); setShowCreate(false); setModalText(''); setModalFiles([]); fetchReport(res.job_id, activeCat); showToast('Geração iniciada!', 'success')
    } catch (e) { showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error') } finally { setSubmitting(false) }
  }

  const handleRefine = async () => {
    if (!project || !user || !modalText.trim()) return; setSubmitting(true)
    try {
      let finalComment = modalText; const firstDocx = modalFiles.find(f => f.name.endsWith('.docx'))
      if (modalFiles.length > 0) { try { const { combinedText } = await extractTextFromFiles(modalFiles); if (combinedText.trim()) finalComment = buildCommentExtra(combinedText, modalText) } catch {} }
      const res = await unifiedService.startAnalysis({ email: user.email, nome_projeto: project.name, category: activeCat, action: 'reviwer', strategy: refineStrategy, comentario_extra: finalComment, arquivo_docx: firstDocx || undefined, base_job_id: project.latest_reports?.[activeCat] })
      updateProject(activeCat, res.job_id); savePendingJob(activeCat, res.job_id); setShowRefine(false); setModalText(''); setModalFiles([]); fetchReport(res.job_id, activeCat); showToast('Refinamento iniciado!', 'success')
    } catch (e) { showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error') } finally { setSubmitting(false) }
  }

  const openHistory = async () => { setShowHistory(true); setHistoryLoading(true); try { setHistoryData(await unifiedService.getReportHistory(projectId, activeCat)) } catch { setHistoryData([]) } finally { setHistoryLoading(false) } }
  const previewVersion = (jid: string) => { setPreviewingJid(jid); setShowHistory(false); fetchReport(jid, activeCat) }
  const restoreVer = async (jid: string) => {
    if (!confirm('Restaurar esta versão?')) return
    try { const d = await unifiedService.restoreVersion(projectId, jid); if (d.new_state && project) { const up = { ...project, latest_reports: { ...project.latest_reports, ...d.new_state } }; setProject(up); sessionStorage.setItem('selected_project', JSON.stringify(up)) } else updateProject(activeCat, jid); setPreviewingJid(null); setShowHistory(false); fetchReport(jid, activeCat); showToast('Versão restaurada!', 'success') } catch (e) { showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error') }
  }

  const exportCSV = () => { const items = extractItems(reportJSON); if (!items.length) return; const h = Object.keys(items[0]); let csv = h.join(';') + '\n'; items.forEach(r => { csv += h.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(';') + '\n' }); const b = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${activeCat}_${project?.name}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('CSV exportado!', 'success') }
  const exportTimelineImage = async () => { const c = document.getElementById('timeline-container'); if (!c) return; try { const { default: html2canvas } = await import('html2canvas'); const ov = c.style.overflow; const mw = c.style.maxWidth; c.style.overflow = 'visible'; c.style.maxWidth = 'none'; const canvas = await html2canvas(c, { backgroundColor: '#ffffff', scale: 2, scrollX: 0, scrollY: 0, windowWidth: c.scrollWidth + 40 }); c.style.overflow = ov; c.style.maxWidth = mw; const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `timeline_${project?.name?.replace(/[^a-z0-9]/gi, '_') || 'p'}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Imagem exportada!', 'success') } catch { showToast('Instale html2canvas: npm i html2canvas', 'error') } }
  const downloadProto = () => { if (!reportRaw) return; const b = new Blob([reportRaw], { type: 'text/html;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${project?.name?.replace(/[^a-z0-9]/gi, '_') || 'proto'}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a) }

  const canEdit = project?.role !== 'viewer'
  const tabs = projectType === 'prototype' ? PROTO_TABS : ORG_TABS
  const hasData = activeCat === 'tree' ? true : !!project?.latest_reports?.[activeCat]
  const curJid = project?.latest_reports?.[activeCat]
  const isPending = pendingCats.has(activeCat)

  // ── Progress Guide ──────────────────────────────────────────────────────
  const ProgressGuide = () => {
    if (projectType !== 'organization' || !project) return null
    const cats: Cat[] = ['epics', 'features', 'timeline', 'risks']
    const done = cats.filter(c => !!project.latest_reports?.[c]).length
    const pct = Math.round((done / 4) * 100)
    if (pct === 0 || pct === 100) return null
    const next = cats.find(c => !project.latest_reports?.[c])
    return <div className="bg-white p-4 rounded-xl border border-gray-200 mb-5 flex items-center gap-4">
      <div className="flex-1"><div className="flex gap-1 mb-1">{cats.map(c => <div key={c} className={`h-1.5 flex-1 rounded-full ${project.latest_reports?.[c] ? 'bg-emerald-400' : pendingCats.has(c) ? 'bg-amber-400 animate-pulse' : 'bg-gray-200'}`} />)}</div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{pct}% • {done}/4 categorias</p></div>
      {next && canEdit ? <button onClick={() => { setActiveCat(next); if (!project.latest_reports?.[next]) { setModalText(''); setModalFiles([]); setShowCreate(true) } }} className="px-4 py-2 text-white rounded-xl text-xs font-bold whitespace-nowrap" style={{ background: BRAND.primary }}>Gerar {next === 'epics' ? 'Épicos' : next === 'features' ? 'Features' : next === 'timeline' ? 'Timeline' : 'Riscos'}</button> : null}
    </div>
  }

  // ── ActionBar ────────────────────────────────────────────────────────────
  const ActionBar = () => {
    if (activeCat === 'tree' || !hasData || reportLoading) return null
    return (
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
          <div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Job ID {previewingJid ? '(Preview)' : ''}</p><p className="font-mono text-xs mt-0.5" style={{ color: BRAND.primary }}>{previewingJid || curJid}</p></div>
          {previewingJid && previewingJid !== curJid ? <button onClick={() => { setPreviewingJid(null); if (curJid) fetchReport(curJid, activeCat) }} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100"><ArrowLeft className="w-3 h-3" /> Voltar à atual</button> : null}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !previewingJid ? <button onClick={() => { setModalText(''); setModalFiles([]); setShowRefine(true) }} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold" style={{ background: BRAND.primary }}><Wand2 className="w-3.5 h-3.5" /> Refinar</button> : null}
          <button onClick={openHistory} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><History className="w-3.5 h-3.5" /> Histórico</button>
          {activeCat === 'timeline' ? <>
            <button onClick={exportTimelineImage} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><Camera className="w-3.5 h-3.5" /> Imagem</button>
            <button onClick={() => exportTimelineCSV(reportJSON, project?.name)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><FileSpreadsheet className="w-3.5 h-3.5" /> CSV</button>
          </> : null}
          {activeCat !== 'prototype' && activeCat !== 'timeline' ? <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><Download className="w-3.5 h-3.5" /> CSV</button> : null}
          {activeCat === 'prototype' ? <>
            <button onClick={async () => { if (reportRaw) { try { await fetch('/api/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, html: reportRaw, projectName: project?.name, createdBy: user?.email }) }) } catch {} }; const url = `${window.location.origin}/preview/${projectId}`; navigator.clipboard?.writeText(url); window.open(url, '_blank') }} className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100"><Share2 className="w-3.5 h-3.5" /> Compartilhar</button>
            <button onClick={downloadProto} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><Download className="w-3.5 h-3.5" /> Download</button>
          </> : null}
        </div>
      </div>
    )
  }

  // ── renderContent ───────────────────────────────────────────────────────
  const renderContent = () => {
    if (reportLoading) return <AgentProgress step={progressStep} pct={progressPct} />
    if (!hasData && !isPending) return (
      <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-in">
        <FileX className="w-12 h-12 text-gray-300 mb-4" /><p className="text-sm text-gray-400 mb-2">Nenhum relatório nesta categoria</p>
        {canEdit ? <button onClick={() => { setModalText(''); setModalFiles([]); setShowCreate(true) }} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: BRAND.primary }}><Play className="w-4 h-4" /> Iniciar Geração</button>
          : <p className="text-xs text-red-400">Somente Editores/Owners podem gerar</p>}
      </div>
    )
    if (!hasData && isPending) return <AgentProgress step="Geração em andamento..." pct={10} />
    if (reportErr) return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mb-4" /><p className="text-sm text-gray-500 mb-4">{reportErr}</p>
        <button onClick={() => { const j = previewingJid || curJid; if (j) fetchReport(j, activeCat) }} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">Tentar Novamente</button>
      </div>
    )
    if (activeCat === 'tree') return <TreeView projectId={projectId} project={project!} />
    if (activeCat === 'prototype' && reportRaw) return <div className="w-full text-left"><ActionBar /><div className="w-full h-[65vh] rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white"><iframe srcDoc={reportRaw} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" /></div></div>
    if (reportJSON) return <div className="w-full text-left"><ActionBar />
      {activeCat === 'epics' ? <EpicsView data={reportJSON} epicPrototypes={epicPrototypes} onGenerateProto={(eid) => { setTargetEpicId(eid); setShowEpicProtoModal(true) }} onDownloadProto={(eid) => { const c = epicPrototypes[eid]?.content; if (!c) return; const b = new Blob([c], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${project?.name}_epic_${eid}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a) }} />
        : activeCat === 'features' ? <FeaturesView data={reportJSON} />
        : activeCat === 'timeline' ? <TimelineView data={reportJSON} onCellClick={setTimelineDetail} />
        : activeCat === 'risks' ? <RisksViewWrapper data={reportJSON} />
        : null}
    </div>
    if (reportRaw) return <div className="w-full text-left"><ActionBar /><SimpleMarkdown text={reportRaw} /></div>
    return null
  }

  if (authLoading || !project) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>

  return (
    <ErrorBoundary>
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="dashboard" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 p-6 lg:p-8">
        {/* Top nav */}
        <nav className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between mb-6 border border-gray-200 shadow-sm">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-[#011334] font-bold text-xs uppercase tracking-widest bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl"><ArrowLeft className="w-4 h-4" /> Voltar</button>
          <h2 className="text-lg font-bold truncate max-w-md" style={{ color: BRAND.primary }}>{project.name}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleShareLink} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${linkCopied ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}>{linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}</button>
            <button onClick={() => router.push(`/project/${projectId}/settings`)} className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100"><Settings className="w-4 h-4" /></button>
          </div>
        </nav>
        {/* BG processing banner */}
        {pendingCats.size > 0 ? <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-center gap-3"><div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0" /><p className="text-xs text-amber-700"><span className="font-bold">Processamento em segundo plano:</span> {Array.from(pendingCats).map(c => `${c} (${bgStatus[c] || '...'})` ).join(', ')}</p></div> : null}
        <ProgressGuide />
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">{tabs.map(t => {
          const I = t.icon; const isAct = activeCat === t.key; const p = pendingCats.has(t.key)
          return <button key={t.key} onClick={() => setActiveCat(t.key)} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${isAct ? 'text-white border-[#011334] shadow-lg' : 'bg-white border-gray-200 hover:bg-gray-50'}`} style={isAct ? { background: BRAND.primary } : {}}><I className="w-4 h-4" />{t.label}{p ? <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" /> : null}</button>
        })}</div>
        {/* Content */}
        {renderContent()}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {/* Timeline detail */}
      {timelineDetail ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setTimelineDetail(null)} /><div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"><div className="flex items-center justify-between mb-4"><div><h3 className="font-bold text-sm" style={{ color: BRAND.primary }}>{String(timelineDetail.fase || '')}</h3><p className="text-[10px] text-gray-400">Semana {String(timelineDetail.semana || '')}</p></div><div className="flex items-center gap-2"><span className="text-xs font-bold px-2 py-1 rounded-lg bg-gray-100" style={{ color: BRAND.primary }}>{String(timelineDetail.progresso_estimado || '')}</span><button onClick={() => setTimelineDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button></div></div>{timelineDetail.atividades_focadas ? <div className="mb-3"><p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Atividades</p><p className="text-xs text-gray-600 leading-relaxed">{String(timelineDetail.atividades_focadas)}</p></div> : null}{timelineDetail.justificativa_agendamento ? <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"><p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Estratégia</p><p className="text-[11px] text-emerald-700 italic leading-relaxed">{String(timelineDetail.justificativa_agendamento)}</p></div> : null}</div></div> : null}
      {/* Create modal */}
      {showCreate ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCreate(false)} /><div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"><div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold" style={{ color: BRAND.primary }}>Gerar {activeCat}</h3><button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button></div><div className="space-y-4"><div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Instruções / Contexto (opcional)</label><textarea value={modalText} onChange={e => setModalText(e.target.value)} placeholder="Descreva o escopo, requisitos, contexto..." className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" /></div><MultiFileUpload files={modalFiles} setFiles={setModalFiles} /></div><div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowCreate(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Cancelar</button><button onClick={handleCreate} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: BRAND.primary }}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}{submitting ? 'Enviando...' : 'Gerar'}</button></div></div></div> : null}
      {/* Refine modal */}
      {showRefine ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowRefine(false)} /><div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"><div className="flex items-center justify-between mb-5"><h3 className="text-base font-bold" style={{ color: BRAND.primary }}>Refinar {activeCat}</h3><button onClick={() => setShowRefine(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button></div><div className="space-y-4"><div className="flex gap-2 mb-2"><button onClick={() => setRefineStrategy('checkout')} className={`px-4 py-2 rounded-xl text-xs font-bold ${refineStrategy === 'checkout' ? 'text-white' : 'bg-gray-100 text-gray-500'}`} style={refineStrategy === 'checkout' ? { background: BRAND.primary } : {}}>Checkout (nova versão)</button><button onClick={() => setRefineStrategy('rebase')} className={`px-4 py-2 rounded-xl text-xs font-bold ${refineStrategy === 'rebase' ? 'text-white' : 'bg-gray-100 text-gray-500'}`} style={refineStrategy === 'rebase' ? { background: BRAND.primary } : {}}>Rebase (incremental)</button></div><div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">O que deseja alterar? *</label><textarea value={modalText} onChange={e => setModalText(e.target.value)} placeholder="Descreva as alterações..." className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" /></div><MultiFileUpload files={modalFiles} setFiles={setModalFiles} /></div><div className="flex justify-end gap-3 mt-6"><button onClick={() => setShowRefine(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Cancelar</button><button onClick={handleRefine} disabled={submitting || !modalText.trim()} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: BRAND.primary }}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}{submitting ? 'Enviando...' : 'Refinar'}</button></div></div></div> : null}
      {/* History modal */}
      {showHistory ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowHistory(false)} /><div className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"><div className="flex items-center justify-between p-5 border-b border-gray-200"><h3 className="text-base font-bold" style={{ color: BRAND.primary }}>Histórico — {activeCat}</h3><button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button></div><div className="flex-1 overflow-y-auto p-5">{historyLoading ? <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND.primary }} /></div> : !historyData?.length ? <p className="text-sm text-gray-400 text-center py-8">Nenhuma versão encontrada.</p> : <div className="space-y-2">{historyData.map(h => <div key={h.job_id} className="border border-gray-200 rounded-xl p-3 hover:bg-gray-50"><div className="flex items-center justify-between mb-1"><span className="text-[10px] font-bold text-gray-400">v{h.version}</span><span className="text-[10px] text-gray-400">{h.created_at ? new Date(h.created_at).toLocaleDateString('pt-BR') : ''}</span></div><p className="text-xs font-mono text-gray-500 truncate mb-2">{h.job_id}</p><div className="flex gap-2"><button onClick={() => previewVersion(h.job_id)} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-bold hover:bg-blue-100"><EyeIcon className="w-3 h-3" /> Ver</button><button onClick={() => restoreVer(h.job_id)} className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100"><RefreshCw className="w-3 h-3" /> Restaurar</button></div></div>)}</div>}</div></div></div> : null}
      {/* NEW: Epic Prototype Modal */}
      {showEpicProtoModal && targetEpicId && project ? <EpicPrototypeModal projectId={projectId} projectName={project.name} userEmail={user?.email || ''} epicId={targetEpicId} baseJobId={project.latest_reports?.epics} assignedGroupId={(project as Rec)?.assigned_group_id as string | undefined} onClose={() => setShowEpicProtoModal(false)} onStarted={(eid, jid) => { setEpicPrototypes(prev => ({ ...prev, [eid]: { jobId: jid, status: 'loading' } })); pollEpicProto(projectId, eid, jid, user?.email || '', (epicId, state) => { setEpicPrototypes(prev => ({ ...prev, [epicId]: state })) }) }} /> : null}
    </div>
    </ErrorBoundary>
  )
}
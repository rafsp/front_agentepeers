// src/app/project/[id]/page.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type ProjectSummary, type HistoryItem } from '@/lib/api/unified-service'
import { extractTextFromFiles, buildCommentExtra, type ExtractedFile } from '@/lib/utils/file-extractor'
import {
  ArrowLeft, Layers, Activity, Calendar, AlertTriangle, LayoutTemplate, GitMerge, Loader2,
  Settings, Wand2, Play, History, Download, FileX, Sparkles, Upload, X, CheckCircle,
  Monitor, ChevronDown, ChevronUp, Shield, RefreshCw, Camera, Eye as EyeIcon, Share2, Copy, Check,
  File as FileIcon, Trash2, Plus,
} from 'lucide-react'
// ── NEW: Component imports ────────────────────────────────────────────────
import { showToast } from '@/components/project/toast'
import { EpicsKPIs, FeaturesKPIs, TimelineKPIs, RisksKPIs } from '@/components/project/kpi-cards'
import { PriorityBadge, ComplexityBadge, TypeBadge } from '@/components/project/badges'
import { RiskMatrix } from '@/components/project/risk-matrix'
import { EpicPrototypeModal, EpicPrototypeInline, pollEpicPrototype as pollEpicProto, type EpicProtoState } from '@/components/project/epic-prototype'
import { FeatureTypeFilter, filterByType } from '@/components/project/feature-type-filter'
import { ErrorBoundary } from '@/components/project/error-boundary'
import { exportTimelineCSV } from '@/components/project/timeline-extras'
import { getApiUrl } from '@/lib/config'
import { smartSummarize, needsSummarization } from '@/lib/api/smart-summarizer'

type Cat = 'epics' | 'features' | 'timeline' | 'risks' | 'prototype' | 'tree'
interface Tab { key: Cat; label: string; icon: React.ElementType }
const ORG_TABS: Tab[] = [{ key: 'epics', label: 'Épicos', icon: Layers }, { key: 'features', label: 'Features', icon: Activity }, { key: 'timeline', label: 'Timeline', icon: Calendar }, { key: 'risks', label: 'Riscos', icon: AlertTriangle }, { key: 'prototype', label: 'Protótipos', icon: LayoutTemplate }, { key: 'tree', label: 'Árvore', icon: GitMerge }]
const PROTO_TABS: Tab[] = [{ key: 'prototype', label: 'Protótipos', icon: LayoutTemplate }, { key: 'tree', label: 'Árvore', icon: GitMerge }]

type Rec = Record<string, unknown>
function extractItems(data: unknown): Rec[] {
  if (Array.isArray(data)) return data as Rec[]
  if (typeof data === 'object' && data !== null) { for (const k of Object.keys(data as Rec)) { if (Array.isArray((data as Rec)[k])) return (data as Rec)[k] as Rec[] } }
  return []
}

// ── Markdown simples ──────────────────────────────────────────────────────
function SimpleMarkdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let inTable = false; let tableRows: string[][] = []
  const stripBold = (s: string) => s.replace(/\*\*(.*?)\*\*/g, '$1')
  const flushTable = () => { if (!tableRows.length) return; elements.push(<div key={`t${elements.length}`} className="overflow-x-auto my-4"><table className="w-full text-xs border-collapse"><thead><tr className="border-b-2 border-gray-200">{tableRows[0].map((h, i) => <th key={i} className="text-left p-2 font-bold text-gray-600 bg-gray-50">{stripBold(h)}</th>)}</tr></thead><tbody>{tableRows.slice(2).map((row, ri) => <tr key={ri} className="border-b border-gray-100 hover:bg-gray-50">{row.map((c, ci) => <td key={ci} className="p-2 text-gray-600">{stripBold(c)}</td>)}</tr>)}</tbody></table></div>); tableRows = []; inTable = false }
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (l.includes('|') && l.trim().startsWith('|')) { if (!inTable) { flushTable(); inTable = true }; tableRows.push(l.split('|').map(c => c.trim()).filter(Boolean)); continue }
    if (inTable) flushTable()
    if (l.startsWith('# ')) elements.push(<h1 key={i} className="text-xl font-bold mt-6 mb-3" style={{ color: BRAND.primary }}>{l.replace(/^#+\s*/, '').replace(/[📊📋🎯📅👥🎨⚠️📈🚀✅💰📞📚]/g, '').trim()}</h1>)
    else if (l.startsWith('## ')) elements.push(<h2 key={i} className="text-lg font-bold mt-5 mb-2 pb-1 border-b border-gray-100" style={{ color: BRAND.primary }}>{l.replace(/^#+\s*/, '').replace(/[📊📋🎯📅👥🎨⚠️📈🚀✅💰📞📚]/g, '').trim()}</h2>)
    else if (l.startsWith('### ')) elements.push(<h3 key={i} className="text-sm font-bold mt-4 mb-1.5 text-gray-700">{l.replace(/^#+\s*/, '').replace(/[📊📋🎯📅👥🎨⚠️📈🚀✅💰📞📚]/g, '').trim()}</h3>)
    else if (l.startsWith('#### ')) elements.push(<h4 key={i} className="text-xs font-bold mt-3 mb-1 text-gray-600 uppercase tracking-wider">{l.replace(/^#+\s*/, '').replace(/[📊📋🎯📅👥🎨⚠️📈🚀✅💰📞📚]/g, '').trim()}</h4>)
    else if (l.startsWith('- ') || l.startsWith('* ')) elements.push(<div key={i} className="flex items-start gap-2 ml-4 my-0.5"><span className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0" /><span className="text-xs text-gray-600">{l.replace(/^[-*]\s*/, '').replace(/\*\*/g, '')}</span></div>)
    else if (l.startsWith('```') || l.startsWith('---')) { if (l.startsWith('---')) elements.push(<hr key={i} className="my-4 border-gray-100" />) }
    else if (l.trim() === '') elements.push(<div key={i} className="h-2" />)
    else elements.push(<p key={i} className="text-xs text-gray-600 leading-relaxed my-0.5">{stripBold(l)}</p>)
  }
  if (inTable) flushTable()
  return <div className="max-h-[65vh] overflow-y-auto pr-2">{elements}</div>
}

// ── Progress Indicator ────────────────────────────────────────────────────
function AgentProgress({ step, pct }: { step: string; pct: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="relative w-24 h-24 mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={BRAND.primary} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2*Math.PI*42}`} strokeDashoffset={`${2*Math.PI*42*(1-pct/100)}`} className="transition-all duration-1000" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold" style={{ color: BRAND.primary }}>{pct}%</span></div>
      </div>
      <p className="text-sm font-semibold" style={{ color: BRAND.primary }}>{step}</p>
      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Agentes trabalhando</p>
    </div>
  )
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

  const savePendingJob = (cat: string, jid: string) => { try { localStorage.setItem(`codeai_pending_${projectId}_${cat}`, jid) } catch {}; setPendingCats(prev => new Set(prev).add(cat)) }
  const clearPendingJob = (cat: string) => { try { localStorage.removeItem(`codeai_pending_${projectId}_${cat}`) } catch {}; setPendingCats(prev => { const n = new Set(prev); n.delete(cat); return n }); setBgStatus(prev => { const n = { ...prev }; delete n[cat]; return n }) }
  const getPendingJob = (cat: string): string | null => { try { return localStorage.getItem(`codeai_pending_${projectId}_${cat}`) } catch { return null } }

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
  const [epicPrototypes, setEpicPrototypes] = useState<Record<string, EpicProtoState>>({})
  const [showEpicProtoModal, setShowEpicProtoModal] = useState(false)
  const [targetEpicId, setTargetEpicId] = useState<string | null>(null)

  const handleShareLink = () => { const url = window.location.href; if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(url).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000) }).catch(() => { prompt('Copie o link:', url) }) } else { prompt('Copie o link:', url) } }

  const hasLoaded = useRef(false)
  const activeCatRef = useRef(activeCat); activeCatRef.current = activeCat

  useEffect(() => { if (authLoading) return; if (!user?.email) { router.push('/login'); return }; if (hasLoaded.current) return; hasLoaded.current = true; const stored = sessionStorage.getItem('selected_project'); if (stored) { try { const p = JSON.parse(stored) as ProjectSummary; if (p.id === projectId) { initProject(p); return } } catch {} }; loadFromAPI() }, [projectId, user?.email, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const initProject = (p: ProjectSummary) => {
    setProject(p)
    const t = unifiedService.detectProjectType(p)
    setProjectType(t)
    // Smart tab: abre a primeira tab que tem dados ou está pendente, não sempre 'epics'
    if (t === 'prototype') { setActiveCat('prototype'); return }
    const lr = p.latest_reports || {}
    const pipeline: Cat[] = ['epics', 'features', 'timeline', 'risks', 'prototype']
    // 1. Primeiro tenta tab com dados prontos
    const withData = pipeline.find(c => !!lr[c])
    if (withData) { setActiveCat(withData); return }
    // 2. Se nenhuma tem dados, tenta tab com job pendente no localStorage
    const withPending = pipeline.find(c => { try { return !!localStorage.getItem(`codeai_pending_${p.id}_${c}`) } catch { return false } })
    if (withPending) { setActiveCat(withPending); return }
    // 3. Fallback: epics
    setActiveCat('epics')
  }
  const loadFromAPI = async () => { try { const all = await unifiedService.getProjects(); const f = all.find((p: ProjectSummary) => p.id === projectId); if (f) initProject(f); else router.push('/dashboard') } catch { router.push('/dashboard') } }

  useEffect(() => { if (!project) return; const cats = unifiedService.getCategories(unifiedService.detectProjectType(project)); const found = new Set<string>(); cats.forEach(cat => { const jid = getPendingJob(cat); if (jid) { found.add(cat); pollBackground(jid, cat) } }); if (found.size > 0) setPendingCats(found) }, [project?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const pollBackground = async (jid: string, cat: string) => {
    setBgStatus(prev => ({ ...prev, [cat]: 'Processando em segundo plano...' }))
    try {
      const r = await unifiedService.pollReport(projectId, jid, cat, (step: string) => { setBgStatus(prev => ({ ...prev, [cat]: step })) })
      if (project) { const up = { ...project, latest_reports: { ...project.latest_reports, [cat]: jid } }; setProject(up); sessionStorage.setItem('selected_project', JSON.stringify(up)) }
      clearPendingJob(cat)
      if (activeCatRef.current === cat) { if (r.isRaw) setReportRaw(r.data as string); else setReportJSON(r.data); setReportLoading(false) }
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
      if (modalFiles.length > 0) { try { const { combinedText, results } = await extractTextFromFiles(modalFiles); if (combinedText.trim()) { finalComment = buildCommentExtra(combinedText, modalText) } else { const fileNames = modalFiles.map(f => f.name).join(', '); const failedNote = results.filter(r => r.error).map(r => `${r.name}: ${r.error}`).join('; '); finalComment = buildCommentExtra(`[DOCUMENTOS ANEXADOS: ${fileNames}]\n[NOTA: Extração falhou - ${failedNote}.]`, modalText) } } catch {} }
      // Smart summarization: se texto > 25K chars, resume via PEERS Brain ou trunca
      if (needsSummarization(finalComment)) {
        showToast('Documento grande detectado. Resumindo...', 'success')
        const result = await smartSummarize(finalComment, modalText, project.name)
        finalComment = result.text
        if (result.method === 'brain_summary') showToast(`Resumido via PEERS Brain: ${result.originalLength} → ${result.finalLength} chars`, 'success')
        else if (result.method === 'truncated') showToast(`Texto truncado: ${result.originalLength} → ${result.finalLength} chars`, 'success')
      }
      const res = await unifiedService.startAnalysis({ email: user.email, nome_projeto: project.name, category: activeCat, action: 'generator', strategy: 'checkout', comentario_extra: finalComment || undefined, arquivo_docx: firstDocx || undefined })
      updateProject(activeCat, res.job_id); savePendingJob(activeCat, res.job_id); setShowCreate(false); setModalText(''); setModalFiles([]); fetchReport(res.job_id, activeCat); showToast('Geração iniciada!', 'success')
    } catch (e) { showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error') } finally { setSubmitting(false) }
  }

  const handleRefine = async () => {
    if (!project || !user || !modalText.trim()) return; setSubmitting(true)
    try {
      let finalComment = modalText; const firstDocx = modalFiles.find(f => f.name.endsWith('.docx'))
      if (modalFiles.length > 0) { try { const { combinedText, results } = await extractTextFromFiles(modalFiles); if (combinedText.trim()) { finalComment = buildCommentExtra(combinedText, modalText) } else { const fileNames = modalFiles.map(f => f.name).join(', '); finalComment = buildCommentExtra(`[DOCUMENTOS ANEXADOS: ${fileNames}]`, modalText) } } catch {} }
      // Smart summarization
      if (needsSummarization(finalComment)) {
        showToast('Documento grande detectado. Resumindo...', 'success')
        const result = await smartSummarize(finalComment, modalText, project.name)
        finalComment = result.text
        if (result.method === 'brain_summary') showToast(`Resumido via PEERS Brain`, 'success')
        else if (result.method === 'truncated') showToast(`Texto truncado para caber no limite`, 'success')
      }
      const res = await unifiedService.startAnalysis({ email: user.email, nome_projeto: project.name, category: activeCat, action: 'reviwer', strategy: refineStrategy, comentario_extra: finalComment, arquivo_docx: firstDocx || undefined, base_job_id: project.latest_reports?.[activeCat] })
      updateProject(activeCat, res.job_id); savePendingJob(activeCat, res.job_id); setShowRefine(false); setModalText(''); setModalFiles([]); fetchReport(res.job_id, activeCat); showToast('Refinamento iniciado!', 'success')
    } catch (e) { showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error') } finally { setSubmitting(false) }
  }

  const openHistory = async () => { setShowHistory(true); setHistoryLoading(true); try { setHistoryData(await unifiedService.getReportHistory(projectId, activeCat)) } catch { setHistoryData([]) } finally { setHistoryLoading(false) } }
  const previewVersion = (jid: string) => { setPreviewingJid(jid); setShowHistory(false); fetchReport(jid, activeCat) }
  const restoreVer = async (jid: string) => {
    if (!confirm('Restaurar esta versão como a versão atual?')) return
    try { const d = await unifiedService.restoreVersion(projectId, jid); if (d.new_state && project) { const up = { ...project, latest_reports: { ...project.latest_reports, ...d.new_state } }; setProject(up); sessionStorage.setItem('selected_project', JSON.stringify(up)) } else { updateProject(activeCat, jid) }; setPreviewingJid(null); setShowHistory(false); fetchReport(jid, activeCat); showToast('Versão restaurada!', 'success') }
    catch (e) { showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error') }
  }

  const exportCSV = () => { const items = extractItems(reportJSON); if (!items.length) return; const hdrs = Object.keys(items[0]); let csv = hdrs.join(';') + '\n'; items.forEach(r => { csv += hdrs.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(';') + '\n' }); const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${activeCat}_${project?.name}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('CSV exportado!', 'success') }

  const exportTimelineImage = async () => { const container = document.getElementById('timeline-container'); if (!container) return; try { const { default: html2canvas } = await import('html2canvas'); const origOverflow = container.style.overflow; const origMaxW = container.style.maxWidth; container.style.overflow = 'visible'; container.style.maxWidth = 'none'; const canvas = await html2canvas(container, { backgroundColor: '#ffffff', scale: 2, scrollX: 0, scrollY: 0, windowWidth: container.scrollWidth + 40 }); container.style.overflow = origOverflow; container.style.maxWidth = origMaxW; const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = `timeline_${project?.name?.replace(/[^a-z0-9]/gi, '_') || 'project'}.png`; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Imagem exportada!', 'success') } catch { showToast('Instale html2canvas: npm i html2canvas', 'error') } }

  const downloadProto = () => { if (!reportRaw) return; const blob = new Blob([reportRaw], { type: 'text/html;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${project?.name?.replace(/[^a-z0-9]/gi, '_') || 'proto'}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a) }

  const canEdit = project?.role !== 'viewer'
  const isOwner = project?.role === 'owner'
  const tabs = projectType === 'prototype' ? PROTO_TABS : ORG_TABS
  const hasData = activeCat === 'tree' ? true : !!project?.latest_reports?.[activeCat]
  const curJid = project?.latest_reports?.[activeCat]
  const isPending = pendingCats.has(activeCat)

  // ── ActionBar ───────────────────────────────────────────────────────────
  const ActionBar = () => {
    if (activeCat === 'tree' || !hasData || reportLoading) return null
    return (
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Job ID {previewingJid ? '(Pré-visualização)' : ''}</p>
            <p className="font-mono text-xs mt-0.5" style={{ color: BRAND.primary }}>{previewingJid || curJid}</p>
          </div>
          {previewingJid && previewingJid !== curJid ? (
            <button onClick={() => { setPreviewingJid(null); if (curJid) fetchReport(curJid, activeCat) }} className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100"><ArrowLeft className="w-3 h-3" /> Voltar à versão atual</button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !previewingJid ? <button onClick={() => { setModalText(''); setModalFiles([]); setShowRefine(true) }} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold" style={{ background: BRAND.primary }}><Wand2 className="w-3.5 h-3.5" /> Refinar</button> : null}
          <button onClick={openHistory} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><History className="w-3.5 h-3.5" /> Histórico</button>
          {activeCat === 'timeline' ? <>
            <button onClick={exportTimelineImage} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><Camera className="w-3.5 h-3.5" /> Imagem</button>
            <button onClick={() => exportTimelineCSV(reportJSON, project?.name)} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><Download className="w-3.5 h-3.5" /> CSV Timeline</button>
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

  // ── Render content ──────────────────────────────────────────────────────
  const renderContent = () => {
    if (reportLoading) return <AgentProgress step={progressStep} pct={progressPct} />
    if (!hasData && !isPending) return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-20 h-20 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-300 mb-5"><FileX className="w-9 h-9" /></div>
        <h4 className="text-xl font-bold mb-2" style={{ color: BRAND.primary }}>Nenhum dado gerado</h4>
        <p className="text-xs text-gray-400 mb-4">Inicie a geração com IA para esta categoria</p>
        {canEdit ? <button onClick={() => { setModalText(''); setModalFiles([]); setShowCreate(true) }} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white" style={{ background: BRAND.primary }}><Play className="w-4 h-4" /> Iniciar Geração</button> : <p className="text-xs text-red-400">Somente Editores/Owners podem gerar</p>}
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
    if (reportJSON) return (
      <div className="w-full text-left">
        <ActionBar />
        {activeCat === 'epics' ? <EpicsView data={reportJSON} epicPrototypes={epicPrototypes} projectId={projectId} projectName={project?.name} userEmail={user?.email} onGenerateProto={(eid) => { setTargetEpicId(eid); setShowEpicProtoModal(true) }} onDownloadProto={(eid) => { const c = epicPrototypes[eid]?.content; if (!c) return; const b = new Blob([c], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `${project?.name}_epic_${eid}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a) }} /> : null}
        {activeCat === 'features' ? <FeaturesView data={reportJSON} /> : null}
        {activeCat === 'timeline' ? <TimelineView data={reportJSON} onCellClick={setTimelineDetail} /> : null}
        {activeCat === 'risks' ? <RisksView data={reportJSON} /> : null}
      </div>
    )
    if (reportRaw) return <div className="w-full text-left"><ActionBar /><SimpleMarkdown text={reportRaw} /></div>
    return null
  }

  if (authLoading || !project) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>

  return (
    <ErrorBoundary>
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="dashboard" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 p-6 lg:p-8">
        <nav className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between mb-6 border border-gray-200 shadow-sm">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-[#011334] font-bold text-xs uppercase tracking-widest bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl"><ArrowLeft className="w-4 h-4" /> Voltar</button>
          <h2 className="text-lg font-bold truncate max-w-md" style={{ color: BRAND.primary }}>{project.name}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleShareLink} className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${linkCopied ? 'bg-emerald-50 border-emerald-300 text-emerald-500' : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 text-gray-400'}`} title="Copiar link do projeto">{linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}</button>
            {isOwner ? <button onClick={() => router.push(`/project/${projectId}/settings`)} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 hover:bg-[#011334] hover:text-white hover:border-[#011334] flex items-center justify-center text-gray-400 group transition-all"><Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /></button>
              : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: BRAND.primary }}>{project.role?.charAt(0).toUpperCase()}</div>}
          </div>
        </nav>

        {/* Progress guide */}
        {projectType === 'organization' && canEdit ? (() => {
          const lr = project.latest_reports || {}; const pipeline = ['epics', 'features', 'timeline', 'risks'] as const
          const completed = pipeline.filter(c => !!lr[c]); const nextStep = pipeline.find(c => !lr[c]); const pct = Math.round((completed.length / pipeline.length) * 100)
          if (pct === 100 || pct === 0) return null
          const stepLabels: Record<string, string> = { epics: 'Épicos', features: 'Features', timeline: 'Timeline', risks: 'Riscos' }
          return (<div className="bg-white border border-gray-200 rounded-xl px-5 py-3 mb-4 flex items-center gap-4"><div className="flex-1"><div className="flex items-center gap-3 mb-1.5"><p className="text-xs font-bold" style={{ color: BRAND.primary }}>Progresso do Projeto</p><span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${BRAND.secondary}20`, color: BRAND.primary }}>{pct}%</span></div><div className="flex items-center gap-1">{pipeline.map(c => (<div key={c} className={`h-1.5 flex-1 rounded-full ${lr[c] ? 'bg-emerald-400' : pendingCats.has(c) ? 'bg-amber-300 animate-pulse' : 'bg-gray-200'}`} />))}</div></div>{nextStep ? (<button onClick={() => setActiveCat(nextStep as Cat)} className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-[10px] font-bold whitespace-nowrap" style={{ background: BRAND.primary }}><Play className="w-3 h-3" /> Gerar {stepLabels[nextStep]}</button>) : null}</div>)
        })() : null}

        <div className={`flex gap-3 mb-6 overflow-x-auto pb-1 ${projectType === 'prototype' ? 'justify-center' : ''}`}>
          {tabs.map(tab => {
            const isAct = activeCat === tab.key; const tabHas = tab.key === 'tree' ? true : !!project.latest_reports?.[tab.key]; const I = tab.icon; const isPendingTab = pendingCats.has(tab.key)
            return <button key={tab.key} onClick={() => setActiveCat(tab.key)} className={`relative flex-1 min-w-[90px] max-w-[130px] flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 ${isAct ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-gray-200'}`}>
              {isPendingTab ? <span className="absolute top-2 right-2 flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" /></span> : null}
              <div className={`p-2 rounded-xl mb-1.5 ${isPendingTab ? 'bg-amber-100 text-amber-600' : tabHas ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}`}><I className="w-4 h-4" /></div>
              <span className={`text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap ${isAct ? 'text-[#011334]' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          })}
        </div>

        {pendingCats.size > 0 && !reportLoading ? (<div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3"><Loader2 className="w-4 h-4 text-amber-500 animate-spin flex-shrink-0" /><div className="flex-1"><p className="text-xs font-bold text-amber-700">Processamento em segundo plano</p><p className="text-[10px] text-amber-600 mt-0.5">{Array.from(pendingCats).map(cat => `${cat}${bgStatus[cat] ? `: ${bgStatus[cat]}` : ''}`).join(' • ')}</p></div><span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Os agentes estão trabalhando</span></div>) : null}

        <div className="bg-white rounded-2xl p-6 lg:p-8 min-h-[500px] border border-gray-200 shadow-sm">{renderContent()}</div>
      </main>

      {/* Modals */}
      {showCreate ? <Modal title={`Gerar ${activeCat}`} sub={project.name} onClose={() => setShowCreate(false)}><div className="space-y-4"><div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Instruções (opcional)</label><textarea value={modalText} onChange={e => setModalText(e.target.value)} placeholder="Contexto ou requisitos..." className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none resize-none" /></div><MultiFileUpload files={modalFiles} setFiles={setModalFiles} /></div><ModalFooter onCancel={() => setShowCreate(false)} onSubmit={handleCreate} submitting={submitting} label="Iniciar" icon={Play} /></Modal> : null}

      {showRefine ? <Modal title={`Refinar ${activeCat}`} sub="Ajuste fino com instruções" onClose={() => setShowRefine(false)}><div className="space-y-4"><div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Estratégia</label><div className="flex gap-3">{(['checkout', 'rebase'] as const).map(s => <label key={s} className={`flex-1 p-3 rounded-xl border-2 cursor-pointer text-center transition-all ${refineStrategy === s ? 'border-[#011334] bg-[#011334]/5' : 'border-gray-200 hover:border-gray-300'}`}><input type="radio" name="strat" value={s} checked={refineStrategy === s} onChange={() => setRefineStrategy(s)} className="sr-only" /><p className="text-xs font-bold" style={{ color: BRAND.primary }}>{s === 'checkout' ? 'Congelada' : 'Rebase'}</p><p className="text-[10px] text-gray-400 mt-0.5">{s === 'checkout' ? 'Nova versão independente' : 'Evolução incremental'}</p></label>)}</div></div><div><label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Instruções *</label><textarea value={modalText} onChange={e => setModalText(e.target.value)} placeholder="Descreva os ajustes desejados..." className="w-full h-28 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none resize-none" /></div><MultiFileUpload files={modalFiles} setFiles={setModalFiles} /></div><ModalFooter onCancel={() => setShowRefine(false)} onSubmit={handleRefine} submitting={submitting} disabled={!modalText.trim()} label="Refinar" icon={Sparkles} /></Modal> : null}

      {showHistory ? <Modal title={`Histórico — ${activeCat}`} onClose={() => setShowHistory(false)} wide>{historyLoading ? <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND.primary }} /></div> : !historyData?.length ? <p className="text-sm text-gray-400 text-center py-12">Nenhum histórico.</p> : <div className="space-y-2 max-h-[60vh] overflow-y-auto">{historyData.map((h, i) => { const isCur = h.job_id === curJid; return <div key={h.job_id} className={`flex items-center justify-between p-3 rounded-xl border ${isCur ? 'border-[#011334]/30 bg-[#011334]/5' : 'border-gray-200 hover:bg-gray-50'}`}><div className="flex items-center gap-3 min-w-0"><div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${isCur ? 'bg-[#011334] text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div><div className="min-w-0"><p className="font-mono text-[11px] truncate" style={{ color: BRAND.primary }}>{h.job_id}</p><p className="text-[10px] text-gray-400 mt-0.5">{h.action === 'generator' ? 'Gerado' : 'Refinado'}{h.strategy ? ` (${h.strategy})` : ''}{h.created_at ? ` — ${new Date(h.created_at).toLocaleString('pt-BR')}` : ''}</p></div></div><div className="flex items-center gap-1.5 ml-2">{isCur ? <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 bg-[#011334] text-white rounded-lg">Atual</span> : <><button onClick={() => previewVersion(h.job_id)} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold hover:bg-gray-200 flex items-center gap-1"><EyeIcon className="w-3 h-3" /> Ver</button>{canEdit ? <button onClick={() => restoreVer(h.job_id)} className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[10px] font-bold hover:bg-amber-100 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Restaurar</button> : null}</>}</div></div> })}</div>}</Modal> : null}

      {timelineDetail ? <Modal title={String(timelineDetail.fase || 'Detalhe')} sub={`Semana ${timelineDetail.semana}`} onClose={() => setTimelineDetail(null)}><div className="space-y-4"><div className="flex items-center gap-4"><div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-center"><p className="text-[10px] text-blue-400 font-bold uppercase">Semana</p><p className="text-xl font-bold text-blue-600">{String(timelineDetail.semana)}</p></div><div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-center"><p className="text-[10px] text-gray-400 font-bold uppercase">Progresso</p><p className="text-xl font-bold" style={{ color: BRAND.primary }}>{String(timelineDetail.progresso_estimado)}</p></div><div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 text-center flex-1"><p className="text-[10px] text-purple-400 font-bold uppercase">Fase</p><p className="text-sm font-bold text-purple-600">{String(timelineDetail.fase)}</p></div></div><div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Atividades</p><p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200">{String(timelineDetail.atividades_focadas || 'N/A')}</p></div>{timelineDetail.justificativa_agendamento ? <div><p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1.5">Estratégia de Agendamento</p><p className="text-xs text-emerald-700 leading-relaxed bg-emerald-50 p-3 rounded-xl border border-emerald-200">{String(timelineDetail.justificativa_agendamento)}</p></div> : null}</div></Modal> : null}

      {/* NEW: Epic Prototype Modal */}
      {showEpicProtoModal && targetEpicId && project ? <EpicPrototypeModal projectId={projectId} projectName={project.name} userEmail={user?.email || ''} epicId={targetEpicId} baseJobId={project.latest_reports?.epics} assignedGroupId={(project as unknown as Rec)?.assigned_group_id as string | undefined} onClose={() => setShowEpicProtoModal(false)} onStarted={(eid, jid) => { setEpicPrototypes(prev => ({ ...prev, [eid]: { jobId: jid, status: 'loading' as const } })); pollEpicProto(projectId, eid, jid, user?.email || '', (epicId, state) => { setEpicPrototypes(prev => ({ ...prev, [epicId]: state })) }) }} /> : null}
    </div>
    </ErrorBoundary>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

function Modal({ title, sub, onClose, wide, children }: { title: string; sub?: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} /><div className={`relative z-10 bg-white rounded-2xl shadow-2xl w-full overflow-hidden ${wide ? 'max-w-2xl' : 'max-w-lg'}`}><div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between"><div><h3 className="text-base font-bold" style={{ color: BRAND.primary }}>{title}</h3>{sub ? <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p> : null}</div><button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl"><X className="w-4 h-4 text-gray-400" /></button></div><div className="p-6">{children}</div></div></div>
}

function ModalFooter({ onCancel, onSubmit, submitting, disabled, label, icon: Icon }: { onCancel: () => void; onSubmit: () => void; submitting: boolean; disabled?: boolean; label: string; icon: React.ElementType }) {
  return <div className="flex justify-end gap-3 mt-6"><button onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Cancelar</button><button onClick={onSubmit} disabled={submitting || disabled} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: BRAND.primary }}>{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />} {submitting ? 'Processando...' : label}</button></div>
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

function EpicsView({ data, epicPrototypes, projectId, projectName, userEmail, onGenerateProto, onDownloadProto }: {
  data: unknown
  epicPrototypes: Record<string, EpicProtoState>
  projectId: string
  projectName?: string
  userEmail?: string
  onGenerateProto: (epicId: string) => void
  onDownloadProto: (epicId: string) => void
}) {
  const items = extractItems(data)
  const [exp, setExp] = useState<string | null>(null)
  if (!items.length) return <p className="text-gray-400 text-sm">Nenhum épico.</p>
  return (
    <div>
      <EpicsKPIs data={data} />
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
        {items.map((e, i) => {
          const id = String(e.id || i + 1)
          const isExp = exp === id
          return (
            <div key={id} className="border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setExp(isExp ? null : id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: BRAND.primary }}>{id}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: BRAND.primary }}>{String(e.titulo || e.title || `Épico ${i + 1}`)}</p>
                    {e.prioridade_estrategica ? <PriorityBadge level={String(e.prioridade_estrategica)} /> : null}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {e.estimativa_semanas ? <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{String(e.estimativa_semanas)} sem</span> : null}
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>
              {isExp ? (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50 pt-3 space-y-3">
                  {e.resumo_valor ? <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs"><p className="font-bold text-emerald-700 mb-1">Valor</p><p className="text-emerald-600">{String(e.resumo_valor)}</p></div> : null}
                  {e.business_case ? <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs"><p className="font-bold text-blue-700 mb-1">Business Case</p><p className="text-blue-600">{String(e.business_case)}</p></div> : null}
                  {Array.isArray(e.squad_sugerida) ? <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Squad</p><div className="flex flex-wrap gap-1">{(e.squad_sugerida as string[]).map((s, j) => <span key={j} className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded">{s}</span>)}</div></div> : null}
                  {/* Entregáveis Macro */}
                  {Array.isArray(e.entregaveis_macro) && (e.entregaveis_macro as string[]).length > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">Entregáveis Macro</p>
                      <div className="space-y-1">
                        {(e.entregaveis_macro as string[]).map((ent, j) => (
                          <div key={j} className="flex items-start gap-2">
                            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{j + 1}</span>
                            <span className="text-xs text-amber-800 leading-relaxed">{ent}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : typeof e.entregaveis_macro === 'string' && e.entregaveis_macro ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Entregáveis Macro</p>
                      <p className="text-xs text-amber-800 leading-relaxed">{String(e.entregaveis_macro)}</p>
                    </div>
                  ) : null}
                  <EpicPrototypeInline epicId={id} projectId={projectId} projectName={projectName} userEmail={userEmail} state={epicPrototypes[id]} onGenerate={onGenerateProto} onDownload={onDownloadProto} />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeaturesView({ data }: { data: unknown }) {
  const items = extractItems(data)
  const epicIds = Array.from(new Set(items.map(f => String(f.epic_id || 'sem'))))
  const [curEpic, setCurEpic] = useState(epicIds[0] || 'all')
  const [expandedCrit, setExpandedCrit] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')

  if (!items.length) return <p className="text-gray-400 text-sm">Nenhuma feature.</p>

  let filtered = curEpic === 'all' ? items : items.filter(f => String(f.epic_id) === curEpic)
  filtered = filterByType(filtered, typeFilter)

  return (
    <div>
      <FeaturesKPIs data={data} />
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {epicIds.map(eid => (
          <button key={eid} onClick={() => setCurEpic(eid)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${curEpic === eid ? 'bg-[#011334] text-white border-[#011334]' : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}`}>{eid}</button>
        ))}
      </div>
      <div className="mb-4"><FeatureTypeFilter current={typeFilter} onChange={setTypeFilter} /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto pr-2">
        {filtered.map((f, i) => {
          const fid = String(f.id || i)
          const crits = Array.isArray(f.criterios_aceite) ? f.criterios_aceite as string[] : []
          const isExpanded = expandedCrit === fid
          const showAll = isExpanded || crits.length <= 2
          return (
            <div key={fid} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">{String(f.id || i + 1)}</span>
                <div className="flex gap-1">
                  {f.tipo ? <TypeBadge type={String(f.tipo)} /> : null}
                  {f.complexidade ? <ComplexityBadge level={String(f.complexidade)} /> : null}
                </div>
              </div>
              <h4 className="font-bold text-sm mb-1" style={{ color: BRAND.primary }}>{String(f.titulo || f.name || `Feature ${i + 1}`)}</h4>
              {f.descricao ? <p className="text-[11px] text-gray-400 line-clamp-2 mb-2">{String(f.descricao)}</p> : null}
              {crits.length > 0 ? (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Critérios de Aceite</p>
                  {(showAll ? crits : crits.slice(0, 2)).map((c, j) => <p key={j} className="text-[10px] text-gray-500 flex items-start gap-1 mb-0.5"><span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />{c}</p>)}
                  {crits.length > 2 ? <button onClick={() => setExpandedCrit(isExpanded ? null : fid)} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 mt-1">{isExpanded ? '▲ Recolher' : `+${crits.length - 2} critério${crits.length - 2 > 1 ? 's' : ''}`}</button> : null}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
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
  return (
    <div>
      <TimelineKPIs data={data} />
      <div id="timeline-container" className="overflow-x-auto bg-white">
        <table className="w-full text-left text-xs">
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
        </table>
      </div>
    </div>
  )
}

function RisksView({ data }: { data: unknown }) {
  let prem: Rec[] = [], risk: Rec[] = []
  const obj = data as Rec; const keys = Object.keys(obj)
  const rootKey = keys.find(k => Array.isArray(obj[k]))
  let rawData: unknown = rootKey ? obj[rootKey] : (Array.isArray(data) ? data : data)
  if (Array.isArray(rawData) && rawData.length > 0 && ('premissas' in (rawData[0] as Rec) || 'riscos' in (rawData[0] as Rec))) rawData = rawData[0]
  const container = rawData as Rec
  if (Array.isArray(container.premissas)) prem = container.premissas as Rec[]
  if (Array.isArray(container.riscos)) risk = container.riscos as Rec[]
  if (!prem.length && !risk.length) { if (Array.isArray(obj.premissas)) prem = obj.premissas as Rec[]; if (Array.isArray(obj.riscos)) risk = obj.riscos as Rec[] }
  return (
    <div>
      <RisksKPIs premissas={prem.length} riscos={risk.length} />
      <RiskMatrix premissas={prem} riscos={risk} />
    </div>
  )
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
      } catch { if (!cancelled) { setError('Falha ao carregar vis-network.'); setLoading(false) }; return }
      if (cancelled || !containerRef.current) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vis = (window as any).vis; const lr = project.latest_reports || {}
      const cm: Record<string, string> = { epics: '#4f46e5', features: '#059669', timeline: '#2563eb', risks: '#e11d48', prototype: '#9333ea' }
      const nodes = new vis.DataSet(lineage.nodes.map((n: { id: string; label: string; type: string }) => ({ id: n.id, label: n.label + (lr[n.type] === n.id ? '\n(Atual)' : ''), color: { background: cm[n.type] || '#4b5563', border: lr[n.type] === n.id ? '#011334' : '#ddd' }, font: { color: '#333', face: 'Inter', size: 12 }, shape: 'box', borderWidth: lr[n.type] === n.id ? 3 : 1, margin: 10, shadow: true })))
      const edges = new vis.DataSet(lineage.edges.map((e: { source: string; target: string; type: string }) => ({ from: e.source, to: e.target, arrows: 'to', color: { color: e.type === 'refinement' ? '#a855f7' : '#6b7280', opacity: 0.8 }, dashes: e.type !== 'refinement', smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 } })))
      const network = new vis.Network(containerRef.current, { nodes, edges }, { layout: { hierarchical: { direction: 'LR', sortMethod: 'directed', levelSeparation: 250, nodeSpacing: 100 } }, physics: false, interaction: { hover: true, dragNodes: true, zoomView: true, dragView: true } })
      setLoading(false)
      setTimeout(() => { window.dispatchEvent(new Event('resize')); network.fit() }, 300)
    }
    run(); return () => { cancelled = true }
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="w-full text-left">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: BRAND.primary }}><GitMerge className="w-5 h-5" /> Multiverso do Projeto</h3>
    {loading ? <div className="w-full h-[500px] bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center"><div className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: BRAND.primary }} /><p className="text-sm text-gray-400">Carregando grafo...</p></div></div> : error ? <div className="w-full h-[500px] bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center"><div className="text-center"><AlertTriangle className="w-6 h-6 text-amber-400 mx-auto mb-2" /><p className="text-sm text-gray-500 max-w-sm">{error}</p></div></div> : null}
    <div ref={containerRef} className={`w-full h-[500px] bg-gray-50 border border-gray-200 rounded-2xl ${loading || error ? 'hidden' : ''}`} />
  </div>
}
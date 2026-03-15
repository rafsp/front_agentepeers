// src/app/relatorios/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type ProjectSummary } from '@/lib/api/unified-service'
import {
  Loader2, FileText, Layers, AlertTriangle, Calendar, Activity,
  LayoutTemplate, Search, ArrowRight, CheckCircle, Clock, FolderOpen,
} from 'lucide-react'

const CAT_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  epics: { label: 'Épicos', icon: Layers, color: '#4f46e5', bg: '#eef2ff' },
  features: { label: 'Features', icon: Activity, color: '#8b5cf6', bg: '#f5f3ff' },
  timeline: { label: 'Timeline', icon: Calendar, color: '#0ea5e9', bg: '#f0f9ff' },
  risks: { label: 'Riscos', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb' },
  prototype: { label: 'Protótipo', icon: LayoutTemplate, color: '#9333ea', bg: '#faf5ff' },
}

interface ReportEntry {
  projectId: string
  projectName: string
  category: string
  jobId: string
  role: string
}

export default function RelatoriosPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) { router.push('/login'); return }
    if (hasLoaded.current) return
    hasLoaded.current = true
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading])

  const loadProjects = async () => {
    setLoading(true)
    try { setProjects(await unifiedService.getProjects()) } catch {}
    finally { setLoading(false) }
  }

  // Flatten all reports from all projects
  const allReports: ReportEntry[] = projects.flatMap((p: ProjectSummary) =>
    Object.entries(p.latest_reports || {}).map(([cat, jid]) => ({
      projectId: p.id,
      projectName: p.name,
      category: cat,
      jobId: jid,
      role: p.role,
    }))
  )

  const q = search.toLowerCase()
  const filtered = allReports.filter((r: ReportEntry) => {
    if (filterCat !== 'all' && r.category !== filterCat) return false
    if (q && !r.projectName.toLowerCase().includes(q) && !r.category.includes(q)) return false
    return true
  })

  // Count by category
  const catCounts: Record<string, number> = {}
  allReports.forEach((r: ReportEntry) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1 })

  const openReport = (r: ReportEntry) => {
    const proj = projects.find((p: ProjectSummary) => p.id === r.projectId)
    if (proj) sessionStorage.setItem('selected_project', JSON.stringify(proj))
    router.push(`/project/${r.projectId}`)
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="relatorios" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl px-6 py-5 border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold" style={{ color: BRAND.primary }}>Relatórios</h1>
              <p className="text-xs text-gray-400 mt-0.5">{allReports.length} relatório{allReports.length !== 1 ? 's' : ''} em {projects.length} projeto{projects.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por projeto..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#011334]/30 w-56" />
              </div>
            </div>
          </div>
        </div>

        {/* Category stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <button onClick={() => setFilterCat('all')}
            className={`p-3 rounded-xl border text-center transition-all ${filterCat === 'all' ? 'bg-white border-gray-300 shadow-sm' : 'bg-gray-50 border-gray-100 hover:bg-white'}`}>
            <p className="text-lg font-bold" style={{ color: BRAND.primary }}>{allReports.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Todos</p>
          </button>
          {Object.entries(CAT_META).map(([cat, meta]) => {
            const count = catCounts[cat] || 0
            const Icon = meta.icon
            return (
              <button key={cat} onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                className={`p-3 rounded-xl border text-center transition-all ${filterCat === cat ? 'shadow-sm border-gray-300' : 'border-gray-100 hover:bg-white'}`}
                style={filterCat === cat ? { background: meta.bg, borderColor: meta.color + '40' } : { background: '#fafafa' }}>
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  <span className="text-lg font-bold" style={{ color: meta.color }}>{count}</span>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">{meta.label}</p>
              </button>
            )
          })}
        </div>

        {/* Reports list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: BRAND.primary }} />
            <p className="text-sm text-gray-400">Carregando relatórios...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-sm text-gray-500">{search ? 'Nenhum relatório encontrado para esta busca.' : 'Nenhum relatório gerado ainda.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r: ReportEntry, i: number) => {
              const meta = CAT_META[r.category] || { label: r.category, icon: FileText, color: '#6b7280', bg: '#f9fafb' }
              const Icon = meta.icon
              return (
                <button key={`${r.projectId}-${r.category}-${i}`} onClick={() => openReport(r)}
                  className="w-full flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50 hover:border-gray-300 transition-all text-left group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: meta.bg }}>
                    <Icon className="w-5 h-5" style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold truncate" style={{ color: BRAND.primary }}>{r.projectName}</p>
                      <span className="flex-shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{r.jobId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${r.role === 'owner' ? 'bg-indigo-50 text-indigo-500' : r.role === 'editor' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>{r.role}</span>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
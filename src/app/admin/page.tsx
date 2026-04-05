// src/app/admin/page.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type ProjectSummary, type GroupInfo } from '@/lib/api/unified-service'
import {
  Loader2, Layers, Activity, Calendar, AlertTriangle, LayoutTemplate,
  FolderPlus, Trash2, Settings2, Users, BarChart3, Search, Filter,
  CheckCircle, XCircle, Clock, ArrowUpRight, RefreshCw, Plus, X,
  ChevronDown, Package, Zap, Eye, Edit3, Crown, FileText, AlertCircle,
} from 'lucide-react'

type TabKey = 'overview' | 'groups' | 'projects' | 'tools'

interface ProjectDetail extends ProjectSummary {
  company_id?: string
  lr: Record<string, string | null>
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectDetail[]>([])
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [templates, setTemplates] = useState<Record<string, string[]>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'partial' | 'empty'>('all')
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) { router.push('/login'); return }
    if (hasLoaded.current) return
    hasLoaded.current = true
    loadAll()
  }, [user?.email, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAll = async () => {
    setLoading(true)
    try {
      const [projs, grps] = await Promise.all([
        unifiedService.getProjects(),
        unifiedService.getUserGroups(),
      ])
      // Enrich with full details
      const detailed: ProjectDetail[] = await Promise.all(
        projs.map(async (p) => {
          const full = await unifiedService.getProjectFull(p.id)
          const lr = (full?.latest_reports || p.latest_reports || {}) as Record<string, string | null>
          return { ...p, latest_reports: lr as Record<string, string>, lr, company_id: full?.company_id as string | undefined }
        })
      )
      setProjects(detailed)
      setGroups(grps)

      // Load templates per group
      const tpl: Record<string, string[]> = {}
      await Promise.all(grps.map(async (g) => {
        tpl[g.id] = await unifiedService.getGroupTemplates(g.id)
      }))
      setTemplates(tpl)
    } catch (e) { console.error('Admin load failed:', e) }
    finally { setLoading(false) }
  }

  // ── Stats ───────────────────────────────────────────────────────────────

  const stats = React.useMemo(() => {
    const s = { total: projects.length, complete: 0, partial: 0, empty: 0, withEpics: 0, withFeatures: 0, withTimeline: 0, withRisks: 0, withProto: 0, uniqueCompanies: new Set<string>() }
    projects.forEach(p => {
      const lr = p.lr || {}
      if (lr.epics) s.withEpics++
      if (lr.features) s.withFeatures++
      if (lr.timeline) s.withTimeline++
      if (lr.risks) s.withRisks++
      if (lr.prototype) s.withProto++
      const orgCats = [lr.epics, lr.features, lr.timeline, lr.risks].filter(Boolean).length
      if (orgCats === 4) s.complete++
      else if (orgCats > 0 || lr.prototype) s.partial++
      else s.empty++
      if (p.company_id) s.uniqueCompanies.add(p.company_id)
    })
    return s
  }, [projects])

  // ── Filter ──────────────────────────────────────────────────────────────

  const filteredProjects = React.useMemo(() => {
    let result = projects
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.id.includes(q))
    }
    if (statusFilter !== 'all') {
      result = result.filter(p => {
        const lr = p.lr || {}
        const orgCats = [lr.epics, lr.features, lr.timeline, lr.risks].filter(Boolean).length
        if (statusFilter === 'complete') return orgCats === 4
        if (statusFilter === 'partial') return (orgCats > 0 || lr.prototype) && orgCats < 4
        if (statusFilter === 'empty') return orgCats === 0 && !lr.prototype
        return true
      })
    }
    return result
  }, [projects, searchQuery, statusFilter])

  // ── Delete project ──────────────────────────────────────────────────────

  const [deleting, setDeleting] = useState<string | null>(null)
  const handleDelete = async (pid: string, name: string) => {
    if (!confirm(`Tem certeza que quer deletar "${name}"?\nEsta ação é irreversível.`)) return
    setDeleting(pid)
    try {
      await unifiedService.deleteProject(pid)
      setProjects(prev => prev.filter(p => p.id !== pid))
    } catch (e) { alert(`Erro: ${e instanceof Error ? e.message : 'Erro'}`) }
    finally { setDeleting(null) }
  }

  // ── Force update ────────────────────────────────────────────────────────

  const [forceProjectId, setForceProjectId] = useState('')
  const [forceCategory, setForceCategory] = useState('epics')
  const [forceJobId, setForceJobId] = useState('')
  const [forceResult, setForceResult] = useState<string | null>(null)

  const handleForceUpdate = async () => {
    if (!forceProjectId || !forceJobId) return
    try {
      const r = await unifiedService.forceUpdateLatest(forceProjectId, forceCategory, forceJobId)
      setForceResult(`Sucesso: ${JSON.stringify(r)}`)
    } catch (e) { setForceResult(`Erro: ${e instanceof Error ? e.message : 'Erro'}`) }
  }

  if (authLoading || loading) return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="admin" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: BRAND.primary }} />
          <p className="text-sm text-gray-400">Carregando dados administrativos...</p>
        </div>
      </main>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="admin" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 p-6 lg:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl" style={{ background: BRAND.primary }}><Settings2 className="w-5 h-5 text-white" /></div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: BRAND.primary }}>Painel Administrativo</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Code.IA — Visão Geral</p>
            </div>
          </div>
          <button onClick={() => { hasLoaded.current = false; loadAll() }} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"><RefreshCw className="w-3.5 h-3.5" /> Atualizar</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {([
            { key: 'overview' as TabKey, label: 'Visão Geral', icon: BarChart3 },
            { key: 'groups' as TabKey, label: `Grupos (${groups.length})`, icon: Package },
            { key: 'projects' as TabKey, label: `Projetos (${projects.length})`, icon: FileText },
            { key: 'tools' as TabKey, label: 'Ferramentas', icon: Zap },
          ]).map(tab => {
            const isActive = activeTab === tab.key
            const Icon = tab.icon
            return <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive ? 'text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              style={isActive ? { background: BRAND.primary } : {}}>
              <Icon className="w-3.5 h-3.5" /> {tab.label}
            </button>
          })}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { label: 'Total Projetos', value: stats.total, icon: FileText, color: 'bg-blue-50 text-blue-600' },
                { label: 'Completos', value: stats.complete, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Em Progresso', value: stats.partial, icon: Clock, color: 'bg-amber-50 text-amber-600' },
                { label: 'Vazios', value: stats.empty, icon: XCircle, color: 'bg-red-50 text-red-600' },
                { label: 'Grupos', value: groups.length, icon: Package, color: 'bg-purple-50 text-purple-600' },
                { label: 'Empresas', value: stats.uniqueCompanies.size, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
              ].map((kpi, i) => {
                const Icon = kpi.icon
                return <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{kpi.label}</span>
                    <div className={`p-1.5 rounded-lg ${kpi.color}`}><Icon className="w-3 h-3" /></div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: BRAND.primary }}>{kpi.value}</p>
                </div>
              })}
            </div>

            {/* Pipeline Funnel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.primary }}>Pipeline de Geração</h3>
              <div className="space-y-3">
                {[
                  { cat: 'Épicos', count: stats.withEpics, icon: Layers, color: '#4f46e5' },
                  { cat: 'Features', count: stats.withFeatures, icon: Activity, color: '#059669' },
                  { cat: 'Timeline', count: stats.withTimeline, icon: Calendar, color: '#2563eb' },
                  { cat: 'Riscos', count: stats.withRisks, icon: AlertTriangle, color: '#e11d48' },
                  { cat: 'Protótipos', count: stats.withProto, icon: LayoutTemplate, color: '#9333ea' },
                ].map((item, i) => {
                  const pct = stats.total > 0 ? Math.round((item.count / stats.total) * 100) : 0
                  const Icon = item.icon
                  return <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center gap-2 w-32 flex-shrink-0">
                      <Icon className="w-4 h-4" style={{ color: item.color }} />
                      <span className="text-xs font-medium text-gray-600">{item.cat}</span>
                    </div>
                    <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                      <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${pct}%`, background: item.color }} />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: pct > 50 ? '#fff' : BRAND.primary }}>
                        {item.count}/{stats.total} ({pct}%)
                      </span>
                    </div>
                  </div>
                })}
              </div>
              <p className="text-[10px] text-gray-400 mt-4">Apenas 1 projeto completou o pipeline inteiro (épicos → features → timeline → riscos)</p>
            </div>

            {/* Groups & Templates Quick View */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.primary }}>Grupos e Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {groups.map(g => (
                  <div key={g.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4" style={{ color: BRAND.primary }} />
                      <span className="text-sm font-bold" style={{ color: BRAND.primary }}>{g.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(templates[g.id] || []).length > 0
                        ? (templates[g.id] || []).map((t, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-600 font-medium">{t}</span>)
                        : <span className="text-[10px] text-gray-400">Sem templates</span>}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-mono">{g.id.substring(0, 8)}...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── GROUPS TAB ───────────────────────────────────────────────────── */}
        {activeTab === 'groups' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>Gerenciamento de Grupos</h3>
            </div>
            <div className="space-y-3">
              {groups.map(g => (
                <div key={g.id} className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${BRAND.primary}10` }}>
                        <Package className="w-5 h-5" style={{ color: BRAND.primary }} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold" style={{ color: BRAND.primary }}>{g.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{g.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {(templates[g.id] || []).map((t, i) => <span key={i} className="text-[10px] px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 font-bold">{t}</span>)}
                        {(templates[g.id] || []).length === 0 && <span className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-400">Sem templates</span>}
                      </div>
                    </div>
                  </div>
                  {/* Projects using this group */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Tipo</p>
                    <p className="text-xs text-gray-600">
                      {g.name.toLowerCase().includes('prototype') ? '🎨 Protótipos' : g.name.toLowerCase().includes('po_full') ? '📋 PO Full (Épicos + Features + Timeline + Riscos)' : '⚙️ Geral'}
                    </p>
                  </div>
                </div>
              ))}
              {groups.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">Nenhum grupo encontrado</p>}
            </div>
          </div>
        )}

        {/* ── PROJECTS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-200 px-5 py-3 flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" placeholder="Buscar por nome ou ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none" />
              </div>
              <div className="flex gap-1.5">
                {([
                  { key: 'all' as const, label: 'Todos', count: stats.total },
                  { key: 'complete' as const, label: 'Completos', count: stats.complete },
                  { key: 'partial' as const, label: 'Parcial', count: stats.partial },
                  { key: 'empty' as const, label: 'Vazios', count: stats.empty },
                ]).map(f => (
                  <button key={f.key} onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${statusFilter === f.key ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    style={statusFilter === f.key ? { background: BRAND.primary } : {}}>
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Project table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Projeto</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">E</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">F</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">T</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">R</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">P</th>
                    <th className="text-center px-3 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                    <th className="text-right px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(p => {
                    const lr = p.lr || {}
                    const CatDot = ({ has }: { has: boolean }) => <div className={`w-5 h-5 rounded-md mx-auto flex items-center justify-center ${has ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}`}>{has ? <CheckCircle className="w-3 h-3" /> : <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />}</div>
                    return <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <button onClick={() => { sessionStorage.setItem('selected_project', JSON.stringify(p)); router.push(`/project/${p.id}`) }} className="text-left hover:underline">
                          <p className="font-bold text-xs" style={{ color: BRAND.primary }}>{p.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{p.id.substring(0, 12)}...</p>
                        </button>
                      </td>
                      <td className="px-3 py-3"><CatDot has={!!lr.epics} /></td>
                      <td className="px-3 py-3"><CatDot has={!!lr.features} /></td>
                      <td className="px-3 py-3"><CatDot has={!!lr.timeline} /></td>
                      <td className="px-3 py-3"><CatDot has={!!lr.risks} /></td>
                      <td className="px-3 py-3"><CatDot has={!!lr.prototype} /></td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${p.role === 'owner' ? 'bg-indigo-50 text-indigo-600' : p.role === 'editor' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{p.role}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { sessionStorage.setItem('selected_project', JSON.stringify(p)); router.push(`/project/${p.id}`) }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50" title="Abrir"><ArrowUpRight className="w-3.5 h-3.5" /></button>
                          {p.role === 'owner' && (
                            <button onClick={() => handleDelete(p.id, p.name)}
                              disabled={deleting === p.id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50" title="Deletar">
                              {deleting === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  })}
                </tbody>
              </table>
              {filteredProjects.length === 0 && <p className="text-center text-gray-400 py-12 text-sm">Nenhum projeto encontrado</p>}
            </div>
          </div>
        )}

        {/* ── TOOLS TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            {/* Force Update */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-amber-50"><Zap className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: BRAND.primary }}>Force Update Latest</h3>
                  <p className="text-[10px] text-gray-400">Atualiza manualmente o latest_reports de um projeto (usar com cuidado)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Project ID</label>
                  <select value={forceProjectId} onChange={e => setForceProjectId(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs">
                    <option value="">Selecione...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.id.substring(0, 8)})</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Categoria</label>
                  <select value={forceCategory} onChange={e => setForceCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs">
                    {['epics', 'features', 'timeline', 'risks', 'prototype'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Job ID</label>
                  <input type="text" value={forceJobId} onChange={e => setForceJobId(e.target.value)} placeholder="job_id..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs" />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleForceUpdate} disabled={!forceProjectId || !forceJobId}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-xs font-bold disabled:opacity-40" style={{ background: BRAND.primary }}>
                  <Zap className="w-3.5 h-3.5" /> Executar
                </button>
                {forceResult && <p className={`text-xs ${forceResult.startsWith('Sucesso') ? 'text-emerald-600' : 'text-red-600'}`}>{forceResult}</p>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: BRAND.primary }}>Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onClick={() => { setStatusFilter('empty'); setActiveTab('projects') }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 text-left transition-all">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Ver Projetos Vazios ({stats.empty})</p>
                    <p className="text-[10px] text-gray-400">Projetos sem nenhuma geração — candidatos a limpeza</p>
                  </div>
                </button>
                <button onClick={() => { setStatusFilter('partial'); setActiveTab('projects') }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-amber-50 hover:border-amber-200 text-left transition-all">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Pipeline Incompleto ({stats.partial})</p>
                    <p className="text-[10px] text-gray-400">Projetos que pararam no meio do pipeline</p>
                  </div>
                </button>
                <button onClick={() => setActiveTab('groups')}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-purple-50 hover:border-purple-200 text-left transition-all">
                  <Package className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Gerenciar Grupos ({groups.length})</p>
                    <p className="text-[10px] text-gray-400">Especialidades e templates disponíveis</p>
                  </div>
                </button>
                <button onClick={() => { hasLoaded.current = false; loadAll() }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 text-left transition-all">
                  <RefreshCw className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: BRAND.primary }}>Recarregar Tudo</p>
                    <p className="text-[10px] text-gray-400">Atualiza projetos, grupos e templates do backend</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
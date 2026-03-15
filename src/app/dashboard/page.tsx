// src/app/dashboard/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type ProjectSummary } from '@/lib/api/unified-service'
import { Crown, Edit3, Eye, FolderPlus, Layers, Activity, Calendar, AlertTriangle, LayoutTemplate, Loader2, LogOut, Search, Building2, Clock } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  const empresa = typeof localStorage !== 'undefined' ? localStorage.getItem('peers_empresa') || '' : ''

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) { router.push('/login'); return }
    if (hasLoaded.current) return
    hasLoaded.current = true
    loadProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading])

  const loadProjects = async () => {
    setLoading(true); setError(null)
    try { setProjects(await unifiedService.getProjects()) } catch (err) { setError(err instanceof Error ? err.message : 'Erro') }
    finally { setLoading(false) }
  }

  const grouped = {
    owner: projects.filter(p => p.role === 'owner'),
    editor: projects.filter(p => p.role === 'editor'),
    viewer: projects.filter(p => p.role === 'viewer'),
  }
  const q = searchQuery.toLowerCase()
  const filtered = searchQuery ? {
    owner: grouped.owner.filter(p => p.name.toLowerCase().includes(q)),
    editor: grouped.editor.filter(p => p.name.toLowerCase().includes(q)),
    viewer: grouped.viewer.filter(p => p.name.toLowerCase().includes(q)),
  } : grouped

  const openProject = (p: ProjectSummary) => {
    sessionStorage.setItem('selected_project', JSON.stringify(p))
    router.push(`/project/${p.id}`)
  }

  const CatIcon = ({ cat, has }: { cat: string; has: boolean }) => {
    const icons: Record<string, React.ElementType> = { epics: Layers, features: Activity, timeline: Calendar, risks: AlertTriangle, prototype: LayoutTemplate }
    const I = icons[cat] || Layers
    return <div className={`flex justify-center p-1.5 rounded-lg border ${has ? 'bg-emerald-50 border-emerald-200 text-emerald-500' : 'bg-gray-50 border-gray-100 text-gray-300'}`}><I className="w-3 h-3" /></div>
  }

  const formatDate = (d?: string) => { if (!d) return ''; try { return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) } catch { return '' } }

  const ProjectCard = ({ project: p }: { project: ProjectSummary }) => {
    const pType = unifiedService.detectProjectType(p)
    const cats = pType === 'prototype' ? ['prototype'] : ['epics', 'features', 'timeline', 'risks']
    const completedCount = cats.filter(c => !!p.latest_reports?.[c]).length
    const progress = Math.round((completedCount / cats.length) * 100)

    return (
      <div onClick={() => openProject(p)} className="group bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-gray-300 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between overflow-hidden">
        {/* Progress bar top */}
        <div className="h-1 bg-gray-100"><div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: progress === 100 ? '#059669' : BRAND.primary }} /></div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold leading-tight line-clamp-2" style={{ color: BRAND.primary }}>{p.name || `Projeto ${p.id?.substring(0, 8)}`}</h3>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${p.role === 'owner' ? 'bg-indigo-50 text-indigo-500' : p.role === 'editor' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>{p.role}</span>
          </div>
          {p.created_at ? <p className="text-[10px] text-gray-300 flex items-center gap-1 mb-3"><Clock className="w-3 h-3" /> {formatDate(p.created_at)}</p> : null}
          <div className="mt-auto">
            <div className="flex items-center gap-1.5">{cats.map(c => <CatIcon key={c} cat={c} has={!!p.latest_reports?.[c]} />)}</div>
            <p className="text-[9px] text-gray-300 mt-2">{completedCount}/{cats.length} categorias</p>
          </div>
        </div>
      </div>
    )
  }

  const Swimlane = ({ title, icon: Icon, items, color, showCreate }: { title: string; icon: React.ElementType; items: ProjectSummary[]; color: string; showCreate: boolean }) => {
    if (items.length === 0 && !showCreate) return null
    return (
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-3">
          <div className={`p-2 rounded-xl shadow-sm ${color}`}><Icon className="w-4 h-4 text-white" /></div>
          <div><h2 className="text-base font-bold uppercase tracking-wider" style={{ color: BRAND.primary }}>{title}</h2><p className="text-[10px] text-gray-400 font-medium mt-0.5">{items.length} projeto{items.length !== 1 ? 's' : ''}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {showCreate && (
            <div onClick={() => router.push('/project/new')} className="group border-2 border-dashed border-gray-200 rounded-2xl p-5 hover:border-[#011334]/30 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[180px]">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#011334]/10 group-hover:text-[#011334] transition-colors mb-3"><FolderPlus className="w-6 h-6" /></div>
              <h3 className="text-xs font-bold text-gray-400 group-hover:text-[#011334] uppercase tracking-wider">Novo Projeto</h3>
            </div>
          )}
          {items.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    )
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="dashboard" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 bg-white rounded-2xl px-6 py-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: BRAND.primary }}>Workspace</h1>
            {empresa ? <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-100 text-gray-500"><Building2 className="w-3 h-3" /> {empresa}</span> : null}
          </div>
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input type="text" placeholder="Buscar projeto..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-[#011334]/30 w-56" />
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: BRAND.primary }}>{(user?.name || '?').charAt(0)}</div>
              <div className="hidden md:block"><p className="text-xs font-bold" style={{ color: BRAND.primary }}>{user?.name}</p><p className="text-[10px] text-gray-400">{user?.email}</p></div>
              <button onClick={logout} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 ml-1"><LogOut className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: BRAND.primary }} />
            <p className="text-sm text-gray-400">Carregando projetos...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-4" />
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={() => { hasLoaded.current = false; loadProjects() }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: BRAND.primary }}>Tentar Novamente</button>
          </div>
        ) : (
          <>
            <Swimlane title="Meus Projetos" icon={Crown} items={filtered.owner} color="bg-[#011334]" showCreate={true} />
            <Swimlane title="Colaboração" icon={Edit3} items={filtered.editor} color="bg-emerald-600" showCreate={false} />
            <Swimlane title="Visualização" icon={Eye} items={filtered.viewer} color="bg-blue-600" showCreate={false} />
          </>
        )}
      </main>
    </div>
  )
}
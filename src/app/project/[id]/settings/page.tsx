// src/app/project/[id]/settings/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type ProjectSummary, type MemberInfo } from '@/lib/api/unified-service'
import { ArrowLeft, Users, UserPlus, UserMinus, Settings, Loader2, Trash2, AlertTriangle, Crown, Shield, Eye, Share2, Copy, Check } from 'lucide-react'

export default function ProjectSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params.id as string
  const { user, loading: authLoading, logout } = useAuth()

  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [members, setMembers] = useState<MemberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('viewer')
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)
  const hasLoaded = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) { router.push('/login'); return }
    if (hasLoaded.current) return
    hasLoaded.current = true
    const stored = sessionStorage.getItem('selected_project')
    if (stored) { try { const p = JSON.parse(stored) as ProjectSummary; if (p.id === projectId) setProject(p) } catch {} }
    loadMembers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user?.email, authLoading])

  const loadMembers = async () => {
    setLoading(true)
    try { setMembers(await unifiedService.getProjectMembers(projectId, project?.name)) } catch {}
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!newEmail.trim()) return; setAdding(true)
    try {
      const r = await unifiedService.addMember(projectId, newEmail.trim(), newRole)
      if (r.success) { setNewEmail(''); setNewRole('viewer'); await loadMembers() } else alert(r.message || 'Erro')
    } catch (e) { alert(`Erro: ${e instanceof Error ? e.message : 'Erro'}`) } finally { setAdding(false) }
  }

  const handleUpdateRole = async (email: string, role: string) => {
    try { await unifiedService.updateMemberRole(projectId, members, email, role); await loadMembers() }
    catch (e) { alert(`Erro: ${e instanceof Error ? e.message : 'Erro'}`) }
  }

  const handleRemove = async (email: string) => {
    if (!confirm(`Remover ${email}?`)) return
    try { await unifiedService.removeMember(projectId, email); await loadMembers() }
    catch (e) { alert(`Erro: ${e instanceof Error ? e.message : 'Erro'}`) }
  }

  const handleDelete = async () => {
    if (!confirm('ATENÇÃO: Esta ação é permanente e apagará todos os relatórios. Deseja continuar?')) return
    try { await unifiedService.deleteProject(projectId); sessionStorage.removeItem('selected_project'); router.push('/dashboard') }
    catch (e) { alert(`Erro: ${e instanceof Error ? e.message : 'Erro'}`) }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/project/${projectId}`
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const isMe = (email: string) => String(email).toLowerCase() === String(user?.email || '').toLowerCase()
  const isOwner = project?.role === 'owner'
  const roleIcon = (r: string) => r === 'owner' ? <Crown className="w-3.5 h-3.5" /> : r === 'editor' ? <Shield className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />
  const roleColor = (r: string) => r === 'owner' ? 'text-rose-500' : r === 'editor' ? 'text-emerald-500' : 'text-blue-500'

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="dashboard" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      {/* LAYOUT FIX: Same pattern as project details page — flex-1 ml-16 p-6 with inner max-w */}
      <main className="flex-1 ml-16 p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Nav — same style as project details */}
          <nav className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between mb-6 border border-gray-200 shadow-sm">
            <button onClick={() => router.push(`/project/${projectId}`)} className="flex items-center gap-2 text-gray-500 hover:text-[#011334] font-bold text-xs uppercase tracking-widest bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold" style={{ color: BRAND.primary }}>Configurações</h2>
              {project ? <p className="text-[10px] text-gray-400 mt-0.5">{project.name}</p> : null}
            </div>
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200">
              <Settings className="w-4 h-4" />
            </div>
          </nav>

          {/* Share Link Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-500"><Share2 className="w-5 h-5" /></div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: BRAND.primary }}>Compartilhar Projeto</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Copie o link para compartilhar com outros membros</p>
              </div>
            </div>
            <button onClick={handleShare}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'}`}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Copy className="w-3.5 h-3.5" /> Copiar Link</>}
            </button>
          </div>

          {/* Gestão de Acessos */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-4">
            <div className="flex items-center gap-3 mb-5 border-b border-gray-100 pb-4">
              <div className="p-2 rounded-xl" style={{ background: `${BRAND.primary}10`, color: BRAND.primary }}><Users className="w-5 h-5" /></div>
              <div>
                <h3 className="text-base font-bold" style={{ color: BRAND.primary }}>Gestão de Acessos</h3>
                <p className="text-xs text-gray-400">Adicione, edite ou remova membros do projeto</p>
              </div>
            </div>

            {/* Add member form */}
            {isOwner ? (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">E-mail do novo membro</label>
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="usuario@empresa.com.br"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#011334]/30 focus:ring-2 focus:ring-[#011334]/10"
                      onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
                  </div>
                  <div className="w-full sm:w-36">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Acesso</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none appearance-none cursor-pointer">
                      <option value="viewer">Leitor</option>
                      <option value="editor">Editor</option>
                      <option value="owner">Admin</option>
                    </select>
                  </div>
                  <button onClick={handleAdd} disabled={adding || !newEmail.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg text-xs font-bold disabled:opacity-50 whitespace-nowrap"
                    style={{ background: BRAND.primary }}>
                    {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />} Adicionar
                  </button>
                </div>
              </div>
            ) : null}

            {/* Members list */}
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND.primary }} /></div>
            ) : members.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Nenhum membro encontrado.</p>
            ) : (
              <div className="space-y-2">
                {members.map(m => {
                  const me = isMe(m.email)
                  const r = (m.role || 'viewer').toLowerCase()
                  return (
                    <div key={m.email} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-3.5 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: BRAND.primary }}>
                          {(m.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2" style={{ color: BRAND.primary }}>
                            {m.email}
                            {me ? <span className="text-[9px] bg-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase tracking-widest">Você</span> : null}
                          </p>
                          {m.added_at ? <p className="text-[10px] text-gray-400">Adicionado em {new Date(m.added_at).toLocaleDateString('pt-BR')}</p> : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwner && !me ? (
                          <>
                            <select value={r} onChange={e => handleUpdateRole(m.email, e.target.value)}
                              className={`bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest appearance-none cursor-pointer ${roleColor(r)}`}>
                              <option value="viewer">Leitor</option>
                              <option value="editor">Editor</option>
                              <option value="owner">Admin</option>
                            </select>
                            <button onClick={() => handleRemove(m.email)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-white rounded-lg border border-gray-200 flex items-center gap-1.5 ${roleColor(r)}`}>
                            {roleIcon(r)} {r === 'owner' ? 'Admin' : r === 'editor' ? 'Editor' : 'Leitor'}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          {isOwner ? (
            <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 text-red-500 rounded-xl"><AlertTriangle className="w-5 h-5" /></div>
                <h3 className="text-base font-bold text-red-600">Zona de Perigo</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">A exclusão é permanente e apagará todos os relatórios e dados do projeto.</p>
              <button onClick={handleDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Excluir Projeto Permanentemente
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
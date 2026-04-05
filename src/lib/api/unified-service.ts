// src/lib/api/unified-service.ts
// Contrato COMPLETO extraído de /openapi.json do backend refatorado
// 21 endpoints documentados

import { getApiUrl } from '@/lib/config'

// ── Tipos ──────────────────────────────────────────────────────────────────

export interface UserContext { name: string; email: string; empresa: string }

export interface ProjectSummary {
  id: string; name: string; description: string
  role: 'owner' | 'editor' | 'viewer'
  latest_reports: Record<string, string>
  members?: MemberInfo[]; created_at?: string
}

export interface GroupInfo { id: string; name: string }
export interface MemberInfo { email: string; role: string; user_id?: string; added_at?: string }
export interface HistoryItem { job_id: string; category: string; action: string; strategy?: string; created_at: string; status: string }
export interface LineageData { nodes: Array<{ id: string; label: string; type: string }>; edges: Array<{ source: string; target: string; type: string }> }
export interface ReportResponse { status: 'success' | 'processing' | 'Processing' | 'error'; report_data?: { report?: unknown; [key: string]: unknown }; message?: string }

// ── Helpers ────────────────────────────────────────────────────────────────

function getLoggedUser(): UserContext {
  if (typeof document === 'undefined') return { name: '', email: '', empresa: '' }
  const getCk = (n: string): string | null => {
    const v = `; ${document.cookie}`; const p = v.split(`; ${n}=`)
    if (p.length === 2) { const c = p.pop()?.split(';').shift(); return c ? decodeURIComponent(c) : null }
    return null
  }
  const ls = (k: string) => typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null
  return {
    name: getCk('peers_user_name') || ls('peers_user_name') || '',
    email: getCk('peers_user_email') || ls('peers_user_email') || '',
    empresa: getCk('peers_empresa') || ls('peers_empresa') || '',
  }
}

function parseLLMResponse(raw: unknown): unknown | null {
  try {
    if (typeof raw === 'object' && raw !== null) return raw
    const text = String(raw).trim()
    const s1 = text.indexOf('{'), s2 = text.indexOf('[')
    const start = Math.min(s1 > -1 ? s1 : 99999, s2 > -1 ? s2 : 99999)
    const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'))
    if (start !== 99999 && end > start) return JSON.parse(text.substring(start, end + 1))
    return null
  } catch { return null }
}

// ── Classe principal ───────────────────────────────────────────────────────

class UnifiedCodeAIService {
  private userCtx: UserContext | null = null
  get apiUrl(): string { return getApiUrl() }
  setUserContext(u: UserContext) { this.userCtx = u }
  getCurrentUser(): UserContext { return this.userCtx || getLoggedUser() }

  private async req<T>(ep: string, opts: RequestInit = {}, retries = 1): Promise<T> {
    const url = `${this.apiUrl}${ep}`
    for (let i = 0; i <= retries; i++) {
      try {
        const c = new AbortController(); const t = setTimeout(() => c.abort(), 20000)
        const r = await fetch(url, { ...opts, signal: c.signal, mode: 'cors', credentials: 'omit' })
        clearTimeout(t)
        if (!r.ok) { const e = await r.text().catch(() => ''); throw new Error(`HTTP ${r.status}: ${e}`) }
        return await r.json()
      } catch (e) { if (i === retries) throw e; await new Promise(w => setTimeout(w, 1000 * (i + 1))) }
    }
    throw new Error('Max retries')
  }

  private norm(raw: Record<string, unknown>): ProjectSummary {
    let lr: Record<string, string> = {}
    if (raw.latest_reports && typeof raw.latest_reports === 'object' && !Array.isArray(raw.latest_reports))
      lr = raw.latest_reports as Record<string, string>
    return {
      id: String(raw.project_id || raw._id || raw.id || ''),
      name: String(raw.project_name || raw.name || 'Projeto'),
      description: String(raw.description || ''),
      role: (String(raw.role || 'viewer').toLowerCase()) as 'owner' | 'editor' | 'viewer',
      latest_reports: lr,
      members: Array.isArray(raw.members) ? raw.members as MemberInfo[] : undefined,
      created_at: raw.created_at ? String(raw.created_at) : undefined,
    }
  }

  // ── AUTH: POST /auth/login { email, empresa } ──────────────────────────
  async login(email: string, empresa: string): Promise<{ success: boolean; message: string; empresa: string }> {
    try {
      const data = await this.req<{ message: string; email: string; empresa: string }>('/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, empresa }),
      })
      return { success: true, message: data.message, empresa: data.empresa }
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Erro', empresa }
    }
  }

  // ── PROJECTS ───────────────────────────────────────────────────────────
  async getProjects(): Promise<ProjectSummary[]> {
    const u = this.getCurrentUser()
    const d = await this.req<Record<string, unknown>>(`/projects/list?email=${encodeURIComponent(u.email)}`, { method: 'GET', headers: { Accept: 'application/json' } })
    let list: Record<string, unknown>[] = []
    if (Array.isArray(d)) list = d as Record<string, unknown>[]
    else if (d.projects && Array.isArray(d.projects)) list = d.projects as Record<string, unknown>[]
    return list.map(p => this.norm(p))
  }

  async getProjectDetails(pid: string): Promise<ProjectSummary | null> {
    const u = this.getCurrentUser()
    try {
      const d = await this.req<Record<string, unknown>>(`/projects/${pid}?email=${encodeURIComponent(u.email)}`, { method: 'GET', headers: { Accept: 'application/json' } })
      return this.norm(d)
    } catch { return null }
  }

  // ── GROUPS ─────────────────────────────────────────────────────────────
  async getUserGroups(): Promise<GroupInfo[]> {
    const u = this.getCurrentUser()
    const d = await this.req<{ groups?: GroupInfo[] }>(`/groups/user-groups?email=${encodeURIComponent(u.email)}`, { method: 'GET', headers: { Accept: 'application/json' } })
    return d.groups || []
  }

  // ── ANALYSIS ───────────────────────────────────────────────────────────
  async startAnalysis(p: {
    email: string; nome_projeto: string; category: string; action: 'generator' | 'reviwer'
    strategy?: string; assigned_group_id?: string; comentario_extra?: string
    arquivo_docx?: File; arquivo_identidade?: File; base_job_id?: string
    company_template?: string
  }): Promise<{ job_id: string; project_id?: string }> {
    const fd = new FormData()
    fd.append('email', p.email); fd.append('nome_projeto', p.nome_projeto)
    fd.append('category', p.category); fd.append('action', p.action)
    fd.append('strategy', p.strategy || 'checkout')
    if (p.comentario_extra) fd.append('comentario_extra', p.comentario_extra)
    if (p.assigned_group_id) fd.append('assigned_group_id', p.assigned_group_id)
    if (p.company_template) fd.append('company_template', p.company_template)
    if (p.arquivo_docx) fd.append('arquivo_docx', p.arquivo_docx)
    if (p.arquivo_identidade) fd.append('arquivo_identidade', p.arquivo_identidade)
    if (p.base_job_id) fd.append('base_job_id', p.base_job_id)
    const r = await fetch(`${this.apiUrl}/analysis/start`, { method: 'POST', mode: 'cors', credentials: 'omit', body: fd })
    if (!r.ok) { let m = `HTTP ${r.status}`; try { const j = await r.json(); if (j.detail) m = String(j.detail) } catch {}; throw new Error(m) }
    return r.json()
  }

  // ── REPORTS ────────────────────────────────────────────────────────────
  async getReport(pid: string, jid: string, cat?: string): Promise<ReportResponse> {
    const u = this.getCurrentUser()
    let url = `/session/project/${pid}/${jid}/reports?email=${encodeURIComponent(u.email)}`
    if (cat === 'prototype') url += '&filename=index.html'
    return this.req<ReportResponse>(url, { method: 'GET', headers: { Accept: 'application/json' } })
  }

  async pollReport(pid: string, jid: string, cat: string, onProg?: (step: string, pct: number) => void, max = 60, ms = 8000): Promise<{ data: unknown; isRaw: boolean }> {
    const steps = ['Conectando aos agentes...', 'Agentes analisando...', 'Processando resultados...', 'Compilando relatório...', 'Finalizando...']
    for (let i = 0; i < max; i++) {
      const stepIdx = Math.min(Math.floor(i / (max / steps.length)), steps.length - 1)
      const pct = Math.min(Math.floor((i / max) * 100), 95)
      onProg?.(steps[stepIdx], pct)
      try {
        const r = await this.getReport(pid, jid, cat)
        if (r.status === 'processing' || r.status === 'Processing') { await new Promise(w => setTimeout(w, ms)); continue }
        if (r.status === 'success') {
          onProg?.('Concluído!', 100)
          const raw = r.report_data?.report || r.report_data
          if (cat === 'prototype') return { data: typeof raw === 'string' ? raw : JSON.stringify(raw), isRaw: true }
          const p = parseLLMResponse(raw)
          return p ? { data: p, isRaw: false } : { data: typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2), isRaw: true }
        }
        throw new Error(r.message || 'Erro')
      } catch (e) { if (i === max - 1) throw e; await new Promise(w => setTimeout(w, ms)) }
    }
    throw new Error('Timeout — agentes demoraram além do esperado')
  }

  // ── HISTORY ────────────────────────────────────────────────────────────
  async getReportHistory(pid: string, cat: string): Promise<HistoryItem[]> {
    const u = this.getCurrentUser()
    const d = await this.req<{ history?: HistoryItem[] }>(`/projects/${pid}/reports/history?category=${encodeURIComponent(cat)}&email=${encodeURIComponent(u.email)}`, { method: 'GET', headers: { Accept: 'application/json' } })
    return d.history || []
  }

  async restoreVersion(pid: string, jid: string): Promise<{ new_state?: Record<string, string> }> {
    const fd = new FormData(); fd.append('project_id', pid); fd.append('job_id', jid)
    const r = await fetch(`${this.apiUrl}/analysis/restore`, { method: 'POST', mode: 'cors', credentials: 'omit', body: fd })
    if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json()
  }

  // ── LINEAGE ────────────────────────────────────────────────────────────
  async getLineage(pid: string): Promise<LineageData | null> {
    try {
      const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 10000)
      const r = await fetch(`${this.apiUrl}/analysis/lineage/${pid}`, { method: 'GET', mode: 'cors', credentials: 'omit', signal: ctrl.signal, headers: { Accept: 'application/json' } })
      clearTimeout(t)
      if (!r.ok) return null
      return await r.json()
    } catch { return null }
  }

  // ── MEMBERS ────────────────────────────────────────────────────────────
  async getProjectMembers(pid: string, pname?: string): Promise<MemberInfo[]> {
    const u = this.getCurrentUser()
    try {
      const d = await this.req<{ projects?: Record<string, unknown>[] }>(`/projects/owned?email=${encodeURIComponent(u.email)}`, { method: 'GET', headers: { Accept: 'application/json' } })
      const f = (d.projects || []).find((p: Record<string, unknown>) => String(p.project_id || p._id || p.id) === pid || String(p.name) === pname)
      return f && Array.isArray(f.members) ? f.members as MemberInfo[] : []
    } catch { return [] }
  }

  async addMember(pid: string, email: string, role: string): Promise<{ success: boolean; message?: string }> {
    const u = this.getCurrentUser()
    return this.req('/projects/members', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ requester_email: u.email, project_id: pid, new_member_email: email, role }) })
  }

  async updateMemberRole(pid: string, all: MemberInfo[], target: string, newRole: string): Promise<{ success: boolean }> {
    const u = this.getCurrentUser()
    const updated = all.map(m => m.email === target ? { ...m, role: newRole } : m)
    return this.req('/projects/members', { method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ requester_email: u.email, project_id: pid, members: updated }) })
  }

  async removeMember(pid: string, target: string): Promise<{ success: boolean }> {
    const u = this.getCurrentUser()
    const r = await fetch(`${this.apiUrl}/projects/members/${encodeURIComponent(target)}`, { method: 'DELETE', mode: 'cors', credentials: 'omit', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ requester_email: u.email, project_id: pid, target_email: target }) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json()
  }

  async deleteProject(pid: string): Promise<void> {
    const u = this.getCurrentUser()
    const r = await fetch(`${this.apiUrl}/projects/delete`, { method: 'DELETE', mode: 'cors', credentials: 'omit', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ requester_email: u.email, project_id: pid }) })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  }

  // ── GROUPS CRUD ────────────────────────────────────────────────────────
  async getCompanyGroups(companyId: string): Promise<Record<string, unknown>[]> {
    try { return await this.req<Record<string, unknown>[]>(`/groups/groups?company_id=${encodeURIComponent(companyId)}`, { method: 'GET', headers: { Accept: 'application/json' } }) } catch { return [] }
  }

  async createGroup(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.req('/groups/groups', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
  }

  async updateGroup(groupId: string, data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.req(`/groups/groups/${groupId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
  }

  async deleteGroup(groupId: string): Promise<void> {
    const r = await fetch(`${this.apiUrl}/groups/groups/${groupId}`, { method: 'DELETE', mode: 'cors', credentials: 'omit', headers: { Accept: 'application/json' } })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  }

  async getGroupTemplates(groupId: string): Promise<string[]> {
    try { const d = await this.req<{ templates?: string[] }>(`/groups/${groupId}/templates`, { method: 'GET', headers: { Accept: 'application/json' } }); return d.templates || [] } catch { return [] }
  }

  // ── VALIDATE & SUPPORT ─────────────────────────────────────────────────
  async validateAction(pid: string, action: string, category: string): Promise<{ valid: boolean; message?: string }> {
    const u = this.getCurrentUser()
    try {
      return await this.req(`/projects/${pid}/actions/validate?email=${encodeURIComponent(u.email)}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ action, category }) })
    } catch { return { valid: true } }
  }

  async forceUpdateLatest(pid: string, category: string, jobId: string): Promise<Record<string, unknown>> {
    return this.req('/analysis/support/force-update-latest', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ project_id: pid, category, job_id: jobId }) })
  }

  async getReportLineage(pid: string, jobId: string, category: string): Promise<Record<string, unknown> | null> {
    const u = this.getCurrentUser()
    try { return await this.req(`/projects/${pid}/reports/${jobId}/lineage?email=${encodeURIComponent(u.email)}&category=${category}`, { method: 'GET', headers: { Accept: 'application/json' } }) } catch { return null }
  }

  // ── PROJECT DETAILS (full) ──────────────────────────────────────────────
  async getProjectFull(pid: string): Promise<Record<string, unknown> | null> {
    const u = this.getCurrentUser()
    try { return await this.req(`/projects/${pid}?email=${encodeURIComponent(u.email)}`, { method: 'GET', headers: { Accept: 'application/json' } }) } catch { return null }
  }

  // ── Utils ──────────────────────────────────────────────────────────────
  detectProjectType(p: ProjectSummary): 'prototype' | 'organization' {
    const lr = p.latest_reports || {}
    // Se tem épicos, features, timeline ou risks → é organization (mesmo que tenha prototype)
    if (lr.epics || lr.features || lr.timeline || lr.risks) return 'organization'
    // Se tem APENAS prototype → é prototype-only
    if (lr.prototype) return 'prototype'
    // Sem nada → checa o grupo atribuído pelo nome
    const gname = String((p as unknown as Record<string, unknown>).assigned_group_name || (p as unknown as Record<string, unknown>).group_name || '').toLowerCase()
    if (gname.includes('prototype') || gname.includes('protótipo') || gname.includes('prototipo')) return 'prototype'
    return 'organization'
  }
  getCategories(t: 'prototype' | 'organization'): string[] { return t === 'prototype' ? ['prototype', 'tree'] : ['epics', 'features', 'timeline', 'risks', 'prototype', 'tree'] }
}

export const unifiedService = new UnifiedCodeAIService()
export default unifiedService
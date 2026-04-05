// src/components/project/epic-prototype.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { BRAND } from '@/components/layout/sidebar'
import { getApiUrl } from '@/lib/config'
import { showToast } from '@/components/project/toast'
import { Sparkles, Loader2, X, Upload, Download, MonitorCheck, RefreshCw, FileText, Check, ExternalLink } from 'lucide-react'

export interface EpicProtoState {
  jobId: string
  status: 'loading' | 'done' | 'error'
  content?: string
}

interface EpicPrototypeModalProps {
  projectId: string
  projectName: string
  userEmail: string
  epicId: string
  baseJobId: string | undefined
  assignedGroupId?: string
  onClose: () => void
  onStarted: (epicId: string, jobId: string) => void
}

export function EpicPrototypeModal({ projectId, projectName, userEmail, epicId, baseJobId, assignedGroupId, onClose, onStarted }: EpicPrototypeModalProps) {
  const [templates, setTemplates] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTemplates = async () => {
    try {
      // assignedGroupId pode não existir — busca grupos do usuário e pega templates dos grupos de protótipo
      if (assignedGroupId) {
        const r = await fetch(`${getApiUrl()}/groups/${assignedGroupId}/templates`)
        if (r.ok) { const d = await r.json(); if (d.templates?.length) { setTemplates(d.templates); setLoadingTemplates(false); return } }
      }
      // Fallback: busca todos os grupos do usuário e pega templates de todos
      const r2 = await fetch(`${getApiUrl()}/groups/user-groups?email=${encodeURIComponent(userEmail)}`)
      if (r2.ok) {
        const d2 = await r2.json()
        const groups = d2.groups || d2 || []
        const allTemplates = new Set<string>()
        for (const g of groups) {
          try {
            const rt = await fetch(`${getApiUrl()}/groups/${g.id}/templates`)
            if (rt.ok) { const td = await rt.json(); (td.templates || []).forEach((t: string) => allTemplates.add(t)) }
          } catch {}
        }
        setTemplates(Array.from(allTemplates))
      }
    } catch {} finally { setLoadingTemplates(false) }
  }

  const handleSubmit = async () => {
    if (!baseJobId) { showToast('Gere os épicos primeiro.', 'error'); return }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('email', userEmail)
      fd.append('nome_projeto', projectName)
      fd.append('category', 'prototype')
      fd.append('action', 'fromepic')
      fd.append('strategy', 'checkout')
      fd.append('base_job_id', baseJobId)
      fd.append('target_epic_id', epicId)
      if (selectedTemplate) fd.append('company_template', selectedTemplate)
      if (prompt) fd.append('comentario_extra', prompt)
      if (file) fd.append('arquivo_docx', file)

      const r = await fetch(`${getApiUrl()}/analysis/start`, { method: 'POST', body: fd })
      if (!r.ok) throw new Error(`Status ${r.status}`)
      const d = await r.json()
      onStarted(epicId, d.job_id)
      onClose()
      showToast(`Gerando protótipo para ${epicId}...`, 'success')
    } catch (e) {
      showToast(`Erro: ${e instanceof Error ? e.message : 'Erro'}`, 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: BRAND.primary }}>Gerar Protótipo — {epicId}</h3>
            <p className="text-[10px] text-gray-400 mt-0.5">Tela interativa a partir deste épico</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Template selector */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Template</label>
            {loadingTemplates ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
            ) : (
              <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none cursor-pointer">
                <option value="">Padrão Code.IA (IA Livre)</option>
                {templates.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            )}
          </div>

          {/* Prompt */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Instruções (opcional)</label>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Descreva ajustes visuais, comportamentos..."
              className="w-full h-24 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" />
          </div>

          {/* File */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Documento (opcional)</label>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-fit">
              <Upload className="w-3.5 h-3.5" /> {file ? file.name : 'Anexar documento'}
              <input type="file" accept=".docx,.pdf,.txt" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
            {file ? <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500 ml-2 text-xs">✕ remover</button> : null}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-50" style={{ background: BRAND.primary }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Enviando...' : 'Gerar Tela Mágica'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Inline component shown inside expanded epic accordion
export function EpicPrototypeInline({ epicId, projectId, projectName, userEmail, state, onGenerate, onDownload }: {
  epicId: string
  projectId: string
  projectName?: string
  userEmail?: string
  state?: EpicProtoState
  onGenerate: (epicId: string) => void
  onDownload: (epicId: string) => void
}) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const content = state?.content
    if (!content) return
    // Save to API route
    try {
      await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, html: content, projectName: projectName || 'Projeto', createdBy: userEmail || '', epicId })
      })
    } catch {}
    // Build URL and copy
    const url = `${window.location.origin}/preview/${projectId}?epic=${encodeURIComponent(epicId)}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => { setShared(true); setTimeout(() => setShared(false), 2500) })
    } else { prompt('Copie o link:', url) }
    // Open in new tab
    window.open(url, '_blank')
  }

  if (!state) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button onClick={() => onGenerate(epicId)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl text-[10px] font-bold hover:bg-purple-100 transition-all">
          <Sparkles className="w-3.5 h-3.5" /> Gerar Protótipo deste Épico
        </button>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        <div>
          <p className="text-xs font-bold text-blue-700">Gerando protótipo...</p>
          <p className="text-[10px] text-blue-500">Os agentes estão criando a interface</p>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
        <span className="text-xs text-red-600">Erro ao gerar</span>
        <button onClick={() => onGenerate(epicId)} className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Tentar Novamente</button>
      </div>
    )
  }

  // Done - show iframe + share + download
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><MonitorCheck className="w-4 h-4 text-purple-500" /><span className="text-xs font-bold text-purple-700">Protótipo Disponível</span></div>
        <div className="flex gap-2">
          <button onClick={handleShare} className={`text-[10px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${shared ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'text-emerald-500 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}>
            {shared ? <><Check className="w-3 h-3" /> Copiado!</> : <><ExternalLink className="w-3 h-3" /> Compartilhar</>}
          </button>
          <button onClick={() => onGenerate(epicId)} className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Novo</button>
          <button onClick={() => onDownload(epicId)} className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-1"><Download className="w-3 h-3" /> Download</button>
        </div>
      </div>
      {state.content ? (
        <div className="w-full h-[300px] rounded-xl border border-gray-200 overflow-hidden">
          <iframe srcDoc={state.content} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin" />
        </div>
      ) : null}
    </div>
  )
}

// Polling function — call from parent
export async function pollEpicPrototype(
  projectId: string,
  epicId: string,
  jobId: string,
  userEmail: string,
  onUpdate: (epicId: string, state: EpicProtoState) => void
) {
  try {
    const r = await fetch(`${getApiUrl()}/session/project/${projectId}/${jobId}/reports?email=${encodeURIComponent(userEmail)}&filename=index.html`)
    const d = await r.json()
    if (r.status === 202 || d.status === 'processing' || d.status === 'Processing') {
      setTimeout(() => pollEpicPrototype(projectId, epicId, jobId, userEmail, onUpdate), 10000)
    } else if (r.status === 200 && d.status === 'success') {
      const html = d.report_data?.report || d.report_data
      onUpdate(epicId, { jobId, status: 'done', content: typeof html === 'string' ? html : JSON.stringify(html) })
    } else {
      onUpdate(epicId, { jobId, status: 'error' })
    }
  } catch {
    onUpdate(epicId, { jobId, status: 'error' })
  }
}
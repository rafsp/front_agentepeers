// src/app/preview/[id]/page.tsx
// Rota PUBLICA — qualquer pessoa com o link pode ver o prototipo
// Fluxo: API Route local (sem auth) -> Backend API (com auth) -> Tela de login
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, AlertTriangle, ExternalLink, Maximize2, Minimize2, Code, Check, LogIn, Smartphone, Monitor } from 'lucide-react'
import { getApiUrl } from '@/lib/config'

const PEERS_LOGO = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

function PreviewContent() {
  const params = useParams()
  const projectId = params.id as string

  const [html, setHtml] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'full' | 'mobile'>('full')

  useEffect(() => { loadPrototype() }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPrototype = async () => {
    setLoading(true); setError(null)

    // Strategy 1: Local API Route (works for everyone, no auth needed)
    try {
      const res = await fetch(`/api/preview/${projectId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.html && data.html.length > 50) {
          setHtml(data.html)
          setProjectName(data.projectName || 'Prototipo')
          setLoading(false)
          return
        }
      }
    } catch { /* API route not available, try next */ }

    // Strategy 2: Backend API (only works if user is logged in)
    const email = typeof localStorage !== 'undefined' ? localStorage.getItem('peers_user_email') || '' : ''
    if (email) {
      try {
        const API = getApiUrl()
        const projRes = await fetch(`${API}/projects/${projectId}?email=${encodeURIComponent(email)}`)
        if (projRes.ok) {
          const d = await projRes.json()
          setProjectName(String(d.project_name || d.name || ''))
          const jobId = d.latest_reports?.prototype
          if (jobId) {
            const reportRes = await fetch(`${API}/session/project/${projectId}/${jobId}/reports?email=${encodeURIComponent(email)}`)
            if (reportRes.ok) {
              const rd = (await reportRes.json()).report_data || {}
              const htmlContent = typeof rd === 'string' ? rd : (typeof rd.report === 'string' ? rd.report : '')
              if (htmlContent.length > 50) {
                setHtml(htmlContent)
                // Cache for next visitors
                try { await fetch('/api/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, html: htmlContent, projectName: d.project_name || d.name, createdBy: email }) }) } catch {}
                setLoading(false)
                return
              }
            }
          }
        }
      } catch { /* backend failed */ }
    }

    // Strategy 3: Nothing worked
    setError('Este prototipo ainda nao foi compartilhado ou o link e invalido.')
    setLoading(false)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) document.documentElement.requestFullscreen?.()
    else document.exitFullscreen?.()
    setIsFullscreen(!isFullscreen)
  }

  const copyLink = () => {
    const url = window.location.href
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    } else { prompt('Copie o link:', url) }
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center bg-[#011334] shadow-lg">
          {!logoError ? <img src={PEERS_LOGO} alt="PEERS" className="w-12 h-12 object-contain" onError={() => setLogoError(true)} /> : <Code className="w-8 h-8 text-white" />}
        </div>
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#011334]" />
        <p className="text-sm text-gray-500 font-medium">Carregando prototipo...</p>
        <p className="text-[10px] text-gray-400 mt-1">PEERS Code.IA</p>
      </div>
    </div>
  )

  // ── Error ───────────────────────────────────────────────────────────────
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-sm bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-[#011334]">
          {!logoError ? <img src={PEERS_LOGO} alt="PEERS" className="w-10 h-10 object-contain" onError={() => setLogoError(true)} /> : <Code className="w-6 h-6 text-white" />}
        </div>
        <h2 className="text-lg font-bold text-[#011334] mb-2">Prototipo Indisponivel</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <div className="space-y-2">
          <button onClick={loadPrototype} className="w-full px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">Tentar Novamente</button>
          <a href={`/login?redirect=${encodeURIComponent('/preview/' + projectId)}`}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#011334] text-white rounded-xl text-sm font-bold hover:bg-[#011334]/90">
            <LogIn className="w-4 h-4" /> Entrar para acessar
          </a>
        </div>
        <p className="text-[10px] text-gray-400 mt-6">PEERS Code.IA — Plataforma de Analise Inteligente</p>
      </div>
    </div>
  )

  // ── Preview ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Header */}
      {!isFullscreen ? (
        <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#011334]">
              {!logoError ? <img src={PEERS_LOGO} alt="PEERS" className="w-5 h-5 object-contain" onError={() => setLogoError(true)} /> : <Code className="w-4 h-4 text-white" />}
            </div>
            <div>
              <p className="text-sm font-bold text-[#011334]">{projectName || 'Prototipo'}</p>
              <p className="text-[10px] text-gray-400">PEERS Code.IA — Prototipo Interativo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Device toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('full')} className={`p-1.5 rounded-md transition-all ${viewMode === 'full' ? 'bg-white shadow-sm text-[#011334]' : 'text-gray-400'}`} title="Desktop"><Monitor className="w-3.5 h-3.5" /></button>
              <button onClick={() => setViewMode('mobile')} className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-[#011334]' : 'text-gray-400'}`} title="Mobile"><Smartphone className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={copyLink} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {copied ? <><Check className="w-3 h-3" /> Copiado!</> : <><ExternalLink className="w-3 h-3" /> Copiar Link</>}
            </button>
            <button onClick={toggleFullscreen} className="px-3 py-1.5 bg-[#011334] text-white rounded-lg text-[10px] font-bold hover:bg-[#011334]/90 flex items-center gap-1">
              <Maximize2 className="w-3 h-3" /> Tela Cheia
            </button>
          </div>
        </header>
      ) : null}

      {/* Content area */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-0">
        {html ? (
          viewMode === 'mobile' ? (
            <div className="my-4 mx-auto" style={{ width: 390, maxWidth: '100%' }}>
              <div className="bg-black rounded-[2.5rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2rem] overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
                  <iframe srcDoc={html} className="w-full h-full border-none" sandbox="allow-scripts allow-same-origin allow-popups allow-forms" title={projectName} />
                </div>
              </div>
            </div>
          ) : (
            <iframe srcDoc={html} className="w-full h-full border-none bg-white" style={{ minHeight: isFullscreen ? '100vh' : 'calc(100vh - 52px)' }} sandbox="allow-scripts allow-same-origin allow-popups allow-forms" title={projectName} />
          )
        ) : null}
      </div>

      {/* Fullscreen exit button */}
      {isFullscreen ? (
        <button onClick={toggleFullscreen} className="fixed top-4 right-4 z-50 px-3 py-1.5 bg-black/70 text-white rounded-lg text-[10px] font-bold hover:bg-black/90 flex items-center gap-1 backdrop-blur-sm">
          <Minimize2 className="w-3 h-3" /> ESC
        </button>
      ) : null}
    </div>
  )
}

export default function PreviewPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#011334]" /></div>}>
    <PreviewContent />
  </Suspense>
}
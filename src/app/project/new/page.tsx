// src/app/project/new/page.tsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, BRAND } from '@/components/layout/sidebar'
import { useAuth } from '@/hooks/use-auth'
import unifiedService, { type GroupInfo, type ProjectSummary } from '@/lib/api/unified-service'
import { extractTextFromFiles, buildCommentExtra, type ExtractedFile } from '@/lib/utils/file-extractor'
import {
  ArrowLeft, FolderPlus, Upload, FileText, Loader2, X, Sparkles,
  CheckCircle, Circle, Bot, AlertCircle, File, Plus, Trash2,
} from 'lucide-react'

const ACCEPTED_TYPES = '.docx,.pdf,.txt'

const CREATION_STEPS = [
  { label: 'Validando dados', desc: 'Verificando campos e permissões' },
  { label: 'Extraindo documentos', desc: '' },
  { label: 'Enviando ao servidor', desc: '' },
  { label: 'Agentes iniciados', desc: 'IA analisando o escopo' },
  { label: 'Carregando projeto', desc: 'Sincronizando workspace' },
]

function fmtSize(b: number): string { if (b < 1024) return `${b} B`; if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`; return `${(b / 1048576).toFixed(1)} MB` }

export default function NewProjectPage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()

  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [projectName, setProjectName] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [selectedGroupName, setSelectedGroupName] = useState('')
  const [contextText, setContextText] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileIdentidade, setFileIdentidade] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [creationStep, setCreationStep] = useState(0)
  const [creationStepDesc, setCreationStepDesc] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDragging, setIsDragging] = useState(false)
  const [extractionResults, setExtractionResults] = useState<ExtractedFile[]>([])
  const hasLoaded = useRef(false)

  const isProto = selectedGroupName.toLowerCase().includes('prototype') || selectedGroupName.toLowerCase().includes('protótipo')
  const hasFiles = files.length > 0
  const needsInstructions = !hasFiles && !contextText.trim()

  useEffect(() => {
    if (authLoading) return
    if (!user?.email) { router.push('/login'); return }
    if (hasLoaded.current) return
    hasLoaded.current = true
    loadGroups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading])

  const loadGroups = async () => {
    setLoadingGroups(true)
    try { setGroups(await unifiedService.getUserGroups()) } catch {}
    finally { setLoadingGroups(false) }
  }

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroupId(e.target.value)
    const g = groups.find(gr => gr.id === e.target.value)
    setSelectedGroupName(g?.name || '')
    setErrors(prev => ({ ...prev, group: '' }))
  }

  // ── Multi-file handling ─────────────────────────────────────────────────

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter(f =>
      f.name.match(/\.(docx|pdf|txt)$/i) || ['application/pdf', 'text/plain'].includes(f.type) || f.type.includes('wordprocessingml')
    )
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      const unique = arr.filter(f => !existing.has(f.name + f.size))
      return [...prev, ...unique]
    })
  }

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx))

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }, [])
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files) }, [])

  // ── Validação ───────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!projectName.trim()) e.name = 'Nome do projeto é obrigatório'
    if (!selectedGroupId) e.group = 'Selecione uma especialidade'
    if (needsInstructions) e.context = 'Sem documentos, as instruções são obrigatórias'
    setErrors(e); return Object.keys(e).length === 0
  }

  // ── Submit com extração ─────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate() || !user?.email) return
    setSubmitting(true); setCreationStep(0); setExtractionResults([])

    const cat = isProto ? 'prototype' : 'epics'

    try {
      // Step 1: Extracting text from documents
      let combinedText = ''
      if (files.length > 0) {
        setCreationStep(1)
        setCreationStepDesc(`Extraindo texto de ${files.length} documento(s)...`)

        const { combinedText: extracted, results } = await extractTextFromFiles(
          files,
          (cur: number, total: number, name: string) => {
            setCreationStepDesc(`Extraindo ${name} (${cur}/${total})...`)
          }
        )
        setExtractionResults(results)
        combinedText = extracted

        const successCount = results.filter(r => !r.error && r.text.trim()).length
        const totalChars = results.reduce((sum, r) => sum + r.text.length, 0)
        console.log(`📄 Extração: ${successCount}/${files.length} documentos, ${totalChars} caracteres`)

        // Fallback: if extraction failed, at least mention file names
        if (!combinedText.trim() && files.length > 0) {
          const fileNames = files.map(f => f.name).join(', ')
          const failedNote = results.filter(r => r.error).map(r => `${r.name}: ${r.error}`).join('; ')
          combinedText = `[DOCUMENTOS ANEXADOS: ${fileNames}]\n[NOTA: Extração de texto falhou no browser (${failedNote}). O arquivo principal foi enviado como anexo para processamento pelo backend.]`
        }
      }

      // Step 2: Build comentario_extra with extracted text + user instructions
      const finalComment = buildCommentExtra(combinedText, contextText)

      // Step 3: Send to API
      setCreationStep(2)
      setCreationStepDesc(files.length > 0 ? `Enviando ${files.length} documento(s)...` : 'Enviando dados...')

      // Send first uploadable file as arquivo_docx for backend processing
      const firstDocx = files.length > 0 ? (files.find(f => f.name.endsWith('.docx')) || files.find(f => f.name.endsWith('.pdf')) || files[0]) : undefined

      const res = await unifiedService.startAnalysis({
        email: user.email, nome_projeto: projectName.trim(), category: cat,
        action: 'generator', strategy: 'checkout', assigned_group_id: selectedGroupId,
        comentario_extra: finalComment || undefined,
        arquivo_docx: firstDocx || undefined,
        arquivo_identidade: fileIdentidade || undefined,
      })

      // Step 4: Agents started
      setCreationStep(3)
      setCreationStepDesc('IA processando o escopo...')
      const projects = await unifiedService.getProjects()

      // Step 5: Loading project
      setCreationStep(4)
      setCreationStepDesc('Redirecionando...')
      const np = projects.find((p: ProjectSummary) => p.name === projectName.trim())
      if (np) {
        const enriched = { ...np, latest_reports: { ...np.latest_reports, [cat]: res.job_id } }
        sessionStorage.setItem('selected_project', JSON.stringify(enriched))
        try { localStorage.setItem(`codeai_pending_${np.id}_${cat}`, res.job_id) } catch {}
        await new Promise(r => setTimeout(r, 400))
        router.push(`/project/${np.id}`)
      } else router.push('/dashboard')
    } catch (e) {
      alert(`Erro: ${e instanceof Error ? e.message : 'Erro'}`)
      setSubmitting(false); setCreationStep(0)
    }
  }

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} /></div>

  // ── Creating progress ───────────────────────────────────────────────────

  if (submitting) return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="novo-projeto" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `${BRAND.primary}10` }}>
            <Bot className="w-8 h-8 animate-pulse" style={{ color: BRAND.primary }} />
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: BRAND.primary }}>Criando {projectName}</h2>
          {files.length > 0 ? <p className="text-[10px] text-emerald-500 font-medium mb-4 flex items-center justify-center gap-1"><CheckCircle className="w-3 h-3" /> {files.length} documento(s) sendo processado(s)</p>
            : <p className="text-xs text-gray-400 mb-4">Os agentes estão trabalhando</p>}
          <div className="space-y-2.5 text-left">
            {CREATION_STEPS.map((step, i) => {
              const isDone = i < creationStep; const isActive = i === creationStep
              const desc = isActive ? creationStepDesc || step.desc : step.desc
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDone ? 'bg-emerald-50 border-emerald-200' : isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
                  {isDone ? <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    : isActive ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: BRAND.primary }} />
                    : <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />}
                  <div>
                    <p className={`text-xs font-bold ${isDone ? 'text-emerald-700' : isActive ? 'text-[#011334]' : 'text-gray-400'}`}>{step.label}</p>
                    {desc ? <p className={`text-[10px] ${isDone ? 'text-emerald-500' : isActive ? 'text-gray-500' : 'text-gray-300'}`}>{desc}</p> : null}
                  </div>
                </div>
              )
            })}
          </div>
          {/* Show extraction results */}
          {extractionResults.length > 0 ? (
            <div className="mt-4 pt-4 border-t border-gray-100 text-left">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Documentos processados</p>
              {extractionResults.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] py-1">
                  {r.error ? <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0" /> : <CheckCircle className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                  <span className={r.error ? 'text-amber-600' : 'text-gray-600'}>{r.name}</span>
                  <span className="text-gray-300">{r.error ? `(${r.error})` : `(${r.text.length.toLocaleString()} chars)`}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )

  // ── Form ──────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeItem="novo-projeto" user={{ name: user?.name || '', email: user?.email || '' }} onLogout={logout} />
      <main className="flex-1 ml-16 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <nav className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between mb-6 border border-gray-200 shadow-sm">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-[#011334] font-bold text-xs uppercase tracking-widest bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl"><ArrowLeft className="w-4 h-4" /> Voltar</button>
            <h2 className="text-base font-bold uppercase tracking-wider" style={{ color: BRAND.primary }}>Novo Projeto</h2>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: BRAND.primary }}><FolderPlus className="w-4 h-4" /></div>
          </nav>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <h3 className="text-sm font-bold" style={{ color: BRAND.primary }}>Vamos começar o planejamento</h3>
              <p className="text-xs text-gray-400 mt-0.5">Faça upload de documentos ou descreva o projeto nas instruções.</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Nome */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Nome do Projeto *</label>
                <input type="text" value={projectName} onChange={e => { setProjectName(e.target.value); setErrors(prev => ({ ...prev, name: '' })) }}
                  placeholder="Ex: Sistema de Gestão" className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#011334]/10 ${errors.name ? 'border-red-300' : 'border-gray-200'}`} />
                {errors.name ? <p className="text-[10px] text-red-500 mt-1">{errors.name}</p> : null}
              </div>

              {/* Especialidade */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Especialidade (Grupo) *</label>
                {loadingGroups ? <div className="flex items-center gap-2 text-sm text-gray-400 py-3"><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</div>
                  : <select value={selectedGroupId} onChange={handleGroupChange} className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none appearance-none cursor-pointer ${errors.group ? 'border-red-300' : 'border-gray-200'}`} disabled={groups.length === 0}>
                      <option value="">Selecione...</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>}
                {errors.group ? <p className="text-[10px] text-red-500 mt-1">{errors.group}</p> : null}
                {isProto ? <p className="text-[10px] text-purple-500 mt-1 font-medium">🎨 Modo Protótipo</p> : null}
              </div>

              {/* Documentos — Multi-file Drag & Drop */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Documentos (opcional)</label>

                {/* File list */}
                {files.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {files.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="flex items-center gap-3 bg-emerald-50/60 border border-emerald-200 rounded-xl px-4 py-2.5">
                        <File className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{f.name}</p>
                          <p className="text-[10px] text-gray-400">{fmtSize(f.size)} • {f.name.split('.').pop()?.toUpperCase()}</p>
                        </div>
                        <button onClick={() => removeFile(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Drop zone */}
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`relative w-full border-2 border-dashed rounded-xl transition-all ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-[#011334]/30 hover:bg-gray-50'}`}>
                  <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {files.length > 0 ? <Plus className="w-5 h-5 text-gray-400" /> : <Upload className={`w-5 h-5 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{isDragging ? 'Solte os arquivos aqui' : files.length > 0 ? 'Adicionar mais documentos' : 'Clique ou arraste os arquivos aqui'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Suporta PDF, DOCX ou TXT — múltiplos arquivos</p>
                    <input type="file" accept={ACCEPTED_TYPES} multiple onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = '' }} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Identidade Visual (protótipo) */}
              {isProto ? (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Identidade Visual (.docx)</label>
                  <div className={`relative w-full border-2 border-dashed rounded-xl transition-all ${fileIdentidade ? 'border-purple-300 bg-purple-50/50' : 'border-purple-200 hover:border-purple-400'}`}>
                    {fileIdentidade ? (
                      <div className="flex items-center gap-3 p-4">
                        <File className="w-4 h-4 text-purple-600 flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-700 truncate">{fileIdentidade.name}</p></div>
                        <button onClick={() => setFileIdentidade(null)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-5 cursor-pointer"><Upload className="w-5 h-5 text-purple-300 mb-1" /><p className="text-[10px] text-gray-400">Diretrizes de UI/UX</p>
                        <input type="file" accept=".docx" onChange={e => setFileIdentidade(e.target.files?.[0] || null)} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Divider */}
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-200" /><span className="text-[10px] text-gray-400 font-medium">ou descreva o projeto</span><div className="flex-1 h-px bg-gray-200" /></div>

              {/* Instruções */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Instruções {!hasFiles ? '*' : '(opcional)'}</label>
                <textarea value={contextText} onChange={e => { setContextText(e.target.value); setErrors(prev => ({ ...prev, context: '' })) }}
                  placeholder="Descreva o projeto. Ex: Sistema de gestão de clientes com módulos de cadastro, vendas, relatórios..."
                  className={`w-full h-32 bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none resize-none ${errors.context ? 'border-amber-400 bg-amber-50/30' : 'border-gray-200'}`} />
                {errors.context ? <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.context}</p>
                  : !hasFiles ? <p className="text-[10px] text-amber-500 mt-1">* Sem documentos, as instruções são obrigatórias</p> : null}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {files.length > 0 ? <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {files.length} documento(s)</span> : null}
              </div>
              <button onClick={handleSubmit} disabled={submitting || !projectName.trim() || !selectedGroupId || needsInstructions}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:shadow-md transition-all" style={{ background: BRAND.primary }}>
                <Sparkles className="w-4 h-4" /> Iniciar Análise
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
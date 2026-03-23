// src/components/project/multi-file-upload.tsx
'use client'

import React from 'react'
import { Upload, Trash2, Plus, File as FileIcon, CheckCircle } from 'lucide-react'

interface MultiFileUploadProps {
  files: File[]
  setFiles: (f: File[]) => void
  accept?: string
  label?: string
}

export function MultiFileUpload({ files, setFiles, accept = '.docx,.pdf,.txt', label = 'Documentos (opcional)' }: MultiFileUploadProps) {
  const addFiles = (fl: FileList | null) => {
    if (!fl) return
    const arr = Array.from(fl).filter(f => f.name.match(/\.(docx|pdf|txt)$/i))
    const existing = new Set(files.map(f => f.name + f.size))
    const unique = arr.filter(f => !existing.has(f.name + f.size))
    setFiles([...files, ...unique])
  }
  const remove = (idx: number) => setFiles(files.filter((_, i) => i !== idx))

  return (
    <div>
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{label}</label>
      {files.length > 0 ? (
        <div className="space-y-1.5 mb-2.5">
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
              <FileIcon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className="font-medium truncate flex-1">{f.name}</span>
              <span className="text-emerald-400 text-[10px]">{(f.size / 1024).toFixed(0)} KB</span>
              <button onClick={() => remove(i)} className="text-emerald-400 hover:text-red-500 p-0.5"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      ) : null}
      <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-100 w-fit">
        {files.length > 0 ? <Plus className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
        {files.length > 0 ? 'Adicionar mais' : 'Anexar documentos (.docx, .pdf, .txt)'}
        <input type="file" accept={accept} multiple onChange={e => { addFiles(e.target.files); e.target.value = '' }} className="hidden" />
      </label>
    </div>
  )
}
// src/components/report/ExportButtons.tsx
'use client'

import React, { useState } from 'react'
import { FileSpreadsheet, Camera, Download, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BRAND = {
  primary: '#011334',
}

type ExportFormat = 'csv' | 'excel' | 'image' | 'pdf'

interface ExportButtonProps {
  format: ExportFormat
  onClick: () => void | Promise<void>
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showLabel?: boolean
}

interface ExportButtonsGroupProps {
  onExportCSV?: () => void | Promise<void>
  onExportImage?: () => void | Promise<void>
  onExportPDF?: () => void | Promise<void>
  showCSV?: boolean
  showImage?: boolean
  showPDF?: boolean
  disabled?: boolean
  className?: string
}

const EXPORT_CONFIG: Record<ExportFormat, { icon: typeof FileSpreadsheet; label: string }> = {
  csv: { icon: FileSpreadsheet, label: 'Exportar Excel' },
  excel: { icon: FileSpreadsheet, label: 'Exportar Excel' },
  image: { icon: Camera, label: 'Salvar Imagem' },
  pdf: { icon: FileText, label: 'Exportar PDF' },
}

export function ExportButton({
  format,
  onClick,
  disabled = false,
  className = '',
  size = 'default',
  showLabel = true,
}: ExportButtonProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false)
  const config = EXPORT_CONFIG[format]
  const Icon = config.icon

  const handleClick = async (): Promise<void> => {
    if (isLoading || disabled) return
    setIsLoading(true)
    try {
      await onClick()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`group flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-medium transition-all shadow-sm ${className}`}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Icon size={18} />}
      {showLabel && <span className={size === 'sm' ? 'hidden sm:inline' : ''}>{isLoading ? 'Gerando...' : config.label}</span>}
    </Button>
  )
}

export function ExportButtonsGroup({
  onExportCSV,
  onExportImage,
  onExportPDF,
  showCSV = true,
  showImage = true,
  showPDF = false,
  disabled = false,
  className = '',
}: ExportButtonsGroupProps): React.ReactElement {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showCSV && onExportCSV && <ExportButton format="csv" onClick={onExportCSV} disabled={disabled} />}
      {showImage && onExportImage && <ExportButton format="image" onClick={onExportImage} disabled={disabled} />}
      {showPDF && onExportPDF && <ExportButton format="pdf" onClick={onExportPDF} disabled={disabled} />}
    </div>
  )
}

export function DownloadIconButton({
  onClick,
  disabled = false,
  tooltip = 'Baixar CSV',
  className = '',
}: {
  onClick: () => void | Promise<void>
  disabled?: boolean
  tooltip?: string
  className?: string
}): React.ReactElement {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (): Promise<void> => {
    if (isLoading || disabled) return
    setIsLoading(true)
    try {
      await onClick()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={disabled || isLoading}
      title={tooltip}
      className={`group p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-lg transition-all shadow-sm ${className}`}
    >
      {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
    </Button>
  )
}

export function exportToCSV(
  data: Record<string, unknown>[],
  headers: string[],
  filename: string = 'export.csv'
): void {
  const bom = '\uFEFF'
  let csvContent = headers.join(';') + '\n'
  
  data.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] ?? ''
      const stringValue = String(value).replace(/"/g, '""')
      return stringValue.includes(';') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue}"`
        : stringValue
    })
    csvContent += values.join(';') + '\n'
  })
  
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportToImage(element: HTMLElement, filename: string = 'export.png'): Promise<void> {
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  })
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export default ExportButtonsGroup
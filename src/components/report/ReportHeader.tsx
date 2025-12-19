// src/components/report/ReportHeader.tsx
'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

// Usar BRAND do sidebar existente
const BRAND = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
}

interface ReportHeaderProps {
  icon: LucideIcon
  projectName: string
  reportTitle: string
  actions?: React.ReactNode
  className?: string
}

export function ReportHeader({
  icon: Icon,
  projectName,
  reportTitle,
  actions,
  className = '',
}: ReportHeaderProps): React.ReactElement {
  return (
    <header className={`bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm ${className}`}>
      <div className="max-w-[98%] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: BRAND.primary }}
          >
            <Icon size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none" style={{ color: '#0f172a' }}>
              {projectName}
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              {reportTitle}
            </p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}

export function ReportHeaderWithLogo({
  icon: Icon,
  projectName,
  reportTitle,
  actions,
  showLogo = true,
  className = '',
}: ReportHeaderProps & { showLogo?: boolean }): React.ReactElement {
  return (
    <header className={`bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm ${className}`}>
      <div className="max-w-[98%] mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showLogo && (
            <>
              <div className="p-2 rounded-lg" style={{ backgroundColor: BRAND.primary }}>
                <img 
                  src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg"
                  alt="PEERS"
                  className="h-6 w-auto"
                />
              </div>
              <div className="w-px h-10 bg-slate-200" />
            </>
          )}
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: BRAND.primary }}
          >
            <Icon size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none" style={{ color: '#0f172a' }}>
              {projectName}
            </h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
              {reportTitle}
            </p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}

export default ReportHeader
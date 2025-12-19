// src/components/report/ReportStats.tsx
'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

const BRAND = {
  primary: '#011334',
}

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  iconBgColor?: string
  iconColor?: string
  className?: string
}

interface ReportStatsProps {
  stats: StatCardProps[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  iconBgColor = '#e0e7ff',
  iconColor = BRAND.primary,
  className = '',
}: StatCardProps): React.ReactElement {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-5 ${className}`}>
      <div className="p-3 rounded-lg" style={{ backgroundColor: iconBgColor }}>
        <Icon size={24} strokeWidth={2} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}

export function ReportStats({ stats, columns = 3, className = '' }: ReportStatsProps): React.ReactElement {
  const gridCols: Record<number, string> = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6 mb-8 ${className}`}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          iconBgColor={stat.iconBgColor}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  )
}

export const STAT_COLORS = {
  primary: { iconBgColor: '#01133415', iconColor: '#011334' },
  secondary: { iconBgColor: '#E1FF0030', iconColor: '#011334' },
  success: { iconBgColor: '#d1fae5', iconColor: '#059669' },
  warning: { iconBgColor: '#fef3c7', iconColor: '#d97706' },
  error: { iconBgColor: '#fee2e2', iconColor: '#dc2626' },
  info: { iconBgColor: '#e0e7ff', iconColor: '#4f46e5' },
  blue: { iconBgColor: '#dbeafe', iconColor: '#2563eb' },
  purple: { iconBgColor: '#f3e8ff', iconColor: '#9333ea' },
  pink: { iconBgColor: '#fce7f3', iconColor: '#db2777' },
  teal: { iconBgColor: '#ccfbf1', iconColor: '#0d9488' },
}

export default ReportStats
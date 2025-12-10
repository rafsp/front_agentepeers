// src/components/layout/sidebar.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, GitBranch, Settings, BarChart3, Users, Plug,
  Sparkles, LogOut, Building
} from 'lucide-react'

export const BRAND = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
  white: '#FFFFFF',
  success: '#22C55E',
  warning: '#F97316',
  info: '#6366F1',
}

export const PEERS_LOGO_URL = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

interface SidebarProps {
  activeItem: string
  user: { name: string; email: string } | null
  onLogout: () => void
}

export function Sidebar({ activeItem, user, onLogout }: SidebarProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'tech' | 'biz'>('tech')

  const workspaceItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'novo-pipeline', label: 'Novo Pipeline', icon: Sparkles },
    { id: 'repositorios', label: 'Repositórios', icon: GitBranch },
  ]

  const adminItems = [
    { id: 'relatorios', label: 'Relatórios de Uso', icon: BarChart3 },
    { id: 'squads', label: 'Gestão de Squads', icon: Users },
    { id: 'integracoes', label: 'Integrações', icon: Plug },
  ]

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="w-56 h-screen fixed left-0 top-0 flex flex-col border-r bg-gradient-to-b from-slate-50 to-slate-100">
      {/* LOGO */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-lg" style={{ background: BRAND.primary }}>
            <img src={PEERS_LOGO_URL} alt="PEERS" className="h-4 w-auto" />
          </div>
          <div className="border-l pl-3" style={{ borderColor: '#E5E7EB' }}>
            <div className="text-sm font-semibold" style={{ color: BRAND.primary }}>CodeAI</div>
          </div>
        </div>
      </div>

      {/* WORKSPACE */}
      <div className="p-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Workspace</div>
        {workspaceItems.map(item => (
          <button
            key={item.id}
            onClick={() => router.push(`/${item.id}`)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeItem === item.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-white/60'}`}
            style={activeItem === item.id ? { background: BRAND.info } : {}}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      {/* ADMIN */}
      <div className="p-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Admin</div>
        {adminItems.map(item => (
          <button
            key={item.id}
            onClick={() => router.push(`/${item.id}`)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${activeItem === item.id ? 'text-white shadow-md' : 'text-gray-600 hover:bg-white/60'}`}
            style={activeItem === item.id ? { background: BRAND.info } : {}}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* MODO */}
      <div className="p-4 border-t">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Modo de Operação</div>
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          <button onClick={() => setMode('tech')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all
              ${mode === 'tech' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>
            <Settings className="w-3 h-3" />Tech
          </button>
          <button onClick={() => setMode('biz')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all
              ${mode === 'biz' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>
            <Building className="w-3 h-3" />Biz
          </button>
        </div>
      </div>

      {/* USER */}
      <div className="p-4 border-t">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ background: BRAND.info }}>
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{user.name || 'Usuário'}</div>
              <div className="text-xs text-gray-500 truncate">{user.email}</div>
            </div>
            <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
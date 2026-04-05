// src/components/layout/sidebar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FolderPlus, FileBarChart2, LogOut,
  ChevronLeft, ChevronRight, Code, Building2,
  Mail, Shield, X, Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const BRAND = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
  info: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  primaryLight: '#677185',
  primaryMid: '#99A1AE',
  limeLight: '#F3FF99',
}

const PEERS_LOGO_URL = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

interface SidebarProps {
  activeItem?: string
  user: { name: string; email: string }
  onLogout: () => void
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'novo-projeto', label: 'Novo Projeto', icon: FolderPlus, href: '/project/new' },
  { id: 'relatorios', label: 'Relatórios', icon: FileBarChart2, href: '/relatorios' },
  { id: 'admin', label: 'Admin', icon: Settings2, href: '/admin' },
]

export function Sidebar({ activeItem, user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [logoError, setLogoError] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const empresa = typeof localStorage !== 'undefined' ? localStorage.getItem('peers_empresa') || '' : ''
  const authMethod = typeof localStorage !== 'undefined' ? localStorage.getItem('peers_auth_method') || '' : ''
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40 ${isCollapsed ? 'w-16' : 'w-56'}`}>
        {/* Logo */}
        <div className="p-3 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center justify-center">
            <div className={`rounded-xl flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'w-10 h-10 p-2' : 'w-full p-3'}`} style={{ background: BRAND.primary }}>
              {!logoError ? (
                <img src={PEERS_LOGO_URL} alt="PEERS" className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-24 h-8'}`} onError={() => setLogoError(true)} />
              ) : (
                isCollapsed ? <Code className="w-5 h-5 text-white" /> : <div className="flex flex-col items-center"><span className="text-xl font-black tracking-wider text-white">P<span style={{ color: BRAND.secondary }}>EE</span>RS</span><span className="text-[8px] font-medium tracking-wider text-white/70 mt-0.5">Consulting <span style={{ color: BRAND.secondary }}>+</span> Technology</span></div>
              )}
            </div>
          </Link>
          {!isCollapsed && <div className="text-center mt-2"><span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Code.IA</span></div>}
        </div>

        {/* Menu */}
        <nav className="flex-1 p-3">
          {!isCollapsed && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">Workspace</div>}
          <div className="space-y-1">
            {MENU_ITEMS.map(item => {
              const isActive = activeItem === item.id || pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link key={item.id} href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'} ${isCollapsed ? 'justify-center' : ''}`}
                  style={isActive ? { background: BRAND.primary } : {}}
                  title={isCollapsed ? item.label : undefined}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>

        <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
          {isCollapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ChevronLeft className="w-3 h-3 text-gray-500" />}
        </button>

        {/* User — click opens profile */}
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => setShowProfile(true)} className={`w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors ${isCollapsed ? 'flex-col justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ring-2 ring-transparent hover:ring-blue-200 transition-all" style={{ background: BRAND.primary }}>{getInitials(user.name || 'U')}</div>
            {!isCollapsed && <div className="flex-1 min-w-0 text-left"><p className="text-sm font-medium text-gray-900 truncate">{user.name}</p><p className="text-[10px] text-gray-400 truncate">{user.email}</p></div>}
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProfile(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="relative px-6 pt-8 pb-6 text-center" style={{ background: BRAND.primary }}>
              <button onClick={() => setShowProfile(false)} className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"><X className="w-4 h-4" /></button>
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold" style={{ background: `${BRAND.secondary}30`, color: BRAND.secondary }}>{getInitials(user.name || 'U')}</div>
              <h3 className="text-white font-bold text-lg mt-3">{user.name || 'Usuário'}</h3>
              {empresa && <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest" style={{ background: `${BRAND.secondary}20`, color: BRAND.secondary }}><Building2 className="w-3 h-3" /> {empresa}</span>}
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Mail className="w-4 h-4 text-gray-400 flex-shrink-0" /><div className="min-w-0"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">E-mail</p><p className="text-sm text-gray-700 truncate">{user.email}</p></div></div>
              {empresa && <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" /><div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Empresa</p><p className="text-sm text-gray-700">{empresa.charAt(0).toUpperCase() + empresa.slice(1)}</p></div></div>}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><Shield className="w-4 h-4 text-gray-400 flex-shrink-0" /><div><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Autenticação</p><p className="text-sm text-gray-700">{authMethod === 'credentials' ? 'Credenciais' : authMethod || 'N/A'}</p></div></div>
            </div>
            <div className="px-6 pb-6 space-y-2">
              <button onClick={() => { setShowProfile(false); window.location.href = '/login' }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200"><LogOut className="w-4 h-4" /> Trocar Conta</button>
              <button onClick={() => { setShowProfile(false); onLogout() }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100"><LogOut className="w-4 h-4" /> Sair da Conta</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
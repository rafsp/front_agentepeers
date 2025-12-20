// src/components/layout/sidebar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// Cores da marca PEERS
export const BRAND = {
  primary: '#011334',
  secondary: '#1a2d4d', 
  accent: '#e8f0fe',
  info: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

interface SidebarProps {
  activeItem?: string
  user: {
    name: string
    email: string
  }
  onLogout: () => void
}

// Apenas itens que estão funcionando
const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'novo-pipeline', label: 'Novo Pipeline', icon: Sparkles, href: '/novo-pipeline' },
]

export function Sidebar({ activeItem, user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40
        ${isCollapsed ? 'w-16' : 'w-56'}`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: BRAND.primary }}
          >
            P
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm" style={{ color: BRAND.primary }}>PEERS</span>
              <span className="text-[10px] text-gray-400">CodeAI</span>
            </div>
          )}
        </Link>
      </div>

      {/* Menu principal */}
      <nav className="flex-1 p-3">
        <div className={`text-xs font-medium text-gray-400 uppercase mb-2 ${isCollapsed ? 'hidden' : ''}`}>
          Workspace
        </div>
        
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeItem === item.id || pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${isActive 
                    ? 'text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
                style={isActive ? { background: BRAND.info } : {}}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Toggle collapse */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-500" />
        )}
      </button>

      {/* User section */}
      <div className="p-3 border-t border-gray-100">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
            style={{ background: BRAND.info }}
          >
            {getInitials(user.name)}
          </div>
          
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-gray-400 hover:text-gray-600 p-1"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {isCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full mt-2 text-gray-400 hover:text-gray-600"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </aside>
  )
}
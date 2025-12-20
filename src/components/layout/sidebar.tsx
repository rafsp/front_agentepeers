// src/components/layout/sidebar.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Sparkles,
  FileBarChart2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Code,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ============================================================================
// CORES DA MARCA PEERS - Brandbook 2025
// ============================================================================
export const BRAND = {
  primary: '#011334',      // PEERS Neue Blue
  secondary: '#E1FF00',    // PEERS Neue Lime
  accent: '#D8E8EE',       // Serene Blue
  info: '#6366f1',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  
  // Variações
  primaryLight: '#677185',
  primaryMid: '#99A1AE',
  limeLight: '#F3FF99',
}

// URL fixa do logo PEERS
const PEERS_LOGO_URL = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

// ============================================================================
// TIPOS
// ============================================================================
interface SidebarProps {
  activeItem?: string
  user: {
    name: string
    email: string
  }
  onLogout: () => void
}

interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
}

// ============================================================================
// ITENS DO MENU
// ============================================================================
const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'novo-pipeline', label: 'Novo Pipeline', icon: Sparkles, href: '/novo-pipeline' },
  { id: 'relatorios', label: 'Relatórios', icon: FileBarChart2, href: '/relatorios' },
]

// ============================================================================
// COMPONENTE SIDEBAR
// ============================================================================
export function Sidebar({ activeItem, user, onLogout }: SidebarProps) {
  const pathname = usePathname()
  // Sempre inicia recolhido
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [logoError, setLogoError] = useState(false)

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
      className={`
        fixed left-0 top-0 h-screen bg-white border-r border-gray-200 
        flex flex-col transition-all duration-300 z-40
        ${isCollapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo PEERS */}
      <div className="p-3 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center justify-center">
          <div 
            className={`
              rounded-xl flex items-center justify-center transition-all duration-300
              ${isCollapsed ? 'w-10 h-10 p-2' : 'w-full p-3'}
            `}
            style={{ background: BRAND.primary }}
          >
            {!logoError ? (
              <img 
                src={PEERS_LOGO_URL}
                alt="PEERS Logo" 
                className={`object-contain transition-all duration-300 ${isCollapsed ? 'w-6 h-6' : 'w-24 h-8'}`}
                onError={() => setLogoError(true)}
              />
            ) : (
              /* Fallback se o logo não carregar */
              <div className={`flex items-center justify-center ${isCollapsed ? '' : 'flex-col'}`}>
                {isCollapsed ? (
                  <Code className="w-5 h-5 text-white" />
                ) : (
                  <>
                    <span className="text-xl font-black tracking-wider text-white">
                      P<span style={{ color: BRAND.secondary }}>EE</span>RS
                    </span>
                    <span className="text-[8px] font-medium tracking-wider text-white/70 mt-0.5">
                      Consulting <span style={{ color: BRAND.secondary }}>+</span> Technology
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </Link>
        {!isCollapsed && (
          <div className="text-center mt-2">
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              CodeAI
            </span>
          </div>
        )}
      </div>

      {/* Menu principal */}
      <nav className="flex-1 p-3">
        {!isCollapsed && (
          <div className="text-xs font-medium text-gray-400 uppercase mb-2 px-3">
            Workspace
          </div>
        )}
        
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeItem === item.id || pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                style={isActive ? { background: BRAND.primary } : {}}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Toggle collapse */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-500" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-500" />
        )}
      </button>

      {/* User section */}
      <div className="p-3 border-t border-gray-100">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
            style={{ background: BRAND.primary }}
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
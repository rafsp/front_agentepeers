'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  Home,
  Plus,
  Activity,
  FileText,
  Settings,
  Github,
  LogOut,
  User,
  Code
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'new-analysis',
    label: 'Nova Análise',
    icon: Plus,
    href: '/dashboard/new-analysis'
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Activity,
    href: '/dashboard/jobs'
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: FileText,
    href: '/dashboard/reports'
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    href: '/dashboard/settings'
  }
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const isActivePath = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const handleLogout = () => {
    localStorage.removeItem('demo_token')
    localStorage.removeItem('github_token')
    localStorage.removeItem('auth_mode')
    localStorage.removeItem('job-store')
    localStorage.removeItem('company-store')
    window.location.href = '/'
  }

  const githubToken = typeof window !== 'undefined' ? localStorage.getItem('github_token') : null
  const demoToken = typeof window !== 'undefined' ? localStorage.getItem('demo_token') : null
  
  let userName = 'Usuário'
  if (demoToken) {
    try {
      const user = JSON.parse(demoToken)
      userName = user.name || 'Demo User'
    } catch (e) {
      userName = 'Demo User'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Otimizada - Largura aumentada para melhor proporção */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        
        {/* Logo Section - Melhor proporção e respiração */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-center">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-3 rounded-xl shadow-lg">
              <img 
                src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                alt="Peers Logo" 
                className="w-16 h-10 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  const fallbackDiv = target.nextElementSibling as HTMLElement
                  if (fallbackDiv) {
                    fallbackDiv.classList.remove('hidden')
                    fallbackDiv.classList.add('flex')
                  }
                }}
              />
              <div className="w-16 h-10 bg-blue-600 rounded items-center justify-center hidden">
                <Code className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation - Espaçamento e hierarquia melhorados */}
        <div className="flex-1 px-4 py-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(item.href)
              
              return (
                <button
                  key={item.id}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-medium group',
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
                  )} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* GitHub Integration - Design card melhorado */}
          <div className="mt-8">
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                Integrações
              </h3>
            </div>
            
            <div 
              className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:from-orange-100 hover:to-amber-100 transition-all duration-200"
              onClick={() => router.push('/dashboard/settings/github')}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Github className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <span className="font-semibold text-sm text-gray-900">GitHub</span>
                  <p className="text-xs text-gray-600">
                    {githubToken ? 'Conectado e funcionando' : 'Não configurado'}
                  </p>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className={cn(
                  'w-full text-xs font-medium transition-colors',
                  githubToken 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                )}
              >
                {githubToken ? '✓ Configurado' : 'Configurar Agora'}
              </Button>
            </div>
          </div>
        </div>

        {/* User Section - Design melhorado */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="p-2 h-auto hover:bg-red-50 hover:text-red-600 transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - Padding otimizado */}
      <main className="flex-1 bg-white overflow-auto">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
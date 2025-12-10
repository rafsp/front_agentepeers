// src/hooks/use-auth.ts
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  name: string
  email: string
  authMethod: 'microsoft' | 'credentials' | null
  isAuthenticated: boolean
}

const DEFAULT_USER: AuthUser = {
  name: '',
  email: '',
  authMethod: null,
  isAuthenticated: false,
}

// Função para ler cookie
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
  return null
}

// Função para remover cookie - múltiplas tentativas para garantir remoção
function removeCookie(name: string) {
  if (typeof document === 'undefined') return
  
  const hostname = window.location.hostname
  const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1'
  
  // Lista de variações para garantir remoção
  const paths = ['/', '']
  const domains = isProduction 
    ? ['', hostname, `.${hostname}`, 'codeia.peers.com.br', '.codeia.peers.com.br']
    : ['', 'localhost']
  
  // Tentar remover com várias combinações
  for (const path of paths) {
    for (const domain of domains) {
      // Sem domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path || '/'};`
      
      // Com domain
      if (domain) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path || '/'}; domain=${domain};`
      }
      
      // Com secure e sameSite
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path || '/'}; secure; samesite=lax;`
      
      if (domain) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path || '/'}; domain=${domain}; secure; samesite=lax;`
      }
    }
  }
  
  console.log(`🗑️ Cookie removido: ${name}`)
}

// Função para limpar todos os cookies de autenticação
function clearAllAuthCookies() {
  const cookieNames = [
    'peers_authenticated',
    'peers_auth_method',
    'peers_user',
    'peers_user_name',
    'peers_user_email',
  ]
  
  for (const name of cookieNames) {
    removeCookie(name)
  }
}

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser>(DEFAULT_USER)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    setLoading(true)
    
    try {
      // Verificar autenticação
      const isAuthCookie = getCookie('peers_authenticated') === 'true'
      const isAuthStorage = typeof localStorage !== 'undefined' && 
        localStorage.getItem('peers_authenticated') === 'true'

      const isAuthenticated = isAuthCookie || isAuthStorage

      if (!isAuthenticated) {
        setUser(DEFAULT_USER)
        setLoading(false)
        return
      }

      // Ler método de autenticação
      const authMethod = (getCookie('peers_auth_method') || 
        localStorage.getItem('peers_auth_method')) as 'microsoft' | 'credentials' | null

      // Ler nome e email (novos campos separados)
      let name = getCookie('peers_user_name') || localStorage.getItem('peers_user_name') || ''
      let email = getCookie('peers_user_email') || localStorage.getItem('peers_user_email') || ''

      // Fallback: tentar ler do cookie antigo 'peers_user'
      if (!name && !email) {
        const oldUserValue = getCookie('peers_user') || localStorage.getItem('peers_user')
        if (oldUserValue) {
          if (oldUserValue.includes('@')) {
            email = oldUserValue
            name = oldUserValue.split('@')[0].replace(/[._]/g, ' ')
            name = name.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')
          } else {
            name = oldUserValue
          }
        }
      }

      // Se ainda não tem nome, usar fallback baseado no método
      if (!name) {
        name = authMethod === 'microsoft' ? 'Usuário Microsoft' : 'Usuário'
      }
      if (!email) {
        email = authMethod === 'microsoft' ? 'microsoft@empresa.com.br' : 'usuario@peers.com.br'
      }

      console.log('🔐 useAuth - Usuário carregado:', { name, email, authMethod })

      setUser({
        name,
        email,
        authMethod,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
      setUser(DEFAULT_USER)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🚪 Realizando logout...')
    
    // 1. Limpar todos os cookies de autenticação
    clearAllAuthCookies()
    
    // 2. Limpar localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('peers_authenticated')
      localStorage.removeItem('peers_auth_method')
      localStorage.removeItem('peers_user')
      localStorage.removeItem('peers_user_name')
      localStorage.removeItem('peers_user_email')
    }
    
    // 3. Limpar sessionStorage também
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear()
    }
    
    // 4. Resetar estado
    setUser(DEFAULT_USER)
    
    console.log('✅ Logout completo, redirecionando...')
    
    // 5. Redirecionar para login (usar window.location para forçar reload completo)
    window.location.href = '/login'
  }

  return { 
    user, 
    loading, 
    logout, 
    isAuthenticated: user.isAuthenticated, 
    checkAuth 
  }
}
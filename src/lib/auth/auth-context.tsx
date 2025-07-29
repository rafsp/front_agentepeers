'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useMsal } from '@azure/msal-react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  login: () => Promise<void>
  logout: () => void
  authMode: 'demo' | 'production'
  switchToDemo: () => void
  switchToProduction: () => void
  githubToken?: string
  setGithubToken: (token: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface DemoUser {
  name: string
  email: string
  role: string
  avatar?: string
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { instance, accounts } = useMsal()
  const [authMode, setAuthMode] = useState<'demo' | 'production'>('demo')
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)
  const [githubToken, setGithubTokenState] = useState<string>()

  useEffect(() => {
    // Carregar dados do localStorage
    const demoToken = localStorage.getItem('demo_token')
    const storedGithubToken = localStorage.getItem('github_token')
    const storedAuthMode = localStorage.getItem('auth_mode') as 'demo' | 'production'
    
    if (storedAuthMode) {
      setAuthMode(storedAuthMode)
    }
    
    if (storedGithubToken) {
      setGithubTokenState(storedGithubToken)
    }
    
    if (demoToken && storedAuthMode === 'demo') {
      try {
        const user = JSON.parse(demoToken)
        setDemoUser(user)
      } catch (error) {
        localStorage.removeItem('demo_token')
      }
    }
  }, [])

  const login = async () => {
    if (authMode === 'demo') {
      const demoUser = {
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'admin',
        avatar: 'https://github.com/github.png'
      }
      localStorage.setItem('demo_token', JSON.stringify(demoUser))
      localStorage.setItem('auth_mode', 'demo')
      setDemoUser(demoUser)
    } else {
      try {
        await instance.loginPopup({
          scopes: ['User.Read'],
        })
        localStorage.setItem('auth_mode', 'production')
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }

  const logout = () => {
    // Limpar todos os dados de autenticação
    localStorage.removeItem('demo_token')
    localStorage.removeItem('github_token')
    localStorage.removeItem('auth_mode')
    localStorage.removeItem('job-store')
    localStorage.removeItem('company-store')
    
    setDemoUser(null)
    setGithubTokenState(undefined)
    
    if (authMode === 'production') {
      instance.logoutPopup()
    }
    
    // Redirecionar para a página inicial
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  }

  const switchToDemo = () => {
    logout()
    setAuthMode('demo')
  }

  const switchToProduction = () => {
    logout()
    setAuthMode('production')
  }

  const setGithubToken = (token: string) => {
    localStorage.setItem('github_token', token)
    setGithubTokenState(token)
  }

  const isAuthenticated = authMode === 'demo' ? !!demoUser : accounts.length > 0
  const user = authMode === 'demo' ? demoUser : accounts[0]

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    authMode,
    switchToDemo,
    switchToProduction,
    githubToken,
    setGithubToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useMsal } from '@azure/msal-react'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  login: () => Promise<void>
  logout: () => void
  authMode: 'demo' | 'production'
  switchToDemo: () => void
  switchToProduction: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface DemoUser {
  name: string
  email: string
  role: string
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { instance, accounts } = useMsal()
  const [authMode, setAuthMode] = useState<'demo' | 'production'>('demo')
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null)

  useEffect(() => {
    const demoToken = localStorage.getItem('demo_token')
    if (demoToken) {
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
        role: 'admin'
      }
      localStorage.setItem('demo_token', JSON.stringify(demoUser))
      setDemoUser(demoUser)
    } else {
      try {
        await instance.loginPopup({
          scopes: ['User.Read'],
        })
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }

  const logout = () => {
    if (authMode === 'demo') {
      localStorage.removeItem('demo_token')
      setDemoUser(null)
    } else {
      instance.logoutPopup()
    }
  }

  const switchToDemo = () => {
    logout()
    setAuthMode('demo')
  }

  const switchToProduction = () => {
    logout()
    setAuthMode('production')
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
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// Tipos
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  githubToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setGithubToken: (token: string) => void
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [githubToken, setGithubTokenState] = useState<string | null>(null)

  // Inicializar dados do localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('githubToken')
      
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
      
      if (savedToken) {
        setGithubTokenState(savedToken)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Login simulado
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Usuário mock para desenvolvimento
      const mockUser: User = {
        id: '1',
        name: 'Desenvolvedor',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('Desenvolvedor')}&background=3b82f6&color=fff`
      }
      
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      throw new Error('Falha no login')
    } finally {
      setIsLoading(false)
    }
  }

  // Logout
  const logout = () => {
    setUser(null)
    setGithubTokenState(null)
    localStorage.removeItem('user')
    localStorage.removeItem('githubToken')
  }

  // Definir token do GitHub
  const setGithubToken = (token: string) => {
    setGithubTokenState(token)
    localStorage.setItem('githubToken', token)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    githubToken,
    login,
    logout,
    setGithubToken
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Componente de proteção de rota
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Acesso Necessário</h2>
            <p className="mt-2 text-sm text-gray-600">
              Faça login para acessar esta página
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Componente de login simples
function LoginForm() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
    } catch (err) {
      setError('Falha no login. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Email"
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Senha"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm text-center">{error}</div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Para desenvolvimento: qualquer email/senha funciona
        </p>
      </div>
    </form>
  )
}
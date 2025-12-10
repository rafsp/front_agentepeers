// src/app/login/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRight, Eye, EyeOff, Loader2, AlertCircle, Lock, Mail,
  Sparkles, Shield, Zap, GitBranch, Bot
} from 'lucide-react'

const BRAND = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
  white: '#FFFFFF',
  success: '#22C55E',
  warning: '#F97316',
  info: '#6366F1',
}

const PEERS_LOGO_URL = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

const FIXED_CREDENTIALS = {
  email: 'agente@peers.com.br',
  password: 'Peers@2025',
  name: 'Agente PEERS'
}

// Azure AD Config
const AZURE_AD_CLIENT_ID = '4dcad7f8-e4d5-44e1-8d1e-3c1ce8af602a'
const AZURE_AD_TENANT_ID = 'b9e68103-376a-402b-87f6-a3b10658e7c4'

// URL de produção conhecida
const PRODUCTION_URL = 'https://codeia.peers.com.br'

function setCookie(name: string, value: string, days: number = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

// Função para obter a URL base correta
function getBaseUrl(): string {
  if (typeof window === 'undefined') return PRODUCTION_URL
  
  const hostname = window.location.hostname
  
  // Se for localhost ou 127.0.0.1, usar origin normal
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return window.location.origin
  }
  
  // Se for URL de produção conhecida
  if (hostname === 'codeia.peers.com.br') {
    return PRODUCTION_URL
  }
  
  // Se for Azure Static Web Apps
  if (hostname.includes('azurestaticapps.net')) {
    return `https://${hostname}`
  }
  
  // Fallback para origin
  return window.location.origin
}

function MicrosoftLoginButton({ disabled }: { disabled?: boolean }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleMicrosoftLogin = () => {
    setIsLoading(true)
    
    const baseUrl = getBaseUrl()
    const redirectUri = `${baseUrl}/api/auth/callback/azure-ad`
    
    console.log('🔗 Microsoft Login - Base URL:', baseUrl)
    console.log('🔗 Microsoft Login - Redirect URI:', redirectUri)
    
    const scope = encodeURIComponent('openid profile email User.Read')
    const state = Math.random().toString(36).substring(7)
    
    const authUrl = `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize?` +
      `client_id=${AZURE_AD_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_mode=query` +
      `&scope=${scope}` +
      `&state=${state}`
    
    console.log('🚀 Redirecionando para Microsoft...')
    window.location.href = authUrl
  }

  return (
    <Button 
      onClick={handleMicrosoftLogin} 
      disabled={disabled || isLoading} 
      variant="outline" 
      type="button" 
      className="w-full h-12 font-medium border-2 hover:bg-gray-50 transition-all"
    >
      {isLoading ? (
        <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Conectando...</>
      ) : (
        <>
          <svg className="mr-3 h-5 w-5" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          Entrar com Microsoft
        </>
      )}
    </Button>
  )
}

function FeatureItem({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${BRAND.secondary}20` }}>
        <Icon className="w-5 h-5" style={{ color: BRAND.secondary }} />
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isAuth = document.cookie.includes('peers_authenticated=true') || 
                   localStorage.getItem('peers_authenticated') === 'true'
    if (isAuth) {
      router.replace('/dashboard')
    }
  }, [router])

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (email === FIXED_CREDENTIALS.email && password === FIXED_CREDENTIALS.password) {
        setCookie('peers_authenticated', 'true', 7)
        setCookie('peers_auth_method', 'credentials', 7)
        setCookie('peers_user_name', FIXED_CREDENTIALS.name, 7)
        setCookie('peers_user_email', FIXED_CREDENTIALS.email, 7)
        
        localStorage.setItem('peers_authenticated', 'true')
        localStorage.setItem('peers_auth_method', 'credentials')
        localStorage.setItem('peers_user_name', FIXED_CREDENTIALS.name)
        localStorage.setItem('peers_user_email', FIXED_CREDENTIALS.email)
        
        router.push('/dashboard')
      } else {
        setError('Credenciais inválidas. Verifique seu email e senha.')
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Erro ao autenticar. Tente novamente.')
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen flex">
      {/* LADO ESQUERDO */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12" style={{ background: BRAND.primary }}>
        <div className="flex items-center gap-3">
          <img src={PEERS_LOGO_URL} alt="PEERS" className="h-8 w-auto" />
        </div>

        <div className="max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8" style={{ background: `${BRAND.secondary}20`, color: BRAND.secondary }}>
            <Sparkles className="w-4 h-4" />Plataforma de Agentes Inteligentes
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Transforme seu código com<span className="block" style={{ color: BRAND.secondary }}>Inteligência Artificial</span>
          </h1>
          <p className="text-lg text-gray-400 mb-12">Análise profunda, geração automatizada e otimização contínua com nossa plataforma multi-agentes.</p>
          <div className="space-y-6">
            <FeatureItem icon={GitBranch} title="Análise de Repositórios" description="Avaliação completa de código com 14 agentes especializados" />
            <FeatureItem icon={Shield} title="Segurança & Compliance" description="Detecção de vulnerabilidades OWASP e SAST automatizada" />
            <FeatureItem icon={Zap} title="Geração de Código" description="Criação de épicos, features e planejamento com IA" />
          </div>
        </div>

        <div className="text-sm text-gray-500">© 2025 PEERS Consulting + Technology. Todos os direitos reservados.</div>
      </div>

      {/* LADO DIREITO */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 rounded-lg" style={{ background: BRAND.primary }}>
                <img src={PEERS_LOGO_URL} alt="PEERS" className="h-5 w-auto" />
              </div>
              <div className="text-lg font-bold" style={{ color: BRAND.primary }}>CodeAI</div>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: `${BRAND.info}15` }}>
                  <Bot className="w-7 h-7" style={{ color: BRAND.info }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Bem-vindo ao CodeAI</h2>
                <p className="text-gray-500 mt-2">Entre com suas credenciais para acessar</p>
              </div>

              <div className="mb-6"><MicrosoftLoginButton disabled={isLoading} /></div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-400">ou continue com email</span></div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <div className="relative">
                    <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} className="pl-10 h-12" />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} className="pl-10 pr-10 h-12" />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button onClick={handleLogin} type="button" className="w-full h-12 font-semibold text-white mt-2" style={{ background: BRAND.primary }} disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />Autenticando...</>) : (<>Entrar<ArrowRight className="ml-2 h-5 w-5" /></>)}
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" /><span>Conexão segura com criptografia SSL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Problemas para acessar?{' '}
              <a href="mailto:suporte@peers.com.br" className="font-medium hover:underline" style={{ color: BRAND.info }}>Contate o suporte</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
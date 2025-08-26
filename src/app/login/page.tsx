// app/login/page.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ChevronLeft,
  Lock,
  Mail,
  Sparkles,
  PanelLeft,
  PanelLeftClose,
  Bot
} from 'lucide-react'

const BRAND_COLORS = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
  white: '#FFFFFF',
  gradients: {
    primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
    secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
    hero: 'linear-gradient(180deg, #011334 0%, #022558 50%, #011334 100%)'
  }
}

// Credenciais fixas
const FIXED_CREDENTIALS = {
  email: 'agente@peers.com.br',
  password: 'Peers@2025'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1500))

    if (email === FIXED_CREDENTIALS.email && password === FIXED_CREDENTIALS.password) {
      // Salvar autenticação
      localStorage.setItem('peers_authenticated', 'true')
      localStorage.setItem('peers_user', email)
      
      // Redirecionar para dashboard
      router.push('/dashboard')
    } else {
      setError('Credenciais inválidas. Use as credenciais fornecidas.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Logo e Status */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Botão Menu */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
              </Button>
              
              {/* Logo PEERS */}
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg" style={{ background: BRAND_COLORS.primary }}>
                  <img 
                    src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                    alt="PEERS Logo" 
                    className="w-28 h-14 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="text-3xl font-black tracking-wider text-white">
                            P<span style="color: #E1FF00">EE</span>RS
                          </div>
                          <div class="text-xs font-medium tracking-wider mt-1 text-white">
                            Consulting <span style="color: #E1FF00">+</span> Technology
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="hidden lg:flex items-center">
                <div className="w-px h-12 bg-gray-200 mx-4" />
                <div>
                  <h1 className="text-2xl font-bold flex items-center space-x-2" style={{ color: BRAND_COLORS.primary }}>
                    <Bot className="h-6 w-6" style={{ color: BRAND_COLORS.secondary }} />
                    <span>Agentes Inteligentes</span>
                  </h1>
                  <p className="text-sm text-gray-500">Sistema de autenticação</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="font-semibold"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-80px)] relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0" style={{ background: BRAND_COLORS.gradients.hero }} />
        
        {/* Lado Esquerdo - Informações */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-lg text-white">
          <div className="mb-8">
            <div className="text-5xl font-black tracking-wider mb-2">
              P<span style={{ color: BRAND_COLORS.secondary }}>EE</span>RS
            </div>
            <div className="text-sm font-medium tracking-wider opacity-80">
              Consulting <span style={{ color: BRAND_COLORS.secondary }}>+</span> Technology
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6">
            Plataforma de Agentes Inteligentes
          </h1>
          
          <p className="text-lg mb-8 opacity-90">
            Transforme seu código com o poder da inteligência artificial multi-agentes. 
            Análise profunda, geração automatizada e otimização contínua.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: BRAND_COLORS.secondary }}>
                <Sparkles className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
              </div>
              <span>Análise completa de repositórios</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: BRAND_COLORS.secondary }}>
                <Lock className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
              </div>
              <span>Detecção de vulnerabilidades</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: BRAND_COLORS.secondary }}>
                <ArrowRight className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
              </div>
              <span>Geração de código otimizado</span>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 left-20 w-72 h-72 opacity-10">
          <div className="w-full h-full rounded-full"
               style={{ background: BRAND_COLORS.secondary, filter: 'blur(100px)' }}></div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 bg-white lg:bg-transparent">
        <div className="w-full max-w-md">
          {/* Botão Voltar */}
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-6 text-white lg:text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>

          <Card className="shadow-2xl border-0">
            <CardHeader className="space-y-1 pb-6">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="p-3 rounded-lg" style={{ background: BRAND_COLORS.primary }}>
                  <div className="text-3xl font-black tracking-wider text-white">
                    P<span style={{ color: BRAND_COLORS.secondary }}>EE</span>RS
                  </div>
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-center lg:text-left" 
                        style={{ color: BRAND_COLORS.primary }}>
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-center lg:text-left">
                Entre com suas credenciais para acessar a plataforma
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-10 pr-10"
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert className="bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full font-semibold h-11"
                  style={{ background: BRAND_COLORS.gradients.primary }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Autenticando...
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">Credenciais de demonstração</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg" style={{ background: `${BRAND_COLORS.accent}30` }}>
                  <p className="text-sm text-gray-700 mb-2">Use as seguintes credenciais:</p>
                  <div className="space-y-1 font-mono text-xs">
                    <div>Email: <span className="font-semibold">agente@peers.com.br</span></div>
                    <div>Senha: <span className="font-semibold">Peers@2025</span></div>
                  </div>
                </div>
              </form>
            </CardContent>
                      </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
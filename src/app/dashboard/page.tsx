// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight,
  Bot,
  Brain,
  Shield,
  Zap,
  Code,
  GitBranch,
  Sparkles,
  Users,
  ChevronRight,
  Rocket,
  Target,
  BarChart3,
  Lock,
  LogOut,
  Activity,
  Clock,
  TrendingUp,
  Bug,
  Package,
  Server,
  Database,
  BookOpen,
  TestTube,
  FileText,
  GitCommit,
  Cpu,
  Search,
  Settings,
  Bell,
  HelpCircle,
  Menu,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react'

const BRAND_COLORS = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
  white: '#FFFFFF',
  gradients: {
    primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
    secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
    subtle: 'linear-gradient(135deg, #f8fafb 0%, #e8f4f8 100%)'
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Stats animados
  const [stats, setStats] = useState({
    repos: 0,
    problems: 0,
    hours: 0,
    improvements: 0
  })

  // Verificar autenticação
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('peers_authenticated')
    const email = localStorage.getItem('peers_user')
    
    if (!isAuthenticated || isAuthenticated !== 'true') {
      router.push('/login')
    } else {
      setUserEmail(email || 'agente@peers.com.br')
    }
  }, [router])

  // Animação dos números
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        repos: prev.repos < 523 ? prev.repos + 23 : 523,
        problems: prev.problems < 1247 ? prev.problems + 57 : 1247,
        hours: prev.hours < 342 ? prev.hours + 17 : 342,
        improvements: prev.improvements < 2456 ? prev.improvements + 113 : 2456
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('peers_authenticated')
    localStorage.removeItem('peers_user')
    router.push('/login')
  }

  const navigateToAnalysis = () => {
    router.push('/code-analysis')
  }

  const navigateToGeneration = () => {
    router.push('/code-generation')
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
              
              <div className="w-px h-12 bg-gray-200 mx-2" />
              
              <div>
                <h1 className="text-2xl font-bold flex items-center space-x-2" style={{ color: BRAND_COLORS.primary }}>
                  <Bot className="h-6 w-6" style={{ color: BRAND_COLORS.secondary }} />
                  <span>Code .IA</span>
                </h1>
                <p className="text-sm text-gray-500">Escolha sua ferramenta de análise</p>
              </div>
            </div>
            
            {/* Status e User Menu */}
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="hidden lg:flex">
                <Activity className="mr-1 h-3 w-3 text-green-500" />
                Sistema Online
              </Badge>
              
              <div className="hidden md:flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {userEmail}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-16" style={{ background: BRAND_COLORS.gradients.subtle }}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4" style={{ 
              background: `${BRAND_COLORS.secondary}20`,
              color: BRAND_COLORS.primary,
              border: `1px solid ${BRAND_COLORS.secondary}`
            }}>
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Multi-Agent AI
            </Badge>
            
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6" 
                style={{ color: BRAND_COLORS.primary }}>
              Escolha sua Ferramenta
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600">
              Selecione entre análise profunda ou geração automatizada de código
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 lg:py-8 bg-white border-y">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: BRAND_COLORS.primary }}>
                {stats.repos}+
              </div>
              <div className="text-xs lg:text-sm text-gray-600 flex items-center justify-center">
                <GitBranch className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                Repositórios
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: '#dc2626' }}>
                {stats.problems.toLocaleString()}+
              </div>
              <div className="text-xs lg:text-sm text-gray-600 flex items-center justify-center">
                <Bug className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                Problemas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: '#16a34a' }}>
                {stats.hours}h
              </div>
              <div className="text-xs lg:text-sm text-gray-600 flex items-center justify-center">
                <Clock className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                Economizadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: '#2563eb' }}>
                {stats.improvements.toLocaleString()}
              </div>
              <div className="text-xs lg:text-sm text-gray-600 flex items-center justify-center">
                <TrendingUp className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                Melhorias
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Cards */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            
            {/* Card: Análise de Código */}
            <Card 
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={navigateToAnalysis}
            >
              <div className="h-1 lg:h-2" style={{ background: BRAND_COLORS.gradients.primary }}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                    style={{ background: `${BRAND_COLORS.primary}10` }}
                  >
                    <Code className="h-6 w-6 lg:h-8 lg:w-8" style={{ color: BRAND_COLORS.primary }} />
                  </div>
                  <Badge style={{ 
                    background: `${BRAND_COLORS.secondary}20`,
                    color: BRAND_COLORS.primary
                  }}>
                    Mais Popular
                  </Badge>
                </div>
                <CardTitle className="text-xl lg:text-2xl" style={{ color: BRAND_COLORS.primary }}>
                  Análise de Código
                </CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Analise repositórios completos e identifique melhorias com IA multi-agentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 lg:space-y-3">
                  {[
                    { icon: Shield, text: "Análise de vulnerabilidades" },
                    { icon: Cpu, text: "Otimização de performance" },
                    { icon: GitCommit, text: "Revisão de arquitetura" },
                    { icon: FileText, text: "Relatórios em PDF" },
                    { icon: TestTube, text: "Testes automatizados" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs lg:text-sm text-gray-700">
                      <feature.icon className="mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" 
                                   style={{ color: BRAND_COLORS.secondary }} />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full font-semibold group-hover:scale-105 transition-transform"
                    style={{ background: BRAND_COLORS.gradients.primary }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Iniciar Análise
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Card: Geração de Código */}
            <Card 
              className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
              onClick={navigateToGeneration}
            >
              <div className="h-1 lg:h-2" style={{ background: BRAND_COLORS.gradients.secondary }}></div>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                    style={{ background: `${BRAND_COLORS.secondary}20` }}
                  >
                    <Sparkles className="h-6 w-6 lg:h-8 lg:w-8" style={{ color: BRAND_COLORS.primary }} />
                  </div>
                  <Badge style={{ 
                    background: `${BRAND_COLORS.primary}10`,
                    color: BRAND_COLORS.primary
                  }}>
                    Novo
                  </Badge>
                </div>
                <CardTitle className="text-xl lg:text-2xl" style={{ color: BRAND_COLORS.primary }}>
                  Geração de Código
                </CardTitle>
                <CardDescription className="text-sm lg:text-base">
                  Gere aplicações completas a partir de requisitos em linguagem natural
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 lg:space-y-3">
                  {[
                    { icon: Package, text: "Aplicações full-stack" },
                    { icon: Server, text: "APIs RESTful" },
                    { icon: Database, text: "Modelagem de dados" },
                    { icon: BookOpen, text: "Documentação técnica" },
                    { icon: Rocket, text: "Deploy-ready" }
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs lg:text-sm text-gray-700">
                      <feature.icon className="mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" 
                                   style={{ color: BRAND_COLORS.primary }} />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full font-semibold group-hover:scale-105 transition-transform"
                    style={{ 
                      background: BRAND_COLORS.gradients.secondary,
                      color: BRAND_COLORS.primary 
                    }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Código
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4" style={{ color: BRAND_COLORS.primary }}>
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <BarChart3 className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                <span className="text-xs">Relatórios</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <Settings className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                <span className="text-xs">Configurações</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                <span className="text-xs">Documentação</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                <HelpCircle className="h-5 w-5" style={{ color: BRAND_COLORS.primary }} />
                <span className="text-xs">Suporte</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-white py-6">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-600">
            © 2025 PEERS Consulting + Technology. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
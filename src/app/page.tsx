// src/app/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot,
  Code,
  Shield,
  TestTube,
  FileText,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  Layers,
  Bug,
  FileCode,
  GitBranch,
  Users,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Brain,
  Cpu,
  Database,
  Lock,
  RefreshCw,
  Terminal,
  ChevronRight
} from 'lucide-react'
import { useRouter } from 'next/navigation'

// Cores da marca PEERS
const BRAND_COLORS = {
  primary: '#011334',     // PEERS Neue Blue
  secondary: '#E1FF00',   // PEERS Neue Lime
  accent: '#D8E8EE',      // Serene Blue
  white: '#FFFFFF',
  
  gradients: {
    primary: 'linear-gradient(135deg, #011334 0%, #022558 100%)',
    secondary: 'linear-gradient(135deg, #E1FF00 0%, #C8E600 100%)',
    mixed: 'linear-gradient(135deg, #011334 0%, #022558 50%, #033670 100%)',
    subtle: 'linear-gradient(135deg, #f8fafb 0%, #e8f4f8 100%)',
    hero: 'linear-gradient(180deg, #011334 0%, #022558 50%, #011334 100%)'
  }
}

export default function HomePage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    repos: 0,
    problems: 0,
    hours: 0,
    improvements: 0
  })

  useEffect(() => {
    // Animação dos números
    const interval = setInterval(() => {
      setStats(prev => ({
        repos: prev.repos < 500 ? prev.repos + 10 : 500,
        problems: prev.problems < 1200 ? prev.problems + 30 : 1200,
        hours: prev.hours < 300 ? prev.hours + 8 : 300,
        improvements: prev.improvements < 2400 ? prev.improvements + 60 : 2400
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Layers,
      title: 'Clean Code & SOLID',
      description: 'Análise profunda de arquitetura, padrões de design e princípios SOLID',
      color: 'blue'
    },
    {
      icon: TestTube,
      title: 'Testes Unitários',
      description: 'Cobertura de testes, qualidade e geração automática de casos de teste',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Segurança OWASP',
      description: 'Identificação de vulnerabilidades seguindo padrões OWASP Top 10',
      color: 'red'
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Otimização de código, análise de complexidade e eficiência',
      color: 'yellow'
    },
    {
      icon: FileText,
      title: 'Documentação',
      description: 'Análise e geração de docstrings, comentários e documentação técnica',
      color: 'purple'
    },
    {
      icon: Bug,
      title: 'Débito Técnico',
      description: 'Identificação e priorização de débitos técnicos para refatoração',
      color: 'orange'
    }
  ]

  const analysisTypes = [
    { 
      name: 'Clean Code', 
      value: 'relatorio_cleancode',
      icon: Code,
      description: 'Boas práticas e código limpo'
    },
    { 
      name: 'SOLID', 
      value: 'relatorio_solid',
      icon: Layers,
      description: 'Princípios de design'
    },
    { 
      name: 'Performance', 
      value: 'relatorio_performance_eficiencia',
      icon: Zap,
      description: 'Otimização e eficiência'
    },
    { 
      name: 'Segurança', 
      value: 'relatorio_owasp',
      icon: Shield,
      description: 'Vulnerabilidades OWASP'
    },
    { 
      name: 'Testes', 
      value: 'relatorio_teste_unitario',
      icon: TestTube,
      description: 'Cobertura de testes'
    },
    { 
      name: 'Documentação', 
      value: 'relatorio_documentacao',
      icon: FileText,
      description: 'Análise de docs'
    }
  ]

  return (
    <div className="min-h-screen" style={{ background: BRAND_COLORS.gradients.subtle }}>
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo PEERS */}
              <div className="p-3 rounded-lg" style={{ background: BRAND_COLORS.primary }}>
                <img 
                  src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                  alt="PEERS" 
                  className="w-24 h-12 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `
                        <div style="color: white; font-weight: 900; font-size: 1.5rem; letter-spacing: 0.05em;">
                          P<span style="color: #E1FF00">EE</span>RS
                        </div>
                      `
                    }
                  }}
                />
              </div>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button className="text-gray-600 hover:text-gray-900 font-medium">Dashboard</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">Demo</button>
              <button className="text-gray-600 hover:text-gray-900 font-medium">Produção</button>
              <Button 
                className="font-semibold"
                style={{ background: BRAND_COLORS.primary }}
                onClick={() => router.push('/test')}
              >
                Entrar com Microsoft
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            background: BRAND_COLORS.gradients.hero,
            clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'
          }}
        />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge 
              className="mb-6 font-medium"
              style={{ 
                background: `${BRAND_COLORS.secondary}20`,
                color: BRAND_COLORS.primary,
                border: `1px solid ${BRAND_COLORS.secondary}`
              }}
            >
              <Bot className="mr-2 h-4 w-4" />
              Powered by Multi-Agent AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-black mb-6" style={{ color: BRAND_COLORS.primary }}>
              Análise de Código
            </h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              <span style={{ color: '#2563eb' }}>Inteligente</span> & <span style={{ color: '#2563eb' }}>Automatizada</span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Plataforma de análise de código com IA multi-agentes que identifica problemas,
              sugere melhorias e automatiza refatorações seguindo as melhores práticas da
              engenharia de software.
            </p>
            
            <div className="flex justify-center space-x-4">
              <Button 
                size="lg"
                className="font-semibold text-white h-12 px-8"
                style={{ background: BRAND_COLORS.primary }}
                onClick={() => router.push('/test')}
              >
                <Play className="mr-2 h-5 w-5" />
                Entrar com Microsoft
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="font-semibold h-12 px-8"
                onClick={() => router.push('/dashboard')}
              >
                Ver Dashboard
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-12">
            <Badge 
              className="font-medium"
              style={{ 
                background: `${BRAND_COLORS.secondary}20`,
                color: BRAND_COLORS.primary,
                border: `1px solid ${BRAND_COLORS.secondary}`
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Multi-Agent AI
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: BRAND_COLORS.primary }}>
                {stats.repos}+
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                <GitBranch className="mr-2 h-4 w-4" />
                Repositórios Analisados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#dc2626' }}>
                {stats.problems.toLocaleString()}+
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                <Bug className="mr-2 h-4 w-4" />
                Problemas Detectados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#16a34a' }}>
                {stats.hours}+
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                <Clock className="mr-2 h-4 w-4" />
                Horas Economizadas
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: '#2563eb' }}>
                {stats.improvements.toLocaleString()}+
              </div>
              <div className="text-gray-600 flex items-center justify-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                Melhorias Implementadas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: BRAND_COLORS.primary }}>
              Recursos Avançados de Análise
            </h2>
            <p className="text-xl text-gray-600">
              Nossa IA analisa seu código usando metodologias comprovadas e gera soluções automatizadas
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer group"
                onClick={() => router.push('/test')}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div 
                      className="p-3 rounded-lg group-hover:scale-110 transition-transform"
                      style={{ background: `${BRAND_COLORS.secondary}20` }}
                    >
                      <feature.icon className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Disponível
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: BRAND_COLORS.primary }}>
              Tipos de Análise Disponíveis
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o tipo de análise mais adequado para o seu projeto
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {analysisTypes.map((type, index) => (
              <Card 
                key={index}
                className="border-2 hover:border-gray-300 cursor-pointer group transition-all"
                onClick={() => router.push(`/test?type=${type.value}`)}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="mx-auto mb-4 p-4 rounded-full w-fit group-hover:scale-110 transition-transform"
                    style={{ background: `${BRAND_COLORS.accent}` }}
                  >
                    <type.icon className="h-8 w-8" style={{ color: BRAND_COLORS.primary }} />
                  </div>
                  <h3 className="font-semibold mb-1">{type.name}</h3>
                  <p className="text-xs text-gray-500">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card 
            className="border-0 shadow-xl overflow-hidden"
            style={{ background: BRAND_COLORS.gradients.primary }}
          >
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">
                Comece a Analisar Seu Código Agora
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Junte-se a centenas de equipes que já economizam tempo e melhoram a qualidade do código com nossa plataforma
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  size="lg"
                  className="font-semibold h-12 px-8"
                  style={{ 
                    background: BRAND_COLORS.secondary,
                    color: BRAND_COLORS.primary
                  }}
                  onClick={() => router.push('/test')}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Começar Análise Gratuita
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="font-semibold h-12 px-8 bg-white/10 text-white border-white/30 hover:bg-white/20"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demo
                </Button>
              </div>
              
              <div className="mt-12 flex justify-center space-x-8 text-white/80">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  <span>Setup em 2 minutos</span>
                </div>
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded" style={{ background: BRAND_COLORS.primary }}>
                <img 
                  src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                  alt="PEERS" 
                  className="w-20 h-10 object-contain"
                />
              </div>
              <div>
                <div className="text-sm text-gray-600">© 2024 PEERS Consulting + Technology</div>
                <div className="text-xs text-gray-500">Transformando código com inteligência artificial</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Termos</a>
              <a href="#" className="hover:text-gray-900">Privacidade</a>
              <a href="#" className="hover:text-gray-900">Suporte</a>
              <a href="#" className="hover:text-gray-900">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
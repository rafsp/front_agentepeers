'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  CheckCircle, 
  Code, 
  Shield, 
  Target, 
  Brain,
  Github,
  BarChart3,
  Play,
  Zap,
  Users,
  Star,
  Globe,
  Bot,
  Clock
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { PeersLogo } from '@/components/peers-logo'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, login, authMode, switchToDemo, switchToProduction } = useAuth()

  if (isAuthenticated) {
    redirect('/dashboard')
  }

  const features = [
    {
      icon: Code,
      title: 'Análise de Design',
      description: 'Auditoria técnica profunda usando princípios SOLID e Clean Architecture',
      details: ['Detecção de code smells', 'Análise de complexidade', 'Padrões GoF', 'Refatoração automática']
    },
    {
      icon: Shield,
      title: 'Testes Unitários',
      description: 'Geração automática de testes completos com casos de borda',
      details: ['Casos happy path', 'Validação de bordas', 'Tratamento de erros', 'Cobertura otimizada']
    },
    {
      icon: Target,
      title: 'Segurança Terraform',
      description: 'Análise especializada de segurança para Infrastructure as Code',
      details: ['Menor privilégio', 'Validação de criptografia', 'Análise de rede', 'Gestão de segredos']
    }
  ]

  const stats = [
    { value: '500+', label: 'Repositórios Analisados', icon: Code, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { value: '1.2K+', label: 'Problemas Detectados', icon: BarChart3, color: 'text-red-600', bgColor: 'bg-red-50' },
    { value: '300+', label: 'PRs Automatizados', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
    { value: '2.4K+', label: 'Horas Economizadas', icon: Clock, color: 'text-purple-600', bgColor: 'bg-purple-50' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Logo do GitHub sem texto */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-4 bg-slate-900 rounded-2xl shadow-lg">
                <img 
                  src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                  alt="Peers Logo" 
                  className="w-32 h-16 object-contain"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement
                    target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwIiB5PSIyNSIgZmlsbD0iIzAwZmZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UEVFUlM8L3RleHQ+PC9zdmc+"
                  }}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              
              {/* Auth Mode Selector */}
              <div className="flex gap-2">
                <Button
                  variant={authMode === 'demo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={switchToDemo}
                >
                  Demo
                </Button>
                <Button
                  variant={authMode === 'production' ? 'default' : 'outline'}
                  size="sm"
                  onClick={switchToProduction}
                >
                  Produção
                </Button>
              </div>

              <Button onClick={login}>
                {authMode === 'demo' ? 'Começar Demo' : 'Entrar com Microsoft'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Star className="h-3 w-3 mr-1" />
              Powered by Multi-Agent AI
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Análise de Código
              <br />
              <span className="text-blue-600">Inteligente & Automatizada</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Plataforma de análise de código com IA multi-agentes que identifica problemas, 
              sugere melhorias e automatiza refatorações seguindo as melhores práticas da engenharia de software.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={login} className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-5 w-5 mr-2" />
                {authMode === 'demo' ? 'Começar Análise Gratuita' : 'Entrar com Microsoft'}
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/dashboard')}>
                Ver Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Usando componente igual ao dashboard */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-1" />
              Powered by Multi-Agent AI
            </Badge>
          </div>
          
          {/* Stats Grid - Igual ao dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Recursos Avançados de Análise
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Nossa IA analisa seu código usando metodologias comprovadas e gera soluções automatizadas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-4">{feature.description}</p>
                    <div className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="text-sm text-slate-600">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Analysis Types Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Tipos de Análise Disponíveis
            </h2>
            <p className="text-xl text-slate-600">
              Escolha o tipo de análise mais adequado para seu projeto
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((analysis, index) => {
              const Icon = analysis.icon
              return (
                <Card 
                  key={index}
                  className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push(`/dashboard/new-analysis?type=${analysis.title.toLowerCase().replace(/\s+/g, '_')}`)
                    } else {
                      login()
                    }
                  }}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-slate-900">{analysis.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-slate-600 mb-4">{analysis.description}</p>
                    <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                      Iniciar Análise
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para Transformar seu Código?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Comece agora mesmo com nossa análise gratuita e veja como a IA pode melhorar a qualidade do seu código
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={login} className="bg-white text-blue-600 hover:bg-slate-50">
                <Play className="h-5 w-5 mr-2" />
                {authMode === 'demo' ? 'Começar Análise Gratuita' : 'Entrar com Microsoft'}
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" onClick={() => router.push('/dashboard')}>
                <BarChart3 className="h-5 w-5 mr-2" />
                Ver Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-5 bg-slate-900 rounded-2xl shadow-xl">
                  <img 
                    src="https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg" 
                    alt="Peers Logo" 
                    className="w-40 h-20 object-contain"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement
                      target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgMTAwIDUwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjUwIiB5PSIyNSIgZmlsbD0iI2ZmZmZmZiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UEVFUlM8L3RleHQ+PC9zdmc+"
                    }}
                  />
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Plataforma inteligente para análise automatizada de código com IA multi-agentes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Análises</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Design & Arquitetura</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Testes Unitários</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança Terraform</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Funcionalidades</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Análises Agendadas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integração GitHub</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">Links Rápidos</h4>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300 hover:text-white h-8 px-0" onClick={() => router.push('/dashboard')}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-slate-300 hover:text-white h-8 px-0" onClick={() => router.push('/dashboard/settings')}>
                  <Globe className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Peers AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
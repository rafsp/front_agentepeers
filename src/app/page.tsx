'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
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
  Globe
} from 'lucide-react'

export default function ModernLandingPage() {
  const router = useRouter()

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
    { value: '500+', label: 'Repositórios Analisados' },
    { value: '1.2K+', label: 'Problemas Detectados' },
    { value: '300+', label: 'PRs Automatizados' },
    { value: '2.4K+', label: 'Horas Economizadas' }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">Peers AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button onClick={() => router.push('/dashboard/new-analysis')}>
                Começar Análise
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
              <Button size="lg" onClick={() => router.push('/dashboard/new-analysis')} className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-5 w-5 mr-2" />
                Começar Análise Gratuita
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/dashboard')}>
                Ver Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
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
                  onClick={() => router.push(`/dashboard/new-analysis?type=${analysis.title.toLowerCase().replace(/\s+/g, '_')}`)}
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
              <Button size="lg" variant="secondary" onClick={() => router.push('/dashboard/new-analysis')} className="bg-white text-blue-600 hover:bg-slate-50">
                <Play className="h-5 w-5 mr-2" />
                Começar Análise Gratuita
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
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-white">Peers AI</span>
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
// app/page.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  PanelLeft,
  PanelLeftClose,
  ChevronDown,
  Activity
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

export default function HomePage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen">
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
                  <p className="text-sm text-gray-500">Transforme código com IA multi-agentes</p>
                </div>
              </div>
            </div>
            
            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Recursos</a>
              <a href="#benefits" className="text-gray-600 hover:text-gray-900 transition">Benefícios</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition">Contato</a>
              
              <Button 
                onClick={() => router.push('/login')}
                className="font-semibold"
                style={{ background: BRAND_COLORS.gradients.primary }}
              >
                <Lock className="mr-2 h-4 w-4" />
                Acessar Plataforma
              </Button>
            </nav>

            {/* Botão Login Mobile */}
            <Button 
              onClick={() => router.push('/login')}
              className="font-semibold md:hidden"
              size="sm"
              style={{ background: BRAND_COLORS.gradients.primary }}
            >
              <Lock className="mr-1 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="pt-20 pb-20 px-6"
        style={{ background: BRAND_COLORS.gradients.hero }}
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center text-white">
            <Badge 
              className="mb-6 px-4 py-2"
              style={{ 
                background: BRAND_COLORS.secondary,
                color: BRAND_COLORS.primary 
              }}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Multi-Agent AI
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Transforme seu Código com
              <span className="block mt-2" style={{ color: BRAND_COLORS.secondary }}>
                Inteligência Artificial
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
              Plataforma avançada de análise e geração de código utilizando 
              agentes inteligentes especializados para otimizar seu desenvolvimento
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/login')}
                className="font-semibold px-8 h-12"
                style={{ 
                  background: BRAND_COLORS.secondary,
                  color: BRAND_COLORS.primary 
                }}
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="font-semibold px-8 h-12 bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Saiba Mais
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: BRAND_COLORS.primary }}>
                500+
              </div>
              <div className="text-gray-600">Repositórios Analisados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: BRAND_COLORS.secondary }}>
                98%
              </div>
              <div className="text-gray-600">Taxa de Precisão</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: BRAND_COLORS.primary }}>
                24/7
              </div>
              <div className="text-gray-600">Disponibilidade</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: BRAND_COLORS.secondary }}>
                10x
              </div>
              <div className="text-gray-600">Mais Rápido</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: BRAND_COLORS.primary }}>
              Recursos Poderosos
            </h2>
            <p className="text-xl text-gray-600">
              Tudo que você precisa para elevar a qualidade do seu código
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ background: `${BRAND_COLORS.secondary}20` }}>
                  <Code className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <CardTitle>Análise Profunda</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Análise completa de repositórios com identificação de vulnerabilidades, 
                  problemas de performance e sugestões de melhorias.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ background: `${BRAND_COLORS.primary}10` }}>
                  <Brain className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <CardTitle>IA Multi-Agentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Múltiplos agentes especializados trabalham em conjunto para 
                  fornecer análises precisas e soluções otimizadas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ background: `${BRAND_COLORS.secondary}20` }}>
                  <Rocket className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <CardTitle>Geração Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Gere código completo, testes automatizados e documentação 
                  a partir de requisitos em linguagem natural.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ background: `${BRAND_COLORS.primary}10` }}>
                  <Shield className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <CardTitle>Segurança First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Identifique vulnerabilidades de segurança e receba 
                  recomendações para corrigi-las antes que se tornem problemas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ background: `${BRAND_COLORS.secondary}20` }}>
                  <Zap className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <CardTitle>Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Otimize a performance do seu código com sugestões 
                  inteligentes baseadas nas melhores práticas do mercado.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                     style={{ background: `${BRAND_COLORS.primary}10` }}>
                  <BarChart3 className="h-6 w-6" style={{ color: BRAND_COLORS.primary }} />
                </div>
                <CardTitle>Relatórios Detalhados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receba relatórios completos em PDF com métricas, 
                  gráficos e recomendações acionáveis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ background: BRAND_COLORS.gradients.primary }}>
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Transformar seu Código?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de desenvolvedores que já estão usando nossa plataforma 
            para criar código melhor, mais rápido e mais seguro.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="font-semibold px-10 h-12"
            style={{ 
              background: BRAND_COLORS.secondary,
              color: BRAND_COLORS.primary 
            }}
          >
            Acessar Plataforma Agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-4">
           
          </div>
          <p className="text-sm">
            © 2025 PEERS Consulting + Technology. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
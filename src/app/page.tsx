'use client'

import React from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Code, Shield, Zap } from 'lucide-react'
import { redirect } from 'next/navigation'

export default function HomePage() {
  const { isAuthenticated, login, authMode, switchToDemo, switchToProduction } = useAuth()

  if (isAuthenticated) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary rounded-2xl">
              <Bot className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI Code Analysis Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Análise inteligente de código com IA multi-agentes. Automatize revisões, detecte problemas e melhore a qualidade do seu código.
          </p>
          
          {/* Auth Mode Selector */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={authMode === 'demo' ? 'default' : 'outline'}
              onClick={switchToDemo}
            >
              Modo Demo
            </Button>
            <Button
              variant={authMode === 'production' ? 'default' : 'outline'}
              onClick={switchToProduction}
            >
              Modo Produção
            </Button>
          </div>

          <Button onClick={login} size="lg" className="px-8 py-3">
            {authMode === 'demo' ? 'Entrar em Demo' : 'Entrar com Microsoft'}
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Code className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">Análise Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                IA multi-agentes analisa seu código automaticamente, identificando problemas e sugerindo melhorias.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <CardTitle className="text-lg">Tempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Acompanhe o progresso das análises em tempo real com atualizações instantâneas.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <CardTitle className="text-lg">Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Detecta vulnerabilidades de segurança e sugere correções baseadas em best practices.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Bot className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Relatórios PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gere relatórios profissionais em PDF com análises detalhadas e recomendações.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
// src/app/login/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND } from '@/components/layout/sidebar'
import unifiedService from '@/lib/api/unified-service'
import { Sparkles, Loader2, AlertCircle, Mail, Layers, Calendar, AlertTriangle, Shield, LayoutTemplate, ArrowRight, Code } from 'lucide-react'

const PEERS_LOGO = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function extractEmpresa(email: string): string {
  // rafael.pereira@peers.com.br → peers
  // user@aegea.saneamento.com.br → aegea
  const domain = email.split('@')[1] || ''
  const parts = domain.split('.')
  return parts[0] || ''
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoError, setLogoError] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('peers_authenticated') === 'true') router.push(redirect)
  }, [router, redirect])

  const handleLogin = async () => {
    if (!email.trim()) { setError('Informe seu e-mail corporativo'); return }
    if (!email.includes('@')) { setError('E-mail inválido'); return }
    if (!password) { setError('Informe a senha'); return }
    if (password !== 'Peers@2026') { setError('Senha incorreta'); return }
    setError(''); setIsLoading(true)

    try {
      const empresa = extractEmpresa(email.trim())
      const result = await unifiedService.login(email.trim(), empresa)

      if (!result.success) { setError(result.message || 'Falha na autenticação'); setIsLoading(false); return }

      const userName = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const emp = result.empresa || empresa

      const save = (k: string, v: string) => { setCookie(k, v, 7); localStorage.setItem(k, v) }
      save('peers_authenticated', 'true')
      save('peers_auth_method', 'credentials')
      save('peers_user_name', userName)
      save('peers_user_email', email.trim())
      save('peers_empresa', emp)

      unifiedService.setUserContext({ name: userName, email: email.trim(), empresa: emp })

      await unifiedService.getProjects()
      router.push(redirect)
    } catch {
      setError('Erro de conexão com o servidor.')
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Layers, title: 'Orquestração de Épicos', desc: 'Geração e refinamento com IA de backlog completo' },
    { icon: LayoutTemplate, title: 'Protótipos Interativos', desc: 'HTML funcional gerado automaticamente' },
    { icon: Calendar, title: 'Timeline Executiva', desc: 'Cronograma visual com alocação por semana' },
    { icon: AlertTriangle, title: 'Análise de Riscos', desc: 'Premissas e planos de mitigação automatizados' },
    { icon: Shield, title: 'Gestão de Acessos', desc: 'RBAC com owner, editor e viewer por projeto' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* LEFT — Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden" style={{ background: BRAND.primary }}>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10">
          {!logoError ? <img src={PEERS_LOGO} alt="PEERS" className="h-8 w-auto opacity-90" onError={() => setLogoError(true)} />
            : <div className="flex items-center gap-2"><Code className="w-6 h-6 text-white" /><span className="text-xl font-black text-white tracking-wider">PEERS</span></div>}
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8" style={{ background: `${BRAND.secondary}15`, color: BRAND.secondary }}>
            <Sparkles className="w-4 h-4" /> Plataforma de Agentes Inteligentes
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Transforme seu código com <span style={{ color: BRAND.secondary }}>Inteligência Artificial</span>
          </h1>
          <p className="text-white/60 text-lg">
            Orquestração inteligente de épicos, features, timeline e riscos com agentes especializados.
          </p>
          <div className="mt-10 space-y-3">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-5 py-3">
                  <div className="p-2 rounded-lg" style={{ background: `${BRAND.secondary}20` }}><Icon className="w-5 h-5" style={{ color: BRAND.secondary }} /></div>
                  <div><p className="text-white font-semibold text-sm">{f.title}</p><p className="text-white/40 text-xs">{f.desc}</p></div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="relative z-10 text-white/30 text-sm">© 2026 PEERS Consulting + Technology</p>
      </div>

      {/* RIGHT — Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            {!logoError ? <img src={PEERS_LOGO} alt="PEERS" className="h-8 w-auto mx-auto opacity-70" onError={() => setLogoError(true)} />
              : <span className="text-xl font-black tracking-wider" style={{ color: BRAND.primary }}>PEERS</span>}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold" style={{ color: BRAND.primary }}>Code<span className="text-gray-400">.</span>IA</h2>
            <p className="text-sm text-gray-400 mt-1">Acesse sua conta para continuar</p>
          </div>

          {error ? (
            <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Mail className="w-3.5 h-3.5" /> E-mail Corporativo *
              </label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="seu.email@empresa.com.br"
                onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#011334]/30 focus:ring-2 focus:ring-[#011334]/10 transition-all"
                autoFocus autoComplete="email" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <Shield className="w-3.5 h-3.5" /> Senha *
              </label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder="••••••••"
                onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#011334]/30 focus:ring-2 focus:ring-[#011334]/10 transition-all"
                autoComplete="current-password" />
            </div>

            <button onClick={handleLogin} disabled={isLoading || !email.trim() || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 hover:shadow-lg transition-all"
              style={{ background: BRAND.primary }}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {isLoading ? 'Conectando...' : 'Entrar na Plataforma'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400">
              Ao entrar, você concorda com os <span className="underline cursor-pointer">termos de uso</span> da plataforma
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-300 uppercase tracking-widest">Configurações avançadas</p>
            <button onClick={() => {
              const url = prompt('URL do backend:', localStorage.getItem('codeai_api_url') || '')
              if (url) { localStorage.setItem('codeai_api_url', url); alert('Salvo. Recarregue a página.') }
            }} className="mt-2 text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer">
              Alterar endpoint do backend
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#011334' }} /></div>}>
    <LoginContent />
  </Suspense>
}
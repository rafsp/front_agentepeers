// src/app/login/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BRAND } from '@/components/layout/sidebar'
import unifiedService from '@/lib/api/unified-service'
import { Sparkles, Loader2, AlertCircle, Mail, Layers, Calendar, AlertTriangle, Shield, LayoutTemplate, ArrowRight, Code, Lock, ChevronDown, ChevronUp } from 'lucide-react'

const PEERS_LOGO = 'https://d3fh32tca5cd7q.cloudfront.net/wp-content/uploads/2025/03/logo.svg'

// Azure AD config
const AZURE_CLIENT_ID = '4dcad7f8-e4d5-44e1-8d1e-3c1ce8af602a'
const AZURE_TENANT_ID = 'b9e68103-376a-402b-87f6-a3b10658e7c4'

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function extractEmpresa(email: string): string {
  const domain = email.split('@')[1] || ''
  return domain.split('.')[0] || ''
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const authError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSSOLoading, setIsSSOLoading] = useState(false)
  const [error, setError] = useState(authError ? decodeURIComponent(authError) : '')
  const [logoError, setLogoError] = useState(false)
  const [showEmailLogin, setShowEmailLogin] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('peers_authenticated') === 'true') router.push(redirect)
  }, [router, redirect])

  // SSO — Microsoft Entra ID
  const handleSSO = () => {
    setIsSSOLoading(true)
    const getRedirectUri = () => {
      if (typeof window === 'undefined') return ''
      return `${window.location.origin}/api/auth/callback/azure-ad`
    }
    const redirectUri = encodeURIComponent(getRedirectUri())
    const scope = encodeURIComponent('openid profile email User.Read')
    const state = encodeURIComponent(JSON.stringify({ redirect, email: email.trim() || '' }))
    // login_hint: se o usuário já digitou email, preenche no Microsoft
    const hint = email.trim() ? `&login_hint=${encodeURIComponent(email.trim())}` : ''
    const authUrl = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize?` +
      `client_id=${AZURE_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${redirectUri}` +
      `&response_mode=query` +
      `&scope=${scope}` +
      `&state=${state}` +
      `&prompt=select_account` +
      hint
    window.location.href = authUrl
  }

  // Email login — sem senha fixa, valida no backend
  const handleEmailLogin = async () => {
    if (!email.trim()) { setError('Informe seu e-mail corporativo'); return }
    if (!email.includes('@')) { setError('E-mail inválido'); return }
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

      {/* RIGHT — Login */}
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
            {/* SSO — Botão principal */}
            <button onClick={handleSSO} disabled={isSSOLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-white text-sm font-bold disabled:opacity-60 hover:shadow-lg transition-all"
              style={{ background: BRAND.primary }}>
              {isSSOLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Redirecionando...</>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                  </svg>
                  Entrar com Microsoft
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">ou</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email login toggle */}
            <button onClick={() => setShowEmailLogin(!showEmailLogin)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
              <Mail className="w-4 h-4" /> Entrar com e-mail corporativo
              {showEmailLogin ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {/* Email login form — expandível */}
            {showEmailLogin ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Mail className="w-3.5 h-3.5" /> E-mail Corporativo *
                  </label>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="seu.email@empresa.com.br"
                    onKeyDown={e => { if (e.key === 'Enter') handleEmailLogin() }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#011334]/30 focus:ring-2 focus:ring-[#011334]/10 transition-all"
                    autoComplete="email" />
                </div>

                <button onClick={handleEmailLogin} disabled={isLoading || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-bold disabled:opacity-40 hover:shadow-md transition-all"
                  style={{ borderColor: BRAND.primary, color: BRAND.primary }}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {isLoading ? 'Conectando...' : 'Acessar'}
                </button>

                <p className="text-[10px] text-gray-400 text-center">
                  Acesso direto via e-mail — sem necessidade de senha
                </p>
              </div>
            ) : null}
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
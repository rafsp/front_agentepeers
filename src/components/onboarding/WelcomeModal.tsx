// src/components/onboarding/WelcomeModal.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  FileText, Bot, CheckCircle, Layers, GanttChart, Shield, 
  ArrowRight, Play, Sparkles, X
} from 'lucide-react'

// ============================================================================
// BRAND COLORS
// ============================================================================
const BRAND = {
  primary: '#011334',
  secondary: '#E1FF00',
  accent: '#D8E8EE',
}

// ============================================================================
// STORAGE KEYS
// ============================================================================
const STORAGE_KEY = 'peers_onboarding_completed'

// ============================================================================
// TIPOS
// ============================================================================
interface WelcomeModalProps {
  onClose: () => void
  onStartPipeline: () => void
}

// ============================================================================
// HOOK PARA CONTROLAR ONBOARDING
// ============================================================================
export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    // Verificar se é primeira vez
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      setIsFirstTime(true)
      setShowWelcome(true)
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShowWelcome(false)
    setIsFirstTime(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY)
    setIsFirstTime(true)
    setShowWelcome(true)
  }

  return {
    showWelcome,
    setShowWelcome,
    isFirstTime,
    completeOnboarding,
    resetOnboarding,
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export function WelcomeModal({ onClose, onStartPipeline }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    onClose()
  }

  const handleStartPipeline = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    onStartPipeline()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header com gradiente */}
        <div 
          className="p-6 pb-8 text-white relative"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1a3a5c 100%)` }}
        >
          {/* Botão fechar */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: BRAND.secondary, color: BRAND.primary }}
          >
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Bem-vindo ao PEERS CodeAI! 🎉
          </h2>
          <p className="text-white/80">
            Transforme documentos em planos de projeto estruturados com inteligência artificial.
          </p>
        </div>

        {/* Fluxo visual */}
        <div className="px-6 py-4 bg-slate-50 border-b">
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-indigo-500" />
              </div>
              <span className="text-xs text-slate-600 font-medium">Upload</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                <Bot className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs text-slate-600 font-medium">IA Analisa</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-300" />
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-slate-600 font-medium">Pronto!</span>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4">
            O que você pode criar:
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: FileText, label: 'Backlog de Épicos', color: '#6366f1' },
              { icon: Layers, label: 'Features Detalhadas', color: '#8b5cf6' },
              { icon: GanttChart, label: 'Cronograma Executivo', color: '#0ea5e9' },
              { icon: Shield, label: 'Riscos e Premissas', color: '#f59e0b' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: item.color }} />
                  <span className="text-sm text-slate-700">{item.label}</span>
                </div>
              )
            })}
          </div>

          {/* Dica */}
          <div 
            className="p-4 rounded-lg mb-6"
            style={{ background: `${BRAND.secondary}15`, border: `1px solid ${BRAND.secondary}30` }}
          >
            <p className="text-sm" style={{ color: BRAND.primary }}>
              <strong>💡 Dica:</strong> Você pode usar escopo de projeto, RFP, proposta comercial 
              ou qualquer documento que descreva o que precisa ser desenvolvido.
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 h-11"
            >
              <Play className="w-4 h-4 mr-2" />
              Explorar Primeiro
            </Button>
            <Button 
              onClick={handleStartPipeline}
              className="flex-1 h-11 text-white"
              style={{ background: BRAND.primary }}
            >
              Criar Meu Primeiro Projeto
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Checkbox não mostrar novamente */}
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-xs text-slate-500">Não mostrar novamente</span>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// COMPONENTE EMPTY STATE APRIMORADO
// ============================================================================
export function EmptyStateGuide({ onCreatePipeline }: { onCreatePipeline: () => void }) {
  return (
    <div className="text-center py-12 px-6">
      {/* Ícone principal */}
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1a3a5c 100%)` }}
      >
        <Sparkles className="w-10 h-10" style={{ color: BRAND.secondary }} />
      </div>

      <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>
        Comece Seu Primeiro Projeto
      </h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Em apenas 3 passos você terá um plano de projeto estruturado e profissional.
      </p>

      {/* Steps visuais */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {[
          { step: 1, label: 'Upload', sublabel: '1 min', icon: FileText },
          { step: 2, label: 'IA Processa', sublabel: '2-3 min', icon: Bot },
          { step: 3, label: 'Revisar', sublabel: 'Pronto!', icon: CheckCircle },
        ].map((item, i) => {
          const Icon = item.icon
          const colors = ['#6366f1', '#8b5cf6', '#10b981']
          return (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center">
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-2 text-white"
                  style={{ background: colors[i] }}
                >
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-700">{item.label}</span>
                <span className="text-xs text-slate-400">{item.sublabel}</span>
              </div>
              {i < 2 && (
                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Formatos aceitos */}
      <p className="text-sm text-slate-500 mb-6">
        Formatos aceitos: <span className="font-medium">PDF, DOCX, TXT</span> ou descreva em texto
      </p>

      {/* CTA Principal */}
      <Button 
        size="lg"
        onClick={onCreatePipeline}
        className="text-white px-8 h-12"
        style={{ background: BRAND.primary }}
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Criar Primeiro Pipeline
      </Button>

      {/* Dica */}
      <div 
        className="mt-8 p-4 rounded-xl max-w-lg mx-auto text-left"
        style={{ background: `${BRAND.secondary}10`, border: `1px solid ${BRAND.secondary}30` }}
      >
        <p className="text-sm" style={{ color: BRAND.primary }}>
          <strong>💡 Dica:</strong> Você pode usar o escopo do projeto, RFP, proposta comercial 
          ou qualquer documento que descreva o que precisa ser desenvolvido.
        </p>
      </div>

      {/* Links auxiliares */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm">
        <button className="text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <Play className="w-4 h-4" />
          Ver tutorial (2 min)
        </button>
        <span className="text-slate-300">|</span>
        <button className="text-slate-500 hover:text-slate-700 flex items-center gap-1">
          <FileText className="w-4 h-4" />
          Documentação
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE DE PROGRESSO DETALHADO
// ============================================================================
interface AnalysisProgressProps {
  progress: number
  message: string
  agentName: string
}

export function AnalysisProgress({ progress, message, agentName }: AnalysisProgressProps) {
  const steps = [
    { label: 'Lendo documento', threshold: 20 },
    { label: 'Identificando requisitos', threshold: 40 },
    { label: 'Estruturando épicos', threshold: 60 },
    { label: 'Gerando descrições', threshold: 80 },
    { label: 'Finalizando', threshold: 100 },
  ]

  const estimatedTime = progress < 30 ? '2-3 min' : progress < 60 ? '1-2 min' : progress < 90 ? '< 1 min' : 'Quase lá!'

  return (
    <div className="max-w-md mx-auto text-center py-8">
      {/* Agente Animado */}
      <div 
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse"
        style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1a3a5c 100%)` }}
      >
        <Bot className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-1">{agentName}</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>

      {/* Barra de Progresso */}
      <div className="relative mb-4">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${BRAND.primary} 0%, #6366f1 100%)`
            }}
          />
        </div>
        <span className="absolute right-0 -top-6 text-sm font-medium text-slate-600">
          {progress}%
        </span>
      </div>

      {/* Tempo Estimado */}
      <p className="text-sm text-slate-400 mb-6">
        Tempo estimado: <span className="font-medium text-slate-600">{estimatedTime}</span>
      </p>

      {/* Steps Detalhados */}
      <div className="text-left space-y-2">
        {steps.map((step, i) => {
          const isComplete = progress >= step.threshold
          const isCurrent = progress >= (steps[i - 1]?.threshold || 0) && progress < step.threshold
          
          return (
            <div 
              key={step.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isCurrent ? 'bg-indigo-50' : ''
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                isComplete 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-indigo-500 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-400'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-3 h-3" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <span className="text-xs">{i + 1}</span>
                )}
              </div>
              <span className={`text-sm ${
                isComplete ? 'text-green-600' : isCurrent ? 'text-indigo-600 font-medium' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE DE CELEBRAÇÃO
// ============================================================================
interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  stats: {
    epicos: number
    features?: number
  }
  projectName: string
}

export function CelebrationModal({ isOpen, onClose, stats, projectName }: CelebrationModalProps) {
  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] text-center">
        {/* Emoji grande */}
        <div className="text-6xl mb-4">🎉</div>
        
        <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>
          Parabéns!
        </h2>
        
        <p className="text-slate-600 mb-6">
          Seu projeto <strong>{projectName}</strong> foi processado com sucesso!
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: BRAND.primary }}>
              {stats.epicos}
            </div>
            <div className="text-sm text-slate-500">Épicos criados</div>
          </div>
          {stats.features && (
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: BRAND.primary }}>
                {stats.features}
              </div>
              <div className="text-sm text-slate-500">Features geradas</div>
            </div>
          )}
        </div>

        {/* Próximos passos */}
        <div 
          className="p-4 rounded-lg text-left mb-6"
          style={{ background: `${BRAND.secondary}15` }}
        >
          <p className="text-sm font-medium mb-2" style={{ color: BRAND.primary }}>
            Próximos passos:
          </p>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>✓ Revisar e ajustar os épicos gerados</li>
            <li>✓ Gerar features detalhadas</li>
            <li>✓ Criar cronograma executivo</li>
          </ul>
        </div>

        <Button 
          onClick={onClose}
          className="w-full h-11 text-white"
          style={{ background: BRAND.primary }}
        >
          Continuar para Revisão
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </DialogContent>
    </Dialog>
  )
}
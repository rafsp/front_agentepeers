// src/components/onboarding/OnboardingTour.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { 
  FileText, Bot, CheckCircle, Layers, GanttChart, Shield, 
  ArrowRight, ArrowLeft, Play, Sparkles, X, Upload, Zap,
  ChevronRight, Circle, CheckCircle2, Lightbulb, Clock,
  MousePointer, FileUp, Settings, Download
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
const STORAGE_KEYS = {
  welcomeCompleted: 'peers_welcome_completed',
  tourCompleted: 'peers_tour_completed',
  tourStep: 'peers_tour_step',
}

// ============================================================================
// TIPOS
// ============================================================================
interface TourStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  image?: string
  color: string
  tips?: string[]
}

// ============================================================================
// STEPS DO TOUR - A JORNADA COMPLETA
// ============================================================================
const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao PEERS CodeAI! 🎉',
    description: 'Transforme documentos em planos de projeto estruturados usando inteligência artificial. Vamos te guiar pelos primeiros passos.',
    icon: Sparkles,
    color: '#6366f1',
    tips: [
      'O processo completo leva cerca de 5-10 minutos',
      'Você pode pausar e continuar a qualquer momento',
      'Todos os dados são salvos automaticamente'
    ]
  },
  {
    id: 'upload',
    title: 'Passo 1: Envie seu Documento',
    description: 'Faça upload de um documento com os requisitos do projeto (PDF, DOCX ou TXT). Pode ser um escopo, RFP, proposta ou descrição do sistema.',
    icon: Upload,
    color: '#0ea5e9',
    tips: [
      'Quanto mais detalhado o documento, melhores os resultados',
      'Você também pode descrever o projeto em texto',
      'Arquivos até 10MB são aceitos'
    ]
  },
  {
    id: 'analysis',
    title: 'Passo 2: IA Processa',
    description: 'Nossa inteligência artificial analisa o documento e extrai automaticamente os épicos (grandes blocos de trabalho) do projeto.',
    icon: Bot,
    color: '#8b5cf6',
    tips: [
      'O processamento leva de 2 a 5 minutos',
      'Você pode acompanhar o progresso em tempo real',
      'A IA identifica requisitos, funcionalidades e dependências'
    ]
  },
  {
    id: 'epicos',
    title: 'Passo 3: Revise os Épicos',
    description: 'Revise os épicos gerados pela IA. Você pode aprovar, editar ou solicitar refinamentos antes de continuar.',
    icon: FileText,
    color: '#6366f1',
    tips: [
      'Épicos são grandes blocos de trabalho',
      'Cada épico será detalhado em features depois',
      'Você pode pedir ajustes à IA se necessário'
    ]
  },
  {
    id: 'features',
    title: 'Passo 4: Gere Features',
    description: 'A partir dos épicos aprovados, a IA cria features detalhadas com critérios de aceite, estimativas e dependências.',
    icon: Layers,
    color: '#8b5cf6',
    tips: [
      'Features são funcionalidades específicas',
      'Cada feature tem critérios de aceite claros',
      'Útil para planning de sprints'
    ]
  },
  {
    id: 'cronograma',
    title: 'Passo 5: Cronograma Executivo',
    description: 'Visualize um cronograma com timeline de entregas, marcos importantes e distribuição de esforço ao longo do tempo.',
    icon: GanttChart,
    color: '#0ea5e9',
    tips: [
      'Timeline visual estilo Gantt',
      'Identifica dependências entre entregas',
      'Exportável para apresentações'
    ]
  },
  {
    id: 'riscos',
    title: 'Passo 6: Riscos e Premissas',
    description: 'Mapeie riscos potenciais, premissas do projeto e planos de mitigação para uma gestão proativa.',
    icon: Shield,
    color: '#f59e0b',
    tips: [
      'Matriz de riscos com impacto e probabilidade',
      'Planos de mitigação sugeridos',
      'Premissas documentadas para alinhamento'
    ]
  },
  {
    id: 'done',
    title: 'Tudo Pronto! 🚀',
    description: 'Agora você tem um plano de projeto completo! Exporte relatórios, compartilhe com a equipe ou continue refinando.',
    icon: CheckCircle,
    color: '#10b981',
    tips: [
      'Exporte em PDF, Excel ou imagem',
      'Volte a qualquer momento para ajustes',
      'Use os relatórios em reuniões e apresentações'
    ]
  },
]

// ============================================================================
// HOOK PARA CONTROLAR ONBOARDING
// ============================================================================
export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    const welcomeCompleted = localStorage.getItem(STORAGE_KEYS.welcomeCompleted)
    if (!welcomeCompleted) {
      setIsFirstTime(true)
      setShowWelcome(true)
    }
  }, [])

  const completeWelcome = () => {
    localStorage.setItem(STORAGE_KEYS.welcomeCompleted, 'true')
    setShowWelcome(false)
  }

  const completeTour = () => {
    localStorage.setItem(STORAGE_KEYS.tourCompleted, 'true')
    setShowTour(false)
  }

  const startTour = () => {
    setShowTour(true)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEYS.welcomeCompleted)
    localStorage.removeItem(STORAGE_KEYS.tourCompleted)
    localStorage.removeItem(STORAGE_KEYS.tourStep)
    setIsFirstTime(true)
    setShowWelcome(true)
  }

  return {
    showWelcome,
    setShowWelcome,
    showTour,
    setShowTour,
    isFirstTime,
    completeWelcome,
    completeTour,
    startTour,
    resetOnboarding,
  }
}

// ============================================================================
// COMPONENTE: INDICADOR DE PROGRESSO (DOTS)
// ============================================================================
function ProgressDots({ 
  total, 
  current, 
  onDotClick 
}: { 
  total: number
  current: number
  onDotClick: (index: number) => void 
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={`transition-all duration-300 rounded-full ${
            index === current 
              ? 'w-8 h-2' 
              : index < current 
                ? 'w-2 h-2 opacity-60' 
                : 'w-2 h-2 opacity-30'
          }`}
          style={{ 
            backgroundColor: index <= current ? BRAND.primary : '#cbd5e1'
          }}
        />
      ))}
    </div>
  )
}

// ============================================================================
// COMPONENTE: CARD DO STEP
// ============================================================================
function StepCard({ step, isActive }: { step: TourStep; isActive: boolean }) {
  const Icon = step.icon
  
  return (
    <div className={`transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute'}`}>
      {/* Ícone animado */}
      <div className="flex justify-center mb-6">
        <div 
          className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${step.color} 0%, ${step.color}dd 100%)`,
          }}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Título */}
      <h2 className="text-2xl font-bold text-center mb-3" style={{ color: BRAND.primary }}>
        {step.title}
      </h2>

      {/* Descrição */}
      <p className="text-slate-600 text-center mb-6 leading-relaxed max-w-md mx-auto">
        {step.description}
      </p>

      {/* Dicas */}
      {step.tips && step.tips.length > 0 && (
        <div 
          className="p-4 rounded-xl max-w-md mx-auto"
          style={{ background: `${BRAND.secondary}15`, border: `1px solid ${BRAND.secondary}30` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: BRAND.primary }} />
            <span className="text-sm font-semibold" style={{ color: BRAND.primary }}>Dicas</span>
          </div>
          <ul className="space-y-2">
            {step.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// COMPONENTE: MINI PREVIEW DO FLUXO
// ============================================================================
function FlowPreview({ currentStep }: { currentStep: number }) {
  const steps = [
    { icon: Upload, label: 'Upload' },
    { icon: Bot, label: 'IA' },
    { icon: FileText, label: 'Épicos' },
    { icon: Layers, label: 'Features' },
    { icon: GanttChart, label: 'Crono' },
    { icon: Shield, label: 'Riscos' },
  ]

  // Ajustar currentStep (0 é welcome, 7 é done)
  const activeStep = Math.max(0, Math.min(currentStep - 1, steps.length - 1))

  return (
    <div className="flex items-center justify-center gap-1 py-4 px-2 bg-slate-50 rounded-xl overflow-x-auto">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = index === activeStep
        const isPast = index < activeStep
        
        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' 
                    : ''
                }`}
                style={{ 
                  backgroundColor: isPast ? '#10b981' : isActive ? BRAND.primary : '#e2e8f0',
                }}
              >
                {isPast ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                )}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`} style={{ color: isActive ? BRAND.primary : '#94a3b8' }}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div 
                className="w-4 h-0.5 -mt-4"
                style={{ backgroundColor: isPast ? '#10b981' : '#e2e8f0' }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL: TOUR MODAL (CARROSSEL)
// ============================================================================
interface OnboardingTourProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  onStartPipeline: () => void
}

export function OnboardingTour({ isOpen, onClose, onComplete, onStartPipeline }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = TOUR_STEPS.length

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = () => {
    onComplete()
    onStartPipeline()
  }

  const handleSkip = () => {
    onComplete()
    onClose()
  }

  const isLastStep = currentStep === totalSteps - 1
  const isFirstStep = currentStep === 0

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        {/* Header com progresso */}
        <div className="px-6 pt-6 pb-4 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">
              {currentStep + 1} de {totalSteps}
            </span>
            <button 
              onClick={handleSkip}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Pular tutorial
            </button>
          </div>
          <ProgressDots 
            total={totalSteps} 
            current={currentStep} 
            onDotClick={setCurrentStep}
          />
        </div>

        {/* Conteúdo do Step */}
        <div className="p-6 min-h-[400px] flex flex-col justify-center">
          {TOUR_STEPS.map((step, index) => (
            <StepCard 
              key={step.id} 
              step={step} 
              isActive={index === currentStep}
            />
          ))}
        </div>

        {/* Preview do fluxo (não mostra no primeiro e último) */}
        {currentStep > 0 && currentStep < totalSteps - 1 && (
          <div className="px-6 pb-4">
            <FlowPreview currentStep={currentStep} />
          </div>
        )}

        {/* Footer com navegação */}
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={isFirstStep}
            className={isFirstStep ? 'invisible' : ''}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {isLastStep ? (
              <Button 
                onClick={handleComplete}
                className="text-white px-6"
                style={{ background: BRAND.primary }}
              >
                Começar Agora
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={goNext}
                className="text-white px-6"
                style={{ background: BRAND.primary }}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// COMPONENTE: WELCOME MODAL (PRIMEIRO ACESSO)
// ============================================================================
interface WelcomeModalProps {
  onClose: () => void
  onStartTour: () => void
  onSkipTour: () => void
}

export function WelcomeModal({ onClose, onStartTour, onSkipTour }: WelcomeModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        {/* Header */}
        <div 
          className="p-8 text-white text-center relative"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1a3a5c 100%)` }}
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ background: BRAND.secondary, color: BRAND.primary }}
          >
            <Sparkles className="w-4 h-4" />
            Powered by AI
          </div>

          <h2 className="text-3xl font-bold mb-3">
            Bem-vindo ao PEERS CodeAI!
          </h2>
          <p className="text-white/80 text-lg">
            Transforme documentos em planos de projeto estruturados
          </p>
        </div>

        {/* Fluxo visual simplificado */}
        <div className="px-8 py-6 bg-slate-50 border-b">
          <div className="flex items-center justify-center gap-3">
            {[
              { icon: FileUp, label: 'Upload', time: '1 min' },
              { icon: Bot, label: 'IA Processa', time: '2-3 min' },
              { icon: CheckCircle, label: 'Pronto!', time: '' },
            ].map((item, i) => {
              const Icon = item.icon
              const colors = ['#0ea5e9', '#8b5cf6', '#10b981']
              return (
                <React.Fragment key={item.label}>
                  <div className="flex flex-col items-center">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md"
                      style={{ background: colors[i] }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-sm font-medium mt-2 text-slate-700">{item.label}</span>
                    {item.time && <span className="text-xs text-slate-400">{item.time}</span>}
                  </div>
                  {i < 2 && <ArrowRight className="w-5 h-5 text-slate-300 mt-[-20px]" />}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* O que você vai criar */}
        <div className="p-6">
          <h3 className="font-semibold text-slate-800 mb-4 text-center">
            O que você vai criar:
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: FileText, label: 'Backlog de Épicos', color: '#6366f1' },
              { icon: Layers, label: 'Features Detalhadas', color: '#8b5cf6' },
              { icon: GanttChart, label: 'Cronograma', color: '#0ea5e9' },
              { icon: Shield, label: 'Riscos e Premissas', color: '#f59e0b' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div 
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 shadow-sm"
                >
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
              )
            })}
          </div>

          {/* Tempo estimado */}
          <div 
            className="flex items-center justify-center gap-2 p-3 rounded-lg mb-6"
            style={{ background: `${BRAND.secondary}15` }}
          >
            <Clock className="w-4 h-4" style={{ color: BRAND.primary }} />
            <span className="text-sm" style={{ color: BRAND.primary }}>
              <strong>Tempo total:</strong> aproximadamente 5-10 minutos
            </span>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={onStartTour}
              className="w-full h-12 text-white text-base font-semibold"
              style={{ background: BRAND.primary }}
            >
              <Play className="w-5 h-5 mr-2" />
              Ver Tutorial Rápido (1 min)
            </Button>
            
            <Button 
              variant="outline"
              onClick={onSkipTour}
              className="w-full h-11"
            >
              Já sei usar, começar direto
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// COMPONENTE: EMPTY STATE COM ONBOARDING
// ============================================================================
interface EmptyStateGuideProps {
  onCreatePipeline: () => void
  onStartTour: () => void
}

export function EmptyStateGuide({ onCreatePipeline, onStartTour }: EmptyStateGuideProps) {
  return (
    <div className="text-center py-12 px-6">
      {/* Ícone principal animado */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div 
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{ background: `${BRAND.secondary}30` }}
        />
        <div 
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1a3a5c 100%)` }}
        >
          <Sparkles className="w-12 h-12" style={{ color: BRAND.secondary }} />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>
        Comece Seu Primeiro Projeto
      </h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">
        Em apenas 3 passos você terá um plano de projeto completo e profissional.
      </p>

      {/* Steps visuais */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
        {[
          { step: 1, label: 'Upload', sublabel: '1 min', icon: Upload, color: '#0ea5e9' },
          { step: 2, label: 'IA Processa', sublabel: '2-3 min', icon: Bot, color: '#8b5cf6' },
          { step: 3, label: 'Pronto!', sublabel: 'Revisar', icon: CheckCircle, color: '#10b981' },
        ].map((item, i) => {
          const Icon = item.icon
          return (
            <React.Fragment key={item.step}>
              <div className="flex flex-col items-center">
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
                  style={{ background: item.color }}
                >
                  <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <span className="text-sm font-medium text-slate-700 mt-2">{item.label}</span>
                <span className="text-xs text-slate-400">{item.sublabel}</span>
              </div>
              {i < 2 && (
                <ArrowRight className="w-5 h-5 text-slate-300 flex-shrink-0 mt-[-20px]" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <Button 
          size="lg"
          onClick={onCreatePipeline}
          className="text-white px-8 h-12 w-full sm:w-auto"
          style={{ background: BRAND.primary }}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Criar Primeiro Pipeline
        </Button>
        
        <Button 
          variant="outline"
          size="lg"
          onClick={onStartTour}
          className="h-12 w-full sm:w-auto"
        >
          <Play className="w-5 h-5 mr-2" />
          Ver Tutorial (1 min)
        </Button>
      </div>

      {/* Formatos aceitos */}
      <div className="flex items-center justify-center gap-4 text-sm text-slate-500 mb-6">
        <span>Formatos aceitos:</span>
        <div className="flex gap-2">
          {['PDF', 'DOCX', 'TXT'].map(format => (
            <span 
              key={format}
              className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      {/* Dica */}
      <div 
        className="p-4 rounded-xl max-w-lg mx-auto text-left"
        style={{ background: `${BRAND.secondary}10`, border: `1px solid ${BRAND.secondary}30` }}
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: BRAND.primary }} />
          <p className="text-sm" style={{ color: BRAND.primary }}>
            <strong>Dica:</strong> Você pode usar escopo de projeto, RFP, proposta comercial 
            ou qualquer documento que descreva o que precisa ser desenvolvido.
          </p>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: CELEBRATION MODAL
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
      <DialogContent className="sm:max-w-[450px] text-center p-8">
        {/* Animação de celebração */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        
        <h2 className="text-2xl font-bold mb-2" style={{ color: BRAND.primary }}>
          Parabéns!
        </h2>
        
        <p className="text-slate-600 mb-6">
          Seu projeto <strong>{projectName}</strong> foi processado com sucesso!
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold" style={{ color: BRAND.primary }}>
              {stats.epicos}
            </div>
            <div className="text-sm text-slate-500">Épicos</div>
          </div>
          {stats.features && (
            <div className="text-center">
              <div className="text-4xl font-bold" style={{ color: BRAND.primary }}>
                {stats.features}
              </div>
              <div className="text-sm text-slate-500">Features</div>
            </div>
          )}
        </div>

        {/* Próximos passos */}
        <div 
          className="p-4 rounded-xl text-left mb-6"
          style={{ background: `${BRAND.secondary}15` }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: BRAND.primary }}>
            Próximos passos:
          </p>
          <ul className="space-y-2">
            {[
              'Revisar e ajustar os épicos gerados',
              'Gerar features detalhadas',
              'Criar cronograma executivo',
              'Mapear riscos e premissas',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {item}
              </li>
            ))}
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

// ============================================================================
// COMPONENTE: PROGRESS DETALHADO (DURANTE ANÁLISE)
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

  const getTimeEstimate = () => {
    if (progress < 30) return '2-3 min restantes'
    if (progress < 60) return '1-2 min restantes'
    if (progress < 90) return 'Menos de 1 min'
    return 'Quase pronto!'
  }

  return (
    <div className="max-w-md mx-auto text-center py-8">
      {/* Ícone animado */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div 
          className="absolute inset-0 rounded-2xl animate-ping opacity-20"
          style={{ background: BRAND.primary }}
        />
        <div 
          className="relative w-24 h-24 rounded-2xl flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, #1a3a5c 100%)` }}
        >
          <Bot className="w-12 h-12 text-white animate-pulse" />
        </div>
      </div>

      <h3 className="text-xl font-bold mb-1" style={{ color: BRAND.primary }}>
        {agentName}
      </h3>
      <p className="text-slate-500 mb-6">{message}</p>

      {/* Barra de progresso */}
      <div className="relative mb-2">
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${BRAND.primary} 0%, #6366f1 100%)`
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-sm mb-6">
        <span className="text-slate-400">{getTimeEstimate()}</span>
        <span className="font-semibold" style={{ color: BRAND.primary }}>{progress}%</span>
      </div>

      {/* Steps detalhados */}
      <div className="text-left space-y-2 p-4 bg-slate-50 rounded-xl">
        {steps.map((step, i) => {
          const isComplete = progress >= step.threshold
          const isCurrent = progress >= (steps[i - 1]?.threshold || 0) && progress < step.threshold
          
          return (
            <div 
              key={step.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isCurrent ? 'bg-white shadow-sm' : ''
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                isComplete 
                  ? 'bg-green-500' 
                  : isCurrent 
                    ? 'bg-indigo-500 animate-pulse'
                    : 'bg-slate-200'
              }`}>
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <span className="text-xs text-slate-400">{i + 1}</span>
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
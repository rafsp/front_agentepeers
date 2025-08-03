// src/components/analysis-loading.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Bot, 
  GitBranch, 
  FileSearch, 
  Brain, 
  CheckCircle, 
  Loader2,
  Clock,
  Zap
} from 'lucide-react'

interface AnalysisStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  estimatedTime: number // em segundos
  status: 'pending' | 'running' | 'completed'
}

interface AnalysisLoadingProps {
  analysisType: 'design' | 'relatorio_teste_unitario'
  repository: string
  branch?: string
  isVisible: boolean
  onComplete?: () => void
}

export function AnalysisLoading({ 
  analysisType, 
  repository, 
  branch,
  isVisible,
  onComplete 
}: AnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)

  // Definir etapas baseadas no tipo de análise
  const getSteps = (): AnalysisStep[] => {
    const baseSteps: AnalysisStep[] = [
      {
        id: 'connecting',
        title: 'Conectando ao GitHub',
        description: `Acessando repositório ${repository}`,
        icon: GitBranch,
        estimatedTime: 3,
        status: 'pending'
      },
      {
        id: 'reading',
        title: 'Lendo Código',
        description: `Analisando arquivos na branch ${branch || 'main'}`,
        icon: FileSearch,
        estimatedTime: 8,
        status: 'pending'
      },
      {
        id: 'analyzing',
        title: 'Análise Inteligente',
        description: analysisType === 'design' 
          ? 'IA analisando arquitetura e padrões de design'
          : 'IA identificando gaps de cobertura de testes',
        icon: Brain,
        estimatedTime: 15,
        status: 'pending'
      },
      {
        id: 'generating',
        title: 'Gerando Relatório',
        description: 'Compilando descobertas e recomendações',
        icon: Bot,
        estimatedTime: 5,
        status: 'pending'
      }
    ]

    return baseSteps
  }

  const [steps, setSteps] = useState(getSteps())

  // Simular progresso das etapas
  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0)
      setProgress(0)
      setTimeElapsed(0)
      setSteps(getSteps())
      return
    }

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    // Simular progresso baseado no tempo estimado
    const progressTimer = setInterval(() => {
      setSteps(prevSteps => {
        const newSteps = [...prevSteps]
        const current = currentStep
        
        if (current < newSteps.length) {
          const step = newSteps[current]
          
          // Marcar etapa atual como running
          if (step.status === 'pending') {
            step.status = 'running'
          }
          
          // Calcular progresso baseado no tempo
          const stepProgress = Math.min(100, (timeElapsed / step.estimatedTime) * 100)
          
          // Se a etapa foi completada, avançar para a próxima
          if (stepProgress >= 100 && step.status === 'running') {
            step.status = 'completed'
            setCurrentStep(prev => prev + 1)
          }
        }
        
        return newSteps
      })

      // Calcular progresso geral
      const totalSteps = steps.length
      const completedSteps = steps.filter(s => s.status === 'completed').length
      const currentStepProgress = currentStep < steps.length 
        ? Math.min(100, (timeElapsed / steps[currentStep]?.estimatedTime || 1) * 100)
        : 0
      
      const overallProgress = ((completedSteps + currentStepProgress / 100) / totalSteps) * 100
      setProgress(Math.min(95, overallProgress)) // Máximo 95% até receber resposta real

    }, 500)

    // Cleanup
    return () => {
      clearInterval(timer)
      clearInterval(progressTimer)
    }
  }, [isVisible, currentStep, timeElapsed, steps])

  // Quando todas as etapas são concluídas
  useEffect(() => {
    const allCompleted = steps.every(step => step.status === 'completed')
    if (allCompleted && isVisible && onComplete) {
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
  }, [steps, isVisible, onComplete])

  if (!isVisible) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const getStepIcon = (step: AnalysisStep) => {
    const IconComponent = step.icon
    
    if (step.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (step.status === 'running') {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
    } else {
      return <IconComponent className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Bot className="h-12 w-12 text-primary" />
                <div className="absolute -top-1 -right-1">
                  <Zap className="h-5 w-5 text-yellow-500 animate-pulse" />
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Análise Inteligente em Andamento
            </h2>
            <p className="text-sm text-muted-foreground">
              IA analisando {repository} • {formatTime(timeElapsed)} decorridos
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progresso Geral</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  step.status === 'running' 
                    ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' 
                    : step.status === 'completed'
                    ? 'bg-green-50 dark:bg-green-950/30'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium text-sm ${
                      step.status === 'running' ? 'text-blue-700 dark:text-blue-300' : ''
                    }`}>
                      {step.title}
                    </h3>
                    
                    {step.status === 'running' && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ~{step.estimatedTime}s
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  
                  {step.status === 'running' && (
                    <div className="mt-2">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500 ease-out"
                          style={{ 
                            width: `${Math.min(100, (timeElapsed / step.estimatedTime) * 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span>
                {currentStep < steps.length 
                  ? "IA processando dados..." 
                  : "Finalizando análise..."
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
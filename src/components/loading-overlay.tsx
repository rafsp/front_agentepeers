// components/loading-overlay.tsx
'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Loader2, 
  Brain, 
  FileText, 
  GitBranch, 
  CheckCircle,
  Clock,
  Zap,
  Code2,
  RefreshCw,
  TestTube,
  Upload
} from 'lucide-react'

interface LoadingOverlayProps {
  isVisible: boolean
  title: string
  currentStep?: string
  progress?: number
  message?: string
  repository?: string
  analysisType?: string
}

const stepIcons = {
  'pending': Loader2,
  'pending_approval': FileText,
  'refactoring_code': RefreshCw,
  'grouping_commits': GitBranch,
  'writing_unit_tests': TestTube,
  'grouping_tests': TestTube,
  'populating_data': Code2,
  'committing_to_github': Upload,
  'completed': CheckCircle
}

const stepLabels = {
  'pending': 'Iniciando Processamento',
  'pending_approval': 'Aguardando Aprovação',
  'refactoring_code': 'Refatorando Código', 
  'grouping_commits': 'Agrupando Commits',
  'writing_unit_tests': 'Escrevendo Testes',
  'grouping_tests': 'Organizando Testes',
  'populating_data': 'Preparando Dados',
  'committing_to_github': 'Enviando para GitHub',
  'completed': 'Concluído'
}

const stepDescriptions = {
  'pending': 'Iniciando processamento...',
  'pending_approval': 'Relatório gerado! Aguardando sua aprovação.',
  'refactoring_code': 'Aplicando melhorias e boas práticas no código...',
  'grouping_commits': 'Organizando mudanças por categoria...',
  'writing_unit_tests': 'Criando testes unitários automatizados...',
  'grouping_tests': 'Estruturando suíte de testes...',
  'populating_data': 'Finalizando estruturas de dados...',
  'committing_to_github': 'Criando branches e pull requests...',
  'completed': 'Processo finalizado com sucesso!'
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  title,
  currentStep = 'pending_approval',
  progress = 0,
  message,
  repository,
  analysisType
}) => {
  if (!isVisible) return null

  const StepIcon = stepIcons[currentStep as keyof typeof stepIcons] || Loader2
  const stepLabel = stepLabels[currentStep as keyof typeof stepLabels] || 'Processando...'
  const stepDescription = stepDescriptions[currentStep as keyof typeof stepDescriptions] || message || 'Aguarde...'

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            {repository && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <GitBranch className="h-4 w-4" />
                <span>{repository}</span>
                {analysisType && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary" className="text-xs">
                      {analysisType}
                    </Badge>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Progress Section */}
          <div className="space-y-4">
            {/* Current Step */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                {currentStep === 'pending_approval' ? (
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                ) : (
                  <StepIcon className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">
                  {stepLabel}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {stepDescription}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium text-gray-900">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Process Steps */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-700 mb-3">
                Etapas do Processo:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(stepLabels).map(([step, label]) => {
                  const isActive = step === currentStep
                  const isCompleted = progress > 0 && getStepProgress(step) <= progress
                  
                  return (
                    <div 
                      key={step}
                      className={`flex items-center gap-2 p-2 rounded text-xs ${
                        isActive 
                          ? 'bg-blue-100 text-blue-700' 
                          : isCompleted 
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : isActive ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span className="truncate">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Zap className="h-3 w-3" />
              <span>Agentes de IA processando automaticamente</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function para calcular progresso de cada step
function getStepProgress(step: string): number {
  const stepProgressMap = {
    'pending': 10,
    'pending_approval': 25,
    'refactoring_code': 40,
    'grouping_commits': 55,
    'writing_unit_tests': 70,
    'grouping_tests': 80,
    'populating_data': 90,
    'committing_to_github': 95,
    'completed': 100
  }
  
  return stepProgressMap[step as keyof typeof stepProgressMap] || 0
}
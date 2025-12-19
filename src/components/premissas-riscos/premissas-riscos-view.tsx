// src/components/premissas-riscos/premissas-riscos-view.tsx
// Componente de Visualização de Premissas e Riscos
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BRAND } from '@/components/layout/sidebar'
import {
  ArrowLeft,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Tipos
export interface PremissaItem {
  id: string
  descricao: string
  impacto_se_falhar: string
}

export interface RiscoItem {
  id: string
  descricao: string
  probabilidade: 'Alta' | 'Média' | 'Baixa'
  impacto: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'
  plano_mitigacao: string
}

interface PremissasRiscosViewProps {
  projectName: string
  premissas: PremissaItem[]
  riscos: RiscoItem[]
  onBack: () => void
  onExportExcel?: () => void
}

// Cores por probabilidade
const PROB_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Alta': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Média': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Baixa': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
}

// Cores por impacto
const IMPACT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Crítico': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Alto': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Médio': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Baixo': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
}

export function PremissasRiscosView({
  projectName,
  premissas,
  riscos,
  onBack,
  onExportExcel,
}: PremissasRiscosViewProps) {
  const [expandedRiscos, setExpandedRiscos] = useState<string[]>([])
  const [expandedPremissas, setExpandedPremissas] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'premissas' | 'riscos'>('premissas')

  const toggleRisco = (id: string) => {
    setExpandedRiscos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const togglePremissa = (id: string) => {
    setExpandedPremissas(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // Stats
  const riscosAltos = riscos.filter(r => r.probabilidade === 'Alta' || r.impacto === 'Crítico').length
  const riscosMedios = riscos.filter(r => r.probabilidade === 'Média' && r.impacto !== 'Crítico').length
  const riscosBaixos = riscos.filter(r => r.probabilidade === 'Baixa' && r.impacto !== 'Crítico' && r.impacto !== 'Alto').length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{projectName} - Riscos & Premissas</h2>
            <p className="text-gray-500 text-sm">Análise de riscos e premissas do projeto</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onExportExcel && (
            <Button variant="outline" onClick={onExportExcel}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-gray-900">{premissas.length}</p>
            <p className="text-xs text-gray-500">Premissas</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold text-red-700">{riscosAltos}</p>
            <p className="text-xs text-gray-500">Riscos Altos/Críticos</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold text-amber-700">{riscosMedios}</p>
            <p className="text-xs text-gray-500">Riscos Médios</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <Info className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold text-green-700">{riscosBaixos}</p>
            <p className="text-xs text-gray-500">Riscos Baixos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'premissas' ? 'default' : 'outline'}
          onClick={() => setActiveTab('premissas')}
          className={activeTab === 'premissas' ? 'text-white' : ''}
          style={activeTab === 'premissas' ? { background: BRAND.info } : {}}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Premissas ({premissas.length})
        </Button>
        <Button
          variant={activeTab === 'riscos' ? 'default' : 'outline'}
          onClick={() => setActiveTab('riscos')}
          className={activeTab === 'riscos' ? 'text-white' : ''}
          style={activeTab === 'riscos' ? { background: BRAND.warning } : {}}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Riscos ({riscos.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === 'premissas' ? (
        <div className="space-y-3">
          {premissas.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma premissa identificada</h3>
                <p className="text-gray-500">Este projeto ainda não possui premissas cadastradas.</p>
              </CardContent>
            </Card>
          ) : (
            premissas.map((premissa) => {
              const isExpanded = expandedPremissas.includes(premissa.id)
              return (
                <Card key={premissa.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => togglePremissa(premissa.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono">#{premissa.id}</Badge>
                            <span className="font-medium text-gray-900">Premissa</span>
                          </div>
                          <p className="text-gray-700 text-sm">{premissa.descricao}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && premissa.impacto_se_falhar && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="ml-14 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs font-semibold text-red-700 mb-1">
                            ⚠️ Impacto se Falhar
                          </p>
                          <p className="text-sm text-red-800">{premissa.impacto_se_falhar}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {riscos.length === 0 ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum risco identificado</h3>
                <p className="text-gray-500">Este projeto ainda não possui riscos cadastrados.</p>
              </CardContent>
            </Card>
          ) : (
            riscos.map((risco) => {
              const isExpanded = expandedRiscos.includes(risco.id)
              const probColors = PROB_COLORS[risco.probabilidade] || PROB_COLORS['Média']
              const impactColors = IMPACT_COLORS[risco.impacto] || IMPACT_COLORS['Médio']

              return (
                <Card key={risco.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => toggleRisco(risco.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${probColors.bg}`}>
                          <AlertTriangle className={`w-5 h-5 ${probColors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge variant="outline" className="text-xs font-mono">#{risco.id}</Badge>
                            <Badge className={`${probColors.bg} ${probColors.text} ${probColors.border}`}>
                              Prob: {risco.probabilidade}
                            </Badge>
                            <Badge className={`${impactColors.bg} ${impactColors.text} ${impactColors.border}`}>
                              Impacto: {risco.impacto}
                            </Badge>
                          </div>
                          <p className="text-gray-700 text-sm">{risco.descricao}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && risco.plano_mitigacao && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="ml-14 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-xs font-semibold text-emerald-700 mb-1">
                            🛡️ Plano de Mitigação
                          </p>
                          <p className="text-sm text-emerald-800">{risco.plano_mitigacao}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default PremissasRiscosView
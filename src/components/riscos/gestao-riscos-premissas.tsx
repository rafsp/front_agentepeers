// src/components/riscos/gestao-riscos-premissas.tsx
// Componente de Gestão de Riscos e Premissas com design profissional
// Baseado no design do Projeto Plurix - Matriz de Riscos (Heatmap)
"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileSpreadsheet, AlertTriangle, Shield, ChevronLeft, 
  Eye, X, CheckCircle2, AlertCircle, Grid3X3, FileText, Save
} from 'lucide-react'

// Cores da marca (fallback local)
const BRAND_COLORS = {
  primary: '#011334',
  info: '#4f46e5',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
}

// ============================================================================
// TIPOS - Baseados na resposta da API
// ============================================================================

export interface PremissaFromAPI {
  id: string
  descricao: string
  impacto_se_falhar: string
}

export interface RiscoFromAPI {
  id: string
  descricao: string
  probabilidade: 'Alta' | 'Média' | 'Baixa'
  impacto: 'Crítico' | 'Alto' | 'Médio' | 'Baixo'
  plano_mitigacao: string
}

export interface PremissasRiscosFromAPI {
  premissas: PremissaFromAPI[]
  riscos: RiscoFromAPI[]
}

interface GestaoRiscosPremissasProps {
  projectName: string
  data: PremissasRiscosFromAPI | null
  onBack?: () => void
  onExportExcel?: () => void
  onSave?: () => void
}

// ============================================================================
// CONSTANTES DE CORES
// ============================================================================

// Cores da matriz de riscos (heatmap)
const HEATMAP_COLORS = {
  extremo: '#1e293b',      // Slate 800 - Probabilidade Alta + Impacto Crítico
  alto: '#4f46e5',         // Indigo 600 - Alta exposição
  moderado: '#818cf8',     // Indigo 400 - Exposição moderada
  baixo: '#c7d2fe',        // Indigo 200 - Baixa exposição
}

// Mapeamento de probabilidade x impacto para nível de exposição
const getExposureLevel = (probabilidade: string, impacto: string): string => {
  const prob = probabilidade.toLowerCase()
  const imp = impacto.toLowerCase()
  
  if (prob === 'alta' && imp === 'crítico') return 'extremo'
  if (prob === 'alta' && imp === 'alto') return 'alto'
  if (prob === 'alta' && imp === 'médio') return 'moderado'
  if (prob === 'média' && imp === 'crítico') return 'alto'
  if (prob === 'média' && imp === 'alto') return 'moderado'
  if (prob === 'média' && imp === 'médio') return 'moderado'
  if (prob === 'baixa' && imp === 'crítico') return 'moderado'
  if (prob === 'baixa' && imp === 'alto') return 'baixo'
  return 'baixo'
}

const getExposureColor = (level: string): string => {
  switch (level) {
    case 'extremo': return HEATMAP_COLORS.extremo
    case 'alto': return HEATMAP_COLORS.alto
    case 'moderado': return HEATMAP_COLORS.moderado
    case 'baixo': return HEATMAP_COLORS.baixo
    default: return HEATMAP_COLORS.baixo
  }
}

// ============================================================================
// COMPONENTE: Card de Premissa
// ============================================================================

function PremissaCard({ premissa }: { premissa: PremissaFromAPI }) {
  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-200 border border-slate-200 bg-white">
      <div className="flex items-start justify-between mb-3">
        <Badge 
          variant="outline" 
          className="font-mono text-xs px-2 py-1 border-slate-300 text-slate-600"
        >
          {premissa.id}
        </Badge>
        <button className="p-1.5 rounded-full hover:bg-slate-100 transition-colors">
          <Eye className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      
      <p className="text-sm text-slate-700 leading-relaxed mb-4">
        {premissa.descricao}
      </p>
      
      <div className="bg-red-50 border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">
            Impacto se Falhar
          </span>
        </div>
        <p className="text-xs text-red-700 leading-relaxed">
          {premissa.impacto_se_falhar}
        </p>
      </div>
    </Card>
  )
}

// ============================================================================
// COMPONENTE: Modal de Detalhes do Risco
// ============================================================================

function RiscoDetailModal({ 
  risco, 
  onClose 
}: { 
  risco: RiscoFromAPI
  onClose: () => void 
}) {
  const exposureLevel = getExposureLevel(risco.probabilidade, risco.impacto)
  
  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'extremo': return 'EXTREMO'
      case 'alto': return 'ALTO'
      case 'moderado': return 'MODERADO'
      case 'baixo': return 'BAIXO'
      default: return level.toUpperCase()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge 
                className="font-mono text-xs px-2 py-1 text-white"
                style={{ background: getExposureColor(exposureLevel) }}
              >
                {risco.id}
              </Badge>
              <Badge 
                className="text-xs px-2 py-1 text-white"
                style={{ background: getExposureColor(exposureLevel) }}
              >
                {getLevelLabel(exposureLevel)}
              </Badge>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Detalhes do Risco
          </h3>
          
          {/* Descrição */}
          <div className="mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Descrição
            </span>
            <p className="text-sm text-slate-700 mt-1 leading-relaxed">
              {risco.descricao}
            </p>
          </div>
          
          {/* Probabilidade e Impacto */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Probabilidade
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {risco.probabilidade}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Impacto
              </span>
              <p className="text-sm font-bold text-slate-800 mt-1">
                {risco.impacto}
              </p>
            </div>
          </div>
          
          {/* Plano de Mitigação */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                Plano de Mitigação
              </span>
            </div>
            <p className="text-sm text-emerald-800 leading-relaxed">
              {risco.plano_mitigacao}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE: Matriz de Riscos (Heatmap)
// ============================================================================

function MatrizRiscos({ 
  riscos, 
  onRiscoClick 
}: { 
  riscos: RiscoFromAPI[]
  onRiscoClick: (risco: RiscoFromAPI) => void 
}) {
  // Organizar riscos na matriz
  const matrizData = useMemo(() => {
    const matriz: Record<string, Record<string, RiscoFromAPI[]>> = {
      alta: { medio: [], alto: [], critico: [] },
      media: { medio: [], alto: [], critico: [] },
      baixa: { medio: [], alto: [], critico: [] },
    }
    
    riscos.forEach(risco => {
      const prob = risco.probabilidade.toLowerCase().replace('é', 'e') // média -> media
      const imp = risco.impacto.toLowerCase().replace('é', 'e')        // médio -> medio
      
      const probKey = prob === 'media' ? 'media' : prob
      const impKey = imp === 'medio' ? 'medio' : imp === 'crítico' ? 'critico' : imp
      
      if (matriz[probKey] && matriz[probKey][impKey]) {
        matriz[probKey][impKey].push(risco)
      }
    })
    
    return matriz
  }, [riscos])

  const getCellColor = (prob: string, imp: string) => {
    const exposure = getExposureLevel(
      prob === 'media' ? 'média' : prob,
      imp === 'medio' ? 'médio' : imp === 'critico' ? 'crítico' : imp
    )
    return getExposureColor(exposure)
  }

  const renderCell = (prob: string, imp: string) => {
    const cellRiscos = matrizData[prob]?.[imp] || []
    const bgColor = getCellColor(prob, imp)
    
    return (
      <div 
        className="min-h-[100px] p-3 rounded-lg flex flex-wrap gap-2 content-start"
        style={{ backgroundColor: bgColor + '20', borderColor: bgColor, borderWidth: 1 }}
      >
        {cellRiscos.map(risco => (
          <button
            key={risco.id}
            onClick={() => onRiscoClick(risco)}
            className="px-2 py-1 rounded text-xs font-mono font-bold text-white hover:scale-105 transition-transform"
            style={{ backgroundColor: bgColor }}
          >
            {risco.id}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 rounded-full" style={{ background: BRAND_COLORS.primary }} />
          <h3 className="text-lg font-bold text-slate-800">Matriz de Riscos</h3>
          <Badge variant="outline" className="text-xs">Visão Geral de Exposição</Badge>
        </div>
        <p className="text-xs text-slate-500">* Clique nos itens da matriz para ver detalhes e plano de mitigação</p>
      </div>
      
      {/* Matriz Grid */}
      <div className="grid grid-cols-4 gap-2">
        {/* Header Row */}
        <div className="h-10" /> {/* Empty corner */}
        <div className="h-10 flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-600 uppercase">Impacto Médio</span>
        </div>
        <div className="h-10 flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-600 uppercase">Impacto Alto</span>
        </div>
        <div className="h-10 flex items-center justify-center">
          <span className="text-xs font-semibold text-slate-600 uppercase">Impacto Crítico</span>
        </div>
        
        {/* Alta Row */}
        <div className="flex items-center justify-end pr-3">
          <span className="text-xs font-semibold text-slate-600 uppercase writing-mode-vertical"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            Probabilidade Alta
          </span>
        </div>
        {renderCell('alta', 'medio')}
        {renderCell('alta', 'alto')}
        {renderCell('alta', 'critico')}
        
        {/* Média Row */}
        <div className="flex items-center justify-end pr-3">
          <span className="text-xs font-semibold text-slate-600 uppercase"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            Probabilidade Média
          </span>
        </div>
        {renderCell('media', 'medio')}
        {renderCell('media', 'alto')}
        {renderCell('media', 'critico')}
        
        {/* Baixa Row */}
        <div className="flex items-center justify-end pr-3">
          <span className="text-xs font-semibold text-slate-600 uppercase"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)' }}
          >
            Probabilidade Baixa
          </span>
        </div>
        {renderCell('baixa', 'medio')}
        {renderCell('baixa', 'alto')}
        {renderCell('baixa', 'critico')}
      </div>
      
      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_COLORS.extremo }} />
          <span className="text-xs text-slate-600">Extremo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_COLORS.alto }} />
          <span className="text-xs text-slate-600">Alto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_COLORS.moderado }} />
          <span className="text-xs text-slate-600">Moderado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: HEATMAP_COLORS.baixo }} />
          <span className="text-xs text-slate-600">Baixo</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function GestaoRiscosPremissas({
  projectName,
  data,
  onBack,
  onExportExcel,
  onSave,
}: GestaoRiscosPremissasProps) {
  const [activeTab, setActiveTab] = useState<'premissas' | 'riscos'>('premissas')
  const [selectedRisco, setSelectedRisco] = useState<RiscoFromAPI | null>(null)

  // Dados
  const premissas = data?.premissas || []
  const riscos = data?.riscos || []

  // Stats
  const totalPremissas = premissas.length
  const totalRiscos = riscos.length
  const riscosCriticos = riscos.filter(r => r.impacto.toLowerCase() === 'crítico').length
  const riscosAltaProbabilidade = riscos.filter(r => r.probabilidade.toLowerCase() === 'alta').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2 text-slate-600 hover:text-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
            )}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: BRAND_COLORS.primary }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">{projectName}</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Gestão de Riscos & Premissas
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {onExportExcel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportExcel}
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar Excel
              </Button>
            )}
            {onSave && (
              <Button
                size="sm"
                onClick={onSave}
                className="gap-2 text-white"
                style={{ background: BRAND_COLORS.primary }}
              >
                <Save className="w-4 h-4" />
                Salvar Aba Atual
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 flex items-center gap-4 bg-white border-slate-200">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: BRAND_COLORS.info + '20' }}
            >
              <FileText className="w-6 h-6" style={{ color: BRAND_COLORS.info }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Premissas</p>
              <p className="text-2xl font-bold text-slate-800">{totalPremissas}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4 bg-white border-slate-200">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: BRAND_COLORS.warning + '20' }}
            >
              <AlertTriangle className="w-6 h-6" style={{ color: BRAND_COLORS.warning }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Total Riscos</p>
              <p className="text-2xl font-bold text-slate-800">{totalRiscos}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4 bg-white border-slate-200">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: BRAND_COLORS.danger + '20' }}
            >
              <AlertCircle className="w-6 h-6" style={{ color: BRAND_COLORS.danger }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Riscos Críticos</p>
              <p className="text-2xl font-bold text-slate-800">{riscosCriticos}</p>
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-4 bg-white border-slate-200">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: BRAND_COLORS.success + '20' }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: BRAND_COLORS.success }} />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Probabilidade Alta</p>
              <p className="text-2xl font-bold text-slate-800">{riscosAltaProbabilidade}</p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('premissas')}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'premissas' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
              }
            `}
          >
            <FileText className="w-4 h-4" />
            Premissas
          </button>
          <button
            onClick={() => setActiveTab('riscos')}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === 'riscos' 
                ? 'border-indigo-500 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
              }
            `}
          >
            <Grid3X3 className="w-4 h-4" />
            Matriz de Riscos (Heatmap)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'premissas' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 rounded-full" style={{ background: BRAND_COLORS.primary }} />
              <h2 className="text-lg font-bold text-slate-800">Premissas do Projeto</h2>
              <Badge variant="outline" className="text-xs">Condições para Sucesso</Badge>
            </div>
            
            {premissas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premissas.map(premissa => (
                  <PremissaCard key={premissa.id} premissa={premissa} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
                  <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Nenhuma premissa encontrada</h3>
                <p className="text-slate-500 mt-1">
                  As premissas do projeto ainda não foram definidas.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'riscos' && (
          <div>
            {riscos.length > 0 ? (
              <MatrizRiscos 
                riscos={riscos} 
                onRiscoClick={setSelectedRisco} 
              />
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200 mb-4">
                  <AlertTriangle className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Nenhum risco encontrado</h3>
                <p className="text-slate-500 mt-1">
                  Os riscos do projeto ainda não foram identificados.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">
            Documento Técnico • Peers Consulting
          </p>
        </div>
      </main>

      {/* Modal de Detalhes do Risco */}
      {selectedRisco && (
        <RiscoDetailModal 
          risco={selectedRisco} 
          onClose={() => setSelectedRisco(null)} 
        />
      )}
    </div>
  )
}

export default GestaoRiscosPremissas
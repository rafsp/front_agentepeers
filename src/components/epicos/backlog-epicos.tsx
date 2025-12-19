// src/components/epicos/backlog-epicos.tsx
// Componente de Backlog de Épicos com design profissional
// Usa dados reais da API do CodeAI
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { BRAND } from '@/components/layout/sidebar'
import { 
  ChevronDown, ChevronUp, FileSpreadsheet, Target, Package, Users, Clock, 
  Edit, ThumbsUp, Layers, Hash
} from 'lucide-react'

// ============================================================================
// TIPOS - Baseados na resposta REAL da API
// ============================================================================

export interface EpicoFromAPI {
  id: string
  titulo: string
  resumo_valor?: string
  descricao?: string
  business_case?: string
  entregaveis_macro?: string[]
  estimativa_semanas?: string
  estimativa_sprints?: number
  prioridade_estrategica?: string
  prioridade?: string
  perfis?: string[]
  squad_sugerida?: string[]
}

interface BacklogEpicosProps {
  projectName: string
  epicos: EpicoFromAPI[]
  selectedIds: string[]
  onToggleSelection: (id: string) => void
  onSelectAll: () => void
  onApprove: () => void
  onRefine: () => void
  onExportExcel?: () => void
  isLoading?: boolean
  readOnly?: boolean
}

// ============================================================================
// CONFIGURAÇÃO DE PRIORIDADES
// ============================================================================

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'Crítica': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'CRÍTICA' },
  'critica': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'CRÍTICA' },
  'Alta': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'ALTA' },
  'alta': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'ALTA' },
  'Média': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'MÉDIA' },
  'Media': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'MÉDIA' },
  'media': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'MÉDIA' },
  'Baixa': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'BAIXA' },
  'baixa': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'BAIXA' },
}

const DEFAULT_PRIORITY = { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: 'MÉDIA' }

// ============================================================================
// HELPERS
// ============================================================================

function getPriorityStyle(priority?: string) {
  if (!priority) return DEFAULT_PRIORITY
  return PRIORITY_STYLES[priority] || DEFAULT_PRIORITY
}

function getEstimativa(epico: EpicoFromAPI): string {
  if (epico.estimativa_semanas) return epico.estimativa_semanas
  if (epico.estimativa_sprints) return `${epico.estimativa_sprints} Sprints`
  return '2 Sprints'
}

function getSquad(epico: EpicoFromAPI): string[] {
  if (epico.squad_sugerida?.length) return epico.squad_sugerida
  if (epico.perfis?.length) return epico.perfis
  
  // Extrair perfis dos entregáveis
  const perfis = new Set<string>()
  epico.entregaveis_macro?.forEach(item => {
    const lower = item.toLowerCase()
    if (lower.includes('frontend')) perfis.add('Frontend Developer')
    if (lower.includes('backend')) perfis.add('Backend Developer')
    if (lower.includes('banco') || lower.includes('database')) perfis.add('Database Engineer')
    if (lower.includes('devops') || lower.includes('ci/cd')) perfis.add('DevOps Engineer')
    if (lower.includes('arquitet')) perfis.add('Arquiteto de Soluções')
    if (lower.includes('qa') || lower.includes('teste')) perfis.add('QA Engineer')
  })
  
  return perfis.size > 0 ? Array.from(perfis) : ['Desenvolvedor Full Stack']
}

function getBusinessCase(epico: EpicoFromAPI): string {
  return epico.business_case || epico.resumo_valor || epico.descricao || 'Sem descrição disponível'
}

// ============================================================================
// COMPONENTE DE CARD DO ÉPICO
// ============================================================================

function EpicoCard({ 
  epico, 
  isSelected, 
  isExpanded, 
  onToggle, 
  onExpand 
}: { 
  epico: EpicoFromAPI
  isSelected: boolean
  isExpanded: boolean
  onToggle: () => void
  onExpand: () => void
}) {
  const priorityStyle = getPriorityStyle(epico.prioridade_estrategica || epico.prioridade)
  const estimativa = getEstimativa(epico)
  const squad = getSquad(epico)
  const businessCase = getBusinessCase(epico)
  const entregaveis = epico.entregaveis_macro || []

  return (
    <Card className={`
      border-l-4 transition-all duration-300 overflow-hidden mb-4
      ${isSelected ? 'border-l-indigo-500 bg-indigo-50/30 shadow-md' : 'border-l-gray-200 bg-white shadow-sm hover:shadow-md'}
    `}>
      {/* Header - Sempre visível */}
      <div className="px-6 py-5 cursor-pointer" onClick={onExpand}>
        <div className="flex items-start gap-4">
          {/* Checkbox e Expand */}
          <div className="flex items-center gap-3 pt-1">
            <div onClick={(e) => { e.stopPropagation(); onToggle(); }}>
              <Checkbox checked={isSelected} className="w-5 h-5" />
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {/* ID Badge */}
              <Badge variant="outline" className="text-xs font-mono bg-slate-100 text-slate-600 border-slate-300 px-2">
                <Hash className="w-3 h-3 mr-1" />
                {epico.id}
              </Badge>
              
              {/* Prioridade Badge */}
              <Badge className={`text-xs font-bold ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border} border px-3`}>
                ⚡ {priorityStyle.label}
              </Badge>
            </div>

            {/* Título */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
              {epico.titulo}
            </h3>

            {/* Resumo - só quando não expandido */}
            {!isExpanded && (
              <p className="text-sm text-gray-500 line-clamp-2">
                {businessCase}
              </p>
            )}
          </div>

          {/* Estimativa */}
          <div className="flex items-center gap-2 text-gray-600 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg flex-shrink-0">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-semibold whitespace-nowrap">{estimativa}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Expandido */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-5">
              {/* Business Case / Objetivo de Negócio */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  <Target className="w-4 h-4" />
                  OBJETIVO DE NEGÓCIO
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {businessCase}
                  </p>
                </div>
              </div>

              {/* Squad Sugerida */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  <Users className="w-4 h-4" />
                  SQUAD SUGERIDA
                </div>
                <div className="flex flex-wrap gap-2">
                  {squad.map((perfil, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1.5 text-sm font-medium"
                    >
                      {perfil}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna Direita - Entregáveis */}
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <Package className="w-4 h-4" />
                ENTREGÁVEIS MACRO
              </div>
              
              {entregaveis.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {entregaveis.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Entregáveis serão definidos na fase de Features
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ============================================================================
// COMPONENTE PRINCIPAL - BACKLOG DE ÉPICOS
// ============================================================================

export function BacklogEpicos({
  projectName,
  epicos,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onApprove,
  onRefine,
  onExportExcel,
  isLoading = false,
  readOnly = false,
}: BacklogEpicosProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    if (expandedIds.size === epicos.length) {
      setExpandedIds(new Set())
    } else {
      setExpandedIds(new Set(epicos.map(e => e.id)))
    }
  }

  const allSelected = selectedIds.length === epicos.length && epicos.length > 0
  const someSelected = selectedIds.length > 0

  // Calcular estatísticas
  const totalSprints = epicos.reduce((acc, e) => {
    const num = parseInt(e.estimativa_semanas || '') || e.estimativa_sprints || 2
    return acc + num
  }, 0)

  const criticosCount = epicos.filter(e => 
    (e.prioridade_estrategica || e.prioridade || '').toLowerCase().includes('crític') ||
    (e.prioridade_estrategica || e.prioridade || '').toLowerCase().includes('critica')
  ).length

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Layers className="w-6 h-6" style={{ color: BRAND.info }} />
            <h2 className="text-xl font-bold text-gray-900">{projectName}</h2>
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
            BACKLOG DE ÉPICOS
          </p>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-3">
          {onExportExcel && (
            <Button variant="outline" onClick={onExportExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{epicos.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Épicos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-red-600">{criticosCount}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Críticos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-orange-600">{totalSprints}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Sprints Totais</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{selectedIds.length}</p>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Selecionados</p>
        </div>
      </div>

      {/* Toolbar - só mostra se não for readOnly */}
      {!readOnly && (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                checked={allSelected} 
                onCheckedChange={onSelectAll}
                className="w-5 h-5"
              />
              <span className="text-sm text-gray-600">
                {allSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              </span>
            </div>
            
            <div className="h-4 w-px bg-gray-300" />
            
            <button 
              onClick={expandAll}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {expandedIds.size === epicos.length ? 'Recolher todos' : 'Expandir todos'}
            </button>
          </div>

          <div className="text-sm text-gray-500">
            {selectedIds.length} de {epicos.length} selecionados
          </div>
        </div>
      )}

      {/* Botão expandir/recolher quando readOnly */}
      {readOnly && (
        <div className="flex items-center justify-end mb-4">
          <button 
            onClick={expandAll}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {expandedIds.size === epicos.length ? '▼ Recolher todos' : '▶ Expandir todos'}
          </button>
        </div>
      )}

      {/* Lista de Épicos */}
      <div className="space-y-0">
        {epicos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum épico encontrado</p>
          </div>
        ) : (
          epicos.map(epico => (
            <EpicoCard
              key={epico.id}
              epico={epico}
              isSelected={selectedIds.includes(epico.id)}
              isExpanded={expandedIds.has(epico.id)}
              onToggle={() => onToggleSelection(epico.id)}
              onExpand={() => toggleExpand(epico.id)}
            />
          ))
        )}
      </div>

      {/* Footer Actions - só mostra se não for readOnly */}
      {!readOnly && (
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={onRefine}
            disabled={isLoading}
            className="gap-2 px-6"
          >
            <Edit className="w-4 h-4" />
            Refinamento
          </Button>
          
          <Button 
            onClick={onApprove}
            disabled={selectedIds.length === 0 || isLoading}
            className="gap-2 px-8 text-white"
            style={{ background: someSelected ? BRAND.success : undefined }}
          >
            <ThumbsUp className="w-4 h-4" />
            Aprovar ({selectedIds.length})
          </Button>
        </div>
      )}
    </div>
  )
}

export default BacklogEpicos
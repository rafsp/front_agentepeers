// src/components/report/AdvancedFilters.tsx
// Componente de Filtros Avançados para Relatórios - PEERS CodeAI
// Integrado com API real e seguindo o brandbook PEERS 2025
'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  SlidersHorizontal,
  RotateCcw,
  Download,
  Layers,
  AlertTriangle,
  Target,
  Clock,
  CheckCircle,
  Tag,
  Hash,
  ArrowUpDown,
} from 'lucide-react'

// ============================================================================
// BRAND COLORS - PEERS Brandbook 2025
// ============================================================================
const BRAND = {
  primary: '#011334',      // PEERS Neue Blue
  secondary: '#E1FF00',    // PEERS Neue Lime
  accent: '#D8E8EE',       // Serene Blue
  white: '#FFFFFF',
  
  // Variações secundárias
  primaryLight: '#677185',
  primaryMid: '#99A1AE',
  limeLight: '#F3FF99',
  limeLighter: '#F9FFCC',
  sereneLight: '#E8F1F5',
  sereneLighter: '#EFF6F8',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#6366f1',
} as const

// ============================================================================
// TIPOS
// ============================================================================

export type FilterType = 
  | 'text'
  | 'select'
  | 'multiselect'
  | 'date-range'
  | 'number-range'
  | 'priority'
  | 'status'
  | 'complexity'
  | 'discipline'
  | 'probability'
  | 'impact'

export interface FilterOption {
  value: string
  label: string
  count?: number
  color?: string
  icon?: React.ElementType
}

export interface FilterConfig {
  id: string
  label: string
  type: FilterType
  placeholder?: string
  options?: FilterOption[]
  defaultValue?: string | string[]
  icon?: React.ElementType
  description?: string
}

export interface FilterValue {
  [key: string]: string | string[] | null
}

export interface AdvancedFiltersProps {
  filters: FilterConfig[]
  values: FilterValue
  onChange: (values: FilterValue) => void
  onReset: () => void
  onExport?: () => void
  totalItems?: number
  filteredItems?: number
  className?: string
  variant?: 'default' | 'compact' | 'expanded'
  showQuickFilters?: boolean
  showSortOptions?: boolean
  sortOptions?: FilterOption[]
  currentSort?: string
  onSortChange?: (sort: string) => void
}

// ============================================================================
// CONFIGURAÇÕES PRÉ-DEFINIDAS DE FILTROS
// ============================================================================

export const PRIORITY_OPTIONS: FilterOption[] = [
  { value: 'Critica', label: 'Crítica', color: '#ef4444', icon: AlertTriangle },
  { value: 'Alta', label: 'Alta', color: '#f97316', icon: ArrowUpDown },
  { value: 'Media', label: 'Média', color: '#eab308', icon: Target },
  { value: 'Baixa', label: 'Baixa', color: '#22c55e', icon: CheckCircle },
]

export const COMPLEXITY_OPTIONS: FilterOption[] = [
  { value: 'Alta', label: 'Alta', color: '#ef4444' },
  { value: 'Media', label: 'Média', color: '#f59e0b' },
  { value: 'Baixa', label: 'Baixa', color: '#10b981' },
]

export const DISCIPLINE_OPTIONS: FilterOption[] = [
  { value: 'Backend', label: 'Backend', color: '#6366f1' },
  { value: 'Frontend', label: 'Frontend', color: '#8b5cf6' },
  { value: 'Infra', label: 'Infra', color: '#f97316' },
  { value: 'Dados', label: 'Dados', color: '#06b6d4' },
  { value: 'Design', label: 'Design', color: '#ec4899' },
  { value: 'QA', label: 'QA', color: '#14b8a6' },
]

export const PROBABILITY_OPTIONS: FilterOption[] = [
  { value: 'Alta', label: 'Alta', color: '#ef4444' },
  { value: 'Media', label: 'Média', color: '#f59e0b' },
  { value: 'Baixa', label: 'Baixa', color: '#10b981' },
]

export const IMPACT_OPTIONS: FilterOption[] = [
  { value: 'Critico', label: 'Crítico', color: '#ef4444' },
  { value: 'Alto', label: 'Alto', color: '#f97316' },
  { value: 'Medio', label: 'Médio', color: '#eab308' },
  { value: 'Baixo', label: 'Baixo', color: '#22c55e' },
]

export const STATUS_OPTIONS: FilterOption[] = [
  { value: 'pendente', label: 'Pendente', color: '#f59e0b', icon: Clock },
  { value: 'em_andamento', label: 'Em Andamento', color: '#3b82f6', icon: Layers },
  { value: 'concluido', label: 'Concluído', color: '#10b981', icon: CheckCircle },
]

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AdvancedFilters({
  filters,
  values,
  onChange,
  onReset,
  onExport,
  totalItems = 0,
  filteredItems = 0,
  className = '',
  variant = 'default',
  showQuickFilters = true,
  showSortOptions = false,
  sortOptions = [],
  currentSort,
  onSortChange,
}: AdvancedFiltersProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(variant === 'expanded')
  const [searchValue, setSearchValue] = useState('')

  // Contar filtros ativos
  const activeFiltersCount = useMemo(() => {
    return Object.entries(values).filter(([, v]) => {
      if (v === null || v === undefined) return false
      if (typeof v === 'string') return v.length > 0
      if (Array.isArray(v)) return v.length > 0
      return true
    }).length
  }, [values])

  // Handler para mudança de valor
  const handleValueChange = useCallback((filterId: string, newValue: string | string[] | null) => {
    onChange({ ...values, [filterId]: newValue })
  }, [values, onChange])

  // Handler para limpar um filtro específico
  const handleClearFilter = useCallback((filterId: string) => {
    const newValues = { ...values }
    delete newValues[filterId]
    onChange(newValues)
  }, [values, onChange])

  // Handler para busca textual global
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    handleValueChange('_search', e.target.value)
  }, [handleValueChange])

  // Separar filtros por tipo para quick filters
  const { quickFilters, advancedFilters } = useMemo(() => {
    const quick: FilterConfig[] = []
    const advanced: FilterConfig[] = []
    
    filters.forEach(filter => {
      if (['priority', 'status', 'complexity', 'discipline'].includes(filter.type)) {
        quick.push(filter)
      } else {
        advanced.push(filter)
      }
    })
    
    return { quickFilters: quick, advancedFilters: advanced }
  }, [filters])

  return (
    <Card className={`bg-white border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header com gradiente PEERS */}
      <div 
        className="h-1"
        style={{ 
          background: `linear-gradient(90deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%)` 
        }}
      />
      
      <div className="p-4">
        {/* Barra principal de filtros */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Busca e Filtros Quick */}
          <div className="flex flex-1 flex-wrap gap-3 items-center">
            {/* Campo de busca */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search 
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                style={{ color: BRAND.primaryLight }}
              />
              <Input
                placeholder="Buscar por título, ID ou descrição..."
                value={searchValue}
                onChange={handleSearchChange}
                className="pl-10 pr-4 h-10 border-slate-200 focus:border-[#011334] focus:ring-[#011334]/20 transition-all"
              />
              {searchValue && (
                <button
                  onClick={() => {
                    setSearchValue('')
                    handleClearFilter('_search')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            {/* Quick Filters - Select dropdowns */}
            {showQuickFilters && quickFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickFilters.map(filter => (
                  <QuickFilterSelect
                    key={filter.id}
                    filter={filter}
                    value={values[filter.id] as string | null}
                    onChange={(val) => handleValueChange(filter.id, val)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Ações e Contadores */}
          <div className="flex items-center gap-3">
            {/* Contador de resultados */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">
                {filteredItems !== totalItems ? (
                  <>
                    <span 
                      className="font-semibold"
                      style={{ color: BRAND.primary }}
                    >
                      {filteredItems}
                    </span>
                    <span className="text-slate-400"> de </span>
                    <span>{totalItems}</span>
                  </>
                ) : (
                  <span>{totalItems} itens</span>
                )}
              </span>
              {activeFiltersCount > 0 && (
                <Badge 
                  className="text-xs font-bold"
                  style={{ 
                    backgroundColor: BRAND.secondary,
                    color: BRAND.primary 
                  }}
                >
                  {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            {/* Ordenação */}
            {showSortOptions && sortOptions.length > 0 && onSortChange && (
              <Select value={currentSort} onValueChange={onSortChange}>
                <SelectTrigger className="w-[160px] h-9 text-sm border-slate-200">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-2 text-slate-400" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Botão Expandir/Recolher */}
            {advancedFilters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="border-slate-200 hover:bg-slate-50"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtros
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 ml-2" />
                )}
              </Button>
            )}

            {/* Limpar filtros */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}

            {/* Exportar */}
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="border-slate-200"
                style={{ 
                  color: BRAND.primary,
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        {/* Painel expandido de filtros avançados */}
        {isExpanded && advancedFilters.length > 0 && (
          <div 
            className="mt-4 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {advancedFilters.map(filter => (
                <FilterField
                  key={filter.id}
                  filter={filter}
                  value={values[filter.id]}
                  onChange={(val) => handleValueChange(filter.id, val)}
                  onClear={() => handleClearFilter(filter.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Badges de filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Filtros ativos:
              </span>
              {Object.entries(values).map(([key, value]) => {
                if (!value || (Array.isArray(value) && value.length === 0)) return null
                if (key === '_search') return null
                
                const filter = filters.find(f => f.id === key)
                if (!filter) return null

                return (
                  <ActiveFilterBadge
                    key={key}
                    filter={filter}
                    value={value}
                    onRemove={() => handleClearFilter(key)}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

// Quick Filter Select - Dropdown de filtro rápido
interface QuickFilterSelectProps {
  filter: FilterConfig
  value: string | null
  onChange: (value: string | null) => void
}

function QuickFilterSelect({ filter, value, onChange }: QuickFilterSelectProps): React.ReactElement {
  const options = filter.options || getDefaultOptions(filter.type)
  const hasValue = value !== null && value !== undefined && value.length > 0

  return (
    <Select 
      value={value || ''} 
      onValueChange={(v) => onChange(v || null)}
    >
      <SelectTrigger 
        className={`
          w-[140px] h-9 text-sm border transition-all
          ${hasValue 
            ? 'border-[#011334] bg-[#011334]/5' 
            : 'border-slate-200 hover:bg-slate-50'
          }
        `}
      >
        {filter.icon && <filter.icon className="w-3.5 h-3.5 mr-2 text-slate-400" />}
        <SelectValue placeholder={filter.label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">
          <span className="text-slate-400">Todos</span>
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div className="flex items-center gap-2">
              {opt.color && (
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: opt.color }}
                />
              )}
              <span>{opt.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Filter Field - Campo de filtro individual
interface FilterFieldProps {
  filter: FilterConfig
  value: string | string[] | null
  onChange: (value: string | string[] | null) => void
  onClear: () => void
}

function FilterField({ filter, value, onChange, onClear }: FilterFieldProps): React.ReactElement {
  const options = filter.options || getDefaultOptions(filter.type)
  const Icon = filter.icon || getDefaultIcon(filter.type)

  // Renderizar baseado no tipo
  switch (filter.type) {
    case 'text':
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />}
            {filter.label}
          </label>
          <div className="relative">
            <Input
              placeholder={filter.placeholder || `Filtrar por ${filter.label.toLowerCase()}...`}
              value={(value as string) || ''}
              onChange={(e) => onChange(e.target.value || null)}
              className="h-9 text-sm border-slate-200 focus:border-[#011334] focus:ring-[#011334]/20"
            />
            {value && (
              <button
                onClick={onClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )

    case 'select':
    case 'priority':
    case 'status':
    case 'complexity':
    case 'discipline':
    case 'probability':
    case 'impact':
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />}
            {filter.label}
          </label>
          <Select 
            value={(value as string) || ''} 
            onValueChange={(v) => onChange(v || null)}
          >
            <SelectTrigger className="h-9 text-sm border-slate-200 focus:border-[#011334] focus:ring-[#011334]/20">
              <SelectValue placeholder={filter.placeholder || 'Selecione...'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                <span className="text-slate-400">Todos</span>
              </SelectItem>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <div className="flex items-center gap-2">
                    {opt.color && (
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    <span>{opt.label}</span>
                    {opt.count !== undefined && (
                      <span className="text-xs text-slate-400 ml-auto">({opt.count})</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : []
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />}
            {filter.label}
          </label>
          <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 rounded-md min-h-[36px]">
            {options.map((opt) => {
              const isSelected = selectedValues.includes(opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedValues.filter(v => v !== opt.value))
                    } else {
                      onChange([...selectedValues, opt.value])
                    }
                  }}
                  className={`
                    px-2 py-0.5 text-xs rounded-full transition-all
                    ${isSelected 
                      ? 'bg-[#011334] text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }
                  `}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )

    case 'number-range':
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3" />}
            {filter.label}
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              className="h-9 text-sm border-slate-200 focus:border-[#011334]"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              className="h-9 text-sm border-slate-200 focus:border-[#011334]"
            />
          </div>
        </div>
      )

    case 'date-range':
      return (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {filter.label}
          </label>
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              className="h-9 text-sm border-slate-200 focus:border-[#011334]"
            />
            <span className="text-slate-400">-</span>
            <Input
              type="date"
              className="h-9 text-sm border-slate-200 focus:border-[#011334]"
            />
          </div>
        </div>
      )

    default:
      return <div />
  }
}

// Active Filter Badge - Badge de filtro ativo
interface ActiveFilterBadgeProps {
  filter: FilterConfig
  value: string | string[] | null
  onRemove: () => void
}

function ActiveFilterBadge({ filter, value, onRemove }: ActiveFilterBadgeProps): React.ReactElement {
  const getDisplayValue = (): string => {
    if (typeof value === 'string') {
      const option = filter.options?.find(o => o.value === value)
      return option?.label || value
    }
    if (Array.isArray(value)) {
      if (value.length <= 2) {
        return value.map(v => {
          const option = filter.options?.find(o => o.value === v)
          return option?.label || v
        }).join(', ')
      }
      return `${value.length} selecionados`
    }
    return String(value)
  }

  return (
    <Badge
      variant="secondary"
      className="pl-2 pr-1 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
    >
      <span className="font-medium text-slate-500 mr-1">{filter.label}:</span>
      <span>{getDisplayValue()}</span>
      <button
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-slate-300 rounded transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </Badge>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

function getDefaultOptions(type: FilterType): FilterOption[] {
  switch (type) {
    case 'priority':
      return PRIORITY_OPTIONS
    case 'complexity':
      return COMPLEXITY_OPTIONS
    case 'discipline':
      return DISCIPLINE_OPTIONS
    case 'probability':
      return PROBABILITY_OPTIONS
    case 'impact':
      return IMPACT_OPTIONS
    case 'status':
      return STATUS_OPTIONS
    default:
      return []
  }
}

function getDefaultIcon(type: FilterType): React.ElementType {
  switch (type) {
    case 'text':
      return Search
    case 'priority':
      return Target
    case 'complexity':
      return Layers
    case 'discipline':
      return Tag
    case 'probability':
    case 'impact':
      return AlertTriangle
    case 'status':
      return Clock
    case 'date-range':
      return Calendar
    case 'number-range':
      return Hash
    default:
      return Filter
  }
}

// ============================================================================
// EXPORTS ADICIONAIS
// ============================================================================

export default AdvancedFilters

// Hook para gerenciar estado dos filtros
export function useAdvancedFilters(initialFilters: FilterValue = {}) {
  const [filters, setFilters] = React.useState<FilterValue>(initialFilters)
  
  const updateFilter = useCallback((key: string, value: string | string[] | null) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])
  
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])
  
  const applyFilters = useCallback(<T,>(items: T[], filterFn: (item: T, filters: FilterValue) => boolean): T[] => {
    return items.filter(item => filterFn(item, filters))
  }, [filters])
  
  return {
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
  }
}

// Configurações pré-prontas para diferentes relatórios
export const EPICOS_FILTERS: FilterConfig[] = [
  { id: 'prioridade', label: 'Prioridade', type: 'priority', icon: Target },
  { id: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar épico...' },
]

export const FEATURES_FILTERS: FilterConfig[] = [
  { id: 'disciplina', label: 'Disciplina', type: 'discipline', icon: Tag },
  { id: 'complexidade', label: 'Complexidade', type: 'complexity', icon: Layers },
  { id: 'epic_id', label: 'Épico', type: 'select', icon: Hash },
  { id: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar feature...' },
]

export const RISCOS_FILTERS: FilterConfig[] = [
  { id: 'probabilidade', label: 'Probabilidade', type: 'probability', icon: AlertTriangle },
  { id: 'impacto', label: 'Impacto', type: 'impact', icon: Target },
  { id: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar risco...' },
]

export const CRONOGRAMA_FILTERS: FilterConfig[] = [
  { id: 'epic_id', label: 'Épico', type: 'select', icon: Hash },
  { id: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar...' },
]
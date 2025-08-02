// src/lib/utils/date-utils.ts - UTILITÁRIO PARA DATAS

import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata uma data de forma segura para exibição relativa
 */
export function formatJobDate(date: Date | string | undefined | null): string {
  if (!date) {
    return 'Data não disponível'
  }
  
  try {
    let dateObj: Date
    
    if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return 'Data não disponível'
    }
    
    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    
    return formatDistanceToNow(dateObj, { 
      locale: ptBR, 
      addSuffix: true 
    })
  } catch (error) {
    console.warn('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

/**
 * Formata data de forma absoluta
 */
export function formatAbsoluteDate(date: Date | string | undefined | null): string {
  if (!date) {
    return 'Data não disponível'
  }
  
  try {
    let dateObj: Date
    
    if (typeof date === 'string') {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return 'Data não disponível'
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.warn('Erro ao formatar data absoluta:', error)
    return 'Data inválida'
  }
}

/**
 * Converte string ou Date para Date object de forma segura
 */
export function safeParseDate(date: Date | string | undefined | null): Date | null {
  if (!date) return null
  
  try {
    if (date instanceof Date) {
      return isNaN(date.getTime()) ? null : date
    }
    
    if (typeof date === 'string') {
      const parsed = new Date(date)
      return isNaN(parsed.getTime()) ? null : parsed
    }
    
    return null
  } catch {
    return null
  }
}
// src/lib/utils/date-utils.ts - Utilitários seguros para datas

import { formatDistanceToNow as fnsFormatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Converte qualquer valor para Date de forma segura
 */
export function toSafeDate(value: any): Date {
  if (value instanceof Date) {
    return value
  }
  
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? new Date() : date
  }
  
  return new Date()
}

/**
 * Formata distância de tempo de forma segura
 */
export function safeFormatDistanceToNow(
  date: Date | string | number,
  options?: { addSuffix?: boolean }
): string {
  try {
    const safeDate = toSafeDate(date)
    return fnsFormatDistanceToNow(safeDate, { 
      addSuffix: true, 
      locale: ptBR,
      ...options 
    })
  } catch (error) {
    console.warn('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

/**
 * Formata data em formato brasileiro
 */
export function formatBrazilianDate(date: Date | string | number): string {
  try {
    const safeDate = toSafeDate(date)
    return safeDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  } catch (error) {
    console.warn('Erro ao formatar data brasileira:', error)
    return 'Data inválida'
  }
}

/**
 * Formata data e hora em formato brasileiro
 */
export function formatBrazilianDateTime(date: Date | string | number): string {
  try {
    const safeDate = toSafeDate(date)
    return safeDate.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    console.warn('Erro ao formatar data/hora brasileira:', error)
    return 'Data inválida'
  }
}

/**
 * Verifica se uma data é válida
 */
export function isValidDate(date: any): boolean {
  const d = toSafeDate(date)
  return !isNaN(d.getTime())
}

/**
 * Calcula diferença em minutos entre duas datas
 */
export function getMinutesDifference(start: Date | string | number, end: Date | string | number = new Date()): number {
  try {
    const startDate = toSafeDate(start)
    const endDate = toSafeDate(end)
    return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60))
  } catch (error) {
    console.warn('Erro ao calcular diferença de minutos:', error)
    return 0
  }
}

/**
 * Formata duração em formato legível
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return 'menos de 1 minuto'
  if (minutes < 60) return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours < 24) {
    const hourText = `${hours} hora${hours !== 1 ? 's' : ''}`
    const minuteText = remainingMinutes > 0 ? ` e ${remainingMinutes} minuto${remainingMinutes !== 1 ? 's' : ''}` : ''
    return hourText + minuteText
  }
  
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  
  const dayText = `${days} dia${days !== 1 ? 's' : ''}`
  const hourText = remainingHours > 0 ? ` e ${remainingHours} hora${remainingHours !== 1 ? 's' : ''}` : ''
  return dayText + hourText
}
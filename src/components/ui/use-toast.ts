"use client"

export function useToast() {
  const toast = (props: {
    title?: string
    description?: string
    variant?: "default" | "destructive"
  }) => {
    // Versão simplificada - apenas console.log
    const message = `${props.title || ''}: ${props.description || ''}`
    
    if (props.variant === 'destructive') {
      console.error('❌', message)
    } else {
      console.log('✅', message)
    }
  }

  return { toast }
}
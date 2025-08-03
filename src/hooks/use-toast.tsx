'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({
    title,
    description,
    variant = 'default',
    duration = 5000
  }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    
    const newToast: Toast = {
      id,
      title,
      description,
      variant,
      duration
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove após duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return {
    toast,
    toasts,
    dismissToast,
    dismissAll
  }
}

// Componente simples de Toast para display
export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm border ${
            toast.variant === 'destructive' 
              ? 'bg-red-50 border-red-200 text-red-800'
              : toast.variant === 'success'
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium">{toast.title}</h4>
              {toast.description && (
                <p className="text-sm mt-1 opacity-80">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
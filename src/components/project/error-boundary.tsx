// src/components/project/error-boundary.tsx
// FEATURE 11: Error boundary visual com try/catch no render
// USO: Envolver o conteúdo principal com <ErrorBoundary>
'use client'

import React, { Component, type ReactNode } from 'react'
import { BRAND } from '@/components/layout/sidebar'

interface Props { children: ReactNode; fallbackUrl?: string }
interface State { hasError: boolean; error: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-8 max-w-lg w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: BRAND.primary }}>Erro na Interface</h2>
            <p className="text-xs text-gray-500 mb-4 font-mono bg-gray-50 p-3 rounded-lg text-left overflow-auto max-h-32 border border-gray-200">{this.state.error}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => this.setState({ hasError: false, error: '' })}
                className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200">
                Tentar Novamente
              </button>
              <button onClick={() => window.location.href = this.props.fallbackUrl || '/dashboard'}
                className="px-5 py-2.5 text-white rounded-xl text-sm font-bold" style={{ background: BRAND.primary }}>
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
// src/app/layout.tsx - VERSÃO CORRIGIDA

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConnectivityStatus } from '@/components/connectivity-status'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Peers - AI Code Analysis Platform',
  description: 'Plataforma inteligente para análise de código com IA multi-agentes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {/* Status de conectividade global */}
            <div className="relative">
              <div className="fixed top-0 left-0 right-0 z-50">
                <ConnectivityStatus className="rounded-none border-x-0 border-t-0" />
              </div>
              
              {/* Conteúdo principal */}
              <div className="min-h-screen">
                {children}
              </div>
            </div>
            
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
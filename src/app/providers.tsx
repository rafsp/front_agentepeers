'use client'

import React from 'react'
import { MsalAuthProvider } from '@/lib/auth/msal-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MsalAuthProvider>
      {children}
    </MsalAuthProvider>
  )
}
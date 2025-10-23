'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export function MicrosoftLoginButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = () => {
    setIsLoading(true)
    
    const clientId = '4dcad7f8-e4d5-44e1-8d1e-3c1ce8af602a'
    const tenantId = 'b9e68103-376a-402b-87f6-a3b10658e7c4'
    
    // Detectar ambiente automaticamente
    const getRedirectUri = () => {
      if (typeof window === 'undefined') return ''
      
      // Em produção, usa a URL do Azure Static Apps
      if (window.location.hostname !== 'localhost') {
        return 'https://red-rock-0e17e4a10.2.azurestaticapps.net/api/auth/callback/azure-ad'
      }
      
      // Em desenvolvimento local, usa a origem atual
      return `${window.location.origin}/api/auth/callback/azure-ad`
    }
    
    const redirectUri = encodeURIComponent(getRedirectUri())
    const scope = encodeURIComponent('openid profile email User.Read')
    
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
      `client_id=${clientId}` +
      `&response_type=code` +
      `&redirect_uri=${redirectUri}` +
      `&response_mode=query` +
      `&scope=${scope}` +
      `&state=${Math.random().toString(36).substring(7)}`
    
    console.log('🔐 Redirecionando para Microsoft:', redirectUri)
    
    // Redirecionar para Microsoft
    window.location.href = authUrl
  }

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full"
      variant="outline"
      type="button"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Redirecionando...
        </>
      ) : (
        <>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          Entrar com Microsoft
        </>
      )}
    </Button>
  )
}
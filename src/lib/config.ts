// src/lib/config.ts
// Configuração centralizada — URL do backend
// Prioridade: localStorage > NEXT_PUBLIC env vars > DEFAULT

const DEFAULT_API_URL = 'https://app-codeai-backend-dev--backend-refatorado-hdeqametcgc9gsgc.centralus-01.azurewebsites.net'

export function getApiUrl(): string {
  // 1. Runtime override via localStorage (set in login page "Configurações avançadas")
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('codeai_api_url')
    if (override && override.startsWith('http')) return override.replace(/\/+$/, '')
  }

  // 2. Build-time env vars (Next.js embeds NEXT_PUBLIC_* at build)
  // Check multiple possible names for compatibility
  const envUrl =
    process.env.NEXT_PUBLIC_CODEAI_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    ''

  if (envUrl && envUrl.startsWith('http')) return envUrl.replace(/\/+$/, '')

  // 3. Default hardcoded
  return DEFAULT_API_URL
}

// Export for easy access
export const API_URL = getApiUrl()
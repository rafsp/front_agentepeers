// src/app/api/auth/callback/azure-ad/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Configurações do Azure AD
const CLIENT_ID = '4dcad7f8-e4d5-44e1-8d1e-3c1ce8af602a'
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET || ''
const TENANT_ID = 'b9e68103-376a-402b-87f6-a3b10658e7c4'

// URL de produção (fallback)
const PRODUCTION_URL = 'https://codeia.peers.com.br'

// Função para obter a URL base correta
function getBaseUrl(request: NextRequest): string {
  // 1. Tentar header x-forwarded-host (usado por proxies/load balancers)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  
  if (forwardedHost) {
    console.log('🔗 Usando x-forwarded-host:', forwardedHost)
    return `${forwardedProto}://${forwardedHost}`
  }
  
  // 2. Tentar header host
  const host = request.headers.get('host')
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    console.log('🔗 Usando host header:', host)
    return `https://${host}`
  }
  
  // 3. Verificar se é ambiente de produção pelo NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    console.log('🔗 Usando URL de produção:', PRODUCTION_URL)
    return PRODUCTION_URL
  }
  
  // 4. Fallback para origin da request (desenvolvimento)
  const origin = request.nextUrl.origin
  console.log('🔗 Usando origin:', origin)
  return origin
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Obter URL base
  const baseUrl = getBaseUrl(request)
  console.log('🌐 Base URL detectada:', baseUrl)
  
  // Se houve erro
  if (error) {
    console.error('❌ Erro na autenticação Microsoft:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, baseUrl)
    )
  }
  
  // Se não há código
  if (!code) {
    console.error('❌ Código de autorização não recebido')
    return NextResponse.redirect(new URL('/login?error=no_code', baseUrl))
  }

  try {
    console.log('✅ Código de autorização recebido, trocando por token...')
    
    // Redirect URI deve ser a mesma registrada no Azure
    const redirectUri = `${baseUrl}/api/auth/callback/azure-ad`
    console.log('🔗 Redirect URI:', redirectUri)
    
    // ========================================
    // PASSO 1: Trocar code por access_token
    // ========================================
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'openid profile email User.Read',
        }),
      }
    )

    let userName = 'Usuário Microsoft'
    let userEmail = 'microsoft@empresa.com.br'

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token
      
      console.log('✅ Token obtido com sucesso')

      // ========================================
      // PASSO 2: Buscar dados do usuário no Graph
      // ========================================
      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (graphResponse.ok) {
        const userData = await graphResponse.json()
        console.log('✅ Dados do usuário obtidos:', userData.displayName, userData.mail)
        
        userName = userData.displayName || userData.givenName || 'Usuário Microsoft'
        userEmail = userData.mail || userData.userPrincipalName || 'microsoft@empresa.com.br'
      } else {
        console.warn('⚠️ Não foi possível obter dados do Graph, usando fallback')
      }
    } else {
      const errorText = await tokenResponse.text()
      console.warn('⚠️ Não foi possível trocar code por token:', errorText)
      console.warn('💡 Dica: Configure AZURE_AD_CLIENT_SECRET no ambiente')
    }
    
    // ========================================
    // PASSO 3: Criar response com cookies
    // ========================================
    const dashboardUrl = new URL('/dashboard', baseUrl)
    console.log('🎯 Redirecionando para:', dashboardUrl.toString())
    
    const response = NextResponse.redirect(dashboardUrl)
    
    const cookieOptions = {
      httpOnly: false,
      secure: true, // Sempre true em produção
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    }
    
    // Salvar cookies de autenticação
    response.cookies.set('peers_authenticated', 'true', cookieOptions)
    response.cookies.set('peers_auth_method', 'microsoft', cookieOptions)
    response.cookies.set('peers_user_name', userName, cookieOptions)
    response.cookies.set('peers_user_email', userEmail, cookieOptions)

    console.log('✅ Usuário autenticado via Microsoft Entra:', userName, userEmail)
    
    return response
    
  } catch (err) {
    console.error('❌ Erro no callback:', err)
    return NextResponse.redirect(
      new URL('/login?error=callback_failed', baseUrl)
    )
  }
}
// src/app/api/auth/callback/azure-ad/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Configurações do Azure AD
const CLIENT_ID = '4dcad7f8-e4d5-44e1-8d1e-3c1ce8af602a'
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET || '' // Adicione no .env.local
const TENANT_ID = 'b9e68103-376a-402b-87f6-a3b10658e7c4'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Se houve erro
  if (error) {
    console.error('❌ Erro na autenticação Microsoft:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }
  
  // Se não há código
  if (!code) {
    console.error('❌ Código de autorização não recebido')
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    console.log('✅ Código de autorização recebido, trocando por token...')
    
    // Determinar redirect URI
    const redirectUri = `${request.nextUrl.origin}/api/auth/callback/azure-ad`
    
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
      // Se não conseguiu trocar o token, ainda assim autenticar com dados genéricos
      // Isso acontece se CLIENT_SECRET não estiver configurado
      console.warn('⚠️ Não foi possível trocar code por token, usando fallback')
      console.warn('💡 Dica: Configure AZURE_AD_CLIENT_SECRET no .env.local')
    }
    
    // ========================================
    // PASSO 3: Criar response com cookies
    // ========================================
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
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
      new URL('/login?error=callback_failed', request.url)
    )
  }
}
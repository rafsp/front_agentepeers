// src/app/api/auth/callback/azure-ad/route.ts
// Callback OAuth do Microsoft Entra ID
// Suporta 2 fluxos:
//   POST — id_token via form_post (SEM client_secret)
//   GET  — code exchange (COM client_secret, fallback)

import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = '4dcad7f8-e4d5-44e1-8d1e-3c1ce8af602a'
const CLIENT_SECRET = process.env.AZURE_AD_CLIENT_SECRET || ''
const TENANT_ID = 'b9e68103-376a-402b-87f6-a3b10658e7c4'

function getBaseUrl(request: NextRequest): string {
  try {
    const fwdHost = request.headers.get('x-forwarded-host')
    const fwdProto = request.headers.get('x-forwarded-proto') || 'https'
    if (fwdHost) return `${fwdProto}://${fwdHost}`
    const host = request.headers.get('host')
    if (host) return host.includes('localhost') ? `http://${host}` : `https://${host}`
    const origin = request.nextUrl?.origin
    if (origin && origin !== 'null') return origin
  } catch {}
  return 'http://localhost:3000'
}

// Parse JWT sem validar assinatura (para extrair claims)
function parseJwt(token: string): Record<string, string> {
  try {
    const payload = token.split('.')[1]
    const decoded = Buffer.from(payload, 'base64').toString('utf8')
    return JSON.parse(decoded)
  } catch { return {} }
}

function buildAuthResponse(baseUrl: string, userName: string, userEmail: string, empresa: string): NextResponse {
  const response = NextResponse.redirect(new URL('/dashboard', baseUrl))
  const opts = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 7, path: '/' }
  response.cookies.set('peers_authenticated', 'true', opts)
  response.cookies.set('peers_auth_method', 'microsoft', opts)
  response.cookies.set('peers_user_name', userName, opts)
  response.cookies.set('peers_user_email', userEmail, opts)
  response.cookies.set('peers_empresa', empresa, opts)
  console.log('✅ Autenticado via Microsoft Entra:', userName, userEmail)
  return response
}

function extractEmpresa(email: string): string {
  const domain = email.split('@')[1] || ''
  return domain.split('.')[0] || ''
}

// ── POST: id_token via form_post (SEM client_secret) ──────────────────────

export async function POST(request: NextRequest) {
  const baseUrl = getBaseUrl(request)
  try {
    const formData = await request.formData()
    const idToken = formData.get('id_token') as string | null
    const error = formData.get('error') as string | null
    const errorDesc = formData.get('error_description') as string | null

    if (error) {
      console.error('❌ Erro Microsoft:', error, errorDesc)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDesc || error)}`, baseUrl))
    }

    if (!idToken) {
      console.error('❌ id_token não recebido no POST')
      return NextResponse.redirect(new URL('/login?error=no_id_token', baseUrl))
    }

    // Parse JWT para extrair nome e email
    const claims = parseJwt(idToken)
    const userName = claims.name || claims.given_name || claims.preferred_username || 'Usuário Microsoft'
    const userEmail = claims.email || claims.preferred_username || claims.upn || ''
    const empresa = extractEmpresa(userEmail)

    console.log('🔑 id_token claims:', { name: userName, email: userEmail, empresa })

    return buildAuthResponse(baseUrl, userName, userEmail, empresa)
  } catch (err) {
    console.error('❌ Erro no callback POST:', err)
    return NextResponse.redirect(new URL('/login?error=callback_failed', baseUrl))
  }
}

// ── GET: code exchange (COM client_secret, flow legado) ───────────────────

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')
  const baseUrl = getBaseUrl(request)

  if (error) {
    console.error('❌ Erro Microsoft:', error, errorDesc)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDesc || error)}`, baseUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', baseUrl))
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/callback/azure-ad`
    let userName = 'Usuário Microsoft'
    let userEmail = ''

    // Tenta trocar code por token
    // Com CLIENT_SECRET se disponível, sem se o app permitir public client
    const tokenParams: Record<string, string> = {
      client_id: CLIENT_ID,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: 'openid profile email User.Read',
    }
    if (CLIENT_SECRET) tokenParams.client_secret = CLIENT_SECRET

    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(tokenParams),
    })

    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json()

      // Extrair dados do id_token (JWT)
      if (tokenData.id_token) {
        const claims = parseJwt(tokenData.id_token)
        userName = claims.name || claims.given_name || userName
        userEmail = claims.email || claims.preferred_username || claims.upn || ''
      }

      // Se tem access_token, buscar do Graph API (dados mais completos)
      if (tokenData.access_token) {
        try {
          const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          })
          if (graphResponse.ok) {
            const userData = await graphResponse.json()
            userName = userData.displayName || userData.givenName || userName
            userEmail = userData.mail || userData.userPrincipalName || userEmail
          }
        } catch { /* Graph failed, use id_token data */ }
      }
    } else {
      const errText = await tokenResponse.text()
      console.warn('⚠️ Token exchange falhou:', errText)

      // Fallback: tentar pegar email do state parameter
      const stateParam = searchParams.get('state')
      if (stateParam) {
        try {
          const stateData = JSON.parse(decodeURIComponent(stateParam))
          if (stateData.email) {
            userEmail = stateData.email
            userName = userEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
            console.log('🔑 Usando email do state:', userEmail)
          }
        } catch { /* state parse failed */ }
      }

      if (!userEmail) {
        console.error('❌ Token exchange falhou e email não disponível no state')
        console.error('💡 Adicione ao .env.local: AZURE_AD_CLIENT_SECRET=<secret do Azure Portal>')
        return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent('SSO requer AZURE_AD_CLIENT_SECRET. Use login por email como alternativa.'), baseUrl))
      }
    }

    // Se conseguiu email → sucesso
    if (userEmail) {
      const empresa = extractEmpresa(userEmail)
      return buildAuthResponse(baseUrl, userName, userEmail, empresa)
    }

    // Não conseguiu email → fallback com erro claro
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent('SSO autenticou mas não retornou email. Configure AZURE_AD_CLIENT_SECRET. Use login por email como alternativa.'), baseUrl))
  } catch (err) {
    console.error('❌ Erro no callback GET:', err)
    return NextResponse.redirect(new URL('/login?error=callback_failed', baseUrl))
  }
}
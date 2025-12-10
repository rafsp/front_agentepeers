// src/middleware.ts
// IMPORTANTE: Este arquivo DEVE estar em src/middleware.ts (raiz do src)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/novo-pipeline',
  '/projeto',
  '/repositorios',
  '/relatorios',
  '/squads',
  '/integracoes',
  '/code-analysis',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('🔒 Middleware executando para:', pathname)
  
  // Verificar se é uma rota protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // Verificar autenticação via cookie
  const authCookie = request.cookies.get('peers_authenticated')
  const isAuthenticated = authCookie?.value === 'true'
  
  console.log('🔑 Cookie peers_authenticated:', authCookie?.value)
  console.log('🔐 Está autenticado:', isAuthenticated)
  
  if (!isAuthenticated) {
    console.log('❌ Não autenticado, redirecionando para /login')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  console.log('✅ Autenticado, permitindo acesso')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/novo-pipeline/:path*',
    '/projeto/:path*',
    '/repositorios/:path*',
    '/relatorios/:path*',
    '/squads/:path*',
    '/integracoes/:path*',
    '/code-analysis/:path*',
  ],
}